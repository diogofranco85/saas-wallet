import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()
        const invitationId = params.id

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
        if (user.role !== "owner" && user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Gerar novo token
        const newToken = randomBytes(32).toString("hex")

        // Atualizar convite
        const { data: invitation, error } = await supabase
            .from("invitations")
            .update({
                token: newToken,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
                status: "pending",
            })
            .eq("id", invitationId)
            .eq("company_id", user.company_id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, invitation })
    } catch (error) {
        console.error("Error resending invitation:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
