import { db } from './firebase';
import { collection, query, where, getDocs, getDoc, doc, addDoc } from 'firebase/firestore';

export const generateUniqueUserId = async (role: 'teacher' | 'coordinator'): Promise<string> => {
  const length = role === 'teacher' ? 6 : 8;
  let isUnique = false;
  let userId = '';

  while (!isUnique) {
    userId = generateRandomId(length);
    const usedIdsRef = collection(db, 'usedCustomIds');
    const q = query(usedIdsRef, where('customId', '==', userId));
    const querySnapshot = await getDocs(q);
    isUnique = querySnapshot.empty;
  }

  return userId;
};

const isEmail = (input: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

export const findUserByEmail = async (email: string): Promise<{ uid: string; email: string; data: any } | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('User not found with email:', email);
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    return {
      uid: userDoc.id,
      email: userData.email,
      data: userData
    };
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

export const findUserByCustomId = async (customUserId: string): Promise<{ uid: string; email: string; data: any } | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('customUserId', '==', customUserId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('User not found with custom ID:', customUserId);
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    return {
      uid: userDoc.id,
      email: userData.email,
      data: userData
    };
  } catch (error) {
    console.error('Error finding user by custom ID:', error);
    return null;
  }
};

export const findUserByIdOrEmail = async (identifier: string): Promise<{ uid: string; email: string; data: any } | null> => {
  try {
    if (isEmail(identifier)) {
      console.log('Searching for user by email:', identifier);
      return await findUserByEmail(identifier);
    } else {
      console.log('Searching for user by custom ID:', identifier);
      return await findUserByCustomId(identifier);
    }
  } catch (error) {
    console.error('Error finding user by identifier:', error);
    return null;
  }
};

export const findUserByFirebaseUid = async (uid: string): Promise<any | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return null;
    }
    return userDoc.data();
  } catch (error) {
    console.error('Error finding user by Firebase UID:', error);
    return null;
  }
};

export const recordCustomIdAsUsed = async (customId: string, userId: string, role: 'teacher' | 'coordinator'): Promise<void> => {
  try {
    await addDoc(collection(db, 'usedCustomIds'), {
      customId,
      userId,
      role,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error recording custom ID as used:', error);
    throw error;
  }
};

const generateRandomId = (length: number): string => {
  let result = '';
  const characters = '0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
