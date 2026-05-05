import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'ВПО Платформа — Соціальна інтеграція переселенців',
  description: 'Веб-платформа для соціальної інтеграції внутрішньо переміщених осіб в Україні. Спільноти, події, ресурси та підтримка.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50 antialiased`}>
        {children}
      </body>
    </html>
  )
}
