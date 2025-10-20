import { create } from "zustand";
import { Item } from "@/lib/assistant";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { phaseToolsManager, triggerPhaseTools } from "@/lib/phase-tools-manager";

interface PhaseTransition {
  phase: string;
  percentage: number;
  timestamp: Date;
  toolsTriggered: boolean;
}

interface ConversationState {
  // Items displayed in the chat
  chatMessages: Item[];
  // Items sent to the Responses API
  conversationItems: any[];
  // Whether we are waiting for the assistant response
  isAssistantLoading: boolean;
  // Phase transition tracking
  currentPhase: string;
  currentPercentage: number;
  phaseTransitions: PhaseTransition[];
  toolsEnabled: boolean;

  setChatMessages: (items: Item[]) => void;
  setConversationItems: (messages: any[]) => void;
  addChatMessage: (item: Item) => void;
  addConversationItem: (message: ChatCompletionMessageParam) => void;
  setAssistantLoading: (loading: boolean) => void;
  setCurrentPhase: (phase: string, percentage: number) => void;
  addPhaseTransition: (transition: PhaseTransition) => void;
  setToolsEnabled: (enabled: boolean) => void;
  rawSet: (state: any) => void;
  resetConversation: () => void;
}

const useConversationStore = create<ConversationState>((set, get) => ({
  chatMessages: [],
  conversationItems: [],
  isAssistantLoading: false,
  currentPhase: "INITIAL",
  currentPercentage: 0,
  phaseTransitions: [],
  toolsEnabled: false,
  setChatMessages: (items) => set({ chatMessages: items }),
  setConversationItems: (messages) => set({ conversationItems: messages }),
  addChatMessage: (item) =>
    set((state) => ({ chatMessages: [...state.chatMessages, item] })),
  addConversationItem: (message) =>
    set((state) => ({
      conversationItems: [...state.conversationItems, message],
    })),
  setAssistantLoading: (loading) => set({ isAssistantLoading: loading }),
  setCurrentPhase: (phase, percentage) => {
    const state = get();
    if (state.currentPhase !== phase || state.currentPercentage !== percentage) {
      set({ currentPhase: phase, currentPercentage: percentage });
      
      // Trigger phase-specific tools
      const toolResult = triggerPhaseTools(phase, percentage);
      
      if (toolResult.newTools.length > 0) {
        console.log(`🔧 Phase ${phase} (${percentage}%) - Triggering tools:`, toolResult.newTools);
        console.log(`📋 ${toolResult.description}`);
        set({ toolsEnabled: true });
      }
    }
  },
  addPhaseTransition: (transition) =>
    set((state) => ({
      phaseTransitions: [...state.phaseTransitions, transition],
    })),
  setToolsEnabled: (enabled) => set({ toolsEnabled: enabled }),
  rawSet: set,
  resetConversation: () => {
    phaseToolsManager.reset();
    set(() => ({
      chatMessages: [],
      conversationItems: [],
      currentPhase: "INITIAL",
      currentPercentage: 0,
      phaseTransitions: [],
      toolsEnabled: false,
    }));
  },
}));

export default useConversationStore;
