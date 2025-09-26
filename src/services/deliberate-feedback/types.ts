// Core feedback interfaces for the Deliberate Feedback Service

export interface ExploreFeedback {
  patternAccuracy: {
    correct: boolean;
    explanation: string;
    suggestedPattern?: string;
  };
  complexityAccuracy: {
    timeComplexity: {
      correct: boolean;
      explanation: string;
      suggested?: string;
    };
    spaceComplexity: {
      correct: boolean;
      explanation: string;
      suggested?: string;
    };
    optimality: {
      isOptimal: boolean;
      explanation: string;
      betterApproach?: string;
    };
  };
  brainstormingDirection: {
    onTrack: boolean;
    explanation: string;
    suggestions?: string[];
  };
  overallAssessment: {
    score: number; // 0-100
    summary: string;
    strengths: string[];
    improvements: string[];
  };
}

export interface PlanningFeedback {
  pseudocodeQuality: {
    score: number;
    explanation: string;
    missingSteps?: string[];
  };
  edgeCaseCoverage: {
    score: number;
    explanation: string;
    missingCases?: string[];
  };
  overallAssessment: {
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
  };
}

export interface ImplementationFeedback {
  codeCorrectness: {
    correct: boolean;
    explanation: string;
    bugs?: string[];
  };
  codeQuality: {
    score: number;
    explanation: string;
    improvements?: string[];
  };
  efficiency: {
    score: number;
    explanation: string;
    optimizations?: string[];
  };
  overallAssessment: {
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
  };
}

export interface AIPrompt {
  system: string;
  user: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}