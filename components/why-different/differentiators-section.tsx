"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Search, Target, MessageSquare } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function DifferentiatorsSection() {
  const { t } = useLanguage()

  const differentiators = [
    {
      icon: Search,
      title: t("whyDifferent.differentiators.items.research.title"),
      description: t("whyDifferent.differentiators.items.research.description"),
    },
    {
      icon: Target,
      title: t("whyDifferent.differentiators.items.identification.title"),
      description: t("whyDifferent.differentiators.items.identification.description"),
    },
    {
      icon: MessageSquare,
      title: t("whyDifferent.differentiators.items.outreach.title"),
      description: t("whyDifferent.differentiators.items.outreach.description"),
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t("whyDifferent.differentiators.title")}
            <span className="bg-gradient-to-r from-orange-500 to-blue-900 bg-clip-text text-transparent">
              {" "}
              {t("whyDifferent.differentiators.titleAccent")}
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {differentiators.map((item, index) => (
            <Card
              key={index}
              className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
