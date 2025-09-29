import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { WhyDifferentSection } from "@/components/why-different-section"
import { WhyChooseITAISection } from "@/components/why-choose-itai-section"
import { HowITAIWorksSection } from "@/components/how-itai-works-section"
import { ProvenResultsSection } from "@/components/proven-results-section"
import { HomeFAQSection } from "@/components/home-faq-section"
import { FinalCTASection } from "@/components/final-cta-section"
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
          <WhyChooseITAISection />
        </div>
        <HowITAIWorksSection />
        <ProvenResultsSection />
        <HomeFAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  )
}
