/**
 * Phase Tools Manager
 * Manages tool activation based on conversation phase transitions
 * Triggers specific tools at predetermined percentage milestones
 */

export interface PhaseToolConfig {
  phase: string;
  percentage: number;
  tools: string[];
  description: string;
}

// Phase-based tool configuration
// target country -> %20, sales channels -> %40, phone number -> %60, competitor -> %80, demo -> %100
export const PHASE_TOOL_CONFIG: PhaseToolConfig[] = [
  {
    phase: "COUNTRY",
    percentage: 20,
    tools: ["web_search", "country_research"],
    description: "Target country market research tools"
  },
  {
    phase: "SALES_CHANNELS", 
    percentage: 40,
    tools: ["web_search", "channel_analyzer", "market_research"],
    description: "Sales channels analysis and market research tools"
  },
  {
    phase: "PHONE",
    percentage: 60, 
    tools: ["web_search", "contact_validator", "crm_tools"],
    description: "Contact validation and CRM integration tools"
  },
  {
    phase: "COMPETITORS",
    percentage: 80,
    tools: ["web_search", "competitor_finder", "market_analysis", "competitor_research"],
    description: "Competitor research and market analysis tools"
  },
  {
    phase: "DEMO",
    percentage: 100,
    tools: ["web_search", "report_generator", "demo_scheduler", "crm_integration"],
    description: "Demo preparation and CRM integration tools"
  }
];

export class PhaseToolsManager {
  private activeTools: Set<string> = new Set();
  private currentPhase: string = "INITIAL";
  private currentPercentage: number = 0;

  /**
   * Update the current phase and trigger appropriate tools
   */
  updatePhase(phase: string, percentage: number): string[] {
    if (this.currentPhase === phase && this.currentPercentage === percentage) {
      return []; // No change
    }

    const previousPercentage = this.currentPercentage;
    this.currentPhase = phase;
    this.currentPercentage = percentage;

    console.log(`🔧 Phase Tools Manager: ${phase} (${percentage}%)`);

    // Find tools to activate for this phase
    const phaseConfig = PHASE_TOOL_CONFIG.find(config => 
      config.phase === phase && config.percentage === percentage
    );

    if (!phaseConfig) {
      console.log(`⚠️ No tool configuration found for phase ${phase} at ${percentage}%`);
      return [];
    }

    // Only activate tools if we're progressing forward
    if (percentage > previousPercentage) {
      const newTools = phaseConfig.tools.filter(tool => !this.activeTools.has(tool));
      
      // Add new tools to active set
      newTools.forEach(tool => this.activeTools.add(tool));
      
      console.log(`🚀 Activating tools for ${phase} (${percentage}%):`, newTools);
      console.log(`📋 Description: ${phaseConfig.description}`);
      console.log(`🔧 All active tools:`, Array.from(this.activeTools));
      
      return newTools;
    }

    return [];
  }

  /**
   * Get all currently active tools
   */
  getActiveTools(): string[] {
    return Array.from(this.activeTools);
  }

  /**
   * Get tools for a specific phase
   */
  getToolsForPhase(phase: string, percentage: number): string[] {
    const phaseConfig = PHASE_TOOL_CONFIG.find(config => 
      config.phase === phase && config.percentage === percentage
    );
    return phaseConfig ? phaseConfig.tools : [];
  }

  /**
   * Check if a specific tool is active
   */
  isToolActive(toolName: string): boolean {
    return this.activeTools.has(toolName);
  }

  /**
   * Reset all active tools (for new conversation)
   */
  reset(): void {
    this.activeTools.clear();
    this.currentPhase = "INITIAL";
    this.currentPercentage = 0;
    console.log("🔄 Phase Tools Manager reset");
  }

  /**
   * Get phase configuration for debugging
   */
  getPhaseConfig(): PhaseToolConfig[] {
    return PHASE_TOOL_CONFIG;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      phase: this.currentPhase,
      percentage: this.currentPercentage,
      activeTools: Array.from(this.activeTools),
      totalActiveTools: this.activeTools.size
    };
  }
}

// Global instance
export const phaseToolsManager = new PhaseToolsManager();

/**
 * Helper function to trigger tools based on phase transition
 */
export function triggerPhaseTools(phase: string, percentage: number): {
  newTools: string[];
  allActiveTools: string[];
  description: string;
} {
  const newTools = phaseToolsManager.updatePhase(phase, percentage);
  const allActiveTools = phaseToolsManager.getActiveTools();
  
  const phaseConfig = PHASE_TOOL_CONFIG.find(config => 
    config.phase === phase && config.percentage === percentage
  );
  
  return {
    newTools,
    allActiveTools,
    description: phaseConfig?.description || "No description available"
  };
}

/**
 * Helper function to check if tools should be triggered at a percentage
 * Only milestone percentages trigger tools: 20%, 40%, 60%, 80%, 100%
 */
export function shouldTriggerToolsAtPercentage(percentage: number): boolean {
  const milestonePercentages = [20, 40, 60, 80, 100];
  return milestonePercentages.includes(percentage);
}

/**
 * Get phase information for a given percentage
 */
export function getPhaseInfoByPercentage(percentage: number): PhaseToolConfig | null {
  return PHASE_TOOL_CONFIG.find(config => config.percentage === percentage) || null;
}
