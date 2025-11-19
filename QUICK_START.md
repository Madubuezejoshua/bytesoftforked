# LiveKit Token Endpoint - Quick Start

## 30-Second Overview

Your app now has a **secure LiveKit token generation system**:
- ✅ Backend validates user identity (Firebase Auth)
- ✅ Backend generates tokens securely (never on frontend)
- ✅ Frontend includes auth headers automatically
- ✅ Role-based access (participant or viewer)
- ✅ Everything is ready to deploy

## Before First Deployment

**1 minute setup** - Set environment variables in Firebase Console:

1. Go to https://console.firebase.google.com
2. Select your project
3. Go to Build → Functions → Runtime settings
4. Add two variables:
   - Key: `LIVEKIT_API_KEY` → Value: `APIWHa8V8pgLqVq`
   - Key: `LIVEKIT_API_SECRET` → Value: `a2dEe4nicaLScQCY6emi76ZrWyNIeZ3ae7OHaVsJeeXN`
5. Save

Or use Firebase CLI:
```bash
firebase functions:config:set \
  livekit.api_key="APIWHa8V8pgLqVq" \
  livekit.api_secret="a2dEe4nicaLScQCY6emi76ZrWyNIeZ3ae7OHaVsJeeXN"
```

## Deploy

```bash
# Deploy backend
firebase deploy --only functions

# Deploy frontend
npm run build
firebase deploy --only hosting
```

## Test It

1. Sign in to your app
2. Join a meeting
3. You should connect to LiveKit automatically
4. Check logs: `firebase functions:log --follow`

## What Changed

### Backend (`/functions/src/index.ts`)
- Added Firebase authentication validation
- Added input validation
- Credentials read from environment variables
- Returns meaningful error messages

### Frontend (`/src/components/meetings/MeetingRoom.tsx`)
- Added `getAuthToken()` function
- Sends Authorization header with token requests
- Better error messages

### Configuration (`/.env`)
- Added LiveKit URL
- Added token endpoint URL

## Documentation Files

| File | Purpose |
|------|---------|
| `LIVEKIT_SETUP.md` | Complete setup guide with troubleshooting |
| `FIREBASE_ENV_SETUP.md` | Environment variable configuration |
| `LIVEKIT_TEST_EXAMPLES.md` | cURL commands to test the endpoint |
| `LIVEKIT_IMPLEMENTATION_SUMMARY.md` | Technical details |

## API Endpoint

```
POST https://us-central1-lamp-study.cloudfunctions.net/token
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{
  "identity": "user@example.com",
  "roomName": "meeting-123",
  "role": "participant"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Key Features

- **Secure**: Only authenticated users can request tokens
- **Validated**: Input checked for type and length
- **Role-based**: Viewers are read-only, participants have full access
- **Logged**: All requests logged for monitoring
- **Production Ready**: Error handling, CORS, timeouts all configured

## Troubleshooting

**"Token generation endpoint not found"**
- Deploy Firebase Functions: `firebase deploy --only functions`

**"Authentication failed"**
- Ensure you're logged in to the app
- Check browser console for auth errors

**"LiveKit credentials not configured"**
- Check Firebase Console > Functions > Runtime settings
- Verify both API_KEY and API_SECRET are set

**Detailed help**: See `LIVEKIT_SETUP.md` for complete troubleshooting guide

## Next Steps

1. ✅ Set environment variables
2. ✅ Deploy Firebase Functions
3. ✅ Test from app
4. ✅ Monitor logs
5. Optional: Set up alerts for errors

---

**Need more details?** Check the full documentation files listed above.
