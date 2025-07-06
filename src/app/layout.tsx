import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import type React from "react"
import "./globals.css"
import { Providers } from "./provider"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner";

const font = DM_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HypePay - Carteira Virtual com PIX",
  description: "Gerencie pagamentos PIX da sua empresa de forma simples e segura",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={cn(font.className, 'bg-gray-800')}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
