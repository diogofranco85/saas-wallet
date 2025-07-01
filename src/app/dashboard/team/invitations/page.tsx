"use client"
import { CustomCard } from "@/components/custom-card";
import { CustomContainer } from "@/components/custom-container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Copy, Mail, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

export default function TeamInvitationsPage() {
  const { data: session } = useSession()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "employee",
  })

  useEffect(() => {
    fetchInvite()
  }, [])

  const canInvite = session?.user?.role === "owner" || session?.user?.role === "admin"


  const fetchInvite = async () => {
    setLoading(true);
    try {
      const invitationsResponse = await fetch("/api/team/invitations")

      const invitationsData = await invitationsResponse.json()
      setInvitations(invitationsData.invitations || [])
    } catch (error: any) {
      toast.error("Error", { description: error.message })
      console.error("Error fetching team data:", error)
    } finally {
      setLoading(false);
    }
  }

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(inviteUrl)
    toast.success("Convite", { description: "Link do convite copiado!" })
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

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/team/invitations/${invitationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setInvitations(invitations.filter((inv) => inv.id !== invitationId))
        toast.success("Cancelar convite", { description: `Convite com código "${invitationId}" cancelado com sucesso` })
      }
    } catch (error: any) {
      toast.error("Error canceling invitation:", { description: error.message })
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
        toast.success("Reenviar convite", { description: `Convite reenviado! Link copiado para a área de transferência:\n\n${inviteUrl}` })
      }
    } catch (error: any) {
      toast.error("Error ao reenviar convite:", { description: error.message })
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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
        toast.success("Convite enviado", { description: `Convite criado! Link copiado para a área de transferência:\n${inviteUrl}` })
      } else {
        const error = await response.json()
        toast.error("Error ao envir convite", { description: error.error || "Erro ao enviar convite" })
      }
    } catch (error: any) {
      console.error("Error sending invite:", error)
      toast.error("Erro ao enviar convite", { description: error.message || "Erro ao enviar convite" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomContainer>
      <PageHeader
        leftAction={
          <Link href="/dashboard/charges">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        }
        title="Membros - Convites"
        description="Visão geral do seus convites recentes"
        action={
          <Button className="bg-pink-700 hover:bg-pink-800" onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4 " />
            Convidar Membro
          </Button>
        }
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Equipe", href: "/dashboard/team" },
          { title: "Convites" }
        ]}
      />


      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">

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

        {canInvite && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Novo Membro</DialogTitle>
                <DialogDescription>Envie um convite para uma pessoa se juntar à sua equipe</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="mb-2">Email</Label>
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
                  <Label htmlFor="role" className="mb-2">Função</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Funcionário</SelectItem>
                      <SelectItem value="owner">Proprietário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Enviando..." : "Enviar Convite"}
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
    </CustomContainer>
  )
}