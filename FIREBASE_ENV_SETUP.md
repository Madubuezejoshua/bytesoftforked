# Firebase Functions Environment Configuration

## Quick Setup

The LiveKit token generation endpoint requires two environment variables to be configured in Firebase Functions.

## Method 1: Firebase CLI (Recommended)

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Authenticated with Firebase: `firebase login`

### Set Environment Variables

```bash
# Navigate to project directory
cd /path/to/project

# Set LiveKit API Key
firebase functions:config:set livekit.api_key="APIWHa8V8pgLqVq"

# Set LiveKit API Secret
firebase functions:config:set livekit.api_secret="a2dEe4nicaLScQCY6emi76ZrWyNIeZ3ae7OHaVsJeeXN"

# View current configuration
firebase functions:config:get

# Deploy with new environment variables
firebase deploy --only functions
```

## Method 2: Firebase Console

### Steps

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project

2. **Navigate to Functions**
   - Click "Build" → "Functions" in the left menu
   - Click "Runtime settings" at the top of the functions list

3. **Add Environment Variables**
   - Click "Add variable"
   - Add first variable:
     - **Key**: `LIVEKIT_API_KEY`
     - **Value**: `APIWHa8V8pgLqVq`
   - Click "Add variable" again
   - Add second variable:
     - **Key**: `LIVEKIT_API_SECRET`
     - **Value**: `a2dEe4nicaLScQCY6emi76ZrWyNIeZ3ae7OHaVsJeeXN`

4. **Save Changes**
   - The console will automatically deploy the functions with the new environment variables

5. **Verify Configuration**
   - Run: `firebase functions:config:get`
   - You should see:
     ```json
     {
       "livekit": {
         "api_key": "APIWHa8V8pgLqVq",
         "api_secret": "a2dEe4nicaLScQCY6emi76ZrWyNIeZ3ae7OHaVsJeeXN"
       }
     }
     ```

## Method 3: Environment File (.env.local)

For local development with Firebase Functions emulator:

### Create `.env.local` in the project root

```
LIVEKIT_API_KEY=APIWHa8V8pgLqVq
LIVEKIT_API_SECRET=a2dEe4nicaLScQCY6emi76ZrWyNIeZ3ae7OHaVsJeeXN
VITE_LIVEKIT_URL=wss://study-dxgpruu6.livekit.cloud
VITE_FIREBASE_FUNCTIONS_URL=http://localhost:5001/lamp-study/us-central1/token
```

### Run Local Emulator

```bash
# Start Firebase Functions emulator
firebase emulators:start --only functions

# In another terminal, run your frontend
npm run dev
```

## Verify Setup

### Option 1: Test via Firebase Console

1. Go to Functions in Firebase Console
2. Select the `token` function
3. Click "Testing" tab
4. In the "Request body" field, enter:
   ```json
   {
     "identity": "test-user",
     "roomName": "test-room",
     "role": "participant"
   }
   ```
5. Click "Test the function"
6. If configured correctly, you should receive a token

### Option 2: Test via curl

First, get a Firebase ID token:

```bash
# Using Firebase CLI
firebase auth:export tokens.json --project=lamp-study

# Or from your app - sign in and capture the token
```

Then test the endpoint:

```bash
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -d '{
    "identity": "test-user",
    "roomName": "test-room",
    "role": "participant"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Troubleshooting

### Error: "LiveKit credentials not configured"

**Problem**: Token endpoint returns this error

**Solution**:
1. Check environment variables are set:
   ```bash
   firebase functions:config:get
   ```
2. Verify both `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are present
3. Redeploy functions:
   ```bash
   firebase deploy --only functions
   ```

### Error: "Invalid credentials"

**Problem**: Token generation fails with invalid credentials

**Solution**:
1. Verify API Key and Secret are correct:
   - API Key: `APIWHa8V8pgLqVq`
   - API Secret: `a2dEe4nicaLScQCY6emi76ZrWyNIeZ3ae7OHaVsJeeXN`
2. Check for accidental whitespace in values
3. Redeploy to apply changes

### Error: "Unauthorized" when testing

**Problem**: 401 error from token endpoint

**Solution**:
1. Ensure you're passing a valid Firebase ID token
2. Token must be from an authenticated user
3. Check Authorization header format: `Bearer <token>`

## Local Development Workflow

```bash
# 1. Start Firebase emulator
firebase emulators:start --only functions

# 2. In another terminal, start dev server
npm run dev

# 3. Log in to the app
# 4. Navigate to a meeting
# 5. The app will automatically request a token from the local emulator
# 6. View logs in the emulator terminal
```

## Production Deployment

```bash
# 1. Set production environment variables
firebase functions:config:set \
  livekit.api_key="APIWHa8V8pgLqVq" \
  livekit.api_secret="a2dEe4nicaLScQCY6emi76ZrWyNIeZ3ae7OHaVsJeeXN"

# 2. Deploy functions
firebase deploy --only functions

# 3. Deploy frontend
npm run build
firebase deploy --only hosting

# 4. Monitor logs
firebase functions:log --follow
```

## Security Notes

- **Never commit credentials** to version control
- **Use Firebase Console** for managing sensitive values
- **Use environment files** (.env.local) only for local development
- **Rotate credentials** periodically
- **Monitor function logs** for suspicious activity

## Reference

- Firebase Functions Config: https://firebase.google.com/docs/functions/config/secrets
- LiveKit Documentation: https://docs.livekit.io
- Firebase CLI Reference: https://firebase.google.com/docs/cli
