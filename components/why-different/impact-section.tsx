"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"

export function ImpactSection() {
  const { t } = useLanguage()

  const metrics = [
    {
      number: "20M",
      label: t("whyDifferent.impact.metrics.directExport.label"),
      description: t("whyDifferent.impact.metrics.directExport.description"),
    },
    {
      number: "200M",
      label: t("whyDifferent.impact.metrics.indirectExport.label"),
      description: t("whyDifferent.impact.metrics.indirectExport.description"),
    },
    {
      number: "1,000+",
      label: t("whyDifferent.impact.metrics.meetings.label"),
      description: t("whyDifferent.impact.metrics.meetings.description"),
    },
    {
      number: "5,000+",
      label: t("whyDifferent.impact.metrics.quotations.label"),
      description: t("whyDifferent.impact.metrics.quotations.description"),
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">{t("whyDifferent.impact.title")}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("whyDifferent.impact.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-8 text-center">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 to-blue-900 bg-clip-text text-transparent mb-2">
                  {metric.number}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{metric.label}</div>
                <div className="text-gray-600 text-sm">{metric.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
