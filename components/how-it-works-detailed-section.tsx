"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Search, Mail, Package, RefreshCw } from "lucide-react"
import Link from "next/link"
import { trackCTAClick } from "@/lib/analytics"

export function HowItWorksDetailedSection() {
  const steps = [
    {
      icon: Users,
      title: "Define your ideal buyer profile",
      description: "You tell us what you make, where you ship, and who you want to reach. We translate that input into an ICP that your sales team can agree on in minutes."
    },
    {
      icon: Search,
      title: "Discover companies that match",
      description: "Our system maps global markets and surfaces companies with real purchase intent signals. This is b2b prospecting agent thinking with a researcher discipline."
    },
    {
      icon: Mail,
      title: "Verify decision‑makers and emails",
      description: "We confirm role fit, validate deliverability, and replace any unreachable contact quickly. The result is verified leads that your team can act on immediately."
    },
    {
      icon: Package,
      title: "Package for outreach",
      description: "You receive CSV files and clean segments that match your campaigns and CRM fields. If you already use a prospecting platform, we align the fields so your import takes seconds."
    },
    {
      icon: RefreshCw,
      title: "Iterate monthly",
      description: "We learn from your replies and meetings to refine targeting and improve results every month."
    }
  ]

  const faqData = [
    {
      question: "How does the b2b prospecting process work?",
      answer: "Our b2b prospecting software starts with your ideal buyer profile and ends with verified leads you can contact immediately. We handle the entire research and verification process—book a live demo to see it in action."
    },
    {
      question: "What makes this different from other prospecting platforms?",
      answer: "Unlike generic prospecting platforms, we focus specifically on B2B export markets with verified international buyers and decision-maker contacts—book a live demo for a preview."
    },
    {
      question: "How quickly can I get verified leads?",
      answer: "Most clients receive their first batch of verified leads within 48-72 hours of defining their ideal buyer profile—book a live demo to see sample segments."
    },
    {
      question: "How is a lead scraper different from your approach?",
      answer: "A lead scraper pulls unverified data at scale while we deliver verified leads with role fit and deliverability checks—book a live demo for a preview."
    },
    {
      question: "Do you offer a b2b prospecting tool or software?",
      answer: "We deliver clean segments that plug into your workflow and integrate with popular tools—book a live demo to see sample segments."
    },
    {
      question: "Can I get a b2b leads database free?",
      answer: "Free sources risk low accuracy and compliance issues; we show a small verified preview in the live demo."
    },
    {
      question: "Do you support prospection b2b in regulated categories?",
      answer: "Yes, with compliance notes; see examples in a live demo."
    }
  ]

  return (
    <>
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
              From product brief to
              <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                {" "}verified buyers
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Our b2b prospecting process turns your product specifications into a pipeline of 
              qualified international buyers with verified contact information.
            </p>
          </div>

          {/* Process Steps */}
          <div className="space-y-16 mb-20">
            {steps.map((step, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {index + 1}
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {step.title}
                    </h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Visual */}
                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                    <CardContent className="p-12 text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <step.icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-sm text-gray-500">
                        Step {index + 1} of {steps.length}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mb-20">
            <Card className="border-0 shadow-xl bg-white max-w-4xl mx-auto">
              <CardContent className="p-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Ready to transform your b2b prospecting?
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                  See how our b2b prospecting software can help you find verified leads 
                  and book more qualified meetings.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/demo"
                    onClick={() => trackCTAClick({
                      page: 'how-it-works',
                      placement: 'primary_cta',
                      button_text: 'Book a live demo',
                      destination: '/demo'
                    })}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl w-full sm:w-auto"
                    >
                      Book a live demo
                    </Button>
                  </Link>
                  
                  <Link 
                    href="/demo"
                    onClick={() => trackCTAClick({
                      page: 'how-it-works',
                      placement: 'secondary_cta',
                      button_text: 'Request pricing in a live demo',
                      destination: '/demo'
                    })}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold w-full sm:w-auto"
                    >
                      Request pricing in a live demo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqData.map((faq, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Internal Links */}
          <div className="mt-20 text-center">
            <p className="text-gray-600 mb-6">Learn more about our solutions:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/pricing" className="text-orange-600 hover:text-orange-700 font-medium">
                Pricing
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/verified-leads" className="text-orange-600 hover:text-orange-700 font-medium">
                Verified Leads
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/advantages" className="text-orange-600 hover:text-orange-700 font-medium">
                Manufacturing Use Cases
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/b2b-data" className="text-orange-600 hover:text-orange-700 font-medium">
                B2B Data
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HowTo Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How ITAI B2B Prospecting Works",
            "description": "Step-by-step process for finding verified international buyers",
            "step": steps.map((step, index) => ({
              "@type": "HowToStep",
              "name": step.title,
              "text": step.description,
              "position": index + 1
            }))
          })
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />
    </>
  )
}
