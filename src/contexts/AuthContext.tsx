
'use client';

import type { User } from 'firebase/auth';
import { signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword, deleteUser as firebaseDeleteUser } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  registerWithEmail: (email: string, pass: string) => Promise<User | null | string>;
  signInWithEmail: (email: string, pass: string) => Promise<User | null | string>;
  signOut: () => Promise<void>;
  deleteUserAccount: () => Promise<boolean | string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerWithEmail = async (email: string, pass: string): Promise<User | null | string> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      router.push('/');
      return userCredential.user;
    } catch (error: any) {
      console.error("Error registering with email:", error);
      return error.code || "registrationFailed";
    } finally {
      setLoading(false);
    }
  };
  
  const signInWithEmail = async (email: string, pass: string): Promise<User | null | string> => {
    setLoading(true);
    try {
      const userCredential = await firebaseSignInWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      router.push('/');
      return userCredential.user;
    } catch (error: any) {
      console.error("Error signing in with email:", error);
      return error.code || "signInFailed";
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUserAccount = async (): Promise<boolean | string> => {
    if (!auth.currentUser) return "User not authenticated.";
    setLoading(true);
    try {
      // TODO: Implement a server action to delete user's poems from Firestore
      // For now, this only deletes the Firebase Auth record.
      await firebaseDeleteUser(auth.currentUser);
      setUser(null);
      setLoading(false);
      router.push('/login'); // Redirect after deletion
      return true;
    } catch (error: any) {
      console.error("Error deleting user account:", error);
      setLoading(false);
      if (error.code === 'auth/requires-recent-login') {
        return "This operation is sensitive and requires recent authentication. Please sign out and sign back in, then try again to delete your account.";
      }
      return error.message || "deleteAccountFailed";
    }
  };


  if (loading && pathname !== '/login') {
     return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, registerWithEmail, signInWithEmail, signOut, deleteUserAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
