import { Card, CardContent } from "@/components/ui/card"
import { Settings, Database } from "lucide-react"

export function CRMIntegrationSection() {
  const crmAdvantages = [
    {
      icon: Settings,
      title: "Sales Pipeline Automation",
      question: "How does ITAI streamline CRM workflows?",
      scenario: "Manual lead imports slow down a sales team.",
      solution: "ITAI auto-syncs leads with ODOO CRM.",
      outcome: "Lead processing time reduced by 70%.",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Database,
      title: "CRM Data Enrichment",
      question: "How does ITAI improve CRM data quality?",
      scenario: "Outdated CRM data harms follow-up efficiency.",
      solution: "ITAI cleans and enriches legacy CRM data automatically.",
      outcome: "Lead processing time reduced by 80% with accurate records.",
      color: "from-blue-500 to-purple-600"
    }
  ]

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            CRM Integration &
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Automation
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your sales workflows with intelligent CRM integration
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {crmAdvantages.map((advantage, index) => (
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
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-900 mb-2 text-sm uppercase tracking-wide">OUTCOME</h4>
                    <p className="text-green-800 font-medium">{advantage.outcome}</p>
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
