"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, TrendingUp, Clock, Target } from "lucide-react"
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
            
            <div className="space-y-4">
              {deliveryFeatures.map((feature, index) => (
                <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
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
          <div className="flex justify-center items-center">
            <Card className="border-0 shadow-2xl overflow-hidden max-w-md w-full">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-blue-50 to-orange-50 aspect-[4/3] flex items-center justify-center relative">
                  {/* Large Product Screenshot Placeholder */}
                  <div className="absolute inset-4 bg-white rounded-lg shadow-lg border-2 border-gray-200 flex flex-col">
                    {/* Mock Browser Header */}
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-500">
                        itai.export-assistant.com
                      </div>
                    </div>
                    
                    {/* Mock Dashboard Content */}
                    <div className="flex-1 p-4 space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-900 rounded-lg flex items-center justify-center">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900">Verified Buyers Dashboard</div>
                      </div>
                      
                      {/* Mock Data Rows */}
                      <div className="space-y-2">
                        <div className="bg-gray-50 rounded p-2">
                          <div className="flex justify-between items-center">
                            <div className="text-xs font-medium text-gray-700">ABC Trading GmbH</div>
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          </div>
                          <div className="text-xs text-gray-500">Germany • Verified Contact</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="flex justify-between items-center">
                            <div className="text-xs font-medium text-gray-700">Import Solutions Ltd</div>
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          </div>
                          <div className="text-xs text-gray-500">UK • Decision Maker</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="flex justify-between items-center">
                            <div className="text-xs font-medium text-gray-700">Euro Distributors SA</div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          </div>
                          <div className="text-xs text-gray-500">France • High Potential</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Placeholder Label */}
                <div className="bg-white p-3 border-t">
                  <p className="text-xs text-gray-500 text-center font-medium">
                    🎯 Live Product Screenshot - Verified International Buyer Database
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
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
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
          <a 
            href="https://calendly.com/mehmet-odsdanismanlik/30min"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick({
              page: 'home',
              placement: 'why_choose',
              button_text: 'Book a live demo',
              destination: 'https://calendly.com/mehmet-odsdanismanlik/30min'
            })}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-blue-900 hover:from-orange-600 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Book a live demo
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
