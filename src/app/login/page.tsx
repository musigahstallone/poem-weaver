
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, LogIn } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  let errorMessage = null;
  if (error === 'unauthorized') {
    errorMessage = "Sorry, your email is not authorized to access this app.";
  } else if (error === 'signInFailed') {
    errorMessage = "Sign-in failed. Please try again.";
  }

  return (
    <div className="flex flex-col min-h-svh items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
       <div className="fixed inset-0 -z-10">
          <Image
            src="https://placehold.co/1920x1080.png?text=+"
            alt="Elegant floral background for login"
            layout="fill"
            objectFit="cover"
            quality={80}
            data-ai-hint="soft abstract"
          />
           <div className="absolute inset-0 bg-background/70 backdrop-blur-sm"></div>
        </div>
      <Card className="w-full max-w-md shadow-2xl rounded-xl bg-card/90 backdrop-blur-md border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-foreground">Welcome to Poem Weaver</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p>{errorMessage}</p>
            </div>
          )}
          <Button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full text-base py-3 rounded-md"
            size="lg"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
       <footer className="mt-12 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Poem Weaver. A special place crafted with words.</p>
      </footer>
    </div>
  );
}
