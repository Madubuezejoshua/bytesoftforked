import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Notification, ActivityLog } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';
const ACTIVITY_LOGS_COLLECTION = 'activityLogs';

export const notificationService = {
  async createNotification(
    teacherId: string,
    courseTitle: string,
    status: 'approved' | 'rejected',
    coordinatorName: string,
    reason: string
  ): Promise<string> {
    try {
      const notification: Omit<Notification, 'id'> = {
        teacherId,
        courseTitle,
        status,
        coordinatorName,
        reason,
        timestamp: new Date().toISOString(),
        read: false,
      };

      const docRef = await addDoc(
        collection(db, NOTIFICATIONS_COLLECTION),
        notification
      );
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  },

  async createActivityLog(
    coordinatorId: string,
    coordinatorName: string,
    action: 'approved' | 'rejected',
    teacherId: string,
    teacherName: string,
    courseTitle: string,
    details?: string
  ): Promise<string> {
    try {
      const activityLog: Omit<ActivityLog, 'id'> = {
        coordinatorId,
        coordinatorName,
        action,
        teacherId,
        teacherName,
        courseTitle,
        timestamp: new Date().toISOString(),
        details,
      };

      const docRef = await addDoc(
        collection(db, ACTIVITY_LOGS_COLLECTION),
        activityLog
      );
      return docRef.id;
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw new Error('Failed to create activity log');
    }
  },

  async getTeacherNotifications(teacherId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('teacherId', '==', teacherId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Notification));
    } catch (error) {
      console.error('Error fetching teacher notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  },

  subscribeToTeacherNotifications(
    teacherId: string,
    callback: (notifications: Notification[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('teacherId', '==', teacherId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Notification));
        callback(notifications);
      },
      (error) => {
        console.error('Error subscribing to notifications:', error);
      }
    );
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  },

  async getCoordinatorActivityLogs(coordinatorId: string): Promise<ActivityLog[]> {
    try {
      const q = query(
        collection(db, ACTIVITY_LOGS_COLLECTION),
        where('coordinatorId', '==', coordinatorId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as ActivityLog));
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw new Error('Failed to fetch activity logs');
    }
  },

  subscribeToActivityLogs(
    coordinatorId: string,
    callback: (logs: ActivityLog[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, ACTIVITY_LOGS_COLLECTION),
      where('coordinatorId', '==', coordinatorId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const logs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as ActivityLog));
        callback(logs);
      },
      (error) => {
        console.error('Error subscribing to activity logs:', error);
      }
    );
  },

  async getUnreadCount(teacherId: string): Promise<number> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('teacherId', '==', teacherId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  subscribeToUnreadCount(
    teacherId: string,
    callback: (count: number) => void
  ): Unsubscribe {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('teacherId', '==', teacherId),
      where('read', '==', false)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        callback(snapshot.size);
      },
      (error) => {
        console.error('Error subscribing to unread count:', error);
      }
    );
  },
};
