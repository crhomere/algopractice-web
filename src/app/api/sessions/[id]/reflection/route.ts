import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const { notes, timeSpent } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating reflection phase for session:', sessionId, 'with data:', { notes, timeSpent });

    // Update the session with reflection data and timing
    const session = await DatabaseService.updateSessionReflection(sessionId, {
      notes,
      timeSpent
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating reflection phase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}