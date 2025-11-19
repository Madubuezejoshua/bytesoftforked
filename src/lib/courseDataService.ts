import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Course } from '@/types';

export const courseDataService = {
  async getTeacherCourses(teacherId: string): Promise<Course[]> {
    try {
      const coursesQuery = query(
        collection(db, 'courses'),
        where('instructorIds', 'array-contains', teacherId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(coursesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      return [];
    }
  },

  async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      if (!courseSnap.exists()) return null;
      return {
        id: courseSnap.id,
        ...courseSnap.data(),
      } as Course;
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  },

  async getAllCourses(): Promise<Course[]> {
    try {
      const coursesQuery = query(
        collection(db, 'courses'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(coursesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return [];
    }
  },

  async getCoursesByCategory(category: string): Promise<Course[]> {
    try {
      const coursesQuery = query(
        collection(db, 'courses'),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(coursesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      return [];
    }
  },

  async getCoursesByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Promise<Course[]> {
    try {
      const coursesQuery = query(
        collection(db, 'courses'),
        where('level', '==', level),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(coursesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
    } catch (error) {
      console.error('Error fetching courses by level:', error);
      return [];
    }
  },

  async searchCourses(searchTerm: string): Promise<Course[]> {
    try {
      const coursesQuery = query(
        collection(db, 'courses'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(coursesQuery);
      const allCourses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];

      const searchLower = searchTerm.toLowerCase();
      return allCourses.filter(course =>
        (course.title || '').toLowerCase().includes(searchLower) ||
        (course.description || '').toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching courses:', error);
      return [];
    }
  },

  async getCoursesForCoordinator(): Promise<Course[]> {
    try {
      const coursesQuery = query(
        collection(db, 'courses'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(coursesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
    } catch (error) {
      console.error('Error fetching courses for coordinator:', error);
      return [];
    }
  },

  countCoursesByTeacher(courses: Course[], teacherId: string): number {
    return courses.filter(c =>
      c.instructorIds?.includes(teacherId) || c.instructorId === teacherId
    ).length;
  },

  filterCoursesByStatus(courses: Course[], isActive: boolean): Course[] {
    return courses.filter(c => c.isActive === isActive);
  },

  filterCoursesByLevel(
    courses: Course[],
    level: 'beginner' | 'intermediate' | 'advanced'
  ): Course[] {
    return courses.filter(c => c.level === level);
  },
};
