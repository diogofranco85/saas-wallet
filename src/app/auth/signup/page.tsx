"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Chrome } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center">
                        <Image src="/hype-pay.png" alt="Hype Pay" width={150} height={100} className="m-2" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Bem-vindo</CardTitle>
                    <CardDescription>Entre com sua conta Google para continuar</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGoogleSignIn} className="w-full bg-teal-700 hover:bg-teal-900" size="lg">
                        <Chrome className="mr-2 h-5 w-5" />
                        Entrar com Google
                    </Button>
                </CardContent>
                <CardFooter className="text-center">
                    <p>Leia nossos <Link href="/terms-of-use" className="text-sm text-teal-500">termos e condições de uso</Link> da plataforma</p>
                </CardFooter>
            </Card>
        </div>
    )
}
