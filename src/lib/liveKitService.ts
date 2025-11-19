import { auth } from './firebase';

interface TokenRequest {
  identity: string;
  roomName: string;
  role: 'participant' | 'viewer' | 'host';
}

interface TokenResponse {
  token: string;
  url: string;
}

const TOKEN_ENDPOINT = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'https://us-central1-lamp-study.cloudfunctions.net/token';
const ALTERNATIVE_ENDPOINT = '/api/livekit-token';
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;
const TOKEN_REQUEST_TIMEOUT = 10000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export class LiveKitService {
  private static async fetchTokenWithRetry(
    endpoint: string,
    requestBody: TokenRequest,
    idToken: string,
    retryCount = 0
  ): Promise<{ token: string; url: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TOKEN_REQUEST_TIMEOUT);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `Server error (${response.status})`;

          if (response.status === 404) {
            throw new Error('Token generation endpoint not found.');
          } else if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication failed. Please log in again.');
          } else if (response.status === 500) {
            throw new Error('Server error. Check LiveKit credentials configuration.');
          } else {
            throw new Error(errorMessage);
          }
        }

        const data = await response.json() as TokenResponse;

        if (!data.token || !data.url) {
          throw new Error('Server did not return a valid token or URL');
        }

        console.log(`Successfully obtained LiveKit token from ${endpoint}`);
        return { token: data.token, url: data.url };
      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            throw new Error('Token request timed out. Please check your internet connection.');
          }
          throw fetchError;
        }
        throw new Error('Failed to fetch token from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.warn(`Token fetch failed (attempt ${retryCount + 1}/${MAX_RETRIES}): ${errorMessage}. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
        return this.fetchTokenWithRetry(endpoint, requestBody, idToken, retryCount + 1);
      }

      throw error;
    }
  }

  static async getAccessToken(
    identity: string,
    roomName: string,
    role: 'host' | 'participant' | 'viewer' = 'participant'
  ): Promise<{ token: string; url: string }> {
    try {
      if (!auth.currentUser) {
        throw new Error('Authentication required. Please log in again.');
      }

      const idToken = await auth.currentUser.getIdToken();

      const requestBody: TokenRequest = {
        identity,
        roomName,
        role: role === 'host' ? 'participant' : role === 'viewer' ? 'viewer' : 'participant',
      };

      let lastError: Error | null = null;

      try {
        console.log(`Attempting to fetch LiveKit token for room: ${roomName}`);
        const result = await this.fetchTokenWithRetry(TOKEN_ENDPOINT, requestBody, idToken);

        if (!result.token || !result.url) {
          throw new Error('Could not connect to LiveKit. Please check your internet connection or LiveKit credentials.');
        }

        console.log(`Successfully obtained LiveKit token for room: ${roomName}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Firebase Functions endpoint failed: ${lastError.message}`);
      }

      try {
        console.log('Falling back to alternative endpoint...');
        const result = await this.fetchTokenWithRetry(ALTERNATIVE_ENDPOINT, requestBody, idToken);

        if (!result.token || !result.url) {
          throw new Error('Could not connect to LiveKit. Please check your internet connection or LiveKit credentials.');
        }

        console.log(`Successfully obtained LiveKit token from fallback endpoint for room: ${roomName}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Alternative endpoint also failed: ${lastError.message}`);
      }

      console.error(`Unable to connect to LiveKit token service for room ${roomName}`);
      throw new Error('Could not connect to LiveKit. Please check your internet connection or LiveKit credentials.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get LiveKit token:', errorMessage);
      throw error;
    }
  }

  static validateRoomName(roomName: string): boolean {
    return roomName && roomName.length > 0 && roomName.length <= 256;
  }

  static generateRoomName(prefix = 'meeting'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
