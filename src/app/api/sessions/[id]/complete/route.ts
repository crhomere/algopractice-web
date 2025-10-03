import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { scores } = await req.json();
    
    // Complete the session
    const session = await DatabaseService.completeSession(id);
    
    // Save phase scores if provided
    if (scores && Array.isArray(scores)) {
      for (const score of scores) {
        await DatabaseService.savePhaseScore({
          sessionId: id,
          userId: session.userId,
          phase: score.phase,
          score: score.score,
          details: score.details
        });
      }
    }
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error completing session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
