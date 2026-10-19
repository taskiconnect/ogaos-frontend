// src/app/layout.tsx
import { Providers } from '@/components/providers/Providers'
import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OgaOS – Business Operating System for Nigerian SMEs',
  description:
    'Track money, manage debts, staff, payments, and more — simple, built for traders and shop owners.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={5000}
          toastOptions={{
            classNames: {
              toast:
                'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
              description: 'group-[.toast]:text-muted-foreground',
              actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
              cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
            },
          }}
        />
      </body>
    </html>
  )
}
