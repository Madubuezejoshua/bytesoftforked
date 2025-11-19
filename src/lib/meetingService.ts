import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Meeting } from '@/types';

export class MeetingService {
  static async createMeeting(meetingData: Omit<Meeting, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'meetings'), {
        ...meetingData,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...meetingData };
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  static subscribeMeetingsForTeacher(
    teacherId: string,
    callback: (meetings: Meeting[]) => void,
    errorCallback?: (error: Error) => void
  ) {
    try {
      const meetingsQuery = query(
        collection(db, 'meetings'),
        where('teacherId', '==', teacherId),
        orderBy('scheduledTime', 'desc')
      );

      return onSnapshot(
        meetingsQuery,
        (snapshot) => {
          const meetings = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || '',
              roomName: data.roomName || '',
              roomId: data.roomId,
              scheduledTime: data.scheduledTime || new Date().toISOString(),
              teacherId: data.teacherId || '',
              teacherName: data.teacherName,
              courseId: data.courseId,
              participants: Array.isArray(data.participants) ? data.participants : [],
              createdAt: data.createdAt || new Date().toISOString(),
              status: data.status || 'scheduled',
              meetingHost: data.meetingHost,
            };
          }) as Meeting[];
          callback(meetings.length === 0 ? [] : meetings);
        },
        (error) => {
          console.error('Error subscribing to teacher meetings:', error);
          errorCallback?.(error as Error);
        }
      );
    } catch (error) {
      console.error('Error setting up teacher meeting subscription:', error);
      errorCallback?.(error as Error);
      return () => {};
    }
  }

  static subscribeMeetingsForCoordinator(
    callback: (meetings: Meeting[]) => void,
    errorCallback?: (error: Error) => void
  ) {
    try {
      const meetingsQuery = query(
        collection(db, 'meetings'),
        orderBy('status', 'asc'),
        orderBy('scheduledTime', 'desc')
      );

      return onSnapshot(
        meetingsQuery,
        (snapshot) => {
          const meetings = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || '',
              roomName: data.roomName || '',
              roomId: data.roomId,
              scheduledTime: data.scheduledTime || new Date().toISOString(),
              teacherId: data.teacherId || '',
              teacherName: data.teacherName,
              courseId: data.courseId,
              participants: Array.isArray(data.participants) ? data.participants : [],
              createdAt: data.createdAt || new Date().toISOString(),
              status: data.status || 'scheduled',
              meetingHost: data.meetingHost,
            };
          }) as Meeting[];
          callback(meetings.length === 0 ? [] : meetings);
        },
        (error) => {
          console.error('Error subscribing to all meetings:', error);
          errorCallback?.(error as Error);
        }
      );
    } catch (error) {
      console.error('Error setting up coordinator meeting subscription:', error);
      errorCallback?.(error as Error);
      return () => {};
    }
  }

  static async subscribeMeetingsForStudent(
    studentId: string,
    callback: (meetings: Meeting[]) => void,
    errorCallback?: (error: Error) => void
  ) {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId),
        where('paymentStatus', '==', 'completed'),
        where('verifiedAt', '!=', null)
      );

      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const paidCourseIds = enrollmentsSnapshot.docs.map(
        (doc) => doc.data().courseId
      );

      if (paidCourseIds.length === 0) {
        callback([]);
        return () => {};
      }

      const meetingsQuery = query(
        collection(db, 'meetings'),
        where('participants', 'array-contains', studentId),
        orderBy('scheduledTime', 'desc')
      );

      return onSnapshot(
        meetingsQuery,
        (snapshot) => {
          const meetings = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || '',
              roomName: data.roomName || '',
              roomId: data.roomId,
              scheduledTime: data.scheduledTime || new Date().toISOString(),
              teacherId: data.teacherId || '',
              teacherName: data.teacherName,
              courseId: data.courseId,
              participants: Array.isArray(data.participants) ? data.participants : [],
              createdAt: data.createdAt || new Date().toISOString(),
              status: data.status || 'scheduled',
              meetingHost: data.meetingHost,
            };
          }) as Meeting[];

          const filteredMeetings = meetings.filter((meeting) => {
            if (meeting.courseId && paidCourseIds.includes(meeting.courseId)) {
              return true;
            }
            return false;
          });

          callback(filteredMeetings.length === 0 ? [] : filteredMeetings);
        },
        (error) => {
          console.error('Error subscribing to student meetings:', error);
          errorCallback?.(error as Error);
        }
      );
    } catch (error) {
      console.error('Error setting up student meeting subscription:', error);
      errorCallback?.(error as Error);
      return () => {};
    }
  }

  static async updateMeetingParticipants(
    meetingId: string,
    participants: string[]
  ) {
    try {
      const meetingRef = doc(db, 'meetings', meetingId);
      await updateDoc(meetingRef, {
        participants,
      });
    } catch (error) {
      console.error('Error updating meeting participants:', error);
      throw error;
    }
  }

  static async updateMeetingStatus(
    meetingId: string,
    status: 'scheduled' | 'ongoing' | 'completed'
  ) {
    try {
      const meetingRef = doc(db, 'meetings', meetingId);
      await updateDoc(meetingRef, {
        status,
      });
    } catch (error) {
      console.error('Error updating meeting status:', error);
      throw error;
    }
  }
}
