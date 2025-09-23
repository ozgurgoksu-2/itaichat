export type Language = "en" | "tr"

export interface Translations {
  [key: string]: string | Translations
}

export const translations: Record<Language, Translations> = {
  en: {
    // Header
    header: {
      nav: {
        whyDifferent: "WHY WE ARE DIFFERENT",
        about: "ABOUT US",
        pricing: "PRICING",
        useCases: "ADVANTAGES",
        faq: "FAQ",
      },
      buttons: {
        signIn: "Sign In",
        getStarted: "Book a Demo",
      },
    },
    // Homepage
    home: {
      hero: {
        badge: "AI-Powered Export Solutions",
        title: "Discover Global",
        titleAccent: "Export Opportunities",
        subtitle:
          "Our AI assistant analyzes global markets to find the perfect export opportunities for your products. Get personalized recommendations and connect with international buyers instantly.",
        placeholder: "We want to sell our textile products in Europe...",
        helper: "Tell us about your product and export goals to get started",
      },
      whyDifferent: {
        title: "Why We're",
        titleAccent: "Different",
        subtitle: "A clearer, faster way to scale global sales — powered by AI, not guesswork.",
        features: {
          exportFocused: {
            title: "Export-Focused AI",
            description: "A system trained specifically for export intelligence — not generic CRM.",
          },
          alwaysOn: {
            title: "Always On",
            description: "24/7 lead generation and buyer tracking so you never miss an opportunity.",
          },
          tailored: {
            title: "Tailored to You",
            description: "Every result matches your industry, capacity, and product goals.",
          },
          noClutter: {
            title: "No Clutter, Just Matches",
            description: "We don't show lists. We show your best-fit buyers.",
          },
        },
      },
      value: {
        title: "Why Choose ITAI for Your",
        titleAccent: "Export Journey?",
        subtitle: "Transform your export business with AI-powered insights and connections that deliver real results",
      },
    },
  },
  tr: {
    // Header
    header: {
      nav: {
        whyDifferent: "NEDEN FARKLIIZ",
        about: "HAKKIMIZDA",
        pricing: "FİYATLANDIRMA",
        useCases: "AVANTAJLAR",
        faq: "SSS",
      },
      buttons: {
        signIn: "Giriş Yap",
        getStarted: "Demo Rezervasyonu",
      },
    },
    // Homepage
    home: {
      hero: {
        badge: "AI Destekli İhracat Çözümleri",
        title: "Küresel",
        titleAccent: "İhracat Fırsatlarını Keşfedin",
        subtitle:
          "AI asistanımız küresel pazarları analiz ederek ürünleriniz için mükemmel ihracat fırsatlarını bulur. Kişiselleştirilmiş öneriler alın ve uluslararası alıcılarla anında bağlantı kurun.",
        placeholder: "Tekstil ürünlerimizi Avrupa'da satmak istiyoruz...",
        helper: "Başlamak için ürününüz ve ihracat hedefleriniz hakkında bize bilgi verin",
      },
      whyDifferent: {
        title: "Neden",
        titleAccent: "Farklıyız",
        subtitle: "Tahminlere değil, AI'ya dayalı daha net ve hızlı küresel satış büyütme yolu.",
        features: {
          exportFocused: {
            title: "İhracata Odaklı AI",
            description: "Genel CRM değil, özellikle ihracat zekası için eğitilmiş bir sistem.",
          },
          alwaysOn: {
            title: "Her Zaman Aktif",
            description: "7/24 müşteri adayı üretimi ve alıcı takibi ile hiçbir fırsatı kaçırmayın.",
          },
          tailored: {
            title: "Size Özel",
            description: "Her sonuç sektörünüz, kapasiteniz ve ürün hedeflerinizle eşleşir.",
          },
          noClutter: {
            title: "Karmaşa Yok, Sadece Eşleşmeler",
            description: "Liste göstermiyoruz. Size en uygun alıcıları gösteriyoruz.",
          },
        },
      },
      value: {
        title: "İhracat Yolculuğunuz İçin Neden",
        titleAccent: "ITAI'yi Seçmelisiniz?",
        subtitle: "Gerçek sonuçlar sunan AI destekli içgörüler ve bağlantılarla ihracat işinizi dönüştürün",
      },
    },
  },
}

export function getNestedTranslation(translations: Translations, key: string): string {
  const keys = key.split(".")
  let current: string | Translations = translations

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k]
    } else {
      return key // Return the key if translation not found
    }
  }

  return typeof current === "string" ? current : key
}
