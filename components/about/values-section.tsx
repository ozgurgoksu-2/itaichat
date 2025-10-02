import { Card, CardContent } from "@/components/ui/card"
import { Handshake, TrendingUp, Brain } from "lucide-react"

export function ValuesSection() {
  const values = [
    {
      icon: Handshake,
      title: "Long-term partnerships built on transparency and measurable value.",
    },
    {
      icon: TrendingUp,
      title: "Export growth powered by verified leads and sectoral focus.",
    },
    {
      icon: Brain,
      title: "Smart processes enhanced by AI, strategy, and know-how.",
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            What We
            <span className="bg-gradient-to-r from-orange-500 to-blue-900 bg-clip-text text-transparent">
              {" "}
              Believe In
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <Card
              key={index}
              className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-b from-white to-gray-50"
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-10 h-10 text-white" />
                </div>
                <p className="text-lg text-gray-700 leading-relaxed font-medium">{value.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
