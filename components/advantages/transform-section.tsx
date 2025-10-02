import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Rocket, MessageCircle } from "lucide-react"

export function TransformSection() {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-orange-50 overflow-hidden">
          <CardContent className="p-12 lg:p-16">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Rocket className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              See How ITAI Can Work for{" "}
              <span className="bg-gradient-to-r from-orange-500 to-blue-900 bg-clip-text text-transparent">
                Your Business
              </span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Every business is unique. Let us show you how ITAI can solve your specific export challenges and unlock new growth opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-blue-900 hover:from-orange-600 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Start Your Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 hover:bg-gray-50 px-8 py-4 text-lg font-semibold flex items-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Discuss Your Use Case
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              No commitment required • Get personalized recommendations
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
