"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/helpers/formatCurrency"
import { ArrowRight, Shield, Zap, Users, BarChart3 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface IPlans {
  id: string;
  name: string;
  description: string,
  price: number;
  features: any;
  pix_fee_percentage: number
}

export default function LandingPage() {

  const [plans, setPlans] = useState<IPlans[]>([])

  useEffect(() => {
    handlerLoadPlans();
  }, [])

  const handlerLoadPlans = async () => {
    try {
      const response = await fetch("/api/public/plans", {
        method: "GET"
      })

      if (!response.ok) {
        toast.error("Error", { description: "Houve um error ao buscar os dados" })
        return;
      }

      const { plans: apiPlansData } = await response.json()
      setPlans(apiPlansData)
    } catch (error) {

    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-teal-600">
            <Image src="/hype-pay.png" alt="Hype Pay" width={200} height={150} />
          </div>
          <div className="space-x-4">
            <Link href="/auth/signin">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="bg-pink-500 hover:bg-pink-700">Começar Grátis</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl text-white mb-6">
          Carteira Virtual com PIX
          <span className="text-pink-600"> Simplificado</span>
        </h1>
        <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
          Gerencie pagamentos PIX da sua empresa de forma simples e segura. Crie cobranças, acompanhe recebimentos e
          controle sua carteira digital.
        </p>
        <Link href="/auth/signin">
          <Button size="lg" className="text-lg px-8 py-4 bg-pink-500 hover:bg-pink-700">
            Começar Agora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl text-center mb-12 text-white">Por que escolher o HypePay?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Zap className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle className="text-white">PIX Instantâneo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white">Receba pagamentos PIX em tempo real com confirmação automática</CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Shield className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle className="text-white">Segurança Total</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white">Integração segura com Stripe e criptografia de ponta a ponta</CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Users className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle className="text-white">Equipe Colaborativa</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white">Convide funcionários e gerencie permissões de acesso</CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle className="text-white">Relatórios Completos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white">Acompanhe todas as transações e performance da sua carteira</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl text-center mb-12 text-white">Planos que se adaptam ao seu negócio</h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {plans.map(plan => {
            return (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-300">{plan.description}</CardDescription>
                  <div className="text-pink-600 text-3xl">
                    {formatCurrency(plan.price)}<span className="text-sm font-normal"> / mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• {plan.features.billing}</li>
                    <li>• {plan.features.employees}</li>
                    <li>• Taxa Pix {plan.pix_fee_percentage}%</li>
                    <li>• {plan.features.support}</li>
                    {plan.features.brand && <li>• {plan.features.brand}</li>}
                  </ul>
                </CardContent>
              </Card>
            )
          })}


        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-md mb-1 text-pink-500">Hype Tecnologia e Informática LTDA</div>
          <p className="text-sm text-gray-400">CNPJ 41.904.207/0001-78 © 2024. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
