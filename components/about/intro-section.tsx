export function IntroSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              We&apos;re a results-driven team
            </span>{" "}
            on a mission to globalize businesses.
          </h1>

          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-left max-w-4xl mx-auto border border-gray-100">
            <p className="text-lg lg:text-xl text-gray-700 leading-relaxed mb-6">
              International Trade AI is a business development software solution built on 6+ years of export
              consultancy, international sales, and trade matchmaking expertise.
            </p>
            <p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
              Since 2019, our dedicated team of 80+ professionals has helped 300+ clients grow their export performance
              with measurable, verified success stories.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
