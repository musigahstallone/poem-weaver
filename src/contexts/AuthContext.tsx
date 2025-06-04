
'use client';

import type { User } from 'firebase/auth';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase'; // Assuming firebase.ts exports auth
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAllowedUser: (email: string | null) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_EMAIL_PATTERNS = ['stallone', 'musigah', 'winsy', 'jill'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAllowedUser = (email: string | null): boolean => {
    if (!email) return false;
    return ALLOWED_EMAIL_PATTERNS.some(pattern => email.toLowerCase().includes(pattern));
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        if (isAllowedUser(firebaseUser.email)) {
          setUser(firebaseUser);
        } else {
          // User is authenticated but not allowed
          await firebaseSignOut(auth); // Sign them out
          setUser(null);
          if (pathname !== '/login') {
            router.push('/login?error=unauthorized');
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        if (isAllowedUser(result.user.email)) {
          setUser(result.user);
          router.push('/');
        } else {
          await firebaseSignOut(auth);
          setUser(null);
          router.push('/login?error=unauthorized');
          // Consider showing a toast message here as well
        }
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setUser(null);
      router.push('/login?error=signInFailed');
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
      // Handle sign out error, maybe show a toast
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user && pathname !== '/login') {
     return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, isAllowedUser }}>
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
