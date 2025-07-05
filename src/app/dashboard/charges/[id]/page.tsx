"use client"

import { CustomCard } from "@/components/custom-card"
import { CustomLoading } from "@/components/loading"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Timeline, TimelineDate, TimelineHeader, TimelineIndicator, TimelineItem, TimelineSeparator, TimelineTitle } from "@/components/ui/timeline"
import { formatDate } from "@/helpers/formatDate"
import { formatDocument } from "@/helpers/formatDocument"
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  FileText,
  Mail,
  QrCode,
  RefreshCw,
  User,
  XCircle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface ChargeDetails {
  id: string
  amount: number
  description: string
  status: string
  payer_name?: string
  payer_email?: string
  payer_document?: string
  pix_key?: string
  qr_code?: string
  expires_at: string
  paid_at?: string
  created_at: string
  stripe_payment_intent_id?: string
}

interface ChargeHistory {
  id: string
  pix_charge_id: string,
  status: string,
  created_at: string
}


export default function ChargeDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [charge, setCharge] = useState<ChargeDetails | null>(null)
  const [chargeHistory, setChargeHistory] = useState<ChargeHistory[] | null>([])
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchChargeDetails(params.id as string)
      fetchChargeHistory(params.id as string)
    }
  }, [params.id])

  const fetchChargeDetails = async (chargeId: string) => {
    try {
      const response = await fetch(`/api/charges/${chargeId}`)
      if (response.ok) {
        const data = await response.json()
        setCharge(data.charge)
      } else {
        router.push("/dashboard/charges")
      }
    } catch (error) {
      console.error("Error fetching charge details:", error)
      router.push("/dashboard/charges")
    } finally {
      setLoading(false)
    }
  }

  const fetchChargeHistory = async (chargeId: string) => {
    try {
      const response = await fetch(`/api/charges/${chargeId}/history`)
      if (response.ok) {
        const data = await response.json()
        setChargeHistory(data.history || [])
      }
    } catch (error) {
      console.error("Error fetching charge history:", error)
      router.push("/dashboard/charges")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!charge) return

    if (newStatus === 'pending' && isExpired(charge.created_at)) {
      toast.error("Não é possivel ativar uma cobrança expirada")
      return;
    }

    try {
      const response = await fetch(`/api/charges/${charge.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setCharge({ ...charge, status: newStatus })
      }

      await fetchChargeHistory(params.id as string)
    } catch (error) {
      console.error("Error updating charge status:", error)
    }
  }

  const copyToClipboard = async (text: string) => {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(text)
      toast.success("QR Code copiado")
    } catch (error) {
      console.error("Error copying to clipboard:", error)
    } finally {
      setCopying(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "created":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "paid":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago"
      case "pending":
        return "Pendente"
      case "expired":
        return "Expirado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-teal-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "expired":
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const canCancel = (status: string) => {
    return status === "pending"
  }

  const canReactivate = (status: string) => {
    return status === "expired" || status === "cancelled"
  }

  if (loading) {
    <CustomLoading text="Carregando detalhes da cobrança..." />
  }

  if (!charge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Cobrança não encontrada</p>
          <Link href="/dashboard/charges">
            <Button>Voltar para cobranças</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        leftAction={
          <Link href="/dashboard/charges">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        }
        title="Detalhes da Cobrança"
        description={`ID: ${charge.id}`}
        action={
          <div className="flex items-center space-x-2">
            {getStatusIcon(charge.status)}
            <Badge className={getStatusColor(charge.status)}>
              {getStatusText(charge.status)}
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charge Information */}
          <CustomCard>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Informações da Cobrança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valor</label>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(charge.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(charge.status)}
                    <Badge className={getStatusColor(charge.status)}>{getStatusText(charge.status)}</Badge>
                    {charge.status === "pending" && isExpired(charge.expires_at) && (
                      <Badge variant="destructive" className="text-xs">
                        Expirado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                <p className="mt-1">{charge.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                  <p className="mt-1 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(charge.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expira em</label>
                  <p className="mt-1 flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {formatDate(charge.expires_at)}
                  </p>
                </div>
              </div>

              {charge.paid_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pago em</label>
                  <p className="mt-1 flex items-center text-teal-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {formatDate(charge.paid_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </CustomCard>

          {/* Payer Information */}
          <CustomCard>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informações do Pagador
              </CardTitle>
            </CardHeader>
            <CardContent>
              {charge.payer_name || charge.payer_email || charge.payer_document ? (
                <div className="space-y-3">
                  {charge.payer_name && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome</label>
                      <p className="mt-1">{charge.payer_name}</p>
                    </div>
                  )}
                  {charge.payer_email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="mt-1 flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        {charge.payer_email}
                      </p>
                    </div>
                  )}
                  {charge.payer_document && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">CPF/CNPJ</label>
                      <p className="mt-1">{formatDocument(charge.payer_document)}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma informação do pagador fornecida</p>
              )}
            </CardContent>
          </CustomCard>

          {/* Actions */}
          <CustomCard>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {canCancel(charge.status) && (
                  <Button variant="destructive" onClick={() => handleStatusChange("cancelled")}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar Cobrança
                  </Button>
                )}

                {canReactivate(charge.status) && (
                  <Button variant="outline" onClick={() => handleStatusChange("pending")}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reativar Cobrança
                  </Button>
                )}

                {charge.pix_key && (
                  <Button variant="outline" onClick={() => copyToClipboard(charge.pix_key!)} disabled={copying}>
                    <Copy className="mr-2 h-4 w-4" />
                    {copying ? "Copiando..." : "Copiar Chave PIX"}
                  </Button>
                )}
              </div>
            </CardContent>
          </CustomCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          {charge.qr_code && (
            <CustomCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="mr-2 h-5 w-5" />
                  QR Code PIX
                </CardTitle>
                <CardDescription>Escaneie o código para realizar o pagamento</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <Image
                    src={charge.qr_code || "/placeholder.svg"}
                    alt="QR Code PIX"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => copyToClipboard(charge.qr_code!)}
                  disabled={copying}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copying ? "Copiando..." : "Copiar QR Code"}
                </Button>
              </CardContent>
            </CustomCard>
          )}

          {/* PIX Key */}
          {charge.pix_key && (
            <CustomCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Chave PIX
                </CardTitle>
                <CardDescription>Chave para pagamento manual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-lg border border-pink-600">
                  <code className="text-sm break-all">{charge.pix_key}</code>
                </div>
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => copyToClipboard(charge.pix_key!)}
                  disabled={copying}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copying ? "Copiando..." : "Copiar Chave"}
                </Button>
              </CardContent>
            </CustomCard>
          )}

          {/* Quick Stats */}
          <CustomCard>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-medium">{formatCurrency(charge.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(charge.status)}>
                  {getStatusText(charge.status)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado:</span>
                <span className="text-sm">{new Date(charge.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
              {charge.paid_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago:</span>
                  <span className="text-sm text-teal-600">{new Date(charge.paid_at).toLocaleDateString("pt-BR")}</span>
                </div>
              )}
            </CardContent>
          </CustomCard>
          <CustomCard>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Timeline defaultValue={3}>

                {chargeHistory?.map((history, index) => <TimelineItem
                  key={history.id}
                  step={index}
                  className="group-data-[orientation=vertical]/timeline:sm:ms-32"
                >
                  <TimelineHeader>
                    <TimelineSeparator />
                    <TimelineDate className="group-data-[orientation=vertical]/timeline:sm:absolute group-data-[orientation=vertical]/timeline:sm:-left-32 group-data-[orientation=vertical]/timeline:sm:w-20 group-data-[orientation=vertical]/timeline:sm:text-right">
                      {formatDate(history.created_at)}
                    </TimelineDate>
                    <TimelineTitle className="sm:-mt-0.5">
                      <Badge className={getStatusColor(history.status)}>
                        {getStatusText(history.status)}
                      </Badge>
                    </TimelineTitle>
                    <TimelineIndicator />
                  </TimelineHeader>
                </TimelineItem>)}
              </Timeline>

            </CardContent>
          </CustomCard>
        </div>
      </div>
    </div>
  )
}
