import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

        // Cancelar convite
        const { error } = await supabase
            .from("invitations")
            .update({ status: "cancelled" })
            .eq("id", invitationId)
            .eq("company_id", user.company_id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error canceling invitation:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
