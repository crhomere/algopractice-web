import OpenAI from 'openai';
import { AIPrompt, AIResponse } from './types';

export class AIClient {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.client = new OpenAI({
      apiKey,
    });
  }

  async callAI(prompt: AIPrompt): Promise<AIResponse> {
    try {
      // Making OpenAI API call with GPT-5
      const response = await this.client.chat.completions.create({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ],
        max_completion_tokens: 4000,
      });

      const choice = response.choices[0];
      console.log('AI Response:', {
        hasChoices: !!response.choices,
        choicesLength: response.choices?.length || 0,
        hasChoice: !!choice,
        hasMessage: !!choice?.message,
        hasContent: !!choice?.message?.content,
        contentLength: choice?.message?.content?.length || 0,
        contentPreview: choice?.message?.content?.substring(0, 100) || 'none'
      });
      
      if (!choice?.message?.content) {
        console.error('Full response object:', JSON.stringify(response, null, 2));
        throw new Error('No response content from AI');
      }

      return {
        content: choice.message.content,
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('AI API call failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Failed to get AI feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async evaluateExploreSolution(
    problem: any,
    userSolution: any
  ): Promise<string> {
    const prompt: AIPrompt = {
      system: `You are an expert algorithm tutor. Evaluate the student's solution approach and provide feedback in this exact JSON format:

{
  "patternAccuracy": {
    "correct": boolean,
    "explanation": "string",
    "suggestedPattern": "string (optional)"
  },
  "complexityAccuracy": {
    "timeComplexity": {
      "correct": boolean,
      "explanation": "string",
      "suggested": "string (optional)"
    },
    "spaceComplexity": {
      "correct": boolean,
      "explanation": "string",
      "suggested": "string (optional)"
    },
    "optimality": {
      "isOptimal": boolean,
      "explanation": "string",
      "betterApproach": "string (optional)"
    }
  },
  "brainstormingDirection": {
    "onTrack": boolean,
    "explanation": "string",
    "suggestions": ["string array (optional)"]
  },
  "overallAssessment": {
    "score": number (0-100),
    "summary": "string",
    "strengths": ["string array"],
    "improvements": ["string array"]
  }
}`,
      user: `Problem: ${problem.title}
Description: ${problem.prompt}
Difficulty: ${problem.difficulty}

Student's approach:
- Pattern: ${userSolution.pattern}
- Time: ${userSolution.timeComplexity}
- Space: ${userSolution.spaceComplexity}
- Notes: ${userSolution.brainstorming}

Evaluate and return JSON feedback.`
    };

    console.log('Sending prompt to AI:', {
      systemLength: prompt.system.length,
      userLength: prompt.user.length,
      problemTitle: problem.title,
      userPattern: userSolution.pattern
    });

    const response = await this.callAI(prompt);
    return response.content;
  }

  async evaluatePlanningPhase(
    problem: any,
    planning: any,
    explorePattern: any
  ): Promise<string> {
    const prompt: AIPrompt = {
      system: `You are an expert algorithm tutor. Evaluate the student's implementation plan and provide feedback in this exact JSON format:

{
  "pseudocodeQuality": {
    "score": number (0-100),
    "explanation": "string",
    "missingSteps": ["string array (optional)"]
  },
  "edgeCaseCoverage": {
    "score": number (0-100),
    "explanation": "string",
    "missingCases": ["string array (optional)"]
  },
  "overallAssessment": {
    "score": number (0-100),
    "summary": "string",
    "strengths": ["string array"],
    "improvements": ["string array"]
  }
}`,
      user: `Problem: ${problem.title}
Description: ${problem.prompt}
Difficulty: ${problem.difficulty}

Student's chosen approach:
- Pattern: ${explorePattern.pattern}
- Time Complexity: ${explorePattern.timeComplexity}
- Space Complexity: ${explorePattern.spaceComplexity}

Student's implementation plan:
- Pseudocode: ${planning.pseudocode}
- Edge Cases: ${planning.edgeCases}

Evaluate the plan for correctness, completeness, and implementation readiness. Return JSON feedback.`
    };

    console.log('Sending planning prompt to AI:', {
      systemLength: prompt.system.length,
      userLength: prompt.user.length,
      problemTitle: problem.title,
      hasPseudocode: !!planning.pseudocode,
      hasEdgeCases: !!planning.edgeCases
    });

    const response = await this.callAI(prompt);
    return response.content;
  }

  async evaluateImplementationPhase(
    problem: any,
    implementationData: any,
    explorePattern: any,
    planningData: any
  ): Promise<string> {
    const prompt: AIPrompt = {
      system: `You are an expert algorithm tutor helping students learn coding interview implementation.
      Your role is to provide constructive feedback on their code implementation.
      
      Always respond in valid JSON format with the following structure:
      {
        "codeCorrectness": {
          "correct": boolean,
          "explanation": "string",
          "bugs": ["string array (optional)"]
        },
        "codeQuality": {
          "score": number (0-100),
          "explanation": "string",
          "improvements": ["string array (optional)"]
        },
        "efficiency": {
          "score": number (0-100),
          "explanation": "string",
          "optimizations": ["string array (optional)"]
        },
        "overallAssessment": {
          "score": number (0-100),
          "summary": "string",
          "strengths": ["string array"],
          "improvements": ["string array"]
        }
      }`,
      user: `Problem: ${problem.title}
      Description: ${problem.prompt}
      Difficulty: ${problem.difficulty}
      
      Student's chosen approach:
      - Pattern: ${explorePattern.pattern}
      - Time Complexity: ${explorePattern.timeComplexity}
      - Space Complexity: ${explorePattern.spaceComplexity}
      
      Student's planning:
      - Pseudocode: ${planningData.pseudocode}
      - Edge Cases: ${planningData.edgeCases}
      
      User's Code (${implementationData.language}):
      \`\`\`${implementationData.language}
      ${implementationData.code}
      \`\`\`
      
      Please evaluate this code implementation for correctness, quality, and efficiency. Consider how well it matches the chosen pattern and planning.`
    };

    const response = await this.callAI(prompt);
    return response.content;
  }
}