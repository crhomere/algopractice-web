// src/components/ReviewDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface ReviewData {
  id: string;
  sessionId: string;
  phaseTimings: Record<string, number>;
  totalTime: number;
  aiAnalysis: {
    timingAnalysis: {
      efficiencyScore: number;
      insights: string[];
    };
    mistakeAnalysis: {
      implementationErrors: Array<{
        attempt: number;
        error: string;
        severity: string;
        suggestion: string;
      }>;
      commonMistakes: string[];
    };
    patternAnalysis: {
      strengths: Array<{
        pattern: string;
        evidence: string;
        confidence: number;
      }>;
      weaknesses: Array<{
        pattern: string;
        issue: string;
        recommendation: string;
      }>;
      accuracy: number;
    };
    recommendations: {
      immediate: string[];
      longTerm: string[];
    };
    overallScore: number;
  };
  strengths: any[];
  weaknesses: any[];
  recommendations: any;
  patternAccuracy: number;
  implementationScore: number;
  overallScore: number;
  createdAt: string;
  session: {
    problem: {
      title: string;
      difficulty: string;
    };
  };
}

interface ReviewDashboardProps {
  sessionId: string;
}

export function ReviewDashboard({ sessionId }: ReviewDashboardProps) {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ReviewDashboard mounted with sessionId:', sessionId);
    fetchReviewData();
  }, [sessionId]);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${sessionId}/review`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No review exists yet, create one
          await createReview();
          return;
        }
        throw new Error('Failed to fetch review data');
      }
      
      const data = await response.json();
      console.log('Review data received:', data); // Debug log
      setReviewData(data);
    } catch (err: any) {
      console.error('Error fetching review data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async () => {
    try {
      console.log('Creating review for session:', sessionId);
      const response = await fetch(`/api/sessions/${sessionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Review API response status:', response.status);
      console.log('Review API response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Review API error response:', errorText);
        throw new Error(`Failed to create review: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Review creation response:', data);
      setReviewData(data);
    } catch (err: any) {
      console.error('Error creating review:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your session with AI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={fetchReviewData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">No review data available</p>
        <button 
          onClick={createReview}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate AI Review
        </button>
      </div>
    );
  }

  if (!reviewData.session || !reviewData.session.problem) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Error: Review data is incomplete</p>
        <button 
          onClick={fetchReviewData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { aiAnalysis } = reviewData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          AI Review: {reviewData.session.problem.title}
        </h2>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <span>Difficulty: {reviewData.session.problem.difficulty}</span>
          <span>Overall Score: {Math.round(reviewData.overallScore * 100)}%</span>
          <span>Total Time: {Math.round(reviewData.totalTime / 60)} minutes</span>
        </div>
      </div>

      {/* Timing Analysis */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">⏱️ Timing Analysis</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round(reviewData.phaseTimings.explore / 60)}m
            </div>
            <div className="text-sm text-gray-400">Explore</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(reviewData.phaseTimings.planning / 60)}m
            </div>
            <div className="text-sm text-gray-400">Planning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {Math.round(reviewData.phaseTimings.implementation / 60)}m
            </div>
            <div className="text-sm text-gray-400">Implementation</div>
          </div>
        </div>
        <div className="text-sm text-gray-300">
          <p className="font-semibold mb-2">Efficiency Score: {Math.round(aiAnalysis.timingAnalysis.efficiencyScore * 100)}%</p>
          <ul className="space-y-1">
            {aiAnalysis.timingAnalysis.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pattern Analysis */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">🎯 Pattern Analysis</h3>
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Pattern Recognition Accuracy</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${aiAnalysis.patternAnalysis.accuracy * 100}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-300 mt-1">
            {Math.round(aiAnalysis.patternAnalysis.accuracy * 100)}%
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-green-400 mb-2">Strengths</h4>
            <ul className="space-y-2">
              {aiAnalysis.patternAnalysis.strengths.map((strength, i) => (
                <li key={i} className="text-sm text-gray-300">
                  <span className="font-medium">{strength.pattern}:</span> {strength.evidence}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-400 mb-2">Areas for Improvement</h4>
            <ul className="space-y-2">
              {aiAnalysis.patternAnalysis.weaknesses.map((weakness, i) => (
                <li key={i} className="text-sm text-gray-300">
                  <span className="font-medium">{weakness.pattern}:</span> {weakness.issue}
                  <div className="text-xs text-blue-400 mt-1">{weakness.recommendation}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Mistake Analysis */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">🔍 Mistake Analysis</h3>
        <div className="mb-4">
          <h4 className="font-semibold text-gray-300 mb-2">Implementation Errors</h4>
          <div className="space-y-3">
            {aiAnalysis.mistakeAnalysis.implementationErrors.map((error, i) => (
              <div key={i} className="bg-gray-700 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">Attempt {error.attempt}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    error.severity === 'high' ? 'bg-red-600' :
                    error.severity === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                  }`}>
                    {error.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-300 mb-1">{error.error}</div>
                <div className="text-xs text-blue-400">{error.suggestion}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-300 mb-2">Common Mistakes</h4>
          <ul className="space-y-1">
            {aiAnalysis.mistakeAnalysis.commonMistakes.map((mistake, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">💡 Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Immediate Actions</h4>
            <ul className="space-y-1">
              {aiAnalysis.recommendations.immediate.map((rec, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-400 mb-2">Long-term Goals</h4>
            <ul className="space-y-1">
              {aiAnalysis.recommendations.longTerm.map((rec, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}