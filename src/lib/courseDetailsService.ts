import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Course, CourseDetails, User, Enrollment, Meeting, TeacherReview } from '@/types';

export const courseDetailsService = {
  async getCourseDetails(courseId: string): Promise<CourseDetails> {
    try {
      const course = await this.getCourse(courseId);
      const teachers = await this.getTeachersFromSubcollection(courseId);
      const enrolledStudents = await this.getStudentsFromSubcollection(courseId);
      const completedMeetings = await this.getSessionsFromSubcollection(courseId);
      const reviews = await this.getCourseReviewsFromSubcollection(courseId);

      const totalClassesHeld = completedMeetings.length;
      const averageRating = reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0;

      return {
        course,
        teachers,
        enrolledStudents,
        completedMeetings,
        totalClassesHeld,
        averageRating,
        reviews,
      };
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw new Error('Failed to fetch course details');
    }
  },

  async getCourse(courseId: string): Promise<Course> {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error('Course not found');
    }

    return {
      id: courseSnap.id,
      ...courseSnap.data(),
    } as Course;
  },

  async getTeachersFromSubcollection(courseId: string): Promise<User[]> {
    try {
      const teachersSnapshot = await getDocs(
        collection(db, 'courses', courseId, 'teachers')
      );

      if (teachersSnapshot.empty) {
        return [];
      }

      const teachers: User[] = [];
      for (const doc of teachersSnapshot.docs) {
        teachers.push({
          id: doc.id,
          ...doc.data(),
        } as User);
      }

      return teachers;
    } catch (error) {
      console.error('Error fetching teachers from subcollection:', error);
      return [];
    }
  },

  async getStudentsFromSubcollection(courseId: string): Promise<Enrollment[]> {
    try {
      const studentsSnapshot = await getDocs(
        collection(db, 'courses', courseId, 'students')
      );

      if (studentsSnapshot.empty) {
        return [];
      }

      const students: Enrollment[] = [];
      for (const doc of studentsSnapshot.docs) {
        students.push({
          id: doc.id,
          ...doc.data(),
        } as Enrollment);
      }

      return students;
    } catch (error) {
      console.error('Error fetching students from subcollection:', error);
      return [];
    }
  },

  async getSessionsFromSubcollection(courseId: string): Promise<Meeting[]> {
    try {
      const sessionsSnapshot = await getDocs(
        collection(db, 'courses', courseId, 'sessions')
      );

      if (sessionsSnapshot.empty) {
        return [];
      }

      const sessions: Meeting[] = [];
      for (const doc of sessionsSnapshot.docs) {
        sessions.push({
          id: doc.id,
          ...doc.data(),
        } as Meeting);
      }

      return sessions;
    } catch (error) {
      console.error('Error fetching sessions from subcollection:', error);
      return [];
    }
  },

  async getCourseReviewsFromSubcollection(courseId: string): Promise<TeacherReview[]> {
    try {
      const reviewsSnapshot = await getDocs(
        collection(db, 'courses', courseId, 'reviews')
      );

      if (reviewsSnapshot.empty) {
        return [];
      }

      const reviews: TeacherReview[] = [];
      for (const doc of reviewsSnapshot.docs) {
        reviews.push({
          id: doc.id,
          ...doc.data(),
        } as TeacherReview);
      }

      return reviews;
    } catch (error) {
      console.error('Error fetching course reviews from subcollection:', error);
      return [];
    }
  },

  async getTeachers(courseId: string): Promise<User[]> {
    return this.getTeachersFromSubcollection(courseId);
  },

  async getEnrolledStudents(courseId: string): Promise<Enrollment[]> {
    return this.getStudentsFromSubcollection(courseId);
  },

  async getCompletedMeetings(courseId: string): Promise<Meeting[]> {
    return this.getSessionsFromSubcollection(courseId);
  },

  async getTeacherReviews(courseId: string): Promise<TeacherReview[]> {
    return this.getCourseReviewsFromSubcollection(courseId);
  },
};
