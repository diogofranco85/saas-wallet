import { authOptions } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  try {

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { id: chargeId } = await params;

    // Buscar usuário e empresa
    const { data: user } = await supabase.from("users").select("company_id").eq("email", session.user.email).single()

    if (!user?.company_id) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const { data: chargeHistory, error } = await supabase
      .from("pix_charges_history")
      .select("*")
      .eq("pix_charge_id", chargeId)
      .order("created_at", { ascending: false })

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Charge not found" }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ history: chargeHistory })
  } catch (error) {
    console.error("Error fetching charge details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }

}