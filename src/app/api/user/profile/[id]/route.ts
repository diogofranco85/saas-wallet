import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

interface Params {
    id: string
}

export async function GET(_: Request, { params }: { params: Promise<Params> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()
        const { id: userId } = await params;

        // Get user profile
        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single()

        if (error) throw error

        return NextResponse.json({ user })
    } catch (error) {
        console.error("Error fetching profile:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}