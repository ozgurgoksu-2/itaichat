import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChatInterface } from "@/components/chat/chat-interface"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Export Chat | Talk to ITAI Assistant",
  description: "Chat with ITAI's AI assistant to explore export opportunities and get personalized recommendations for international buyers.",
  alternates: {
    canonical: 'https://www.internationaltradeai.com/chat'
  },
}

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <ChatInterface />
      </main>
      <Footer />
    </div>
  )
}
