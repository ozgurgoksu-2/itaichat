export function TrustStrip() {
  const industries = [
    "Electronics",
    "Pharma", 
    "Medical Devices",
    "Industrial Supply"
  ]

  return (
    <div className="mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-600 mb-8">
          Used by manufacturers in{" "}
        </p>
        
        {/* Industry Icons/Badges */}
        <div className="flex items-center justify-center space-x-6 lg:space-x-8 mb-8">
          {industries.map((industry, index) => (
            <div 
              key={index}
              className="px-4 py-2 bg-gradient-to-r from-blue-50 to-orange-50 border border-gray-200 rounded-full"
            >
              <span className="text-sm font-medium text-gray-700">
                {industry}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
