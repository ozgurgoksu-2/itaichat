import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhyChooseITAISection } from "@/components/why-choose-itai-section"

export default function VerifiedLeadsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-orange-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
              Verified Leads
              <span className="bg-gradient-to-r from-orange-500 to-blue-900 bg-clip-text text-transparent">
                {" "}That Convert
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-8">
              Get b2b business leads with verified emails, decision-maker contacts, and company intelligence 
              that helps you win more export deals.
            </p>
          </div>
        </section>
        <WhyChooseITAISection />
      </main>
      <Footer />
    </div>
  )
}
