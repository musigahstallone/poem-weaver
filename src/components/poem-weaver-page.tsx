
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generatePoem, type GeneratePoemInput, type GeneratePoemOutput } from '@/ai/flows/generate-poem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Sparkles, Wand2, RotateCcw, Loader2, Heart, BookMarked, History } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { savePoemToHistory } from '@/services/poemHistoryService';
import PoemHistoryTab from '@/components/PoemHistoryTab';
import { useQueryClient } from '@tanstack/react-query';


const poemStyles = ["Ode", "Sonnet", "Haiku", "Free Verse", "Limerick"] as const;

const formSchema = z.object({
  theme: z.string().min(2, { message: "Theme must be at least 2 characters." }).max(100, { message: "Theme must be at most 100 characters." }),
  style: z.enum(poemStyles, { required_error: "Please select a poem style." }),
});

type PoemFormValues = z.infer<typeof formSchema>;

export default function PoemWeaverPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [generatedPoem, setGeneratedPoem] = useState<string | null>(null);
  const [isLoadingPoem, setIsLoadingPoem] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animatePoem, setAnimatePoem] = useState(false);
  const [showDedicationModal, setShowDedicationModal] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("create");

  const form = useForm<PoemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: '',
      style: undefined,
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) { 
      const hasSeenDedication = localStorage.getItem(`seenDedicationStalloneToUser_${user.uid}`);
      if (!hasSeenDedication) {
        setShowDedicationModal(true);
      }
    }
  }, [user]);

  const handleCloseDedicationModal = () => {
    setShowDedicationModal(false);
    if (user) {
      localStorage.setItem(`seenDedicationStalloneToUser_${user.uid}`, 'true');
    }
  };

  async function onSubmit(data: PoemFormValues) {
    setIsLoadingPoem(true);
    setError(null);
    setGeneratedPoem(null);
    setAnimatePoem(false);

    try {
      const result: GeneratePoemOutput = await generatePoem({
        theme: data.theme,
        style: data.style,
      });
      setGeneratedPoem(result.poem);
      setTimeout(() => setAnimatePoem(true), 50);

      if (user && result.poem) {
        await savePoemToHistory(user.uid, data, result);
        toast({
          title: "Poem Saved!",
          description: "Your masterpiece is saved to your history.",
        });
        queryClient.invalidateQueries({ queryKey: ['poemHistory', user.uid] });
      }
    } catch (err) {
      console.error("Error generating poem:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate poem. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPoem(false);
    }
  }

  function handleReset() {
    form.reset({ theme: '', style: undefined });
    setGeneratedPoem(null);
    setError(null);
    setAnimatePoem(false);
  }

  let dedicationUserName = "Friend"; 
  if (user) {
    if (user.displayName) {
      const nameParts = user.displayName.split(' ');
      dedicationUserName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
    } else if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      dedicationUserName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      if (dedicationUserName.length > 15) { // Avoid very long email prefixes
        dedicationUserName = "User";
      }
    }
  }
  
  const initialDedicationMessage = `This app is lovingly dedicated to ${dedicationUserName} from your friend, Stallone. May your days be filled with beautiful verses and endless inspiration!`;


  if (authLoading || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <AlertDialog open={showDedicationModal} onOpenChange={setShowDedicationModal}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-2xl font-headline">
              <Heart className="h-7 w-7 text-primary" /> A Special Dedication
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-3 text-base text-foreground/80 text-left">
              {initialDedicationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseDedicationModal} className="text-base px-5 py-2.5">Continue to App</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="flex flex-col min-h-svh items-center bg-transparent">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 w-full">
          <header className="mb-8 text-center">
            <p className="text-muted-foreground mt-2 text-lg">Discover the magic of words, {dedicationUserName}!</p>
          </header>

          <Card className="w-full max-w-4xl shadow-2xl rounded-xl bg-card/90 backdrop-blur-md border-border/50">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="p-4 sm:p-6 border-b border-border/30">
                <TabsList className="grid w-full grid-cols-2 md:w-auto md:mx-auto">
                    <TabsTrigger value="create" className="text-sm sm:text-base">
                        <Wand2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />Create Poem
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-sm sm:text-base">
                        <History className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />Poem History
                    </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <TabsContent value="create">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                    <div className="space-y-6">
                      <h2 className="text-2xl font-headline font-semibold text-foreground">Compose Your Verse</h2>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="theme"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Theme</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., First Bloom, Gentle Rain, Serene Sunset" {...field} className="text-base py-3 px-4 rounded-md" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="style"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Style</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="text-base py-3 px-4 rounded-md">
                                      <SelectValue placeholder="Select a poem style" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {poemStyles.map((style) => (
                                      <SelectItem key={style} value={style} className="text-base">
                                        {style}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button type="submit" disabled={isLoadingPoem} className="w-full sm:w-auto text-base px-6 py-3 rounded-md">
                              {isLoadingPoem ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              ) : (
                                <Wand2 className="mr-2 h-5 w-5" />
                              )}
                              Generate Poem
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleReset} disabled={isLoadingPoem} className="w-full sm:w-auto text-base px-6 py-3 rounded-md">
                              <RotateCcw className="mr-2 h-5 w-5" />
                              Reset
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>

                    <Separator orientation="vertical" className="hidden md:block mx-auto h-auto bg-border/70" />
                    <Separator orientation="horizontal" className="block md:hidden my-6 bg-border/70" />

                    <div className="space-y-4">
                      <h2 className="text-2xl font-headline font-semibold text-foreground">Your Poetic Creation</h2>
                      <Card className="min-h-[250px] md:min-h-[300px] flex items-center justify-center p-6 bg-muted/30 rounded-lg border-dashed border-border/50">
                        {isLoadingPoem ? (
                          <div className="text-center text-muted-foreground">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-2" />
                            <p>Weaving your masterpiece...</p>
                          </div>
                        ) : error ? (
                          <p className="text-destructive text-center">{error}</p>
                        ) : generatedPoem ? (
                          <div
                            className={cn(
                              "whitespace-pre-wrap text-foreground text-left w-full transition-opacity duration-1000 ease-in-out",
                              animatePoem ? "opacity-100" : "opacity-0"
                            )}
                          >
                            {generatedPoem}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <BookMarked className="h-12 w-12 text-primary/70 mx-auto mb-3" />
                             <p>{dedicationUserName}, your beautifully crafted poem will appear here. Let inspiration find you!</p>
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="history">
                   <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Your Saved Poems</h2>
                   <PoemHistoryTab />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
          <footer className="mt-12 text-center text-muted-foreground text-sm space-y-2">
            <p>&copy; {new Date().getFullYear()} Poem Weaver. Specially for {dedicationUserName}, from Stallone.</p>
            <p className="text-xs">
              Developed by Stallone Musigah
              <br />
              <a href="https://musigahstallone.tech" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">
                musigahstallone.tech
              </a>
              {' | '}0797204141
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
