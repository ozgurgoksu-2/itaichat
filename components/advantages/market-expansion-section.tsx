import { Card, CardContent } from "@/components/ui/card"
import { Globe, DollarSign, Languages, Leaf } from "lucide-react"

export function MarketExpansionSection() {
  const advantages = [
    {
      icon: Globe,
      title: "Market Expansion & Export Growth",
      question: "How can ITAI help businesses enter new international markets?",
      scenario: "A manufacturer lacks contacts in Southeast Asia.",
      solution: "ITAI filters leads by country (Vietnam), industry (electronics), and language (Vietnamese).",
      outcome: "200+ qualified B2B buyers identified in 48 hours, accelerating market entry.",
      color: "from-orange-500 to-purple-600"
    },
    {
      icon: DollarSign,
      title: "Cost Optimization for SMEs",
      question: "Can ITAI reduce lead generation costs for small businesses?",
      scenario: "An SME struggles with expensive data subscriptions.",
      solution: "ITAI replaces fragmented tools with one AI platform.",
      outcome: "500+ verified leads/month generated, cutting costs by 60%.",
      color: "from-orange-500 to-purple-600"
    },
    {
      icon: Languages,
      title: "Multilingual & Regional Targeting",
      question: "Does ITAI support campaigns in non-English markets?",
      scenario: "A cosmetics brand targets Arabic-speaking regions.",
      solution: "ITAI identifies Arabic-language buyers and validates digital profiles.",
      outcome: "150+ niche distributors sourced for localized campaigns.",
      color: "from-orange-500 to-purple-600"
    },
    {
      icon: Leaf,
      title: "Niche Product Distribution",
      question: "How does ITAI connect businesses with niche buyers?",
      scenario: "A sustainable textile producer seeks eco-conscious retailers.",
      solution: "ITAI targets keywords like 'organic cotton' and certifications.",
      outcome: "Partnerships with 80+ specialized retailers in the EU and North America.",
      color: "from-orange-500 to-purple-600"
    }
  ]

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {advantages.map((advantage, index) => (
            <Card
              key={index}
              className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
            >
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Icon and Title */}
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${advantage.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <advantage.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{advantage.title}</h3>
                  </div>

                  {/* Question */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Question:</h4>
                    <p className="text-gray-700">{advantage.question}</p>
                  </div>

                  {/* Scenario */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm uppercase tracking-wide">SCENARIO</h4>
                    <p className="text-blue-800">{advantage.scenario}</p>
                  </div>

                  {/* Solution */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2 text-sm uppercase tracking-wide">SOLUTION</h4>
                    <p className="text-purple-800">{advantage.solution}</p>
                  </div>

                  {/* Outcome */}
                  <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg p-4 border-l-4 border-orange-500">
                    <h4 className="font-semibold text-orange-900 mb-2 text-sm uppercase tracking-wide">OUTCOME</h4>
                    <p className="text-orange-800 font-medium">{advantage.outcome}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
