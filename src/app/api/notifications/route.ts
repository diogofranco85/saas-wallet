import { authOptions } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const touched = searchParams.get("touched") || "false"
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const offset = (page - 1) * limit

    const supabase = createServerClient()

    let query = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", session.user.id)

    if (touched) {
      query = query.eq("touched", touched)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`)
    }

    const { data: notifications, error: notificationsError, count } = await query.order(sortBy, { ascending: sortOrder === "asc" })


    // const { data: notifications, error: notificationsError, count  } = await query.range(offset, offset * limit - 1)

    if (notificationsError) {
      throw notificationsError;
    }

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })


  } catch (error: any) {
    console.error("Error creating company:", error)
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
  }
}