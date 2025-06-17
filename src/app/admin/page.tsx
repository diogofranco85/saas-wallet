"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Building, CreditCard, Settings } from "lucide-react"

interface AdminStats {
    totalUsers: number
    totalCompanies: number
    totalCharges: number
    totalRevenue: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalCompanies: 0,
        totalCharges: 0,
        totalRevenue: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAdminStats()
    }, [])

    const fetchAdminStats = async () => {
        try {
            const response = await fetch("/api/admin/stats")
            const data = await response.json()
            setStats(data)
        } catch (error) {
            console.error("Error fetching admin stats:", error)
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Carregando painel administrativo...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                        <Badge variant="secondary">Admin</Badge>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                            <p className="text-xs text-muted-foreground">Empresas ativas</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cobranças</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCharges}</div>
                            <p className="text-xs text-muted-foreground">Total de cobranças</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground">Receita em taxas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gerenciar Planos</CardTitle>
                            <CardDescription>Criar e editar planos de assinatura</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Gerenciar Planos</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Usuários</CardTitle>
                            <CardDescription>Visualizar e gerenciar usuários</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Ver Usuários</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Relatórios</CardTitle>
                            <CardDescription>Relatórios detalhados do sistema</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Ver Relatórios</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
