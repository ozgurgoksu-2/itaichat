"use client"

import Assistant from "@/components/assistant";
import ToolsPanel from "@/components/tools-panel";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useConversationStore from "@/stores/useConversationStore";

export function AssistantSection() {
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);
  const router = useRouter();
  const { resetConversation } = useConversationStore();

  // After OAuth redirect, reinitialize the conversation so the next turn
  // uses the connector-enabled server configuration immediately
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isConnected = new URLSearchParams(window.location.search).get("connected");
    if (isConnected === "1") {
      resetConversation();
      router.replace("/", { scroll: false });
    }
  }, [router, resetConversation]);

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Try Our
            <span className="bg-gradient-to-r from-orange-500 to-blue-900 bg-clip-text text-transparent">
              {" "}
              AI Assistant
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the power of our AI assistant with full functionality and advanced tools
          </p>
        </div>

        {/* Chat Interface */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="flex justify-center min-h-[600px]">
              <div className="w-full md:w-[70%] bg-white rounded-2xl shadow-2xl border border-gray-100">
                <Assistant />
              </div>
              <div className="hidden md:block w-[30%] ml-4">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 h-full">
                  <ToolsPanel />
                </div>
              </div>
            </div>
            
            {/* Hamburger menu for small screens */}
            <div className="absolute top-4 right-4 md:hidden">
              <button onClick={() => setIsToolsPanelOpen(true)} className="bg-white rounded-lg p-2 shadow-lg">
                <Menu size={24} />
              </button>
            </div>
            
            {/* Overlay panel for ToolsPanel on small screens */}
            {isToolsPanelOpen && (
              <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-30">
                <div className="w-full bg-white h-full p-4">
                  <button className="mb-4" onClick={() => setIsToolsPanelOpen(false)}>
                    <X size={24} />
                  </button>
                  <ToolsPanel />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
