import { CustomCardPayment } from "@/components/custom-card-payment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDate } from "@/helpers/formatDate";
import { IChargeDetails } from "@/types/charge.interface";

import { Head, Html, Body, Tailwind } from "@react-email/components";
import { CheckCircle2Icon } from "lucide-react";

export function EmailTemplatePayCharge({ charge }: { charge: IChargeDetails }) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="text-black font-sans">
          <div className="min-h-screen flex items-center justify-center" >
            <div className="w-full max-w-md">
              <CustomCardPayment charge={charge}>
                <>
                  <div className="bg-green-100 text-green-800 mt-3  flex items-center">
                    <div className="w-1/6 flex items-center justify-center">
                      <CheckCircle2Icon />
                    </div>
                    <div className="py-4 text-green-700">
                      <div className="text-xl">Pagamento realizado</div>
                      <div className="text-sm my-3 ">
                        O pagamento foi realizado e processado com sucesso.
                      </div>
                      {charge.paid_at && (
                        <p><strong>Pago em:</strong> {formatDate(charge.paid_at)}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm m-2 text-center">
                    <p><strong>Confirmação de pagamento</strong></p>
                    <p>{charge.endtoend}</p>
                  </div>
                </>
              </CustomCardPayment>
            </div>
          </div>
        </Body>
      </Tailwind>
    </Html>

  )
}