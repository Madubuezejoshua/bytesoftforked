import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Course, Enrollment } from '../types';

export const courseService = {
  async getApprovedCoursesForTeacher(teacherId: string): Promise<Course[]> {
    try {
      const courseRequestsQuery = query(
        collection(db, 'course_requests'),
        where('teacherId', '==', teacherId),
        where('status', '==', 'approved')
      );

      const requestsSnapshot = await getDocs(courseRequestsQuery);
      const approvedCourseIds = requestsSnapshot.docs.map(doc => doc.data().courseId);

      if (approvedCourseIds.length === 0) {
        return [];
      }

      const coursesQuery = query(
        collection(db, 'courses'),
        where('isActive', '==', true)
      );

      const coursesSnapshot = await getDocs(coursesQuery);
      const courses = coursesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(course => approvedCourseIds.includes(course.id)) as Course[];

      return courses;
    } catch (error) {
      console.error('Error fetching approved courses for teacher:', error);
      throw new Error('Failed to fetch approved courses');
    }
  },

  subscribeToApprovedCourses(
    teacherId: string,
    onCoursesChange: (courses: Course[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      const courseRequestsQuery = query(
        collection(db, 'course_requests'),
        where('teacherId', '==', teacherId),
        where('status', '==', 'approved')
      );

      const unsubscribe = onSnapshot(
        courseRequestsQuery,
        async (requestsSnapshot) => {
          try {
            const approvedCourseIds = requestsSnapshot.docs.map(doc => doc.data().courseId);

            if (approvedCourseIds.length === 0) {
              onCoursesChange([]);
              return;
            }

            const coursesQuery = query(
              collection(db, 'courses'),
              where('isActive', '==', true)
            );

            const coursesSnapshot = await getDocs(coursesQuery);
            const courses = coursesSnapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              }))
              .filter(course => approvedCourseIds.includes(course.id)) as Course[];

            onCoursesChange(courses);
          } catch (error) {
            console.error('Error processing approved courses:', error);
            onError?.(error as Error);
          }
        },
        (error) => {
          console.error('Error subscribing to approved courses:', error);
          onError?.(error as Error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up approved courses subscription:', error);
      throw new Error('Failed to subscribe to approved courses');
    }
  },

  async getStudentsByCourse(courseId: string): Promise<Enrollment[]> {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('courseId', '==', courseId)
      );

      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const enrollments = enrollmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Enrollment[];

      return enrollments;
    } catch (error) {
      console.error('Error fetching students for course:', error);
      throw new Error('Failed to fetch students for course');
    }
  },

  subscribeToStudentsByCourse(
    courseId: string,
    onStudentsChange: (enrollments: Enrollment[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('courseId', '==', courseId)
      );

      const unsubscribe = onSnapshot(
        enrollmentsQuery,
        (enrollmentsSnapshot) => {
          try {
            const enrollments = enrollmentsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Enrollment[];

            onStudentsChange(enrollments);
          } catch (error) {
            console.error('Error processing course students:', error);
            onError?.(error as Error);
          }
        },
        (error) => {
          console.error('Error subscribing to course students:', error);
          onError?.(error as Error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up course students subscription:', error);
      throw new Error('Failed to subscribe to course students');
    }
  },
};
