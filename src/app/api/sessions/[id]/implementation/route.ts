import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const { language, sourceCode, timeSpent } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!language || !sourceCode) {
      return NextResponse.json(
        { error: 'Missing required fields: language, sourceCode' },
        { status: 400 }
      );
    }

    console.log('Updating implementation phase for session:', sessionId, 'with data:', { language, sourceCode, timeSpent });

    // Update the session with implementation data and timing
    const session = await DatabaseService.updateSessionImplementation(sessionId, {
      language,
      sourceCode,
      timeSpent
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating implementation phase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}