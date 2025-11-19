import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, TeacherReview, Course } from '@/types';

export interface TeacherDetails {
  teacher: User;
  totalStudentsEnrolled: number;
  averageRating: number;
  totalReviews: number;
  coursesTaught: Course[];
  reviews: TeacherReview[];
}

export const teacherService = {
  async getTeacherDetails(teacherId: string): Promise<TeacherDetails> {
    try {
      const teacher = await this.getTeacher(teacherId);
      const coursesTaught = await this.getCoursesTaught(teacherId);
      const reviews = await this.getTeacherReviews(teacherId);
      const totalStudentsEnrolled = await this.getTotalStudentsEnrolled(coursesTaught);

      const averageRating = reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0;

      return {
        teacher,
        totalStudentsEnrolled,
        averageRating,
        totalReviews: reviews.length,
        coursesTaught,
        reviews,
      };
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      throw new Error('Failed to fetch teacher details');
    }
  },

  async getTeacher(teacherId: string): Promise<User> {
    try {
      const userRef = doc(db, 'users', teacherId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Teacher not found');
      }

      return {
        id: userSnap.id,
        ...userSnap.data(),
      } as User;
    } catch (error) {
      console.error('Error fetching teacher:', error);
      throw error;
    }
  },

  async getCoursesTaught(teacherId: string): Promise<Course[]> {
    try {
      const coursesQuery = query(
        collection(db, 'courses'),
        where('instructorIds', 'array-contains', teacherId)
      );

      const snapshot = await getDocs(coursesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
    } catch (error) {
      console.error('Error fetching courses taught:', error);
      return [];
    }
  },

  async getTeacherReviews(teacherId: string): Promise<TeacherReview[]> {
    try {
      const reviewsQuery = query(
        collection(db, 'teacher_reviews'),
        where('teacherId', '==', teacherId)
      );

      const snapshot = await getDocs(reviewsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TeacherReview[];
    } catch (error) {
      console.error('Error fetching teacher reviews:', error);
      return [];
    }
  },

  async getTotalStudentsEnrolled(courses: Course[]): Promise<number> {
    try {
      let totalStudents = 0;

      for (const course of courses) {
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('courseId', '==', course.id),
          where('paymentStatus', '==', 'completed')
        );

        const snapshot = await getDocs(enrollmentsQuery);
        totalStudents += snapshot.size;
      }

      return totalStudents;
    } catch (error) {
      console.error('Error calculating total students:', error);
      return 0;
    }
  },
};
