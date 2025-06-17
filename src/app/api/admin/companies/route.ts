import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url)
        const page = Number.parseInt(searchParams.get("page") || "1")
        const limit = Number.parseInt(searchParams.get("limit") || "10")
        const offset = (page - 1) * limit

        // Buscar empresas com informações do plano e usuários
        const { data: companies, error } = await supabase
            .from("companies")
            .select(`
        *,
        plans (
          id,
          name,
          price
        ),
        users (
          id,
          name,
          email,
          role
        ),
        wallets (
          balance,
          available_balance
        )
      `)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error

        // Contar total de empresas
        const { count: totalCompanies } = await supabase.from("companies").select("*", { count: "exact", head: true })

        return NextResponse.json({
            companies,
            pagination: {
                page,
                limit,
                total: totalCompanies || 0,
                totalPages: Math.ceil((totalCompanies || 0) / limit),
            },
        })
    } catch (error) {
        console.error("Error fetching companies:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
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

        const { companyId, status, planId } = await request.json()

        // Atualizar empresa
        const { error } = await supabase.from("companies").update({ status, plan_id: planId }).eq("id", companyId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating company:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
