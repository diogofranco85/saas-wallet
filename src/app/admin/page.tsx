"use client"

import { CustomCard } from "@/components/custom-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/helpers/formatCurrency"
import { formatDate } from "@/helpers/formatDate"
import { formatDocument } from "@/helpers/formatDocument"
import { getStatusMap } from "@/helpers/getStatusMap"
import { getUserRoleMap } from "@/helpers/getUserMapRole"
import { Building, CreditCard, Edit, Eye, Settings, Users } from "lucide-react"
import { useEffect, useState } from "react"

interface AdminStats {
  totalUsers: number
  totalCompanies: number
  totalCharges: number
  totalRevenue: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  created_at: string
  companies?: {
    name: string
    status: string
  }
}

interface Plans {
  id: string
  name: string
  description: string
  price: number
  pix_fee_percentage: number
  pix_fee_fixed: number
  max_employees: number
  status: string
  created_at: string
}

interface Company {
  id: string
  name: string
  document: string
  status: string
  created_at: string
  plans?: {
    name: string
    price: number
  }
  users: Array<{
    name: string
    role: string
  }>
  wallets: Array<{
    balance: number
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCompanies: 0,
    totalCharges: 0,
    totalRevenue: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [plans, setPlans] = useState<Plans[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "companies" | "plans">("overview")

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsResponse, usersResponse, companiesResponse, plansResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users?limit=5"),
        fetch("/api/admin/companies?limit=5"),
        fetch("/api/admin/plans?limit=5"),
      ])

      const statsData = await statsResponse.json()
      const usersData = await usersResponse.json()
      const companiesData = await companiesResponse.json()
      const plansData = await plansResponse.json()

      setStats(statsData)
      setUsers(usersData.users || [])
      setCompanies(companiesData.companies || [])
      setPlans(plansData.plans || [])
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "owner":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "employee":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando painel administrativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg w-fit">
          {[
            { key: "overview", label: "Visão Geral" },
            { key: "users", label: "Usuários" },
            { key: "companies", label: "Empresas" },
            { key: "plans", label: "Planos" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <CustomCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
                </CardContent>
              </CustomCard>

              <CustomCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Empresas</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.totalCompanies}</div>
                  <p className="text-xs text-muted-foreground">Empresas ativas</p>
                </CardContent>
              </CustomCard>

              <CustomCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cobranças</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.totalCharges}</div>
                  <p className="text-xs text-muted-foreground">Total de cobranças</p>
                </CardContent>
              </CustomCard>

              <CustomCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Receita em taxas</p>
                </CardContent>
              </CustomCard>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CustomCard>
                <CardHeader>
                  <CardTitle>Usuários Recentes</CardTitle>
                  <CardDescription>Últimos usuários cadastrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getRoleColor(user.role)}>{getUserRoleMap(user.role)}</Badge>
                          <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CustomCard>

              <CustomCard>
                <CardHeader>
                  <CardTitle>Empresas Recentes</CardTitle>
                  <CardDescription>Últimas empresas cadastradas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {companies.map((company) => (
                      <div key={company.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {company.users.length} usuário(s) • {formatCurrency(company.wallets ? company.wallets[0]?.balance || 0 : 0)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(company.status)}>{company.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CustomCard>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <CustomCard>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>Visualizar e gerenciar todos os usuários do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.companies?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>{getStatusMap(user.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CustomCard>
        )}

        {/* Companies Tab */}
        {activeTab === "companies" && (
          <CustomCard>
            <CardHeader>
              <CardTitle>Gerenciar Empresas</CardTitle>
              <CardDescription>Visualizar e gerenciar todas as empresas cadastradas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{formatDocument(company.document)}</TableCell>
                      <TableCell>{company.plans?.name || "N/A"}</TableCell>
                      <TableCell>{formatCurrency(company.wallets ? company.wallets[0]?.balance || 0 : 0)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(company.status)}>{getStatusMap(company.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CustomCard>
        )}

        {/* Plans Tab */}
        {activeTab === "plans" && (
          <CustomCard>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerenciar Planos</CardTitle>
                <CardDescription>Criar e editar planos de assinatura</CardDescription>
              </div>
              <Button className="bg-primary hover:bg-primary/90">Novo Plano</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plano</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Taxa / Porcetagem</TableHead>
                    <TableHead>Taxa / Fixa</TableHead>
                    <TableHead>Qtd.Empresa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{plan.description}</TableCell>
                      <TableCell>{formatCurrency(plan.price || 0)}</TableCell>
                      <TableCell>{Number(plan.pix_fee_percentage).toFixed(4)}</TableCell>
                      <TableCell>{Number(plan.pix_fee_fixed).toFixed(4)}</TableCell>
                      <TableCell>{plan.max_employees}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(plan.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CustomCard>
        )}
      </div>
    </div>
  )
}
