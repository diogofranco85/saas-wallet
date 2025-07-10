import { HttpException } from "@/helpers/http-exceptions"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {

  try {
    const supabase = createServerClient()

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, company_id")
      .eq("email", session.user.email)
      .single()

    if (!user?.company_id) {
      return NextResponse.json({ message: "Empresão não foi localizada" }, { status: 404 })
    }

    const { data: company } = await supabase
      .from("companies")
      .select(`
        id
      `)
      .eq("id", user.company_id)
      .single()


    if (!company) {
      return NextResponse.json({ message: "Empresão não foi localizada" }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("pix_charges")
      .select('status, net_amount.sum()')


    if (error) {
      throw new HttpException(400, { error: 'Erro ao somar valores por status' });
      return;
    }

    return new Response(JSON.stringify(data));

  } catch (error: any) {
    if (error instanceof HttpException) {
      return new Response(JSON.stringify(error.message), {
        status: error.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}