
'use client';
import PoemWeaverPage from '@/components/poem-weaver-page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <PoemWeaverPage />
    </QueryClientProvider>
  );
}
