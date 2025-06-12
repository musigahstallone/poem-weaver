
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Wand2, RotateCcw, Loader2, AlertTriangleIcon, Save } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { generatePoem, type PoemGenerationInput } from '@/ai/flows/generate-poem';

const formSchema = z.object({
  theme: z.string().min(2, { message: "Theme must be at least 2 characters." }).max(100, { message: "Theme must be at most 100 characters." }),
  style: z.string().min(1, { message: "Please select a style." }),
});

type PoemFormValues = z.infer<typeof formSchema>;

const poetryStyles = [
  "Free Verse", "Romantic", "Haiku", "Sonnet", "Limerick", "Ode",
  "Ballad", "Elegy", "Acrostic", "Villanelle", "Narrative", "Descriptive",
  "Reflective", "Humorous", "Melancholic", "Inspirational", "Whimsical", "Mystical"
];

export default function PoemWeaverPage() {
  const [isLoadingPoem, setIsLoadingPoem] = useState(false);
  const [generatedPoem, setGeneratedPoem] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const form = useForm<PoemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: '',
      style: '',
    },
  });

  async function onGenerateSubmit(data: PoemFormValues) {
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

  function handleReset() {
    form.reset({ theme: '', style: '' });
    setGeneratedPoem(null);
    setCurrentTheme(null);
    setCurrentStyle(null);
    setAiError(null);
    setIsLoadingPoem(false);
  }

  function handleSavePoem() {
    if (!generatedPoem || !currentTheme || !currentStyle) return;
    // In a full app with user accounts, this would save to user-specific history.
    // For now, it just toasts a success message.
    toast({
      title: "Poem Saved (Simulated)",
      description: "Your poem has been notionally saved! In a full app, this would go to your history.",
    });
  }
  
  return (
    <>
      <div className="flex flex-col min-h-svh items-center bg-transparent">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 w-full">
          <header className="mb-8 text-center">
            <p className="text-muted-foreground mt-2 text-lg">Discover the magic of words!</p>
          </header>

          <Card className="w-full max-w-2xl shadow-2xl rounded-xl bg-card/90 backdrop-blur-md border-border/50">
            <CardHeader className="p-6 sm:p-8 text-center">
                <CardTitle className="text-3xl font-headline text-primary flex items-center justify-center gap-2">
                    <Wand2 className="h-8 w-8" />Craft Your Verse
                </CardTitle>
                <CardDescription className="pt-2 text-muted-foreground">Let the AI weave a poem for you.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
                <div className="space-y-6">
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onGenerateSubmit)} className="space-y-6">
                        <FormField
                        control={form.control}
                        name="theme"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-base">Theme for the Poem</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., A Magical Forest, Whispers of the Stars, A Gentle Heart" {...field} className="text-base py-3 px-4 rounded-md bg-background/70 focus:border-primary" />
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
                            <FormLabel className="text-base">Poetic Style</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger className="text-base py-3 px-4 rounded-md bg-background/70 focus:border-primary">
                                    <SelectValue placeholder="Choose a delightful style" />
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
                        <Button type="submit" disabled={isLoadingPoem} className="w-full sm:w-auto text-base px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-shadow">
                            {isLoadingPoem ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                            <Wand2 className="mr-2 h-5 w-5" />
                            )}
                            Generate Poem
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleReset} disabled={isLoadingPoem} className="w-full sm:w-auto text-base px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-shadow">
                            <RotateCcw className="mr-2 h-5 w-5" />
                            Start Anew
                        </Button>
                        </div>
                    </form>
                    </Form>

                    {aiError && (
                    <Alert variant="destructive" className="mt-6">
                        <AlertTriangleIcon className="h-5 w-5" />
                        <AlertTitle>Oh no, a little hiccup!</AlertTitle>
                        <AlertDescription>{aiError}</AlertDescription>
                    </Alert>
                    )}

                    {generatedPoem && (
                    <Card className="mt-6 bg-muted/30 border-primary/30 shadow-inner rounded-lg">
                        <CardHeader>
                        <CardTitle className="text-xl font-headline text-primary">Your Generated Poem</CardTitle>
                        <CardDescription>Theme: {currentTheme} | Style: {currentStyle}</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Textarea
                            value={generatedPoem}
                            readOnly
                            className="text-base py-3 px-4 rounded-md min-h-[200px] md:min-h-[250px] bg-background/50 border-border/50 focus-visible:ring-primary/50"
                            aria-label="Generated poem"
                        />
                        <Button onClick={handleSavePoem} className="mt-4 text-base px-5 py-2.5" variant="outline">
                            <Save className="mr-2 h-5 w-5" />
                            Save Poem (Simulated)
                        </Button>
                        </CardContent>
                    </Card>
                    )}
                </div>
            </CardContent>
          </Card>
          <footer className="mt-12 text-center text-muted-foreground text-sm space-y-2">
            <p>&copy; {new Date().getFullYear()} Poem Weaver.</p>
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
