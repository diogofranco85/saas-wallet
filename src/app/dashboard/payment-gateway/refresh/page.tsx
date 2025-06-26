"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import Link from "next/link"

export default function StripeRefreshPage() {
    useEffect(() => {
        // Tentar recriar o link de onboarding
        const refreshOnboarding = async () => {
            try {
                const response = await fetch("/api/stripe/accounts/links", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "onboarding" }),
                })

                if (response.ok) {
                    const data = await response.json()
                    window.location.href = data.url
                }
            } catch (error) {
                console.error("Error refreshing onboarding:", error)
            }
        }

        refreshOnboarding()
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                    <CardTitle>Atualizando Configuração</CardTitle>
                    <CardDescription>Estamos atualizando suas informações do Stripe. Aguarde um momento...</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                        Se você não for redirecionado automaticamente, clique no botão abaixo.
                    </p>
                    <Link href="/dashboard/stripe">
                        <Button variant="outline" className="w-full">
                            Voltar às Configurações
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
