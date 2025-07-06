import { HttpException } from "@/helpers/http-exceptions"
import { createServerClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: faqs, error: faqsError, status } = await supabase
      .from("faq")
      .select("*")
      .order("title")

    if (faqsError) throw new HttpException(status, faqsError.message)

    return NextResponse.json({ success: true, faqs, public: true })
  } catch (error) {
    if (error instanceof HttpException) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 503 })
  }
}