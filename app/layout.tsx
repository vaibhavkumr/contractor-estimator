import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QuoteKit — AI Estimator for Trade Contractors',
  description: 'Generate professional job quotes in 60 seconds. Built for plumbers, electricians, HVAC companies, and general contractors.',
  keywords: 'contractor estimator, quote software, plumbing estimate, electrical estimate, HVAC quote',
  openGraph: {
    title: 'QuoteKit — AI Estimator for Trade Contractors',
    description: 'Generate professional job quotes in 60 seconds.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
