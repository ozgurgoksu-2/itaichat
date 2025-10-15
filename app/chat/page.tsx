'use client';

import { ChatInterface } from "@/components/chat/chat-interface"
import { useLanguage } from "@/contexts/language-context"

export default function ChatPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("home.chat.title")}
          </h1>
          <p className="text-xl text-gray-600">
            {t("home.chat.subtitle")}
          </p>
        </div>
        
        <ChatInterface />
      </div>
    </div>
  )
}
