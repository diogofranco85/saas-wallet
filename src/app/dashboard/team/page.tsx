"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, Copy, X, RefreshCw, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"

interface Charge {
    id: string
    name: number
    email: string
    role: string
    status: string
    created_at: string
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export default function ChargesPage() {
    const [teams, setTeams] = useState<Charge[]>([])
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

            const response = await fetch(`/api/team?${params}`)
            const data = await response.json()

            setTeams(data.user || [])
            setPagination(data.pagination || pagination)
        } catch (error) {
            console.error("Error fetching teams:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        setPagination({ ...pagination, page: 1 })
        fetchCharges()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("pt-BR")
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
            case "inactive":
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case "active":
                return "Ativo"
            case "inactive":
                return "Inativo"
            default:
                return status
        }
    }

    const isExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Meu time</h1>
                    <p className="text-muted-foreground">Gerencie todos os usuários que fazem parte do seu time</p>
                </div>
                <Link href="/dashboard/charges/new">
                    <Button className="bg-purple-500 hover:bg-purple-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Enviar convite
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Label htmlFor="search" className="pb-2">Pesquisar</Label>
                            <Search className="absolute left-3 top-3 h-13 w-4 text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder="Buscar por descrição ou pagador..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>

                        <div>
                            <Label htmlFor="search" className="pb-2">Filtro por status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Status</SelectItem>
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="inactive">Inativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="search" className="pb-2">Ordernar por:</Label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at">Data de Criação</SelectItem>
                                    <SelectItem value="name">Nome</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
            <Card>
                <CardHeader>
                    <CardTitle>Lista de usuários</CardTitle>
                    <CardDescription>{pagination.total} usuários(s) encontrado(s)</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">Nenhuma pessoa na sua equipe</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cód.</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Criado em</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teams.map((team) => (
                                            <TableRow key={team.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">{team.id.slice(0, 8)}...</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{team.name || "N/A"}</p>
                                                        <p className="text-sm text-muted-foreground">{team.email || ""}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-bold text-primary">{team.role === "employee" ? "Colaborador" : "Propriétário"}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col space-y-1">
                                                        <Badge className={getStatusColor(team.status)}>{getStatusText(team.status)}</Badge>
                                                        {team.status === "pending" && isExpired(team.created_at) && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Expirado
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="text-sm">{formatDate(team.created_at)}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Link href={`/dashboard/team/${team.id}`}>
                                                            <Button size="sm" variant="outline">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
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
