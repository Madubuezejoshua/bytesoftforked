# LiveKit Token Endpoint - Test Examples

This document provides copy-paste ready commands to test the LiveKit token generation endpoint.

## Prerequisites

Before testing, you need:
1. A Firebase project with the token function deployed
2. An authenticated user in your app
3. A Firebase ID token from that user

## Getting a Firebase ID Token

### Method 1: From Browser Console (Easiest)

1. Open your app and log in
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run:
   ```javascript
   firebase.auth().currentUser.getIdToken().then(token => console.log(token))
   ```
5. Copy the token from the output

### Method 2: Using Firebase CLI

```bash
# Get a test token
firebase auth:export tokens.json --project=lamp-study
```

### Method 3: From Your App Code

```javascript
const user = firebase.auth().currentUser;
const idToken = await user.getIdToken();
console.log(idToken);
```

## Test Examples

### Test 1: Basic Token Request (Participant Role)

```bash
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
  -d '{
    "identity": "john.doe@example.com",
    "roomName": "math-class-101",
    "role": "participant"
  }'
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlIiwic3ViIjoiMmM1MDY5NzQtZmMzZi00ZTYyLWE0OTAtZDI5MDY4ZmVhMjlhIiwibmFtZSI6ImFsaWNlIiwiaWF0IjoxNjc4ODk1NzI5LCJleHAiOjE2Nzg5ODIxMjksInZpZGVvIjp7InJvb20iOiJtYXRoLWNsYXNzLTEwMSIsInJvb21Kb2luIjp0cnVlLCJjYW5QdWJsaXNoIjp0cnVlLCJjYW5TdWJzY3JpYmUiOnRydWUsImNhblB1Ymxpc2hEYXRhIjp0cnVlfX0."
}
```

### Test 2: Viewer Role (Read-Only Access)

```bash
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
  -d '{
    "identity": "observer@example.com",
    "roomName": "math-class-101",
    "role": "viewer"
  }'
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Difference**: This token has `"canPublish": false` - user can only watch

### Test 3: Different User Identity

```bash
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
  -d '{
    "identity": "teacher@example.com",
    "roomName": "physics-lab-205",
    "role": "participant"
  }'
```

### Test 4: Multiple Participants in Same Room

Run this multiple times with different identities to create multiple participants:

```bash
# Participant 1
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_1" \
  -d '{
    "identity": "alice@example.com",
    "roomName": "study-group-1",
    "role": "participant"
  }'

# Participant 2
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_2" \
  -d '{
    "identity": "bob@example.com",
    "roomName": "study-group-1",
    "role": "participant"
  }'

# Participant 3 (observer)
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_3" \
  -d '{
    "identity": "charlie@example.com",
    "roomName": "study-group-1",
    "role": "viewer"
  }'
```

## Error Test Cases

### Error 1: Missing Authorization Header

```bash
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "user@example.com",
    "roomName": "test-room",
    "role": "participant"
  }'
```

**Expected Error Response** (401):
```json
{
  "error": "Unauthorized. Please provide a valid authentication token."
}
```

### Error 2: Invalid Authorization Header

```bash
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: InvalidToken" \
  -d '{
    "identity": "user@example.com",
    "roomName": "test-room",
    "role": "participant"
  }'
```

**Expected Error Response** (401):
```json
{
  "error": "Unauthorized. Please provide a valid authentication token."
}
```

### Error 3: Missing Required Fields

```bash
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
  -d '{
    "identity": "user@example.com"
  }'
```

**Expected Error Response** (400):
```json
{
  "error": "Missing required fields: identity and roomName"
}
```

### Error 4: Fields Too Long

```bash
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
  -d '{
    "identity": "very-long-string-with-more-than-256-characters-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "roomName": "test-room",
    "role": "participant"
  }'
```

**Expected Error Response** (400):
```json
{
  "error": "Fields too long. Maximum length is 256 characters."
}
```

### Error 5: Invalid Field Types

```bash
curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
  -d '{
    "identity": 12345,
    "roomName": "test-room",
    "role": "participant"
  }'
```

**Expected Error Response** (400):
```json
{
  "error": "Invalid field types. identity and roomName must be strings."
}
```

### Error 6: Wrong HTTP Method

```bash
curl -X GET https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE"
```

**Expected Error Response** (405):
```json
{
  "error": "Method not allowed"
}
```

## Local Testing (With Emulator)

### Start Emulator

```bash
firebase emulators:start --only functions
```

### Test Against Local Endpoint

Replace the URL in any command above with:
```
http://localhost:5001/lamp-study/us-central1/token
```

Example:
```bash
curl -X POST http://localhost:5001/lamp-study/us-central1/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
  -d '{
    "identity": "user@example.com",
    "roomName": "test-room",
    "role": "participant"
  }'
```

## Using the Token with LiveKit

Once you have a valid token, test connecting to LiveKit:

### JavaScript Example

```javascript
import { Room } from 'livekit-client';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

const room = new Room();
await room.connect(
  'wss://study-dxgpruu6.livekit.cloud',
  token
);

console.log('Connected! Participants:', room.remoteParticipants.size);
```

### Python Example

```python
import requests
import json

# Get ID token (you need to do this from your app)
id_token = "YOUR_ID_TOKEN_HERE"

# Request token
response = requests.post(
    'https://us-central1-lamp-study.cloudfunctions.net/token',
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {id_token}'
    },
    json={
        'identity': 'user@example.com',
        'roomName': 'test-room',
        'role': 'participant'
    }
)

if response.status_code == 200:
    token = response.json()['token']
    print(f'Got token: {token}')
else:
    print(f'Error: {response.json()}')
```

### Node.js / TypeScript Example

```typescript
interface TokenRequest {
  identity: string;
  roomName: string;
  role?: 'participant' | 'viewer';
}

async function requestLiveKitToken(
  idToken: string,
  request: TokenRequest
): Promise<string> {
  const response = await fetch(
    'https://us-central1-lamp-study.cloudfunctions.net/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  return data.token;
}

// Usage
const token = await requestLiveKitToken(
  idToken,
  {
    identity: 'user@example.com',
    roomName: 'study-room-1',
    role: 'participant'
  }
);

console.log('Token received:', token);
```

## Debugging Tips

### Check Token Content

Decode the JWT token to see what permissions it has:

```bash
# Copy the token, then visit https://jwt.io and paste it
# Or use command line:

# Get the payload part (middle section between dots)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.PAYLOAD_PART_HERE.SIGNATURE_HERE"

# Decode with jq or base64
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq .
```

### Monitor Function Logs

```bash
# Real-time logs
firebase functions:log --follow

# Filter for token function
firebase functions:log --follow | grep "token"

# Get past logs
firebase functions:log
```

### Verbose cURL Output

```bash
curl -v -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
  -d '{"identity":"user@example.com","roomName":"test","role":"participant"}'
```

## Rate Limiting Test (Manual)

Make multiple rapid requests to test behavior:

```bash
for i in {1..10}; do
  echo "Request $i:"
  curl -s -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
    -d "{\"identity\":\"user$i@example.com\",\"roomName\":\"room-$i\",\"role\":\"participant\"}" | jq .
  sleep 0.5
done
```

## Integration Test Scenario

Complete workflow test:

1. **Create two Firebase users**
   - user1@example.com
   - user2@example.com

2. **Get ID tokens for both**
   ```bash
   TOKEN1="..." # from user1
   TOKEN2="..." # from user2
   ```

3. **Create room with user1 as host**
   ```bash
   curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN1" \
     -d '{
       "identity": "user1@example.com",
       "roomName": "integration-test",
       "role": "participant"
     }' | jq -r '.token' > token1.txt
   ```

4. **User2 joins as participant**
   ```bash
   curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN2" \
     -d '{
       "identity": "user2@example.com",
       "roomName": "integration-test",
       "role": "participant"
     }' | jq -r '.token' > token2.txt
   ```

5. **Create observer token**
   ```bash
   curl -X POST https://us-central1-lamp-study.cloudfunctions.net/token \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN1" \
     -d '{
       "identity": "observer@example.com",
       "roomName": "integration-test",
       "role": "viewer"
     }' | jq -r '.token' > token_observer.txt
   ```

6. **Test all three tokens connect to LiveKit**
   - Each user connects to `wss://study-dxgpruu6.livekit.cloud` with their token
   - Verify they see each other (except observer can only watch)
   - Check LiveKit Dashboard to confirm room and participants

## Summary

Use these commands to:
- ✅ Test happy path (valid requests)
- ✅ Test error cases (invalid inputs)
- ✅ Verify role-based access
- ✅ Debug token content
- ✅ Monitor function execution
- ✅ Validate production readiness
