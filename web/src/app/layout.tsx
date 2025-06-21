import './globals.css'
import type { Metadata } from 'next'
import { Cinzel, Cinzel_Decorative, Cormorant_Garamond } from 'next/font/google'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel-decorative',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'How to Drain Your Dragon (too) - ZK Dragon Battle Game',
  description: 'A multiplayer dragon battle game with commit-reveal mechanics built for the ZK Hackathon. Choose your dragons and battle other players!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${cinzelDecorative.variable} ${cormorant.variable} font-cormorant`}>
        {children}
      </body>
    </html>
  )
}
