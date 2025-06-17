"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { User, Mail, Phone } from "lucide-react"

type SessionUser = {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
}

export default function ProfilePage() {
    const { data: session, update } = useSession()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    })

    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || "",
                email: session.user.email || "",
                phone: "", // This would come from your database
            })
        }
    }, [session])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                // Update session
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: formData.name,
                    },
                })

                alert("Perfil atualizado com sucesso!")
            }
        } catch (error) {
            console.error("Error updating profile:", error)
            alert("Erro ao atualizar perfil")
        } finally {
            setLoading(false)
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
                    <p className="text-gray-600">Gerencie suas informações pessoais</p>
                </div>

                <div className="space-y-6">
                    {/* Avatar Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Foto do Perfil</CardTitle>
                            <CardDescription>Sua foto é sincronizada automaticamente com o Google</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                                    <AvatarFallback className="bg-blue-600 text-white text-lg">
                                        {getInitials(session?.user?.name || "U")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Conectado via Google. Para alterar sua foto, atualize em sua conta Google.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Pessoais</CardTitle>
                            <CardDescription>Atualize suas informações básicas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nome Completo</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="email" type="email" value={formData.email} className="pl-10" disabled />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Email não pode ser alterado pois é usado para autenticação
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="phone">Telefone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="(11) 99999-9999"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading}>
                                    {loading ? "Salvando..." : "Salvar Alterações"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Account Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações da Conta</CardTitle>
                            <CardDescription>Detalhes sobre sua conta</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm font-medium">Tipo de Conta</span>
                                    <span className="text-sm text-gray-600">Google OAuth</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm font-medium">Função na Empresa</span>
                                    <span className="text-sm text-gray-600 capitalize">{session?.user?.role || "Usuário"}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm font-medium">Membro desde</span>
                                    <span className="text-sm text-gray-600">{new Date().toLocaleDateString("pt-BR")}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
