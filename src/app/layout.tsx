import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/shared/toast'

export const metadata: Metadata = {
  title: 'AI Automation Workflow System',
  description: 'Intelligent request classification, routing, and workflow management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
