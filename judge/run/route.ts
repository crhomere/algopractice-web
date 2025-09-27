import { spawn } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';

interface TestCase {
  id: string;
  input: string;
  expected: string;
  weight: number;
}

interface ExecutionResult {
  testCaseId: string;
  passed: boolean;
  actualOutput?: string;
  expectedOutput: string;
  runtimeMs: number;
  error?: string;
  weight: number;
}

class DockerJudge {
  private async executeWithDocker(
    language: string,
    sourceCode: string,
    testInput: string
  ): Promise<any> {
    const imageMap: { [key: string]: string } = {
      python: 'algopractice-python-runner',
      javascript: 'algopractice-javascript-runner',
      java: 'algopractice-java-runner'
    };

    const image = imageMap[language];
    if (!image) {
      throw new Error(`Unsupported language: ${language}`);
    }

    return new Promise((resolve, reject) => {
      const inputData = JSON.stringify({
        sourceCode,
        testInput,
        timeLimitMs: 5000
      });

      const dockerProcess = spawn('docker', [
        'run',
        '--rm',
        '--memory', '128m',
        '--cpus', '1.0',
        '--network', 'none',
        '--read-only',
        '--tmpfs', '/tmp:rw,size=100m',
        image
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let killed = false;

      // Set up timeout
      const timeout = setTimeout(() => {
        killed = true;
        dockerProcess.kill('SIGKILL');
      }, 10000); // 10 second timeout

      dockerProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      dockerProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      dockerProcess.on('close', (code) => {
        clearTimeout(timeout);
        
        try {
          const result = JSON.parse(stdout);
          resolve({
            exitCode: code || 0,
            stdout: result.stdout || '',
            stderr: result.stderr || stderr,
            runtimeMs: result.runtimeMs || 0,
            killed: killed || result.killed
          });
        } catch (error) {
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
    return actual.trim() === expected.trim();
  }

  async executeCode(
    language: string,
    sourceCode: string,
    testCases: TestCase[]
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    for (const testCase of testCases) {
      try {
        const executionResult = await this.executeWithDocker(
          language,
          sourceCode,
          testCase.input
        );

        const passed = this.compareOutputs(executionResult.stdout, testCase.expected);

        results.push({
          testCaseId: testCase.id,
          passed,
          actualOutput: executionResult.stdout,
          expectedOutput: testCase.expected,
          runtimeMs: executionResult.runtimeMs,
          error: executionResult.stderr || undefined,
          weight: testCase.weight
        });
      } catch (error) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          expectedOutput: testCase.expected,
          runtimeMs: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          weight: testCase.weight
        });
      }
    }

    return results;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { language, sourceCode, problemId } = body;
    
    if (!language || !sourceCode || !problemId) {
      return NextResponse.json(
        { error: 'Missing required fields: language, sourceCode, problemId' },
        { status: 400 }
      );
    }

    // Mock test cases for now (in production, these would come from the database)
    const testCases: TestCase[] = [
      { id: 'public-1', input: '5\n1 2 3 4 5', expected: '15', weight: 0.2 },
      { id: 'public-2', input: '3\n10 20 30', expected: '60', weight: 0.2 },
      { id: 'hidden-1', input: '1\n42', expected: '42', weight: 0.3 },
      { id: 'hidden-2', input: '0\n', expected: '0', weight: 0.3 }
    ];

    const judge = new DockerJudge();
    const results = await judge.executeCode(language, sourceCode, testCases);
    
    const totalRuntimeMs = results.reduce((sum, r) => sum + r.runtimeMs, 0);
    const totalScore = results.filter(r => r.passed).reduce((sum, r) => sum + r.weight, 0);
    const maxScore = results.reduce((sum, r) => sum + r.weight, 0);
    
    let passed: 'all' | 'partial' | 'none' = 'none';
    if (totalScore === maxScore) {
      passed = 'all';
    } else if (totalScore > 0) {
      passed = 'partial';
    }

    return NextResponse.json({
      problemId,
      language,
      results,
      totalRuntimeMs,
      passed,
      totalScore,
      maxScore
    });
    
  } catch (error) {
    console.error('Judge execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
