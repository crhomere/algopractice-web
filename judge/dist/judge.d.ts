import { JudgeRequest, JudgeResponse } from '../types/index.js';
export declare class DockerJudge {
    private configs;
    constructor();
    executeCode(request: JudgeRequest): Promise<JudgeResponse>;
    private executeTestCase;
    private compareOutputs;
    buildImages(): Promise<void>;
    testRunner(language: string): Promise<boolean>;
    private getTestCode;
}
//# sourceMappingURL=judge.d.ts.map