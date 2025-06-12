import { Toaster } from '@repo/ui/components/sonner';
import '@/styles/index.css';

import { AppProviders } from '@/components/providers';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'React Boilerplate',
  description: 'A complete toolkit for modern React development, production-ready application architecture',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <AppProviders>
          <Toaster />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
