import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { withAuth } from '@/lib/middleware';
import { getCurrentUser } from '@/lib/auth';

export const POST = async (req: NextRequest) => {
  try {
    // Check authentication directly
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { title, description, difficulty, examples, constraints } = await req.json();
    
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Convert difficulty to uppercase to match Prisma enum
    const normalizedDifficulty = difficulty?.toUpperCase() || 'MEDIUM';
    
    // Validate difficulty value
    if (!['EASY', 'MEDIUM', 'HARD'].includes(normalizedDifficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be Easy, Medium, or Hard' },
        { status: 400 }
      );
    }

    const problem = await DatabaseService.createCustomProblem({
      userId: user.userId,
      title,
      description,
      difficulty: normalizedDifficulty as 'EASY' | 'MEDIUM' | 'HARD',
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
};

export const DELETE = async (req: NextRequest) => {
  try {
    // Check authentication directly
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get('id');
    
    if (!problemId) {
      return NextResponse.json(
        { error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    // Get the problem to verify ownership
    const problem = await DatabaseService.getProblemById(problemId);
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Check if user owns this custom problem
    if (!problem.isCustom || problem.createdBy !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this problem' },
        { status: 403 }
      );
    }

    // Delete the custom problem record first
    await DatabaseService.deleteCustomProblem(problemId);
    
    // Delete the main problem record
    await DatabaseService.deleteProblem(problemId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom problem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};