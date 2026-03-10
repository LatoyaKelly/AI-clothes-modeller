'use client';

import { useCallback, useRef, useState } from 'react';
import { validateImage, resizeImage } from '@/lib/image-utils';
import type { ImageFile } from '@/types';

interface Props {
  label: string;
  description: string;
  value: ImageFile | null;
  onChange: (img: ImageFile | null) => void;
  disabled?: boolean;
}

export function ImageUploader({ label, description, value, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    onChange({ file, previewUrl });
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile, disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    if (value?.previewUrl) URL.revokeObjectURL(value.previewUrl);
    onChange(null);
    setError(null);
  }, [value, onChange]);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-gray-800">{label}</h2>
      <p className="text-sm text-gray-500">{description}</p>

      {value ? (
        <div className="relative group">
          <img
            src={value.previewUrl}
            alt={label}
            className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200"
          />
          {!disabled && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              x
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`
            flex flex-col items-center justify-center gap-3
            w-full aspect-[3/4] rounded-lg border-2 border-dashed cursor-pointer
            transition-colors
            ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
          </svg>
          <span className="text-sm text-gray-500">
            Drop image here or click to browse
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
