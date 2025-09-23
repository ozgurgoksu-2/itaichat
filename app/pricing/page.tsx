import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PricingHero } from "@/components/pricing/pricing-hero"
import { PricingTable } from "@/components/pricing/pricing-table"
import { IncludedSection } from "@/components/pricing/included-section"
import { HelpSection } from "@/components/pricing/help-section"
import { ValuePropsSection } from "@/components/pricing/value-props-section"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <PricingHero />
        <PricingTable />
        <IncludedSection />
        <HelpSection />
        <ValuePropsSection />
      </main>
      <Footer />
    </div>
  )
}
