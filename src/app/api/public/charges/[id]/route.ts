import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import { maskDocument } from "@/helpers/maskDocument"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const supabase = createServerClient()
    const { id: chargeId } = await params;

    const { data: charge, error } = await supabase
      .from("pix_charges")
      .select("id, amount, description, status, payer_name, payer_email, payer_document, pix_key, qr_code, expires_at, paid_at, created_at")
      .eq("id", chargeId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Charge not found" }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ charge: { ...charge, payer_document: maskDocument(charge.payer_document) } })
  } catch (error) {
    console.error("Error fetching charge details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
