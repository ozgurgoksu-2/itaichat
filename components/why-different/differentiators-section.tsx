import { Card, CardContent } from "@/components/ui/card"
import { Search, Target, MessageSquare } from "lucide-react"

export function DifferentiatorsSection() {
  const differentiators = [
    {
      icon: Search,
      title: "Strategic Market Research",
      description: "Conducting data-driven market analysis tailored to your export goals.",
    },
    {
      icon: Target,
      title: "Targeted Lead Identification",
      description: "Pinpointing high-potential buyers using advanced filtering techniques.",
    },
    {
      icon: MessageSquare,
      title: "Systematic Outreach and Follow-Ups",
      description: "Supporting engagement with consistent and intelligent outreach workflows.",
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Here&apos;s What Makes Our
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Approach Unique
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {differentiators.map((item, index) => (
            <Card
              key={index}
              className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
