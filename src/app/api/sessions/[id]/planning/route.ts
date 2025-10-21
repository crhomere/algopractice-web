import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const { pseudocode, edgeCases, timeSpent } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating planning phase for session:', sessionId, 'with data:', { pseudocode, edgeCases, timeSpent });

    // Update the session with planning data and timing
    const session = await DatabaseService.updateSessionPlanning(sessionId, {
      pseudocode,
      edgeCases,
      timeSpent
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating planning phase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}