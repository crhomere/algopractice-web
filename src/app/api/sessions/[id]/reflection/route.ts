import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reflectionData = await req.json();
    
    const session = await DatabaseService.updateSessionPhase(id, 'REFLECTION', reflectionData);
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error saving reflection data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}