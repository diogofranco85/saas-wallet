"use client"

import { CustomContainer } from "@/components/custom-container"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatDocument } from "@/helpers/formatDocument"
import { ArrowLeft, BadgeXIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

interface IPostData {
  amount: number,
  description: string,
  payerName: string,
  payerDocument: string,
  payerEmail: string,
  displayAmount: string
}

export default function NewCharge() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { control, handleSubmit, setValue } = useForm<IPostData>({
    defaultValues: {
      amount: 0,
      description: "",
      payerName: "",
      payerDocument: "",
      payerEmail: "",
      displayAmount: "R$ 0,00"
    }
  })

  const onSubmit = async (postData: IPostData) => {
    setLoading(true)
    try {

      if (postData.amount < 4.99) {
        toast.error("Valor mínimo", { description: "O Valor da cobrança não pode ser menor que R$ 5,00" })
        return;
      }
      const response = await fetch("/api/charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...postData,
          payerDocument: postData.payerDocument.replace(/\D/g, "")
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast("Cobrança criada com sucesso!")
        router.push(`/dashboard/charges/${data.charge.id}`)
      }

      if (!response.ok) {
        throw new Error(data.error || "Erro desconhecido. Se persistir, contate o suporte.")
      }
    } catch (error: any) {
      toast.error("Erro ao criar cobrança PIX", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "")
    const numeric = parseFloat(onlyNumbers) / 100
    return numeric.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const parseCurrency = (formatted: string): number => {
    const onlyNumbers = formatted.replace(/\D/g, "")
    return Number(onlyNumbers) / 100
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
        title="Criar Cobrança PIX"
        description="Crie uma cobrança usando o pix para pagamento"
        breadcrumbs={[
          { title: "Cobrança", href: "/dashboard/charges" },
          { title: "Criar" }
        ]}
        action={
          <Link href="/dashboard/charges">
            <Button type="button" variant="outline">
              <BadgeXIcon />
              Cancelar cobrança
            </Button>
          </Link>
        }

      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-pink-700">
            <CardHeader>
              <CardTitle>Cobrança PIX</CardTitle>
              <CardDescription>Preencha os dados para gerar uma nova cobrança PIX</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Controller
                      name="amount"
                      control={control}
                      render={({ field }) => <input type="hidden" {...field} />}
                    />

                    <Controller
                      name="displayAmount"
                      control={control}
                      render={({ field }) => (
                        <>
                          <Label htmlFor="displayAmount" className="mb-2">Valor (R$)</Label>
                          <Input
                            {...field}
                            inputMode="numeric"
                            onChange={(e) => {
                              const formatted = formatCurrency(e.target.value)
                              field.onChange(formatted)
                              setValue("amount", parseCurrency(formatted))
                            }}
                            placeholder="R$ 0,00"
                            required
                          />
                        </>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Label htmlFor="description" className="mb-2">Descrição</Label>
                        <Textarea
                          {...field}
                          placeholder="Descreva o motivo da cobrança"
                          required
                        />
                      </>
                    )}
                  />
                </div>

                <div>
                  <Controller
                    name="payerName"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Label htmlFor="payerName" className="mb-2">Nome do Pagador</Label>
                        <Input
                          {...field}
                          id="payerName"
                          placeholder="Nome completo"
                        />
                      </>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Controller
                      name="payerDocument"
                      control={control}
                      render={({ field }) => (
                        <>
                          <Label htmlFor="payerDocument" className="mb-2">CPF/CNPJ do Pagador</Label>
                          <Input
                            {...field}
                            id="payerDocument"
                            placeholder="000.000.000-00"
                            onChange={(e) => {
                              const formatted = formatDocument(e.target.value)
                              field.onChange(formatted)
                            }}
                          />
                        </>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <Controller
                    name="payerEmail"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Label htmlFor="payerEmail" className="mb-2">Email do Pagador</Label>
                        <Input
                          {...field}
                          id="payerEmail"
                          type="email"
                          placeholder="email@exemplo.com"
                        />
                      </>
                    )}
                  />

                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading} className="flex-1 bg-pink-700 hover:bg-pink-900">
                    {loading ? "Criando..." : "Criar Cobrança PIX"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomContainer>
  )
}
