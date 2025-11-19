import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Course } from '@/types';

interface PurchasedCourse extends Course {
  purchaseDate?: string;
}

export const purchasedCoursesService = {
  async getStudentPurchasedCourses(studentId: string): Promise<PurchasedCourse[]> {
    try {
      const userRef = doc(db, 'users', studentId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return [];
      }

      const userData = userSnap.data();
      const purchasedCourseIds = userData?.purchasedCourses || [];

      if (purchasedCourseIds.length === 0) {
        return [];
      }

      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const allCourses = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];

      const purchasedCourses = allCourses.filter(course =>
        purchasedCourseIds.includes(course.id)
      );

      return purchasedCourses;
    } catch (error) {
      console.error('Error fetching student purchased courses:', error);
      return [];
    }
  },

  async getStudentPurchasedCourseIds(studentId: string): Promise<Set<string>> {
    try {
      const userRef = doc(db, 'users', studentId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return new Set();
      }

      const userData = userSnap.data();
      const purchasedCourseIds = userData?.purchasedCourses || [];

      return new Set(purchasedCourseIds);
    } catch (error) {
      console.error('Error fetching student purchased course IDs:', error);
      return new Set();
    }
  },
};
