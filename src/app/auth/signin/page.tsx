"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Chrome } from "lucide-react"

export default function SignIn() {
    const router = useRouter()

    useEffect(() => {
        const checkSession = async () => {
            const session = await getSession()
            if (session) {
                router.push("/dashboard")
            }
        }
        checkSession()
    }, [router])

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/dashboard" })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Bem-vindo ao HypePay</CardTitle>
                    <CardDescription>Entre com sua conta Google para continuar</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGoogleSignIn} className="w-full" size="lg">
                        <Chrome className="mr-2 h-5 w-5" />
                        Entrar com Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
