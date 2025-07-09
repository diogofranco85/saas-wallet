import { formatCurrency } from "@/helpers/formatCurrency";
import { HttpException } from "@/helpers/http-exceptions";
import { validateHmac } from "@/helpers/validate-hmac";
import { createServerClient } from "@/lib/supabase";
import { statusParser } from "./status_parse";
import { resend } from "@/lib/resend";
import { EmailTemplatePayCharge } from "@/components/email/charge/pay";
import { maskDocument } from "@/helpers/maskDocument";

export async function receivedPixWebhook(body: any, header: string) {
  try {
    const supabase = createServerClient();

    const { data: webhookData, error: webhookError } = await supabase
      .from("webhook")
      .select("id, hmac")
      .eq("event", body.event)
      .eq("status", "active")
      .single();

    if (webhookError) {
      throw new HttpException(503, "Webhook not found or inactive");
    }

    const isValidSignature = validateHmac(header, body, webhookData.hmac);

    if (!isValidSignature) {
      throw new HttpException(403, "Invalid signature webhook");
    }

    const { data: pixChargeMoviment, error: pixChargeError } = await supabase
      .from("pix_charges")
      .select("*, companies(*)")
      .eq("id", body.charge.correlationID)
      .single()

    if (pixChargeError) {
      throw pixChargeError
    }

    if (pixChargeMoviment.status !== "paid") {
      throw new HttpException(200, `Transaction status current is paid`)
    }

    if (pixChargeMoviment.status !== "pending") {
      throw new HttpException(400, `Transaction not paid, status current: ${pixChargeMoviment.status}`)
    }

    await supabase.from("pix_charges").update({
      paid_at: body.charge.paidAt,
      transaction_id: body.charge.transactionID,
      endtoend: body.pix.endToEndId,
      status: statusParser(body.charge.status),
    }).eq("id", body.charge.correlationID);



    await supabase
      .from("wallets")
      .update({
        available_balance: { increment: pixChargeMoviment.net_amount },
        pending_balance: { decrement: pixChargeMoviment.net_amount },
      })
      .eq("company_id", pixChargeMoviment.company_id);


    const title = 'Pagamento recebido com sucesso!'
    const message = `Pagamento recebido no valor de ${formatCurrency(pixChargeMoviment.amount)} de ${pixChargeMoviment.payer_name} com sucesso!`


    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id")
      .eq("company_id", pixChargeMoviment.company_id)
      .eq("role", 'owner')

    if (usersError) {
      throw new HttpException(400, "Error fetching users for notification");
    }


    const userSenderNotificationArray = [{ id: pixChargeMoviment.created_by }]
    usersData.map(user => {
      if (!userSenderNotificationArray.some(u => u.id === user.id)) {
        userSenderNotificationArray.push({ id: user.id })
      }
    })

    if (userSenderNotificationArray && userSenderNotificationArray.length > 0) {
      const notifications = userSenderNotificationArray.map(user => ({
        user_id: user.id,
        title,
        message,
        touched: false
      }));

      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        throw new HttpException(400, "Error inserting notifications");
      }
    }

    const { error: resendError } = await resend.emails.send({
      from: process.env.RESEND_EMAIL_FROM as string,
      to: [pixChargeMoviment.payerEmail],
      subject: `Pagamento Realizado | Cobrança PIX - ${pixChargeMoviment.companies.name}`,
      react: EmailTemplatePayCharge({
        charge: {
          ...pixChargeMoviment,
          payer_document: maskDocument(pixChargeMoviment.payer_document),
          companies: {
            name: pixChargeMoviment.companies.name,
            document: pixChargeMoviment.companies.document,
          }
        }
      })
    })

    if (resendError) {
      console.error("Error sending email:", resendError.message)
    }

  } catch (error) {
    throw error;
  }

}