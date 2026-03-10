'use client';

import type { TryOnStatus } from '@/types';

interface Props {
  onClick: () => void;
  onCancel: () => void;
  status: TryOnStatus;
  disabled: boolean;
}

export function TryOnButton({ onClick, onCancel, status, disabled }: Props) {
  const isProcessing = status === 'connecting' || status === 'queued' || status === 'processing';

  if (isProcessing) {
    return (
      <button
        onClick={onCancel}
        className="w-full py-3 px-6 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
      >
        Cancel
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors"
    >
      Try It On
    </button>
  );
}
