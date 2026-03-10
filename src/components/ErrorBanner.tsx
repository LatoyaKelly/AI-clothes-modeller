'use client';

interface Props {
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onDismiss, onRetry }: Props) {
  return (
    <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
      <div className="flex-1">
        <p className="text-sm text-red-800">{message}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm font-medium text-red-700 hover:text-red-900"
          >
            Retry
          </button>
        )}
        <button
          onClick={onDismiss}
          className="text-sm text-red-400 hover:text-red-600"
          aria-label="Dismiss"
        >
          x
        </button>
      </div>
    </div>
  );
}
