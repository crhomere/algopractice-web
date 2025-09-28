"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Timer } from "@/components/Timer";
import { PhaseStepper } from "@/components/PhaseStepper";
import { CodeEditor } from "@/components/CodeEditor";
import { ExplorePattern, ExplorePatternData } from "@/components/ExplorePattern";
import { TimeoutModal } from "@/components/TimeoutModal";

const MIN_SECONDS = {
	explore: 60 * 2,
	planning: 60 * 5,
	implementation: 60 * 10,
	reflection: 60 * 2,
};

// All available patterns with their associated cues
const PATTERN_CUES = {
	"Sliding Window": ["variable window", "subarray", "contiguous elements", "window size constraint"],
	"Two Pointers": ["sorted array", "opposite ends", "move pointers", "pair/triplet search"],
	"Binary Search": ["sorted array", "find target", "half elimination", "logarithmic time"],
	"Hash Map": ["frequency counting", "lookup optimization", "duplicate detection", "complement search"],
	"Dynamic Programming": ["optimal substructure", "overlapping subproblems", "memoization", "bottom-up"],
	"Graph Traversal": ["nodes and edges", "BFS/DFS", "connected components", "path finding"],
	"Tree Traversal": ["hierarchical structure", "recursive/iterative", "pre/in/post order", "tree properties"],
	"Backtracking": ["explore all possibilities", "undo decisions", "constraint satisfaction", "recursive exploration"],
	"Greedy": ["local optimum", "no backtracking", "sorting often helps", "choice at each step"],
	"Stack": ["LIFO operations", "matching brackets", "monotonic stack", "next greater element"],
	"Queue": ["FIFO operations", "BFS traversal", "level order", "sliding window max"],
	"Heap": ["priority queue", "kth largest/smallest", "merge k sorted", "top k elements"],
	"Trie": ["prefix matching", "word search", "autocomplete", "prefix tree"],
	"Union Find": ["disjoint sets", "connected components", "cycle detection", "merge operations"],
	"Sorting": ["arrange elements", "comparison-based", "in-place vs stable", "time complexity"],
	"Brute Force": ["try all possibilities", "nested loops", "exhaustive search", "simple but inefficient"]
};

type Phase = "explore"|"planning"|"implementation"|"reflection";

export default function WorkspacePage() {
	const params = useParams<{ sessionId: string }>();
	const searchParams = useSearchParams();
	const sessionIdParam = (params?.sessionId as string) || "";
	const practiceMode = searchParams.get('mode') as 'timed' | 'untimed' | 'strict' | null;

	const [phase, setPhase] = useState<Phase>("explore");
	const [sessionId, setSessionId] = useState<string>(sessionIdParam);
	const [problem, setProblem] = useState<any>(null);
	const [explorePatterns, setExplorePatterns] = useState<ExplorePatternData[]>([
		{
			id: "1",
			pattern: "",
			cues: new Set<string>(),
			confidence: 0.5,
			brainstorming: "",
			timeComplexity: "",
			spaceComplexity: ""
		}
	]);
	const [activePatternId, setActivePatternId] = useState<string>("1");
	const [planning, setPlanning] = useState({ pseudocode: "", time: "", space: "", edgeCases: new Set<string>() });
	const [implCode, setImplCode] = useState<string>("function solve() {\n  // your code\n}\n");
	const [notes, setNotes] = useState<string>("");
	const [phaseStart, setPhaseStart] = useState<number>(Date.now());
	const [testResults, setTestResults] = useState<any>(null);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [timeoutModalOpen, setTimeoutModalOpen] = useState<boolean>(false);
	const [timerExpired, setTimerExpired] = useState<boolean>(false);
	const [exploreFeedback, setExploreFeedback] = useState<any[]>([]);
	const [isCheckingAccuracy, setIsCheckingAccuracy] = useState<boolean>(false);
	const [planningFeedback, setPlanningFeedback] = useState<any>(null);
	const [isCheckingPlanning, setIsCheckingPlanning] = useState<boolean>(false);
	const [implementationFeedback, setImplementationFeedback] = useState<any>(null);
	const [isCheckingImplementation, setIsCheckingImplementation] = useState<boolean>(false);
	const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
	const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
	const [runMode, setRunMode] = useState<'run' | 'test'>('run');

	useEffect(() => {
		(async () => {
			if (sessionIdParam) {
				const res = await fetch(`/api/problems/${sessionIdParam}`);
				if (res.ok) setProblem(await res.json());
			}
			if (!sessionId) {
				const sres = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: sessionIdParam || undefined }) });
				const data = await sres.json();
				setSessionId(data.id);
			}
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionIdParam]);

	const elapsed = () => Math.floor((Date.now() - phaseStart) / 1000);
	
	const activePattern = explorePatterns.find(p => p.id === activePatternId);
	const canAdvance = useMemo(() => {
		// In strict mode, only allow advancement when timer expires or all requirements met
		if (practiceMode === 'strict' && !timerExpired) {
			return false;
		}

		// Check if required inputs are complete (timer is just a guideline)
		if (phase === 'explore') {
			return activePattern && 
				!!activePattern.pattern && 
				activePattern.cues.size > 0 && 
				!!activePattern.timeComplexity && 
				!!activePattern.spaceComplexity;
		}
		if (phase === 'planning') return planning.pseudocode.trim().length >= 30;
		if (phase === 'implementation') return implCode.trim().length > 0 && submitted;
		if (phase === 'reflection') return notes.trim().length >= 20;
		return false;
	}, [phase, activePattern, planning, implCode, notes, submitted, practiceMode, timerExpired]);

	// Helper functions for pattern management
	const addNewPattern = () => {
		const newId = (explorePatterns.length + 1).toString();
		const newPattern: ExplorePatternData = {
			id: newId,
			pattern: "",
			cues: new Set<string>(),
			confidence: 0.5,
			brainstorming: "",
			timeComplexity: "",
			spaceComplexity: ""
		};
		setExplorePatterns(prev => [...prev, newPattern]);
		setActivePatternId(newId);
	};

	const updatePattern = (id: string, updates: Partial<ExplorePatternData>) => {
		setExplorePatterns(prev => prev.map(p => 
			p.id === id ? { ...p, ...updates } : p
		));
	};

	const deletePattern = (id: string) => {
		if (explorePatterns.length <= 1) return; // Don't delete the last pattern
		setExplorePatterns(prev => prev.filter(p => p.id !== id));
		if (activePatternId === id) {
			const remaining = explorePatterns.filter(p => p.id !== id);
			setActivePatternId(remaining[0].id);
		}
	};

	const dwellMet = elapsed() >= MIN_SECONDS[phase];
	const timerWarning = !dwellMet && canAdvance;

	// Calculate timer based on difficulty and mode
	const getTimerSeconds = () => {
		if (practiceMode === 'untimed') {
			return null; // No timer for untimed mode
		}
		
		// Don't start timer until we have problem data
		if (!problem) return null;
		
		const difficulty = problem.difficulty?.toLowerCase();
		let totalMinutes = 30; // Default
		
		switch (difficulty) {
			case 'easy':
				totalMinutes = 15;
				break;
			case 'medium':
				totalMinutes = 30;
				break;
			case 'hard':
				totalMinutes = 45;
				break;
		}
		
		// Distribute time across phases: 25% explore, 35% planning, 40% implementation (reflection is untimed)
		const phaseTimeMinutes = {
			explore: Math.floor(totalMinutes * 0.25),
			planning: Math.floor(totalMinutes * 0.35),
			implementation: Math.floor(totalMinutes * 0.4),
			reflection: null // Reflection phase is untimed
		};
		
		const phaseTime = phaseTimeMinutes[phase];
		if (phaseTime === null) return null; // Reflection phase is untimed
		
		const phaseSeconds = phaseTime * 60; // Convert to seconds
		return phaseSeconds;
	};

	const timerSeconds = getTimerSeconds();

	// Handle timer expiration for strict mode
	const handleTimerExpire = () => {
		if (practiceMode === 'strict' && phase !== 'reflection') {
			setTimerExpired(true);
			setTimeoutModalOpen(true);
		}
	};

	// Handle timeout modal actions
	const handleContinueStrict = () => {
		setTimeoutModalOpen(false);
		setTimerExpired(false);
		goNext();
	};

	const handleSwitchToTimed = () => {
		setTimeoutModalOpen(false);
		setTimerExpired(false);
		// Update URL to switch to timed mode
		const url = new URL(window.location.href);
		url.searchParams.set('mode', 'timed');
		window.history.replaceState({}, '', url.toString());
		// Force reload to update practiceMode
		window.location.reload();
	};

	// Get cues for the selected pattern
	const availableCues = activePattern?.pattern ? (PATTERN_CUES[activePattern.pattern as keyof typeof PATTERN_CUES] || []) : [];

	async function persistPhase(p: Phase) {
		try {
			if (!sessionId) return;
			if (p === 'explore') {
				await fetch(`/api/sessions/${sessionId}/explore`, { 
					method: 'POST', 
					headers: { 'Content-Type': 'application/json' }, 
					body: JSON.stringify({ 
						explorePatterns: explorePatterns.map(p => ({
							...p,
							cues: Array.from(p.cues)
						}))
					}) 
				});
			} else if (p === 'planning') {
				await fetch(`/api/sessions/${sessionId}/planning`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pseudocode: planning.pseudocode, edgeCases: Array.from(planning.edgeCases) }) });
			} else if (p === 'implementation') {
				await fetch(`/api/sessions/${sessionId}/implementation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: 'javascript', sourceCode: implCode }) });
			} else if (p === 'reflection') {
				await fetch(`/api/sessions/${sessionId}/reflection`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) });
			}
		} catch (e) { console.error(e); }
	}

	async function runCode() {
		if (!problem || !implCode.trim()) return;
		
		setRunMode('run');
		setIsRunningCode(true);
		try {
			const res = await fetch('/api/judge/run', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					language: selectedLanguage,
					sourceCode: implCode,
					problemId: problem.id,
					testMode: 'run' // Just execute and show output
				})
			});
			
			if (res.ok) {
				const data = await res.json();
				console.log('Judge response:', data); // Debug log
				// Normalize the response to ensure all required fields exist
				const normalizedData = {
					...data,
					totalScore: data.totalScore || 0,
					maxScore: data.maxScore || 1,
					results: data.results || [],
					totalRuntimeMs: data.totalRuntimeMs || 0,
					passed: data.passed || 'none'
				};
				setTestResults(normalizedData);
			} else {
				console.error('Failed to run code:', await res.text());
			}
		} catch (e) {
			console.error('Error running code:', e);
		} finally {
			setIsRunningCode(false);
		}
	}

	async function runTests() {
		if (!problem || !implCode.trim()) return;
		
		setRunMode('test');
		setIsRunningCode(true);
		try {
			const res = await fetch('/api/judge/run', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					language: selectedLanguage,
					sourceCode: implCode,
					problemId: problem.id,
					testMode: 'full' // Run full test suite
				})
			});
			
			if (res.ok) {
				const data = await res.json();
				console.log('Judge response:', data); // Debug log
				// Normalize the response to ensure all required fields exist
				const normalizedData = {
					...data,
					totalScore: data.totalScore || 0,
					maxScore: data.maxScore || 1,
					results: data.results || [],
					totalRuntimeMs: data.totalRuntimeMs || 0,
					passed: data.passed || 'none'
				};
				setTestResults(normalizedData);
				setSubmitted(true); // Mark as submitted after running tests
			} else {
				console.error('Failed to run tests:', await res.text());
			}
		} catch (e) {
			console.error('Error running tests:', e);
		} finally {
			setIsRunningCode(false);
		}
	}

	async function checkImplementation() {
		if (!problem || !activePattern || !implCode.trim()) return;
		
		setIsCheckingImplementation(true);
		try {
			const res = await fetch('/api/feedback/implementation', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					problemId: problem.id,
					implementationData: {
						code: implCode,
						language: selectedLanguage
					},
					explorePattern: {
						...activePattern,
						cues: Array.from(activePattern.cues)
					},
					planningData: {
						pseudocode: planning.pseudocode,
						edgeCases: Array.from(planning.edgeCases)
					}
				})
			});
			
			if (res.ok) {
				const data = await res.json();
				setImplementationFeedback(data.feedback);
			} else {
				console.error('Failed to get implementation feedback:', await res.text());
			}
		} catch (e) {
			console.error('Error checking implementation:', e);
		} finally {
			setIsCheckingImplementation(false);
		}
	}

	async function checkAccuracy() {
		if (!problem || !activePattern) return;
		
		setIsCheckingAccuracy(true);
		try {
			const res = await fetch('/api/feedback/explore', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					problemId: problem.id,
					explorePatterns: [{
						...activePattern,
						cues: Array.from(activePattern.cues)
					}]
				})
			});
			
			if (res.ok) {
				const data = await res.json();
				setExploreFeedback(data.feedback || []);
			} else {
				console.error('Failed to get feedback:', await res.text());
			}
		} catch (e) {
			console.error('Error checking accuracy:', e);
		} finally {
			setIsCheckingAccuracy(false);
		}
	}

	async function checkPlanning() {
		if (!problem || !activePattern) return;
		
		setIsCheckingPlanning(true);
		try {
			const res = await fetch('/api/feedback/planning', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					problemId: problem.id,
					planningData: {
						pseudocode: planning.pseudocode,
						edgeCases: Array.from(planning.edgeCases)
					},
					explorePattern: {
						...activePattern,
						cues: Array.from(activePattern.cues)
					}
				})
			});
			
			if (res.ok) {
				const data = await res.json();
				setPlanningFeedback(data.feedback);
			} else {
				console.error('Failed to get planning feedback:', await res.text());
			}
		} catch (e) {
			console.error('Error checking planning:', e);
		} finally {
			setIsCheckingPlanning(false);
		}
	}

	async function goNext() {
		if (!canAdvance) return;
		if (phase === 'explore') { await persistPhase('explore'); setPhase('planning'); }
		else if (phase === 'planning') { await persistPhase('planning'); setPhase('implementation'); }
		else if (phase === 'implementation') { await persistPhase('implementation'); setPhase('reflection'); }
		else { await persistPhase('reflection'); }
		setPhaseStart(Date.now());
	}

	async function goBack() {
		if (phase === 'planning') { setPhase('explore'); }
		else if (phase === 'implementation') { setPhase('planning'); }
		else if (phase === 'reflection') { setPhase('implementation'); }
		setPhaseStart(Date.now());
	}

	return (
		<>
			<div className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<PhaseStepper phase={phase} />
				<div className="flex items-center gap-2">
					{timerSeconds !== null ? (
						<>
							<Timer seconds={timerSeconds} onExpire={handleTimerExpire} />
							<span className="text-xs text-gray-500">
								({problem?.difficulty?.toLowerCase() === 'easy' ? '15' : 
								  problem?.difficulty?.toLowerCase() === 'medium' ? '30' : 
								  problem?.difficulty?.toLowerCase() === 'hard' ? '45' : '30'} min total)
							</span>
						</>
					) : practiceMode === 'untimed' ? (
						<span className="text-sm text-gray-500">Untimed Practice</span>
					) : phase === 'reflection' ? (
						<span className="text-sm text-gray-500">Reflection Phase (Untimed)</span>
					) : (
						<span className="text-sm text-gray-500">Loading timer...</span>
					)}
					{timerWarning && practiceMode !== 'strict' && <span className="text-xs text-orange-500">(can advance early)</span>}
					{practiceMode === 'strict' && <span className="text-xs text-red-500">(strict mode - no early advance)</span>}
				</div>
			</div>

			{problem && (
				<div className="border rounded p-4 space-y-4">
					<div>
						<h2 className="text-lg font-semibold">{problem.title} <span className="text-sm text-gray-500">({problem.difficulty})</span></h2>
						<p className="text-sm text-gray-700 mt-2">{problem.prompt}</p>
					</div>
					
					{problem.examples && problem.examples.length > 0 && (
						<div>
							<h3 className="font-semibold text-sm mb-2">Examples:</h3>
							<div className="space-y-2">
								{problem.examples.map((example: any, idx: number) => (
									<div key={idx} className="bg-gray-800 p-3 rounded text-sm text-white">
										<div><strong>Input:</strong> <code className="bg-gray-700 px-1 rounded text-gray-200">{example.input}</code></div>
										<div><strong>Output:</strong> <code className="bg-gray-700 px-1 rounded text-gray-200">{example.output}</code></div>
										{example.explanation && <div><strong>Explanation:</strong> {example.explanation}</div>}
									</div>
								))}
							</div>
						</div>
					)}

					{problem.constraints && problem.constraints.length > 0 && (
						<div>
							<h3 className="font-semibold text-sm mb-2">Constraints:</h3>
							<ul className="list-disc pl-4 text-sm text-gray-600">
								{problem.constraints.map((constraint: string, idx: number) => (
									<li key={idx}>{constraint}</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}

			{phase === 'explore' && (
				<section className="space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="font-semibold">Explore Solution Approaches</h3>
						<button 
							onClick={addNewPattern}
							className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
						>
							+ Explore Another Solution
						</button>
					</div>
					
					{/* Collapsed Pattern Cards */}
					{explorePatterns.filter(p => p.id !== activePatternId).map((pattern) => (
						<ExplorePattern
							key={pattern.id}
							data={pattern}
							onChange={(updates) => updatePattern(pattern.id, updates)}
							isActive={false}
							onActivate={() => setActivePatternId(pattern.id)}
							onDelete={() => deletePattern(pattern.id)}
							patternOptions={Object.keys(PATTERN_CUES)}
							cueOptions={pattern.pattern ? (PATTERN_CUES[pattern.pattern as keyof typeof PATTERN_CUES] || []) : []}
						/>
					))}

					{/* Active Pattern */}
					{activePattern && (
						<ExplorePattern
							key={activePattern.id}
							data={activePattern}
							onChange={(updates) => updatePattern(activePattern.id, updates)}
							isActive={true}
							onActivate={() => {}}
							onDelete={() => deletePattern(activePattern.id)}
							patternOptions={Object.keys(PATTERN_CUES)}
							cueOptions={availableCues}
						/>
					)}

					{/* Feedback Display */}
					{exploreFeedback.length > 0 && (
						<div className="space-y-4">
							<h4 className="font-semibold text-green-600">AI Feedback</h4>
							<p className="text-sm text-gray-400">
								Evaluating: <span className="font-medium">{activePattern?.pattern || "Current Solution"}</span>
							</p>
							{exploreFeedback.map((feedback, idx) => (
								<div key={idx} className="border rounded p-4 bg-gray-800 text-white">
									<div className="space-y-3">
										{/* Pattern Accuracy */}
										<div className="border-l-4 border-blue-500 pl-3">
											<h5 className="font-medium text-blue-400">Pattern Accuracy</h5>
											<p className={`text-sm ${feedback.patternAccuracy.correct ? 'text-green-400' : 'text-red-400'}`}>
												{feedback.patternAccuracy.correct ? '✓ Correct' : '✗ Incorrect'}
											</p>
											<p className="text-gray-300 text-sm">{feedback.patternAccuracy.explanation}</p>
											{feedback.patternAccuracy.suggestedPattern && (
												<p className="text-yellow-400 text-sm">
													Suggested: {feedback.patternAccuracy.suggestedPattern}
												</p>
											)}
										</div>

										{/* Complexity Accuracy */}
										<div className="border-l-4 border-purple-500 pl-3">
											<h5 className="font-medium text-purple-400">Complexity Analysis</h5>
											<div className="space-y-2">
												<div>
													<p className={`text-sm ${feedback.complexityAccuracy.timeComplexity.correct ? 'text-green-400' : 'text-red-400'}`}>
														Time: {feedback.complexityAccuracy.timeComplexity.correct ? '✓' : '✗'} {feedback.complexityAccuracy.timeComplexity.explanation}
													</p>
												</div>
												<div>
													<p className={`text-sm ${feedback.complexityAccuracy.spaceComplexity.correct ? 'text-green-400' : 'text-red-400'}`}>
														Space: {feedback.complexityAccuracy.spaceComplexity.correct ? '✓' : '✗'} {feedback.complexityAccuracy.spaceComplexity.explanation}
													</p>
												</div>
												<div>
													<p className={`text-sm ${feedback.complexityAccuracy.optimality.isOptimal ? 'text-green-400' : 'text-yellow-400'}`}>
														Optimal: {feedback.complexityAccuracy.optimality.isOptimal ? '✓' : '⚠'} {feedback.complexityAccuracy.optimality.explanation}
													</p>
												</div>
											</div>
										</div>

										{/* Brainstorming Direction */}
										<div className="border-l-4 border-orange-500 pl-3">
											<h5 className="font-medium text-orange-400">Brainstorming Direction</h5>
											<p className={`text-sm ${feedback.brainstormingDirection.onTrack ? 'text-green-400' : 'text-red-400'}`}>
												{feedback.brainstormingDirection.onTrack ? '✓ On Track' : '✗ Off Track'}
											</p>
											<p className="text-gray-300 text-sm">{feedback.brainstormingDirection.explanation}</p>
											{feedback.brainstormingDirection.suggestions && feedback.brainstormingDirection.suggestions.length > 0 && (
												<div className="mt-2">
													<p className="text-yellow-400 text-sm">Suggestions:</p>
													<ul className="list-disc pl-4 text-gray-300 text-sm">
														{feedback.brainstormingDirection.suggestions.map((suggestion: string, i: number) => (
															<li key={i}>{suggestion}</li>
														))}
													</ul>
												</div>
											)}
										</div>

										{/* Overall Assessment */}
										<div className="border-l-4 border-green-500 pl-3">
											<h5 className="font-medium text-green-400">Overall Assessment</h5>
											<p className="text-lg font-semibold text-green-400">Score: {feedback.overallAssessment.score}/100</p>
											<p className="text-gray-300 text-sm">{feedback.overallAssessment.summary}</p>
											{feedback.overallAssessment.strengths.length > 0 && (
												<div className="mt-2">
													<p className="text-green-400 text-sm">Strengths:</p>
													<ul className="list-disc pl-4 text-gray-300 text-sm">
														{feedback.overallAssessment.strengths.map((strength, i) => (
															<li key={i}>{strength}</li>
														))}
													</ul>
												</div>
											)}
											{feedback.overallAssessment.improvements.length > 0 && (
												<div className="mt-2">
													<p className="text-yellow-400 text-sm">Improvements:</p>
													<ul className="list-disc pl-4 text-gray-300 text-sm">
														{feedback.overallAssessment.improvements.map((improvement, i) => (
															<li key={i}>{improvement}</li>
														))}
													</ul>
												</div>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					<div className="flex gap-2">
						<button 
							disabled={!canAdvance} 
							className={`px-3 py-2 rounded ${canAdvance?"bg-blue-600 text-white":"bg-gray-200 text-gray-500"}`} 
							onClick={goNext}
						>
							Next
						</button>
						<button 
							onClick={checkAccuracy}
							disabled={isCheckingAccuracy || !activePattern}
							className={`px-3 py-2 rounded ${
								isCheckingAccuracy || !activePattern 
									? "bg-gray-400 text-gray-600 cursor-not-allowed" 
									: "bg-green-600 text-white hover:bg-green-700"
							}`}
						>
							{isCheckingAccuracy ? "Checking..." : "Check Current Solution"}
						</button>
					</div>
				</section>
			)}

			{phase === 'planning' && (
				<section className="space-y-3">
					<h3 className="font-semibold">Planning</h3>
					<div>
						<label className="block text-sm font-medium mb-1">Pseudocode (minimum 30 characters)</label>
						<textarea className="w-full border rounded p-2 min-h-[160px]" placeholder="Write your algorithm steps here..." value={planning.pseudocode} onChange={(e)=> setPlanning(p => ({...p, pseudocode: e.target.value}))} />
						<div className="text-xs mt-1">
							<span className={planning.pseudocode.trim().length >= 30 ? "text-green-600" : "text-red-600"}>
								{planning.pseudocode.trim().length}/30 characters
							</span>
							{planning.pseudocode.trim().length >= 30 && <span className="text-green-600 ml-2">✓ Minimum reached</span>}
						</div>
					</div>
					<div className="border p-2 rounded">
						{["empty input","all negatives","large k"].map(ec => (
							<label key={ec} className="block">
								<input type="checkbox" checked={planning.edgeCases.has(ec)} onChange={(e)=> setPlanning(p => { const s=new Set(p.edgeCases); e.target.checked?s.add(ec):s.delete(ec); return {...p, edgeCases:s}; })} /> {ec}
							</label>
						))}
					</div>
					<div className="flex gap-2">
						<button 
							onClick={goBack}
							className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
						>
							← Back
						</button>
						<button 
							onClick={checkPlanning}
							disabled={isCheckingPlanning || !planning.pseudocode.trim()}
							className={`px-3 py-2 rounded ${
								isCheckingPlanning || !planning.pseudocode.trim() 
									? "bg-gray-400 text-gray-600 cursor-not-allowed" 
									: "bg-green-600 text-white hover:bg-green-700"
							}`}
						>
							{isCheckingPlanning ? "Checking..." : "Check Planning"}
						</button>
						<button 
							disabled={!canAdvance} 
							className={`px-3 py-2 rounded ${canAdvance?"bg-blue-600 text-white":"bg-gray-200 text-gray-500"}`} 
							onClick={goNext}
						>
							Next
						</button>
					</div>

					{planningFeedback && (
						<div className="space-y-4">
							<h4 className="font-semibold text-green-600">AI Planning Feedback</h4>
							<div className="border rounded p-4 bg-gray-800 text-white">
								<div className="space-y-3">
									{/* Pseudocode Quality */}
									<div className="border-l-4 border-blue-500 pl-3">
										<h5 className="font-medium text-blue-400">Pseudocode Quality</h5>
										<p className="text-lg font-semibold text-blue-400">Score: {planningFeedback.pseudocodeQuality.score}/100</p>
										<p className="text-gray-300 text-sm">{planningFeedback.pseudocodeQuality.explanation}</p>
										{planningFeedback.pseudocodeQuality.missingSteps && planningFeedback.pseudocodeQuality.missingSteps.length > 0 && (
											<div className="mt-2">
												<p className="text-yellow-400 text-sm">Missing Steps:</p>
												<ul className="list-disc pl-4 text-gray-300 text-sm">
													{planningFeedback.pseudocodeQuality.missingSteps.map((step: string, i: number) => (
														<li key={i}>{step}</li>
													))}
												</ul>
											</div>
										)}
									</div>

									{/* Edge Case Coverage */}
									<div className="border-l-4 border-purple-500 pl-3">
										<h5 className="font-medium text-purple-400">Edge Case Coverage</h5>
										<p className="text-lg font-semibold text-purple-400">Score: {planningFeedback.edgeCaseCoverage.score}/100</p>
										<p className="text-gray-300 text-sm">{planningFeedback.edgeCaseCoverage.explanation}</p>
										{planningFeedback.edgeCaseCoverage.missingCases && planningFeedback.edgeCaseCoverage.missingCases.length > 0 && (
											<div className="mt-2">
												<p className="text-yellow-400 text-sm">Missing Cases:</p>
												<ul className="list-disc pl-4 text-gray-300 text-sm">
													{planningFeedback.edgeCaseCoverage.missingCases.map((case_: string, i: number) => (
														<li key={i}>{case_}</li>
													))}
												</ul>
											</div>
										)}
									</div>

									{/* Overall Assessment */}
									<div className="border-l-4 border-green-500 pl-3">
										<h5 className="font-medium text-green-400">Overall Assessment</h5>
										<p className="text-lg font-semibold text-green-400">Score: {planningFeedback.overallAssessment.score}/100</p>
										<p className="text-gray-300 text-sm">{planningFeedback.overallAssessment.summary}</p>
										{planningFeedback.overallAssessment.strengths.length > 0 && (
											<div className="mt-2">
												<p className="text-green-400 text-sm">Strengths:</p>
												<ul className="list-disc pl-4 text-gray-300 text-sm">
													{planningFeedback.overallAssessment.strengths.map((strength: string, i: number) => (
														<li key={i}>{strength}</li>
													))}
												</ul>
											</div>
										)}
										{planningFeedback.overallAssessment.improvements.length > 0 && (
											<div className="mt-2">
												<p className="text-yellow-400 text-sm">Improvements:</p>
												<ul className="list-disc pl-4 text-gray-300 text-sm">
													{planningFeedback.overallAssessment.improvements.map((improvement: string, i: number) => (
														<li key={i}>{improvement}</li>
													))}
												</ul>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</section>
			)}

			{phase === 'implementation' && (
				<section className="space-y-3">
					<h3 className="font-semibold">Implementation</h3>
					
					{/* Language Selection */}
					<div className="flex items-center gap-3">
						<label className="text-sm font-medium">Language:</label>
						<select 
							value={selectedLanguage}
							onChange={(e) => setSelectedLanguage(e.target.value)}
							className="px-3 py-1 border rounded bg-black text-white border-gray-700"
						>
							<option value="python">Python</option>
							<option value="javascript">JavaScript</option>
							<option value="java">Java</option>
						</select>
					</div>
					
					<div className="border rounded">
						<CodeEditor 
							height="320px" 
							defaultLanguage={selectedLanguage} 
							value={implCode} 
							onChange={(val)=> setImplCode(val ?? "")} 
						/>
					</div>
					
					<div className="flex gap-2">
						<button 
							onClick={goBack}
							className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
						>
							← Back
						</button>
						<button 
							onClick={runCode}
							disabled={isRunningCode || !implCode.trim()}
							className={`px-3 py-2 rounded ${
								isRunningCode || !implCode.trim() 
									? "bg-gray-400 text-gray-600 cursor-not-allowed" 
									: "bg-green-600 text-white hover:bg-green-700"
							}`}
						>
							{isRunningCode ? "Running..." : "Run Code"}
						</button>
						<button 
							onClick={() => {
								setRunMode('test');
								setIsRunningCode(true);
								fetch('/api/judge/run', {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({
										language: selectedLanguage,
										sourceCode: implCode,
										problemId: problem.id,
										testMode: 'examples'
									})
								}).then(res => res.json()).then(data => {
									const normalizedData = {
										...data,
										totalScore: data.totalScore || 0,
										maxScore: data.maxScore || 1,
										results: data.results || [],
										totalRuntimeMs: data.totalRuntimeMs || 0,
										passed: data.passed || 'none'
									};
									setTestResults(normalizedData);
									setIsRunningCode(false);
								}).catch(e => {
									console.error('Error testing examples:', e);
									setIsRunningCode(false);
								});
							}}
							disabled={isRunningCode || !implCode.trim()}
							className={`px-3 py-2 rounded ${
								isRunningCode || !implCode.trim() 
									? "bg-gray-400 text-gray-600 cursor-not-allowed" 
									: "bg-blue-600 text-white hover:bg-blue-700"
							}`}
						>
							{isRunningCode ? "Testing..." : "Test Examples"}
						</button>
						<button 
							onClick={checkImplementation}
							disabled={isCheckingImplementation || !implCode.trim()}
							className={`px-3 py-2 rounded ${
								isCheckingImplementation || !implCode.trim() 
									? "bg-gray-400 text-gray-600 cursor-not-allowed" 
									: "bg-orange-600 text-white hover:bg-orange-700"
							}`}
						>
							{isCheckingImplementation ? "Checking..." : "Check Implementation"}
						</button>
						<button 
							className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700" 
							onClick={runTests}
							disabled={isRunningCode}
						>
							{submitted ? '✓ Submitted' : 'Submit Solution'}
						</button>
						<button 
							disabled={!canAdvance} 
							className={`px-3 py-2 rounded ${canAdvance?"bg-green-600 text-white":"bg-gray-200 text-gray-500"}`} 
							onClick={goNext}
						>
							{submitted ? 'Next' : 'Submit Required'}
						</button>
					</div>
					{testResults && (
						<div className="border rounded p-4 bg-gray-800 text-white">
							{runMode === 'run' ? (
								// Run Mode: Show Standard Output
								<div>
									<h4 className="font-semibold text-lg mb-3 text-blue-400">Standard Output</h4>
									<div className="bg-black p-3 rounded border">
										<pre className="whitespace-pre-wrap text-sm">
											{testResults.results?.[0]?.actualOutput || 'No output'}
										</pre>
									</div>
									{testResults.results?.[0]?.error && (
										<div className="mt-3 p-3 bg-red-900 border border-red-500 rounded">
											<h5 className="font-medium text-red-400 mb-1">Error:</h5>
											<pre className="text-sm text-red-300 whitespace-pre-wrap">
												{testResults.results[0].error}
											</pre>
										</div>
									)}
									<div className="mt-3 text-sm text-gray-400">
										Runtime: {testResults.results?.[0]?.runtimeMs || 0}ms
									</div>
								</div>
							) : (
								// Test Mode: Show Test Results
								<div>
									<div className="flex items-center justify-between mb-3">
										<h4 className="font-semibold text-lg">
											Test Results: 
											<span className={`ml-2 ${
												testResults.passed === 'all' ? 'text-green-400' : 
												testResults.passed === 'partial' ? 'text-yellow-400' : 
												'text-red-400'
											}`}>
												{testResults.passed === 'all' ? 'All Passed ✓' : 
												 testResults.passed === 'partial' ? 'Partial Pass' : 
												 'Failed'}
											</span>
										</h4>
										<div className="text-sm text-gray-300">
											Score: {(testResults.totalScore || 0).toFixed(1)}/{(testResults.maxScore || 1).toFixed(1)} 
											({Math.round(((testResults.totalScore || 0) / (testResults.maxScore || 1)) * 100)}%)
										</div>
									</div>
									
									<div className="space-y-2">
										{(testResults.results || []).map((r: any) => (
											<div key={r.testCaseId} className={`p-2 rounded border-l-4 ${
												r.passed ? 'bg-green-900 border-green-500' : 'bg-red-900 border-red-500'
											}`}>
												<div className="flex justify-between items-start">
													<div className="flex items-center gap-2">
														<span className="text-lg">{r.passed ? '✓' : '✗'}</span>
														<span className="font-medium">{r.testCaseId}</span>
													</div>
													<span className="text-sm text-gray-300">{r.runtimeMs}ms</span>
												</div>
												
												{r.error && (
													<div className="mt-1 text-sm text-red-300">
														Error: {r.error}
													</div>
												)}
												
												{!r.passed && r.actualOutput !== undefined && (
													<div className="mt-1 text-xs text-gray-300">
														<div>Expected: <code className="bg-gray-700 px-1 rounded">{r.expectedOutput}</code></div>
														<div>Got: <code className="bg-gray-700 px-1 rounded">{r.actualOutput}</code></div>
													</div>
												)}
											</div>
										))}
									</div>
									
									<div className="mt-3 text-sm text-gray-400">
										Total Runtime: {testResults.totalRuntimeMs}ms
									</div>
								</div>
							)}
						</div>
					)}

					{implementationFeedback && (
						<div className="space-y-4">
							<h4 className="font-semibold text-orange-600">AI Implementation Feedback</h4>
							<div className="border rounded p-4 bg-gray-800 text-white">
								<div className="space-y-3">
									{/* Code Correctness */}
									<div className="border-l-4 border-green-500 pl-3">
										<h5 className="font-medium text-green-400">Code Correctness</h5>
										<p className={`text-lg font-semibold ${implementationFeedback.codeCorrectness.correct ? 'text-green-400' : 'text-red-400'}`}>
											{implementationFeedback.codeCorrectness.correct ? '✓ Correct' : '✗ Incorrect'}
										</p>
										<p className="text-gray-300 text-sm">{implementationFeedback.codeCorrectness.explanation}</p>
										{implementationFeedback.codeCorrectness.bugs && implementationFeedback.codeCorrectness.bugs.length > 0 && (
											<div className="mt-2">
												<p className="text-red-400 text-sm">Bugs Found:</p>
												<ul className="list-disc pl-4 text-gray-300 text-sm">
													{implementationFeedback.codeCorrectness.bugs.map((bug: string, i: number) => (
														<li key={i}>{bug}</li>
													))}
												</ul>
											</div>
										)}
									</div>

									{/* Code Quality */}
									<div className="border-l-4 border-blue-500 pl-3">
										<h5 className="font-medium text-blue-400">Code Quality</h5>
										<p className="text-lg font-semibold text-blue-400">Score: {implementationFeedback.codeQuality.score}/100</p>
										<p className="text-gray-300 text-sm">{implementationFeedback.codeQuality.explanation}</p>
										{implementationFeedback.codeQuality.improvements && implementationFeedback.codeQuality.improvements.length > 0 && (
											<div className="mt-2">
												<p className="text-yellow-400 text-sm">Improvements:</p>
												<ul className="list-disc pl-4 text-gray-300 text-sm">
													{implementationFeedback.codeQuality.improvements.map((improvement: string, i: number) => (
														<li key={i}>{improvement}</li>
													))}
												</ul>
											</div>
										)}
									</div>

									{/* Efficiency */}
									<div className="border-l-4 border-purple-500 pl-3">
										<h5 className="font-medium text-purple-400">Efficiency</h5>
										<p className="text-lg font-semibold text-purple-400">Score: {implementationFeedback.efficiency.score}/100</p>
										<p className="text-gray-300 text-sm">{implementationFeedback.efficiency.explanation}</p>
										{implementationFeedback.efficiency.optimizations && implementationFeedback.efficiency.optimizations.length > 0 && (
											<div className="mt-2">
												<p className="text-yellow-400 text-sm">Optimizations:</p>
												<ul className="list-disc pl-4 text-gray-300 text-sm">
													{implementationFeedback.efficiency.optimizations.map((optimization: string, i: number) => (
														<li key={i}>{optimization}</li>
													))}
												</ul>
											</div>
										)}
									</div>

									{/* Overall Assessment */}
									<div className="border-l-4 border-orange-500 pl-3">
										<h5 className="font-medium text-orange-400">Overall Assessment</h5>
										<p className="text-lg font-semibold text-orange-400">Score: {implementationFeedback.overallAssessment.score}/100</p>
										<p className="text-gray-300 text-sm">{implementationFeedback.overallAssessment.summary}</p>
										{implementationFeedback.overallAssessment.strengths.length > 0 && (
											<div className="mt-2">
												<p className="text-green-400 text-sm">Strengths:</p>
												<ul className="list-disc pl-4 text-gray-300 text-sm">
													{implementationFeedback.overallAssessment.strengths.map((strength: string, i: number) => (
														<li key={i}>{strength}</li>
													))}
												</ul>
											</div>
										)}
										{implementationFeedback.overallAssessment.improvements.length > 0 && (
											<div className="mt-2">
												<p className="text-yellow-400 text-sm">Improvements:</p>
												<ul className="list-disc pl-4 text-gray-300 text-sm">
													{implementationFeedback.overallAssessment.improvements.map((improvement: string, i: number) => (
														<li key={i}>{improvement}</li>
													))}
												</ul>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</section>
			)}

			{phase === 'reflection' && (
				<section className="space-y-3">
					<h3 className="font-semibold">Reflection</h3>
					<textarea className="w-full border rounded p-2 min-h-[160px]" placeholder="Notes & takeaways" value={notes} onChange={(e)=> setNotes(e.target.value)} />
					<div className="flex gap-2">
						<button 
							onClick={goBack}
							className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
						>
							← Back
						</button>
						<button disabled={!canAdvance} className={`px-3 py-2 rounded ${canAdvance?"bg-green-600 text-white":"bg-gray-200 text-gray-500"}`} onClick={goNext}>Complete</button>
					</div>
				</section>
			)}
			</div>

			<TimeoutModal
				isOpen={timeoutModalOpen}
				onContinueStrict={handleContinueStrict}
				onSwitchToTimed={handleSwitchToTimed}
				phase={phase}
			/>
		</>
	);
}