"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface FAQItem {
  question: string
  answer: string
}

export function PricingFAQ() {
  const { t } = useLanguage()
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const faqData: FAQItem[] = [
    {
      question: t("pricing.faq.whatHappensNext.question"),
      answer: t("pricing.faq.whatHappensNext.answer"),
    },
    {
      question: t("pricing.faq.howLongPreview.question"),
      answer: t("pricing.faq.howLongPreview.answer"),
    },
  ]

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
        {t("pricing.faq.title")}
      </h2>
      
      <div className="max-w-4xl mx-auto space-y-4">
        {faqData.map((faq, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-0">
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                {openItems.includes(index) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
