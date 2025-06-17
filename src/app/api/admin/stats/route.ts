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

        // Verificar se o usuário é admin
        const { data: user } = await supabase.from("users").select("role").eq("email", session.user.email).single()

        if (user?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Buscar estatísticas
        const [{ count: totalUsers }, { count: totalCompanies }, { count: totalCharges }, { data: revenueData }] =
            await Promise.all([
                supabase.from("users").select("*", { count: "exact", head: true }),
                supabase.from("companies").select("*", { count: "exact", head: true }),
                supabase.from("pix_charges").select("*", { count: "exact", head: true }),
                supabase.from("transactions").select("amount").eq("type", "fee"),
            ])

        const totalRevenue = revenueData?.reduce((sum, transaction) => sum + Number.parseFloat(transaction.amount), 0) || 0

        return NextResponse.json({
            totalUsers: totalUsers || 0,
            totalCompanies: totalCompanies || 0,
            totalCharges: totalCharges || 0,
            totalRevenue,
        })
    } catch (error) {
        console.error("Error fetching admin stats:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
