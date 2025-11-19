import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  Query,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { ScheduledClass } from '@/types';

export const classesService = {
  async getClassesCountByTeacherAndCourse(
    teacherId: string,
    courseId: string
  ): Promise<number> {
    try {
      const classesQuery = query(
        collection(db, 'scheduled_classes'),
        where('teacherId', '==', teacherId),
        where('courseId', '==', courseId)
      );

      const snapshot = await getDocs(classesQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error fetching classes count:', error);
      return 0;
    }
  },

  async getClassesByTeacherAndCourse(
    teacherId: string,
    courseId: string
  ): Promise<ScheduledClass[]> {
    try {
      const classesQuery = query(
        collection(db, 'scheduled_classes'),
        where('teacherId', '==', teacherId),
        where('courseId', '==', courseId),
        orderBy('startTime', 'desc')
      );

      const snapshot = await getDocs(classesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ScheduledClass[];
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  },

  async getCompletedClassesCountByTeacherAndCourse(
    teacherId: string,
    courseId: string
  ): Promise<number> {
    try {
      const classesQuery = query(
        collection(db, 'scheduled_classes'),
        where('teacherId', '==', teacherId),
        where('courseId', '==', courseId),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(classesQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error fetching completed classes count:', error);
      return 0;
    }
  },

  async getClassStatsByTeacherAndCourse(
    teacherId: string,
    courseId: string
  ): Promise<{
    total: number;
    completed: number;
    scheduled: number;
    ongoing: number;
    cancelled: number;
  }> {
    try {
      const classes = await this.getClassesByTeacherAndCourse(teacherId, courseId);

      return {
        total: classes.length,
        completed: classes.filter(c => c.status === 'completed').length,
        scheduled: classes.filter(c => c.status === 'scheduled').length,
        ongoing: classes.filter(c => c.status === 'ongoing').length,
        cancelled: classes.filter(c => c.status === 'cancelled').length,
      };
    } catch (error) {
      console.error('Error fetching class stats:', error);
      return {
        total: 0,
        completed: 0,
        scheduled: 0,
        ongoing: 0,
        cancelled: 0,
      };
    }
  },

  subscribeToClassesByTeacherAndCourse(
    teacherId: string,
    courseId: string,
    onUpdate: (classes: ScheduledClass[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const classesQuery = query(
        collection(db, 'scheduled_classes'),
        where('teacherId', '==', teacherId),
        where('courseId', '==', courseId),
        orderBy('startTime', 'desc')
      );

      const unsubscribe = onSnapshot(
        classesQuery,
        snapshot => {
          const classes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as ScheduledClass[];
          onUpdate(classes);
        },
        error => {
          console.error('Error subscribing to classes:', error);
          onError?.(error as Error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up classes subscription:', error);
      return () => {};
    }
  },
};
