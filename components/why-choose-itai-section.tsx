"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, TrendingUp, Clock, Target } from "lucide-react"
import Link from "next/link"
import { trackCTAClick } from "@/lib/analytics"

export function WhyChooseITAISection() {
  const deliveryFeatures = [
    {
      icon: CheckCircle,
      title: "A curated list of target companies that buy what you make",
      description: "Hand-picked companies with verified buying signals that match your ideal customer profile."
    },
    {
      icon: CheckCircle,
      title: "Decision‑maker contacts with verified emails and role fit notes",
      description: "Direct access to key decision-makers with validated contact information and role relevance."
    },
    {
      icon: CheckCircle,
      title: "Country and compliance context for regulated categories",
      description: "Local market insights, regulatory requirements, and compliance information for each target market."
    },
    {
      icon: CheckCircle,
      title: "CSV files and segments you can load into your CRM today",
      description: "Export-ready data formats that integrate seamlessly with your existing CRM and sales workflows."
    }
  ]

  const outcomes = [
    {
      icon: Clock,
      title: "Shorter prospecting cycles",
      description: "Focus on the best fit companies first with verified leads"
    },
    {
      icon: TrendingUp,
      title: "Higher reply and meeting rates",
      description: "Better engagement because the data is verified and relevant"
    },
    {
      icon: Target,
      title: "Predictable export pipeline",
      description: "Compounds month over month with quality b2b business leads"
    }
  ]

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Choose ITAI for Your Export Journey?
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Left Column - What you get in every delivery */}
          <div>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
              What you get in every delivery
            </h3>
            
            <div className="space-y-6">
              {deliveryFeatures.map((feature, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Product Screenshot */}
          <div className="lg:pl-8">
            <Card className="border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 aspect-[4/3] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Verified international buyers and decision‑maker contacts
                    </h4>
                    <p className="text-gray-600">
                      See real-time buyer data with verified contact information and market intelligence
                    </p>
                  </div>
                </div>
                {/* Placeholder for actual screenshot */}
                <div className="bg-white p-4 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    Product screenshot placeholder - showing verified buyer dashboard
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Outcomes Section */}
        <div className="mb-16">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-12 text-center">
            Outcomes you can measure
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {outcomes.map((outcome, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <outcome.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    {outcome.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {outcome.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link 
            href="/demo"
            onClick={() => trackCTAClick({
              page: 'home',
              placement: 'why_choose',
              button_text: 'Book a live demo',
              destination: '/demo'
            })}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Book a live demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
