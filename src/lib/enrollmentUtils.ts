import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Generate a unique enrollment code in format: SS-XXXXXX
 */
export function generateEnrollmentCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const prefix = 'SS-';
  let code = prefix;
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Ensure the enrollment code is unique in the database
 */
export async function createUniqueEnrollmentCode(): Promise<string> {
  let code: string;
  let exists: boolean;
  
  do {
    code = generateEnrollmentCode();
    const q = query(
      collection(db, 'enrollments'),
      where('enrollmentCode', '==', code)
    );
    const snapshot = await getDocs(q);
    exists = !snapshot.empty;
  } while (exists);
  
  return code;
}
