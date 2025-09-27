export type Language = 'python' | 'javascript' | 'java';
export interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
    weight: number;
    isHidden: boolean;
}
export interface ExecutionResult {
    testCaseId: string;
    passed: boolean;
    actualOutput?: string;
    expectedOutput: string;
    runtimeMs: number;
    memoryUsageKB?: number;
    error?: string;
    weight: number;
}
export interface JudgeRequest {
    language: Language;
    sourceCode: string;
    problemId: string;
    testCases: TestCase[];
    timeLimitMs?: number;
    memoryLimitMB?: number;
}
export interface JudgeResponse {
    problemId: string;
    language: Language;
    results: ExecutionResult[];
    totalRuntimeMs: number;
    passed: 'all' | 'partial' | 'none';
    totalScore: number;
    maxScore: number;
}
export interface RunnerConfig {
    language: Language;
    image: string;
    command: string[];
    timeLimitMs: number;
    memoryLimitMB: number;
    maxOutputSizeKB: number;
}
export interface DockerExecutionResult {
    exitCode: number;
    stdout: string;
    stderr: string;
    runtimeMs: number;
    memoryUsageKB?: number;
    killed: boolean;
}
//# sourceMappingURL=index.d.ts.map