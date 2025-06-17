import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()

        // Criar empresa
        const { data: plans, error: plansError } = await supabase
            .from("plans")
            .select("id, name, price")

        if (plansError) throw plansError


        return NextResponse.json({ success: true, plans })
    } catch (error) {
        console.error("Error creating company:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}