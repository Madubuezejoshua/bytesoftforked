import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, UserRole } from '@/types';
import { auth } from './firebase';

export const userDataService = {
  async getCurrentUserRole(): Promise<UserRole | null> {
    if (!auth.currentUser) return null;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return null;
      return userSnap.data().role as UserRole;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  },

  async getOwnUserData(): Promise<User | null> {
    if (!auth.currentUser) return null;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return null;
      return {
        id: userSnap.id,
        ...userSnap.data(),
      } as User;
    } catch (error) {
      console.error('Error fetching own user data:', error);
      return null;
    }
  },

  async getAllTeachers(): Promise<User[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'teacher')
      );
      const snapshot = await getDocs(usersQuery);
      const teachers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      return teachers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }
  },

  async getAllStudents(): Promise<User[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student')
      );
      const snapshot = await getDocs(usersQuery);
      const students = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      return students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return null;
      return {
        id: userSnap.id,
        ...userSnap.data(),
      } as User;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  },

  async getTeachersByRole(role: UserRole): Promise<User[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', role)
      );
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
    } catch (error) {
      console.error(`Error fetching users with role ${role}:`, error);
      return [];
    }
  },

  async searchUsersByName(searchTerm: string, role?: UserRole): Promise<User[]> {
    try {
      let usersQuery;

      if (role) {
        usersQuery = query(
          collection(db, 'users'),
          where('role', '==', role)
        );
      } else {
        usersQuery = collection(db, 'users');
      }

      const snapshot = await getDocs(usersQuery);
      const allUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      const searchLower = searchTerm.toLowerCase();
      return allUsers.filter(user =>
        (user.name || '').toLowerCase().includes(searchLower) ||
        (user.email || '').toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },
};
