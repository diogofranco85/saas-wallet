import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Simulate processing the webhook
    return NextResponse.json(
      {
        message: "Event not handled",
      },
      { status: 200 })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Internal server error", message: error.message }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}