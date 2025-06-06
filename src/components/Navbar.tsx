
'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 w-full">
      <div className="max-w-6xl mx-auto flex items-center justify-center"> {/* Centered Navbar content */}
        <Link href="/" className="flex items-center gap-3 text-2xl md:text-3xl font-headline font-bold text-foreground hover:no-underline">
            <Sparkles className="h-8 w-8 text-accent" />
            <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Poem Weaver</h1>
        </Link>
      </div>
    </header>
  );
}
