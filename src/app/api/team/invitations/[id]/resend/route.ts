import { EmailTemplateInvite } from "@/components/email/invitations/invite"
import { formatDate } from "@/helpers/formatDate"
import { authOptions } from "@/lib/auth"
import { resend } from "@/lib/resend"
import { createServerClient } from "@/lib/supabase"
import { randomBytes } from "crypto"
import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { id: invitationId } = await params

    // Buscar usuário e empresa
    const { data: user } = await supabase
      .from("users")
      .select("company_id, role, name, companies(id,name)")
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
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: invitation, error } = await supabase
      .from("invitations")
      .update({
        token: newToken,
        expires_at: expiresAt, // 7 dias
        status: "pending",
      })
      .eq("id", invitationId)
      .eq("company_id", user.company_id)
      .select()
      .single()

    if (error) throw error

    const companies = user.companies

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

    return NextResponse.json({ success: true, invitation })
  } catch (error) {
    console.error("Error resending invitation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
