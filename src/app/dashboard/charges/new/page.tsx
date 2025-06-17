"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewCharge() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        payerName: "",
        payerDocument: "",
        payerEmail: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("/api/charges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    amount: Number.parseFloat(formData.amount),
                }),
            })

            if (response.ok) {
                const data = await response.json()
                router.push(`/dashboard/charges/${data.charge.id}`)
            }
        } catch (error) {
            console.error("Error creating charge:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Nova Cobrança PIX</h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Criar Cobrança PIX</CardTitle>
                            <CardDescription>Preencha os dados para gerar uma nova cobrança PIX</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="amount">Valor (R$)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0,00"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Descrição</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Descreva o motivo da cobrança"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="payerName">Nome do Pagador</Label>
                                        <Input
                                            id="payerName"
                                            value={formData.payerName}
                                            onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
                                            placeholder="Nome completo"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="payerDocument">CPF/CNPJ do Pagador</Label>
                                        <Input
                                            id="payerDocument"
                                            value={formData.payerDocument}
                                            onChange={(e) => setFormData({ ...formData, payerDocument: e.target.value })}
                                            placeholder="000.000.000-00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="payerEmail">Email do Pagador</Label>
                                    <Input
                                        id="payerEmail"
                                        type="email"
                                        value={formData.payerEmail}
                                        onChange={(e) => setFormData({ ...formData, payerEmail: e.target.value })}
                                        placeholder="email@exemplo.com"
                                    />
                                </div>

                                <div className="flex space-x-4">
                                    <Button type="submit" disabled={loading} className="flex-1">
                                        {loading ? "Criando..." : "Criar Cobrança PIX"}
                                    </Button>
                                    <Link href="/dashboard">
                                        <Button type="button" variant="outline">
                                            Cancelar
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
