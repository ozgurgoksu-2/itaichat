import Image from "next/image"

export function TrustStrip() {
  const companyLogos = [
    "atagur.png",
    "Bareks.png",
    "Bedtex.png",
    "Bronz-Otomotiv.png",
    "Burcam.png",
    "Ege-Seramik.png",
    "Erad-Grup.png",
    "Erha-Muhendislik.png",
    "Erkan-ozen.png",
    "Ermak-Beton.png",
    "Genmacs.png",
    "Gunmak-Makina.png",
    "Inka-Yapi-Baglanti-Ekipmanlari.png",
    "ods-referans_kardelen.png",
    "refkar-sogutma.png",
    "sah-Hortum.png",
    "Utest.png",
    "Wise-Energy.png",
    "Yapkim-Yapi-Kimya.png",
    "Ziyaoglu-Tekstil.png"
  ]

  return (
    <div className="mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-600 mb-8">
          Trusted by leading manufacturers
        </p>
        
        {/* Company Logos */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8 mb-8 items-center justify-items-center">
          {companyLogos.map((logo, index) => (
            <div 
              key={index}
              className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <Image
                src={`/${logo}`}
                alt={`${logo.replace('.png', '').replace('-', ' ')} logo`}
                width={120}
                height={60}
                className="max-w-full max-h-12 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
