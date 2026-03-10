export type TryOnStatus =
  | 'idle'
  | 'connecting'
  | 'queued'
  | 'processing'
  | 'complete'
  | 'error';

export interface TryOnState {
  status: TryOnStatus;
  queuePosition?: number;
  eta?: number;
  resultUrl?: string;
  error?: string;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
}
