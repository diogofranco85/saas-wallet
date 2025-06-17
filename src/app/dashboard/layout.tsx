"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Bell, Menu } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") return // Still loading

        if (!session) {
            router.push("/auth/signin")
            return
        }

        // Check if user needs onboarding
        if (!session.user.company) {
            router.push("/onboarding")
            return
        }
    }, [session, status, router])

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Carregando...</p>
                </div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Navigation */}
                        <div className="flex items-center space-x-8">
                            <Link href="/dashboard" className="flex items-center space-x-2">
                                <div className="text-2xl font-bold text-blue-600">HypePay</div>
                            </Link>

                            <nav className="hidden md:flex items-center space-x-6">
                                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                                    Dashboard
                                </Link>
                                <Link href="/dashboard/charges" className="text-gray-700 hover:text-blue-600 font-medium">
                                    Cobranças
                                </Link>
                                <Link href="/dashboard/team" className="text-gray-700 hover:text-blue-600 font-medium">
                                    Equipe
                                </Link>
                                <Link href="/dashboard/reports" className="text-gray-700 hover:text-blue-600 font-medium">
                                    Relatórios
                                </Link>
                            </nav>
                        </div>

                        {/* Right side - Notifications and User */}
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
                            </Button>

                            <UserNav />

                            {/* Mobile menu button */}
                            <Button variant="ghost" size="sm" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>{children}</main>
        </div>
    )
}
