import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import Navbar from '@/components/navbar';
import Hero from '@/features/home/components/hero';
import { queryClient } from '@/lib/query-client';
import TechStack from '@/features/home/components/tech-stack';

export default async function Home() {
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 pb-20 sm:p-20">
        <Navbar />
        <main className="flex h-full w-full flex-1 flex-col">
          <Hero />
          <TechStack />
        </main>
      </div>
    </HydrationBoundary>
  );
}
