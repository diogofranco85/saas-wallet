import { formatCurrency } from "@/helpers/formatCurrency";
import { getStatusDescriptionMap } from "@/helpers/getStatusMap";
import { IChargeDetails } from "@/types/charge.interface";
import { ArrowUpRightFromSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "./ui/card";

export function CustomCardPayment({ charge, children }: { charge: IChargeDetails, children: React.ReactNode }) {
  return (
    <Card >
      <CardHeader>
        <div className="flex justify-center">
          <p className="flex text-gray-700 text-3xl font-light">
            <ArrowUpRightFromSquare className="mr-3 text-pink-600" size={36} />
            Hypepay
          </p>
        </div>
        <CardDescription >
          <p className="text-2xl font-bold mb-1 text-pink-600 text-center">Detalhes do Pagamento</p>
          <p className="text-sm font-semibold text-gray-600 text-center">Pagamento realizado para</p>
          <p className="text-sm font-semibold text-gray-600 text-center"><strong>{charge.companies?.name}</strong></p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full bg-gray-200 rounded">
          <p className=" border-t border-x py-1 px-3 text-sm"><strong>Identificador:</strong> <br />{charge.id}</p>
          <p className="border-t border-x py-1 px-3 text-sm"><strong>Valor:</strong> <br />{formatCurrency(charge.amount)}</p>
          <p className="border-t border-x py-1 px-3 text-sm"><strong>Situação:</strong> <br />Pagamento {getStatusDescriptionMap(charge.status)}</p>
          <p className="border-t border-x border-b py-1 px-3 text-sm"><strong>Descrição:</strong> <br />{charge.description}</p>
        </div>
        {charge.payer_name && <div className="border p-2 mt-4 rounded bg-slate-200   text-sm">
          <p>
            <strong>Pagador: </strong>
            {charge.payer_name}
            <br />
            <strong> Documento: </strong>
            {charge.payer_document}
          </p>
        </div>}
        {children}
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <p className="text-center text-slate-400">Pagamento processado por HypePay</p>
      </CardFooter>

    </Card>
  )
}