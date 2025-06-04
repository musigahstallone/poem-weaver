
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 w-full">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 text-2xl md:text-3xl font-headline font-bold text-foreground">
            <Sparkles className="h-8 w-8 text-accent" />
            <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Poem Weaver</h1>
        </div>
        {user && !loading && (
          <div className="flex items-center gap-3">
            {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="h-8 w-8 rounded-full border-2 border-primary" />
            ) : (
                <UserCircle className="h-8 w-8 text-primary" />
            )}
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.displayName || user.email}</span>
            <Button onClick={signOut} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <LogOut className="mr-1 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
