import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password, name } = await req.json();
    
    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    
    // Check if username already exists
    const existingUser = await DatabaseService.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }
    
    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await DatabaseService.createUser({
      username,
      password: hashedPassword,
      name: name || null
    });
    
    // Create session
    await createSession({
      userId: user.id,
      username: user.username,
      name: user.name || undefined
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}