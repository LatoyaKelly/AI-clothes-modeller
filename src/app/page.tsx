'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ImageUploader } from '@/components/ImageUploader';
import { TryOnButton } from '@/components/TryOnButton';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { ResultDisplay } from '@/components/ResultDisplay';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTryOn } from '@/hooks/useTryOn';
import type { ImageFile } from '@/types';

export default function Home() {
  const [personImage, setPersonImage] = useState<ImageFile | null>(null);
  const [garmentImage, setGarmentImage] = useState<ImageFile | null>(null);
  const { state, tryOn, cancel, reset } = useTryOn();

  const isProcessing = state.status === 'connecting' || state.status === 'queued' || state.status === 'processing';
  const canSubmit = personImage !== null && garmentImage !== null && !isProcessing;

  const handleTryOn = useCallback(() => {
    if (!personImage || !garmentImage) return;
    tryOn(personImage.file, garmentImage.file);
  }, [personImage, garmentImage, tryOn]);

  const handleReset = useCallback(() => {
    reset();
    setPersonImage(null);
    setGarmentImage(null);
  }, [reset]);

  const handleRetry = useCallback(() => {
    if (personImage && garmentImage) {
      tryOn(personImage.file, garmentImage.file);
    }
  }, [personImage, garmentImage, tryOn]);

  return (
    <main className="max-w-5xl mx-auto px-4 pb-12">
      <Header />

      {state.status === 'error' && state.error && (
        <div className="mb-6">
          <ErrorBanner
            message={state.error}
            onDismiss={reset}
            onRetry={handleRetry}
          />
        </div>
      )}

      {isProcessing && (
        <div className="mb-6">
          <ProgressIndicator state={state} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Person photo */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <ImageUploader
            label="Your Photo"
            description="Full body photo works best"
            value={personImage}
            onChange={setPersonImage}
            disabled={isProcessing}
          />
        </div>

        {/* Garment photo */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <ImageUploader
            label="Garment"
            description="Photo of the clothing item"
            value={garmentImage}
            onChange={setGarmentImage}
            disabled={isProcessing}
          />
        </div>

        {/* Result */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          {state.status === 'complete' && state.resultUrl ? (
            <ResultDisplay resultUrl={state.resultUrl} onReset={handleReset} />
          ) : (
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Result</h2>
              <p className="text-sm text-gray-500">Your try-on result will appear here</p>
              <div className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                <span className="text-gray-300 text-sm">No result yet</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      <div className="mt-6 max-w-xs mx-auto">
        <TryOnButton
          onClick={handleTryOn}
          onCancel={cancel}
          status={state.status}
          disabled={!canSubmit}
        />
      </div>
    </main>
  );
}
