import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { IntroSection } from "@/components/about/intro-section"
import { ValuesSection } from "@/components/about/values-section"
import { TeamSection } from "@/components/about/team-section"
import { ClosingSection } from "@/components/about/closing-section"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <IntroSection />
        <ValuesSection />
        <TeamSection />
        <ClosingSection />
      </main>
      <Footer />
    </div>
  )
}
