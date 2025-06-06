
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Poem Weaver for Winsy',
  description: 'Craft beautiful poems, dedicated to Winsy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Geist font is now primarily managed via Tailwind and globals.css */}
      </head>
      <body className="font-sans antialiased">
        <div className="fixed inset-0 -z-10">
          <Image
            src="https://placehold.co/1920x1080.png?text=+"
            alt="Elegant floral background for Winsy's Poem Weaver"
            layout="fill"
            objectFit="cover"
            quality={80}
            data-ai-hint="dreamy floral pastel"
          />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div>
        </div>
        <div className="relative z-0">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
