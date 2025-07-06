"use client";
import { CustomLoading } from "@/components/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/helpers/formatCurrency";
import { formatDate } from "@/helpers/formatDate";
import { getStatusMap } from "@/helpers/getStatusMap";
import { ArrowUpRightFromSquare, CheckCircle2Icon } from "lucide-react";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { use, useEffect, useState } from "react";


interface ChargeDetails {
  id: string
  amount: number
  description: string
  status: string
  payer_name?: string
  payer_email?: string
  payer_document?: string
  pix_key?: string
  qr_code?: string
  expires_at: string
  paid_at?: string
  created_at: string
  payment_id?: string
}

export default function PaymentIdPage() {

  const [charge, setCharge] = useState<ChargeDetails | null>(null);
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

  if (loading) {
    return <CustomLoading text="Carregando detalhes do pagamento..." />
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen " >
      <div className="flex  justify-center my-1">
        <p className="flex text-white text-3xl font-light">
          <ArrowUpRightFromSquare className="mr-3 text-pink-600" size={36} />
          Hypepay
        </p>
      </div>
      <div className="flex flex-col items-center mt-2 w-300">
        {charge && charge.status === "paid" && (
          <Alert className="w-1/2 bg-green-100 text-green-800 mt-3">
            <CheckCircle2Icon />
            <AlertTitle className="text-2xl">Pagamento realizado</AlertTitle>
            <AlertDescription className="text-lg">
              Esse QR-Code foi pago com sucesso.
              {charge.paid_at && (
                <p><strong>Paid At:</strong> {formatDate(charge.paid_at)}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {charge && isExpired(charge.expires_at) && charge.status === 'pending' && (
          <Alert className="w-1/2 bg-yellow-100 text-green-800 mt-3">
            <CheckCircle2Icon />
            <AlertTitle className="text-2xl">Pagamento expirado</AlertTitle>
            <AlertDescription className="text-lg">
              Esse QR-Code ja foi está expirado, por favor peça ao fornecedor para criar uma nova cobrança.
            </AlertDescription>
          </Alert>
        )}

        {charge && charge.status === 'cancelled' && (
          <Alert className="w-1/2 bg-red-100 text-green-800 mt-3">
            <CheckCircle2Icon />
            <AlertTitle className="text-2xl">Pagamento cancelada</AlertTitle>
            <AlertDescription className="text-lg">
              Esse QR-Code foi cancelado pela fornecedor, por favor peça ao fornecedor para criar uma nova cobrança.
            </AlertDescription>
          </Alert>
        )}

        {charge && !isExpired(charge.expires_at) && charge.status === 'pending' && (
          <div className="border border-pink-600 p-6 rounded-lg w-full bg-white text-gray-600">
            <h2 className="text-2xl font-bold mb-4 text-pink-600 text-center">Detalhes do Pagamento</h2>
            <p className="border p-2 m-1"><strong>ID:</strong> {charge.id}</p>
            <p className="border p-2 m-1"><strong>Valor:</strong> {formatCurrency(charge.amount)}</p>
            <p className="border p-2 m-1"><strong>Situação:</strong> Pagamento {getStatusMap(charge.status)}</p>
            <p className="border p-2 m-1"><strong>Descrição:</strong> {charge.description}</p>
            {charge.payer_name && <div className="border p-2 m-1 mt-4 bg-gray-500 text-white">
              <p>
                <strong>Pagador: </strong>
                {charge.payer_name}
                <br />
                <strong> Documento: </strong>
                {charge.payer_document}
              </p>
            </div>}
            <div className="flex flex-col items-center mt-4">
              {charge.pix_key &&
                <p className="border border-pink-600 p-2 m-1 w-full text-center">
                  <strong>Pix copia e cola:</strong>
                  <br />
                  <code className="p-3 text-sm break-all">{charge.pix_key}</code>
                </p>}
            </div>
            <div className="flex flex-col items-center">
              {charge.qr_code && (
                <div className="mt-1">
                  <Image src={charge.qr_code} alt="QR Code" height={300} width={300} />
                </div>
              )}
              <p><strong>Expira em:</strong> {formatDate(charge.expires_at)}</p>
            </div>
            {charge.paid_at && (
              <p><strong>Pago em:</strong> {formatDate(charge.paid_at)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}