"use client";
import { CustomContainer } from "@/components/custom-container";
import { CustomLoading } from "@/components/loading";
import { PageHeader } from "@/components/page-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatDate } from "@/helpers/formatDate";
import { useEffect, useState } from "react";

interface IFaq {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function HelpPage() {

  const [faqs, setFaqs] = useState<IFaq[]>([])
  const [loading, setLoading] = useState<boolean>(true)


  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const response = await fetch("/api/public/faq");
      if (!response.ok) {
        throw new Error("Failed to fetch FAQs");
      }
      const data = await response.json();
      setFaqs(data.faqs);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <CustomLoading text="Carregando perguntas frequentes..." />
  }

  return (
    <CustomContainer>
      <PageHeader
        title="Perguntas Frequentes"
        description="Encontre respostas para suas perguntas frequentes" />

      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >

        {faqs.map((faq, index) =>
          <AccordionItem className="p-3 rounded" key={faq.id} value={`item-${index + 1}`} >
            < AccordionTrigger >
              <span className="text-xl  w-full py-3 px-1">{faq.title}</span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="px-1">
                <p className="text-balance text-pink-600">
                  {faq.content}
                </p>
                <div className="text-md mt-2">Criado em: {formatDate(faq.created_at)}</div></div>
            </AccordionContent>
          </AccordionItem>)
        }

      </Accordion >
    </CustomContainer >



  )
}