import { createServerClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: plans, error: plansError } = await supabase
      .from("plans")
      .select()
      .order("price")

    if (plansError) throw plansError

    return NextResponse.json({ success: true, plans, public: true })
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}