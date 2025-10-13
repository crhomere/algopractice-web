import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { userId, problemId, mode } = await req.json();
    
    if (!userId || !problemId || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, problemId, mode' },
        { status: 400 }
      );
    }

    const session = await DatabaseService.createSession({
      userId,
      problemId,
      mode: mode.toUpperCase() as 'TIMED' | 'UNTIMED' | 'STRICT'
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}