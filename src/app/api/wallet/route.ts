import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

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

        // Buscar dados da carteira
        const { data: wallet, error } = await supabase
            .from("wallets")
            .select("*")
            .eq("company_id", user.company_id)
            .single()

        if (error) throw error

        return NextResponse.json({
            balance: Number.parseFloat(wallet.balance || "0"),
            availableBalance: Number.parseFloat(wallet.available_balance || "0"),
            pendingBalance: Number.parseFloat(wallet.pending_balance || "0"),
        })
    } catch (error) {
        console.error("Error fetching wallet:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
