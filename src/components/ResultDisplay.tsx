'use client';

interface Props {
  resultUrl: string;
  onReset: () => void;
}

export function ResultDisplay({ resultUrl, onReset }: Props) {
  const handleDownload = async () => {
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tryon-result-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(resultUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-gray-800">Result</h2>
      <img
        src={resultUrl}
        alt="Virtual try-on result"
        className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200"
      />
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
        >
          Download
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-2 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
        >
          Try Another
        </button>
      </div>
    </div>
  );
}
