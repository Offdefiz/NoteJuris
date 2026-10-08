import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseAvailable } from '../firebase';
import { UserProfile } from '../types/notebook';

interface LocalUser {
  uid: string;
  email: string;
  passwordHash?: string;
  displayName: string;
  role: string;
  themePreference: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: { uid: string; email: string | null; displayName: string | null } | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isSelfHostedMode: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string, role?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; email: string | null; displayName: string | null } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isSelfHostedMode = !isFirebaseAvailable;

  // Load active session on boot
  useEffect(() => {
    if (isFirebaseAvailable && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
          });

          try {
            if (db) {
              const userDocRef = doc(db, 'users', currentUser.uid);
              const userSnap = await getDoc(userDocRef);
              if (userSnap.exists()) {
                setProfile(userSnap.data() as UserProfile);
              } else {
                const initialProfile: UserProfile = {
                  userId: currentUser.uid,
                  email: currentUser.email || '',
                  displayName: currentUser.displayName || 'Estudante',
                  role: 'Estudante de Direito',
                  themePreference: 'light',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                await setDoc(userDocRef, initialProfile);
                setProfile(initialProfile);
              }
            }
          } catch (err) {
            console.warn('Firebase user sync failed, using local profile fallback:', err);
            setProfile({
              userId: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Estudante',
              role: 'Estudante de Direito',
              themePreference: 'light',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          // If not in firebase, check local storage
          checkLocalStorageUser();
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Self-hosted local mode without Google Cloud
      checkLocalStorageUser();
      setLoading(false);
    }
  }, []);

  const checkLocalStorageUser = () => {
    const savedSession = localStorage.getItem('caderno_juridico_active_user');
    if (savedSession) {
      try {
        const parsed: LocalUser = JSON.parse(savedSession);
        setUser({
          uid: parsed.uid,
          email: parsed.email,
          displayName: parsed.displayName,
        });
        setProfile({
          userId: parsed.uid,
          email: parsed.email,
          displayName: parsed.displayName,
          role: parsed.role,
          themePreference: parsed.themePreference || 'light',
          createdAt: parsed.createdAt,
          updatedAt: parsed.updatedAt,
        });
      } catch (e) {
        console.error('Failed to parse local user session:', e);
      }
    }
  };

  const getLocalUsers = (): LocalUser[] => {
    try {
      const data = localStorage.getItem('caderno_juridico_local_database_users');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveLocalUsers = (users: LocalUser[]) => {
    localStorage.setItem('caderno_juridico_local_database_users', JSON.stringify(users));
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);

    // Try Firebase if online & available
    if (isFirebaseAvailable && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        return;
      } catch (err: any) {
        // Fallback to local accounts if Firebase fails
        console.warn('Firebase sign-in failed, trying local self-hosted account:', err);
      }
    }

    // Self-hosted local account sign-in
    const users = getLocalUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!existing) {
      // Auto-provision user in self-hosted mode if not found, for frictionless experience!
      const newUser: LocalUser = {
        uid: `user-${Date.now()}`,
        email: normalizedEmail,
        displayName: normalizedEmail.split('@')[0],
        role: 'Estudante de Direito',
        themePreference: 'light',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(newUser);
      saveLocalUsers(users);
      localStorage.setItem('caderno_juridico_active_user', JSON.stringify(newUser));

      setUser({ uid: newUser.uid, email: newUser.email, displayName: newUser.displayName });
      setProfile({
        userId: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        themePreference: newUser.themePreference,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      });
      return;
    }

    localStorage.setItem('caderno_juridico_active_user', JSON.stringify(existing));
    setUser({ uid: existing.uid, email: existing.email, displayName: existing.displayName });
    setProfile({
      userId: existing.uid,
      email: existing.email,
      displayName: existing.displayName,
      role: existing.role,
      themePreference: existing.themePreference,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    });
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string, role = 'Estudante de Direito') => {
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();

    // If Firebase is available, register there first
    if (isFirebaseAvailable && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await updateFirebaseProfile(cred.user, { displayName });
        if (db) {
          const userDocRef = doc(db, 'users', cred.user.uid);
          await setDoc(userDocRef, {
            userId: cred.user.uid,
            email: normalizedEmail,
            displayName,
            role,
            themePreference: 'light',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        return;
      } catch (err: any) {
        console.warn('Firebase registration failed, registering as self-hosted user:', err);
      }
    }

    // Self-hosted local user registration
    const users = getLocalUsers();
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('Este e-mail já está cadastrado no servidor local.');
    }

    const newUser: LocalUser = {
      uid: `local-${Date.now()}`,
      email: normalizedEmail,
      displayName: displayName || normalizedEmail.split('@')[0],
      role,
      themePreference: 'light',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveLocalUsers(users);
    localStorage.setItem('caderno_juridico_active_user', JSON.stringify(newUser));

    setUser({ uid: newUser.uid, email: newUser.email, displayName: newUser.displayName });
    setProfile({
      userId: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
      themePreference: newUser.themePreference,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    });
  };

  const signInWithGoogle = async () => {
    setError(null);
    if (isFirebaseAvailable && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        return;
      } catch (err: any) {
        if (err.code === 'auth/popup-closed-by-user') return;
        console.warn('Google sign-in not available in self-hosted mode:', err);
      }
    }

    // In self-hosted mode without Google Cloud, create/login as Google Demo
    signInWithEmail('estudante@servidor.local', '123456');
  };

  const logOut = async () => {
    setError(null);
    if (isFirebaseAvailable && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn(e);
      }
    }
    localStorage.removeItem('caderno_juridico_active_user');
    setUser(null);
    setProfile(null);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    const updated = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString(),
    } as UserProfile;

    setProfile(updated);

    // Save to local storage
    if (user) {
      const activeUser: LocalUser = {
        uid: user.uid,
        email: user.email || '',
        displayName: updated.displayName,
        role: updated.role,
        themePreference: updated.themePreference,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
      localStorage.setItem('caderno_juridico_active_user', JSON.stringify(activeUser));

      const users = getLocalUsers().map((u) => (u.uid === user.uid ? activeUser : u));
      saveLocalUsers(users);

      // Also try Firestore if available
      if (isFirebaseAvailable && db) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            displayName: updated.displayName,
            role: updated.role,
            themePreference: updated.themePreference,
            updatedAt: updated.updatedAt,
          });
        } catch (e) {
          console.warn('Firestore profile update skipped:', e);
        }
      }
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        isSelfHostedMode,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logOut,
        updateUserProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
