"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { signIn, useSession } from "next-auth/react"
import { Chrome, Building, Users, CheckCircle } from "lucide-react"

interface InvitationDetails {
    id: string
    email: string
    role: string
    status: string
    expires_at: string
    company: {
        name: string
        document: string
    }
    invited_by: {
        name: string
    }
}

export default function AcceptInvitePage() {
    const params = useParams()
    const router = useRouter()
    const { data: session, status } = useSession()
    const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [accepting, setAccepting] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (params.token) {
            fetchInvitationDetails(params.token as string)
        }
    }, [params.token])

    useEffect(() => {
        // Se o usuário já está logado e temos um convite válido, aceitar automaticamente
        if (session && invitation && invitation.status === "pending") {
            handleAcceptInvitation()
        }
    }, [session, invitation])

    const fetchInvitationDetails = async (token: string) => {
        try {
            const response = await fetch(`/api/invitations/${token}`)
            if (response.ok) {
                const data = await response.json()
                setInvitation(data.invitation)
            } else {
                const errorData = await response.json()
                setError(errorData.error || "Convite não encontrado")
            }
        } catch (error) {
            console.error("Error fetching invitation:", error)
            setError("Erro ao carregar convite")
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptInvitation = async () => {
        if (!session || !invitation) return

        setAccepting(true)
        try {
            const response = await fetch("/api/invitations/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: params.token }),
            })

            if (response.ok) {
                // Redirecionar para o dashboard
                router.push("/dashboard")
            } else {
                const errorData = await response.json()
                setError(errorData.error || "Erro ao aceitar convite")
            }
        } catch (error) {
            console.error("Error accepting invitation:", error)
            setError("Erro ao aceitar convite")
        } finally {
            setAccepting(false)
        }
    }

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: `/invite/${params.token}` })
    }

    const getRoleText = (role: string) => {
        switch (role) {
            case "admin":
                return "Administrador"
            case "employee":
                return "Funcionário"
            default:
                return role
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            case "employee":
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
    }

    const isExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Carregando convite...</p>
                </div>
            </div>
        )
    }

    if (error || !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-red-600">Convite Inválido</CardTitle>
                        <CardDescription>{error || "Este convite não é válido ou expirou"}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button onClick={() => router.push("/")} variant="outline">
                            Voltar ao Início
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (invitation.status === "accepted") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CheckCircle className="h-12 w-12 text-teal-500 mx-auto mb-4" />
                        <CardTitle className="text-teal-600">Convite já Aceito</CardTitle>
                        <CardDescription>Este convite já foi aceito anteriormente</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button onClick={() => router.push("/dashboard")}>Ir para Dashboard</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isExpired(invitation.expires_at)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-red-600">Convite Expirado</CardTitle>
                        <CardDescription>Este convite expirou. Solicite um novo convite ao administrador.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button onClick={() => router.push("/")} variant="outline">
                            Voltar ao Início
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (accepting) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle>Processando Convite</CardTitle>
                        <CardDescription>Configurando sua conta na empresa...</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Building className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle>Convite para Equipe</CardTitle>
                    <CardDescription>Você foi convidado para se juntar a uma empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Invitation Details */}
                    <div className="space-y-4">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold">{invitation.company.name}</h3>
                            <p className="text-sm text-muted-foreground">CNPJ: {invitation.company.document}</p>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                                <p className="text-sm font-medium">Função:</p>
                                <Badge className={getRoleColor(invitation.role)}>{getRoleText(invitation.role)}</Badge>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">Convidado por:</p>
                                <p className="text-sm text-muted-foreground">{invitation.invited_by.name}</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Convite para: <span className="font-medium">{invitation.email}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Expira em: {new Date(invitation.expires_at).toLocaleDateString("pt-BR")}
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    {!session ? (
                        <div className="space-y-4">
                            <p className="text-sm text-center text-muted-foreground">
                                Para aceitar o convite, faça login com sua conta Google
                            </p>
                            <Button onClick={handleGoogleSignIn} className="w-full" size="lg">
                                <Chrome className="mr-2 h-5 w-5" />
                                Entrar com Google
                            </Button>
                        </div>
                    ) : session.user.email === invitation.email ? (
                        <Button onClick={handleAcceptInvitation} className="w-full" size="lg" disabled={accepting}>
                            <Users className="mr-2 h-5 w-5" />
                            {accepting ? "Aceitando..." : "Aceitar Convite"}
                        </Button>
                    ) : (
                        <div className="text-center space-y-4">
                            <p className="text-sm text-red-600">
                                Este convite é para {invitation.email}, mas você está logado como {session.user.email}
                            </p>
                            <Button onClick={() => signIn("google")} variant="outline" className="w-full">
                                Entrar com Conta Correta
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
