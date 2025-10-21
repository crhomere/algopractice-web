import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const { explorePatterns, timeSpent } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating explore phase for session:', sessionId, 'with data:', { explorePatterns, timeSpent });

    // Update the session with explore data and timing
    const session = await DatabaseService.updateSessionExplore(sessionId, {
      explorePatterns,
      timeSpent
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating explore phase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}