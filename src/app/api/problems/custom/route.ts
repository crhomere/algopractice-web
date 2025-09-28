import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const customProblem = await req.json();
    
    // Validate required fields
    if (!customProblem.title || !customProblem.description) {
      return NextResponse.json(
        { error: 'Missing required fields: title and description' },
        { status: 400 }
      );
    }

    // Load existing problems
    const dataPath = path.join(process.cwd(), '.data', 'problems.json');
    const raw = await fs.readFile(dataPath, 'utf8').catch(() => '[]');
    const problems = JSON.parse(raw);

    // Add the custom problem
    problems.push(customProblem);

    // Save back to file
    await fs.writeFile(dataPath, JSON.stringify(problems, null, 2));

    return NextResponse.json(customProblem);

  } catch (error) {
    console.error('Error saving custom problem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Load problems and filter for custom ones
    const dataPath = path.join(process.cwd(), '.data', 'problems.json');
    const raw = await fs.readFile(dataPath, 'utf8').catch(() => '[]');
    const problems = JSON.parse(raw);
    
    const customProblems = problems.filter((p: any) => p.isCustom === true);
    
    return NextResponse.json(customProblems);

  } catch (error) {
    console.error('Error loading custom problems:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}