"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function StripeSuccessPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirecionar automaticamente após 5 segundos
        const timer = setTimeout(() => {
            router.push("/dashboard/stripe")
        }, 5000)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CheckCircle className="h-12 w-12 text-teal-500 mx-auto mb-4" />
                    <CardTitle className="text-teal-600">Configuração Concluída!</CardTitle>
                    <CardDescription>
                        Sua conta Stripe foi configurada com sucesso. Agora você pode receber pagamentos PIX.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">Você será redirecionado automaticamente em alguns segundos...</p>
                    <div className="space-y-2">
                        <Link href="/dashboard/stripe">
                            <Button className="w-full">Ir para Configurações Stripe</Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="outline" className="w-full">
                                Voltar ao Dashboard
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
