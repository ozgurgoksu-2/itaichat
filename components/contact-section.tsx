"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, CheckCircle, X } from "lucide-react"
import { trackCTAClick, trackFormSubmission } from "@/lib/analytics"
import { useLanguage } from "@/contexts/language-context"

export function ContactSection() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    productCategory: '',
    targetCountries: '',
    notes: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Submit to API
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form')
      }

      // Track form submission
      trackFormSubmission('demo_booking', 'contact')
      
      // Track CTA click
      trackCTAClick({
        page: 'contact',
        placement: 'form_submit',
        button_text: 'Book a live demo',
        destination: 'thank_you'
      })
      
      // Show success state
      setIsSubmitted(true)
      
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inlineFaq = [
    {
      question: "What happens next?",
      answer: "We&apos;ll review your information and send you a calendar link to schedule your personalized demo."
    },
    {
      question: "How long until I receive a preview?",
      answer: "During the live demo (usually within 24-48 hours), we&apos;ll show you a curated sample of verified b2b contact data from your target markets."
    }
  ]


  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
            {t("contact.hero.title")}
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
            {t("contact.hero.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div>
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("contact.form.title")}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-base font-medium text-gray-700">
                      {t("contact.form.fields.name")}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      placeholder={t("contact.form.fields.namePlaceholder")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base font-medium text-gray-700">
                      {t("contact.form.fields.email")}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      placeholder={t("contact.form.fields.emailPlaceholder")}
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

                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{submitError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-blue-900 hover:from-orange-600 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    {isSubmitting ? t("contact.form.submitting") : t("contact.form.button")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info & FAQ */}
          <div className="space-y-8">
            {/* What to Expect */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-blue-50">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("contact.demo.title")}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">{t("contact.demo.items.preview")}</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">{t("contact.demo.items.contacts")}</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">{t("contact.demo.items.profiles")}</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">{t("contact.demo.items.walkthrough")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inline FAQ */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("contact.faq.title")}
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

          </div>
        </div>

        {/* Thank You Popup */}
        {isSubmitted && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-md">
              <Card className="border-0 shadow-2xl bg-white">
                <CardContent className="p-8 text-center">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Thank you!
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    We&apos;ll send you a calendar link to schedule your personalized demo.
                  </p>
                  
                  <div className="space-y-3">
                    <a 
                      href="https://calendly.com/mehmet-odsdanismanlik/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-orange-500 to-blue-900 hover:from-orange-600 hover:to-blue-800 text-white px-6 py-3 text-base font-semibold"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Now on Calendly
                      </Button>
                    </a>
                    
                    <Button
                      onClick={() => window.location.href = '/'}
                      variant="outline"
                      size="lg"
                      className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 text-base font-semibold"
                    >
                      Close & Return to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
