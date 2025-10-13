// src/services/ai-review/ai-review-engine.ts
import OpenAI from 'openai';
import { ReviewAnalysis, PracticeSessionData } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIReviewEngine {
  async analyzeSession(sessionData: PracticeSessionData): Promise<ReviewAnalysis> {
    try {
      const prompt = this.createComprehensivePrompt(sessionData);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: `You are an expert coding interview coach analyzing a student's practice session. 
            Provide detailed, actionable feedback on timing, mistakes, pattern recognition, and overall performance.
            Return your analysis as a JSON object with the exact structure specified.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 4000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from AI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('AI Review Engine Error:', error);
      throw new Error('Failed to analyze session with AI');
    }
  }

  private createComprehensivePrompt(session: PracticeSessionData): string {
    return `
Analyze this coding practice session and provide comprehensive feedback:

## Session Data
**Problem:** ${session.problem.title} (${session.problem.difficulty})
**Required Patterns:** ${session.problem.patterns.join(', ')}
**Problem Description:** ${session.problem.description}

## Phase Timing
- Explore Phase: ${session.phaseTimings?.explore || 0} seconds
- Planning Phase: ${session.phaseTimings?.planning || 0} seconds  
- Implementation Phase: ${session.phaseTimings?.implementation || 0} seconds
- Total Time: ${session.phaseTimings ? Object.values(session.phaseTimings).reduce((a, b) => a + b, 0) : 0} seconds

## Explore Phase Data
${JSON.stringify(session.exploreData || [], null, 2)}

## Planning Phase Data
${JSON.stringify(session.planningData || null, null, 2)}

## Implementation History
${session.implementationHistory ? session.implementationHistory.map((attempt, i) => `
Attempt ${i + 1}:
- Code: ${attempt.code.substring(0, 200)}...
- Errors: ${attempt.errors.join(', ')}
- Test Results: ${JSON.stringify(attempt.testResults)}
`).join('\n') : 'No implementation history available'}

## Reflection Data
${JSON.stringify(session.reflectionData || null, null, 2)}

---

Provide your analysis as a JSON object with this exact structure:

{
  "timingAnalysis": {
    "phaseTimes": {"explore": number, "planning": number, "implementation": number},
    "efficiencyScore": number,
    "timeDistribution": {"explore": number, "planning": number, "implementation": number},
    "insights": ["string", "string"]
  },
  "mistakeAnalysis": {
    "implementationErrors": [
      {
        "attempt": number,
        "error": "string",
        "severity": "low|medium|high",
        "suggestion": "string"
      }
    ],
    "patternMisconceptions": ["string"],
    "commonMistakes": ["string"]
  },
  "patternAnalysis": {
    "strengths": [
      {
        "pattern": "string",
        "evidence": "string", 
        "confidence": number
      }
    ],
    "weaknesses": [
      {
        "pattern": "string",
        "issue": "string",
        "recommendation": "string"
      }
    ],
    "accuracy": number
  },
  "recommendations": {
    "immediate": ["string"],
    "longTerm": ["string"],
    "nextProblems": ["string"]
  },
  "overallScore": number,
  "readinessImpact": number
}

Focus on:
1. Time management efficiency
2. Pattern recognition accuracy
3. Common implementation mistakes
4. Specific areas for improvement
5. Actionable next steps
`;
  }
}