import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";

import { Body, Head, Html, Tailwind } from "@react-email/components";
import { ArrowUpRightFromSquare } from "lucide-react";

interface IInviteEmail {
  invite: {
    link: string,
    senderName: string,
    expiresAt: string
  }
  companies?: {
    id: string;
    name: string;
  }
}

export function EmailTemplateInvite(data: IInviteEmail) {
  return (
    <Html>
      <Head />
      < Tailwind >
        <Body className="text-black font-sans" >
          <div className="min-h-screen flex items-center justify-center" >
            <div className="w-full max-w-md" >
              <Card >
                <CardHeader>
                  <div className="flex justify-center">
                    <p className="flex text-gray-700 text-3xl font-light">
                      <ArrowUpRightFromSquare className="mr-3 text-pink-600" size={36} />
                      Hypepay
                    </p>
                  </div>
                  <CardDescription >
                    <p className="text-sm font-semibold text-gray-600 text-center">Empresa</p>
                    <p className="text-sm font-semibold text-gray-600 text-center"><strong>{data.companies?.name}</strong></p>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-sm"> Olá tudo bem?, A Empresa <strong>{data.companies?.name}</strong> lhe enviou esse convite para que você faça parte do time</p>
                    <p> A plataforma Hype Pay, e a maior plataforma de gestão unificada de pagamentos em PIX</p>

                    <div className="text-sm p-4 border">
                      <p>Acesse seu convite <a href={data.invite.link} >clicando aqui</a></p>
                    </div>

                    <div className="text-sm p-4 border mt-4 bg-red-200">
                      <p>Esse convite expira em: <strong>{data.invite.expiresAt}</strong></p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                  <p className="text-center text-slate-400">HypePay -  Gestão de pagamento Pix para empresas</p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </Body>
      </Tailwind>
    </Html>

  )
}