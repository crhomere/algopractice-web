import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>({}));
  const { language, sourceCode, problemId } = body;
  // Fake tests for stub
  const tests = [
    { id: 'public-1', input: 'small', expected: 'ok', weight: 0.2 },
    { id: 'public-2', input: 'edge', expected: 'ok', weight: 0.2 },
    { id: 'hidden-1', input: 'hiddenA', expected: 'ok', weight: 0.3 },
    { id: 'hidden-2', input: 'hiddenB', expected: 'ok', weight: 0.3 }
  ];
  const now = Date.now();
  const results = tests.map(t => ({ testCaseId: t.id, passed: Math.random() > 0.1, runtimeMs: 5 + Math.floor(Math.random()*20), weight: t.weight }));
  const totalWeight = results.reduce((s, r) => s + r.weight, 0) || 1;
  const passWeight = results.filter(r => r.passed).reduce((s, r) => s + r.weight, 0);
  return NextResponse.json({
    problemId,
    language,
    runtimeMs: Date.now() - now,
    results,
    passed: passWeight/totalWeight >= 0.99 ? 'all' : passWeight > 0 ? 'partial' : 'none'
  });
}
