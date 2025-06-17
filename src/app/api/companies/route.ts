import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()
        const data = await request.json()

        // Criar empresa
        const { data: company, error: companyError } = await supabase
            .from("companies")
            .insert({
                name: data.name,
                document: data.document,
                email: session.user.email,
                phone: data.phone,
                address: data.address,
                plan_id: data.planId,
            })
            .select()
            .single()

        if (companyError) throw companyError

        // Atualizar usuário com company_id e role owner
        const { error: userError } = await supabase
            .from("users")
            .update({
                company_id: company.id,
                role: "owner",
            })
            .eq("email", session.user.email)

        if (userError) throw userError

        // Criar carteira para a empresa
        const { error: walletError } = await supabase.from("wallets").insert({
            company_id: company.id,
            balance: 0,
            available_balance: 0,
            pending_balance: 0,
        })

        if (walletError) throw walletError

        return NextResponse.json({ success: true, company })
    } catch (error) {
        console.error("Error creating company:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
