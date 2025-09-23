import { Card, CardContent } from "@/components/ui/card"
import { Brain, Target, Zap } from "lucide-react"

export function ValuePropsSection() {
  const props = [
    {
      icon: Brain,
      title: "Export-Focused AI",
      description: "AI trained specifically for export intelligence, not generic solutions",
    },
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Find high-potential buyers using advanced filtering techniques",
    },
    {
      icon: Zap,
      title: "Always On",
      description: "24/7 lead generation so you never miss an opportunity",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Makes
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              {" "}
              ITAI Different?
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {props.map((prop, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-white to-gray-50"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <prop.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{prop.title}</h3>
                <p className="text-gray-600 text-sm">{prop.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
