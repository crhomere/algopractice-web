import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

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
    console.error('Error creating custom problem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const customProblems = await DatabaseService.getProblems();
    const userCustomProblems = customProblems.filter(p => p.isCustom && p.createdBy === userId);
    
    return NextResponse.json(userCustomProblems);
  } catch (error) {
    console.error('Error fetching custom problems:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}