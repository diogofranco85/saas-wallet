import { authOptions } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


interface IParams {
  id: string
}

export async function GET(request: NextRequest, { params }: { params: Promise<IParams> }) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select()
      .eq("user_id", session.user.id)
      .eq("id", id)
      .single();

    if (notificationsError) {
      throw notificationsError;
    }

    return NextResponse.json({ notifications })

  } catch (error: any) {
    console.error("Error creating company:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<IParams> }) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data, error: notificationsErrorDelete } = await supabase
      .from("notifications")
      .update({ touched: true })
      .eq("user_id", session.user.id)
      .eq("id", id)

    if (notificationsErrorDelete) {
      throw notificationsErrorDelete;
    }

    console.log("data", data)

    return NextResponse.json({ message: "notifications deleted" }, { status: 200 })

  } catch (error: any) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
  }
}