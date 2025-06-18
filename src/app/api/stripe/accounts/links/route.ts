import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()
        const { type } = await request.json() // 'onboarding' ou 'dashboard'

        // Buscar usuário e empresa
        const { data: user } = await supabase
            .from("users")
            .select("company_id, role")
            .eq("email", session.user.email)
            .single()

        if (!user?.company_id) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 })
        }

        // Verificar permissão
        if (user.role !== "owner") {
            return NextResponse.json({ error: "Only company owner can access Stripe links" }, { status: 403 })
        }

        // Buscar dados da empresa
        const { data: company } = await supabase
            .from("companies")
            .select("stripe_account_id")
            .eq("id", user.company_id)
            .single()

        if (!company?.stripe_account_id) {
            return NextResponse.json({ error: "Stripe account not found" }, { status: 404 })
        }

        let linkUrl: string

        if (type === "dashboard") {
            // Criar link para o dashboard do Stripe
            const loginLink = await stripe.accounts.createLoginLink(company.stripe_account_id)
            linkUrl = loginLink.url

            // Salvar URL do dashboard
            await supabase.from("companies").update({ stripe_dashboard_url: linkUrl }).eq("id", user.company_id)
        } else {
            // Criar link de onboarding
            const accountLink = await stripe.accountLinks.create({
                account: company.stripe_account_id,
                refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe/refresh`,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe/success`,
                type: "account_onboarding",
            })
            linkUrl = accountLink.url

            // Salvar URL de onboarding
            await supabase.from("companies").update({ stripe_onboarding_url: linkUrl }).eq("id", user.company_id)
        }

        return NextResponse.json({
            success: true,
            url: linkUrl,
        })
    } catch (error) {
        console.error("Error creating Stripe link:", error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 },
        )
    }
}
