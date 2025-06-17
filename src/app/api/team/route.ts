import { authOptions } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
        let query = supabase.from("users").select("id, email, name, role, status, created_at, company_id", { count: "exact" }).eq("company_id", session.user.company?.id)

        // Aplicar filtros
        if (status && status !== "all") {
            query = query.eq("status", status)
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
        }

        // Aplicar ordenação
        query = query.order(sortBy, { ascending: sortOrder === "asc" })


        const { data: user, error, count } = await query.range(offset, offset + limit - 1)

        if (error) throw error

        if (user?.length === 0) {
            return NextResponse.json({
                user: [],
                pagination: {
                    page: 1,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit),
                },
            }, { status: 200 })
        }

        return NextResponse.json({
            user,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        })
    } catch (error: any) {
        console.error("Error fetching charge details:", error)
        return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
    }
}