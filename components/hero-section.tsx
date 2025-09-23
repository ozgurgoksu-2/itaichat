"use client"

import { AIChatInterface } from "@/components/ai-chat-interface"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const router = useRouter()

  const handleMessageSent = () => {
    // Redirect to chat page when user sends a message
    router.push('/chat')
  }

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-orange-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered AI Chat Interface */}
        <div className="flex justify-center items-center">
          <AIChatInterface onMessageSent={handleMessageSent} />
        </div>
      </div>
    </section>
  )
}
