"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdvantagesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to /use-cases
    router.replace("/use-cases")
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to Use Cases...</p>
      </div>
    </div>
  )
}
