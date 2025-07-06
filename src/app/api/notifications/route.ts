import { HttpException } from "@/helpers/http-exceptions";
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
    const to = offset + limit - 1

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

    query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(offset, to)

    const { data: notifications, error: notificationsError, count, status } = await query

    if (notificationsError) {
      throw new HttpException(status, notificationsError.message);
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

    if (error instanceof HttpException) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
  }
}