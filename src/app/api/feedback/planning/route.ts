import { NextRequest, NextResponse } from 'next/server';
import { FeedbackEngine } from '@/services/deliberate-feedback/feedback-engine';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { problemId, planningData, explorePattern } = requestBody;

    if (!problemId || !planningData || !explorePattern) {
      return NextResponse.json(
        { error: 'Missing required fields: problemId, planningData, and explorePattern' },
        { status: 400 }
      );
    }

    // Load problem data
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

    // Initialize feedback engine
    const feedbackEngine = new FeedbackEngine();

    // Evaluate planning phase
    const feedback = await feedbackEngine.evaluatePlanningPhase(
      problem,
      planningData,
      explorePattern
    );

    return NextResponse.json({
      success: true,
      feedback,
      problemId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in planning feedback API:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}