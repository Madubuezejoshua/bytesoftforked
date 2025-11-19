import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Enrollment } from '@/types';

export const enrollmentDataService = {
  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId),
        orderBy('enrolledAt', 'desc')
      );

      const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Enrollment[];
    } catch (error) {
      console.error('Error fetching student enrollments:', error);
      return [];
    }
  },

  async getTeacherEnrollments(teacherId: string): Promise<Enrollment[]> {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('teacherId', '==', teacherId)
      );

      const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Enrollment[];
    } catch (error) {
      console.error('Error fetching teacher enrollments:', error);
      return [];
    }
  },

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('courseId', '==', courseId)
      );

      const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Enrollment[];
    } catch (error) {
      console.error('Error fetching course enrollments:', error);
      return [];
    }
  },

  async getEnrollmentById(enrollmentId: string): Promise<Enrollment | null> {
    try {
      const enrollmentRef = doc(db, 'enrollments', enrollmentId);
      const enrollmentSnap = await getDoc(enrollmentRef);
      if (!enrollmentSnap.exists()) return null;
      return {
        id: enrollmentSnap.id,
        ...enrollmentSnap.data(),
      } as Enrollment;
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      return null;
    }
  },

  async getOwnEnrollments(): Promise<Enrollment[]> {
    if (!auth.currentUser) return [];
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', auth.currentUser.uid),
        orderBy('enrolledAt', 'desc')
      );

      const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Enrollment[];
    } catch (error) {
      console.error('Error fetching own enrollments:', error);
      return [];
    }
  },

  async countStudentsInCourse(courseId: string): Promise<number> {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('courseId', '==', courseId)
      );

      const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.length;
    } catch (error) {
      console.error('Error counting students in course:', error);
      return 0;
    }
  },

  async getStudentsByCourseAndTeacher(
    courseId: string,
    teacherId: string
  ): Promise<Enrollment[]> {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('courseId', '==', courseId),
        where('teacherId', '==', teacherId)
      );

      const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Enrollment[];
    } catch (error) {
      console.error('Error fetching students by course and teacher:', error);
      return [];
    }
  },
};
