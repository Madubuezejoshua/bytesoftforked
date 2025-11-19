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
import { ScheduledClass } from '@/types';

export const scheduledClassService = {
  async getTeacherScheduledClasses(teacherId: string): Promise<ScheduledClass[]> {
    try {
      const classesQuery = query(
        collection(db, 'scheduled_classes'),
        where('teacherId', '==', teacherId),
        orderBy('startTime', 'desc')
      );

      const snapshot = await getDocs(classesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ScheduledClass[];
    } catch (error) {
      console.error('Error fetching teacher scheduled classes:', error);
      return [];
    }
  },

  async getCourseScheduledClasses(courseId: string): Promise<ScheduledClass[]> {
    try {
      const classesQuery = query(
        collection(db, 'scheduled_classes'),
        where('courseId', '==', courseId),
        orderBy('startTime', 'desc')
      );

      const snapshot = await getDocs(classesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ScheduledClass[];
    } catch (error) {
      console.error('Error fetching course scheduled classes:', error);
      return [];
    }
  },

  async getScheduledClassById(classId: string): Promise<ScheduledClass | null> {
    try {
      const classRef = doc(db, 'scheduled_classes', classId);
      const classSnap = await getDoc(classRef);
      if (!classSnap.exists()) return null;
      return {
        id: classSnap.id,
        ...classSnap.data(),
      } as ScheduledClass;
    } catch (error) {
      console.error('Error fetching scheduled class:', error);
      return null;
    }
  },

  async getAllScheduledClasses(): Promise<ScheduledClass[]> {
    try {
      const classesQuery = query(
        collection(db, 'scheduled_classes'),
        orderBy('startTime', 'desc')
      );

      const snapshot = await getDocs(classesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ScheduledClass[];
    } catch (error) {
      console.error('Error fetching all scheduled classes:', error);
      return [];
    }
  },

  async getUpcomingScheduledClasses(teacherId?: string): Promise<ScheduledClass[]> {
    try {
      const now = new Date().toISOString();

      let classesQuery;
      if (teacherId) {
        classesQuery = query(
          collection(db, 'scheduled_classes'),
          where('teacherId', '==', teacherId),
          where('startTime', '>', now),
          orderBy('startTime', 'asc')
        );
      } else {
        classesQuery = query(
          collection(db, 'scheduled_classes'),
          where('startTime', '>', now),
          orderBy('startTime', 'asc')
        );
      }

      const snapshot = await getDocs(classesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ScheduledClass[];
    } catch (error) {
      console.error('Error fetching upcoming scheduled classes:', error);
      return [];
    }
  },

  async getPastScheduledClasses(teacherId?: string): Promise<ScheduledClass[]> {
    try {
      const now = new Date().toISOString();

      let classesQuery;
      if (teacherId) {
        classesQuery = query(
          collection(db, 'scheduled_classes'),
          where('teacherId', '==', teacherId),
          where('startTime', '<', now),
          orderBy('startTime', 'desc')
        );
      } else {
        classesQuery = query(
          collection(db, 'scheduled_classes'),
          where('startTime', '<', now),
          orderBy('startTime', 'desc')
        );
      }

      const snapshot = await getDocs(classesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ScheduledClass[];
    } catch (error) {
      console.error('Error fetching past scheduled classes:', error);
      return [];
    }
  },

  countClassesByTeacher(classes: ScheduledClass[], teacherId: string): number {
    return classes.filter(c => c.teacherId === teacherId).length;
  },

  countClassesByCourse(classes: ScheduledClass[], courseId: string): number {
    return classes.filter(c => c.courseId === courseId).length;
  },

  filterClassesByStatus(
    classes: ScheduledClass[],
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  ): ScheduledClass[] {
    return classes.filter(c => c.status === status);
  },
};
