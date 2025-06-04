
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, User, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, loading, deleteUserAccount, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteUserAccount();
    if (typeof result === 'string') {
      setDeleteError(result);
      toast({
        title: "Error Deleting Account",
        description: result,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      // AuthContext handles redirect to /login on successful deletion
    }
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
    <div className="fixed inset-0 -z-10">
        <Image
            src="https://placehold.co/1920x1080.png?text=+" 
            alt="Elegant floral background"
            layout="fill"
            objectFit="cover"
            quality={80}
            data-ai-hint="serene abstract"
        />
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm"></div>
    </div>
    <div className="flex flex-col min-h-svh items-center relative z-10">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 w-full">
        <Card className="w-full max-w-md shadow-2xl rounded-xl bg-card/90 backdrop-blur-md border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {user.photoURL ? (
                <Image src={user.photoURL} alt={user.displayName || "User"} width={96} height={96} className="h-24 w-24 rounded-full border-4 border-primary shadow-lg" />
              ) : (
                <User className="h-24 w-24 text-primary p-3 bg-primary/10 rounded-full border-4 border-primary" />
              )}
            </div>
            <CardTitle className="text-3xl font-headline text-foreground">Your Profile</CardTitle>
            <CardDescription className="text-muted-foreground pt-1">Manage your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Display Name</p>
              <p className="text-lg text-foreground">{user.displayName || 'Not set'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg text-foreground">{user.email}</p>
            </div>

            {deleteError && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <p>{deleteError}</p>
              </div>
            )}

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full text-base py-3 rounded-md">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card/95 backdrop-blur-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-headline">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="pt-2 text-base text-foreground/80">
                    This action cannot be undone. This will permanently delete your
                    account and remove your data (including all saved poems) from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-base px-5 py-2.5">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-base px-5 py-2.5"
                  >
                    {isDeleting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Trash2 className="mr-2 h-5 w-5" />}
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={signOut} className="w-full text-base py-3 rounded-md">
                Log Out
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
    </>
  );
}
