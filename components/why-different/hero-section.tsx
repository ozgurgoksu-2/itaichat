"use client"

import { useLanguage } from "@/contexts/language-context"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
            {t("whyDifferent.hero.title")}
            <span className="bg-gradient-to-r from-orange-500 to-blue-900 bg-clip-text text-transparent">
              {" "}
              {t("whyDifferent.hero.titleAccent")}
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            {t("whyDifferent.hero.subtitle")}
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-left max-w-3xl mx-auto border border-gray-100">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              &quot;{t("whyDifferent.hero.quote1")}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t("whyDifferent.hero.quote2")}&quot;
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
