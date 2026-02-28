import React from "react"
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { KakaoButton } from "@/components/kakao-button"
import { Toaster } from "@/components/ui/toaster"
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: '--font-cormorant'
});

export const metadata: Metadata = {
  title: 'ETERNA | 럭셔리 큐레이션',
  description: '시대를 초월한 럭셔리 아이템을 엄선하여 소개합니다',
  generator: 'v0.app',
  icons: {
    icon: '/01_logo.jpg',
    apple: '/01_logo.jpg',
  },
  openGraph: {
    title: 'ETERNA | 럭셔리 큐레이션',
    description: '시대를 초월한 럭셔리 아이템을 엄선하여 소개합니다',
    url: 'https://eterna.vercel.app',
    siteName: 'ETERNA',
    images: [
      {
        url: '/01_logo.jpg',
        width: 800,
        height: 800,
        alt: 'ETERNA Logo',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${cormorant.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
        <KakaoButton />
        <Analytics />
      </body>
    </html>
  )
}

