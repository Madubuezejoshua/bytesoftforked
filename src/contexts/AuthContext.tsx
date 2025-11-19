import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { markCodeAsUsed, validateAccessCode, getAccessCodeByCode } from '@/lib/accessCodeService';
import { getUserAccount } from '@/lib/accountManagementService';
import { generateUniqueUserId, recordCustomIdAsUsed } from '@/lib/userIdService';

interface User {
  id: string;
  email: string;
  role: 'student' | 'coordinator' | 'teacher' | 'admin';
  name: string;
  username?: string;
  fullName?: string;
  isVerified?: boolean;
  purchasedCourses?: string[];
  verificationType?: 'manual' | 'paystack' | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'coordinator' | 'teacher' | 'admin') => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: 'student' | 'coordinator' | 'teacher' | 'admin', accessCode?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('User authenticated with UID:', firebaseUser.uid);

          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (adminDoc.exists() && adminDoc.data().role === 'admin') {
            const adminData = adminDoc.data();
            const adminUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: 'admin' as const,
              name: adminData.name || 'Admin',
              fullName: adminData.fullName,
              username: adminData.username,
              isVerified: adminData.isVerified
            };
            console.log('Admin user loaded:', adminUser);
            setUser(adminUser);
            setLoading(false);
            return;
          }

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (!userData.role) {
              console.error('User document exists but has no role field:', userData);
              setUser(null);
              setLoading(false);
              return;
            }
            const user = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: userData.role as 'student' | 'coordinator' | 'teacher' | 'admin',
              name: userData.name || 'User',
              username: userData.username,
              fullName: userData.fullName,
              isVerified: userData.isVerified,
              purchasedCourses: userData.purchasedCourses,
              verificationType: userData.verificationType
            };
            console.log('User loaded from Firestore:', user);
            console.log('User role:', user.role);
            setUser(user);
          } else {
            console.warn('User document does not exist in Firestore for UID:', firebaseUser.uid);
            setUser(null);
          }
        } else {
          console.log('No authenticated user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user from Firestore:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'coordinator' | 'teacher' | 'admin'): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email, 'with role:', role);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase authentication successful for UID:', userCredential.user.uid);

      try {
        if (role === 'admin') {
          const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));

          if (adminDoc.exists() && adminDoc.data().role === 'admin') {
            const adminData = adminDoc.data();
            const adminUser = {
              id: userCredential.user.uid,
              email: userCredential.user.email || '',
              role: 'admin' as const,
              name: adminData.name || 'Admin',
              fullName: adminData.fullName,
              username: adminData.username,
              isVerified: adminData.isVerified
            };
            console.log('Admin login successful:', adminUser);
            setUser(adminUser);
            return true;
          } else {
            console.error('Admin document not found or role mismatch');
            await signOut(auth);
            return false;
          }
        }

        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        console.log('User document exists:', userDoc.exists());

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data from Firestore:', userData);

          if (userData.role === role) {
            const userAccount = await getUserAccount(userCredential.user.uid);
            if (userAccount && userAccount.status === 'suspended') {
              console.error('Account suspended:', userAccount.suspensionReason);
              await signOut(auth);
              return false;
            }
            const userObj = {
              id: userCredential.user.uid,
              email: userCredential.user.email || '',
              role: userData.role as 'student' | 'coordinator' | 'teacher' | 'admin',
              name: userData.name || 'User',
              username: userData.username,
              fullName: userData.fullName,
              isVerified: userData.isVerified,
              purchasedCourses: userData.purchasedCourses,
              verificationType: userData.verificationType
            };
            console.log('Login successful:', userObj);
            setUser(userObj);
            return true;
          } else {
            console.error('Role mismatch. Expected:', role, 'Got:', userData.role);
            await signOut(auth);
            return false;
          }
        } else {
          console.error('User document does not exist in Firestore');
          await signOut(auth);
          return false;
        }
      } catch (firestoreError) {
        console.error('Firestore read error during login:', firestoreError);
        await signOut(auth);
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        console.error('User not found with this email');
      } else if (error.code === 'auth/wrong-password') {
        console.error('Incorrect password');
      }
      return false;
    }
  };


  const signup = async (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'coordinator' | 'teacher' | 'admin',
    accessCode?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Starting signup for:', email, 'with role:', role);

      if (role === 'teacher' || role === 'coordinator') {
        if (!accessCode || !accessCode.trim()) {
          return {
            success: false,
            error: 'Access code is required for teachers and coordinators'
          };
        }

        const expectedLength = role === 'teacher' ? 6 : 8;
        if (accessCode.length !== expectedLength) {
          return {
            success: false,
            error: `${role === 'teacher' ? 'Teacher' : 'Coordinator'} access code must be exactly ${expectedLength} digits`
          };
        }

        console.log('Validating access code:', accessCode);
        const codeExists = await getAccessCodeByCode(accessCode);
        if (!codeExists) {
          console.error('Access code not found:', accessCode);
          return {
            success: false,
            error: 'This access code does not exist. Please contact the administrator.'
          };
        }

        if (codeExists.status === 'used') {
          console.error('Access code already used:', accessCode);
          return {
            success: false,
            error: 'This access code has already been used'
          };
        }

        const validCode = await validateAccessCode(accessCode, role);
        if (!validCode) {
          console.error('Access code validation failed for role:', role);
          return {
            success: false,
            error: `Invalid ${role} access code. Please check your code type and try again.`
          };
        }
        console.log('Access code validated successfully');
      }

      try {
        console.log('Creating Firebase account for:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        console.log('Firebase account created. UID:', userId);

        let customUserId = '';
        if (role === 'teacher' || role === 'coordinator') {
          console.log('Generating unique custom ID for:', role);
          try {
            customUserId = await generateUniqueUserId(role);
            console.log('Custom ID generated:', customUserId);

            try {
              await recordCustomIdAsUsed(customUserId, userId, role);
              console.log('Custom ID recorded as used');
            } catch (recordError) {
              console.error('Error recording custom ID:', recordError);
              await signOut(auth);
              return {
                success: false,
                error: 'Failed to finalize user ID. Please try again.'
              };
            }
          } catch (idError) {
            console.error('Error generating custom ID:', idError);
            await signOut(auth);
            return {
              success: false,
              error: 'Failed to generate user ID. Please try again.'
            };
          }
        }

        try {
          console.log('Creating user document');
          await setDoc(doc(db, 'users', userId), {
            email,
            name,
            role,
            customUserId: customUserId || null,
            createdAt: new Date().toISOString()
          });
          console.log('User document created successfully');
        } catch (e) {
          console.error('Error creating user document:', e);
          await signOut(auth);
          return {
            success: false,
            error: 'Failed to create user profile. Please try again.'
          };
        }

        try {
          console.log('Creating user role document');
          await addDoc(collection(db, 'userRoles'), {
            userId,
            role,
            createdAt: new Date().toISOString()
          });
          console.log('User role document created');
        } catch (e) {
          console.error('Error creating user role document:', e);
        }

        if ((role === 'teacher' || role === 'coordinator') && accessCode) {
          const validatedCode = await validateAccessCode(accessCode, role);
          if (validatedCode) {
            try {
              console.log('Marking access code as used');
              await markCodeAsUsed(validatedCode.id, userId);
              console.log('Access code marked as used');

              console.log('Creating user account document');
              await addDoc(collection(db, 'userAccounts'), {
                userId,
                customUserId,
                accessCode,
                role,
                status: 'active',
                name,
                email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
              console.log('User account document created');
            } catch (e) {
              console.error('Error marking code as used or creating account:', e);
              return {
                success: false,
                error: 'Failed to finalize account setup. Please contact support.'
              };
            }
          }
        } else if (role === 'student') {
          try {
            console.log('Creating student account document');
            await addDoc(collection(db, 'userAccounts'), {
              userId,
              accessCode: 'STUDENT',
              role,
              status: 'active',
              name,
              email,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            console.log('Student account document created');
          } catch (e) {
            console.error('Error creating student account document:', e);
            return {
              success: false,
              error: 'Failed to create account document. Please try again.'
            };
          }
        }

        console.log('Signup completed successfully. Setting user context');
        setUser({
          id: userId,
          email,
          role,
          name,
          fullName: name,
          username: '',
          isVerified: false,
          purchasedCourses: [],
          verificationType: null
        });

        return { success: true };
      } catch (authError: any) {
        console.error('Authentication error during signup:', authError);
        if (authError.code === 'auth/email-already-in-use') {
          return {
            success: false,
            error: 'This email is already registered'
          };
        } else if (authError.code === 'auth/weak-password') {
          return {
            success: false,
            error: 'Password is too weak. Please use a stronger password.'
          };
        } else if (authError.code === 'auth/invalid-email') {
          return {
            success: false,
            error: 'Invalid email address'
          };
        }
        return {
          success: false,
          error: 'Authentication failed. Please try again.'
        };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to create account. Please try again.'
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
