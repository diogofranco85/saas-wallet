"use client"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/helpers/formatDate"
import { ArrowUpDown, ChevronLeft, ChevronRight, Plus, Search, Table } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface INotifications {
  id: string
  userId: string;
  touched: boolean;
  title: string;
  message: string;
  created_at: string
}

export default function NotificationPage() {
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const [notifications, setNotifications] = useState<INotifications[]>([])

  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {}, [pagination.page, statusFilter, sortBy, sortOrder])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        touched: statusFilter !== "all" ? statusFilter : "",
        search: searchTerm,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/notifications?${params}`)
      const data = await response.json()

      setNotifications(data.notifications || [])
      setPagination(data.pagination || pagination)
    } catch (error) {
      console.error("Error fetching charges:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 })
    fetchNotifications()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando notificações...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Notificações"
        description="Listagem das notificações recebidas"

      />

      <Card className="mb-6 border-pink-700">
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
                <SelectItem value="false">Novas</SelectItem>
                <SelectItem value="true">Visualizado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Data de Criação</SelectItem>
                <SelectItem value="amount">Titulo</SelectItem>
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
      </Card>

      {/* Charges Table */}
      <Card className="border-pink-700">
        <CardHeader>
          <CardTitle className="text-pink-700">Lista de notificações</CardTitle>
          <CardDescription>{pagination.total} cobrança(s) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Nenhuma notificação</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titulo</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">ID: {notification.id.slice(0, 8)}...</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{formatDate(notification.message.slice(0, 30))}</p>
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
      </Card>
    </div>
  )
}