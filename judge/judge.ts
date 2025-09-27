import { spawn } from 'child_process';
import { DockerExecutionResult, JudgeRequest, JudgeResponse, TestCase, ExecutionResult, RunnerConfig } from '../types/index.js';

export class DockerJudge {
  private configs: Map<string, RunnerConfig> = new Map();

  constructor() {
    // Initialize language configurations
    this.configs.set('python', {
      language: 'python',
      image: 'algopractice-python-runner',
      command: ['python', '/app/runner.py'],
      timeLimitMs: 5000,
      memoryLimitMB: 128,
      maxOutputSizeKB: 64
    });

    this.configs.set('javascript', {
      language: 'javascript',
      image: 'algopractice-javascript-runner',
      command: ['node', '/app/runner.js'],
      timeLimitMs: 5000,
      memoryLimitMB: 128,
      maxOutputSizeKB: 64
    });

    this.configs.set('java', {
      language: 'java',
      image: 'algopractice-java-runner',
      command: ['java', '-cp', '/app', 'runner'],
      timeLimitMs: 10000, // Java needs more time for compilation
      memoryLimitMB: 256,
      maxOutputSizeKB: 64
    });
  }

  async executeCode(request: JudgeRequest): Promise<JudgeResponse> {
    const config = this.configs.get(request.language);
    if (!config) {
      throw new Error(`Unsupported language: ${request.language}`);
    }

    const results: ExecutionResult[] = [];
    let totalRuntimeMs = 0;
    let totalScore = 0;
    let maxScore = 0;

    // Execute each test case
    for (const testCase of request.testCases) {
      const executionResult = await this.executeTestCase(
        request.sourceCode,
        testCase,
        config,
        request.timeLimitMs || config.timeLimitMs,
        request.memoryLimitMB || config.memoryLimitMB
      );

      const passed = this.compareOutputs(executionResult.stdout, testCase.expectedOutput);
      
      results.push({
        testCaseId: testCase.id,
        passed,
        actualOutput: executionResult.stdout,
        expectedOutput: testCase.expectedOutput,
        runtimeMs: executionResult.runtimeMs,
        memoryUsageKB: executionResult.memoryUsageKB,
        error: executionResult.stderr || undefined,
        weight: testCase.weight
      });

      totalRuntimeMs += executionResult.runtimeMs;
      maxScore += testCase.weight;
      if (passed) {
        totalScore += testCase.weight;
      }
    }

    // Determine overall result
    let passed: 'all' | 'partial' | 'none' = 'none';
    if (totalScore === maxScore) {
      passed = 'all';
    } else if (totalScore > 0) {
      passed = 'partial';
    }

    return {
      problemId: request.problemId,
      language: request.language,
      results,
      totalRuntimeMs,
      passed,
      totalScore,
      maxScore
    };
  }

  private async executeTestCase(
    sourceCode: string,
    testCase: TestCase,
    config: RunnerConfig,
    timeLimitMs: number,
    memoryLimitMB: number
  ): Promise<DockerExecutionResult> {
    return new Promise((resolve, reject) => {
      const inputData = JSON.stringify({
        sourceCode,
        testInput: testCase.input,
        timeLimitMs
      });

      // Docker run command with resource limits
      const dockerArgs = [
        'run',
        '--rm',
        '--memory', `${memoryLimitMB}m`,
        '--cpus', '1.0',
        '--network', 'none',
        '--read-only',
        '--tmpfs', '/tmp:rw,size=100m',
        '--user', '1000:1000',
        config.image
      ];

      const dockerProcess = spawn('docker', dockerArgs, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let killed = false;

      // Set up timeout
      const timeout = setTimeout(() => {
        killed = true;
        dockerProcess.kill('SIGKILL');
      }, timeLimitMs + 1000); // Add 1 second buffer

      // Handle process output
      dockerProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      dockerProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      dockerProcess.on('close', (code) => {
        clearTimeout(timeout);
        
        try {
          // Try to parse JSON output from the runner
          const result = JSON.parse(stdout);
          resolve({
            exitCode: code || 0,
            stdout: result.stdout || '',
            stderr: result.stderr || stderr,
            runtimeMs: result.runtimeMs || 0,
            memoryUsageKB: result.memoryUsageKB,
            killed: killed || result.killed
          });
        } catch (error) {
          // If JSON parsing fails, return raw output
          resolve({
            exitCode: code || 1,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            runtimeMs: 0,
            killed: killed
          });
        }
      });

      dockerProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Docker execution failed: ${error.message}`));
      });

      // Send input to the process
      dockerProcess.stdin.write(inputData);
      dockerProcess.stdin.end();
    });
  }

  private compareOutputs(actual: string, expected: string): boolean {
    // Normalize outputs for comparison
    const normalize = (str: string) => str.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    const normalizedActual = normalize(actual);
    const normalizedExpected = normalize(expected);
    
    return normalizedActual === normalizedExpected;
  }

  async buildImages(): Promise<void> {
    const languages = ['python', 'javascript', 'java'];
    
    for (const lang of languages) {
      console.log(`Building Docker image for ${lang}...`);
      
      const buildProcess = spawn('docker', [
        'build',
        '-f', `judge/docker/Dockerfile.${lang}`,
        '-t', `algopractice-${lang}-runner`,
        'judge/docker/'
      ]);

      await new Promise<void>((resolve, reject) => {
        buildProcess.on('close', (code) => {
          if (code === 0) {
            console.log(`✓ ${lang} image built successfully`);
            resolve();
          } else {
            reject(new Error(`Failed to build ${lang} image`));
          }
        });

        buildProcess.on('error', (error) => {
          reject(new Error(`Build error for ${lang}: ${error.message}`));
        });
      });
    }
  }

  async testRunner(language: string): Promise<boolean> {
    const config = this.configs.get(language);
    if (!config) return false;

    try {
      const testRequest: JudgeRequest = {
        language: language as any,
        sourceCode: this.getTestCode(language),
        problemId: 'test',
        testCases: [{
          id: 'test-1',
          input: '5\n1 2 3 4 5',
          expectedOutput: '15',
          weight: 1,
          isHidden: false
        }]
      };

      const result = await this.executeCode(testRequest);
      return result.passed === 'all';
    } catch (error) {
      console.error(`Test failed for ${language}:`, error);
      return false;
    }
  }

  private getTestCode(language: string): string {
    switch (language) {
      case 'python':
        return `n = int(input())
arr = list(map(int, input().split()))
print(sum(arr))`;
      
      case 'javascript':
        return `const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
  lines.push(line);
  if (lines.length === 2) {
    const n = parseInt(lines[0]);
    const arr = lines[1].split(' ').map(Number);
    console.log(arr.reduce((sum, val) => sum + val, 0));
    rl.close();
  }
});`;
      
      case 'java':
        return `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int sum = 0;
        for (int i = 0; i < n; i++) {
            sum += scanner.nextInt();
        }
        System.out.println(sum);
    }
}`;
      
      default:
        return '';
    }
  }
}
