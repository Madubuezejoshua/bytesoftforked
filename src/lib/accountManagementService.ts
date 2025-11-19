import { db, auth } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { UserAccount } from '@/types';
import { logAdminAction } from './accessCodeService';

export const verifyAdminAccess = async (adminId: string): Promise<boolean> => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', adminId));
    if (!adminDoc.exists()) {
      console.error('Admin document does not exist in admins collection for user:', adminId);
      throw new Error('Admin document not found. Please ensure your admin account is properly registered.');
    }
    const adminData = adminDoc.data();
    if (adminData.role !== 'admin') {
      console.error('User does not have admin role:', adminId);
      throw new Error('User does not have admin privileges.');
    }
    return true;
  } catch (error: any) {
    console.error('Admin verification failed:', error);
    throw new Error(`Admin verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getUserAccount = async (userId: string): Promise<UserAccount | null> => {
  const accountsRef = collection(db, 'userAccounts');
  const q = query(accountsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const docSnap = querySnapshot.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data()
  } as UserAccount;
};

export const getAllUserAccounts = async (): Promise<UserAccount[]> => {
  const accountsRef = collection(db, 'userAccounts');
  const querySnapshot = await getDocs(accountsRef);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as UserAccount));
};

export const suspendUserAccount = async (
  userId: string,
  adminId: string,
  adminName: string,
  reason: string
): Promise<void> => {
  const account = await getUserAccount(userId);

  if (!account) {
    throw new Error('User account not found');
  }

  const accountRef = doc(db, 'userAccounts', account.id);
  await updateDoc(accountRef, {
    status: 'suspended',
    suspensionReason: reason,
    suspendedAt: new Date().toISOString(),
    suspendedBy: adminId,
    updatedAt: new Date().toISOString(),
  });

  await logAdminAction(
    adminId,
    adminName,
    'suspend_account',
    userId,
    'user',
    `Suspended account. Reason: ${reason}`
  );
};

export const unsuspendUserAccount = async (
  userId: string,
  adminId: string,
  adminName: string
): Promise<void> => {
  const account = await getUserAccount(userId);

  if (!account) {
    throw new Error('User account not found');
  }

  const accountRef = doc(db, 'userAccounts', account.id);
  await updateDoc(accountRef, {
    status: 'active',
    suspensionReason: null,
    suspendedAt: null,
    suspendedBy: null,
    updatedAt: new Date().toISOString(),
  });

  await logAdminAction(
    adminId,
    adminName,
    'unsuspend_account',
    userId,
    'user',
    'Unsuspended account'
  );
};

export const deleteUserAccount = async (
  userId: string,
  adminId: string,
  adminName: string
): Promise<void> => {
  try {
    await verifyAdminAccess(adminId);

    const batch = writeBatch(db);
    let operationCount = 0;

    try {
      const enrollmentsRef = collection(db, 'enrollments');
      const enrollmentsQuery = query(enrollmentsRef, where('studentId', '==', userId));
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      enrollmentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting enrollments:', error);
      throw new Error(`Permission denied: Cannot delete enrollments. ${error instanceof Error ? error.message : ''}`);
    }

    try {
      const attendanceRef = collection(db, 'classAttendance');
      const attendanceQuery = query(attendanceRef, where('studentId', '==', userId));
      const attendanceSnapshot = await getDocs(attendanceQuery);
      attendanceSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting attendance records:', error);
      throw new Error(`Permission denied: Cannot delete attendance records. ${error instanceof Error ? error.message : ''}`);
    }

    try {
      const classesRef = collection(db, 'scheduledClasses');
      const classesQuery = query(classesRef, where('teacherId', '==', userId));
      const classesSnapshot = await getDocs(classesQuery);
      classesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting classes:', error);
      throw new Error(`Permission denied: Cannot delete classes. ${error instanceof Error ? error.message : ''}`);
    }

    try {
      const coursesRef = collection(db, 'courses');
      const coursesQuery = query(coursesRef, where('instructorId', '==', userId));
      const coursesSnapshot = await getDocs(coursesQuery);
      coursesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting courses:', error);
      throw new Error(`Permission denied: Cannot delete courses. ${error instanceof Error ? error.message : ''}`);
    }

    try {
      const userRolesRef = collection(db, 'userRoles');
      const userRolesQuery = query(userRolesRef, where('userId', '==', userId));
      const userRolesSnapshot = await getDocs(userRolesQuery);
      userRolesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting user roles:', error);
      throw new Error(`Permission denied: Cannot delete user roles. ${error instanceof Error ? error.message : ''}`);
    }

    try {
      const accountsRef = collection(db, 'userAccounts');
      const accountsQuery = query(accountsRef, where('userId', '==', userId));
      const accountsSnapshot = await getDocs(accountsQuery);
      accountsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw new Error(`Permission denied: Cannot delete user account. ${error instanceof Error ? error.message : ''}`);
    }

    try {
      const usersRef = doc(db, 'users', userId);
      batch.delete(usersRef);
      operationCount++;
    } catch (error) {
      console.error('Error preparing user deletion:', error);
      throw new Error(`Permission denied: Cannot delete user document. ${error instanceof Error ? error.message : ''}`);
    }

    try {
      await batch.commit();
      console.log(`Successfully deleted account and ${operationCount} related documents`);
    } catch (error: any) {
      console.error('Batch commit failed:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied: You do not have admin privileges to delete accounts. Ensure your admin document exists in the admins collection.');
      }
      throw new Error(`Failed to commit batch deletion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    await logAdminAction(
      adminId,
      adminName,
      'delete_account',
      userId,
      'user',
      'Deleted user account and all associated data'
    );
  } catch (error) {
    console.error('Account deletion error:', error);
    throw error;
  }
};

export const resetUserAccount = async (
  userId: string,
  adminId: string,
  adminName: string
): Promise<void> => {
  const batch = writeBatch(db);

  const enrollmentsRef = collection(db, 'enrollments');
  const enrollmentsQuery = query(enrollmentsRef, where('studentId', '==', userId));
  const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
  enrollmentsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  const attendanceRef = collection(db, 'classAttendance');
  const attendanceQuery = query(attendanceRef, where('studentId', '==', userId));
  const attendanceSnapshot = await getDocs(attendanceQuery);
  attendanceSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  const classesRef = collection(db, 'scheduledClasses');
  const classesQuery = query(classesRef, where('teacherId', '==', userId));
  const classesSnapshot = await getDocs(classesQuery);
  classesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  const coursesRef = collection(db, 'courses');
  const coursesQuery = query(coursesRef, where('instructorId', '==', userId));
  const coursesSnapshot = await getDocs(coursesQuery);
  coursesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  const account = await getUserAccount(userId);
  if (account) {
    const accountRef = doc(db, 'userAccounts', account.id);
    await updateDoc(accountRef, {
      updatedAt: new Date().toISOString(),
    });
  }

  await logAdminAction(
    adminId,
    adminName,
    'reset_account',
    userId,
    'user',
    'Reset user account - removed all enrollments, attendance, classes, and courses'
  );
};

export const getUserAccountWithDetails = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const account = await getUserAccount(userId);

  const enrollmentsRef = collection(db, 'enrollments');
  const enrollmentsQuery = query(enrollmentsRef, where('studentId', '==', userId));
  const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

  const coursesRef = collection(db, 'courses');
  const coursesQuery = query(coursesRef, where('instructorId', '==', userId));
  const coursesSnapshot = await getDocs(coursesQuery);

  return {
    user: userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null,
    account,
    enrollmentCount: enrollmentsSnapshot.size,
    courseCount: coursesSnapshot.size,
  };
};

export const updateUserProfile = async (
  userId: string,
  fullName: string,
  username?: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData: any = {
      fullName: fullName.trim(),
    };

    if (username !== undefined) {
      updateData.username = username.trim();
    }

    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to update profile'
    );
  }
};

export const changeUserPassword = async (
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error('No user authenticated');
    }

    const credential = EmailAuthProvider.credential(email, currentPassword);

    await reauthenticateWithCredential(auth.currentUser, credential);

    await updatePassword(auth.currentUser, newPassword);
  } catch (error: any) {
    console.error('Error changing password:', error);
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('New password is too weak');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('Please log out and log in again before changing your password');
    }
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to change password'
    );
  }
};

export const deleteUserAccountPermanently = async (
  userId: string
): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error('No user authenticated');
    }

    const batch = writeBatch(db);
    let operationCount = 0;

    try {
      const enrollmentsRef = collection(db, 'enrollments');
      const enrollmentsQuery = query(enrollmentsRef, where('studentId', '==', userId));
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      enrollmentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting enrollments:', error);
      throw new Error('Failed to delete enrollments');
    }

    try {
      const attendanceRef = collection(db, 'classAttendance');
      const attendanceQuery = query(attendanceRef, where('studentId', '==', userId));
      const attendanceSnapshot = await getDocs(attendanceQuery);
      attendanceSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting attendance records:', error);
      throw new Error('Failed to delete attendance records');
    }

    try {
      const classesRef = collection(db, 'scheduledClasses');
      const classesQuery = query(classesRef, where('teacherId', '==', userId));
      const classesSnapshot = await getDocs(classesQuery);
      classesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting classes:', error);
      throw new Error('Failed to delete classes');
    }

    try {
      const coursesRef = collection(db, 'courses');
      const coursesQuery = query(coursesRef, where('instructorId', '==', userId));
      const coursesSnapshot = await getDocs(coursesQuery);
      coursesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting courses:', error);
      throw new Error('Failed to delete courses');
    }

    try {
      const requestsRef = collection(db, 'course_requests');
      const requestsQuery = query(requestsRef, where('teacherId', '==', userId));
      const requestsSnapshot = await getDocs(requestsQuery);
      requestsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting course requests:', error);
      throw new Error('Failed to delete course requests');
    }

    try {
      const userRolesRef = collection(db, 'userRoles');
      const userRolesQuery = query(userRolesRef, where('userId', '==', userId));
      const userRolesSnapshot = await getDocs(userRolesQuery);
      userRolesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting user roles:', error);
      throw new Error('Failed to delete user roles');
    }

    try {
      const accountsRef = collection(db, 'userAccounts');
      const accountsQuery = query(accountsRef, where('userId', '==', userId));
      const accountsSnapshot = await getDocs(accountsQuery);
      accountsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw new Error('Failed to delete user account');
    }

    try {
      const notificationsRef = collection(db, 'notifications');
      const notificationsQuery = query(notificationsRef, where('teacherId', '==', userId));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      notificationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting notifications:', error);
      throw new Error('Failed to delete notifications');
    }

    try {
      const reviewsRef = collection(db, 'teacher_reviews');
      const studentReviewsQuery = query(reviewsRef, where('studentId', '==', userId));
      const studentReviewsSnapshot = await getDocs(studentReviewsQuery);
      studentReviewsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });

      const coordinatorReviewsQuery = query(reviewsRef, where('coordinatorId', '==', userId));
      const coordinatorReviewsSnapshot = await getDocs(coordinatorReviewsQuery);
      coordinatorReviewsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });

      const teacherReviewsQuery = query(reviewsRef, where('teacherId', '==', userId));
      const teacherReviewsSnapshot = await getDocs(teacherReviewsQuery);
      teacherReviewsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
      });
    } catch (error) {
      console.error('Error deleting reviews:', error);
      throw new Error('Failed to delete reviews');
    }

    try {
      const usersRef = doc(db, 'users', userId);
      batch.delete(usersRef);
      operationCount++;
    } catch (error) {
      console.error('Error preparing user deletion:', error);
      throw new Error('Failed to delete user document');
    }

    try {
      await batch.commit();
      console.log(`Successfully deleted account and ${operationCount} related documents`);
    } catch (error: any) {
      console.error('Batch commit failed:', error);
      throw new Error('Failed to commit account deletion');
    }

    try {
      await deleteUser(auth.currentUser);
      console.log('Firebase Auth user deleted successfully');
    } catch (error: any) {
      console.error('Error deleting Firebase Auth user:', error);
      throw new Error('Failed to delete authentication account');
    }
  } catch (error) {
    console.error('Account deletion error:', error);
    throw error;
  }
};
