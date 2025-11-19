import { db, auth } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { User, Course } from '@/types';

export interface VerifiedStudent {
  userId: string;
  email: string;
  name: string;
  purchasedCourses: string[];
  verifiedAt: string;
  verificationMethod: string;
}

export const verificationService = {
  subscribeToPaystackVerifiedStudents(
    callback: (students: VerifiedStudent[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('verificationType', '==', 'paystack'),
        where('role', '==', 'student'),
        where('isVerified', '==', true)
      );

      return onSnapshot(
        usersQuery,
        (snapshot) => {
          const students: VerifiedStudent[] = [];
          snapshot.docs.forEach((userDoc) => {
            const userData = userDoc.data() as User;
            students.push({
              userId: userDoc.id,
              email: userData.email,
              name: userData.name,
              purchasedCourses: userData.purchasedCourses || [],
              verifiedAt: userData.verifiedAt || new Date().toISOString(),
              verificationMethod: 'paystack',
            });
          });
          callback(students);
        },
        (error) => {
          console.error('Error in Paystack verified students listener:', error);
          onError?.(error as Error);
        }
      );
    } catch (error) {
      console.error('Error setting up Paystack students listener:', error);
      return () => {};
    }
  },

  async getPaystackVerifiedStudents(): Promise<VerifiedStudent[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('verificationType', '==', 'paystack'),
        where('role', '==', 'student'),
        where('isVerified', '==', true)
      );
      const snapshot = await getDocs(usersQuery);

      const students: VerifiedStudent[] = [];

      for (const userDoc of snapshot.docs) {
        const userData = userDoc.data() as User;

        students.push({
          userId: userDoc.id,
          email: userData.email,
          name: userData.name,
          purchasedCourses: userData.purchasedCourses || [],
          verifiedAt: userData.verifiedAt || new Date().toISOString(),
          verificationMethod: 'paystack',
        });
      }

      return students;
    } catch (error) {
      console.error('Error fetching Paystack verified students:', error);
      return [];
    }
  },

  subscribeToUserVerificationStatus(
    userId: string,
    callback: (status: { isVerified: boolean; verificationType?: 'manual' | 'paystack' }) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      const userRef = doc(db, 'users', userId);
      return onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data() as User;
            callback({
              isVerified: userData.isVerified || userData.verified || false,
              verificationType: userData.verificationType || undefined,
            });
          }
        },
        (error) => {
          console.error('Error in user verification status listener:', error);
          onError?.(error as Error);
        }
      );
    } catch (error) {
      console.error('Error setting up verification status listener:', error);
      return () => {};
    }
  },

  async findStudentByEmail(email: string): Promise<User | null> {
    try {
      const q = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase()),
        where('role', '==', 'student')
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const userData = snapshot.docs[0].data() as User;
      return {
        id: snapshot.docs[0].id,
        ...userData,
      };
    } catch (error) {
      console.error('Error finding student by email:', error);
      return null;
    }
  },

  async getAllCourses(): Promise<Course[]> {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  },

  async manuallyVerifyStudent(
    studentId: string,
    courseIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'Coordinator not authenticated' };
      }

      const userRef = doc(db, 'users', studentId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, error: 'Student not found' };
      }

      const userData = userSnap.data() as User;

      if (userData.verificationType === 'paystack') {
        return { success: false, error: 'Cannot modify Paystack-verified user. This student has already been verified through payment.' };
      }

      await updateDoc(userRef, {
        verificationType: 'manual',
        isVerified: true,
        verified: true,
        purchasedCourses: arrayUnion(...courseIds),
        verifiedBy: auth.currentUser.uid,
        verifiedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error manually verifying student:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify student',
      };
    }
  },

  async getStudentVerificationStatus(
    studentId: string
  ): Promise<{
    isVerified: boolean;
    verificationType?: 'manual' | 'paystack';
    purchasedCourses?: string[];
  }> {
    try {
      const userDocRef = doc(db, 'users', studentId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        return { isVerified: false };
      }

      const userData = userDocSnap.data() as User;

      return {
        isVerified: userData.isVerified || userData.verified || false,
        verificationType: userData.verificationType,
        purchasedCourses: userData.purchasedCourses || [],
      };
    } catch (error) {
      console.error('Error getting student verification status:', error);
      return { isVerified: false };
    }
  },
};
