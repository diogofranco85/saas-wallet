"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRightFromSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function PaymentsPage() {

  const [paymentCode, setPaymentCode] = useState<string>("");
  const router = useRouter()


  const handlerOpenQRCode = () => {
    if (!paymentCode) {
      alert("Por favor, insira o código de pagamento.");
      return;
    }

    const href = `/payments/${paymentCode}`
    router.push(href);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" >
      <Card>
        <CardHeader>
          <div className="flex  justify-center my-4">
            <p className="flex text-white text-3xl font-light">
              <ArrowUpRightFromSquare className="mr-3 text-pink-600" size={36} />
              <span className="text-gray-900">Hypepay</span>
            </p>
          </div>
          <CardDescription>
            <h1 className="text-lg text-gray-700 text-center" >
              Para consultar o QR-Code de pagamento <br />basta inserir o código enviado pra voce
            </h1>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <Label className="text-pink-600 mt-2 text-center text-sm" htmlFor="payment-code">Código de pagamento</Label>
            <Input placeholder="Insira o código de pagamento" id="payment-code" className="text-2xl text-gray-900 mt-4 p-6" value={paymentCode} onChange={(e) => setPaymentCode(e.target.value)} />

            <div className="flex flex-col items-center mt-4">
              <Button className="w-full p-6 bg-pink-600 hover:bg-pink-700 text-white" disabled={!paymentCode} onClick={handlerOpenQRCode}>
                Visualizar QR-Code
              </Button>
              <p className="text-slate-500 mt-4 text-sm">Ou acesse o link de pagamento enviado para seu e-mail</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <p className="text-center text-slate-400">Pagamento processado por HypePay</p>
        </CardFooter>
      </Card>
    </div >
  )
}