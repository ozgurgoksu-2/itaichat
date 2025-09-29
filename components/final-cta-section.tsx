"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { trackCTAClick } from "@/lib/analytics"

export function FinalCTASection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Ready to transform your export pipeline?
          </h2>
          
          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Join exporters who use ITAI to find verified buyers and connect with decision‑makers.
          </p>
          
          <div className="pt-6">
            <Link 
              href="/demo"
              onClick={() => trackCTAClick({
                page: 'home',
                placement: 'final_cta',
                button_text: 'Book a live demo',
                destination: '/demo'
              })}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-12 py-6 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                Book a live demo
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            Start your export journey today
          </p>
        </div>
      </div>
    </section>
  )
}
