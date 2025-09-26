import { AIClient } from './ai-client';
import { ExploreFeedback, PlanningFeedback, ImplementationFeedback } from './types.js';

export class FeedbackEngine {
  private aiClient: AIClient;

  constructor() {
    try {
      this.aiClient = new AIClient();
    } catch (error) {
      console.error('Failed to initialize AIClient:', error);
      throw new Error(`Failed to initialize AI client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async evaluateExploreSolutions(
    problem: any,
    explorePatterns: any[]
  ): Promise<ExploreFeedback[]> {
    const feedbackPromises = explorePatterns.map(async (pattern) => {
      try {
        const aiResponse = await this.aiClient.evaluateExploreSolution(problem, pattern);
        return this.parseExploreResponse(aiResponse);
      } catch (error) {
        console.error('Error evaluating explore solution:', error);
        return this.getDefaultExploreFeedback();
      }
    });

    return Promise.all(feedbackPromises);
  }

  async evaluatePlanningPhase(
    problem: any,
    planning: any
  ): Promise<PlanningFeedback> {
    try {
      const aiResponse = await this.aiClient.evaluatePlanningPhase(problem, planning);
      return this.parsePlanningResponse(aiResponse);
    } catch (error) {
      console.error('Error evaluating planning phase:', error);
      return this.getDefaultPlanningFeedback();
    }
  }

  async evaluateImplementation(
    problem: any,
    code: string
  ): Promise<ImplementationFeedback> {
    try {
      const aiResponse = await this.aiClient.evaluateImplementation(problem, code);
      return this.parseImplementationResponse(aiResponse);
    } catch (error) {
      console.error('Error evaluating implementation:', error);
      return this.getDefaultImplementationFeedback();
    }
  }

  private parseExploreResponse(aiResponse: string): ExploreFeedback {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        patternAccuracy: {
          correct: parsed.patternAccuracy?.correct ?? false,
          explanation: parsed.patternAccuracy?.explanation ?? 'Unable to evaluate pattern accuracy',
          suggestedPattern: parsed.patternAccuracy?.suggestedPattern,
        },
        complexityAccuracy: {
          timeComplexity: {
            correct: parsed.complexityAccuracy?.timeComplexity?.correct ?? false,
            explanation: parsed.complexityAccuracy?.timeComplexity?.explanation ?? 'Unable to evaluate time complexity',
            suggested: parsed.complexityAccuracy?.timeComplexity?.suggested,
          },
          spaceComplexity: {
            correct: parsed.complexityAccuracy?.spaceComplexity?.correct ?? false,
            explanation: parsed.complexityAccuracy?.spaceComplexity?.explanation ?? 'Unable to evaluate space complexity',
            suggested: parsed.complexityAccuracy?.spaceComplexity?.suggested,
          },
          optimality: {
            isOptimal: parsed.complexityAccuracy?.optimality?.isOptimal ?? false,
            explanation: parsed.complexityAccuracy?.optimality?.explanation ?? 'Unable to evaluate optimality',
            betterApproach: parsed.complexityAccuracy?.optimality?.betterApproach,
          },
        },
        brainstormingDirection: {
          onTrack: parsed.brainstormingDirection?.onTrack ?? false,
          explanation: parsed.brainstormingDirection?.explanation ?? 'Unable to evaluate brainstorming direction',
          suggestions: parsed.brainstormingDirection?.suggestions ?? [],
        },
        overallAssessment: {
          score: parsed.overallAssessment?.score ?? 0,
          summary: parsed.overallAssessment?.summary ?? 'Unable to provide assessment',
          strengths: parsed.overallAssessment?.strengths ?? [],
          improvements: parsed.overallAssessment?.improvements ?? [],
        },
      };
    } catch (error) {
      console.error('Error parsing explore response:', error);
      return this.getDefaultExploreFeedback();
    }
  }

  private parsePlanningResponse(aiResponse: string): PlanningFeedback {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        pseudocodeQuality: {
          score: parsed.pseudocodeQuality?.score ?? 0,
          explanation: parsed.pseudocodeQuality?.explanation ?? 'Unable to evaluate pseudocode quality',
          missingSteps: parsed.pseudocodeQuality?.missingSteps ?? [],
        },
        edgeCaseCoverage: {
          score: parsed.edgeCaseCoverage?.score ?? 0,
          explanation: parsed.edgeCaseCoverage?.explanation ?? 'Unable to evaluate edge case coverage',
          missingCases: parsed.edgeCaseCoverage?.missingCases ?? [],
        },
        overallAssessment: {
          score: parsed.overallAssessment?.score ?? 0,
          summary: parsed.overallAssessment?.summary ?? 'Unable to provide assessment',
          strengths: parsed.overallAssessment?.strengths ?? [],
          improvements: parsed.overallAssessment?.improvements ?? [],
        },
      };
    } catch (error) {
      console.error('Error parsing planning response:', error);
      return this.getDefaultPlanningFeedback();
    }
  }

  private parseImplementationResponse(aiResponse: string): ImplementationFeedback {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        codeCorrectness: {
          correct: parsed.codeCorrectness?.correct ?? false,
          explanation: parsed.codeCorrectness?.explanation ?? 'Unable to evaluate code correctness',
          bugs: parsed.codeCorrectness?.bugs ?? [],
        },
        codeQuality: {
          score: parsed.codeQuality?.score ?? 0,
          explanation: parsed.codeQuality?.explanation ?? 'Unable to evaluate code quality',
          improvements: parsed.codeQuality?.improvements ?? [],
        },
        efficiency: {
          score: parsed.efficiency?.score ?? 0,
          explanation: parsed.efficiency?.explanation ?? 'Unable to evaluate efficiency',
          optimizations: parsed.efficiency?.optimizations ?? [],
        },
        overallAssessment: {
          score: parsed.overallAssessment?.score ?? 0,
          summary: parsed.overallAssessment?.summary ?? 'Unable to provide assessment',
          strengths: parsed.overallAssessment?.strengths ?? [],
          improvements: parsed.overallAssessment?.improvements ?? [],
        },
      };
    } catch (error) {
      console.error('Error parsing implementation response:', error);
      return this.getDefaultImplementationFeedback();
    }
  }

  private getDefaultExploreFeedback(): ExploreFeedback {
    return {
      patternAccuracy: {
        correct: false,
        explanation: 'Unable to evaluate pattern accuracy due to AI service error',
      },
      complexityAccuracy: {
        timeComplexity: {
          correct: false,
          explanation: 'Unable to evaluate time complexity due to AI service error',
        },
        spaceComplexity: {
          correct: false,
          explanation: 'Unable to evaluate space complexity due to AI service error',
        },
        optimality: {
          isOptimal: false,
          explanation: 'Unable to evaluate optimality due to AI service error',
        },
      },
      brainstormingDirection: {
        onTrack: false,
        explanation: 'Unable to evaluate brainstorming direction due to AI service error',
      },
      overallAssessment: {
        score: 0,
        summary: 'Unable to provide assessment due to AI service error',
        strengths: [],
        improvements: ['Check your internet connection and try again'],
      },
    };
  }

  private getDefaultPlanningFeedback(): PlanningFeedback {
    return {
      pseudocodeQuality: {
        score: 0,
        explanation: 'Unable to evaluate pseudocode quality due to AI service error',
      },
      edgeCaseCoverage: {
        score: 0,
        explanation: 'Unable to evaluate edge case coverage due to AI service error',
      },
      overallAssessment: {
        score: 0,
        summary: 'Unable to provide assessment due to AI service error',
        strengths: [],
        improvements: ['Check your internet connection and try again'],
      },
    };
  }

  private getDefaultImplementationFeedback(): ImplementationFeedback {
    return {
      codeCorrectness: {
        correct: false,
        explanation: 'Unable to evaluate code correctness due to AI service error',
      },
      codeQuality: {
        score: 0,
        explanation: 'Unable to evaluate code quality due to AI service error',
      },
      efficiency: {
        score: 0,
        explanation: 'Unable to evaluate efficiency due to AI service error',
      },
      overallAssessment: {
        score: 0,
        summary: 'Unable to provide assessment due to AI service error',
        strengths: [],
        improvements: ['Check your internet connection and try again'],
      },
    };
  }
}