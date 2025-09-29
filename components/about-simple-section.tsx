"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, CheckCircle, Globe } from "lucide-react"
import Link from "next/link"
import { trackCTAClick } from "@/lib/analytics"

export function AboutSimpleSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
            Our mission is simple:
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              {" "}better matches, faster exports
            </span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed">
                We exist to connect great products with buyers who value them.
              </p>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Our team blends market research, data engineering, and verification to deliver fewer, better leads.
              </p>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Industrial companies choose us when they want quality conversations instead of long lists.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Target className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Focus on quality over quantity in B2B prospecting</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Verified international buyers with decision-maker contacts</p>
              </div>
              <div className="flex items-start space-x-3">
                <Globe className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Global market coverage for export-focused manufacturers</p>
              </div>
            </div>

            <div className="pt-6">
              <Link 
                href="/demo"
                onClick={() => trackCTAClick({
                  page: 'about',
                  placement: 'main_cta',
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

          {/* Visual Card */}
          <div>
            <Card className="border-0 shadow-2xl bg-white">
              <CardContent className="p-12 text-center">
                <div className="space-y-8">
                  <div>
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Built for Export‑Focused Manufacturers
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      We help manufacturers grow exports by matching products with verified international buyers and reliable data.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">6+</div>
                      <div className="text-sm text-gray-600">Years Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">195+</div>
                      <div className="text-sm text-gray-600">Countries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">10K+</div>
                      <div className="text-sm text-gray-600">Verified Buyers</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mission Statement Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-50 to-blue-50">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why We Exist
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                Too many manufacturers waste time on unqualified leads and lengthy prospect lists. 
                We believe in precision over volume—connecting the right products with the right buyers 
                through verified data and market intelligence.
              </p>
              <div className="text-lg text-gray-600">
                <strong>Result:</strong> Industrial companies get quality conversations that convert to real business.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
