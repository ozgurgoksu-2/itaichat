import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AssistantSection } from "@/components/assistant-section"

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <AssistantSection />
      </main>
      <Footer />
    </div>
  )
}
