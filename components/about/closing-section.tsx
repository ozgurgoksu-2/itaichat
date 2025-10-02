import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function ClosingSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-orange-500 via-blue-900 to-orange-500 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
            International Trade AI – we are committed to transforming the way businesses approach business development.
          </h2>

          <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
            Join us on this exciting journey, and together, let&apos;s unlock new horizons of growth and success.
          </p>

          <div className="pt-8">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Click here to access our service offer
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
