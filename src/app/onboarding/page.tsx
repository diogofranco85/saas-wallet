"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function Onboarding() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [plans, setPlans] = useState([
        {
            id: "0",
            name: "Carregando ...",
            price: 0
        }
    ])
    const [formData, setFormData] = useState({
        name: "",
        document: "",
        phone: "",
        planId: "",
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
        },
    })

    useEffect(() => {
        if (status === "loading") return // Still loading

        if

        if (!session) {
                router.push("/auth/signin")
                return
            }

        handlerGetPlans()
    }, [session, status])

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p>Carregando...</p>
                </div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    const handlerGetPlans = async () => {
        try {
            const response = await fetch("/api/plans", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })

            if (response.ok) {
                const data = await response.json()
                setPlans(data.plans)
            }
        } catch (error) {
            console.error("Error creating company:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("/api/companies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                router.push("/dashboard")
            }
        } catch (error) {
            console.error("Error creating company:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-indigo-100 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Configurar sua Empresa</CardTitle>
                    <CardDescription>Vamos configurar sua conta empresarial para começar a usar o HypePay</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Nome da Empresa</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="document">CNPJ</Label>
                                <Input
                                    id="document"
                                    value={formData.document}
                                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                    placeholder="00.000.000/0000-00"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="street">Endereço</Label>
                                <Input
                                    id="street"
                                    value={formData.address.street}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: { ...formData.address, street: e.target.value },
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="city">Cidade</Label>
                                <Input
                                    id="city"
                                    value={formData.address.city}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: { ...formData.address, city: e.target.value },
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="state">Estado</Label>
                                <Input
                                    id="state"
                                    value={formData.address.state}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: { ...formData.address, state: e.target.value },
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="zipCode">CEP</Label>
                                <Input
                                    id="zipCode"
                                    value={formData.address.zipCode}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: { ...formData.address, zipCode: e.target.value },
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="plan">Escolha seu Plano</Label>
                            <Select onValueChange={(value) => setFormData({ ...formData, planId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um plano" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.map((plan) =>
                                        <SelectItem key={plan.id} value={plan.id}>{plan.name} - R$ {Number(plan.price).toFixed(2)}/mês</SelectItem>
                                    )}

                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Criando conta..." : "Finalizar Configuração"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
