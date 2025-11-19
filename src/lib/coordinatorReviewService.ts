import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { TeacherReview } from '@/types';

export const coordinatorReviewService = {
  async getTeacherReviews(teacherId: string): Promise<TeacherReview[]> {
    try {
      const reviewsQuery = query(
        collection(db, 'teacher_reviews'),
        where('teacherId', '==', teacherId)
      );

      const snapshot = await getDocs(reviewsQuery);
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TeacherReview[];

      return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
        where('reviewerType', '==', 'coordinator')
      );

      const snapshot = await getDocs(reviewsQuery);
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TeacherReview[];

      return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching coordinator reviews:', error);
      return [];
    }
  },

  async createReview(
    teacherId: string,
    courseId: string,
    coordinatorId: string,
    coordinatorName: string,
    rating: number,
    comment: string
  ): Promise<string> {
    try {
      const review = {
        teacherId,
        courseId,
        coordinatorId,
        coordinatorName,
        rating,
        comment,
        reviewerType: 'coordinator',
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'teacher_reviews'), review);
      return docRef.id;
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('Failed to create review');
    }
  },

  getAverageRating(reviews: TeacherReview[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  },

  getAverageCoordinatorRating(reviews: TeacherReview[]): number {
    const coordinatorReviews = reviews.filter(r => r.reviewerType === 'coordinator');
    if (coordinatorReviews.length === 0) return 0;
    const sum = coordinatorReviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / coordinatorReviews.length) * 10) / 10;
  },

  getAverageStudentRating(reviews: TeacherReview[]): number {
    const studentReviews = reviews.filter(r => r.reviewerType === 'student');
    if (studentReviews.length === 0) return 0;
    const sum = studentReviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / studentReviews.length) * 10) / 10;
  },
};
