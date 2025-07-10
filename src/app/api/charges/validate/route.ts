import { HttpException } from "@/helpers/http-exceptions";
import { authOptions } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
        *,
        plans (
          pix_fee_percentage,
          pix_fee_fixed,
          max_employees
        )
      `)
      .eq("id", user.company_id)
      .single()


    if (!company) {
      return NextResponse.json({ message: "Empresão não foi localizada" }, { status: 404 })
    }

    const plansExpired = new Date(company.access_date) < new Date()
    if (plansExpired) {
      throw new HttpException(400, "Seu plano expirou, para poder fazer nova cobrança e necessario contratar novamente")
    }

    const startPlanDate = new Date(company.access_date)
    startPlanDate.setDate(startPlanDate.getDate() - 30);

    const { error: pixChargesCountError, count: pixChargesCount } = await supabase
      .from("pix_charges")
      .select("id", { count: "exact", head: true })
      .eq("company_id", company.id)
      .eq("status", "paid")
      .gte('created_at', startPlanDate.toISOString())
      .lt('created_at', company.access_date);

    if (pixChargesCountError) {
      throw new HttpException(400, { error: "Houve um error ao validar a quantidade de cobranças recebidas" })
    }

    if ((pixChargesCount || 0) >= company.plans.max_employees) {
      throw new HttpException(400, { error: "Voce já atingiu o número máximo de cobranças no mês do seu plano" })
    }

    return new Response(JSON.stringify({ isAllow: true }));

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