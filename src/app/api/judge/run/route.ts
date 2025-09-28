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

        // For "run" mode, we don't compare outputs - just show the actual output
        const passed = testCase.expected ? this.compareOutputs(executionResult.stdout, testCase.expected) : true;

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

// Generate additional test cases based on problem constraints and patterns
function generateAdditionalTestCases(problem: any): TestCase[] {
  const tests: TestCase[] = [];
  
  // This is a simplified version - in production, you'd have more sophisticated
  // test case generation based on problem patterns, constraints, and edge cases
  
  if (problem.patterns?.includes('Two Pointers')) {
    tests.push({
      id: 'edge-empty',
      input: '0\n',
      expected: '0',
      weight: 0.1
    });
    tests.push({
      id: 'edge-single',
      input: '1\n5',
      expected: '5',
      weight: 0.1
    });
  }
  
  if (problem.patterns?.includes('Sliding Window')) {
    tests.push({
      id: 'edge-k-equals-n',
      input: '3\n1 2 3\n3',
      expected: '6',
      weight: 0.1
    });
  }
  
  if (problem.patterns?.includes('Binary Search')) {
    tests.push({
      id: 'edge-not-found',
      input: '5\n1 3 5 7 9\n4',
      expected: '-1',
      weight: 0.1
    });
  }
  
  // Add some generic edge cases
  tests.push({
    id: 'edge-large',
    input: '1000\n' + Array(1000).fill(1).join(' '),
    expected: '1000',
    weight: 0.1
  });
  
  return tests;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { language, sourceCode, problemId, testMode = 'full' } = body;
    
    if (!language || !sourceCode || !problemId) {
      return NextResponse.json(
        { error: 'Missing required fields: language, sourceCode, problemId' },
        { status: 400 }
      );
    }

    // Load problem data to get specific test cases
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataPath = path.join(process.cwd(), '.data', 'problems.json');
    const raw = await fs.readFile(dataPath, 'utf8').catch(() => '[]');
    const problems = JSON.parse(raw);
    const problem = problems.find((p: any) => p.id === problemId);

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Generate test cases based on problem examples and constraints
    let testCases: TestCase[] = [];

    if (testMode === 'examples') {
      console.log('Using examples mode');
      // Only run against the examples provided in the problem
      testCases = problem.examples?.map((example: any, index: number) => ({
        id: `example-${index + 1}`,
        input: example.input,
        expected: example.output,
        weight: 1.0 / (problem.examples?.length || 1)
      })) || [];
    } else if (testMode === 'run') {
      console.log('Using run mode');
      // For "Run Code" - just execute with sample input to show output
      // Use empty input for run mode to just show what the code outputs
      testCases = [{
        id: 'sample-run',
        input: '', // Empty input for run mode
        expected: '', // No expected output for run mode
        weight: 1.0
      }];
    } else {
      console.log('Using full test mode');
      // Run full test suite: examples + additional test cases
      const exampleTests = problem.examples?.map((example: any, index: number) => ({
        id: `example-${index + 1}`,
        input: example.input,
        expected: example.output,
        weight: 0.3 / (problem.examples?.length || 1)
      })) || [];

      // Generate additional test cases based on problem constraints
      const additionalTests = generateAdditionalTestCases(problem);
      
      testCases = [...exampleTests, ...additionalTests];
    }

    console.log('testMode value:', testMode, 'type:', typeof testMode);
    console.log('Request body:', { language, sourceCode: sourceCode.substring(0, 100) + '...', problemId, testMode });
    const judge = new DockerJudge();
    const results = await judge.executeCode(language, sourceCode, testCases);
    console.log('Execution results:', results);
    
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
