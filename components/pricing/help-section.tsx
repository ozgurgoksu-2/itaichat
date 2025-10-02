import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export function HelpSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-100 to-blue-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Need Help Choosing a Plan?</h2>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Not sure which plan is right for you? Let us guide you through the options and help you find the perfect fit for your business needs.
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-blue-900 hover:from-orange-600 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold shadow-lg"
          >
            Talk to an Expert
          </Button>
        </div>
      </div>
    </section>
  )
}
