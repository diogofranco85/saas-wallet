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
import { CreditCard, ExternalLink, CheckCircle, AlertCircle, Clock, Settings } from "lucide-react"
import { useSession } from "next-auth/react"
import { ICreatePartner } from "@/types/openpix.interface"
import { TaxTypeEnum } from "@/enums/tax-type.enum"

interface StripeAccountData {
  pix_key?: string
  pix_status?: string
  stripe_onboarding_url?: string
  stripe_dashboard_url?: string
  stripe_account?: {
    id: string
    charges_enabled: boolean
    payouts_enabled: boolean
    details_submitted: boolean
    requirements?: {
      currently_due: string[]
      eventually_due: string[]
      past_due: string[]
      pending_verification: string[]
    }
  }
}

export default function StripePage() {
  const { data: session } = useSession()
  const [stripeData, setStripeData] = useState<StripeAccountData>({})
  const [loading, setLoading] = useState(true)
  const [createAccountDialog, setCreateAccountDialog] = useState(false)
  const [createAccountForm, setCreateAccountForm] = useState({
    email: "",
    business_type: "company",
    company_name: "",
    company_tax_id: "",
    company_phone: "",
    individual_first_name: "",
    individual_last_name: "",
    individual_email: "",
    individual_phone: "",
  })
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(() => {
    fetchStripeData()
  }, [])

  const fetchStripeData = async () => {
    try {
      const response = await fetch("/api/stripe/accounts")
      const data = await response.json()
      setStripeData(data)
    } catch (error) {
      console.error("Error fetching Stripe data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)

    try {
      const payload: ICreatePartner = {
        preRegistration: {
          name: createAccountForm.company_name,
          taxID: {
            taxID: createAccountForm.company_tax_id,
            type: createAccountForm.business_type === "company" ? TaxTypeEnum.LEGAL_PERSON : TaxTypeEnum.INDIVIDUAL_PERSON
          },
          website: ""
        },
        user: {
          email: createAccountForm.email,
          phone: createAccountForm.individual_phone,
          firstName: createAccountForm.individual_first_name,
          lastName: createAccountForm.individual_last_name,

        }
      }

      const response = await fetch("/api/openpix/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirecionar para onboarding
        window.open(data.onboarding_url, "_blank")
        setCreateAccountDialog(false)
        fetchStripeData()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao criar conta Stripe")
      }
    } catch (error) {
      console.error("Error creating Stripe account:", error)
      alert("Erro ao criar conta Stripe")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleCreateLink = async (type: "onboarding" | "dashboard") => {
    try {
      const response = await fetch("/api/stripe/accounts/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      if (response.ok) {
        const data = await response.json()
        window.open(data.url, "_blank")
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao criar link")
      }
    } catch (error) {
      console.error("Error creating link:", error)
      alert("Erro ao criar link")
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-teal-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case "active":
        return "Ativa"
      case "pending":
        return "Pendente"
      default:
        return "Não Configurada"
    }
  }

  const canCreateAccount = session?.user?.role === "owner"

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando configurações do gateway...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações do Gateway de Pagamento</h1>
          <p className="text-muted-foreground">Gerencie sua conta para receber pagamentos PIX</p>
        </div>
        {canCreateAccount && !stripeData.pix_key && (
          <Dialog open={createAccountDialog} onOpenChange={setCreateAccountDialog}>
            <DialogTrigger asChild>
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Criar Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Conta</DialogTitle>
                <DialogDescription>Configure sua conta para começar a receber pagamentos PIX</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email da Conta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createAccountForm.email}
                    onChange={(e) => setCreateAccountForm({ ...createAccountForm, email: e.target.value })}
                    placeholder="email@empresa.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="business_type">Tipo de Negócio</Label>
                  <Select
                    value={createAccountForm.business_type}
                    onValueChange={(value) => setCreateAccountForm({ ...createAccountForm, business_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Empresa (CNPJ)</SelectItem>
                      <SelectItem value="individual">Pessoa Física (CPF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {createAccountForm.business_type === "company" ? (
                  <>
                    <div>
                      <Label htmlFor="company_name">Nome da Empresa</Label>
                      <Input
                        id="company_name"
                        value={createAccountForm.company_name}
                        onChange={(e) => setCreateAccountForm({ ...createAccountForm, company_name: e.target.value })}
                        placeholder="Minha Empresa Ltda"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_tax_id">CNPJ</Label>
                      <Input
                        id="company_tax_id"
                        value={createAccountForm.company_tax_id}
                        onChange={(e) => setCreateAccountForm({ ...createAccountForm, company_tax_id: e.target.value })}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_phone">Telefone da Empresa</Label>
                      <Input
                        id="company_phone"
                        value={createAccountForm.company_phone}
                        onChange={(e) => setCreateAccountForm({ ...createAccountForm, company_phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="individual_first_name">Nome</Label>
                        <Input
                          id="individual_first_name"
                          value={createAccountForm.individual_first_name}
                          onChange={(e) =>
                            setCreateAccountForm({ ...createAccountForm, individual_first_name: e.target.value })
                          }
                          placeholder="João"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="individual_last_name">Sobrenome</Label>
                        <Input
                          id="individual_last_name"
                          value={createAccountForm.individual_last_name}
                          onChange={(e) =>
                            setCreateAccountForm({ ...createAccountForm, individual_last_name: e.target.value })
                          }
                          placeholder="Silva"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="individual_email">Email</Label>
                      <Input
                        id="individual_email"
                        type="email"
                        value={createAccountForm.individual_email}
                        onChange={(e) =>
                          setCreateAccountForm({ ...createAccountForm, individual_email: e.target.value })
                        }
                        placeholder="joao@email.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="individual_phone">Telefone</Label>
                      <Input
                        id="individual_phone"
                        value={createAccountForm.individual_phone}
                        onChange={(e) =>
                          setCreateAccountForm({ ...createAccountForm, individual_phone: e.target.value })
                        }
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-2">
                  <Button type="submit" disabled={createLoading} className="flex-1">
                    {createLoading ? "Criando..." : "Criar Conta"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setCreateAccountDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Status da Conta */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Status da Conta
          </CardTitle>
          <CardDescription>
            {stripeData.pix_key
              ? `ID da Conta: ${stripeData.pix_key}`
              : "Nenhuma conta configurada"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stripeData.pix_key ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(stripeData.pix_status)}
                  <span className="font-medium">Status da Conta:</span>
                  <Badge className={getStatusColor(stripeData.pix_status)}>
                    {getStatusText(stripeData.pix_status)}
                  </Badge>
                </div>
              </div>

              {stripeData.stripe_account && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {stripeData.stripe_account.charges_enabled ? (
                        <CheckCircle className="h-5 w-5 text-teal-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium">Cobranças</p>
                    <p className="text-xs text-muted-foreground">
                      {stripeData.stripe_account.charges_enabled ? "Habilitadas" : "Desabilitadas"}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {stripeData.stripe_account.payouts_enabled ? (
                        <CheckCircle className="h-5 w-5 text-teal-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium">Saques</p>
                    <p className="text-xs text-muted-foreground">
                      {stripeData.stripe_account.payouts_enabled ? "Habilitados" : "Desabilitados"}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {stripeData.stripe_account.details_submitted ? (
                        <CheckCircle className="h-5 w-5 text-teal-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium">Detalhes</p>
                    <p className="text-xs text-muted-foreground">
                      {stripeData.stripe_account.details_submitted ? "Completos" : "Incompletos"}
                    </p>
                  </div>
                </div>
              )}

              {/* Requisitos Pendentes */}
              {stripeData.stripe_account?.requirements &&
                (stripeData.stripe_account.requirements.currently_due.length > 0 ||
                  stripeData.stripe_account.requirements.past_due.length > 0) && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Ação Necessária</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                      Sua conta Stripe precisa de informações adicionais para funcionar completamente.
                    </p>
                    <Button
                      onClick={() => handleCreateLink("onboarding")}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Completar Configuração
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

              {/* Ações */}
              <div className="flex space-x-2">
                {stripeData.pix_status !== "active" && (
                  <Button onClick={() => handleCreateLink("onboarding")} variant="outline">
                    Completar Onboarding
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {stripeData.pix_status === "active" && (
                  <Button onClick={() => handleCreateLink("dashboard")} variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Acessar Dashboard
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma conta configurada. Configure uma conta para começar a receber pagamentos PIX.
              </p>
              {canCreateAccount ? (
                <Button onClick={() => setCreateAccountDialog(true)}>Criar Conta</Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Apenas o proprietário da empresa pode configurar a conta.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações sobre PIX */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre Pagamentos PIX</CardTitle>
          <CardDescription>Como funcionam os pagamentos PIX</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Taxa de Processamento</h4>
                <p className="text-sm text-muted-foreground">
                  O gateway cobra uma taxa por transação PIX. Consulte a documentação oficial para valores atualizados.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Tempo de Liquidação</h4>
                <p className="text-sm text-muted-foreground">
                  Pagamentos PIX são processados instantaneamente, mas a transferência para sua conta pode levar até 2
                  dias úteis.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Limites</h4>
                <p className="text-sm text-muted-foreground">
                  Pagamentos PIX têm limites baseados no tipo de conta e verificação. Consulte seu dashboard.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Suporte</h4>
                <p className="text-sm text-muted-foreground">
                  Para questões sobre pagamentos, acesse o dashboard ou entre em contato com o suporte.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
