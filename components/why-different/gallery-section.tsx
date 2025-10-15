"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import Image from "next/image"

export function GallerySection() {
  const { t } = useLanguage()

  const images = [
    {
      title: t("whyDifferent.gallery.images.factoryTeam.title"),
      description: t("whyDifferent.gallery.images.factoryTeam.description"),
      image: "team2.jpg"
    },
    {
      title: t("whyDifferent.gallery.images.fieldWork.title"),
      description: t("whyDifferent.gallery.images.fieldWork.description"),
      image: "team3.jpg"
    },
    {
      title: t("whyDifferent.gallery.images.exhibitions.title"),
      description: t("whyDifferent.gallery.images.exhibitions.description"),
      image: "team4.jpg"
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t("whyDifferent.gallery.title")}
            <span className="bg-gradient-to-r from-orange-500 to-blue-900 bg-clip-text text-transparent">
              {" "}
              {t("whyDifferent.gallery.titleAccent")}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("whyDifferent.gallery.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {images.map((image, index) => (
            <Card
              key={index}
              className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={`/${image.image}`}
                  alt={image.title}
                  width={400}
                  height={256}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 text-center">{image.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
