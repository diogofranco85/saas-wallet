"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { formatCurrency } from "@/helpers/formatCurrency"




interface IPlans {
  id: string;
  name: string;
  price: number
}

export default function Onboarding() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadMessage, setLoadingMessage] = useState<string | null>("Carregando planos ...")
  const [plans, setPlans] = useState<IPlans[]>([])
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
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setLoading(true)
    setLoadingMessage("Carregando planos ...")

    try {
      const response = await fetch(`/api/plans`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const { plans } = await response.json();

      if (!plans) {
        alert("Error ao carregar planos")
        return;
      }

      setPlans(plans)
    } catch (error) {
      console.error("Error creating company:", error)
    } finally {
      setLoading(false)
    }

  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoadingMessage("Criando cadastro da sua empresa ....")

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        toast("Error ao criar cadastro da empresa", {})
      }
    } catch (error) {
      console.error("Error creating company:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">{loadMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 p-4">
      <Card className="w-full max-w-2xl bg-gray-800 border-gray-800">
        <CardHeader>
          <CardTitle className="text-pink-700">Configurar sua Empresa</CardTitle>
          <CardDescription className="text-white">Vamos configurar sua conta empresarial para começar a usar o HypePay</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="mb-3 text-white">Nome da Empresa</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="document" className="mb-3 text-white">CNPJ</Label>
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
              <Label htmlFor="phone" className="mb-3 text-white">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="street" className="mb-3 text-white">Endereço</Label>
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
                <Label htmlFor="city" className="mb-3 text-white">Cidade</Label>
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
                <Label htmlFor="state" className="mb-3 text-white">Estado</Label>
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
                <Label htmlFor="zipCode" className="mb-3 text-white">CEP</Label>
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
              <Label htmlFor="plan" className="mb-3 text-white">Escolha seu Plano</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, planId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>

                  {!plans && <SelectItem value="0">Carregando</SelectItem>}
                  {plans.map(plan =>
                    <SelectItem key={plan.id} value={plan.id} className="text-pink-600 bg-gray-400">{plan.name} - {formatCurrency(plan.price)}/mês</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-700" disabled={loading}>
              {loading ? "Criando conta..." : "Finalizar Configuração"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
