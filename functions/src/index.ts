import * as dotenv from 'dotenv';
import * as path from 'path';

// manually load .env from functions/ folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { AccessToken } from 'livekit-server-sdk';
import axios from 'axios';

admin.initializeApp();

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';
const LIVEKIT_URL = process.env.LIVEKIT_URL || '';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
  functions.logger.error('LiveKit credentials not configured. Please set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL environment variables.');
}

const validateAuthToken = async (req: functions.https.Request): Promise<{ uid: string } | null> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return { uid: decodedToken.uid };
  } catch (error) {
    functions.logger.warn('Token verification failed:', error);
    return null;
  }
};

export const token = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      res.status(500).json({ error: 'LiveKit credentials not configured' });
      return;
    }

    const authResult = await validateAuthToken(req);
    if (!authResult) {
      res.status(401).json({ error: 'Unauthorized. Please provide a valid authentication token.' });
      return;
    }

    const { identity, roomName, role } = req.body;

    if (!identity || !roomName) {
      res.status(400).json({ error: 'Missing required fields: identity and roomName' });
      return;
    }

    if (typeof identity !== 'string' || typeof roomName !== 'string') {
      res.status(400).json({ error: 'Invalid field types. identity and roomName must be strings.' });
      return;
    }

    if (identity.length > 256 || roomName.length > 256) {
      res.status(400).json({ error: 'Fields too long. Maximum length is 256 characters.' });
      return;
    }

    const roleValue = role === 'viewer' || role === 'observer' ? 'viewer' : 'participant';

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      ttl: '2h',
      metadata: JSON.stringify({ userId: authResult.uid }),
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: roleValue !== 'viewer',
      canSubscribe: true,
      canPublishData: roleValue !== 'viewer',
    });

    const generatedToken = await at.toJwt();

    functions.logger.info(`Token generated for user ${authResult.uid} in room ${roomName}`);
    res.status(200).json({ token: generatedToken, url: LIVEKIT_URL });
  } catch (error) {
    functions.logger.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

export const createMeeting = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'teacher') {
      res.status(403).json({ error: 'Only teachers can create meetings' });
      return;
    }

    const { title, roomName, scheduledTime, participants } = req.body;

    if (!title || !roomName || !scheduledTime) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const meetingRef = await admin.firestore().collection('meetings').add({
      title,
      roomName,
      scheduledTime: admin.firestore.Timestamp.fromDate(new Date(scheduledTime)),
      teacherId: userId,
      participants: participants || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: meetingRef.id, message: 'Meeting created successfully' });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

export const getMeetings = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userRole = userDoc.data()?.role;
    let meetingsQuery;

    if (userRole === 'coordinator' || userRole === 'admin') {
      meetingsQuery = admin.firestore().collection('meetings').orderBy('scheduledTime', 'desc');
    } else if (userRole === 'teacher') {
      meetingsQuery = admin.firestore().collection('meetings')
        .where('teacherId', '==', userId)
        .orderBy('scheduledTime', 'desc');
    } else {
      meetingsQuery = admin.firestore().collection('meetings')
        .where('participants', 'array-contains', userId)
        .orderBy('scheduledTime', 'desc');
    }

    const snapshot = await meetingsQuery.get();
    const meetings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

export const verifyPaystackPayment = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    if (!PAYSTACK_SECRET_KEY) {
      functions.logger.error('Paystack secret key not configured');
      res.status(500).json({ error: 'Payment verification service unavailable' });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const userId = decodedToken.uid;
    const { reference, courseId, amount } = req.body;

    if (!reference || !courseId || !amount) {
      res.status(400).json({ error: 'Missing required fields: reference, courseId, amount' });
      return;
    }

    if (typeof reference !== 'string' || typeof courseId !== 'string' || typeof amount !== 'number') {
      res.status(400).json({ error: 'Invalid field types' });
      return;
    }

    try {
      const paystackResponse = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const { status, data } = paystackResponse.data;

      if (!status || data.status !== 'success') {
        functions.logger.warn(`Payment verification failed for reference ${reference}`);
        res.status(400).json({ verified: false, error: 'Payment not successful' });
        return;
      }

      if (data.amount !== amount * 100) {
        functions.logger.warn(`Amount mismatch for reference ${reference}`);
        res.status(400).json({ verified: false, error: 'Amount mismatch' });
        return;
      }

      const courseDoc = await admin.firestore().collection('courses').doc(courseId).get();
      if (!courseDoc.exists) {
        res.status(404).json({ verified: false, error: 'Course not found' });
        return;
      }

      const paymentRef = await admin.firestore().collection('payments').add({
        userId,
        courseId,
        amount,
        currency: 'NGN',
        reference,
        status: 'completed',
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          courseTitle: courseDoc.data()?.title || 'Unknown',
          userName: decodedToken.name || decodedToken.email || 'User',
        },
      });

      await admin.firestore().collection('users').doc(userId).set({
        isVerified: true,
        verified: true,
        verificationType: 'paystack',
        purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      functions.logger.info(`Payment verified for user ${userId} - Reference: ${reference}`);
      functions.logger.info(`User ${userId} marked as verified after payment with verificationType: paystack`);

      res.status(200).json({
        verified: true,
        paymentId: paymentRef.id,
        message: 'Payment verified successfully',
      });
    } catch (paystackError) {
      if (axios.isAxiosError(paystackError)) {
        functions.logger.error(`Paystack API error: ${paystackError.message}`, paystackError.response?.data);
        res.status(500).json({ verified: false, error: 'Payment gateway error' });
      } else {
        throw paystackError;
      }
    }
  } catch (error) {
    functions.logger.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});
