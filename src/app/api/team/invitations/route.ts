import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import { randomBytes } from "crypto"
import { EmailTemplateInvite } from "@/components/email/invitations/invite"
import { resend } from "@/lib/resend"
import { formatDate } from "@/helpers/formatDate"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

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

    // Buscar convites pendentes
    const { data: invitations, error } = await supabase
      .from("invitations")
      .select(`
        *,
        users!invitations_invited_by_fkey (name)
      `)
      .eq("company_id", user.company_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) throw error

    // Formatar dados
    const formattedInvitations = invitations.map((inv) => ({
      ...inv,
      invited_by_name: inv.users?.name || "Usuário",
    }))

    return NextResponse.json({ invitations: formattedInvitations })
  } catch (error) {
    console.error("Error fetching invitations:", error)
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
    const { email, role } = await request.json()

    // Buscar usuário e empresa
    const { data: user } = await supabase
      .from("users")
      .select("id, name, company_id, role, companies(id, name)")
      .eq("email", session.user.email)
      .single()

    if (!user?.company_id) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Verificar permissão
    if (user.role !== "owner" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verificar se o email já está na empresa
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .eq("company_id", user.company_id)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "User already in company" }, { status: 400 })
    }

    // Verificar se já existe convite pendente
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id")
      .eq("email", email)
      .eq("company_id", user.company_id)
      .eq("status", "pending")
      .single()

    if (existingInvite) {
      return NextResponse.json({ error: "Já existe um convite ativo para esse email" }, { status: 400 })
    }

    // Gerar token único
    const token = randomBytes(32).toString("hex")

    // Criar convite
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: invitation, error } = await supabase
      .from("invitations")
      .insert({
        company_id: user.company_id,
        invited_by: user.id,
        email,
        role,
        token,
        status: "pending",
        expires_at: expiresAt, // 7 dias
      })
      .select(`
        *,
        users!invitations_invited_by_fkey (name)
      `)
      .single()

    if (error) throw error

    // Formatar resposta
    const formattedInvitation = {
      ...invitation,
      invited_by_name: invitation.users?.name || "Usuário",
    }

    // Registrar atividade
    await supabase.rpc("log_team_activity", {
      p_company_id: user.company_id,
      p_user_id: user.id,
      p_target_user_id: null,
      p_action_type: "invitation_sent",
      p_description: `Convite enviado para ${email}`,
      p_metadata: { email, role },
    })

    const companies = user?.companies

    const company = Array.isArray(companies) ? companies[0] : companies

    const { error: resendError } = await resend.emails.send({
      from: process.env.RESEND_EMAIL_FROM as string,
      to: [invitation.email],
      subject: `Hype Pay | Convite de Acesso - ${company.name}`,
      react: EmailTemplateInvite({
        invite: {
          link: `${process.env.SITE_URL}/invite/${invitation.token}`,
          senderName: user.name,
          expiresAt: formatDate(expiresAt)
        },
        companies: company
      })
    })

    if (resendError) {
      console.error("Error sending email:", resendError.message)
    }

    return NextResponse.json({ success: true, invitation: formattedInvitation })
  } catch (error) {
    console.error("Error creating invitation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
