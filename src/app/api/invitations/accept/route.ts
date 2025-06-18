import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()
        const { token } = await request.json()

        // Buscar convite
        const { data: invitation, error: inviteError } = await supabase
            .from("invitations")
            .select("*")
            .eq("token", token)
            .eq("status", "pending")
            .single()

        if (inviteError) {
            if (inviteError.code === "PGRST116") {
                return NextResponse.json({ error: "Invitation not found or already used" }, { status: 404 })
            }
            throw inviteError
        }

        // Verificar se o convite é para o email correto
        if (invitation.email !== session.user.email) {
            return NextResponse.json({ error: "Invitation is for a different email" }, { status: 400 })
        }

        // Verificar se o convite não expirou
        if (new Date(invitation.expires_at) < new Date()) {
            return NextResponse.json({ error: "Invitation has expired" }, { status: 400 })
        }

        // Verificar se o usuário já existe
        const { data: existingUser } = await supabase
            .from("users")
            .select("id, company_id")
            .eq("email", session.user.email)
            .single()

        let userId: string

        if (existingUser) {
            // Atualizar usuário existente
            const { error: updateError } = await supabase
                .from("users")
                .update({
                    company_id: invitation.company_id,
                    role: invitation.role,
                    status: "active",
                })
                .eq("id", existingUser.id)

            if (updateError) throw updateError
            userId = existingUser.id
        } else {
            // Criar novo usuário
            const { data: newUser, error: createError } = await supabase
                .from("users")
                .insert({
                    email: session.user.email,
                    name: session.user.name || "",
                    avatar_url: session.user.image,
                    company_id: invitation.company_id,
                    role: invitation.role,
                    status: "active",
                })
                .select("id")
                .single()

            if (createError) throw createError
            userId = newUser.id
        }

        // Marcar convite como aceito
        const { error: acceptError } = await supabase
            .from("invitations")
            .update({ status: "accepted" })
            .eq("id", invitation.id)

        if (acceptError) throw acceptError

        // Registrar atividade
        await supabase.rpc("log_team_activity", {
            p_company_id: invitation.company_id,
            p_user_id: invitation.invited_by,
            p_target_user_id: userId,
            p_action_type: "invitation_accepted",
            p_description: `${session.user.name} aceitou o convite e entrou na equipe`,
            p_metadata: { email: session.user.email, role: invitation.role },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error accepting invitation:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
