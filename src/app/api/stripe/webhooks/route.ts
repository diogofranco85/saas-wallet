import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const headersList = await headers()
        const signature = headersList.get("stripe-signature")!

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err) {
            console.error("Webhook signature verification failed:", err)
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
        }

        const supabase = createServerClient()

        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent

                // Buscar cobrança no banco
                const { data: charge, error: chargeError } = await supabase
                    .from("pix_charges")
                    .select("*")
                    .eq("stripe_payment_intent_id", paymentIntent.id)
                    .single()

                if (chargeError || !charge) {
                    console.error("Charge not found for payment intent:", paymentIntent.id)
                    break
                }

                // Atualizar status da cobrança
                const { error: updateError } = await supabase
                    .from("pix_charges")
                    .update({
                        status: "paid",
                        paid_at: new Date().toISOString(),
                        stripe_charge_id: paymentIntent.latest_charge as string,
                    })
                    .eq("id", charge.id)

                if (updateError) {
                    console.error("Error updating charge status:", updateError)
                    break
                }

                // Atualizar saldo da carteira
                const { error: walletError } = await supabase.rpc("update_wallet_balance", {
                    p_company_id: charge.company_id,
                    p_amount: charge.net_amount, // Usar valor líquido
                    p_charge_id: charge.id,
                })

                if (walletError) {
                    console.error("Error updating wallet balance:", walletError)
                }

                console.log(`Payment succeeded for charge ${charge.id}`)
                break
            }

            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent

                // Atualizar status da cobrança para falha
                const { error } = await supabase
                    .from("pix_charges")
                    .update({ status: "failed" })
                    .eq("stripe_payment_intent_id", paymentIntent.id)

                if (error) {
                    console.error("Error updating failed charge:", error)
                }

                console.log(`Payment failed for payment intent ${paymentIntent.id}`)
                break
            }

            case "account.updated": {
                const account = event.data.object as Stripe.Account

                // Atualizar status da conta na empresa
                const newStatus = account.charges_enabled ? "active" : "pending"

                const { error } = await supabase
                    .from("companies")
                    .update({ stripe_account_status: newStatus })
                    .eq("stripe_account_id", account.id)

                if (error) {
                    console.error("Error updating account status:", error)
                }

                console.log(`Account ${account.id} updated, status: ${newStatus}`)
                break
            }

            case "transfer.created": {
                const transfer = event.data.object as Stripe.Transfer

                // Registrar transferência se necessário
                if (transfer.metadata?.charge_id) {
                    const { error } = await supabase
                        .from("pix_charges")
                        .update({ stripe_transfer_id: transfer.id })
                        .eq("id", transfer.metadata.charge_id)

                    if (error) {
                        console.error("Error updating transfer ID:", error)
                    }
                }

                console.log(`Transfer created: ${transfer.id}`)
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
    }
}
