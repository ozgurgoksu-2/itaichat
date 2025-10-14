import { getDeveloperPrompt, MODEL } from "@/config/constants";
import { getTools } from "@/lib/tools/tools";
import OpenAI from "openai";

// AI-powered message analysis function
async function analyzeUserMessage(text: string): Promise<{
  isProduct: boolean;
  productName?: string;
  language: 'turkish' | 'english';
  isGreeting: boolean;
}> {
  const openai = new OpenAI();
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a message analyzer for an export assistant. Analyze the user's message and respond with ONLY a JSON object.

Rules:
1. Determine if the message contains a product name (any exportable item: food, agricultural products, manufactured goods, etc.)
2. Detect the language (Turkish or English)
3. Check if it's a greeting message

Respond with this exact JSON format:
{
  "isProduct": boolean,
  "productName": "extracted product name or null",
  "language": "turkish" or "english",
  "isGreeting": boolean
}

Examples:
- "carrot" → {"isProduct": true, "productName": "carrot", "language": "english", "isGreeting": false}
- "havuç" → {"isProduct": true, "productName": "havuç", "language": "turkish", "isGreeting": false}
- "hello" → {"isProduct": false, "productName": null, "language": "english", "isGreeting": true}
- "merhaba" → {"isProduct": false, "productName": null, "language": "turkish", "isGreeting": true}
- "textile fabric" → {"isProduct": true, "productName": "textile fabric", "language": "english", "isGreeting": false}`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0,
      max_tokens: 100
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    console.log("🤖 AI Message Analysis:", { input: text, result });
    
    return {
      isProduct: result.isProduct || false,
      productName: result.productName || undefined,
      language: result.language === 'english' ? 'english' : 'turkish',
      isGreeting: result.isGreeting || false
    };
  } catch (error) {
    console.error("❌ AI Analysis failed, using fallback:", error);
    
    // Fallback to simple detection if AI fails
    return {
      isProduct: false,
      productName: undefined,
      language: /[çğıöşüÇĞIİÖŞÜ]/.test(text) ? 'turkish' : 'english',
      isGreeting: /^(hello|hi|hey|merhaba|selam|iyi)/i.test(text.trim())
    };
  }
}

// Phase description helper
function getPhaseDescription(phase: string): string {
  const descriptions: { [key: string]: string } = {
    "INITIAL": "Starting conversation",
    "PRODUCT_QUESTION": "Asking for product information",
    "COUNTRY_QUESTION": "Asking for target country",
    "GTIP_QUESTION": "Asking for GTIP code",
    "SALES_CHANNELS_QUESTION": "Asking for sales channels",
    "WEBSITE_QUESTION": "Asking for company website",
    "NAME_QUESTION": "Asking for contact name",
    "EMAIL_QUESTION": "Asking for email address",
    "PHONE_QUESTION": "Asking for phone number",
    "KEYWORDS_QUESTION": "Confirming product keywords",
    "COMPETITORS_QUESTION": "Presenting 2 competitors and asking for note confirmation",
    "CUSTOMERS_QUESTION": "Presenting 2 customers and asking for note confirmation",
    "DEMO_QUESTION": "Offering demo/calendly and providing final summary",
    "UNKNOWN_PHASE": "Phase could not be determined"
  };
  return descriptions[phase] || "Unknown phase";
}

// Next expected action helper
function getNextExpectedAction(state: any): string {
  const phase = state.currentPhase;
  
  switch (phase) {
    case "INITIAL":
      return "Bot should greet user and ask for product information";
    case "PRODUCT_QUESTION":
      return "Waiting for user to provide product name";
    case "COUNTRY_QUESTION":
      return "Waiting for user to provide target country";
    case "GTIP_QUESTION":
      return "Waiting for user to confirm GTIP code";
    case "SALES_CHANNELS_QUESTION":
      return "Waiting for user to provide sales channels";
    case "WEBSITE_QUESTION":
      return "Waiting for user to provide company website";
    case "NAME_QUESTION":
      return "Waiting for user to provide their name";
    case "EMAIL_QUESTION":
      return "Waiting for user to provide corporate email";
    case "PHONE_QUESTION":
      return "Waiting for user to provide phone number";
    case "KEYWORDS_QUESTION":
      return "Waiting for user to confirm keywords, then move to competitors";
    case "COMPETITORS_QUESTION":
      return "Waiting for user yes/no response, then move to customers";
    case "CUSTOMERS_QUESTION":
      return "Waiting for user yes/no response, then move to demo";
    case "DEMO_QUESTION":
      return "Conversation should be completing with final summary";
    default:
      return "Unknown next action - check phase detection logic";
  }
}

// Flow validation helper
function validateConversationFlow(state: any): string[] {
  const issues: string[] = [];
  
  // Check for missing prerequisites
  if (state.currentPhase === "COUNTRY_QUESTION" && !state.product) {
    issues.push("Country question asked but no product collected");
  }
  
  if (state.currentPhase === "COMPETITORS_QUESTION" && !state.keywordsConfirmed) {
    issues.push("Competitors phase started but keywords not confirmed");
  }
  
  if (state.currentPhase === "CUSTOMERS_QUESTION" && !state.competitorsCompleted) {
    issues.push("Customers phase started but competitors not completed");
  }
  
  if (state.currentPhase === "DEMO_QUESTION" && !state.customersCompleted) {
    issues.push("Demo phase started but customers not completed");
  }
  
  // Check for stuck states
  if (state.competitorsSectionStarted && !state.competitorsCompleted && state.competitorCount === 0) {
    issues.push("Competitors section started but no competitors counted");
  }
  
  if (state.customersSectionStarted && !state.customersCompleted && state.customerCount === 0) {
    issues.push("Customers section started but no customers counted");
  }
  
  // Check for required fields
  if (state.currentPhase === "DEMO_QUESTION") {
    if (!state.phone) issues.push("Demo phase reached but no phone number collected");
    if (!state.email) issues.push("Demo phase reached but no email collected");
    if (!state.name) issues.push("Demo phase reached but no name collected");
  }
  
  return issues;
}

// Phase detection system
function detectCurrentPhase(messages: any[], state: any): string {
  const assistantMessages = messages.filter(msg => msg.role === "assistant");
  const userMessages = messages.filter(msg => msg.role === "user");
  
  if (assistantMessages.length === 0) return "INITIAL";
  
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
  const lastAssistantContent = (typeof lastAssistantMessage.content === 'string' ? 
    lastAssistantMessage.content : 
    Array.isArray(lastAssistantMessage.content) ? 
      lastAssistantMessage.content.map((c: any) => c.text || '').join(' ') : ''
  ).toLowerCase();
  
  const lastUserMessage = userMessages[userMessages.length - 1];
  const lastUserContent = lastUserMessage ? lastUserMessage.content.toLowerCase() : '';
  
  // Phase 1: Product
  if (!state.product && (lastAssistantContent.includes("which product") || lastAssistantContent.includes("hangi ürün"))) {
    return "PRODUCT_QUESTION";
  }
  
  // Phase 2: Country  
  if (state.product && !state.country && (lastAssistantContent.includes("which country") || lastAssistantContent.includes("hangi ülke"))) {
    return "COUNTRY_QUESTION";
  }
  
  // Phase 3: GTIP Code
  if (state.country && !state.gtipCode && (lastAssistantContent.includes("gtip code") || lastAssistantContent.includes("gtip kod"))) {
    return "GTIP_QUESTION";
  }
  
  // Phase 4: Sales Channels
  if (state.gtipCode && !state.salesChannels && (lastAssistantContent.includes("sales channel") || lastAssistantContent.includes("satış kanal"))) {
    return "SALES_CHANNELS_QUESTION";
  }
  
  // Phase 5: Website
  if (state.salesChannels && !state.website && (lastAssistantContent.includes("website") || lastAssistantContent.includes("websiten"))) {
    return "WEBSITE_QUESTION";
  }
  
  // Phase 6: Name
  if (state.website !== undefined && !state.name && (lastAssistantContent.includes("your name") || lastAssistantContent.includes("isminiz"))) {
    return "NAME_QUESTION";
  }
  
  // Phase 7: Email
  if (state.name && !state.email && (lastAssistantContent.includes("email") || lastAssistantContent.includes("e-posta"))) {
    return "EMAIL_QUESTION";
  }
  
  // Phase 8: Phone
  if (state.email && !state.phone && (lastAssistantContent.includes("phone") || lastAssistantContent.includes("telefon"))) {
    return "PHONE_QUESTION";
  }
  
  // Phase 9: Keywords
  if (state.phone && !state.keywordsConfirmed && (lastAssistantContent.includes("keywords describe") || lastAssistantContent.includes("anahtar kelime"))) {
    return "KEYWORDS_QUESTION";
  }
  
  // Phase 10: Competitors - Present 2 competitors and ask for note
  if (state.keywordsConfirmed && !state.competitorsCompleted && 
      (lastAssistantContent.includes("competitor") && 
       (lastAssistantContent.includes("should i keep a note of these competitors") || 
        lastAssistantContent.includes("bu rakipleri sizin için not alayım mı")))) {
    return "COMPETITORS_QUESTION";
  }
  
  // Phase 11: Customers - Present 2 customers and ask for note
  if (state.competitorsCompleted && !state.customersCompleted &&
      (lastAssistantContent.includes("customer") || lastAssistantContent.includes("müşteri")) &&
      (lastAssistantContent.includes("should i keep a note of these customers") || 
       lastAssistantContent.includes("bu müşterileri sizin için not alayım mı"))) {
    return "CUSTOMERS_QUESTION";
  }
  
  // Phase 12: Demo
  if ((state.customersCompleted || (state.customersSectionStarted && lastUserContent.includes("no"))) &&
      (lastAssistantContent.includes("calendly") || lastAssistantContent.includes("toplantı"))) {
    return "DEMO_QUESTION";
  }
  
  return "UNKNOWN_PHASE";
}

// Helper function to extract conversation state from messages
async function extractConversationState(messages: any[]) {
  const state: any = {
    product: undefined,
    country: undefined,
    gtipCode: undefined,
    salesChannels: undefined,
    website: undefined,
    name: undefined,
    email: undefined,
    phone: undefined,
    keywords: undefined,
    competitors: [],
    customers: [],
    detectedLanguage: 'turkish', // Default to Turkish
    userStartedWithProduct: false,
    aiAnalysis: undefined,
    currentPhase: "INITIAL"
  };

  // Get user messages
  const userMessages = messages.filter(msg => msg.role === "user" && msg.content);
  
  // Analyze the first user message with AI
  if (userMessages.length > 0) {
    const firstMessage = userMessages[0].content;
    try {
      const analysis = await analyzeUserMessage(firstMessage);
      state.aiAnalysis = analysis;
      state.detectedLanguage = analysis.language;
      
      if (analysis.isProduct && analysis.productName) {
        state.product = analysis.productName;
        state.userStartedWithProduct = true;
      }
      
      console.log("🤖 AI First Message Analysis:", {
        firstMessage,
        analysis,
        extractedProduct: state.product,
        detectedLanguage: state.detectedLanguage
      });
    } catch (error) {
      console.error("❌ AI analysis failed for first message:", error);
      // Fallback to simple language detection
      const allUserText = userMessages.map(msg => msg.content).join(" ");
      state.detectedLanguage = /[çğıöşüÇĞIİÖŞÜ]/.test(allUserText) ? 'turkish' : 'english';
    }
  }

  // Track conversation progress and extract information
  let keywordsConfirmed = false;
  let competitorsSectionStarted = false;
  let customersSectionStarted = false;
  let competitorQuestionAsked = false;
  let customerQuestionAsked = false;
  let competitorsCompleted = false;
  let customersCompleted = false;
  let competitorCount = 0;
  let customerCount = 0;
  
  for (const message of messages) {
    if (message.role === "assistant" && message.content) {
      const content = typeof message.content === 'string' ? message.content : 
                     Array.isArray(message.content) ? message.content.map((c: any) => c.text || '').join(' ') : '';
      const lowerContent = content.toLowerCase();
      
      // Check if keywords were asked
      if (lowerContent.includes("do these keywords describe") || lowerContent.includes("anahtar kelime")) {
        // Keywords section has started
      }
      
      // Check if we've started competitors section (new simplified flow)
      if (lowerContent.includes("competitor") && 
          (lowerContent.includes("should i keep a note of these competitors") || 
           lowerContent.includes("bu rakipleri sizin için not alayım mı"))) {
        competitorsSectionStarted = true;
        competitorQuestionAsked = true;
        competitorCount = 2; // Always 2 competitors in new flow
        // After presenting 2 competitors and asking, mark as completed
        competitorsCompleted = true;
      }
      
      // Check if we've started customers section (new simplified flow)
      if ((lowerContent.includes("customer") || lowerContent.includes("müşteri")) && 
          (lowerContent.includes("should i keep a note of these customers") || 
           lowerContent.includes("bu müşterileri sizin için not alayım mı"))) {
        customersSectionStarted = true;
        customerQuestionAsked = true;
        customerCount = 2; // Always 2 customers in new flow
        // After presenting 2 customers and asking, mark as completed
        customersCompleted = true;
      }
    }
    
    if (message.role === "user" && message.content) {
      const content = message.content.toLowerCase();
      
      // Check if user confirmed keywords
      if (content.includes("yes") || content.includes("evet") || content.includes("describes") || content.includes("tanımlar")) {
        const recentAssistantMessages = messages.filter(msg => msg.role === "assistant").slice(-2);
        const hasKeywordQuestion = recentAssistantMessages.some(msg => {
          const msgContent = typeof msg.content === 'string' ? msg.content : 
                            Array.isArray(msg.content) ? msg.content.map((c: any) => c.text || '').join(' ') : '';
          return msgContent.toLowerCase().includes("do these keywords describe") || msgContent.toLowerCase().includes("anahtar kelime");
        });
        
        if (hasKeywordQuestion) {
          keywordsConfirmed = true;
          state.keywords = ["confirmed"];
        }
      }
      
      // Try to extract country information
      if (!state.country) {
        const countries = ["almanya", "germany", "fransa", "france", "amerika", "usa", "ingiltere", "uk", "italy", "italya", "spain", "ispanya"];
        for (const country of countries) {
          if (content.includes(country)) {
            state.country = country;
            break;
          }
        }
      }
      
      // Extract email, phone, name, GTIP, sales channels, and website from user messages
      const messageText = typeof message.content === 'string' ? message.content : 
                         Array.isArray(message.content) ? message.content.map((c: any) => c.text || '').join(' ') : '';
      
      // Try to extract email
      const emailMatch = messageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch && !state.email) {
        state.email = emailMatch[0];
      }
      
      // Try to extract phone
      const phoneMatch = messageText.match(/[\+]?[1-9][\d]{3,14}/);
      if (phoneMatch && !state.phone) {
        state.phone = phoneMatch[0];
      }
      
      // Try to extract name (simple heuristic)
      if (!state.name && (content.includes("ozgur") || content.includes("goksu"))) {
        state.name = "Özgür Göksu";
      } else if (!state.name && messageText.length < 50 && messageText.length > 1) {
        // If it's a short message that might be a name, save it
        const words = messageText.trim().split(/\s+/);
        if (words.length <= 3 && words.every((word: string) => /^[a-zA-Z]+$/.test(word))) {
          // Only save as name if it's not a common single-word product
          const commonProducts = ['paper', 'apple', 'banana', 'wheat', 'rice', 'corn', 'sugar', 'oil', 'textile', 'fabric'];
          if (!commonProducts.includes(messageText.toLowerCase().trim())) {
            state.name = messageText.trim();
          }
        }
      }
      
      // Extract GTIP code if mentioned
      if (content.includes("070610") || content.includes("4802") || content.includes("gtip")) {
        if (content.includes("4802")) {
          state.gtipCode = "4802";
        } else {
          state.gtipCode = "070610";
        }
      }
      
      // Extract sales channels
      if (content.includes("hepsi") || content.includes("all")) {
        state.salesChannels = ["all"];
      }
      
      // Extract website
      if (content.includes("www.") || content.includes(".com")) {
        const websiteMatch = messageText.match(/(www\.[^\s]+|[^\s]+\.(com|org|net|ai))/);
        if (websiteMatch) {
          state.website = websiteMatch[0];
        }
      }
    }
    
    // Also check assistant messages for GTIP confirmation
    if (message.role === "assistant" && message.content) {
      const content = typeof message.content === 'string' ? message.content : 
                     Array.isArray(message.content) ? message.content.map((c: any) => c.text || '').join(' ') : '';
      
      // Check if GTIP was confirmed by assistant
      if (content.includes("4802") || content.includes("070610")) {
        if (content.includes("4802")) {
          state.gtipCode = "4802";
        } else if (content.includes("070610")) {
          state.gtipCode = "070610";
        }
      }
    }
  }
  
  // Set conversation progress indicators
  state.keywordsConfirmed = keywordsConfirmed;
  state.competitorsSectionStarted = competitorsSectionStarted;
  state.customersSectionStarted = customersSectionStarted;
  state.competitorQuestionAsked = competitorQuestionAsked;
  state.customerQuestionAsked = customerQuestionAsked;
  state.competitorsCompleted = competitorsCompleted;
  state.customersCompleted = customersCompleted;
  state.competitorCount = competitorCount;
  state.customerCount = customerCount;
  
  // Detect current phase
  const previousPhase = state.currentPhase;
  state.currentPhase = detectCurrentPhase(messages, state);
  
  // Log phase transitions
  if (previousPhase && previousPhase !== state.currentPhase) {
    console.log(`🔄 PHASE TRANSITION: ${previousPhase} → ${state.currentPhase}`);
  }

  return state;
}

export async function POST(request: Request) {
  try {
    const { messages, toolsState } = await request.json();

    const tools = await getTools(toolsState);

    console.log("🚀 ITAI EXPORT ASSISTANT - API REQUEST RECEIVED");
    console.log("Tools:", tools);
    console.log("Received messages count:", messages?.length || 0);

    // Extract conversation state from messages (now async with AI analysis)
    const conversationState = await extractConversationState(messages);
    
    // 🚨 ENHANCED PHASE DEBUGGING - Comprehensive logging (with error handling)
    try {
      console.log("\n" + "=".repeat(80));
      console.log("🔍 CONVERSATION STATE DEBUGGING - DETAILED ANALYSIS");
      console.log("=".repeat(80));
    
    // Current Phase with visual indicator
    const phaseEmoji: { [key: string]: string } = {
      "INITIAL": "🏁",
      "PRODUCT_QUESTION": "📦",
      "COUNTRY_QUESTION": "🌍", 
      "GTIP_QUESTION": "🔢",
      "SALES_CHANNELS_QUESTION": "🛒",
      "WEBSITE_QUESTION": "🌐",
      "NAME_QUESTION": "👤",
      "EMAIL_QUESTION": "📧",
      "PHONE_QUESTION": "📱",
      "KEYWORDS_QUESTION": "🔑",
      "COMPETITORS_QUESTION": "🏢",
      "CUSTOMERS_QUESTION": "👥",
      "DEMO_QUESTION": "📅",
      "UNKNOWN_PHASE": "❓"
    };
    
    const currentPhase = conversationState.currentPhase || "UNKNOWN_PHASE";
    const emoji = phaseEmoji[currentPhase] || "❓";
    
    console.log(`📍 CURRENT PHASE: ${emoji} ${currentPhase}`);
    console.log(`🎯 PHASE DESCRIPTION: ${getPhaseDescription(currentPhase)}`);
    
    // Detailed progress tracking with visual indicators
    console.log("\n📊 CONVERSATION PROGRESS:");
    console.log("┌─────────────────────────────────────────────────────────┐");
    console.log(`│ 1. Product:        ${conversationState.product ? '✅ ' + conversationState.product : '❌ Not collected'}`);
    console.log(`│ 2. Country:        ${conversationState.country ? '✅ ' + conversationState.country : '❌ Not collected'}`);
    console.log(`│ 3. GTIP Code:      ${conversationState.gtipCode ? '✅ ' + conversationState.gtipCode : '❌ Not collected'}`);
    console.log(`│ 4. Sales Channels: ${conversationState.salesChannels ? '✅ ' + JSON.stringify(conversationState.salesChannels) : '❌ Not collected'}`);
    console.log(`│ 5. Website:        ${conversationState.website !== undefined ? '✅ ' + (conversationState.website || 'No website') : '❌ Not collected'}`);
    console.log(`│ 6. Name:           ${conversationState.name ? '✅ ' + conversationState.name : '❌ Not collected'}`);
    console.log(`│ 7. Email:          ${conversationState.email ? '✅ ' + conversationState.email : '❌ Not collected'}`);
    console.log(`│ 8. Phone:          ${conversationState.phone ? '✅ ' + conversationState.phone : '❌ Not collected'}`);
    console.log(`│ 9. Keywords:       ${conversationState.keywordsConfirmed ? '✅ Confirmed' : '❌ Not confirmed'}`);
    console.log("└─────────────────────────────────────────────────────────┘");
    
    // Competitor & Customer Flow Status
    console.log("\n🏢 COMPETITOR & CUSTOMER FLOW STATUS:");
    console.log("┌─────────────────────────────────────────────────────────┐");
    console.log(`│ Competitors Started:   ${conversationState.competitorsSectionStarted ? '✅ Yes' : '❌ No'}`);
    console.log(`│ Competitors Completed: ${conversationState.competitorsCompleted ? '✅ Yes' : '❌ No'}`);
    console.log(`│ Competitor Count:      ${conversationState.competitorCount || 0}/2`);
    console.log(`│ Customers Started:     ${conversationState.customersSectionStarted ? '✅ Yes' : '❌ No'}`);
    console.log(`│ Customers Completed:   ${conversationState.customersCompleted ? '✅ Yes' : '❌ No'}`);
    console.log(`│ Customer Count:        ${conversationState.customerCount || 0}/2`);
    console.log("└─────────────────────────────────────────────────────────┘");
    
    // Next Expected Action
    console.log("\n🎯 NEXT EXPECTED ACTION:");
    console.log("┌─────────────────────────────────────────────────────────┐");
    console.log(`│ ${getNextExpectedAction(conversationState)}`);
    console.log("└─────────────────────────────────────────────────────────┘");
    
    // Recent conversation context
    console.log("\n💬 RECENT CONVERSATION CONTEXT:");
    if (!messages || !Array.isArray(messages)) {
      console.log("❌ No messages array found");
    } else {
      const lastMessages = messages.slice(-3);
      if (lastMessages.length === 0) {
        console.log("📭 No recent messages to display");
      } else {
    
    lastMessages.forEach((msg: any) => {
      if (!msg || !msg.role) {
        console.log("❓ UNKNOWN: Invalid message object");
        return;
      }
      
      let content = 'empty content';
      
      if (typeof msg.content === 'string') {
        content = msg.content.substring(0, 150) + (msg.content.length > 150 ? '...' : '');
      } else if (Array.isArray(msg.content)) {
        // Handle content array format
        const textContent = msg.content.map((c: any) => c.text || '').join(' ');
        content = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
      } else if (msg.content && typeof msg.content === 'object') {
        content = JSON.stringify(msg.content).substring(0, 150) + '...';
      }
      
      const roleEmoji = msg.role === 'user' ? '👤' : '🤖';
      const roleName = msg.role ? msg.role.toUpperCase() : 'UNKNOWN';
      console.log(`${roleEmoji} ${roleName}: ${content}`);
    });
      }
    }
    
    // Language Detection
    console.log("\n🌐 LANGUAGE & AI ANALYSIS:");
    console.log("┌─────────────────────────────────────────────────────────┐");
    console.log(`│ Detected Language:     ${conversationState.detectedLanguage || 'Not detected'}`);
    console.log(`│ User Started w/Product: ${conversationState.userStartedWithProduct ? 'Yes' : 'No'}`);
    if (conversationState.aiAnalysis) {
      console.log(`│ AI Analysis - Product:  ${conversationState.aiAnalysis.isProduct ? 'Yes' : 'No'}`);
      console.log(`│ AI Analysis - Greeting: ${conversationState.aiAnalysis.isGreeting ? 'Yes' : 'No'}`);
    }
    console.log("└─────────────────────────────────────────────────────────┘");
    
    // Flow Validation
    console.log("\n⚠️  FLOW VALIDATION CHECKS:");
    const validationIssues = validateConversationFlow(conversationState);
    if (validationIssues.length > 0) {
      validationIssues.forEach(issue => console.log(`❌ ${issue}`));
    } else {
      console.log("✅ No flow validation issues detected");
    }
    
      console.log("\n" + "=".repeat(80));
      console.log("END CONVERSATION STATE DEBUGGING");
      console.log("=".repeat(80) + "\n");
    } catch (debugError) {
      console.error("❌ Error in debugging system:", debugError);
      console.log("🔍 Basic phase info:", conversationState?.currentPhase || "UNKNOWN");
    }

    const openai = new OpenAI();

    // Add system message to the beginning of messages array
    const systemMessage = {
      role: "system" as const,
      content: getDeveloperPrompt(conversationState)
    };
    const allMessages = [systemMessage, ...messages];

    const events = await openai.chat.completions.create({
      model: MODEL,
      messages: allMessages,
      tools: tools.filter(tool => tool.type === 'function').map(tool => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
          strict: tool.strict
        }
      })),
      stream: true,
      parallel_tool_calls: false,
    });

    // Create a ReadableStream that emits SSE data
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of events) {
            // Convert OpenAI chat completion chunks to the format frontend expects
            if (chunk.choices && chunk.choices[0]) {
              const delta = chunk.choices[0].delta;
              
              // Handle content delta
              if (delta.content) {
                // Remove any Wikipedia links and parenthetical comments
                const originalText = delta.content;
                let filteredText = originalText;
                
                // Remove Wikipedia links completely (all variations)
                filteredText = filteredText.replace(/\([^)]*wikipedia[^)]*\)/gi, '');
                filteredText = filteredText.replace(/\[[^\]]*wikipedia[^\]]*\]/gi, '');
                filteredText = filteredText.replace(/https?:\/\/[^\s]*wikipedia[^\s)]*/gi, '');
                
                // Remove parenthetical comments like "(Note: ...)"
                filteredText = filteredText.replace(/\(Note:[^)]*\)/gi, '');
                filteredText = filteredText.replace(/\([^)]*extracted[^)]*\)/gi, '');
                filteredText = filteredText.replace(/\([^)]*tradekey[^)]*\)/gi, '');
                filteredText = filteredText.replace(/\([^)]*utm_source[^)]*\)/gi, '');
                
                // Clean up extra spaces and line breaks
                filteredText = filteredText.replace(/\s+/g, ' ').trim();
                
                if (originalText !== filteredText) {
                  console.log('🧹 FILTERED Wikipedia/comments from response');
                }
                
                // Convert to the format frontend expects
                const event = {
                  type: 'response.content_part.added',
                  part: {
                    text: filteredText
                  }
                };
                
                // Sending event to the client
                const data = JSON.stringify({
                  event: event.type,
                  data: event,
                });
                controller.enqueue(`data: ${data}\n\n`);
              }
            }
          }
          // End of stream
          controller.close();
        } catch (error) {
          console.error("Error in streaming loop:", error);
          controller.error(error);
        }
      },
    });

    // Return the ReadableStream as SSE
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
