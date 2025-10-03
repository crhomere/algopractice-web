import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await DatabaseService.getSessionById(id);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    
    if (status === 'COMPLETED') {
      const session = await DatabaseService.completeSession(id);
      return NextResponse.json(session);
    }
    
    return NextResponse.json(
      { error: 'Invalid status update' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
