import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()
        const { id: chargeId } = await params;

        // Buscar usuário e empresa
        const { data: user } = await supabase.from("users").select("company_id").eq("email", session.user.email).single()

        if (!user?.company_id) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 })
        }

        // Buscar cobrança específica
        const { data: charge, error } = await supabase
            .from("pix_charges")
            .select("*")
            .eq("id", chargeId)
            .eq("company_id", user.company_id)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json({ error: "Charge not found" }, { status: 404 })
            }
            throw error
        }

        return NextResponse.json({ charge })
    } catch (error) {
        console.error("Error fetching charge details:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()
        const { id: chargeId } = await params;
        const { status } = await request.json()

        // Buscar usuário e empresa
        const { data: user } = await supabase.from("users").select("company_id").eq("email", session.user.email).single()

        if (!user?.company_id) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 })
        }

        // Validar status
        const validStatuses = ["pending", "paid", "expired", "cancelled"]
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        // Atualizar status da cobrança
        const updateData: any = { status }

        // Se estiver marcando como pago, adicionar timestamp
        if (status === "paid") {
            updateData.paid_at = new Date().toISOString()
        }

        // Se estiver reativando, estender prazo de expiração
        if (status === "pending") {
            const newExpiresAt = new Date()
            newExpiresAt.setHours(newExpiresAt.getHours() + 24)
            updateData.expires_at = newExpiresAt.toISOString()
        }

        const { data: charge, error } = await supabase
            .from("pix_charges")
            .update(updateData)
            .eq("id", chargeId)
            .eq("company_id", user.company_id)
            .select()
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json({ error: "Charge not found" }, { status: 404 })
            }
            throw error
        }

        // Se a cobrança foi paga, criar transação na carteira
        if (status === "paid") {
            const { error: walletError } = await supabase.rpc("update_wallet_balance", {
                p_company_id: user.company_id,
                p_amount: charge.amount,
                p_charge_id: chargeId,
            })

            if (walletError) {
                console.error("Error updating wallet balance:", walletError)
            }
        }

        return NextResponse.json({ success: true, charge })
    } catch (error) {
        console.error("Error updating charge:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
