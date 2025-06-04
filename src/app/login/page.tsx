
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type SignInFormValues = z.infer<typeof signInSchema>;

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"], // path to show error under
});
type RegisterFormValues = z.infer<typeof registerSchema>;


export default function LoginPage() {
  const { user, signInWithGoogle, registerWithEmail, signInWithEmail, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'signInFailed') {
      setAuthError("Sign-in failed. Please try again or check your credentials.");
    } else if (errorParam) {
       setAuthError("An unexpected error occurred. Please try again.");
    }
  }, [searchParams]);
  

  const handleAuthError = (errorCode: string | null | undefined) => {
    if (!errorCode) {
      setAuthError("An unexpected error occurred. Please try again.");
      return;
    }
    switch (errorCode) {
      case 'auth/invalid-email':
        setAuthError('Invalid email address format.');
        break;
      case 'auth/user-disabled':
        setAuthError('This user account has been disabled.');
        break;
      case 'auth/user-not-found':
        setAuthError('No user found with this email. Please register or check your email.');
        break;
      case 'auth/wrong-password':
        setAuthError('Incorrect password. Please try again.');
        break;
      case 'auth/invalid-credential':
        setAuthError('Invalid email or password. Please check your credentials and try again.');
        break;
      case 'auth/email-already-in-use':
        setAuthError('This email is already registered. Please sign in.');
        break;
      case 'auth/weak-password':
        setAuthError('Password is too weak. It should be at least 6 characters.');
        break;
      default:
        setAuthError('Authentication failed. Please try again.');
        break;
    }
  };

  const onSignInSubmit = async (data: SignInFormValues) => {
    setAuthError(null);
    const result = await signInWithEmail(data.email, data.password);
    if (typeof result === 'string') { // Error code returned
      handleAuthError(result);
    } else if (result) { // User object returned
      router.push('/');
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setAuthError(null);
    const result = await registerWithEmail(data.email, data.password);
     if (typeof result === 'string') { // Error code returned
      handleAuthError(result);
    } else if (result) { // User object returned
      router.push('/');
    }
  };
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);


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
          <CardDescription className="text-muted-foreground pt-1">Please sign in or register to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {authError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p>{authError}</p>
            </div>
          )}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="pt-4">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={togglePasswordVisibility}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading} className="w-full text-base py-3 rounded-md">
                    {loading && signInForm.formState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                    Sign In with Email
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="register" className="pt-4">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                           <div className="relative">
                            <Input type={showPassword ? "text" : "password"} placeholder="Choose a strong password" {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={togglePasswordVisibility}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                           <div className="relative">
                            <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" {...field} />
                             <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={toggleConfirmPasswordVisibility}>
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading} className="w-full text-base py-3 rounded-md">
                    {loading && registerForm.formState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                    Register with Email
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/70" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={signInWithGoogle}
            disabled={loading}
            variant="outline"
            className="w-full text-base py-3 rounded-md"
            size="lg"
          >
            {loading && !signInForm.formState.isSubmitting && !registerForm.formState.isSubmitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              // Basic Google Icon SVG - consider using a library or better SVG if available
              <svg className="mr-2 h-5 w-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.84-4.1 1.84-4.76 0-8.64-3.88-8.64-8.64s3.88-8.64 8.64-8.64c2.36 0 3.92.76 4.95 1.84l2.56-2.47C19.92.54 17.1.001 12.48 0C5.86.001.32 5.39.32 12.32s5.54 12.32 12.16 12.32c3.36 0 5.92-1.16 7.84-3.08 2.08-2.08 2.84-5.08 2.84-7.52-.08-.65-.16-1.25-.24-1.84h-7.84z" fill="#4285F4"/></svg>
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
