import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const { pseudocode, edgeCases, timeComplexity, spaceComplexity } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Update the session with planning data
    const session = await DatabaseService.updateSessionPlanning(sessionId, {
      pseudocode,
      edgeCases: edgeCases || [],
      timeComplexity,
      spaceComplexity
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