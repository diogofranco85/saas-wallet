import { type NextRequest, NextResponse } from "next/server"
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

        // Buscar planos
        const { data: plans, error } = await supabase.from("plans").select("*").order("price", { ascending: true })

        if (error) throw error

        return NextResponse.json({ plans })
    } catch (error) {
        console.error("Error fetching plans:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
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

        const planData = await request.json()

        // Criar plano
        const { data: plan, error } = await supabase.from("plans").insert(planData).select().single()

        if (error) throw error

        return NextResponse.json({ success: true, plan })
    } catch (error) {
        console.error("Error creating plan:", error)
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

        const { planId, ...updateData } = await request.json()

        // Atualizar plano
        const { error } = await supabase.from("plans").update(updateData).eq("id", planId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating plan:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
