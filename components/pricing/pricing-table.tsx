import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export function PricingTable() {
  const features = [
    {
      name: "Geographical Coverage",
      plus: "20 Countries",
      demo: "1 Country",
      highlight: false,
    },
    {
      name: "Odoo CRM Interface",
      plus: "3 Modules, Unlimited Users (SaaS)",
      demo: "3 Modules, Unlimited Users (SaaS)",
      highlight: false,
    },
    {
      name: "Automatic Lead Cards on CRM",
      plus: "Included",
      demo: "Included (Basic Setup)",
      highlight: false,
    },
    {
      name: "Potential Lead Detail",
      plus: "Detailed",
      demo: "Detailed",
      highlight: false,
    },
    {
      name: "Initial Setup & Training",
      plus: "Included",
      demo: "Included (Basic Setup)",
      highlight: false,
    },
    {
      name: "CRM Maintenance Training",
      plus: "Included",
      demo: null,
      highlight: true,
    },
    {
      name: "Business Development Training",
      plus: "Included",
      demo: null,
      highlight: true,
    },
  ]

  return (
    <section className="pb-12 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* ITAI PLUS Card */}
          <Card className="border-2 border-orange-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-blue-900 text-white px-4 py-2 text-sm font-bold rounded-bl-lg">
              POPULAR
            </div>
            <CardHeader className="text-center bg-gradient-to-r from-orange-50 to-blue-50 pb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">ITAI PLUS</h3>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-blue-900 bg-clip-text text-transparent mb-4">
                $9,900
                <span className="text-xl text-gray-600">/Year</span>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-blue-900 hover:from-orange-600 hover:to-blue-800 text-white px-8 py-3 text-lg font-semibold">
                Get Started
              </Button>
            </CardHeader>
          </Card>

          {/* Demo Account Card */}
          <Card className="border shadow-lg">
            <CardHeader className="text-center bg-gray-50 pb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Demo Account</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">
                $490
                <span className="text-xl text-gray-600"> One-Time</span>
              </div>
              <Button
                variant="outline"
                className="border-2 border-gray-300 hover:bg-gray-50 bg-transparent px-8 py-3 text-lg font-semibold"
              >
                Try Demo
              </Button>
            </CardHeader>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <th className="text-left p-6 font-bold text-gray-900 text-lg">Feature</th>
                  <th className="text-center p-6 font-bold text-gray-900 text-lg bg-gradient-to-r from-orange-50 to-blue-50">
                    ITAI PLUS
                  </th>
                  <th className="text-center p-6 font-bold text-gray-900 text-lg">Demo Account</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={index}
                    className={`border-t border-gray-100 ${
                      feature.highlight ? "bg-blue-50/50" : index % 2 === 0 ? "bg-gray-50/30" : "bg-white"
                    }`}
                  >
                    <td className="p-6 font-medium text-gray-900">{feature.name}</td>
                    <td className={`p-6 text-center ${feature.highlight ? "bg-orange-50/70" : "bg-orange-50/30"}`}>
                      <div className="flex items-center justify-center space-x-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-900 font-medium">{feature.plus}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      {feature.demo ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-900 font-medium">{feature.demo}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <span className="text-gray-400 font-medium">Not Included</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  )
}
