import { AccessToken } from 'livekit-server-sdk';
import { auth } from '@/lib/firebase';

interface TokenRequest {
  identity: string;
  roomName: string;
  role: 'participant' | 'viewer' | 'host';
}

const LIVEKIT_API_KEY = import.meta.env.VITE_LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = import.meta.env.VITE_LIVEKIT_API_SECRET;
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

const addCORSHeaders = (response: Response) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

const handleError = (status: number, message: string) => {
  return addCORSHeaders(
    new Response(JSON.stringify({ error: message }), { status })
  );
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return addCORSHeaders(new Response(null, { status: 200 }));
  }

  if (request.method !== 'POST') {
    return handleError(405, 'Method not allowed');
  }

  try {
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      console.error('LiveKit credentials not configured');
      return handleError(500, 'LiveKit credentials not configured. Check environment variables.');
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return handleError(401, 'Missing or invalid authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];

    let userId: string;
    try {
      const decodedToken = await auth.currentUser?.getIdTokenResult();
      if (!decodedToken) {
        return handleError(401, 'Invalid authentication token');
      }
      userId = auth.currentUser?.uid || 'unknown';
    } catch (error) {
      console.error('Token verification failed:', error);
      return handleError(401, 'Authentication failed. Please log in again.');
    }

    const body: TokenRequest = await request.json();
    const { identity, roomName, role } = body;

    if (!identity || !roomName) {
      return handleError(400, 'Missing required fields: identity and roomName');
    }

    if (typeof identity !== 'string' || typeof roomName !== 'string') {
      return handleError(400, 'Invalid field types. identity and roomName must be strings.');
    }

    if (identity.length > 256 || roomName.length > 256) {
      return handleError(400, 'Fields too long. Maximum length is 256 characters.');
    }

    const roleValue = role === 'viewer' || role === 'observer' ? 'viewer' : 'participant';

    const accessToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      ttl: '2h',
      metadata: JSON.stringify({ userId }),
    });

    accessToken.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: roleValue !== 'viewer',
      canSubscribe: true,
      canPublishData: roleValue !== 'viewer',
    });

    const token = await accessToken.toJwt();

    console.log(`LiveKit token generated for user ${userId} in room ${roomName}`);

    return addCORSHeaders(
      new Response(
        JSON.stringify({
          token,
          url: LIVEKIT_URL,
        }),
        { status: 200 }
      )
    );
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return handleError(500, `Failed to generate token: ${errorMessage}`);
  }
}
