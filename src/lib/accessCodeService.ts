import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { AccessCode, AuditLog } from '@/types';

export const generateAccessCode = (type: 'teacher' | 'coordinator'): string => {
  const length = type === 'teacher' ? 6 : 8;
  const code = Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
  return code;
};

export const checkCodeUniqueness = async (code: string): Promise<boolean> => {
  const codesRef = collection(db, 'accessCodes');
  const q = query(codesRef, where('code', '==', code));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
};

export const generateUniqueCode = async (type: 'teacher' | 'coordinator'): Promise<string> => {
  let code: string;
  let isUnique = false;

  while (!isUnique) {
    code = generateAccessCode(type);
    isUnique = await checkCodeUniqueness(code);
  }

  return code!;
};

export const createAccessCode = async (
  type: 'teacher' | 'coordinator',
  adminId: string,
  adminName: string
): Promise<AccessCode> => {
  const code = await generateUniqueCode(type);
  const now = new Date().toISOString();

  const accessCodeData: Omit<AccessCode, 'id'> = {
    code,
    type,
    status: 'unused',
    generatedAt: now,
    generatedBy: adminId,
    usedBy: null,
    usedAt: null,
  };

  const docRef = await addDoc(collection(db, 'accessCodes'), accessCodeData);

  await logAdminAction(
    adminId,
    adminName,
    'generate_code',
    docRef.id,
    'code',
    `Generated ${type} code: ${code}`
  );

  return {
    id: docRef.id,
    ...accessCodeData,
  };
};

export const createBulkAccessCodes = async (
  type: 'teacher' | 'coordinator',
  count: number,
  adminId: string,
  adminName: string
): Promise<AccessCode[]> => {
  const codes: AccessCode[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < count; i++) {
    const code = await generateUniqueCode(type);

    const accessCodeData: Omit<AccessCode, 'id'> = {
      code,
      type,
      status: 'unused',
      generatedAt: now,
      generatedBy: adminId,
      usedBy: null,
      usedAt: null,
    };

    const docRef = await addDoc(collection(db, 'accessCodes'), accessCodeData);

    codes.push({
      id: docRef.id,
      ...accessCodeData,
    });
  }

  await logAdminAction(
    adminId,
    adminName,
    'generate_code',
    'bulk',
    'code',
    `Generated ${count} ${type} codes`
  );

  return codes;
};

export const validateAccessCode = async (code: string, type: 'teacher' | 'coordinator'): Promise<AccessCode | null> => {
  const codesRef = collection(db, 'accessCodes');

  const exactLength = type === 'teacher' ? 6 : 8;
  if (code.length !== exactLength) {
    return null;
  }

  const q = query(
    codesRef,
    where('code', '==', code),
    where('type', '==', type)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const docSnap = querySnapshot.docs[0];
  const codeData = docSnap.data() as AccessCode;

  if (codeData.status === 'used') {
    return null;
  }

  return {
    id: docSnap.id,
    ...codeData
  } as AccessCode;
};

export const getAccessCodeByCode = async (code: string): Promise<AccessCode | null> => {
  const codesRef = collection(db, 'accessCodes');
  const q = query(codesRef, where('code', '==', code));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const docSnap = querySnapshot.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data()
  } as AccessCode;
};

export const markCodeAsUsed = async (codeId: string, userId: string): Promise<void> => {
  const codeRef = doc(db, 'accessCodes', codeId);
  await updateDoc(codeRef, {
    status: 'used',
    usedBy: userId,
    usedAt: new Date().toISOString(),
  });
};

export const getAllAccessCodes = async (): Promise<AccessCode[]> => {
  const codesRef = collection(db, 'accessCodes');
  const querySnapshot = await getDocs(codesRef);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as AccessCode));
};

export const deleteAccessCode = async (codeId: string): Promise<void> => {
  const codeRef = doc(db, 'accessCodes', codeId);
  await deleteDoc(codeRef);
};

export const logAdminAction = async (
  adminId: string,
  adminName: string,
  action: AuditLog['action'],
  targetId: string,
  targetType: 'user' | 'code',
  details: string
): Promise<void> => {
  const auditLogData: Omit<AuditLog, 'id'> = {
    adminId,
    adminName,
    action,
    targetId,
    targetType,
    details,
    timestamp: new Date().toISOString(),
  };

  await addDoc(collection(db, 'auditLogs'), auditLogData);
};

export const getAuditLogs = async (limit: number = 50): Promise<AuditLog[]> => {
  const logsRef = collection(db, 'auditLogs');
  const querySnapshot = await getDocs(logsRef);

  const logs = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as AuditLog));

  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return logs.slice(0, limit);
};
