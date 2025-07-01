"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, UserPlus, Copy, Trash2, RefreshCw, Users, Activity, ArrowLeft, BadgeXIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { CustomLoading } from "@/components/loading"
import { CustomContainer } from "@/components/custom-container"
import { PageHeader } from "@/components/page-header"
import { CustomCard } from "@/components/custom-card"

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  avatar_url?: string
  created_at: string
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  token: string
  expires_at: string
  created_at: string
  invited_by_name: string
}

export default function TeamPage() {
  const { data: session } = useSession()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "employee",
  })
  const [inviteLoading, setInviteLoading] = useState(false)

  const [editMemberDialog, setEditMemberDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [editForm, setEditForm] = useState({
    role: "",
  })
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    try {
      const [membersResponse, invitationsResponse] = await Promise.all([
        fetch("/api/team/members"),
        fetch("/api/team/invitations"),
      ])

      const membersData = await membersResponse.json()
      const invitationsData = await invitationsResponse.json()

      setTeamMembers(membersData.members || [])
      setInvitations(invitationsData.invitations || [])
    } catch (error) {
      console.error("Error fetching team data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)

    try {
      const response = await fetch("/api/team/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      })

      if (response.ok) {
        const data = await response.json()
        setInvitations([data.invitation, ...invitations])
        setInviteForm({ email: "", role: "employee" })
        setInviteDialogOpen(false)

        // Show invite link (in a real app, this would be sent via email)
        const inviteUrl = `${window.location.origin}/invite/${data.invitation.token}`
        navigator.clipboard.writeText(inviteUrl)
        alert(`Convite criado! Link copiado para a área de transferência:\n${inviteUrl}`)
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao enviar convite")
      }
    } catch (error) {
      console.error("Error sending invite:", error)
      alert("Erro ao enviar convite")
    } finally {
      setInviteLoading(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/team/invitations/${invitationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setInvitations(invitations.filter((inv) => inv.id !== invitationId))
      }
    } catch (error) {
      console.error("Error canceling invitation:", error)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/team/invitations/${invitationId}/resend`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        const inviteUrl = `${window.location.origin}/invite/${data.invitation.token}`
        navigator.clipboard.writeText(inviteUrl)
        alert(`Convite reenviado! Link copiado para a área de transferência:\n${inviteUrl}`)
      }
    } catch (error) {
      console.error("Error resending invitation:", error)
    }
  }

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(inviteUrl)
    alert("Link do convite copiado!")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "employee":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "owner":
        return "Proprietário"
      case "admin":
        return "Administrador"
      case "employee":
        return "Funcionário"
      default:
        return role
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "pending":
        return "Pendente"
      case "expired":
        return "Expirado"
      default:
        return status
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const canInvite = session?.user?.role === "owner" || session?.user?.role === "admin"

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member)
    setEditForm({ role: member.role })
    setEditMemberDialog(true)
  }

  const handleUpdateMemberRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return

    setEditLoading(true)
    try {
      const response = await fetch(`/api/team/members/${selectedMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editForm.role }),
      })

      if (response.ok) {
        // Atualizar lista local
        setTeamMembers(
          teamMembers.map((member) => (member.id === selectedMember.id ? { ...member, role: editForm.role } : member)),
        )
        setEditMemberDialog(false)
        setSelectedMember(null)
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao atualizar membro")
      }
    } catch (error) {
      console.error("Error updating member:", error)
      alert("Erro ao atualizar membro")
    } finally {
      setEditLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTeamMembers(teamMembers.filter((member) => member.id !== memberId))
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao remover membro")
      }
    } catch (error) {
      console.error("Error removing member:", error)
      alert("Erro ao remover membro")
    }
  }

  const canEditMember = (member: TeamMember) => {
    if (!session?.user) return false

    // Owner pode editar todos exceto outros owners
    if (session.user.role === "owner") {
      return member.role !== "owner" || member.id === session.user.id
    }

    // Admin pode editar apenas employees
    if (session.user.role === "admin") {
      return member.role === "employee"
    }

    return false
  }

  const canRemoveMember = (member: TeamMember) => {
    if (!session?.user) return false

    // Não pode remover a si mesmo
    if (member.id === session.user.id) return false

    // Owner pode remover todos exceto outros owners
    if (session.user.role === "owner") {
      return member.role !== "owner"
    }

    // Admin pode remover apenas employees
    if (session.user.role === "admin") {
      return member.role === "employee"
    }

    return false
  }

  if (loading) {
    return (
      <CustomLoading text="Carregando equipe..." />
    )
  }

  return (
    <CustomContainer>
      {/* Header */}
      <PageHeader
        leftAction={
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        }
        title="Gerenciar Equipe"
        description="Convide e gerencie membros da sua equipe"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Gerenciar Equipe" }
        ]}
        action={
          <div className="flex space-x-2">
            <Link href="/dashboard/team/activity">
              <Button variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                Ver Atividades
              </Button>
            </Link>
            {canInvite && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-pink-600 hover:bg-pink-700">
                    <UserPlus className="mr-2 h-4 w-4 " />
                    Convidar Membro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Convidar Novo Membro</DialogTitle>
                    <DialogDescription>Envie um convite para uma pessoa se juntar à sua equipe</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSendInvite} className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="mb-3">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        placeholder="email@exemplo.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role" className="mb-3">Função</Label>
                      <Select
                        value={inviteForm.role}
                        onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Funcionário</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={inviteLoading} className="flex-1 bg-pink-600 hover:bg-pink-700">
                        {inviteLoading ? "Enviando..." : "Enviar Convite"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <CustomCard>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Membros da Equipe ({teamMembers.length})
            </CardTitle>
            <CardDescription>Pessoas que fazem parte da sua equipe</CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum membro na equipe ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(member.role)}>{getRoleText(member.role)}</Badge>
                      <Badge className={getStatusColor(member.status)}>{getStatusText(member.status)}</Badge>

                      {(canEditMember(member) || canRemoveMember(member)) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEditMember(member) && (
                              <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Função
                              </DropdownMenuItem>
                            )}
                            {canRemoveMember(member) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remover
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover Membro</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover {member.name} da equipe? Esta ação não pode ser
                                      desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveMember(member.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CustomCard>

        {/* Pending Invitations */}
        <CustomCard>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Convites Pendentes ({invitations.length})
            </CardTitle>
            <CardDescription>Convites enviados aguardando aceitação</CardDescription>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum convite pendente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Convidado por {invitation.invited_by_name} •{" "}
                          {new Date(invitation.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleColor(invitation.role)}>{getRoleText(invitation.role)}</Badge>
                        <Badge className={getStatusColor(invitation.status)}>{getStatusText(invitation.status)}</Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => copyInviteLink(invitation.token)}>
                        <Copy className="mr-1 h-3 w-3" />
                        Copiar Link
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleResendInvitation(invitation.id)}>
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Reenviar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelInvitation(invitation.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CustomCard>
      </div>
      {/* Edit Member Dialog */}
      <Dialog open={editMemberDialog} onOpenChange={setEditMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Membro da Equipe</DialogTitle>
            <DialogDescription>Alterar a função de {selectedMember?.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateMemberRole} className="space-y-4">
            <div>
              <Label htmlFor="editRole">Nova Função</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Funcionário</SelectItem>
                  {session?.user?.role === "owner" && <SelectItem value="admin">Administrador</SelectItem>}
                  {session?.user?.role === "owner" && selectedMember?.id === session.user.id && (
                    <SelectItem value="owner">Proprietário</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={editLoading} className="flex-1">
                {editLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditMemberDialog(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </CustomContainer>
  )
}
