import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { WhyDifferentSection } from "@/components/why-different-section"
import { FeaturesSection } from "@/components/features-section"
import { HowITAIWorksSection } from "@/components/how-itai-works-section"
import { ProvenResultsSection } from "@/components/proven-results-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <div id="hero">
          <HeroSection />
        </div>
        <WhyDifferentSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <HowITAIWorksSection />
        <ProvenResultsSection />
      </main>
      <Footer />
    </div>
  )
}
