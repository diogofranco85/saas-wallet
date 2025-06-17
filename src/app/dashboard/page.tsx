"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, Users, Plus, Eye, DollarSign } from "lucide-react"
import Link from "next/link"

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
    created_at: string
    payerName?: string
}

export default function Dashboard() {
    const [walletData, setWalletData] = useState<WalletData>({
        balance: 0,
        availableBalance: 0,
        pendingBalance: 0,
    })
    const [recentCharges, setRecentCharges] = useState<RecentCharge[]>([])
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
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "expired":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p>Carregando dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* This will be handled by the layout */}

            <div className="container mx-auto px-4 py-8">
                {/* Wallet Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(walletData.balance)}</div>
                            <p className="text-xs text-muted-foreground">Saldo atual da carteira</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Disponível para Saque</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(walletData.availableBalance)}</div>
                            <p className="text-xs text-muted-foreground">Valor liberado para saque</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(walletData.pendingBalance)}</div>
                            <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Link href="/dashboard/charges/new">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="flex items-center p-6">
                                <Plus className="h-8 w-8 text-teal-600 mr-3" />
                                <div>
                                    <h3 className="font-semibold">Nova Cobrança</h3>
                                    <p className="text-sm text-gray-600">Criar cobrança PIX</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/dashboard/charges">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="flex items-center p-6">
                                <Eye className="h-8 w-8 text-green-600 mr-3" />
                                <div>
                                    <h3 className="font-semibold">Ver Cobranças</h3>
                                    <p className="text-sm text-gray-600">Histórico completo</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/dashboard/team">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="flex items-center p-6">
                                <Users className="h-8 w-8 text-purple-600 mr-3" />
                                <div>
                                    <h3 className="font-semibold">Equipe</h3>
                                    <p className="text-sm text-gray-600">Gerenciar funcionários</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/dashboard/profile">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="flex items-center p-6">
                                <Wallet className="h-8 w-8 text-orange-600 mr-3" />
                                <div>
                                    <h3 className="font-semibold">Perfil</h3>
                                    <p className="text-sm text-gray-600">Dados da empresa</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Recent Charges */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cobranças Recentes</CardTitle>
                        <CardDescription>Últimas cobranças PIX criadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentCharges.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">Nenhuma cobrança encontrada</p>
                                <Link href="/dashboard/charges/new">
                                    <Button className="bg-teal-700 hover:bg-teal-900">Criar primeira cobrança</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentCharges.map((charge) => (
                                    <div key={charge.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h4 className="font-semibold">{charge.description}</h4>
                                            <p className="text-sm text-gray-600">
                                                {charge.payerName && `Para: ${charge.payerName} • `}
                                                {new Date(charge.created_at).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{formatCurrency(charge.amount)}</p>
                                            <Badge className={getStatusColor(charge.status)}>{getStatusText(charge.status)}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
