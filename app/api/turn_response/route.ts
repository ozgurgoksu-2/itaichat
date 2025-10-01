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

  // Track conversation progress and extract information
  let keywordsConfirmed = false;
  let competitorsSectionStarted = false;
  let customersSectionStarted = false;
  let competitorQuestionAsked = false;
  let customerQuestionAsked = false;
  
  for (const message of messages) {
    if (message.role === "assistant" && message.content) {
      const content = typeof message.content === 'string' ? message.content : 
                     Array.isArray(message.content) ? message.content.map((c: any) => c.text || '').join(' ') : '';
      const lowerContent = content.toLowerCase();
      
      // Check if keywords were asked
      if (lowerContent.includes("do these keywords describe") || lowerContent.includes("anahtar kelime")) {
        // Keywords section has started
      }
      
      // Check if we've started competitors section
      if (lowerContent.includes("competitor") && lowerContent.includes("right?")) {
        competitorsSectionStarted = true;
        competitorQuestionAsked = true;
      }
      
      // Check if we've started customers section
      if (lowerContent.includes("potential customer") || lowerContent.includes("müşteri")) {
        customersSectionStarted = true;
        customerQuestionAsked = true;
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
                const originalText = event.part.text;
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
