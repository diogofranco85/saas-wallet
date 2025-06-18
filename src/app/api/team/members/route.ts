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

        // Buscar membros da equipe
        const { data: members, error } = await supabase
            .from("users")
            .select("id, name, email, role, status, avatar_url, created_at")
            .eq("company_id", user.company_id)
            .order("created_at", { ascending: false })

        if (error) throw error

        return NextResponse.json({ members })
    } catch (error) {
        console.error("Error fetching team members:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
