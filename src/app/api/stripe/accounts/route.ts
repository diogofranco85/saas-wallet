import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import { stripe, STRIPE_CONFIG, type CreateAccountParams } from "@/lib/stripe"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()
        const data: CreateAccountParams = await request.json()

        // Buscar usuário e empresa
        const { data: user } = await supabase
            .from("users")
            .select("company_id, role")
            .eq("email", session.user.email)
            .single()

        if (!user?.company_id) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 })
        }

        // Verificar permissão (apenas owner pode criar conta Stripe)
        if (user.role !== "owner") {
            return NextResponse.json({ error: "Only company owner can create Stripe account" }, { status: 403 })
        }

        // Buscar dados da empresa
        const { data: company } = await supabase.from("companies").select("*").eq("id", user.company_id).single()

        if (!company) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 })
        }

        // Verificar se já existe conta Stripe
        if (company.stripe_account_id) {
            return NextResponse.json({ error: "Stripe account already exists" }, { status: 400 })
        }

        // Criar conta Express no Stripe
        const account = await stripe.accounts.create({
            type: "express",
            country: STRIPE_CONFIG.country,
            email: data.email,
            business_type: data.business_type || "company",
            company:
                data.business_type === "company"
                    ? {
                        name: data.company?.name || company.name,
                        tax_id: data.company?.tax_id || company.document.replace(/\D/g, ""),
                        phone: data.company?.phone || company.phone,
                    }
                    : undefined,
            individual:
                data.business_type === "individual"
                    ? {
                        first_name: data.individual?.first_name || "",
                        last_name: data.individual?.last_name || "",
                        email: data.individual?.email || data.email,
                        phone: data.individual?.phone,
                    }
                    : undefined,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
                pix_payments: { requested: true }, // Habilitar PIX
            },
            settings: {
                payouts: {
                    schedule: {
                        interval: "daily",
                    },
                },
            },
        })

        // Criar link de onboarding
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe/refresh`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe/success`,
            type: "account_onboarding",
        })

        // Atualizar empresa com dados do Stripe
        const { error: updateError } = await supabase
            .from("companies")
            .update({
                stripe_account_id: account.id,
                stripe_account_status: "pending",
                stripe_onboarding_url: accountLink.url,
            })
            .eq("id", user.company_id)

        if (updateError) throw updateError

        return NextResponse.json({
            success: true,
            account_id: account.id,
            onboarding_url: accountLink.url,
        })
    } catch (error) {
        console.error("Error creating Stripe account:", error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 },
        )
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()

        // Buscar usuário e empresa
        const { data: user } = await supabase.from("users").select("company_id").eq("email", session.user.email).single()

        if (!user?.company_id) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 })
        }

        // Buscar dados da empresa
        const { data: company } = await supabase
            .from("companies")
            .select("stripe_account_id, stripe_account_status, stripe_onboarding_url, stripe_dashboard_url")
            .eq("id", user.company_id)
            .single()

        if (!company) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 })
        }

        let stripeAccount = null
        if (company.stripe_account_id) {
            try {
                // Buscar dados atualizados da conta no Stripe
                stripeAccount = await stripe.accounts.retrieve(company.stripe_account_id)

                // Atualizar status na base de dados se necessário
                const newStatus = stripeAccount.charges_enabled ? "active" : "pending"
                if (newStatus !== company.stripe_account_status) {
                    await supabase.from("companies").update({ stripe_account_status: newStatus }).eq("id", user.company_id)
                }
            } catch (stripeError) {
                console.error("Error fetching Stripe account:", stripeError)
            }
        }

        return NextResponse.json({
            stripe_account_id: company.stripe_account_id,
            stripe_account_status: company.stripe_account_status,
            stripe_onboarding_url: company.stripe_onboarding_url,
            stripe_dashboard_url: company.stripe_dashboard_url,
            stripe_account: stripeAccount
                ? {
                    id: stripeAccount.id,
                    charges_enabled: stripeAccount.charges_enabled,
                    payouts_enabled: stripeAccount.payouts_enabled,
                    details_submitted: stripeAccount.details_submitted,
                    requirements: stripeAccount.requirements,
                }
                : null,
        })
    } catch (error) {
        console.error("Error fetching Stripe account:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
