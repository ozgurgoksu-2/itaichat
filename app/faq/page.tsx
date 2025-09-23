"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const faqs = [
    {
      question: "What is ITAI and how does it work?",
      answer: "ITAI (International Trade AI) is an advanced AI assistant powered by cutting-edge language models. It uses natural language processing to understand your queries and provide intelligent, contextual responses across a wide range of topics and tasks."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we take data security and privacy very seriously. All conversations are encrypted, and we follow industry-standard security practices. We don't store personal information unnecessarily and comply with international privacy regulations."
    },
    {
      question: "Can I use ITAI for commercial purposes?",
      answer: "Yes, our Pro and Enterprise plans are designed for commercial use. You can integrate ITAI into your business workflows, use it for customer support, content creation, and various other commercial applications."
    },
    {
      question: "What makes ITAI different from other AI assistants?",
      answer: "ITAI offers advanced features like function calling, document analysis, web search integration, and vector search capabilities. We focus on providing accurate, contextual responses with a user-friendly interface and robust tool integration."
    },
    {
      question: "How accurate are the AI responses?",
      answer: "Our AI is trained on high-quality data and uses advanced techniques to provide accurate responses. However, like all AI systems, it's not perfect. We recommend verifying important information and using critical thinking when evaluating responses."
    },
    {
      question: "Can I integrate ITAI with my existing tools?",
      answer: "Yes, we offer API access and various integration options for Pro and Enterprise customers. You can connect ITAI with your existing workflows, applications, and business tools."
    },
    {
      question: "What languages does ITAI support?",
      answer: "ITAI primarily operates in English but has capabilities in multiple languages. We're continuously working to improve multi-language support and add more languages based on user demand."
    },
    {
      question: "How do I get started with ITAI?",
      answer: "Getting started is easy! Simply visit our homepage and start chatting with the AI assistant. No sign-up is required for basic usage. For advanced features, you can upgrade to our Pro plan."
    },
    {
      question: "What kind of support do you offer?",
      answer: "We offer different levels of support based on your plan. Free users get community support, Pro users get priority email support, and Enterprise customers get dedicated support with SLA guarantees."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your access will continue until the end of your current billing period."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Frequently Asked
                <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Questions
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find answers to common questions about our AI assistant and services.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                      {openItems.includes(index) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {openItems.includes(index) && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@itai.com" 
                className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Contact Support
              </a>
              <Link 
                href="/" 
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg font-semibold border border-gray-300 transition-all duration-300"
              >
                Try ITAI Now
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
