import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { AIReviewEngine } from '@/services/ai-review';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    console.log('API received sessionId:', sessionId); // Debug log
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get the session data
    console.log('Looking up session in database...'); // Debug log
    let session = await DatabaseService.getSessionById(sessionId);
    console.log('Session lookup result:', session); // Debug log
    
    // If not found, try to find session by problem ID (fallback)
    if (!session) {
      console.log('Session not found by ID, trying to find by problem ID...'); // Debug log
      // This is a fallback - in a real scenario, we'd need a different approach
      // For now, let's return a more helpful error
      return NextResponse.json(
        { 
          error: 'Session not found', 
          details: `No session found with ID: ${sessionId}. This might be a problem ID instead of a session ID.`,
          sessionId: sessionId
        },
        { status: 404 }
      );
    }

    // Get userId from session (no authentication check for now)
    const userId = session.userId;

    // Check if review already exists
    const existingReview = await DatabaseService.getReviewSession(sessionId);
    if (existingReview) {
      console.log('Review already exists, returning existing review');
      return NextResponse.json(existingReview);
    }

    // Prepare session data for AI analysis (matching PracticeSessionData interface)
    const sessionData = {
      id: session.id,
      userId: session.userId,
      problem: {
        title: session.problem.title,
        difficulty: session.problem.difficulty,
        patterns: Array.isArray(session.problem.patterns) ? session.problem.patterns : [],
        description: session.problem.description
      },
      exploreData: session.exploreData,
      planningData: session.planningData,
      implData: session.implData,
      reflectionData: session.reflectionData,
      phaseTimings: session.phaseTimings || {},
      implementationHistory: extractImplementationHistory(session.implData)
    };

    console.log('Session data prepared for AI analysis:', JSON.stringify(sessionData, null, 2));

    // Generate AI analysis
    const aiReviewEngine = new AIReviewEngine();
    let analysis;
    
    try {
      analysis = await aiReviewEngine.analyzeSession(sessionData);
      console.log('AI analysis completed:', analysis);
    } catch (aiError) {
      console.error('AI analysis failed, using fallback:', aiError);
      // Fallback analysis if AI fails
      analysis = {
        timingAnalysis: {
          phaseTimes: calculatePhaseTimings(session),
          efficiencyScore: 0.7,
          timeDistribution: { explore: 25, planning: 35, implementation: 40 },
          insights: ['Session completed successfully']
        },
        mistakeAnalysis: {
          implementationErrors: [],
          patternMisconceptions: [],
          commonMistakes: []
        },
        patternAnalysis: {
          strengths: [],
          weaknesses: [],
          accuracy: 0.8
        },
        recommendations: {
          immediate: ['Continue practicing similar problems'],
          longTerm: ['Focus on pattern recognition']
        },
        overallScore: 0.75,
        readinessImpact: 0.05
      };
    }

    // Create review session (with error handling for duplicates)
    let reviewSession;
    try {
      reviewSession = await DatabaseService.createReviewSession({
        sessionId: session.id,
        userId: session.userId,
        phaseTimings: analysis.timingAnalysis.phaseTimes,
        totalTime: Object.values(analysis.timingAnalysis.phaseTimes).reduce((a, b) => a + b, 0),
        aiAnalysis: analysis,
        strengths: analysis.patternAnalysis.strengths.map(s => s.pattern),
        weaknesses: analysis.patternAnalysis.weaknesses.map(w => w.pattern),
        recommendations: analysis.recommendations.immediate,
        patternAccuracy: analysis.patternAnalysis.accuracy,
        implementationScore: analysis.overallScore,
        overallScore: analysis.overallScore
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('sessionId')) {
        // Review session already exists, fetch it instead
        console.log('Review session already exists, fetching existing one');
        reviewSession = await DatabaseService.getReviewSession(session.id);
        if (!reviewSession) {
          throw new Error('Failed to fetch existing review session');
        }
      } else {
        throw error;
      }
    }

    // Update user analytics
    await updateUserAnalytics(session.userId, analysis);

    // Fetch the complete review session with nested data
    const completeReview = await DatabaseService.getReviewSession(session.id);
    console.log('Complete review session created:', completeReview);

    return NextResponse.json(completeReview);

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const reviewSession = await DatabaseService.getReviewSession(sessionId);
    
    if (!reviewSession) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // No authentication check for now

    return NextResponse.json(reviewSession);

  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculatePhaseTimings(session: any) {
  // Mock implementation - in real scenario, this would calculate actual timings
  return {
    explore: 300, // 5 minutes
    planning: 420, // 7 minutes
    implementation: 600, // 10 minutes
    reflection: 180 // 3 minutes
  };
}

function extractImplementationHistory(implData: any): Array<any> {
  // Extract implementation attempts from the impl data
  if (!implData) return [];
  
  // If implData has the code, create a single attempt entry
  if (implData.sourceCode) {
    return [{
      attempt: 1,
      code: implData.sourceCode,
      errors: [],
      testResults: null
    }];
  }
  
  return [];
}

function calculateImplementationScore(session: any) {
  // Mock implementation - in real scenario, this would calculate actual score
  return 0.8;
}

async function updateUserAnalytics(userId: string, analysis: any) {
  try {
    const existingAnalytics = await DatabaseService.getUserAnalytics(userId);
    
    const updatedAnalytics = {
      patternScores: existingAnalytics?.patternScores ? { ...existingAnalytics.patternScores as Record<string, number> } : {},
      patternAttempts: existingAnalytics?.patternAttempts ? { ...existingAnalytics.patternAttempts as Record<string, number> } : {},
      avgPhaseTimes: existingAnalytics?.avgPhaseTimes ? { ...existingAnalytics.avgPhaseTimes as Record<string, number> } : {},
      speedImprovement: existingAnalytics?.speedImprovement ? { ...existingAnalytics.speedImprovement as Record<string, number> } : {},
      commonMistakes: existingAnalytics?.commonMistakes ? [...(existingAnalytics.commonMistakes as string[])] : [],
      improvementAreas: existingAnalytics?.improvementAreas ? [...(existingAnalytics.improvementAreas as string[])] : [],
      totalSessions: (existingAnalytics?.totalSessions || 0) + 1,
      avgSessionScore: existingAnalytics?.avgSessionScore || 0,
      readinessScore: (existingAnalytics?.readinessScore || 0) + analysis.readinessImpact,
      lastUpdated: new Date()
    };

    await DatabaseService.createOrUpdateUserAnalytics(userId, updatedAnalytics);
  } catch (error) {
    console.error('Error updating user analytics:', error);
  }
}