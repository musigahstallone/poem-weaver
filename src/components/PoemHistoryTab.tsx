'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getPoemsForUser, type PoemHistoryItem } from '@/services/poemHistoryService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BookHeart, Info, Palette } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import PoemDisplayDialog from './PoemDisplayDialog';

function PoemHistoryCard({ item, onClick }: { item: PoemHistoryItem; onClick: (item: PoemHistoryItem) => void }) {
  return (
    <Card 
      className="mb-4 bg-card/70 backdrop-blur-sm border-border/30 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick(item)}
      aria-label={`View poem: ${item.theme}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-headline text-primary">{item.theme}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground space-y-0.5">
           <div className="flex items-center">
             <Palette className="mr-1 h-3 w-3 text-accent" /> Style: {item.style}
           </div>
          <div>
            Crafted {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : 'some time ago'}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-24">
          <p className="whitespace-pre-wrap text-sm text-foreground truncate">
            {item.poem.length > 150 ? item.poem.substring(0, 150) + "..." : item.poem}
          </p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default function PoemHistoryTab() {
  const { user } = useAuth();
  const [selectedPoem, setSelectedPoem] = useState<PoemHistoryItem | null>(null);
  const [isPoemDialogVisible, setIsPoemDialogVisible] = useState(false);

  const { data: poems, isLoading, error } = useQuery<PoemHistoryItem[], Error>({
    queryKey: ['poemHistory', user?.uid],
    queryFn: () => {
      if (!user?.uid) throw new Error("User not authenticated");
      return getPoemsForUser(user.uid);
    },
    enabled: !!user?.uid,
  });

  const handlePoemCardClick = (poem: PoemHistoryItem) => {
    setSelectedPoem(poem);
    setIsPoemDialogVisible(true);
  };

  const handleClosePoemDialog = () => {
    setIsPoemDialogVisible(false);
    setSelectedPoem(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />
        <p>Loading your poetic history...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-center p-4">Error loading history: {error.message}</p>;
  }

  if (!poems || poems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground p-6 text-center">
        <BookHeart className="h-16 w-16 text-primary/70 mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-foreground">No Poems Yet</h3>
        <p>Start generating beautiful poems, and they will appear here!</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[calc(100vh-380px)] md:h-[calc(100vh-350px)] lg:h-[450px] pr-3">
        <div className="space-y-4">
          {poems.map((item) => (
            <PoemHistoryCard key={item.id} item={item} onClick={handlePoemCardClick} />
          ))}
        </div>
      </ScrollArea>
      <PoemDisplayDialog
        poem={selectedPoem}
        isOpen={isPoemDialogVisible}
        onClose={handleClosePoemDialog}
      />
    </>
  );
}
