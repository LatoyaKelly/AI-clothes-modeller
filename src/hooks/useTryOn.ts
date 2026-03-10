'use client';

import { useState, useCallback, useRef } from 'react';
import { handle_file } from '@gradio/client';
import { getClient, resetClient } from '@/lib/gradio-client';
import { resizeImage } from '@/lib/image-utils';
import type { TryOnState } from '@/types';

const TIMEOUT_MS = 120_000;

export function useTryOn() {
  const [state, setState] = useState<TryOnState>({ status: 'idle' });
  const abortRef = useRef(false);

  const tryOn = useCallback(async (personFile: File, garmentFile: File) => {
    abortRef.current = false;
    setState({ status: 'connecting' });

    try {
      // Resize images client-side
      const [personBlob, garmentBlob] = await Promise.all([
        resizeImage(personFile),
        resizeImage(garmentFile),
      ]);

      const client = await getClient();

      if (abortRef.current) return;
      setState({ status: 'queued' });

      // Build the ImageEditor format for person image
      const editorData = {
        background: handle_file(personBlob),
        layers: [],
        composite: null,
      };

      const submission = client.submit('/tryon', [
        editorData,           // Person image (ImageEditor format)
        handle_file(garmentBlob), // Garment image
        'A garment',          // Description
        true,                 // is_checked (auto-mask)
        true,                 // is_checked_crop (auto-crop)
        30,                   // denoise steps
        42,                   // seed
      ]);

      // Set up timeout
      const timeoutId = setTimeout(() => {
        abortRef.current = true;
        setState({
          status: 'error',
          error: 'Processing timed out. The AI model may be overloaded. Please try again.',
        });
      }, TIMEOUT_MS);

      for await (const event of submission) {
        if (abortRef.current) {
          clearTimeout(timeoutId);
          return;
        }

        if (event.type === 'status') {
          if (event.stage === 'pending') {
            setState({
              status: 'queued',
              queuePosition: event.queue ? event.position ?? undefined : undefined,
              eta: event.eta ?? undefined,
            });
          } else if (event.stage === 'generating') {
            setState({ status: 'processing' });
          }
        }

        if (event.type === 'data') {
          clearTimeout(timeoutId);
          const output = event.data;

          // Result is typically [imageData, seed_output]
          // imageData has a .url property
          let resultUrl: string | undefined;
          if (Array.isArray(output) && output.length > 0) {
            const first = output[0] as Record<string, unknown>;
            if (typeof first === 'string') {
              resultUrl = first;
            } else if (typeof first?.url === 'string') {
              resultUrl = first.url;
            } else if (typeof first?.path === 'string') {
              resultUrl = first.path;
            }
          }

          if (resultUrl) {
            setState({ status: 'complete', resultUrl });
          } else {
            setState({
              status: 'error',
              error: 'Unexpected response from AI model. Please try again.',
            });
          }
          return;
        }
      }
    } catch (err) {
      if (abortRef.current) return;

      const message = err instanceof Error ? err.message : String(err);
      let userMessage: string;

      if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
        userMessage = 'Connection failed. Please check your internet and try again.';
        resetClient();
      } else if (message.includes('queue') || message.includes('full')) {
        userMessage = 'The AI model queue is full. Please wait a moment and try again.';
      } else if (message.includes('sleep') || message.includes('loading')) {
        userMessage = 'The AI model is waking up. This can take 1-2 minutes. Please try again shortly.';
        resetClient();
      } else {
        userMessage = `Something went wrong: ${message}`;
        resetClient();
      }

      setState({ status: 'error', error: userMessage });
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current = true;
    setState({ status: 'idle' });
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState({ status: 'idle' });
  }, []);

  return { state, tryOn, cancel, reset };
}
