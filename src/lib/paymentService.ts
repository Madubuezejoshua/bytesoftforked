import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { Payment, Enrollment } from '@/types';

export const paymentService = {
  async verifyPaymentWithBackend(
    reference: string,
    courseId: string,
    amount: number
  ): Promise<{ verified: boolean; paymentId: string; error?: string }> {
    if (!auth.currentUser) {
      return { verified: false, paymentId: '', error: 'Not authenticated' };
    }

    try {
      const token = await auth.currentUser.getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL}/verifyPaystackPayment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reference,
            courseId,
            amount,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return { verified: false, paymentId: '', error: error.error };
      }

      const data = await response.json();
      return {
        verified: data.verified,
        paymentId: data.paymentId,
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        verified: false,
        paymentId: '',
        error: 'Payment verification failed',
      };
    }
  },

  async createEnrollmentRecord(
    courseId: string,
    courseName: string,
    coursePrice: number,
    paymentReference: string,
    enrollmentCode: string,
    verified: boolean
  ): Promise<string> {
    if (!auth.currentUser) {
      throw new Error('Not authenticated');
    }

    try {
      const enrollmentRef = await addDoc(collection(db, 'enrollments'), {
        studentId: auth.currentUser.uid,
        studentName: auth.currentUser.displayName || 'Student',
        studentEmail: auth.currentUser.email,
        courseId,
        courseName,
        enrollmentCode,
        paymentStatus: 'completed',
        paymentReference,
        amount: coursePrice,
        enrolledAt: new Date().toISOString(),
        verifiedAt: verified ? new Date().toISOString() : null,
        verifiedBy: verified ? 'system' : null,
        verified,
        verificationMethod: verified ? 'automatic' : null,
      });

      return enrollmentRef.id;
    } catch (error) {
      console.error('Error creating enrollment:', error);
      throw error;
    }
  },

  async addStudentToCourseLists(
    userId: string,
    courseId: string,
    courseName: string
  ): Promise<void> {
    try {
      const studentDocRef = doc(
        db,
        'courses',
        courseId,
        'students',
        userId
      );
      await addDoc(
        collection(db, 'courses', courseId, 'students'),
        {
          userId,
          enrolledAt: new Date().toISOString(),
          verified: true,
        }
      );

      const enrollmentDocRef = doc(
        db,
        'users',
        userId,
        'enrollments',
        courseId
      );
      await addDoc(
        collection(db, 'users', userId, 'enrollments'),
        {
          courseId,
          courseName,
          enrolledAt: new Date().toISOString(),
          verified: true,
        }
      );
    } catch (error) {
      console.error('Error adding student to course lists:', error);
      throw error;
    }
  },

  async updateCourseEnrollmentCount(courseId: string): Promise<void> {
    try {
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        enrollmentCount: increment(1),
      });
    } catch (error) {
      console.error('Error updating course enrollment count:', error);
      throw error;
    }
  },

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    try {
      const q = query(
        collection(db, 'payments'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
    } catch (error) {
      console.error('Error fetching user payments:', error);
      return [];
    }
  },

  async getPaymentByReference(reference: string): Promise<Payment | null> {
    try {
      const q = query(
        collection(db, 'payments'),
        where('reference', '==', reference)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      } as Payment;
    } catch (error) {
      console.error('Error fetching payment:', error);
      return null;
    }
  },

  async checkEnrollmentVerificationStatus(
    studentId: string,
    courseId: string
  ): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId),
        where('courseId', '==', courseId),
        where('verified', '==', true)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking enrollment verification:', error);
      return false;
    }
  },
};
