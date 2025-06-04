'use client';

import type { PoemHistoryItem } from '@/services/poemHistoryService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { X, Info, Palette } from 'lucide-react';

interface PoemDisplayDialogProps {
  poem: PoemHistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PoemDisplayDialog({ poem, isOpen, onClose }: PoemDisplayDialogProps) {
  if (!poem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-md border-border/50 shadow-xl rounded-lg">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-2xl font-headline text-primary">{poem.theme}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1 space-y-1">
            <div className="flex items-center">
              <Palette className="mr-2 h-4 w-4 text-accent" />
              <span>Style: {poem.style}</span>
            </div>
            <div>Crafted {poem.createdAt ? formatDistanceToNow(poem.createdAt.toDate(), { addSuffix: true }) : 'some time ago'}</div>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[50vh] max-h-[400px] my-4 pr-4 rounded-md border border-border/30 bg-muted/20 p-4">
          <p className="whitespace-pre-wrap text-base text-foreground">{poem.poem}</p>
        </ScrollArea>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
         <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
