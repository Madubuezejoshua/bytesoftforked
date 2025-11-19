# Meeting Setup Guide

## Issue Fixed

The meeting creation error has been resolved. The problem was that Cloud Functions were being called but weren't deployed.

## What Changed

### 1. Meeting Creation (Fixed)
- Now saves meetings directly to Firestore
- Works immediately without needing Cloud Functions
- Teachers can create and schedule meetings

### 2. Class Scheduling (Already Working)
- Schedule Class feature saves to Firestore
- No Cloud Functions needed
- Works out of the box

### 3. Meeting List (Fixed)
- Fetches meetings directly from Firestore
- Shows all scheduled meetings based on user role

## Video Meetings (Requires Cloud Functions)

The actual video meeting feature (MeetingRoom) still requires Firebase Cloud Functions to be deployed because LiveKit needs authentication tokens.

### To Enable Video Meetings:

1. Install Firebase CLI (if not already installed):
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase (if not already done):
```bash
firebase init
```
Select your project: `lamp-study`

4. Deploy Cloud Functions:
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

This will deploy three functions:
- `token` - Generates LiveKit access tokens
- `createMeeting` - Creates meetings (now optional, using Firestore directly)
- `getMeetings` - Lists meetings (now optional, using Firestore directly)

## Current Status

✅ **Working Now:**
- Create meetings
- Schedule classes
- View meetings list
- All Firestore operations

⚠️ **Requires Cloud Functions:**
- Joining video meetings
- LiveKit video/audio streaming

## Alternative: Use Jitsi Instead

If you prefer not to deploy Cloud Functions, you can replace LiveKit with Jitsi Meet, which doesn't require a server:

Simply replace the meeting link with a Jitsi URL format:
```
https://meet.jit.si/YourRoomName
```

This would require updating the MeetingRoom component to use an iframe instead of LiveKit.
