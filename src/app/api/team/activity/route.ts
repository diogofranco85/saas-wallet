import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
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

        // Buscar atividades da equipe
        const { data: activities, error } = await supabase
            .from("team_activity_log")
            .select(`
        *,
        users!team_activity_log_user_id_fkey (name, email),
        target_users:users!team_activity_log_target_user_id_fkey (name, email)
      `)
            .eq("company_id", user.company_id)
            .order("created_at", { ascending: false })
            .limit(50)

        if (error) throw error

        // Formatar atividades
        const formattedActivities = activities.map((activity) => ({
            id: activity.id,
            type: activity.action_type,
            description: activity.description,
            user_name: activity.users?.name || "Usuário Removido",
            target_user_name: activity.target_users?.name,
            target_user_email: activity.target_users?.email,
            old_role: activity.metadata?.old_role,
            new_role: activity.metadata?.new_role,
            created_at: activity.created_at,
        }))

        return NextResponse.json({ activities: formattedActivities })
    } catch (error) {
        console.error("Error fetching team activity:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
