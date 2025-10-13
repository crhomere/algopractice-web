export type Phase = "explore" | "planning" | "implementation" | "reflection" | "review";

export function PhaseStepper({ phase }: { phase: Phase }) {
  const steps: Phase[] = ["explore","planning","implementation","reflection","review"];
  return (
    <div className="flex items-center gap-2 text-sm">
      {steps.map((p, i) => (
        <div key={p} className={`flex items-center gap-2 ${p === phase ? 'font-bold text-blue-500' : 'text-gray-500'}`}>
          <span className="rounded-full w-6 h-6 flex items-center justify-center border border-gray-300">{i+1}</span>
          <span className="capitalize">{p}</span>
          {i<steps.length-1 && <span className="text-gray-300">→</span>}
        </div>
      ))}
    </div>
  );
}
