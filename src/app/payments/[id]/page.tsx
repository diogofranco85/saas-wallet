"use client";
import { CustomCardPayment } from "@/components/custom-card-payment";
import { CustomLoading } from "@/components/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/helpers/formatDate";
import { IChargeDetails } from "@/types/charge.interface";
import { CheckCircle2Icon, CircleX, Clock } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

export default function PaymentIdPage() {

  const [charge, setCharge] = useState<IChargeDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const params = useParams(); // Replace with actual payment ID from route params or context

  useEffect(() => {
    fetchChargeDetails()
  }, []);

  const fetchChargeDetails = async () => {
    try {// Assuming the payment ID is the last segment of the path
      const response = await fetch(`/api/public/charges/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch charge details");
      }
      const data = await response.json();
      setCharge(data.charge);
    } catch (error) {
      console.error("Error fetching charge details:", error);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (expiresAt: string) => {
    const expireDate = new Date(expiresAt)
    expireDate.setHours(expireDate.getHours() - 3); // Adjust for UTC-3 timezone
    return expireDate < new Date();
  }

  const handlerCopyPixKey = async (pixKey: string) => {
    navigator.clipboard.writeText(pixKey)
    toast.success("Chave Pix copiada com sucesso!", { description: "Agora você pode colar em seu aplicativo bancário." })
  }

  const handlerPrint = () => {
    window.print();
  }

  if (loading) {
    return <CustomLoading text="Carregando detalhes do pagamento..." />
  }

  return (
    <div className="min-h-screen flex items-center justify-center" >
      <div className="w-full max-w-md">
        {charge && charge.status === "paid" && (
          <CustomCardPayment charge={charge}>
            <>
              <Alert className="bg-green-100 text-green-800 mt-3  flex items-center">
                <div className="w-1/6 flex items-center justify-center">
                  <CheckCircle2Icon />
                </div>
                <div className="py-4">
                  <AlertTitle className="text-xl">Pagamento realizado</AlertTitle>
                  <AlertDescription className="text-sm my-3">
                    O pagamento foi realizado e processado com sucesso.
                  </AlertDescription>
                  {charge.paid_at && (
                    <p><strong>Pago em:</strong> {formatDate(charge.paid_at)}</p>
                  )}
                </div>
              </Alert>
              <div className="text-sm m-2 text-center">
                <p><strong>Confirmação de pagamento</strong></p>
                <p>{charge.endtoend}</p>
              </div>

              <Button
                variant="outline"
                className="mt-2 p-4 w-full bg-green-600 text-white hover:bg-green-700 hover:text-white"
                onClick={() => handlerPrint()}
              >Imprimir comprovante</Button>
            </>
          </CustomCardPayment>
        )}

        {charge && isExpired(charge.expires_at) && charge.status === 'pending' && (
          <CustomCardPayment charge={charge}>
            <Alert className=" bg-yellow-100 text-yellow-800 mt-3 flex items-center">
              <div className="w-2/6 flex items-center justify-center">
                <Clock />
              </div>
              <div className="py-4">
                <AlertTitle className="text-xl">Pagamento expirado</AlertTitle>
                <AlertDescription className="text-sm">
                  Esse QR-Code ja foi está expirado, por favor peça ao fornecedor para criar uma nova cobrança.
                </AlertDescription>
              </div>
            </Alert>
          </CustomCardPayment>
        )}

        {charge && charge.status === 'cancelled' && (
          <CustomCardPayment charge={charge}>
            <Alert className="bg-red-100 text-red-800 mt-3 flex items-center">
              <div className="w-2/6 flex items-center justify-center">
                <CircleX />
              </div>
              <div className="py-4">
                <AlertTitle className="text-xl">Pagamento cancelada</AlertTitle>
                <AlertDescription className="text-sm">
                  Esse QR-Code foi cancelado pela fornecedor, por favor peça ao fornecedor para criar uma nova cobrança.
                </AlertDescription>
              </div>
            </Alert>
          </CustomCardPayment>
        )}

        {charge && !isExpired(charge.expires_at) && charge.status === 'pending' && (
          <CustomCardPayment charge={charge}>
            <div className="flex flex-col items-center mt-4">
              {charge.pix_key &&
                <div>
                  <p className="border border-pink-600 p-2 m-1 w-full text-center">
                    <strong>Pix copia e cola:</strong>
                    <br />
                    <code className="p-3 text-sm break-all">{charge.pix_key}</code>
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2 p-4 w-full bg-pink-600 text-white hover:bg-pink-700"
                    onClick={() => handlerCopyPixKey(String(charge.pix_key))}
                  >Copiar</Button>
                </div>}

            </div>
            <div className="flex flex-col items-center">
              {charge.qr_code && (
                <div className="mt-1">
                  <Image src={charge.qr_code} alt="QR Code" height={200} width={200} />
                </div>
              )}
              <p><strong>Expira em:</strong> {formatDate(charge.expires_at)}</p>
            </div>
            {charge.paid_at && (
              <p><strong>Pago em:</strong> {formatDate(charge.paid_at)}</p>
            )}
          </CustomCardPayment>
        )}
      </div>
    </div >
  )
}