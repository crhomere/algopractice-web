import { useEffect, useState } from 'react';

type TimeoutModalProps = {
  isOpen: boolean;
  onContinueStrict: () => void;
  onSwitchToTimed: () => void;
  phase: string;
};

export function TimeoutModal({ 
  isOpen, 
  onContinueStrict, 
  onSwitchToTimed, 
  phase 
}: TimeoutModalProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isOpen) return;

    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onContinueStrict(); // Auto-advance if no choice made
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onContinueStrict]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Time's Up!</h2>
            <p className="text-sm text-gray-600 mt-2">
              Your time for the <span className="font-medium">{phase}</span> phase has expired.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Auto-advancing in <span className="font-mono font-bold text-red-600">{countdown}</span> seconds
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onContinueStrict}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Continue to Next Phase
            </button>
            
            <button
              onClick={onSwitchToTimed}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Switch to Regular Timed Practice
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Choose an option or wait for auto-advance
          </div>
        </div>
      </div>
    </div>
  );
}
