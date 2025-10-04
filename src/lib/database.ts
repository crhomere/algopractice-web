import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database service functions
export class DatabaseService {
  // User operations
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true
      }
    });
  }

  static async getUserByUsername(username: string) {
    try {
      return await prisma.user.findUnique({
        where: { username }
      });
    } catch (error: any) {
      // If the table doesn't exist yet, return null
      if (error.message?.includes('Unknown argument') || error.message?.includes('does not exist')) {
        console.log('User table not found, returning null');
        return null;
      }
      throw error;
    }
  }

  static async createUser(data: {
    username: string;
    password: string;
    name?: string | null;
    email?: string | null;
  }) {
    try {
      return await prisma.user.create({
        data,
        select: {
          id: true,
          username: true,
          name: true,
          createdAt: true
        }
      });
    } catch (error: any) {
      // If the table doesn't exist yet, throw a helpful error
      if (error.message?.includes('Unknown argument') || error.message?.includes('does not exist')) {
        throw new Error('Database schema not initialized. Please run: npx prisma db push');
      }
      throw error;
    }
  }

  static async updateUser(id: string, data: {
    name?: string | null;
    email?: string | null;
  }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true
      }
    });
  }

  // Problem operations
  static async getProblems() {
    return prisma.problem.findMany({
      include: {
        testCases: true,
        _count: {
          select: { sessions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getProblemById(id: string) {
    return prisma.problem.findUnique({
      where: { id },
      include: {
        testCases: true
      }
    });
  }

  static async getProblemBySlug(slug: string) {
    return prisma.problem.findUnique({
      where: { slug },
      include: {
        testCases: true
      }
    });
  }

  static async createCustomProblem(data: {
    userId: string;
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    examples: any[];
    constraints: string[];
  }) {
    const problem = await prisma.problem.create({
      data: {
        slug: data.title.toLowerCase().replace(/\s+/g, '-'),
        title: data.title,
        difficulty: data.difficulty,
        patterns: [], // Will be detected by AI later
        cues: [],
        description: data.description,
        examples: data.examples,
        constraints: data.constraints,
        isCustom: true,
        createdBy: data.userId
      }
    });

    // Create custom problem record
    await prisma.customProblem.create({
      data: {
        userId: data.userId,
        problemId: problem.id,
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        examples: data.examples,
        constraints: data.constraints
      }
    });

    return problem;
  }

  static async deleteProblem(id: string) {
    return prisma.problem.delete({
      where: { id }
    });
  }

  static async deleteCustomProblem(problemId: string) {
    return prisma.customProblem.delete({
      where: { problemId }
    });
  }

  // Session operations
  static async createSession(data: {
    userId: string;
    problemId: string;
    mode: 'TIMED' | 'UNTIMED' | 'STRICT';
  }) {
    return prisma.practiceSession.create({
      data: {
        userId: data.userId,
        problemId: data.problemId,
        mode: data.mode
      },
      include: {
        problem: {
          include: {
            testCases: true
          }
        }
      }
    });
  }

  static async getSessionById(id: string) {
    return prisma.practiceSession.findUnique({
      where: { id },
      include: {
        problem: {
          include: {
            testCases: true
          }
        },
        scores: true
      }
    });
  }

  static async updateSessionPhase(id: string, phase: 'EXPLORE' | 'PLANNING' | 'IMPLEMENTATION' | 'REFLECTION', data: any) {
    const updateData: any = {};
    
    switch (phase) {
      case 'EXPLORE':
        updateData.exploreData = data;
        break;
      case 'PLANNING':
        updateData.planningData = data;
        break;
      case 'IMPLEMENTATION':
        updateData.implementationData = data;
        break;
      case 'REFLECTION':
        updateData.reflectionData = data;
        break;
    }

    return prisma.practiceSession.update({
      where: { id },
      data: updateData
    });
  }

  static async completeSession(id: string) {
    return prisma.practiceSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
  }

  // Scoring operations
  static async savePhaseScore(data: {
    sessionId: string;
    userId: string;
    phase: 'EXPLORE' | 'PLANNING' | 'IMPLEMENTATION' | 'REFLECTION';
    score: number;
    details?: any;
  }) {
    return prisma.phaseScore.create({
      data: {
        sessionId: data.sessionId,
        userId: data.userId,
        phase: data.phase,
        score: data.score,
        details: data.details
      }
    });
  }

  // User analytics
  static async getUserStats(userId: string) {
    const sessions = await prisma.practiceSession.findMany({
      where: { userId },
      include: {
        scores: true,
        problem: true
      }
    });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
    const avgScore = sessions.reduce((sum, s) => {
      const sessionScores = s.scores.map(sc => sc.score);
      return sum + (sessionScores.length > 0 ? sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length : 0);
    }, 0) / totalSessions;

    // Pattern coverage
    const patternCounts = sessions.reduce((acc, session) => {
      session.problem.patterns.forEach(pattern => {
        acc[pattern] = (acc[pattern] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions,
      completedSessions,
      avgScore: Math.round(avgScore * 100) / 100,
      patternCoverage: patternCounts
    };
  }

  // Daily plan operations
  static async createDailyPlan(userId: string, date: Date, problems: any[]) {
    return prisma.dailyPlan.upsert({
      where: {
        userId_date: {
          userId,
          date
        }
      },
      update: {
        problems
      },
      create: {
        userId,
        date,
        problems
      }
    });
  }

  static async getDailyPlan(userId: string, date: Date) {
    return prisma.dailyPlan.findUnique({
      where: {
        userId_date: {
          userId,
          date
        }
      }
    });
  }
}