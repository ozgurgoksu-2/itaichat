"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Image from "next/image"

export function AIMessageSection() {
  const { t } = useLanguage()

  const capabilities = [
    t("whyDifferent.aiMessage.capabilities.identify"),
    t("whyDifferent.aiMessage.capabilities.prioritize"),
    t("whyDifferent.aiMessage.capabilities.build"),
  ]

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - AI Assistant Image */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              <Image
                src="/team1.jpg"
                alt={t("whyDifferent.aiMessage.imageAlt")}
                width={600}
                height={400}
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-blue-900/20 rounded-2xl"></div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {t("whyDifferent.aiMessage.title")}
                <span className="bg-gradient-to-r from-orange-500 to-blue-900 bg-clip-text text-transparent">
                  {" "}
                  {t("whyDifferent.aiMessage.titleAccent")}
                </span>
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed">
                {t("whyDifferent.aiMessage.subtitle")}
              </p>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-orange-50">
                <CardContent className="p-6">
                  <p className="text-lg font-semibold text-gray-900 mb-4">
                    {t("whyDifferent.aiMessage.cardTitle")}
                  </p>

                  <div className="space-y-4">
                    {capabilities.map((capability, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 leading-relaxed">{capability}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
