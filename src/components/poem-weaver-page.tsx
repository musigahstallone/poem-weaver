"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generatePoem, type GeneratePoemInput, type GeneratePoemOutput } from '@/ai/flows/generate-poem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Sparkles, Wand2, RotateCcw, Loader2, Heart } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const poemStyles = ["Ode", "Sonnet", "Haiku", "Free Verse", "Limerick"] as const;

const formSchema = z.object({
  theme: z.string().min(2, { message: "Theme must be at least 2 characters." }).max(100, { message: "Theme must be at most 100 characters." }),
  style: z.enum(poemStyles, { required_error: "Please select a poem style." }),
});

type PoemFormValues = z.infer<typeof formSchema>;

export default function PoemWeaverPage() {
  const [generatedPoem, setGeneratedPoem] = useState<string | null>(null);
  const [isLoadingPoem, setIsLoadingPoem] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animatePoem, setAnimatePoem] = useState(false);
  const [showDedicationModal, setShowDedicationModal] = useState(false);
  const { toast } = useToast();

  const form = useForm<PoemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: '',
      style: undefined,
    },
  });

  useEffect(() => {
    // Show dedication modal on initial load
    const hasSeenDedication = localStorage.getItem('seenDedicationStalloneToWinsy');
    if (!hasSeenDedication) {
      setShowDedicationModal(true);
    }
  }, []);

  const handleCloseDedicationModal = () => {
    setShowDedicationModal(false);
    localStorage.setItem('seenDedicationStalloneToWinsy', 'true');
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

  return (
    <>
      <AlertDialog open={showDedicationModal} onOpenChange={setShowDedicationModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" /> A Special Dedication
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 text-left">
              This app is lovingly dedicated to <strong>Winsy</strong>, from your friend <strong>Stallone</strong>.
              <br />
              May your days be filled with beautiful verses and endless inspiration!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseDedicationModal}>Continue to App</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col min-h-screen items-center justify-center p-4 md:p-8 bg-transparent">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 text-4xl md:text-5xl font-headline font-bold text-foreground">
            <Sparkles className="h-10 w-10 text-accent" />
            <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Poem Weaver</h1>
          </div>
          <p className="text-muted-foreground mt-2 text-lg">Discover the magic of words, a special space for Winsy.</p>
        </header>

        <Card className="w-full max-w-4xl shadow-2xl rounded-xl bg-card/90 backdrop-blur-md border-border/50">
          <CardContent className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
              <div className="space-y-6">
                <h2 className="text-2xl font-headline font-semibold text-foreground">Create Your Poem</h2>
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
              <Separator orientation="horizontal" className="block md:hidden my-4 bg-border/70" />

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
                    <p className="text-muted-foreground text-center">Winsy, your beautifully crafted poem will appear here. Let inspiration find you!</p>
                  )}
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
        <footer className="mt-12 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Poem Weaver. Specially for Winsy.</p>
          <p>Powered by Generative AI. With love from Stallone.</p>
        </footer>
      </div>
    </>
  );
}
