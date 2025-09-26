import { useState } from 'react';

type PracticeModeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStartPractice: (mode: 'timed' | 'untimed' | 'strict') => void;
  problemTitle: string;
  difficulty: string;
};

export function PracticeModeModal({ 
  isOpen, 
  onClose, 
  onStartPractice, 
  problemTitle, 
  difficulty 
}: PracticeModeModalProps) {
  const [selectedMode, setSelectedMode] = useState<'timed' | 'untimed' | 'strict'>('timed');

  if (!isOpen) return null;

  const getTimeLimit = () => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '15 minutes';
      case 'medium':
        return '30 minutes';
      case 'hard':
        return '45 minutes';
      default:
        return '30 minutes';
    }
  };

  const handleStart = () => {
    onStartPractice(selectedMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Choose Practice Mode</h2>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">{problemTitle}</span> ({difficulty})
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="practiceMode"
                value="timed"
                checked={selectedMode === 'timed'}
                onChange={(e) => setSelectedMode(e.target.value as 'timed' | 'untimed' | 'strict')}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Timed Practice</div>
                <div className="text-sm text-gray-600">
                  {getTimeLimit()} total time limit, can advance early
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="practiceMode"
                value="strict"
                checked={selectedMode === 'strict'}
                onChange={(e) => setSelectedMode(e.target.value as 'timed' | 'untimed' | 'strict')}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Strict Timed Practice</div>
                <div className="text-sm text-gray-600">
                  {getTimeLimit()} total time limit, enforces phase transitions
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="practiceMode"
                value="untimed"
                checked={selectedMode === 'untimed'}
                onChange={(e) => setSelectedMode(e.target.value as 'timed' | 'untimed' | 'strict')}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Untimed Practice</div>
                <div className="text-sm text-gray-600">
                  No time pressure, focus on learning
                </div>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
