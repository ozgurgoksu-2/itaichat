import { Card, CardContent } from "@/components/ui/card"
import { Search, Target, Users, TrendingUp } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: "Stop Wasting Time on Old-School Buyer Hunting",
      description: "Our AI scans global markets 24/7 to find the most relevant buyers for your products automatically.",
    },
    {
      icon: Target,
      title: "Precision Market Targeting",
      description: "Get laser-focused recommendations based on your product specifications and business goals.",
    },
    {
      icon: Users,
      title: "Verified Buyer Network",
      description: "Connect with pre-verified international buyers who are actively seeking products like yours.",
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "Access real-time market trends, pricing data, and competitive analysis for informed decisions.",
    },
  ]

  return (
    <section id="features" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Choose ITAI for Your
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Export Journey?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your export business with AI-powered insights and connections that deliver real results
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-b from-white to-gray-50"
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
