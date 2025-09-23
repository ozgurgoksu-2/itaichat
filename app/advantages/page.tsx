import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdvantagesHero } from "@/components/advantages/hero-section"
import { MarketExpansionSection } from "@/components/advantages/market-expansion-section"
import { CRMIntegrationSection } from "@/components/advantages/crm-integration-section"
import { TransformSection } from "@/components/advantages/transform-section"

export default function AdvantagesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <AdvantagesHero />
        <MarketExpansionSection />
        <CRMIntegrationSection />
        <TransformSection />
      </main>
      <Footer />
    </div>
  )
}
