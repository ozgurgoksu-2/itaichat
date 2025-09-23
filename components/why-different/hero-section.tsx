export function HeroSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Why ITAI is More Than Just a
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Lead Generator
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Our unique methodology blends human experience with AI precision to help companies expand globally with
            confidence.
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-left max-w-3xl mx-auto border border-gray-100">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              &quot;InternationalTradeAI is the result of our mission to enable companies to grow globally – a software
              solution that is the product of our 6 years of international business development experience.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Since 2019, a dedicated team of 80 people has been helping companies achieve global success with a proven
              methodology.&quot;
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
