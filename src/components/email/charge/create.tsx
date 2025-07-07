import { CustomCardPayment } from "@/components/custom-card-payment";
import { formatDate } from "@/helpers/formatDate";
import { IChargeDetails } from "@/types/charge.interface";

import { Head, Html, Body, Tailwind } from "@react-email/components";

export function EmailTemplateCreateCharge({ charge }: { charge: IChargeDetails }) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="text-black font-sans">
          <div className="min-h-screen flex items-center justify-center" >
            <div className="w-full max-w-md">
              <CustomCardPayment charge={charge}>
                <div className="flex flex-col items-center mt-4">
                  {charge.pix_key &&
                    <div>
                      <p className="border border-pink-600 p-2 m-1 w-full text-center">
                        <strong>Pix copia e cola:</strong>
                        <br />
                        <code className="p-3 text-sm break-all">
                          {charge.pix_key}</code>
                      </p>
                    </div>}
                </div>
                <div className="flex flex-col items-center">
                  {charge.qr_code && (
                    <div className="mt-1">
                      <img src={charge.qr_code} alt="QR Code" height={200} width={200} />
                    </div>
                  )}
                  <p><strong>Expira em:</strong> {formatDate(charge.expires_at)}</p>
                </div>
              </CustomCardPayment>
            </div>
          </div>
        </Body>
      </Tailwind>
    </Html>

  )
}