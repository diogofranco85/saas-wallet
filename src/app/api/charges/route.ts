import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import { createBilling } from "@/lib/openpix"
import { formatDocument } from "@/helpers/formatDocument"
import { resend } from "@/lib/resend"
import { EmailTemplateCreateCharge } from "@/components/email/charge/create"
import { maskDocument } from "@/helpers/maskDocument"
import { HttpException } from "@/helpers/http-exceptions"
import { ICreateBillingRequest } from "@/types/openpix.interface"

export async function POST(request: NextRequest) {
  let chargeId;
  const supabase = createServerClient()
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (data.amount <= 4.99) {
      return NextResponse.json({ message: "O valor da cobrança não pode ser menor que R$ 5,00" }, { status: 400 })
    }

    // Buscar usuário e empresa
    const { data: user } = await supabase
      .from("users")
      .select("id, company_id")
      .eq("email", session.user.email)
      .single()

    if (!user?.company_id) {
      return NextResponse.json({ message: "Empresão não foi localizada" }, { status: 404 })
    }

    // Buscar dados da empresa e plano
    const { data: company } = await supabase
      .from("companies")
      .select(`
        *,
        plans (
          pix_fee_percentage,
          pix_fee_fixed
        )
      `)
      .eq("id", user.company_id)
      .single()

    if (!company) {
      return NextResponse.json({ message: "Empresão não foi localizadad" }, { status: 404 })
    }

    // Verificar se a empresa tem conta Stripe ativa
    if (!company.pix_key) {
      return NextResponse.json(
        {
          error: "Você nao possui uma chave PIX cadastrada. Por favor, cadastre uma chave PIX na sua conta.",
        },
        { status: 400 },
      )
    }

    // Calcular valores
    const grossAmount = Math.round(data.amount * 100) // Converter para centavos
    const feePercentage = Math.round((grossAmount * (company.plans?.pix_fee_percentage || 0.0199) / 100))
    const feeFixed = Math.round((company.plans?.pix_fee_fixed || 0) * 100)
    const feeAmount = Math.round(feeFixed + feePercentage)
    const netAmount = grossAmount - (feeAmount + feeFixed)

    // Criar cobrança PIX no banco
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15) // Expira em 24 horas

    const { data: charge, error } = await supabase
      .from("pix_charges")
      .insert({
        company_id: user.company_id,
        created_by: user.id,
        amount: data.amount,
        description: data.description,
        payer_name: data.payerName,
        payer_document: data.payerDocument,
        payer_email: data.payerEmail,
        expires_at: expiresAt.toISOString(),
        fee_amount: feeAmount / 100, // Converter de volta para reais
        net_amount: netAmount / 100,
        status: "created",
      })
      .select()
      .single()

    if (error) throw error

    const splitValue = grossAmount - feeAmount - feeFixed;

    chargeId = charge.id;

    const createBillingPayload: ICreateBillingRequest = {
      correlationID: charge.id,
      value: grossAmount,
      comment: data.description,
      additionalInfo: [
        {
          key: "Empresa",
          value: company.name,
        },
        {
          key: "ID da Empresa",
          value: company.id,
        },
        {
          key: "Documento da Empresa",
          value: formatDocument(company.document),
        }
      ],
      costumer: {
        email: data.payerEmail || "",
        name: data.payerName,
        taxID: data.payerDocument
      },
      //subaccount: company.pix_key,
      splits: [
        {
          value: splitValue,
          pixKey: company.pix_key || "",
          splitType: "SPLIT_SUB_ACCOUNT"
        }
      ],
      expiresIn: 60 * 15, // Expira em 15 minutos
    }

    const paymentIntent = await createBilling(createBillingPayload)

    await supabase.from("pix_charges")
      .update({
        payment_id: paymentIntent.charge.globalID,
        qr_code: paymentIntent.charge.qrCodeImage,
        pix_key: paymentIntent.charge.brCode,
        status: "pending",
      })
      .eq("id", charge.id)

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: "no-replay@hypepay.com.br",
      to: [data.payerEmail],
      subject: `Cobrança PIX - ${company.name}`,
      react: EmailTemplateCreateCharge({
        charge: {
          ...charge,
          payer_document: maskDocument(data.payerDocument),
          pix_key: paymentIntent.charge.brCode,
          qr_code: paymentIntent.charge.qrCodeImage,
          expires_at: expiresAt.toISOString(),
          companies: {
            name: company.name,
            document: company.document,
          }
        }
      })
    })

    if (resendError) {
      console.error("Error sending email:", resendError.message)
    }

    return NextResponse.json({
      success: true,
      charge: {
        ...charge, companies: {
          name: company.name,
          document: company.document,
        }
      },
    })

  } catch (error) {
    await supabase.from("pix_charges")
      .update({
        status: "cancelled",
      })
      .eq("id", chargeId)

    if (error instanceof HttpException) {
      return new Response(JSON.stringify(error.message), {
        status: error.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}

// Manter o método GET existente para listagem
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const offset = (page - 1) * limit

    // Buscar usuário e empresa
    const { data: user } = await supabase
      .from("users")
      .select("company_id")
      .eq("email", session.user.email)
      .single()

    if (!user?.company_id) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Construir query
    let query = supabase
      .from("pix_charges")
      .select("*", { count: "exact" })
      .eq("company_id", user.company_id)

    // Aplicar filtros
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`description.ilike.%${search}%,payer_name.ilike.%${search}%,payer_email.ilike.%${search}%`)
    }

    // Aplicar ordenação
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    // Aplicar paginação
    const { data: charges, error, count } = await query.range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      charges,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching charges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
