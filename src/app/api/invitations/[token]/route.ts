import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const supabase = createServerClient()
    const { token } = await params

    // Buscar convite com detalhes da empresa
    const { data: invitation, error } = await supabase
      .from("invitations")
      .select(`
                *,
                companies (
                name,
                document
                ),
                users!invitations_invited_by_fkey (
                name
                )
            `)
      .eq("token", token)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Não foi localizado" }, { status: 404 })
      }
      throw error
    }

    // Formatar resposta
    const formattedInvitation = {
      ...invitation,
      company: invitation.companies,
      invited_by: invitation.users,
    }

    return NextResponse.json({ invitation: formattedInvitation })
  } catch (error) {
    console.error("Error fetching invitation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
