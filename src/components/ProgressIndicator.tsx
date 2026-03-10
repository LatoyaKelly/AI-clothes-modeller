'use client';

import type { TryOnState } from '@/types';

interface Props {
  state: TryOnState;
}

const STEPS = ['Connecting', 'In Queue', 'Processing', 'Done'] as const;

function getActiveStep(state: TryOnState): number {
  switch (state.status) {
    case 'connecting': return 0;
    case 'queued': return 1;
    case 'processing': return 2;
    case 'complete': return 3;
    default: return -1;
  }
}

export function ProgressIndicator({ state }: Props) {
  const activeStep = getActiveStep(state);
  if (activeStep < 0) return null;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i < activeStep
                  ? 'bg-blue-600 text-white'
                  : i === activeStep
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i < activeStep ? '\u2713' : i + 1}
            </div>
            <span className="text-xs text-gray-600 mt-1">{step}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Status details */}
      <div className="mt-2 text-center text-sm text-gray-600">
        {state.status === 'connecting' && 'Connecting to AI model...'}
        {state.status === 'queued' && (
          <>
            Waiting in queue
            {state.queuePosition !== undefined && ` (position ${state.queuePosition})`}
            {state.eta !== undefined && ` — ~${Math.ceil(state.eta)}s remaining`}
          </>
        )}
        {state.status === 'processing' && 'Generating your try-on result...'}
        {state.status === 'complete' && 'Done!'}
      </div>
    </div>
  );
}
