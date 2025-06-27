"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Wallet,
  TrendingUp,
  Users,
  Plus,
  Eye,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { formatDate } from "@/helpers/formatDate"

interface WalletData {
  balance: number
  availableBalance: number
  pendingBalance: number
}

interface RecentCharge {
  id: string
  amount: number
  description: string
  status: string
  createdAt: string
  payerName?: string
}

interface DashboardStats {
  totalCharges: number
  totalRevenue: number
  successRate: number
  activeMembers: number
}

export default function Dashboard() {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    availableBalance: 0,
    pendingBalance: 0,
  })
  const [recentCharges, setRecentCharges] = useState<RecentCharge[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalCharges: 0,
    totalRevenue: 0,
    successRate: 0,
    activeMembers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [walletResponse, chargesResponse] = await Promise.all([fetch("/api/wallet"), fetch("/api/charges?limit=5")])

      const walletData = await walletResponse.json()
      const chargesData = await chargesResponse.json()

      setWalletData(walletData)
      setRecentCharges(chargesData.charges || [])

      // Simular estatísticas (em produção, viria de uma API)
      setStats({
        totalCharges: chargesData.pagination?.total || 0,
        totalRevenue: walletData.balance + walletData.availableBalance,
        successRate: 85.5,
        activeMembers: 3,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago"
      case "pending":
        return "Pendente"
      case "expired":
        return "Expirado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral da sua carteira e atividades recentes"
        action={
          <Link href="/dashboard/charges/new">
            <Button className="bg-pink-800 hover:bg-pink-900">
              <Plus className="mr-2 h-4 w-4" />
              Nova Cobrança
            </Button>
          </Link>
        }
      />

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(walletData.balance)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-teal-600">+12.5%</span> vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-teal-600">+8.2%</span> vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-teal-600">+2.1%</span> vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+1</span> novo membro
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Saldo da Carteira */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Saldo da Carteira</CardTitle>
            <CardDescription>Distribuição do seu saldo atual</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Disponível para Saque</p>
                    <p className="text-sm text-muted-foreground">Valor liberado</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-600">{formatCurrency(walletData.availableBalance)}</p>
                  <div className="flex items-center text-xs text-teal-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +5.2%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Pendente</p>
                    <p className="text-sm text-muted-foreground">Aguardando confirmação</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-600">{formatCurrency(walletData.pendingBalance)}</p>
                  <div className="flex items-center text-xs text-yellow-600">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    -2.1%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/dashboard/charges/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Nova Cobrança PIX
              </Button>
            </Link>
            <Link href="/dashboard/charges">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="mr-2 h-4 w-4" />
                Ver Todas as Cobranças
              </Button>
            </Link>
            <Link href="/dashboard/team">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Equipe
              </Button>
            </Link>
            <Link href="/dashboard/reports">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Ver Relatórios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Cobranças Recentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cobranças Recentes</CardTitle>
            <CardDescription>Últimas cobranças PIX criadas</CardDescription>
          </div>
          <Link href="/dashboard/charges">
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentCharges.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma cobrança encontrada</p>
              <Link href="/dashboard/charges/new">
                <Button>Criar primeira cobrança</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCharges.map((charge) => (
                <div
                  key={charge.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-medium">{charge.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {charge.payerName && `Para: ${charge.payerName} • `}
                        {formatDate(charge.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(charge.amount)}</p>
                      <Badge className={getStatusColor(charge.status)} variant="secondary">
                        {getStatusText(charge.status)}
                      </Badge>
                    </div>
                    <Link href={`/dashboard/charges/${charge.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
