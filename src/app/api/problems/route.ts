import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const problems = await DatabaseService.getProblems();
    return NextResponse.json(problems);
  } catch (error) {
    console.error('Error fetching problems:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, title, description, difficulty, examples, constraints } = await req.json();
    
    if (!userId || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, description' },
        { status: 400 }
      );
    }

    const problem = await DatabaseService.createCustomProblem({
      userId,
      title,
      description,
      difficulty: difficulty || 'MEDIUM',
      examples: examples || [],
      constraints: constraints || []
    });

    return NextResponse.json(problem);
  } catch (error) {
    console.error('Error creating problem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
