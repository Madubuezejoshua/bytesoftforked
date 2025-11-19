import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { CourseRequest, CourseRequestStatus } from '../types';

const COLLECTION_NAME = 'course_requests';

export const courseRequestService = {
  async createCourseRequest(
    courseId: string,
    teacherId: string,
    teacherName: string,
    courseTitle: string
  ): Promise<string> {
    try {
      const courseRequest: Omit<CourseRequest, 'id'> = {
        courseId,
        teacherId,
        teacherName,
        courseTitle,
        status: 'pending',
        requestedDate: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), courseRequest);
      return docRef.id;
    } catch (error) {
      console.error('Error creating course request:', error);
      throw new Error('Failed to create course request');
    }
  },

  async getTeacherRequests(teacherId: string): Promise<CourseRequest[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('teacherId', '==', teacherId),
        orderBy('requestedDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as CourseRequest));
    } catch (error) {
      console.error('Error fetching teacher requests:', error);
      throw new Error('Failed to fetch teacher requests');
    }
  },

  async getAllRequests(status?: CourseRequestStatus): Promise<CourseRequest[]> {
    try {
      let q;

      if (status) {
        q = query(
          collection(db, COLLECTION_NAME),
          where('status', '==', status),
          orderBy('requestedDate', 'desc')
        );
      } else {
        q = query(
          collection(db, COLLECTION_NAME),
          orderBy('requestedDate', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as CourseRequest));
    } catch (error) {
      console.error('Error fetching all requests:', error);
      throw new Error('Failed to fetch course requests');
    }
  },

  async getRequestsByCourse(courseId: string): Promise<CourseRequest[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('courseId', '==', courseId),
        orderBy('requestedDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as CourseRequest));
    } catch (error) {
      console.error('Error fetching requests by course:', error);
      throw new Error('Failed to fetch course requests');
    }
  },

  async approveRequest(
    requestId: string,
    coordinatorId: string,
    coordinatorName?: string
  ): Promise<void> {
    try {
      const requestRef = doc(db, COLLECTION_NAME, requestId);
      await updateDoc(requestRef, {
        status: 'approved' as CourseRequestStatus,
        reviewedDate: new Date().toISOString(),
        coordinatorId,
        coordinatorName: coordinatorName || 'Coordinator',
      });
    } catch (error) {
      console.error('Error approving request:', error);
      throw new Error('Failed to approve course request');
    }
  },

  async rejectRequest(
    requestId: string,
    coordinatorId: string,
    rejectionReason: string,
    coordinatorName?: string
  ): Promise<void> {
    try {
      const requestRef = doc(db, COLLECTION_NAME, requestId);
      await updateDoc(requestRef, {
        status: 'rejected' as CourseRequestStatus,
        reviewedDate: new Date().toISOString(),
        coordinatorId,
        coordinatorName: coordinatorName || 'Coordinator',
        rejectionReason,
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw new Error('Failed to reject course request');
    }
  },

  async cancelRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, COLLECTION_NAME, requestId);
      await updateDoc(requestRef, {
        status: 'cancelled' as any,
        cancelledAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error cancelling request:', error);
      throw new Error('Failed to cancel course request');
    }
  },

  async addInstructorToCourse(
    courseId: string,
    teacherId: string,
    teacherName: string
  ): Promise<void> {
    try {
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDocs(query(collection(db, 'courses'), where('id', '==', courseId)));

      if (courseDoc.empty) {
        throw new Error('Course not found');
      }

      const course = courseDoc.docs[0].data();
      const instructorIds = course.instructorIds || (course.instructorId ? [course.instructorId] : []);
      const instructorNames = course.instructorNames || (course.instructorName ? [course.instructorName] : []);

      if (!instructorIds.includes(teacherId)) {
        instructorIds.push(teacherId);
        instructorNames.push(teacherName);

        await updateDoc(courseRef, {
          instructorIds,
          instructorNames,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error adding instructor to course:', error);
      throw new Error('Failed to add instructor to course');
    }
  },
};
