import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PricingDetailedSection } from "@/components/pricing-detailed-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing | Request Pricing in a Live Demo",
  description: "Simple plans for exporters who need verified buyers and clean B2B data; request pricing in a live demo and see a curated preview.",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <PricingDetailedSection />
      </main>
      <Footer />
    </div>
  )
}
