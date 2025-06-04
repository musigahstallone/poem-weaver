
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Image from 'next/image';
import { AuthProvider } from '@/contexts/AuthContext'; 

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
        {/* Removed Google Font link for Literata. 
            If Geist requires a CDN link, it would be added here.
            Example for Geist from CDN (if you choose to use one):
            <link href="https://fonts.cdnfonts.com/css/geist" rel="stylesheet" /> 
            For now, assuming Geist is available or self-hosted.
        */}
      </head>
      <body className="font-sans antialiased"> {/* Changed from font-body to font-sans */}
        <AuthProvider> 
          <div className="fixed inset-0 -z-10">
            <Image
              src="https://placehold.co/1920x1080.png?text=+" 
              alt="Elegant floral background"
              layout="fill"
              objectFit="cover"
              quality={80}
              data-ai-hint="elegant floral"
            />
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div> 
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
