import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
const dataPath = path.join(process.cwd(), '.data', 'sessions.json');
async function readStore(): Promise<Record<string, any>> { try { const raw = await fs.readFile(dataPath, 'utf8'); return JSON.parse(raw); } catch { return {}; } }
async function writeStore(store: Record<string, any>) { await fs.writeFile(dataPath, JSON.stringify(store, null, 2), 'utf8'); }
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
const body = await req.json().catch(()=>({}));
const store = await readStore();
const { id } = await ctx.params;
store[id] = store[id] || { id, data: {} };
store[id].phase = 'planning';
store[id].data.explore = body;
await writeStore(store);
return NextResponse.json({ ok: true });
}
