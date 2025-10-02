"use client"

import { Button } from "@/components/ui/button"
import { trackCTAClick } from "@/lib/analytics"

export function HomeFAQSection() {

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
    }
  ]


  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked
            <span className="bg-gradient-to-r from-orange-500 to-blue-900 bg-clip-text text-transparent">
              {" "}Questions
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get answers to common questions about finding verified international buyers and accelerating your export growth.
          </p>
        </div>

        <div className="space-y-8 mb-12">
          {faqData.map((item, index) => (
            <div key={item.id} className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-900 text-white text-sm font-bold rounded-full">
                    Q{index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.question}</h3>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 text-sm font-bold rounded-full">
                    A{index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a 
            href="https://calendly.com/mehmet-odsdanismanlik/30min"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick({
              page: 'home',
              placement: 'faq',
              button_text: 'Book a live demo',
              destination: 'https://calendly.com/mehmet-odsdanismanlik/30min'
            })}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-blue-900 hover:from-orange-600 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold shadow-lg"
            >
              Book a live demo
            </Button>
          </a>
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
