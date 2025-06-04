"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Wand2, RotateCcw, Loader2, Heart, History, Save, AlertTriangleIcon } from 'lucide-react';
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
import { generatePoem } from '@/ai/flows/generate-poem';

const formSchema = z.object({
  theme: z.string().min(2, { message: "Theme must be at least 2 characters." }).max(100, { message: "Theme must be at most 100 characters." }),
  style: z.string().min(1, { message: "Please select a style." }),
});

type PoemFormValues = z.infer<typeof formSchema>;

const poetryStyles = [
  "Free Verse", "Romantic", "Haiku", "Sonnet", "Limerick", "Ode", 
  "Ballad", "Elegy", "Acrostic", "Villanelle", "Narrative", "Descriptive",
  "Reflective", "Humorous", "Melancholic", "Inspirational"
];

export default function PoemWeaverPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isLoadingPoem, setIsLoadingPoem] = useState(false);
  const [generatedPoem, setGeneratedPoem] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const [isSavingPoem, setIsSavingPoem] = useState(false);
  const [showDedicationModal, setShowDedicationModal] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("create");

  const form = useForm<PoemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: '',
      style: '',
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

  async function onGenerateSubmit(data: PoemFormValues) {
    if (!user) {
        toast({ title: "Not Authenticated", description: "Please log in to generate a poem.", variant: "destructive" });
        return;
    }
    setIsLoadingPoem(true);
    setGeneratedPoem(null);
    setAiError(null);
    setCurrentTheme(data.theme);
    setCurrentStyle(data.style);

    try {
      const result = await generatePoem({ theme: data.theme, style: data.style });
      setGeneratedPoem(result.poem);
    } catch (err) {
      console.error("Error generating poem:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate poem. Please try again.";
      setAiError(errorMessage);
      toast({
        title: "Error Generating Poem",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPoem(false);
    }
  }

  async function handleSavePoem() {
    if (!user || !generatedPoem || !currentTheme || !currentStyle) {
        toast({ title: "Cannot Save Poem", description: "No poem generated or missing details.", variant: "destructive" });
        return;
    }
    setIsSavingPoem(true);
    try {
      await savePoemToHistory(user.uid, currentTheme, currentStyle, generatedPoem);
      toast({
        title: "Poem Saved!",
        description: "Your masterpiece is saved to your history.",
      });
      queryClient.invalidateQueries({ queryKey: ['poemHistory', user.uid] });
      // Optionally reset parts of the form or generated content here
      // setGeneratedPoem(null); 
      // form.reset(); // or just reset generated poem related state
    } catch (err) {
      console.error("Error saving poem:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save poem. Please try again.";
      toast({
        title: "Error Saving Poem",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSavingPoem(false);
    }
  }

  function handleReset() {
    form.reset({ theme: '', style: '' });
    setGeneratedPoem(null);
    setCurrentTheme(null);
    setCurrentStyle(null);
    setAiError(null);
    setIsLoadingPoem(false);
    setIsSavingPoem(false);
  }

  let dedicationUserName = "Friend"; 
  if (user) {
    if (user.displayName) {
      const nameParts = user.displayName.split(' ');
      dedicationUserName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
    } else if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      dedicationUserName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      if (dedicationUserName.length > 15) { 
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
                        <Wand2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />Generate Poem
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-sm sm:text-base">
                        <History className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />Poem History
                    </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <TabsContent value="create">
                  <div className="space-y-6">
                      <h2 className="text-2xl font-headline font-semibold text-foreground">Craft Your Verse with AI</h2>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onGenerateSubmit)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="theme"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Theme</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Spring Morning, Lost Love, Starry Night" {...field} className="text-base py-3 px-4 rounded-md" />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="text-base py-3 px-4 rounded-md">
                                      <SelectValue placeholder="Select a poetry style" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {poetryStyles.map(style => (
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
                          <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <Button type="submit" disabled={isLoadingPoem || isSavingPoem} className="w-full sm:w-auto text-base px-6 py-3 rounded-md">
                              {isLoadingPoem ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              ) : (
                                <Wand2 className="mr-2 h-5 w-5" />
                              )}
                              Generate Poem
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleReset} disabled={isLoadingPoem || isSavingPoem} className="w-full sm:w-auto text-base px-6 py-3 rounded-md">
                              <RotateCcw className="mr-2 h-5 w-5" />
                              Reset
                            </Button>
                          </div>
                        </form>
                      </Form>

                      {aiError && (
                        <Alert variant="destructive" className="mt-6">
                          <AlertTriangleIcon className="h-5 w-5" />
                          <AlertTitle>Generation Failed</AlertTitle>
                          <AlertDescription>{aiError}</AlertDescription>
                        </Alert>
                      )}

                      {generatedPoem && (
                        <Card className="mt-6 bg-muted/30 border-primary/30 shadow-inner">
                          <CardHeader>
                            <CardTitle className="text-xl font-headline text-primary">Your Generated Poem</CardTitle>
                            <CardDescription>Theme: {currentTheme} | Style: {currentStyle}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Textarea
                              value={generatedPoem}
                              readOnly
                              className="text-base py-3 px-4 rounded-md min-h-[200px] md:min-h-[250px] bg-background/70 focus-visible:ring-primary/50"
                              aria-label="Generated poem"
                            />
                            <Button onClick={handleSavePoem} disabled={isSavingPoem} className="mt-4 text-base px-6 py-3 rounded-md">
                              {isSavingPoem ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              ) : (
                                <Save className="mr-2 h-5 w-5" />
                              )}
                              Save This Poem
                            </Button>
                          </CardContent>
                        </Card>
                      )}
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
