// app/layout.tsx — REPLACE existing

import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinqAI — AI Workflow Builder',
  description: 'Build AI-powered marketing workflows visually',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-gray-950 text-white antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}