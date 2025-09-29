"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { trackCTAClick, trackAccordionToggle } from "@/lib/analytics"

export function HomeFAQSection() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const faqData = [
    {
      id: "b2b-prospecting-why-matters",
      question: "What is b2b prospecting and why does it matter here?",
      answer: "B2B prospecting is the work of finding and qualifying companies and contacts that match your ICP so outreach becomes efficient—book a live demo to see it in action."
    },
    {
      id: "data-sources-verification", 
      question: "Where does your data come from and how do you verify contacts?",
      answer: "We enrich from trusted sources, validate email deliverability, check role relevance, and replace unreachable contacts quickly."
    },
    {
      id: "search-by-country-sector",
      question: "Do you support b2b company search by country or sector?",
      answer: "Yes, we filter by sector, size, location, and buying signals to deliver a shortlist that feels tailor‑made."
    },
    {
      id: "examples-before-decide",
      question: "Can I see examples before I decide?",
      answer: "Yes-see sample buyers in a live demo; we walk through a curated preview."
    },
    {
      id: "lead-scraper-difference",
      question: "How is a lead scraper different from your approach?",
      answer: "A lead scraper pulls unverified data at scale while we deliver verified leads with role fit and deliverability checks—book a live demo for a preview."
    },
    {
      id: "b2b-prospecting-tool",
      question: "Do you offer a b2b prospecting tool or software?",
      answer: "We deliver clean segments that plug into your workflow and integrate with popular tools—book a live demo to see sample segments."
    },
    {
      id: "b2b-leads-database-free",
      question: "Can I get a b2b leads database free?",
      answer: "Free sources risk low accuracy and compliance issues; we show a small verified preview in the live demo."
    },
    {
      id: "prospection-b2b-regulated",
      question: "Do you support prospection b2b in regulated categories?",
      answer: "Yes, with compliance notes; see examples in a live demo."
    }
  ]

  const toggleItem = (itemId: string) => {
    const isCurrentlyOpen = openItems.includes(itemId)
    
    // Track accordion toggle with proper action
    trackAccordionToggle({
      page: 'home',
      faq_question: itemId,
      action: isCurrentlyOpen ? 'close' : 'open'
    })
    
    setOpenItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              {" "}Questions
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get answers to common questions about finding verified international buyers and accelerating your export growth.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {faqData.map((item) => (
            <Card
              key={item.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
            >
              <CardContent className="p-0">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-200 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{item.question}</h3>
                  {openItems.includes(item.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>

                {openItems.includes(item.id) && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href="/demo"
            onClick={() => trackCTAClick({
              page: 'home',
              placement: 'faq',
              button_text: 'Book a live demo',
              destination: '/demo'
            })}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg"
            >
              Book a live demo
            </Button>
          </Link>
        </div>
      </div>

      {/* FAQ Schema.org markup */}
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
    </section>
  )
}
