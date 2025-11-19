# LiveKit Token Generation Setup

## Overview

This document provides comprehensive instructions for setting up and deploying the secure LiveKit token generation endpoint. The backend securely generates LiveKit access tokens for authenticated users to join meetings.

## Architecture

- **Backend**: Firebase Functions with Node.js runtime
- **Frontend**: React application that requests tokens from Firebase Functions
- **Video Platform**: LiveKit (wss://study-dxgpruu6.livekit.cloud)
- **Authentication**: Firebase Authentication

## Security Features

- Firebase ID tokens required for all token requests
- Server-side token generation (tokens never generated on frontend)
- Input validation (string types, length limits)
- Role-based access control (viewers have read-only access)
- Token metadata includes user ID for tracking
- CORS headers properly configured for cross-origin requests

## Prerequisites

1. Firebase project with Functions enabled
2. Firebase Authentication configured
3. LiveKit credentials (URL, API Key, API Secret)
4. Node.js 18+ installed locally

## Local Development Setup

### 1. Environment Variables

Add the following to your `.env` file:

```
VITE_LIVEKIT_URL=wss://study-dxgpruu6.livekit.cloud
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-lamp-study.cloudfunctions.net/token
```

These variables are used by the frontend to locate the token endpoint and LiveKit server.

### 2. Firebase Functions Environment Configuration

The Firebase Functions need access to LiveKit credentials. These should be set in Firebase Console or via Firebase CLI:

```bash
# Set environment variables for Firebase Functions
firebase functions:config:set livekit.api_key="YOUR_LIVEKIT_API_KEY" livekit.api_secret="YOUR_LIVEKIT_API_SECRET"

# Or using the Firebase Console:
# Go to Firebase Console > Project Settings > Functions > Runtime environment variables
```

**Current LiveKit Credentials** (already configured):
- API Key: `APIWHa8V8pgLqVq`
- API Secret: `a2dEe4nicaLScQCY6emi76ZrWyNIeZ3ae7OHaVsJeeXN`
- Server URL: `wss://study-dxgpruu6.livekit.cloud`

## API Endpoints

### GET Token Endpoint

**Function Name**: `token`
**URL**: `https://us-central1-lamp-study.cloudfunctions.net/token`
**Method**: `POST`

### Request

```bash
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  -d '{
    "identity": "user123",
    "roomName": "meeting-room-1",
    "role": "participant"
  }'
```

### Request Parameters

| Parameter | Type   | Required | Description                                              |
| --------- | ------ | -------- | -------------------------------------------------------- |
| identity  | string | Yes      | User identifier (max 256 chars). Usually user name/email |
| roomName  | string | Yes      | LiveKit room name (max 256 chars)                        |
| role      | string | No       | "participant" or "viewer". Defaults to "participant"    |

**Authorization Header**: Firebase ID token from authenticated user

### Response (Success - 200)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response (Error)

```json
{
  "error": "Error message describing the issue"
}
```

### Error Codes

| Status | Error                                     | Description                                  |
| ------ | ----------------------------------------- | -------------------------------------------- |
| 400    | Missing required fields                   | identity or roomName not provided            |
| 400    | Invalid field types                       | Fields must be strings                       |
| 400    | Fields too long                           | Max length is 256 characters                 |
| 401    | Unauthorized                              | No valid Firebase ID token provided          |
| 405    | Method not allowed                        | Only POST and OPTIONS methods supported      |
| 500    | LiveKit credentials not configured        | Environment variables not set                |
| 500    | Failed to generate token                  | Internal server error                        |

## Role-Based Access Control

### Participant Role

- Can publish audio/video streams
- Can subscribe to other participants' streams
- Can send data messages
- Full meeting participation

### Viewer Role

- Can subscribe to streams (watch only)
- Cannot publish or send data
- Read-only access to meetings

## Frontend Integration

The `MeetingRoom` component automatically handles token generation:

1. **Authentication Check**: Verifies user is logged in via Firebase Auth
2. **Token Request**: Calls the Firebase Functions endpoint with auth headers
3. **Room Connection**: Connects to LiveKit using the received token
4. **Error Handling**: Displays user-friendly error messages

### Usage Example

```tsx
import MeetingRoom from '@/components/meetings/MeetingRoom';

<MeetingRoom
  roomName="meeting-123"
  onLeave={() => handleLeave()}
  role="participant"
/>
```

## Deployment Steps

### 1. Deploy Firebase Functions

```bash
# Build the functions
cd functions
npm run build

# Deploy to Firebase
firebase deploy --only functions

# Check deployment
firebase functions:log
```

### 2. Configure Environment Variables

In Firebase Console:

1. Go to Project Settings > Functions
2. Set Runtime environment variables:
   - `LIVEKIT_API_KEY`: Your LiveKit API Key
   - `LIVEKIT_API_SECRET`: Your LiveKit API Secret

### 3. Deploy Frontend

```bash
# Build the React app
npm run build

# Deploy to hosting (if using Firebase Hosting)
firebase deploy --only hosting
```

## Testing

### Test Token Generation Locally

1. Set up Firebase Functions emulator:
   ```bash
   firebase emulators:start --only functions
   ```

2. Get a Firebase ID token (from your app after login)

3. Test the endpoint:
   ```bash
   curl -X POST http://localhost:5001/lamp-study/us-central1/token \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <YOUR_ID_TOKEN>" \
     -d '{
       "identity": "testuser",
       "roomName": "test-room",
       "role": "participant"
     }'
   ```

### Test Token in LiveKit

1. Use the token to connect to LiveKit:
   ```javascript
   import { Room } from 'livekit-client';

   const room = new Room();
   await room.connect(
     'wss://study-dxgpruu6.livekit.cloud',
     token
   );
   ```

2. Verify connection in LiveKit Dashboard

## Monitoring and Logging

### View Function Logs

```bash
# Real-time logs
firebase functions:log --follow

# Logs from specific function
firebase functions:log --name=token
```

### Log Entries

The endpoint logs:
- Successful token generation: `Token generated for user {uid} in room {roomName}`
- Failed authentication attempts: `Token verification failed`
- Error conditions with details

## Troubleshooting

### "LiveKit credentials not configured"

**Cause**: Environment variables not set in Firebase Functions
**Solution**: Configure `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` in Firebase Console

### "Unauthorized. Please provide a valid authentication token."

**Cause**: Missing or invalid Authorization header
**Solution**: Ensure frontend includes valid Firebase ID token in Authorization header

### "Token generation endpoint not found"

**Cause**: Firebase Functions URL is incorrect or function not deployed
**Solution**: Verify the correct function URL and ensure deployment succeeded

### "Authentication required. Please log in again."

**Cause**: User session expired
**Solution**: Refresh the page to re-authenticate

### Token validation fails in LiveKit

**Cause**: Credentials mismatch between token generation and LiveKit server
**Solution**: Verify API Key and Secret match the LiveKit account and server URL

## Security Best Practices

1. **Never expose credentials**: Keep LIVEKIT_API_SECRET in Firebase environment only
2. **Validate input**: Frontend validates, backend validates again
3. **Verify identity**: Use Firebase Auth for user verification
4. **Monitor usage**: Check logs for suspicious patterns
5. **Set token TTL**: Tokens expire after 2 hours by default
6. **Use HTTPS**: Always use secure connections
7. **Rate limiting**: Consider adding rate limiting for production

## Architecture Diagram

```
┌─────────────────────┐
│   React Frontend    │
│  (MeetingRoom.tsx)  │
└──────────┬──────────┘
           │
           │ 1. Get Firebase ID Token
           ↓
    ┌──────────────────┐
    │ Firebase Auth    │
    └──────────────────┘
           │
           │ 2. POST /token
           │    (with ID Token header)
           ↓
    ┌────────────────────────────────┐
    │  Firebase Functions (token)    │
    │  • Verify Auth Token           │
    │  • Validate Input              │
    │  • Generate LiveKit Token      │
    └────────┬───────────────────────┘
             │
             │ 3. Return Token
             ↓
    ┌──────────────────────────────────┐
    │ LiveKit SDK Connection           │
    │ connect(url, token)              │
    └────────┬─────────────────────────┘
             │
             ↓
    ┌──────────────────────────────┐
    │  LiveKit Cloud               │
    │  (wss://study-dxgpruu6...)   │
    └──────────────────────────────┘
```

## Related Files

- Backend: `/functions/src/index.ts` - Token generation logic
- Frontend: `/src/components/meetings/MeetingRoom.tsx` - Token request and room connection
- Configuration: `/.env` - Environment variables
- Firebase Config: `/firebase.json` - Firebase project settings

## Support

For issues with:
- **LiveKit Integration**: Check LiveKit documentation at https://docs.livekit.io
- **Firebase Functions**: Check Firebase documentation at https://firebase.google.com/docs/functions
- **Token Issues**: Verify credentials and check function logs

## Version History

- **v1.0** (2025-01-09): Initial secure token endpoint implementation
  - Added Firebase ID token verification
  - Implemented input validation
  - Added role-based access control
  - Created documentation
