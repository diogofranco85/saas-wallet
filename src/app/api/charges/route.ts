import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()
        const data = await request.json()

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
        if (!company.stripe_account_id) {
            return NextResponse.json(
                {
                    error: "Stripe account not configured. Please complete Stripe onboarding first.",
                },
                { status: 400 },
            )
        }

        // Verificar status da conta Stripe
        const stripeAccount = await stripe.accounts.retrieve(company.stripe_account_id)
        if (!stripeAccount.charges_enabled) {
            return NextResponse.json(
                {
                    error: "Stripe account not ready to accept charges. Please complete onboarding.",
                },
                { status: 400 },
            )
        }

        // Calcular valores
        const grossAmount = Math.round(data.amount * 100) // Converter para centavos
        const feePercentage = company.plans?.pix_fee_percentage || 0.0199
        const feeFixed = Math.round((company.plans?.pix_fee_fixed || 0) * 100)
        const feeAmount = Math.round(grossAmount * feePercentage) + feeFixed
        const platformFee = Math.round(grossAmount * STRIPE_CONFIG.platform_fee_percentage)
        const netAmount = grossAmount - feeAmount

        // Criar Payment Intent no Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: grossAmount,
            currency: STRIPE_CONFIG.currency,
            payment_method_types: ["pix"],
            description: data.description,
            metadata: {
                company_id: user.company_id,
                created_by: user.id,
                payer_name: data.payerName || "",
                payer_document: data.payerDocument || "",
                payer_email: data.payerEmail || "",
            },
            application_fee_amount: platformFee, // Taxa da plataforma
            transfer_data: {
                destination: company.stripe_account_id,
            },
            automatic_payment_methods: {
                enabled: false,
                //allow_redirects: "never",
            },
        })

        // Criar cobrança PIX no banco
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24) // Expira em 24 horas

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
                stripe_payment_intent_id: paymentIntent.id,
                stripe_fee_amount: feeAmount / 100, // Converter de volta para reais
                net_amount: netAmount / 100,
                status: "pending",
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({
            success: true,
            charge: {
                ...charge,
                client_secret: paymentIntent.client_secret,
                payment_intent_id: paymentIntent.id,
            },
        })
    } catch (error) {
        console.error("Error creating charge:", error)
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
        const { data: user } = await supabase.from("users").select("company_id").eq("email", session.user.email).single()

        if (!user?.company_id) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 })
        }

        // Construir query
        let query = supabase.from("pix_charges").select("*", { count: "exact" }).eq("company_id", user.company_id)

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
