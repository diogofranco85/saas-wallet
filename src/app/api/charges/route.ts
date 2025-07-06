import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import { createBilling } from "@/lib/openpix"
import { TaxTypeEnum } from "@/enums/tax-type.enum"

export async function POST(request: NextRequest) {
  let chargeId;
  const supabase = createServerClient()
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (data.amount <= 5.00) {
      return NextResponse.json({ error: "Amount must be greater than 5 Reais" }, { status: 400 })
    }

    // Buscar usuário e empresa
    const { data: user } = await supabase
      .from("users")
      .select("id, company_id")
      .eq("email", session.user.email)
      .single()

    if (!user?.company_id) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
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
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Verificar se a empresa tem conta Stripe ativa
    if (!company.pix_key) {
      return NextResponse.json(
        {
          error: "gateway account not configured. Please complete onboarding first.",
        },
        { status: 400 },
      )
    }

    // Verificar status da conta Stripe
    // const stripeAccount = await stripe.accounts.retrieve(company.pix_key)
    // if (!stripeAccount.charges_enabled) {
    //   return NextResponse.json(
    //     {
    //       error: "Stripe account not ready to accept charges. Please complete onboarding.",
    //     },
    //     { status: 400 },
    //   )
    // }

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
    const paymentIntent = await createBilling({
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
          value: company.document,
        }
      ],
      costumer: {
        email: data.payer_email || "",
        name: data.payer_name,
        taxID: data.payer_document
      },
      splits: [
        {
          value: splitValue,
          pixKey: company.pix_key || "",
          splitType: "SPLIT_SUB_ACCOUNT"
        }
      ]
    })

    await supabase.from("pix_charges")
      .update({
        payment_id: paymentIntent.charge.globalID,
        qr_code: paymentIntent.charge.qrCodeImage,
        pix_key: paymentIntent.charge.brCode,
        status: "pending",
      })
      .eq("id", charge.id)

    return NextResponse.json({
      success: true,
      charge: {
        ...charge,
      },
    })
  } catch (error) {
    console.error("Error creating charge:", error)
    await supabase.from("pix_charges")
      .update({
        status: "cancelled",
      })
      .eq("id", chargeId)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
