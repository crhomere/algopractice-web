// src/services/ai-review/types.ts
export interface ReviewAnalysis {
  timingAnalysis: {
    phaseTimes: Record<string, number>;
    efficiencyScore: number;
    timeDistribution: Record<string, number>;
    insights: string[];
  };
  
  mistakeAnalysis: {
    implementationErrors: Array<{
      attempt: number;
      error: string;
      severity: 'low' | 'medium' | 'high';
      suggestion: string;
    }>;
    patternMisconceptions: string[];
    commonMistakes: string[];
  };
  
  patternAnalysis: {
    strengths: Array<{
      pattern: string;
      evidence: string;
      confidence: number;
    }>;
    weaknesses: Array<{
      pattern: string;
      issue: string;
      recommendation: string;
    }>;
    accuracy: number;
  };
  
  recommendations: {
    immediate: string[];
    longTerm: string[];
    nextProblems: string[];
  };
  
  overallScore: number;
  readinessImpact: number;
}

export interface PracticeSessionData {
  id: string;
  userId: string;
  problem: {
    title: string;
    difficulty: string;
    patterns: string[];
    description: string;
  };
  exploreData: any;
  planningData: any;
  implData: any;
  reflectionData: any;
  phaseTimings: Record<string, number>;
  implementationHistory: Array<{
    attempt: number;
    code: string;
    errors: string[];
    testResults: any;
  }>;
}