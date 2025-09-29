"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, CheckCircle } from "lucide-react"
import { trackCTAClick, trackFormSubmission } from "@/lib/analytics"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    productCategory: '',
    targetCountries: '',
    notes: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Track form submission
    trackFormSubmission('demo_booking', 'contact')
    
    // Track CTA click
    trackCTAClick({
      page: 'contact',
      placement: 'form_submit',
      button_text: 'Book a live demo',
      destination: 'thank_you'
    })
    
    // Show success state (in real app, this would send data to backend)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds (optional)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        company: '',
        productCategory: '',
        targetCountries: '',
        notes: ''
      })
    }, 3000)
  }

  const inlineFaq = [
    {
      question: "What happens next?",
      answer: "We&apos;ll review your information and send you a calendar link within 2 hours to schedule your personalized demo."
    },
    {
      question: "How long until I receive a preview?",
      answer: "During the live demo (usually within 24-48 hours), we&apos;ll show you a curated sample of verified b2b contact data from your target markets."
    }
  ]

  if (isSubmitted) {
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Thank you! We&apos;ll be in touch soon.
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We&apos;ll send you a calendar link within 2 hours to schedule your personalized demo 
                where we&apos;ll show verified b2b contact data for your target markets.
              </p>
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
            Book a live demo
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
            Tell us about your product, target countries, and buyer profile. 
            We&apos;ll show a curated preview of verified contacts and b2b contact data during the demo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div>
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Get Your Personalized Demo
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-base font-medium text-gray-700">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base font-medium text-gray-700">
                      Work email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      placeholder="you@company.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company" className="text-base font-medium text-gray-700">
                      Company *
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="productCategory" className="text-base font-medium text-gray-700">
                      Product category *
                    </Label>
                    <Input
                      id="productCategory"
                      name="productCategory"
                      type="text"
                      required
                      value={formData.productCategory}
                      onChange={handleInputChange}
                      className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., Electronics, Medical Devices, Industrial Equipment"
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetCountries" className="text-base font-medium text-gray-700">
                      Target countries *
                    </Label>
                    <Input
                      id="targetCountries"
                      name="targetCountries"
                      type="text"
                      required
                      value={formData.targetCountries}
                      onChange={handleInputChange}
                      className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., USA, Germany, Japan, Brazil"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-base font-medium text-gray-700">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Tell us more about your export goals, target buyer profile, or specific requirements..."
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book a live demo
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info & FAQ */}
          <div className="space-y-8">
            {/* What to Expect */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-purple-50">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  What You&apos;ll See in Your Demo
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Curated preview of verified b2b contact data for your target markets</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Sample decision-maker contacts with verified emails</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Company profiles and market intelligence for your industry</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Live walkthrough of how our data can accelerate your exports</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inline FAQ */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-6">
                  {inlineFaq.map((faq, index) => (
                    <div key={index}>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Demo Timeline
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium text-gray-900">Submit this form</p>
                      <p className="text-sm text-gray-600">Takes 2 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium text-gray-900">Receive calendar link</p>
                      <p className="text-sm text-gray-600">Within 2 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium text-gray-900">Live demo session</p>
                      <p className="text-sm text-gray-600">30 minutes with sample b2b contact data</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
