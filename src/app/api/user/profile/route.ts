import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()
        const data = await request.json()

        // Update user profile
        const { error } = await supabase
            .from("users")
            .update({
                name: data.name,
                // Add other fields as needed
            })
            .eq("email", session.user.email)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating profile:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerClient()

        // Get user profile
        const { data: user, error } = await supabase
            .from("users")
            .select("*, companies(*)")
            .eq("email", session.user.email)
            .single()

        if (error) throw error

        return NextResponse.json({ user })
    } catch (error) {
        console.error("Error fetching profile:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
