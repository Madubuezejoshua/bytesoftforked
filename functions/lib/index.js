"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeetings = exports.createMeeting = exports.token = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const livekit_server_sdk_1 = require("livekit-server-sdk");
admin.initializeApp();
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    functions.logger.warn('LiveKit credentials not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET environment variables.');
}
const validateAuthToken = async (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            return null;
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return { uid: decodedToken.uid };
    }
    catch (error) {
        functions.logger.warn('Token verification failed:', error);
        return null;
    }
};
exports.token = functions.https.onRequest(async (req, res) => {
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
        if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
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
        const at = new livekit_server_sdk_1.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
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
        res.status(200).json({ token: generatedToken });
    }
    catch (error) {
        functions.logger.error('Error generating token:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});
exports.createMeeting = functions.https.onRequest(async (req, res) => {
    var _a;
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
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists || ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'teacher') {
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
    }
    catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
});
exports.getMeetings = functions.https.onRequest(async (req, res) => {
    var _a;
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
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
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
        const userRole = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role;
        let meetingsQuery;
        if (userRole === 'coordinator' || userRole === 'admin') {
            meetingsQuery = admin.firestore().collection('meetings').orderBy('scheduledTime', 'desc');
        }
        else if (userRole === 'teacher') {
            meetingsQuery = admin.firestore().collection('meetings')
                .where('teacherId', '==', userId)
                .orderBy('scheduledTime', 'desc');
        }
        else {
            meetingsQuery = admin.firestore().collection('meetings')
                .where('participants', 'array-contains', userId)
                .orderBy('scheduledTime', 'desc');
        }
        const snapshot = await meetingsQuery.get();
        const meetings = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({ meetings });
    }
    catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});
//# sourceMappingURL=index.js.map