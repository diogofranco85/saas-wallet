"use client"
import { CustomLoading } from "@/components/loading"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/helpers/formatDate"
import { DialogTitle } from "@radix-ui/react-dialog"
import { ArrowUpDown, ChevronLeft, ChevronRight, Eye, EyeClosed, Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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
  const [touchedFilter, setTouchedFilter] = useState("false")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [dialogDialogOpen, setDialogDialogOpen] = useState<boolean>(false)
  const [uniqueNotification, setUniqueNotification] = useState<INotifications | null>(null)

  const [notifications, setNotifications] = useState<INotifications[]>([])

  const [loading, setLoading] = useState<boolean>(false)
  const [loadingUniqueNotification, setLoadingUniqueNotification] = useState<boolean>(false)

  useEffect(() => {
    fetchNotifications()
  }, [pagination.page, touchedFilter, sortBy, sortOrder])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        touched: touchedFilter !== "all" ? touchedFilter : "",
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

  const fetchUniqueNotification = async (id: string) => {
    setLoadingUniqueNotification(true)
    try {
      const response = await fetch(`/api/notifications/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch notification")
      }
      const data = await response.json()
      setUniqueNotification(data.notifications)
      setDialogDialogOpen(true)
    } catch (error) {
      console.error("Error fetching unique notification:", error)
      toast.error("Erro ao buscar notificação")
    } finally {
      setLoadingUniqueNotification(false)
    }
  }

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 })
    fetchNotifications()
  }

  const handlerExcludeNotification = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotifications(notifications.filter((notification) => notification.id !== id))
        // Optionally, you can refetch notifications after deletion
        fetchNotifications()
        toast.success("Notificação excluída com sucesso")
      } else {
        console.error("Failed to delete notification")
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    } finally {
      setLoading(false)
    }
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

            <Select value={touchedFilter} onValueChange={setTouchedFilter}>
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
                <SelectItem value="title">Titulo</SelectItem>
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
                      <TableHead>Recebido em</TableHead>
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
                            <p className="text-sm">{notification.message.slice(0, 50)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{formatDate(notification.created_at)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">

                            <Button size="sm" variant="outline" onClick={() => fetchUniqueNotification(notification.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button size="sm" variant="outline" onClick={() => handlerExcludeNotification(notification.id)}>
                              <X className="h-4 w-4" />
                            </Button>

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

      <Dialog open={dialogDialogOpen} onOpenChange={() => setDialogDialogOpen(!dialogDialogOpen)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 font-semibold text-2xl">
              <p className="text-pink-700 text-xl">{uniqueNotification?.title}</p>
            </DialogTitle>

          </DialogHeader>
          {loadingUniqueNotification ?? <CustomLoading text="Carregando notificação..." />}

          {uniqueNotification && <div>
            <p>{uniqueNotification?.message}</p>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setDialogDialogOpen(false)
                  setUniqueNotification(null)
                }}
              >
                <div className="flex items-center">
                  <X className="h-4 w-4 mr-2" />
                  Fechar
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-4 mt-4 bg-yellow-200 hover:bg-yellow-300"
                onClick={() => {
                  handlerExcludeNotification(uniqueNotification.id)
                  setDialogDialogOpen(false)
                  setUniqueNotification(null)
                }}
              >
                <div className="flex items-center">
                  <EyeClosed className="h-4 w-4 mr-2" />
                  Marcar como visualizada
                </div>
              </Button>
            </div>
          </div>}

        </DialogContent>
      </Dialog>
    </div>
  )
}