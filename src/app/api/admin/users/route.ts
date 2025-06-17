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

        // Buscar usuários com informações da empresa
        const { data: users, error } = await supabase
            .from("users")
            .select(`
        *,
        companies (
          id,
          name,
          document,
          status
        )
      `)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error

        // Contar total de usuários
        const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total: totalUsers || 0,
                totalPages: Math.ceil((totalUsers || 0) / limit),
            },
        })
    } catch (error) {
        console.error("Error fetching users:", error)
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

        const { userId, status, role } = await request.json()

        // Atualizar usuário
        const { error } = await supabase.from("users").update({ status, role }).eq("id", userId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating user:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
