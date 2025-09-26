"use client";
import useSWR from 'swr';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PracticeModeModal } from '@/components/PracticeModeModal';
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
  const { data } = useSWR('/api/problems', fetcher);
  const problems = data || [];
  const [showPatterns, setShowPatterns] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
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

      <PracticeModeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartPractice={handleStartPractice}
        problemTitle={selectedProblem?.title || ''}
        difficulty={selectedProblem?.difficulty || ''}
      />
    </div>
  );
}
