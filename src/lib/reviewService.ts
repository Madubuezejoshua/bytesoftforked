import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { TeacherReview } from '@/types';

export const reviewService = {
  async getTeacherAllReviews(teacherId: string): Promise<TeacherReview[]> {
    try {
      const reviewsQuery = query(
        collection(db, 'teacher_reviews'),
        where('teacherId', '==', teacherId),
        orderBy('createdAt', 'desc')
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

  async getCoordinatorReviews(teacherId: string): Promise<TeacherReview[]> {
    try {
      const reviewsQuery = query(
        collection(db, 'teacher_reviews'),
        where('teacherId', '==', teacherId),
        where('reviewerType', '==', 'coordinator'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(reviewsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TeacherReview[];
    } catch (error) {
      console.error('Error fetching coordinator reviews:', error);
      return [];
    }
  },

  async getStudentReviews(teacherId: string): Promise<TeacherReview[]> {
    try {
      const reviewsQuery = query(
        collection(db, 'teacher_reviews'),
        where('teacherId', '==', teacherId),
        where('reviewerType', '==', 'student'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(reviewsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TeacherReview[];
    } catch (error) {
      console.error('Error fetching student reviews:', error);
      return [];
    }
  },

  async getReviewsByCoordinator(coordinatorId: string): Promise<TeacherReview[]> {
    try {
      const reviewsQuery = query(
        collection(db, 'teacher_reviews'),
        where('coordinatorId', '==', coordinatorId),
        where('reviewerType', '==', 'coordinator'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(reviewsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TeacherReview[];
    } catch (error) {
      console.error('Error fetching coordinator reviews:', error);
      return [];
    }
  },

  async createCoordinatorReview(
    teacherId: string,
    courseId: string,
    coordinatorId: string,
    coordinatorName: string,
    rating: number,
    comment: string
  ): Promise<string> {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated');
    }

    if (auth.currentUser.uid !== coordinatorId) {
      throw new Error('Can only create reviews for yourself');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    if (!comment || comment.trim().length === 0) {
      throw new Error('Comment cannot be empty');
    }

    try {
      const review = {
        teacherId,
        courseId,
        coordinatorId,
        coordinatorName,
        rating,
        comment: comment.trim(),
        reviewerType: 'coordinator',
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'teacher_reviews'), review);
      return docRef.id;
    } catch (error) {
      console.error('Error creating coordinator review:', error);
      throw new Error('Failed to create review');
    }
  },

  async createStudentReview(
    teacherId: string,
    courseId: string,
    studentId: string,
    studentName: string,
    rating: number,
    comment: string
  ): Promise<string> {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated');
    }

    if (auth.currentUser.uid !== studentId) {
      throw new Error('Can only create reviews for yourself');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    if (!comment || comment.trim().length === 0) {
      throw new Error('Comment cannot be empty');
    }

    try {
      const review = {
        teacherId,
        courseId,
        studentId,
        studentName,
        rating,
        comment: comment.trim(),
        reviewerType: 'student',
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'teacher_reviews'), review);
      return docRef.id;
    } catch (error) {
      console.error('Error creating student review:', error);
      throw new Error('Failed to create review');
    }
  },

  getAverageRating(reviews: TeacherReview[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  },

  getCoordinatorAverageRating(reviews: TeacherReview[]): number {
    const coordinatorReviews = reviews.filter(r => r.reviewerType === 'coordinator');
    if (coordinatorReviews.length === 0) return 0;
    return this.getAverageRating(coordinatorReviews);
  },

  getStudentAverageRating(reviews: TeacherReview[]): number {
    const studentReviews = reviews.filter(r => r.reviewerType === 'student');
    if (studentReviews.length === 0) return 0;
    return this.getAverageRating(studentReviews);
  },

  filterReviewsByTeacher(reviews: TeacherReview[], teacherId: string): TeacherReview[] {
    return reviews.filter(r => r.teacherId === teacherId);
  },

  filterReviewsByReviewerType(reviews: TeacherReview[], reviewerType: 'student' | 'coordinator'): TeacherReview[] {
    return reviews.filter(r => r.reviewerType === reviewerType);
  },
};
