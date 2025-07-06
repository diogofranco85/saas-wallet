"use client"

import { CustomCard } from "@/components/custom-card"
import { CustomContainer } from "@/components/custom-container"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, ChevronLeft, ChevronRight, Copy, Eye, Plus, RefreshCw, Search, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Charge {
  id: string
  amount: number
  description: string
  status: string
  payer_name?: string
  payer_email?: string
  payer_document?: string
  pix_key?: string
  qr_code?: string
  expires_at: string
  paid_at?: string
  created_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ChargesPage() {
  const [charges, setCharges] = useState<Charge[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetchCharges()
  }, [pagination.page, statusFilter, sortBy, sortOrder])

  const fetchCharges = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter !== "all" ? statusFilter : "",
        search: searchTerm,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/charges?${params}`)
      const data = await response.json()

      setCharges(data.charges || [])
      setPagination(data.pagination || pagination)
    } catch (error) {
      console.error("Error fetching charges:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 })
    fetchCharges()
  }

  const handleStatusChange = async (chargeId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/charges/${chargeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchCharges()
      }
    } catch (error) {
      console.error("Error updating charge status:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
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

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const canCancel = (status: string) => {
    return status === "pending"
  }

  return (
    <CustomContainer>
      {/* Header */}
      <PageHeader
        title="Cobranças"
        description="Visão geral das cobranças mais recentes"
        action={
          <Link href="/dashboard/charges/new">
            <Button className="bg-pink-700 hover:bg-pink-800">
              <Plus className="mr-2 h-4 w-4 " />
              Nova Cobrança
            </Button>
          </Link>
        }
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Lista de cobranças" }
        ]}
      />

      {/* Filters */}
      <CustomCard className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição ou pagador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Data de Criação</SelectItem>
                <SelectItem value="amount">Valor</SelectItem>
                <SelectItem value="expires_at">Data de Expiração</SelectItem>
                <SelectItem value="paid_at">Data de Pagamento</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex space-x-2">
              <Button onClick={handleSearch} variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} variant="outline" size="icon">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </CustomCard>

      {/* Charges Table */}
      <CustomCard>
        <CardHeader>
          <CardTitle>Lista de Cobranças</CardTitle>
          <CardDescription>{pagination.total} cobrança(s) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : charges.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Nenhuma cobrança encontrada</p>
              <Link href="/dashboard/charges/new">
                <Button className="bg-teal-700 hover:bg-teal-900">Criar primeira cobrança</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Pagador</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Expira em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charges.map((charge) => (
                      <TableRow key={charge.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{charge.description}</p>
                            <p className="text-sm text-muted-foreground">ID: {charge.id.slice(0, 8)}...</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{charge.payer_name || "N/A"}</p>
                            <p className="text-sm text-muted-foreground">{charge.payer_email || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-primary">{formatCurrency(charge.amount)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge className={getStatusColor(charge.status)}>{getStatusText(charge.status)}</Badge>
                            {charge.status === "pending" && isExpired(charge.expires_at) && (
                              <Badge variant="destructive" className="text-xs">
                                Expirado
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{formatDate(charge.created_at)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{formatDate(charge.expires_at)}</p>
                            {isExpired(charge.expires_at) && charge.status === "pending" && (
                              <p className="text-xs text-red-500">Expirado</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={`/dashboard/charges/${charge.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            {charge.pix_key && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(charge.pix_key!)}
                                title="Copiar chave PIX"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}

                            {canCancel(charge.status) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(charge.id, "cancelled")}
                                title="Cancelar cobrança"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}

                            {charge.status === "expired" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(charge.id, "pending")}
                                title="Reativar cobrança"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </CustomCard>
    </CustomContainer>
  )
}
