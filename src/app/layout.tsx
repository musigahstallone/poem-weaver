
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Image from 'next/image';
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider> {/* Wrap with AuthProvider */}
          <div className="fixed inset-0 -z-10">
            <Image
              src="https://placehold.co/1920x1080.png?text=+" 
              alt="Elegant floral background"
              layout="fill"
              objectFit="cover"
              quality={80}
              data-ai-hint="elegant floral"
            />
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div> {/* Soft overlay for better text readability */}
          </div>
          <div className="relative z-0">
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
