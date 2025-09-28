import { useState } from 'react';

type CustomProblemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (problemData: any) => void;
};

export function CustomProblemModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: CustomProblemModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: ['']
  });

  const handleExampleChange = (index: number, field: string, value: string) => {
    const newExamples = [...formData.examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setFormData({ ...formData, examples: newExamples });
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '', explanation: '' }]
    });
  };

  const removeExample = (index: number) => {
    if (formData.examples.length > 1) {
      const newExamples = formData.examples.filter((_, i) => i !== index);
      setFormData({ ...formData, examples: newExamples });
    }
  };

  const handleConstraintChange = (index: number, value: string) => {
    const newConstraints = [...formData.constraints];
    newConstraints[index] = value;
    setFormData({ ...formData, constraints: newConstraints });
  };

  const addConstraint = () => {
    setFormData({
      ...formData,
      constraints: [...formData.constraints, '']
    });
  };

  const removeConstraint = (index: number) => {
    if (formData.constraints.length > 1) {
      const newConstraints = formData.constraints.filter((_, i) => i !== index);
      setFormData({ ...formData, constraints: newConstraints });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a unique ID for the custom problem
    const customProblem = {
      id: `custom-${Date.now()}`,
      slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
      title: formData.title,
      difficulty: formData.difficulty,
      patterns: [], // Will be detected by AI later
      cues: [], // Will be detected by AI later
      description: formData.description,
      examples: formData.examples.filter(ex => ex.input && ex.output),
      constraints: formData.constraints.filter(c => c.trim()),
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    onSubmit(customProblem);
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      difficulty: 'Medium',
      examples: [{ input: '', output: '', explanation: '' }],
      constraints: ['']
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Create Your Own Algorithm Problem</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-900"
              placeholder="e.g., Two Sum, Valid Parentheses"
              required
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-900"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 min-h-[120px] text-gray-900"
              placeholder="Describe the problem, what the function should do, and any important details..."
              required
            />
          </div>

          {/* Examples */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Examples</label>
              <button
                type="button"
                onClick={addExample}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Example
              </button>
            </div>
            {formData.examples.map((example, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Example {index + 1}</span>
                  {formData.examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Input</label>
                    <input
                      type="text"
                      value={example.input}
                      onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                      className="w-full border border-gray-300 rounded p-1 text-sm text-gray-900"
                      placeholder="nums = [2,7,11,15], target = 9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Output</label>
                    <input
                      type="text"
                      value={example.output}
                      onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                      className="w-full border border-gray-300 rounded p-1 text-sm text-gray-900"
                      placeholder="[0,1]"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 mb-1">Explanation (optional)</label>
                  <input
                    type="text"
                    value={example.explanation}
                    onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                    className="w-full border border-gray-300 rounded p-1 text-sm text-gray-900"
                    placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Constraints */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Constraints</label>
              <button
                type="button"
                onClick={addConstraint}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Constraint
              </button>
            </div>
            {formData.constraints.map((constraint, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={constraint}
                  onChange={(e) => handleConstraintChange(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded p-2 text-sm text-gray-900"
                  placeholder="2 <= nums.length <= 10^4"
                />
                {formData.constraints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeConstraint(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Problem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}