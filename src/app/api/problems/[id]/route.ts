import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const planningData = await req.json();
    
    const session = await DatabaseService.updateSessionPhase(id, 'PLANNING', planningData);
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error saving planning data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}