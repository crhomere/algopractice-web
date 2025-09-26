import OpenAI from 'openai';
import { AIPrompt, AIResponse } from './types.js';

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
        max_completion_tokens: 2000,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
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
      system: `You are an expert algorithm tutor helping students learn coding interview patterns. 
      Your role is to provide constructive feedback on their solution approach.
      
      Always respond in valid JSON format with the following structure:
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
      
      User's Solution Approach:
      Pattern: ${userSolution.pattern}
      Time Complexity: ${userSolution.timeComplexity}
      Space Complexity: ${userSolution.spaceComplexity}
      Brainstorming: ${userSolution.brainstorming}
      
      Please evaluate this solution approach and provide detailed feedback.`
    };

    const response = await this.callAI(prompt);
    return response.content;
  }

  async evaluatePlanningPhase(
    problem: any,
    planning: any
  ): Promise<string> {
    const prompt: AIPrompt = {
      system: `You are an expert algorithm tutor helping students learn coding interview planning.
      Your role is to provide constructive feedback on their planning phase.
      
      Always respond in valid JSON format with the following structure:
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
      
      User's Planning:
      Pseudocode: ${planning.pseudocode}
      Edge Cases Considered: ${Array.from(planning.edgeCases).join(', ')}
      
      Please evaluate this planning phase and provide detailed feedback.`
    };

    const response = await this.callAI(prompt);
    return response.content;
  }

  async evaluateImplementation(
    problem: any,
    code: string
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
      
      User's Code:
      \`\`\`javascript
      ${code}
      \`\`\`
      
      Please evaluate this code implementation and provide detailed feedback.`
    };

    const response = await this.callAI(prompt);
    return response.content;
  }
}
