import { db, auth } from './firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export const courseAccessService = {
  async canAccessCourse(courseId: string, userId: string): Promise<boolean> {
    try {
      if (!userId) return false;

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return false;
      }

      const userData = userSnap.data();
      const purchasedCourses = userData?.purchasedCourses || [];

      if (purchasedCourses.includes(courseId)) {
        return true;
      }

      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', userId),
        where('courseId', '==', courseId),
        where('verified', '==', true),
        where('paymentStatus', '==', 'completed')
      );

      const snapshot = await getDocs(enrollmentsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking course access:', error);
      return false;
    }
  },

  async isEnrolledInCourse(courseId: string, userId: string): Promise<boolean> {
    try {
      if (!userId) return false;

      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', userId),
        where('courseId', '==', courseId)
      );

      const snapshot = await getDocs(enrollmentsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking course enrollment:', error);
      return false;
    }
  },

  async getCurrentUserAccess(courseId: string): Promise<{
    hasAccess: boolean;
    isEnrolled: boolean;
    verified: boolean;
    paymentStatus: string | null;
  }> {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      return {
        hasAccess: false,
        isEnrolled: false,
        verified: false,
        paymentStatus: null,
      };
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return {
          hasAccess: false,
          isEnrolled: false,
          verified: false,
          paymentStatus: null,
        };
      }

      const userData = userSnap.data();
      const purchasedCourses = userData?.purchasedCourses || [];

      if (purchasedCourses.includes(courseId)) {
        return {
          hasAccess: true,
          isEnrolled: true,
          verified: userData?.isVerified || userData?.verified || false,
          paymentStatus: 'completed',
        };
      }

      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', userId),
        where('courseId', '==', courseId)
      );

      const snapshot = await getDocs(enrollmentsQuery);

      if (snapshot.empty) {
        return {
          hasAccess: false,
          isEnrolled: false,
          verified: false,
          paymentStatus: null,
        };
      }

      const enrollment = snapshot.docs[0].data();

      return {
        hasAccess:
          enrollment.verified && enrollment.paymentStatus === 'completed',
        isEnrolled: true,
        verified: enrollment.verified || false,
        paymentStatus: enrollment.paymentStatus || null,
      };
    } catch (error) {
      console.error('Error getting user course access:', error);
      return {
        hasAccess: false,
        isEnrolled: false,
        verified: false,
        paymentStatus: null,
      };
    }
  },
};
