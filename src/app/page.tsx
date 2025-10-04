"use client";
import useSWR from 'swr';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PracticeModeModal } from '@/components/PracticeModeModal';
import { CustomProblemModal } from '@/components/CustomProblemModal';
import { useAuth } from '@/lib/auth-context';
const fetcher = (url: string) => fetch(url).then(r => r.json());

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function Home() {
  const { user } = useAuth();
  const { data } = useSWR('/api/problems', fetcher);
  const { data: customProblemsData } = useSWR(
    user ? '/api/problems/custom' : null, 
    fetcher
  );
  const problems = data || [];
  const customProblems = customProblemsData || [];
  const [showPatterns, setShowPatterns] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [customProblemModalOpen, setCustomProblemModalOpen] = useState(false);
  const router = useRouter();

  const handleProblemClick = (problem: any) => {
    setSelectedProblem(problem);
    setModalOpen(true);
  };

  const handleStartPractice = (mode: 'timed' | 'untimed' | 'strict') => {
    if (selectedProblem) {
      // Navigate to workspace with mode parameter
      router.push(`/workspace/${selectedProblem.id}?mode=${mode}`);
    }
  };

  const handleCustomProblemSubmit = async (customProblem: any) => {
    try {
      // Save the custom problem to the backend (userId will be handled by auth middleware)
      const response = await fetch('/api/problems/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customProblem)
      });

      if (response.ok) {
        const savedProblem = await response.json();
        // Open the practice mode modal for the custom problem
        setSelectedProblem(savedProblem);
        setModalOpen(true);
      } else {
        console.error('Failed to save custom problem');
      }
    } catch (error) {
      console.error('Error saving custom problem:', error);
    }
  };

  const handleDeleteCustomProblem = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this custom problem? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/problems/custom?id=${problemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Refresh the custom problems list
        window.location.reload();
      } else {
        console.error('Failed to delete custom problem');
        alert('Failed to delete custom problem. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting custom problem:', error);
      alert('Error deleting custom problem. Please try again.');
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Interview Readiness</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">Readiness Meter (placeholder)</div> 
        <div className="p-4 border rounded md:col-span-2">Pattern Heatmap (placeholder)</div>                                                                   
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Problems</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCustomProblemModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Use Your Own Algorithm
            </button>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show patterns</label>
              <button
                onClick={() => setShowPatterns(!showPatterns)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showPatterns ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showPatterns ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs text-gray-500">
                {showPatterns ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((p: any) => (
            <button
              key={p.id}
              onClick={() => handleProblemClick(p)}
              className="block p-4 border rounded-lg hover:shadow-md transition-shadow bg-gray-800 hover:bg-gray-700 text-white text-left w-full"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-white line-clamp-2">{p.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(p.difficulty)}`}>
                    {p.difficulty}
                  </span>
                </div>
                
                {showPatterns && p.patterns && p.patterns.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.patterns.slice(0, 2).map((pattern: string, idx: number) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {pattern}
                      </span>
                    ))}
                    {p.patterns.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{p.patterns.length - 2} more
                      </span>
                    )}
                  </div>
                )}
                
                {p.prompt && (
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {p.prompt.substring(0, 100)}...
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Problems Section */}
      {customProblems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Your Custom Problems</h2>
            <span className="text-sm text-gray-500">{customProblems.length} problem{customProblems.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customProblems.map((p: any) => (
              <div
                key={p.id}
                className="block p-4 border rounded-lg hover:shadow-md transition-shadow bg-gray-800 hover:bg-gray-700 text-white text-left w-full"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-white line-clamp-2">{p.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(p.difficulty)}`}>
                        {p.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        Custom
                      </span>
                    </div>
                  </div>
                  
                  {p.description && (
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {p.description.substring(0, 100)}...
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      Created: {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleProblemClick(p)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Practice
                      </button>
                      <button
                        onClick={() => handleDeleteCustomProblem(p.id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PracticeModeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartPractice={handleStartPractice}
        problemTitle={selectedProblem?.title || ''}
        difficulty={selectedProblem?.difficulty || ''}
      />

      <CustomProblemModal
        isOpen={customProblemModalOpen}
        onClose={() => setCustomProblemModalOpen(false)}
        onSubmit={handleCustomProblemSubmit}
      />
    </div>
  );
}