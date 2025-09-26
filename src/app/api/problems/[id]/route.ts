import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
const dataPath = path.join(process.cwd(), '.data', 'problems.json');
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const raw = await fs.readFile(dataPath, 'utf8').catch(()=> '[]');
  const list = JSON.parse(raw);
  const { id } = await ctx.params;
  const found = list.find((p: any) => p.id === id || p.slug === id);
  if (!found) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(found);
}
