import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Shield, Zap, Users, BarChart3 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-teal-600">
            <Image src="/hype-pay.png" alt="Hype Pay" width={150} height={100} />
          </div>
          <div className="space-x-4">
            <Link href="/auth/signin">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="bg-teal-700 hover:bg-teal-900">Começar Grátis</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Carteira Virtual com PIX
          <span className="text-teal-600"> Simplificado</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Gerencie pagamentos PIX da sua empresa de forma simples e segura. Crie cobranças, acompanhe recebimentos e
          controle sua carteira digital.
        </p>
        <Link href="/auth/signin">
          <Button size="lg" className="text-lg px-8 py-4">
            Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Por que escolher o HypePay?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle>PIX Instantâneo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Receba pagamentos PIX em tempo real com confirmação automática</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle>Segurança Total</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Integração segura com Stripe e criptografia de ponta a ponta</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle>Equipe Colaborativa</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Convide funcionários e gerencie permissões de acesso</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle>Relatórios Completos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Acompanhe todas as transações e performance da sua carteira</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Planos que se adaptam ao seu negócio</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>Para pequenas empresas</CardDescription>
              <div className="text-3xl font-bold">
                R$ 29,90<span className="text-sm font-normal">/mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Até 100 cobranças/mês</li>
                <li>• 3 funcionários</li>
                <li>• Taxa PIX: 2,99%</li>
                <li>• Suporte por email</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-teal-500 border-2">
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <CardDescription>Mais popular</CardDescription>
              <div className="text-3xl font-bold">
                R$ 79,90<span className="text-sm font-normal">/mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Até 500 cobranças/mês</li>
                <li>• 10 funcionários</li>
                <li>• Taxa PIX: 2,49%</li>
                <li>• Suporte prioritário</li>
                <li>• Marca personalizada</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>Para grandes empresas</CardDescription>
              <div className="text-3xl font-bold">
                R$ 199,90<span className="text-sm font-normal">/mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Cobranças ilimitadas</li>
                <li>• 50 funcionários</li>
                <li>• Taxa PIX: 1,99%</li>
                <li>• Suporte dedicado</li>
                <li>• API completa</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">HypePay</div>
          <p className="text-gray-400">© 2024 Hype Tecnologia e Informática. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
