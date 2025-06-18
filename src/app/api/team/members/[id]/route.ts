import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

interface Params {
    id: string
}

export async function DELETE(_: Request, { params }: { params: Promise<Params> }) {
    try {
        const supabase = createRouteHandlerClient({ cookies })
        const { id: memberId } = await params;
        const {
            data: { user: currentUser },
        }: any = await supabase.auth.getUser()

        if (!currentUser) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!memberId) {
            return new NextResponse("Missing member ID", { status: 400 })
        }

        const { data: targetMember, error: targetMemberError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", memberId)
            .single()

        if (targetMemberError) {
            return new NextResponse("Failed to fetch member", { status: 500 })
        }

        const { error: deleteError } = await supabase
            .from("team_members")
            .delete()
            .eq("member_id", memberId)
            .eq("company_id", currentUser.company_id)

        if (deleteError) {
            return new NextResponse("Failed to remove member", { status: 500 })
        }

        // Registrar atividade
        await supabase.rpc("log_team_activity", {
            p_company_id: currentUser.company_id,
            p_user_id: currentUser.id,
            p_target_user_id: memberId,
            p_action_type: "member_removed",
            p_description: `Membro removido da equipe`,
            p_metadata: { removed_role: targetMember.role },
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Error removing team member:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
    try {
        const supabase = createRouteHandlerClient({ cookies })
        const { id: memberId } = await params;

        const {
            data: { user: currentUser },
        }: any = await supabase.auth.getUser()

        if (!currentUser) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!memberId) {
            return new NextResponse("Missing member ID", { status: 400 })
        }

        const { role } = await request.json()

        if (!role) {
            return new NextResponse("Missing role", { status: 400 })
        }

        const { data: targetMember, error: targetMemberError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", memberId)
            .single()

        if (targetMemberError) {
            return new NextResponse("Failed to fetch member", { status: 500 })
        }

        const { error: updateError } = await supabase
            .from("team_members")
            .update({ role: role })
            .eq("member_id", memberId)
            .eq("company_id", currentUser.company_id)

        if (updateError) {
            return new NextResponse("Failed to update member role", { status: 500 })
        }

        // Registrar atividade
        await supabase.rpc("log_team_activity", {
            p_company_id: currentUser.company_id,
            p_user_id: currentUser.id,
            p_target_user_id: memberId,
            p_action_type: "role_changed",
            p_description: `Função alterada para ${role}`,
            p_metadata: { old_role: targetMember.role, new_role: role },
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Error updating team member role:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
