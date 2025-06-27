"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Chrome, ArrowUpRightFromSquare, ArrowLeftIcon } from "lucide-react"
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
    <div className="min-h-screen flex items-center justify-center bg-pink-800">
      <div className="w-full flex max-w-md border-pink-800 flex-col gap-6 py-6">
        <CardHeader className="text-center">
          <div className="flex justify-center my-4">
            <p className="flex text-white text-3xl">
              <ArrowUpRightFromSquare className="text-white mr-3" size={36} />
              Hypepay
            </p>
          </div>
          <CardTitle className="text-2xl text-slate-100 mb-5">Hey 😁, Bem-vindo</CardTitle>
          <CardDescription className=" text-slate-300">Entre com sua conta Google para acessar o dashboard ou se cadastrar</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleSignIn} className="w-full bg-gray-900 hover:bg-gray-800" size="lg">
            <Chrome className="mr-2 h-5 w-5" />
            Entrar com Google
          </Button>
          <Link href="/">
            <Button className="w-full bg-slate-100 hover:bg-slate-300 text-gray-800 mt-5" size="lg">
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              Voltar pra home
            </Button>
          </Link>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-slate-300">Leia nossos <Link href="/terms-of-use" className="text-slate-900"> termos e condições de uso </Link> da plataforma</p>
        </CardFooter>
      </div>
    </div>
  )
}
