"use client"

import { useEffect, useState } from "react"

interface InformationCollectionBarProps {
  // These props represent which information has been collected
  hasProduct?: boolean
  hasTargetMarket?: boolean
  hasGtipCode?: boolean
  hasSalesChannels?: boolean
  hasContactInfo?: boolean
  hasKeywords?: boolean
  hasCompetitors?: boolean
  hasCustomers?: boolean
  language?: 'turkish' | 'english'
}

export function InformationCollectionBar({
  hasProduct = false,
  hasTargetMarket = false,
  hasGtipCode = false,
  hasSalesChannels = false,
  hasContactInfo = false,
  hasKeywords = false,
  hasCompetitors = false,
  hasCustomers = false,
  language = 'turkish'
}: InformationCollectionBarProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let percentage = 0

    // Only show milestone percentages - no intermediate values
    // Check in reverse order to get the highest milestone reached
    
    // Demo → 100% (when both competitors and customers are complete)
    if (hasCompetitors && hasCustomers) {
      percentage = 100
    }
    // Competitor → 80%
    else if (hasCompetitors) {
      percentage = 80
    }
    // Phone Number → 60% (we need to check for phone specifically)
    else if (hasContactInfo) {
      percentage = 60
    }
    // Sales Channels → 40%
    else if (hasSalesChannels) {
      percentage = 40
    }
    // Target Country → 20%
    else if (hasTargetMarket) {
      percentage = 20
    }
    // Default → 0%
    else {
      percentage = 0
    }

    setProgress(percentage)
  }, [hasProduct, hasTargetMarket, hasGtipCode, hasSalesChannels, hasContactInfo, hasKeywords, hasCompetitors, hasCustomers])

  const getProgressColor = () => {
    if (progress >= 80) return "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600"
    if (progress >= 60) return "bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-900"
    if (progress >= 40) return "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
    if (progress >= 20) return "bg-gradient-to-r from-orange-400 via-blue-500 to-blue-600"
    return "bg-gradient-to-r from-gray-300 to-gray-400"
  }

  const getProgressText = () => {
    if (language === 'turkish') {
      if (progress === 0) return "İhracat bilgilerini toplamaya başlayın"
      if (progress === 20) return "Hedef ülke belirlendi - %20 tamamlandı"
      if (progress === 40) return "Satış kanalları belirlendi - %40 tamamlandı" 
      if (progress === 60) return "Telefon numarası alındı - %60 tamamlandı"
      if (progress === 80) return "Rakip analizi tamamlandı - %80 tamamlandı"
      if (progress === 100) return "Tüm bilgiler toplandı - Demo için hazır"
      return "Bilgiler toplanıyor..."
    } else {
      if (progress === 0) return "Start collecting export information"
      if (progress === 20) return "Target country selected - 20% complete"
      if (progress === 40) return "Sales channels defined - 40% complete" 
      if (progress === 60) return "Phone number collected - 60% complete"
      if (progress === 80) return "Competitor analysis complete - 80% complete"
      if (progress === 100) return "All information collected - Ready for demo"
      return "Collecting information..."
    }
  }

  const getHeaderText = () => {
    return language === 'turkish' 
      ? "Bilgi Toplama İlerlemesi" 
      : "Information Collection Progress"
  }

  return (
    <div className="w-full bg-gradient-to-r from-slate-50 to-gray-50 border-t border-gray-200 shadow-inner">
      <div className="max-w-4xl mx-auto px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {getHeaderText()}
          </h3>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">
            {progress}%
          </span>
        </div>

        {/* Progress Text */}
        <p className="text-xs text-gray-600 mb-4">
          {getProgressText()}
        </p>

        {/* Progress Bar */}
        <div className="relative">
          {/* Background bar */}
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            {/* Progress fill */}
            <div 
              className={`h-full transition-all duration-1000 ease-out ${getProgressColor()} shadow-lg`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
