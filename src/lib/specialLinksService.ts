import { db } from '@/lib/firebase';
import { SpecialLink } from '@/types';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
  Timestamp,
  collectionGroup,
  getDocs,
} from 'firebase/firestore';

export const specialLinksService = {
  subscribeToReceivedLinks: (
    studentId: string,
    onSuccess: (links: SpecialLink[]) => void,
    onError: (error: Error) => void
  ) => {
    try {
      const linksRef = collection(db, 'users', studentId, 'receivedLinks');
      const q = query(linksRef, orderBy('timestamp', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const links = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SpecialLink[];
        onSuccess(links);
      });

      return unsubscribe;
    } catch (error) {
      onError(error as Error);
      return () => {};
    }
  },

  sendLinkToStudent: async (
    studentId: string,
    teacherId: string,
    teacherName: string,
    courseId: string,
    courseTitle: string,
    writeUp: string,
    link: string
  ): Promise<string> => {
    try {
      const linksRef = collection(db, 'users', studentId, 'receivedLinks');
      const docRef = await addDoc(linksRef, {
        studentId,
        teacherId,
        teacherName,
        courseId,
        courseTitle,
        writeUp,
        link,
        timestamp: new Date().toISOString(),
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to send link to student: ${error}`);
    }
  },

  sendLinkToMultipleStudents: async (
    studentIds: string[],
    teacherId: string,
    teacherName: string,
    courseId: string,
    courseTitle: string,
    writeUp: string,
    link: string
  ): Promise<string[]> => {
    try {
      const linkIds: string[] = [];

      for (const studentId of studentIds) {
        const id = await specialLinksService.sendLinkToStudent(
          studentId,
          teacherId,
          teacherName,
          courseId,
          courseTitle,
          writeUp,
          link
        );
        linkIds.push(id);
      }

      return linkIds;
    } catch (error) {
      throw new Error(`Failed to send links to students: ${error}`);
    }
  },

  deleteReceivedLink: async (studentId: string, linkId: string): Promise<void> => {
    try {
      const linkRef = doc(db, 'users', studentId, 'receivedLinks', linkId);
      await deleteDoc(linkRef);
    } catch (error) {
      throw new Error(`Failed to delete link: ${error}`);
    }
  },

  subscribeToAllSpecialLinks: (
    onSuccess: (links: Array<SpecialLink & { studentId: string }>) => void,
    onError: (error: Error) => void
  ) => {
    try {
      const linksRef = collectionGroup(db, 'receivedLinks');
      const q = query(linksRef, orderBy('timestamp', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const links = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            studentId: data.studentId || '',
            ...data,
          };
        }) as Array<SpecialLink & { studentId: string }>;
        onSuccess(links);
      });

      return unsubscribe;
    } catch (error) {
      onError(error as Error);
      return () => {};
    }
  },

  fetchAllSpecialLinks: async (): Promise<Array<SpecialLink & { studentId: string }>> => {
    try {
      const linksRef = collectionGroup(db, 'receivedLinks');
      const q = query(linksRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);

      const links = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          studentId: data.studentId || '',
          ...data,
        };
      }) as Array<SpecialLink & { studentId: string }>;

      return links;
    } catch (error) {
      throw new Error(`Failed to fetch all special links: ${error}`);
    }
  },
};
