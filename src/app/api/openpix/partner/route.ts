import { TaxTypeEnum } from "@/enums/tax-type.enum"
import { authOptions } from "@/lib/auth"
import { createPartner } from "@/lib/openpix"
import { CreateAccountParams } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const data: CreateAccountParams = await request.json()

    const { data: user } = await supabase
      .from("users")
      .select("name, email, phone, company_id, role")
      .eq("email", session.user.email)
      .single()

    if (!user?.company_id) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    if (user.role !== "owner") {
      return NextResponse.json({ error: "Only company owner can create Stripe account" }, { status: 403 })
    }


    // Buscar dados da empresa
    const { data: company } = await supabase.from("companies").select("*").eq("id", user.company_id).single()

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const partner = await createPartner({
      preRegistration: {
        name: company.name,
        website: "",
        taxID: {
          taxID: company.document,
          type: company.document.length > 11 ? TaxTypeEnum.LEGAL_PERSON : TaxTypeEnum.INDIVIDUAL_PERSON
        }
      },
      user: {
        email: company.email,
        firstName: user.name,
        lastName: user.name,
        phone: user.phone
      }
    })

    return NextResponse.json({ partner });

  } catch (error) {
    console.error("Error creating Stripe account:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}