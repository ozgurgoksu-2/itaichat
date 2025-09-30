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

// Helper function to extract conversation state from messages
async function extractConversationState(messages: any[]) {
  const state: any = {
    phase: "greeting",
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
    competitorsComplete: false,
    aiAnalysis: undefined
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

  // Analyze messages to determine current state and phase
  let isKeywordsPhaseStarted = false;
  let isKeywordsConfirmed = false;
  let isCompetitorsPhaseStarted = false;
  let competitorCount = 0;
  let isCustomersPhaseStarted = false;
  let customerCount = 0;
  for (const message of messages) {
    if (message.role === "assistant" && message.content) {
      const content = typeof message.content === 'string' ? message.content : 
                     Array.isArray(message.content) ? message.content.map((c: any) => c.text || '').join(' ') : '';
      const lowerContent = content.toLowerCase();
      
      // Check for phase transitions based on assistant messages
      if (lowerContent.includes("anahtar kelime") || lowerContent.includes("keyword")) {
        isKeywordsPhaseStarted = true;
      }
      
      // Detect competitors phase and count competitors
      if (lowerContent.includes("competitor") || lowerContent.includes("rakip")) {
        isCompetitorsPhaseStarted = true;
        
        // Look for specific competitor mentions that indicate we found competitors
        if (lowerContent.includes("loewe") || lowerContent.includes("technisat") || 
            lowerContent.includes("another competitor is") || lowerContent.includes("second competitor")) {
          competitorCount = Math.max(competitorCount, 1);
        }
        
        // If we see "should I keep a note" that means we have 2nd competitor
        if (lowerContent.includes("should i keep a note") || lowerContent.includes("keep a note")) {
          competitorCount = 2;
        }
      }
      
      // Detect customers phase and count customers
      if (lowerContent.includes("customer") || lowerContent.includes("müşteri")) {
        isCustomersPhaseStarted = true;
        
        // Count customers by looking for company names with websites
        const customerPattern = /[A-Z][a-zA-Z\s&\.]+\s*\(https?:\/\/[^)]+\)/g;
        const matches = content.match(customerPattern);
        if (matches) {
          customerCount = Math.min(matches.length, 2); // Max 2 customers
        }
        
        // Also check for specific customer mentions
        if (lowerContent.includes("mediamarkt") || lowerContent.includes("saturn") || lowerContent.includes("potential customer")) {
          customerCount = Math.max(customerCount, 1);
        }
      }
    }
    
    if (message.role === "user" && message.content) {
      const content = message.content.toLowerCase();
      
      // Check if user responded to "keep a note" question - if so, we should move to customers
      if (competitorCount === 2) {
        // Look for recent assistant message with "keep a note"
        const recentAssistantMessages = messages.filter(msg => msg.role === "assistant").slice(-3);
        const hasKeepNoteQuestion = recentAssistantMessages.some(msg => {
          const msgContent = typeof msg.content === 'string' ? msg.content : 
                            Array.isArray(msg.content) ? msg.content.map((c: any) => c.text || '').join(' ') : '';
          return msgContent.toLowerCase().includes("should i keep a note");
        });
        
        if (hasKeepNoteQuestion && (content.includes("yes") || content.includes("no") || content.includes("evet") || content.includes("hayır"))) {
          // User responded to keep note question, mark competitors as complete
          state.competitorsComplete = true;
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
      
      // Check if keywords were confirmed
      if (isKeywordsPhaseStarted && (content.includes("evet") || content.includes("yes") || content.includes("tanımlar"))) {
        isKeywordsConfirmed = true;
        state.keywords = ["placeholder"]; // Mark as collected
      }
      
      // Try to extract email
      const emailMatch = message.content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch && !state.email) {
        state.email = emailMatch[0];
      }
      
      // Try to extract phone
      const phoneMatch = message.content.match(/[\+]?[1-9][\d]{3,14}/);
      if (phoneMatch && !state.phone) {
        state.phone = phoneMatch[0];
      }
      
      // Try to extract name (simple heuristic)
      if (!state.name && content.includes("ozgur") || content.includes("goksu")) {
        state.name = "Özgür Göksu";
      }
      
      // Extract GTIP code if mentioned
      if (content.includes("070610") || content.includes("gtip")) {
        state.gtipCode = "070610";
      }
      
      // Extract sales channels
      if (content.includes("hepsi") || content.includes("all")) {
        state.salesChannels = ["all"];
      }
      
      // Extract website
      if (content.includes("www.") || content.includes(".com")) {
        const websiteMatch = message.content.match(/(www\.[^\s]+|[^\s]+\.(com|org|net|ai))/);
        if (websiteMatch) {
          state.website = websiteMatch[0];
        }
      }
    }
  }

  // Determine current phase based on conversation progress
  if (!state.product) {
    state.phase = state.userStartedWithProduct ? "country" : "product";
  } else if (!state.country) {
    state.phase = "country";
  } else if (!state.gtipCode) {
    state.phase = "gtip";
  } else if (!state.salesChannels) {
    state.phase = "sales_channels";
  } else if (!state.website) {
    state.phase = "website";
  } else if (!state.name) {
    state.phase = "name";
  } else if (!state.email) {
    state.phase = "email";
  } else if (!state.phone) {
    state.phase = "phone";
  } else if (!isKeywordsConfirmed) {
    state.phase = "keywords";
  } else if (!isCompetitorsPhaseStarted) {
    state.phase = "competitors";
  } else if (isCompetitorsPhaseStarted && !state.competitorsComplete) {
    // Check if we just asked "Should we consider another competitor?" and user responded
    const lastUserMessage = userMessages[userMessages.length - 1]?.content?.toLowerCase() || '';
    const hasConsiderAnotherQuestion = messages.some(msg => 
      msg.role === "assistant" && 
      (msg.content as string)?.toLowerCase().includes("should we consider another competitor")
    );
    
    if (hasConsiderAnotherQuestion && (lastUserMessage.includes('yes') || lastUserMessage.includes('evet'))) {
      // User said yes to "consider another competitor" - stay in competitors to show second competitor
      state.phase = "competitors";
    } else if (competitorCount >= 2 || state.competitorsComplete) {
      // We have 2 competitors or user completed competitors phase - move to customers
      state.phase = "customers";
    } else {
      state.phase = "competitors";
    }
  } else if (!isCustomersPhaseStarted || customerCount === 0) {
    state.phase = "customers";
  } else if (isCustomersPhaseStarted && customerCount >= 1) {
    // Check if we just asked "Should we consider another customer?" and user responded
    const lastUserMessage = userMessages[userMessages.length - 1]?.content?.toLowerCase() || '';
    const hasConsiderAnotherCustomerQuestion = messages.some(msg => 
      msg.role === "assistant" && 
      (msg.content as string)?.toLowerCase().includes("should we consider another customer")
    );
    
    if (hasConsiderAnotherCustomerQuestion && (lastUserMessage.includes('yes') || lastUserMessage.includes('evet'))) {
      // User said yes to "consider another customer" - stay in customers to show second customer
      state.phase = "customers";
    } else if (customerCount >= 2) {
      // We have 2 customers - move to demo
      state.phase = "demo";
    } else {
      state.phase = "customers";
    }
  } else {
    state.phase = "demo";
  }

  // Set competitor/customer data if found
  if (competitorCount > 0) {
    state.competitors = [{ name: "Italcaroten S.r.l.", website: "https://www.italcaroten.it" }];
  }
  if (customerCount > 0) {
    state.customers = [{ name: "Sample Customer", website: "https://example.com" }];
  }

  return state;
}

export async function POST(request: Request) {
  try {
    const { messages, toolsState } = await request.json();

    const tools = await getTools(toolsState);

    console.log("Tools:", tools);
    console.log("Received messages:", messages);

    // Extract conversation state from messages (now async with AI analysis)
    const conversationState = await extractConversationState(messages);
    console.log("Conversation state:", conversationState);

    const openai = new OpenAI();

    const events = await openai.responses.create({
      model: MODEL,
      input: messages,
      instructions: getDeveloperPrompt(conversationState),
      tools,
      stream: true,
      parallel_tool_calls: false,
    });

    // Create a ReadableStream that emits SSE data
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of events) {
            // CRITICAL: Filter out Wikipedia links from text content
            if (event.type === 'response.content_part.added') {
              if (event.part && 'text' in event.part && event.part.text) {
                // Remove any Wikipedia links and parenthetical comments
                let originalText = event.part.text;
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
                
                // Update the event with filtered text
                event.part.text = filteredText;
                
                if (originalText !== filteredText) {
                  console.log('🧹 FILTERED Wikipedia/comments from response');
                }
              }
            }
            
            // Sending all events to the client
            const data = JSON.stringify({
              event: event.type,
              data: event,
            });
            controller.enqueue(`data: ${data}\n\n`);
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
