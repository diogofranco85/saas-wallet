import type { Metadata } from "next"
import { Roboto_Flex } from "next/font/google"
import type React from "react"
import "./globals.css"
import { Providers } from "./provider"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

const font = Roboto_Flex({ subsets: ["latin"] })

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
          <Toaster position="top-right" toastOptions={{
            style: {
              background: "#1f2937",
              color: "#be185d"
            }
          }} />
        </Providers>
      </body>
    </html>
  )
}
