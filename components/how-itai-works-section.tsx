import { Card, CardContent } from "@/components/ui/card"
import { Search, Zap, Filter } from "lucide-react"

export function HowITAIWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Define Your Search",
      description: "Tell our AI about your products, target markets, and export goals. The more specific you are, the better results you'll get.",
    },
    {
      number: "02",
      icon: Zap,
      title: "AI Generates Leads",
      description: "Our advanced AI algorithms scan global databases and market intelligence to identify the most relevant buyers and opportunities.",
    },
    {
      number: "03",
      icon: Filter,
      title: "Smart Classification",
      description: "Get organized, prioritized leads with detailed company profiles, contact information, and market insights to close deals faster.",
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            How ITAI Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three simple steps to unlock global export opportunities with AI precision
          </p>
        </div>

        <div className="relative">
          {/* Flow line connecting the steps */}
          <div className="hidden lg:block absolute top-8 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-orange-400 to-purple-500 opacity-30"></div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Number badge positioned above the card */}
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                </div>
                
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
                  <CardContent className="p-8 text-center">
                    {/* Icon container matching the image design */}
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <step.icon className="w-10 h-10 text-blue-600" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
