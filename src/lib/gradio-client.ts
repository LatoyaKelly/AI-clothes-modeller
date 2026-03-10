import { Client } from '@gradio/client';

const SPACE_ID = 'yisol/IDM-VTON';
const MAX_RETRIES = 3;
const BACKOFF_MS = [10_000, 20_000, 40_000];

let clientInstance: Client | null = null;
let connectPromise: Promise<Client> | null = null;

async function connectWithRetry(): Promise<Client> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const client = await Client.connect(SPACE_ID);
      return client;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt]));
      }
    }
  }

  throw lastError ?? new Error('Failed to connect to AI model');
}

export async function getClient(): Promise<Client> {
  if (clientInstance) return clientInstance;

  if (!connectPromise) {
    connectPromise = connectWithRetry()
      .then((client) => {
        clientInstance = client;
        connectPromise = null;
        return client;
      })
      .catch((err) => {
        connectPromise = null;
        throw err;
      });
  }

  return connectPromise;
}

export function resetClient(): void {
  clientInstance = null;
  connectPromise = null;
}
