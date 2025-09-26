import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
const dataPath = path.join(process.cwd(), '.data', 'problems.json');
export async function GET() {
  const raw = await fs.readFile(dataPath, 'utf8').catch(()=> '[]');
  return NextResponse.json(JSON.parse(raw));
}
