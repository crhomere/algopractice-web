"use client";
import { useState } from "react";

export interface ExplorePatternData {
  id: string;
  pattern: string;
  cues: Set<string>;
  confidence: number;
  brainstorming: string;
  timeComplexity: string;
  spaceComplexity: string;
}

interface ExplorePatternProps {
  data: ExplorePatternData;
  onChange: (data: ExplorePatternData) => void;
  isActive: boolean;
  onActivate: () => void;
  onDelete: () => void;
  patternOptions: string[];
  cueOptions: string[];
}

export function ExplorePattern({ 
  data, 
  onChange, 
  isActive, 
  onActivate, 
  onDelete, 
  patternOptions, 
  cueOptions 
}: ExplorePatternProps) {
  const handleChange = (updates: Partial<ExplorePatternData>) => {
    onChange({ ...data, ...updates });
  };

  if (!isActive) {
    return (
      <div 
        className="border rounded p-4 cursor-pointer bg-black hover:bg-gray-900 transition-colors text-white"
        onClick={onActivate}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm">
            {data.pattern || "Unnamed Solution"}
          </h4>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-red-500 hover:text-red-700 text-xs"
          >
            Delete
          </button>
        </div>
        <div className="text-xs text-gray-300 space-y-1">
          <div>Confidence: {Math.round(data.confidence * 100)}%</div>
          <div>Complexity: {data.timeComplexity || "Not set"} / {data.spaceComplexity || "Not set"}</div>
          <div className="truncate">
            {data.brainstorming ? `"${data.brainstorming.substring(0, 50)}..."` : "No brainstorming notes"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded p-4 space-y-4 bg-black text-white">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm">Exploring: {data.pattern || "Select a pattern"}</h4>
        <button 
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 text-xs"
        >
          Delete Solution
        </button>
      </div>

      {/* Pattern Selection */}
      <div>
        <label className="block text-sm font-medium mb-1">Pattern</label>
        <select 
          className="border border-gray-600 bg-black text-white p-2 rounded w-full" 
          value={data.pattern} 
          onChange={(e) => handleChange({ pattern: e.target.value, cues: new Set() })}
        >
          <option value="">Select pattern</option>
          {patternOptions.map((pattern) => (
            <option key={pattern} value={pattern}>{pattern}</option>
          ))}
        </select>
      </div>

      {/* Cues */}
      {data.pattern && (
        <div>
          <label className="block text-sm font-medium mb-1">Relevant Cues</label>
          <div className="border p-2 rounded space-y-1">
            {cueOptions.map((cue) => (
              <label key={cue} className="block text-sm">
                <input 
                  type="checkbox" 
                  checked={data.cues.has(cue)} 
                  onChange={(e) => {
                    const newCues = new Set(data.cues);
                    if (e.target.checked) {
                      newCues.add(cue);
                    } else {
                      newCues.delete(cue);
                    }
                    handleChange({ cues: newCues });
                  }}
                  className="mr-2"
                /> 
                {cue}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Confidence */}
      <div>
        <label className="block text-sm">Confidence: {Math.round(data.confidence * 100)}%</label>
        <input 
          type="range" 
          min={0} 
          max={1} 
          step={0.05} 
          value={data.confidence} 
          onChange={(e) => handleChange({ confidence: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Brainstorming */}
      <div>
        <label className="block text-sm font-medium mb-1">Brainstorming & Exploration</label>
        <textarea 
          className="w-full border rounded p-2 min-h-[120px] text-sm"
          placeholder="Think through this approach: What data structures? What edge cases? How does this pattern apply?"
          value={data.brainstorming}
          onChange={(e) => handleChange({ brainstorming: e.target.value })}
        />
        <div className="text-xs text-gray-300 mt-1">
          Explore this specific pattern approach
        </div>
      </div>

      {/* Complexity */}
      <div className="grid grid-cols-2 gap-2">
        <select 
          className="border p-2 rounded bg-black text-white border-gray-700" 
          value={data.timeComplexity} 
          onChange={(e) => handleChange({ timeComplexity: e.target.value })}
        >
          <option value="">Time Complexity</option>
          <option value="O(1)">O(1) - Constant</option>
          <option value="O(log n)">O(log n) - Logarithmic</option>
          <option value="O(n)">O(n) - Linear</option>
          <option value="O(n log n)">O(n log n) - Linearithmic</option>
          <option value="O(n²)">O(n²) - Quadratic</option>
          <option value="O(n³)">O(n³) - Cubic</option>
          <option value="O(2ⁿ)">O(2ⁿ) - Exponential</option>
          <option value="O(n!)">O(n!) - Factorial</option>
        </select>
        <select 
          className="border p-2 rounded bg-black text-white border-gray-700" 
          value={data.spaceComplexity} 
          onChange={(e) => handleChange({ spaceComplexity: e.target.value })}
        >
          <option value="">Space Complexity</option>
          <option value="O(1)">O(1) - Constant</option>
          <option value="O(log n)">O(log n) - Logarithmic</option>
          <option value="O(n)">O(n) - Linear</option>
          <option value="O(n log n)">O(n log n) - Linearithmic</option>
          <option value="O(n²)">O(n²) - Quadratic</option>
          <option value="O(n³)">O(n³) - Cubic</option>
          <option value="O(2ⁿ)">O(2ⁿ) - Exponential</option>
          <option value="O(n!)">O(n!) - Factorial</option>
        </select>
      </div>
    </div>
  );
}
