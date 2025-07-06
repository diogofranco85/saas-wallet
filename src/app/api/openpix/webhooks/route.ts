import { NextRequest, NextResponse } from "next/server";
import { receivedPixWebhook } from "./receive_pix";
import { HttpException } from "@/helpers/http-exceptions";

export async function POST(request: NextRequest) {
  try {
    // Simulate processing the webhook
    console.log("Webhook received and processed successfully");

    const body = await request.json()
    const header = request.headers.get("X-OpenPix-Signature");

    if (!header) {
      throw new HttpException(400, "Missing x-webhook-signature header");
    }

    switch (body.event) {
      case "OPENPIX:TRANSACTION_RECEIVED":
        await receivedPixWebhook(body, header);
        break;
      default: return NextResponse.json(
        {
          message: "Event not handled",
        },
        { status: 429 },
      )
    }

    return NextResponse.json(
      {
        message: "webhook received and processed successfully",
      },
      { status: 200 })

  } catch (error: any) {
    if (error instanceof HttpException) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Internal server error", message: error.message }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}