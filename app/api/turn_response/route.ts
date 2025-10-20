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

// Smart conversation analyzer based on user message patterns
function detectCountryFromConversation(messages: any[]): string | null {
  const userMessages = messages.filter(msg => msg.role === "user" && msg.content);
  
  console.log('🔍 ANALYZING USER MESSAGES FOR COUNTRY...');
  console.log(`👤 User messages: ${userMessages.map(msg => `"${msg.content}"`).join(', ')}`);
  
  // If we have 2+ user messages, the second one is likely the country response
  // Pattern: User says product → Assistant asks country → User says country
  if (userMessages.length >= 2) {
    const secondMessage = userMessages[1].content.trim();
    console.log(`🔍 ANALYZING SECOND USER MESSAGE AS POTENTIAL COUNTRY: "${secondMessage}"`);
    
    // Check if it's a reasonable country response (not too long, not a common rejection)
    if (secondMessage.length > 1 && secondMessage.length < 50 && 
        !secondMessage.toLowerCase().includes("don't know") &&
        !secondMessage.toLowerCase().includes("not sure") &&
        !secondMessage.toLowerCase().includes("no") &&
        !secondMessage.toLowerCase().includes("yes")) {
      console.log(`✅ DETECTED COUNTRY FROM USER MESSAGE PATTERN: "${secondMessage}"`);
      return secondMessage.toLowerCase();
    }
  }
  
  console.log(`❌ NO COUNTRY DETECTED FROM USER MESSAGE PATTERN`);
  return null;
}

// Analyze GTIP conversation completion - handles the full GTIP flow
function analyzeGtipConversationCompletion(messages: any[]): { isCompleted: boolean; status: string; details: any } {
  console.log('🔍 ANALYZING GTIP CONVERSATION COMPLETION...');
  
  // Helper function to extract text content from message
  function extractMessageContent(msg: any): string {
    if (!msg) return '';
    if (typeof msg.content === 'string') return msg.content;
    if (Array.isArray(msg.content)) {
      return msg.content.map((c: any) => {
        if (typeof c === 'string') return c;
        if (c.text) return c.text;
        if (c.type === 'output_text' && c.text) return c.text;
        return '';
      }).join(' ').trim();
    }
    return '';
  }

  // Since assistant messages might not be in the conversation history,
  // we need to analyze based on user message patterns and conversation flow
  const userMessages = messages.filter(msg => msg && msg.role === 'user');
  console.log(`👤 Found ${userMessages.length} user messages for GTIP analysis`);
  
  if (userMessages.length < 3) {
    console.log('❌ Not enough user messages for GTIP analysis');
    return { isCompleted: false, status: "not_started", details: {} };
  }

  // GTIP conversation pattern analysis based on user message sequence:
  // Message 1: Product (carrot)
  // Message 2: Country (italy) 
  // Message 3: GTIP knowledge response (no/yes)
  // Message 4: GTIP suggestion response (yes/no) - if user said "no" to knowledge
  
  const gtipKnowledgeResponse = userMessages[2] ? extractMessageContent(userMessages[2]).toLowerCase().trim() : '';
  console.log(`🔍 GTIP Knowledge Response (Message 3): "${gtipKnowledgeResponse}"`);
  
  let gtipSuggestionResponse = '';
  if (userMessages.length >= 4) {
    gtipSuggestionResponse = extractMessageContent(userMessages[3]).toLowerCase().trim();
    console.log(`🔍 GTIP Suggestion Response (Message 4): "${gtipSuggestionResponse}"`);
  }
  
  console.log(`🔗 Analyzing GTIP conversation based on user message patterns`);
  
  let knowledgeStatus = null;
  let suggestionStatus = null;
  
  // Analyze GTIP knowledge response (3rd user message)
  if (gtipKnowledgeResponse.includes("yes") || gtipKnowledgeResponse.includes("evet") || gtipKnowledgeResponse.includes("know") || gtipKnowledgeResponse.includes("biliyorum")) {
    knowledgeStatus = "knows";
    console.log(`✅ User KNOWS GTIP code`);
  } else if (gtipKnowledgeResponse.includes("no") || gtipKnowledgeResponse.includes("hayır") || gtipKnowledgeResponse.includes("don't") || gtipKnowledgeResponse.includes("bilmiyorum")) {
    knowledgeStatus = "unknown";
    console.log(`❌ User DOESN'T KNOW GTIP code`);
  } else {
    knowledgeStatus = "unclear";
    console.log(`❓ User gave unclear response to GTIP knowledge question`);
  }
  
  // Analyze GTIP suggestion response (4th user message, if exists)
  if (gtipSuggestionResponse) {
    if (gtipSuggestionResponse.includes("yes") || gtipSuggestionResponse.includes("evet") || gtipSuggestionResponse.includes("ok") || gtipSuggestionResponse.includes("use") || gtipSuggestionResponse.includes("can")) {
      suggestionStatus = "accepted";
      console.log(`✅ User ACCEPTED suggested GTIP code`);
    } else if (gtipSuggestionResponse.includes("no") || gtipSuggestionResponse.includes("hayır") || gtipSuggestionResponse.includes("don't")) {
      suggestionStatus = "rejected";
      console.log(`❌ User REJECTED suggested GTIP code`);
    } else {
      suggestionStatus = "unclear";
      console.log(`❓ User gave unclear response to GTIP suggestion`);
    }
  }
  
  // Determine if GTIP conversation is completed based on user message patterns
  let isCompleted = false;
  let status = "not_started";
  const details = {
    userMessageCount: userMessages.length,
    knowledgeResponse: knowledgeStatus,
    suggestionResponse: suggestionStatus,
    gtipKnowledgeMessage: gtipKnowledgeResponse,
    gtipSuggestionMessage: gtipSuggestionResponse
  };
  
  if (knowledgeStatus) {
    if (knowledgeStatus === "knows") {
      // User knows GTIP - conversation is completed
      isCompleted = true;
      status = "user_knows_gtip";
    } else if (knowledgeStatus === "unknown") {
      // User doesn't know - check if they responded to suggestion
      if (suggestionStatus) {
        // User responded to suggestion - conversation is completed
        isCompleted = true;
        status = suggestionStatus === "accepted" ? "suggestion_accepted" : "suggestion_rejected";
      } else {
        // User said they don't know, but no suggestion response yet
        // Check if we have 4+ messages (suggesting bot asked suggestion and user responded)
  if (userMessages.length >= 4) {
          // Assume 4th message is response to suggestion
          isCompleted = true;
          status = suggestionStatus || "suggestion_responded";
        } else {
          // Still waiting for suggestion response
          isCompleted = false;
          status = "waiting_for_suggestion_response";
        }
      }
    } else {
      // Unclear response to knowledge question
      isCompleted = false;
      status = "unclear_knowledge_response";
    }
  } else {
    // No clear GTIP knowledge response detected yet
    isCompleted = false;
    status = "no_gtip_response_yet";
  }
  
  console.log(`🎯 GTIP CONVERSATION ANALYSIS RESULT:`);
  console.log(`   📊 Is Completed: ${isCompleted}`);
  console.log(`   📋 Status: ${status}`);
  console.log(`   🔍 Details:`, details);
  
  return { isCompleted, status, details };
}

// Analyze Sales Channels conversation completion
function analyzeSalesChannelsConversationCompletion(messages: any[]): { isCompleted: boolean; status: string; details: any } {
  console.log('🔍 ANALYZING SALES CHANNELS CONVERSATION COMPLETION...');
  
  // Helper function to extract text content from message
  function extractMessageContent(msg: any): string {
    if (!msg) return '';
    if (typeof msg.content === 'string') return msg.content;
    if (Array.isArray(msg.content)) {
      return msg.content.map((c: any) => {
        if (typeof c === 'string') return c;
        if (c.text) return c.text;
        if (c.type === 'output_text' && c.text) return c.text;
        return '';
      }).join(' ').trim();
    }
    return '';
  }

  const userMessages = messages.filter(msg => msg && msg.role === 'user');
  console.log(`👤 Found ${userMessages.length} user messages for Sales Channels analysis`);
  
  if (userMessages.length < 5) {
    console.log('❌ Not enough user messages for Sales Channels analysis (need at least 5)');
    return { isCompleted: false, status: "not_started", details: {} };
  }

  // Sales Channels conversation pattern analysis based on user message sequence:
  // Message 1: Product (carrot)
  // Message 2: Country (italy) 
  // Message 3: GTIP knowledge response (no)
  // Message 4: GTIP suggestion response (yes we can use)
  // Message 5: Sales channels response (importers is okey for me)
  
  const salesChannelsResponse = userMessages[4] ? extractMessageContent(userMessages[4]).toLowerCase().trim() : '';
  console.log(`🔍 Sales Channels Response (Message 5): "${salesChannelsResponse}"`);
  
  let isCompleted = false;
  let status = "not_started";
  
  if (salesChannelsResponse) {
    // Any response to sales channels question completes the phase
    isCompleted = true;
    status = "sales_channels_provided";
    console.log(`✅ User provided sales channels response`);
  } else {
    isCompleted = false;
    status = "waiting_for_sales_channels_response";
    console.log(`❌ No sales channels response detected yet`);
  }
  
  const details = {
    userMessageCount: userMessages.length,
    salesChannelsMessage: salesChannelsResponse,
    responseProvided: !!salesChannelsResponse
  };
  
  console.log(`🎯 SALES CHANNELS CONVERSATION ANALYSIS RESULT:`);
  console.log(`   📊 Is Completed: ${isCompleted}`);
  console.log(`   📋 Status: ${status}`);
  console.log(`   🔍 Details:`, details);
  
  return { isCompleted, status, details };
}

// Analyze Keywords conversation completion
function analyzeKeywordsConversationCompletion(messages: any[]): { isCompleted: boolean; status: string; details: any } {
  console.log('🔑 ANALYZING KEYWORDS CONVERSATION COMPLETION...');
  
  // Helper function to extract text content from message
  function extractMessageContent(msg: any): string {
    if (!msg) return '';
    if (typeof msg.content === 'string') return msg.content;
    if (Array.isArray(msg.content)) {
      return msg.content.map((c: any) => {
        if (typeof c === 'string') return c;
        if (c.text) return c.text;
        if (c.type === 'output_text' && c.text) return c.text;
        return '';
      }).join(' ').trim();
    }
    return '';
  }

  const userMessages = messages.filter(msg => msg && msg.role === 'user');
  console.log(`👤 Found ${userMessages.length} user messages for Keywords analysis`);
  
  if (userMessages.length < 10) {
    console.log('❌ Not enough user messages for Keywords analysis (need at least 10)');
    return { isCompleted: false, status: "not_started", details: {} };
  }

  // Keywords conversation pattern analysis based on user message sequence:
  // Message 1: Product (patato)
  // Message 2: Country (japan) 
  // Message 3: GTIP knowledge response (no)
  // Message 4: GTIP suggestion response (yes)
  // Message 5: Sales channels response (all of them)
  // Message 6: Website (www.ab.com)
  // Message 7: Name (ozgur goksu)
  // Message 8: Email (ozgur@athlos.ai)
  // Message 9: Phone (532 234 12 52)
  // Message 10: Keywords response (all of them / 1 and 3 okey for me)
  
  let keywordsResponse = '';
  let keywordsAccepted = false;
  
  // Look for keywords responses in messages 10+ (index 9+)
  for (let i = 9; i < userMessages.length; i++) {
    const response = extractMessageContent(userMessages[i]).toLowerCase().trim();
    console.log(`🔍 Checking Keywords Response (Message ${i + 1}): "${response}"`);
    
    if (response) {
      // Check for positive keywords acceptance
      const positiveResponses = [
        "yes", "evet", "ok", "okay", "good", "iyi", "great", "perfect", 
        "describes", "tanımlar", "correct", "doğru", "right", "suitable", 
        "uygun", "fine", "tamam", "all of them", "hepsi", "1 and 3", "2 and 3",
        "okey for me", "benim için uygun", "these are good", "bunlar iyi",
        "1 and 2", "2 and 1", "1 and 3 okey", "they describe"
      ];
      
      // Check for positive acceptance
      for (const positive of positiveResponses) {
        if (response.includes(positive)) {
          keywordsResponse = userMessages[i].content ? extractMessageContent(userMessages[i]) : '';
          keywordsAccepted = true;
          console.log(`✅ KEYWORDS ACCEPTED: User response="${keywordsResponse}" (matched: "${positive}")`);
          break;
        }
      }
      
      // If we found an accepted response, we're done
      if (keywordsAccepted) break;
      
      // If not accepted but there's a response, it still counts as completion
      if (response.length > 0) {
        keywordsResponse = userMessages[i].content ? extractMessageContent(userMessages[i]) : '';
        console.log(`📝 KEYWORDS RESPONSE DETECTED: "${keywordsResponse}"`);
        break;
      }
    }
  }
  
  let isCompleted = false;
  let status = "not_started";
  
  if (keywordsResponse) {
    isCompleted = true;
    status = keywordsAccepted ? "keywords_accepted" : "keywords_responded";
    console.log(`✅ Keywords conversation completed with status: ${status}`);
  } else {
    isCompleted = false;
    status = "waiting_for_keywords_response";
    console.log(`❌ No keywords response detected yet`);
  }
  
  const details = {
    userMessageCount: userMessages.length,
    keywordsMessage: keywordsResponse,
    accepted: keywordsAccepted,
    responseProvided: !!keywordsResponse
  };
  
  console.log(`🎯 KEYWORDS CONVERSATION ANALYSIS RESULT:`);
  console.log(`   📊 Is Completed: ${isCompleted}`);
  console.log(`   📋 Status: ${status}`);
  console.log(`   🔍 Details:`, details);
  
  return { isCompleted, status, details };
}

// Analyze Competitors conversation completion
function analyzeCompetitorsConversationCompletion(messages: any[]): { isCompleted: boolean; status: string; details: any } {
  console.log('🏢 ANALYZING COMPETITORS CONVERSATION COMPLETION...');
  
  // Helper function to extract text content from message
  function extractMessageContent(msg: any): string {
    if (!msg) return '';
    if (typeof msg.content === 'string') return msg.content;
    if (Array.isArray(msg.content)) {
      return msg.content.map((c: any) => {
        if (typeof c === 'string') return c;
        if (c.text) return c.text;
        if (c.type === 'output_text' && c.text) return c.text;
        return '';
      }).join(' ').trim();
    }
    return '';
  }

  const userMessages = messages.filter(msg => msg && msg.role === 'user');
  const assistantMessages = messages.filter(msg => msg && msg.role === 'assistant');
  
  console.log(`👤 Found ${userMessages.length} user messages for Competitors analysis`);
  console.log(`🤖 Found ${assistantMessages.length} assistant messages for Competitors analysis`);
  
  if (userMessages.length < 11) {
    console.log('❌ Not enough user messages for Competitors analysis (need at least 11)');
    return { isCompleted: false, status: "not_started", details: {} };
  }

  // Competitors conversation pattern analysis:
  // After keywords completion, competitors phase starts
  // Multiple competitor suggestions can be made, each requiring user response
  // Phase completes when user has responded to at least one competitor suggestion
  
  let competitorQuestionsFound = 0;
  let competitorResponsesFound = 0;
  let lastCompetitorResponse = '';
  let hasAcceptedCompetitors = false;
  
  // Look for competitor questions in assistant messages
  for (const assistantMsg of assistantMessages) {
    const assistantContent = extractMessageContent(assistantMsg).toLowerCase();
    
    if (assistantContent.includes('competitors like') || assistantContent.includes('rakipler') ||
        (assistantContent.includes('competitor') && assistantContent.includes('keep a note')) ||
        assistantContent.includes('should i keep a note of these competitors')) {
      competitorQuestionsFound++;
      console.log(`🏢 COMPETITOR QUESTION ${competitorQuestionsFound} FOUND: "${assistantContent.substring(0, 100)}..."`);
    }
  }
  
  // Look for competitor responses in user messages (starting from message 11+)
  for (let i = 10; i < userMessages.length; i++) {
    const response = extractMessageContent(userMessages[i]).toLowerCase().trim();
    console.log(`🔍 Checking Competitor Response (Message ${i + 1}): "${response}"`);
    
    if (response) {
      // Check for competitor response patterns
      const acceptResponses = [
        "yes", "evet", "ok", "okay", "keep", "note", "save", "kaydet", 
        "use", "can", "good", "sure", "you can use", "yes you can"
      ];
      const rejectResponses = [
        "no", "hayır", "don't", "not", "skip", "don't want"
      ];
      
      // Check for acceptance
      for (const accept of acceptResponses) {
        if (response.includes(accept)) {
          competitorResponsesFound++;
          lastCompetitorResponse = extractMessageContent(userMessages[i]);
          hasAcceptedCompetitors = true;
          console.log(`✅ COMPETITOR ACCEPTED (Response ${competitorResponsesFound}): "${lastCompetitorResponse}" (matched: "${accept}")`);
          break;
        }
      }
      
      // Check for rejection (still counts as response)
      if (!hasAcceptedCompetitors) {
        for (const reject of rejectResponses) {
          if (response.includes(reject)) {
            competitorResponsesFound++;
            lastCompetitorResponse = extractMessageContent(userMessages[i]);
            console.log(`❌ COMPETITOR REJECTED (Response ${competitorResponsesFound}): "${lastCompetitorResponse}" (matched: "${reject}")`);
            break;
          }
        }
      }
    }
  }
  
  // Competitors phase is completed if:
  // 1. At least one competitor question was asked AND at least one user response was given
  // 2. OR if we have enough user messages and detect competitor response pattern (fallback)
  let isCompleted = false;
  let status = "not_started";
  
  if (competitorQuestionsFound > 0 && competitorResponsesFound > 0) {
    isCompleted = true;
    status = hasAcceptedCompetitors ? "competitors_accepted" : "competitors_responded";
    console.log(`✅ Competitors conversation completed with status: ${status}`);
  } else if (competitorQuestionsFound > 0) {
    isCompleted = false;
    status = "waiting_for_competitor_response";
    console.log(`❌ Waiting for competitor response (${competitorQuestionsFound} questions asked, ${competitorResponsesFound} responses given)`);
  } else {
    // FALLBACK: If no assistant messages found but we have user responses in competitor position
    // This handles the case where assistant messages aren't being sent to backend
    if (userMessages.length >= 11) {
      // Check if message 11+ contains competitor response patterns
      for (let i = 10; i < userMessages.length; i++) {
        const response = extractMessageContent(userMessages[i]).toLowerCase().trim();
        const acceptResponses = [
          "yes", "evet", "ok", "okay", "keep", "note", "save", "kaydet", 
          "use", "can", "good", "sure", "you can use", "yes you can"
        ];
        
        for (const accept of acceptResponses) {
          if (response.includes(accept)) {
            isCompleted = true;
            status = "competitors_accepted";
            lastCompetitorResponse = extractMessageContent(userMessages[i]);
            hasAcceptedCompetitors = true;
            console.log(`✅ FALLBACK: Competitors completed based on user message pattern at position ${i + 1}: "${response}"`);
            break;
          }
        }
        if (isCompleted) break;
      }
    }
    
    if (!isCompleted) {
      isCompleted = false;
      status = "not_started";
      console.log(`❌ Competitors phase not started yet`);
    }
  }
  
  const details = {
    userMessageCount: userMessages.length,
    competitorQuestionsFound,
    competitorResponsesFound,
    lastResponse: lastCompetitorResponse,
    hasAccepted: hasAcceptedCompetitors
  };
  
  console.log(`🎯 COMPETITORS CONVERSATION ANALYSIS RESULT:`);
  console.log(`   📊 Is Completed: ${isCompleted}`);
  console.log(`   📋 Status: ${status}`);
  console.log(`   🔍 Details:`, details);
  
  return { isCompleted, status, details };
}

// Analyze Customers conversation completion
function analyzeCustomersConversationCompletion(messages: any[]): { isCompleted: boolean; status: string; details: any } {
  console.log('👥 ANALYZING CUSTOMERS CONVERSATION COMPLETION...');
  
  // Helper function to extract text content from message
  function extractMessageContent(msg: any): string {
    if (!msg) return '';
    if (typeof msg.content === 'string') return msg.content;
    if (Array.isArray(msg.content)) {
      return msg.content.map((c: any) => {
        if (typeof c === 'string') return c;
        if (c.text) return c.text;
        if (c.type === 'output_text' && c.text) return c.text;
        return '';
      }).join(' ').trim();
    }
    return '';
  }

  const userMessages = messages.filter(msg => msg && msg.role === 'user');
  const assistantMessages = messages.filter(msg => msg && msg.role === 'assistant');
  
  console.log(`👤 Found ${userMessages.length} user messages for Customers analysis`);
  console.log(`🤖 Found ${assistantMessages.length} assistant messages for Customers analysis`);
  
  if (userMessages.length < 12) {
    console.log('❌ Not enough user messages for Customers analysis (need at least 12)');
    return { isCompleted: false, status: "not_started", details: {} };
  }

  // Customers conversation pattern analysis:
  // After competitors completion, customers phase starts
  // Multiple customer suggestions can be made, each requiring user response
  // Phase completes when user has responded to at least one customer suggestion
  
  let customerQuestionsFound = 0;
  let customerResponsesFound = 0;
  let lastCustomerResponse = '';
  let hasAcceptedCustomers = false;
  
  // Look for customer questions in assistant messages
  for (const assistantMsg of assistantMessages) {
    const assistantContent = extractMessageContent(assistantMsg).toLowerCase();
    
    if (assistantContent.includes('customers like') || assistantContent.includes('müşteriler') ||
        (assistantContent.includes('customer') && assistantContent.includes('keep a note')) ||
        assistantContent.includes('should i keep a note of these customers')) {
      customerQuestionsFound++;
      console.log(`👥 CUSTOMER QUESTION ${customerQuestionsFound} FOUND: "${assistantContent.substring(0, 100)}..."`);
    }
  }
  
  // Look for customer responses in user messages (starting from message 12+)
  for (let i = 11; i < userMessages.length; i++) {
    const response = extractMessageContent(userMessages[i]).toLowerCase().trim();
    console.log(`🔍 Checking Customer Response (Message ${i + 1}): "${response}"`);
    
    if (response) {
      // Check for customer response patterns
      const acceptResponses = [
        "yes", "evet", "ok", "okay", "keep", "note", "save", "kaydet", 
        "use", "can", "good", "sure", "you can use", "yes you can"
      ];
      const rejectResponses = [
        "no", "hayır", "don't", "not", "skip", "don't want"
      ];
      
      // Check for acceptance
      for (const accept of acceptResponses) {
        if (response.includes(accept)) {
          customerResponsesFound++;
          lastCustomerResponse = extractMessageContent(userMessages[i]);
          hasAcceptedCustomers = true;
          console.log(`✅ CUSTOMER ACCEPTED (Response ${customerResponsesFound}): "${lastCustomerResponse}" (matched: "${accept}")`);
          break;
        }
      }
      
      // Check for rejection (still counts as response)
      if (!hasAcceptedCustomers) {
        for (const reject of rejectResponses) {
          if (response.includes(reject)) {
            customerResponsesFound++;
            lastCustomerResponse = extractMessageContent(userMessages[i]);
            console.log(`❌ CUSTOMER REJECTED (Response ${customerResponsesFound}): "${lastCustomerResponse}" (matched: "${reject}")`);
            break;
          }
        }
      }
    }
  }
  
  // Customers phase is completed if:
  // 1. At least one customer question was asked AND at least one user response was given
  // 2. OR if we have enough user messages and detect customer response pattern (fallback)
  let isCompleted = false;
  let status = "not_started";
  
  if (customerQuestionsFound > 0 && customerResponsesFound > 0) {
    isCompleted = true;
    status = hasAcceptedCustomers ? "customers_accepted" : "customers_responded";
    console.log(`✅ Customers conversation completed with status: ${status}`);
  } else if (customerQuestionsFound > 0) {
    isCompleted = false;
    status = "waiting_for_customer_response";
    console.log(`❌ Waiting for customer response (${customerQuestionsFound} questions asked, ${customerResponsesFound} responses given)`);
  } else {
    // FALLBACK: If no assistant messages found but we have user responses in customer position
    // This handles the case where assistant messages aren't being sent to backend
    if (userMessages.length >= 12) {
      // Check if message 12+ contains customer response patterns
      for (let i = 11; i < userMessages.length; i++) {
        const response = extractMessageContent(userMessages[i]).toLowerCase().trim();
        const acceptResponses = [
          "yes", "evet", "ok", "okay", "keep", "note", "save", "kaydet", 
          "use", "can", "good", "sure", "you can use", "yes you can"
        ];
        
        for (const accept of acceptResponses) {
          if (response.includes(accept)) {
            isCompleted = true;
            status = "customers_accepted";
            lastCustomerResponse = extractMessageContent(userMessages[i]);
            hasAcceptedCustomers = true;
            console.log(`✅ FALLBACK: Customers completed based on user message pattern at position ${i + 1}: "${response}"`);
            break;
          }
        }
        if (isCompleted) break;
      }
    }
    
    if (!isCompleted) {
      isCompleted = false;
      status = "not_started";
      console.log(`❌ Customers phase not started yet`);
    }
  }
  
  const details = {
    userMessageCount: userMessages.length,
    customerQuestionsFound,
    customerResponsesFound,
    lastResponse: lastCustomerResponse,
    hasAccepted: hasAcceptedCustomers
  };
  
  console.log(`🎯 CUSTOMERS CONVERSATION ANALYSIS RESULT:`);
  console.log(`   📊 Is Completed: ${isCompleted}`);
  console.log(`   📋 Status: ${status}`);
  console.log(`   🔍 Details:`, details);
  
  return { isCompleted, status, details };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function detectGtipFromConversation(messages: any[]): string | null {
  // Use the new comprehensive analysis
  const gtipAnalysis = analyzeGtipConversationCompletion(messages);
  
  if (gtipAnalysis.isCompleted) {
    return gtipAnalysis.status;
  }
  
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function detectInfoFromConversation(messages: any[], questionType: string, patterns: any[] | null): string | null {
  const userMessages = messages.filter(msg => msg.role === "user" && msg.content);
  const allUserText = userMessages.map(msg => msg.content).join(" ").toLowerCase();
  
  console.log(`🔍 ANALYZING USER MESSAGES FOR ${questionType.toUpperCase()}...`);
  console.log(`👤 All user text: "${allUserText}"`);
  
  // If no patterns specified, look for any reasonable response after the expected position
  if (!patterns) {
    // For different info types, check different message positions
    const expectedPosition = getExpectedMessagePosition(questionType);
    if (userMessages.length > expectedPosition) {
      const responseMsg = userMessages[expectedPosition].content.trim();
      if (responseMsg.length > 0) {
        console.log(`✅ ${questionType.toUpperCase()} PROVIDED FROM USER MESSAGE PATTERN: "${responseMsg}"`);
        return "provided";
      }
    }
  } else {
    // Check if any user message matches the patterns
    for (const pattern of patterns) {
      if (typeof pattern === 'string') {
        if (allUserText.includes(pattern)) {
          console.log(`✅ ${questionType.toUpperCase()} PROVIDED FROM USER MESSAGE PATTERN (matched: ${pattern})`);
          return "provided";
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(allUserText)) {
          console.log(`✅ ${questionType.toUpperCase()} PROVIDED FROM USER MESSAGE PATTERN (matched regex)`);
          return "provided";
        }
      }
    }
  }
  
  console.log(`❌ NO ${questionType.toUpperCase()} DETECTED FROM USER MESSAGE PATTERN`);
  return null;
}

function getExpectedMessagePosition(questionType: string): number {
  // Expected user message positions based on conversation flow
  const positions: { [key: string]: number } = {
    "sales channel": 4, // After product, country, gtip knowledge, gtip acceptance
    "website": 5,
    "name": 6,
    "email": 7,
    "phone": 8
  };
  return positions[questionType] || 5; // Default position
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function detectKeywordsFromConversation(messages: any[]): string | null {
  const userMessages = messages.filter(msg => msg.role === "user" && msg.content);
  
  console.log('🔍 ANALYZING USER MESSAGES FOR KEYWORDS RESPONSE...');
  console.log(`👤 User messages: ${userMessages.map(msg => `"${msg.content}"`).join(', ')}`);
  
  // Look for keywords acceptance patterns in user messages
  // Keywords typically come after: product, country, gtip, sales channels, website, name, email, phone
  // So keywords response should be around message 9+
  
  for (let i = 8; i < userMessages.length; i++) { // Start from message 9 (index 8)
    const userMessage = userMessages[i].content.toLowerCase().trim();
    console.log(`🔍 ANALYZING USER MESSAGE ${i + 1} FOR KEYWORDS RESPONSE: "${userMessage}"`);
    
    // Check for positive keywords acceptance
    const positiveResponses = [
      "yes", "evet", "ok", "okay", "good", "iyi", "great", "perfect", 
      "describes", "tanımlar", "correct", "doğru", "right", "suitable", 
      "uygun", "fine", "tamam", "its describes", "they describe", 
      "yes its describes", "these are good", "bunlar iyi"
    ];
    
    const negativeResponses = [
      "no", "hayır", "not good", "iyi değil", "wrong", "yanlış", 
      "doesn't describe", "tanımlamıyor", "not suitable", "uygun değil",
      "change", "değiştir", "different", "farklı"
    ];
    
    // Check for positive acceptance
    for (const positive of positiveResponses) {
      if (userMessage.includes(positive)) {
        console.log(`✅ DETECTED KEYWORDS ACCEPTED FROM USER MESSAGE PATTERN (matched: "${positive}")`);
        return "accepted";
      }
    }
    
    // Check for negative rejection (which should still lead to new keywords and eventual acceptance)
    for (const negative of negativeResponses) {
      if (userMessage.includes(negative)) {
        console.log(`❌ DETECTED KEYWORDS REJECTED FROM USER MESSAGE PATTERN (matched: "${negative}")`);
        // Continue looking for acceptance in later messages after new keywords are suggested
        continue;
      }
    }
  }
  
  console.log(`❌ NO KEYWORDS RESPONSE DETECTED FROM USER MESSAGE PATTERN`);
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function detectCompetitorsFromConversation(messages: any[]): string | null {
  const userMessages = messages.filter(msg => msg.role === "user" && msg.content);
  
  console.log('🔍 ANALYZING USER MESSAGES FOR COMPETITORS RESPONSE...');
  console.log(`👤 User messages: ${userMessages.map(msg => `"${msg.content}"`).join(', ')}`);
  
  // Look for competitors response patterns in user messages
  // Competitors come after keywords, so should be around message 10+
  
  for (let i = 9; i < userMessages.length; i++) { // Start from message 10 (index 9)
    const userMessage = userMessages[i].content.toLowerCase().trim();
    console.log(`🔍 ANALYZING USER MESSAGE ${i + 1} FOR COMPETITORS RESPONSE: "${userMessage}"`);
    
    // Check for competitors response (yes/no to "keep a note")
    const acceptResponses = ["yes", "evet", "ok", "okay", "keep", "note", "save", "kaydet", "use", "can", "good", "sure"];
    const rejectResponses = ["no", "hayır", "don't", "not", "skip", "don't want"];
    
    // Check for acceptance
    for (const accept of acceptResponses) {
      if (userMessage.includes(accept)) {
        console.log(`✅ DETECTED COMPETITORS ACCEPTED FROM USER MESSAGE PATTERN (matched: "${accept}")`);
        return "accepted";
      }
    }
    
    // Check for rejection
    for (const reject of rejectResponses) {
      if (userMessage.includes(reject)) {
        console.log(`❌ DETECTED COMPETITORS REJECTED FROM USER MESSAGE PATTERN (matched: "${reject}")`);
        return "rejected";
      }
    }
  }
  
  console.log(`❌ NO COMPETITORS RESPONSE DETECTED FROM USER MESSAGE PATTERN`);
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function detectCustomersFromConversation(messages: any[]): string | null {
  const userMessages = messages.filter(msg => msg.role === "user" && msg.content);
  
  console.log('🔍 ANALYZING USER MESSAGES FOR CUSTOMERS RESPONSE...');
  console.log(`👤 User messages: ${userMessages.map(msg => `"${msg.content}"`).join(', ')}`);
  
  // Look for customers response patterns in user messages
  // Customers come after competitors, so should be around message 11+
  
  for (let i = 10; i < userMessages.length; i++) { // Start from message 11 (index 10)
    const userMessage = userMessages[i].content.toLowerCase().trim();
    console.log(`🔍 ANALYZING USER MESSAGE ${i + 1} FOR CUSTOMERS RESPONSE: "${userMessage}"`);
    
    // Check for customers response (yes/no to "keep a note")
    const acceptResponses = ["yes", "evet", "ok", "okay", "keep", "note", "save", "kaydet", "use", "can", "good", "sure"];
    const rejectResponses = ["no", "hayır", "don't", "not", "skip", "don't want"];
    
    // Check for acceptance
    for (const accept of acceptResponses) {
      if (userMessage.includes(accept)) {
        console.log(`✅ DETECTED CUSTOMERS ACCEPTED FROM USER MESSAGE PATTERN (matched: "${accept}")`);
        return "accepted";
      }
    }
    
    // Check for rejection
    for (const reject of rejectResponses) {
      if (userMessage.includes(reject)) {
        console.log(`❌ DETECTED CUSTOMERS REJECTED FROM USER MESSAGE PATTERN (matched: "${reject}")`);
        return "rejected";
      }
    }
  }
  
  console.log(`❌ NO CUSTOMERS RESPONSE DETECTED FROM USER MESSAGE PATTERN`);
  return null;
}

// Advanced conversation context analyzer - analyzes full conversation including bot messages
function analyzeFullConversation(messages: any[]): any {
  console.log('🔍 ADVANCED CONVERSATION ANALYSIS - Analyzing full conversation context...');
  console.log(`📊 Total messages: ${messages.length}`);
  
  // Debug: Show all messages and their roles
  console.log('📋 ALL MESSAGES RECEIVED:');
  messages.forEach((msg, index) => {
    console.log(`  [${index}] Role: ${msg?.role || 'undefined'}, Type: ${msg?.type || 'undefined'}`);
    if (msg?.content) {
      const content = typeof msg.content === 'string' ? msg.content : 
                     Array.isArray(msg.content) ? msg.content.map((c: any) => c.text || c).join(' ') : 'complex';
      console.log(`       Content: "${content.substring(0, 80)}..."`);
    }
  });
  
  const analysis: any = {
    gtip: null,
    salesChannels: null,
    website: null,
    name: null,
    email: null,
    phone: null,
    keywords: null
  };
  
  // Helper function to extract text content from message
  function extractMessageContent(msg: any): string {
    if (!msg) return '';
    
    // Handle different message formats
    if (typeof msg.content === 'string') {
      return msg.content;
    }
    
    if (Array.isArray(msg.content)) {
      return msg.content.map((c: any) => {
        if (typeof c === 'string') return c;
        if (c.text) return c.text;
        if (c.type === 'output_text' && c.text) return c.text;
        return '';
      }).join(' ').trim();
    }
    
    return '';
  }
  
  // Create conversation pairs: [assistant question] → [user response]
  const conversationPairs = [];
  
  for (let i = 0; i < messages.length - 1; i++) {
    const currentMsg = messages[i];
    const nextMsg = messages[i + 1];
    
    // More flexible message filtering - check for role instead of type
    if (!currentMsg || !currentMsg.role || !nextMsg || !nextMsg.role) {
      continue;
    }
    
    // Look for assistant → user pairs
    if (currentMsg.role === "assistant" && nextMsg.role === "user") {
      const question = extractMessageContent(currentMsg);
      const response = extractMessageContent(nextMsg);
      
      console.log(`🔍 POTENTIAL PAIR FOUND: Assistant[${i}] → User[${i+1}]`);
      console.log(`   Question: "${question.substring(0, 100)}..."`);
      console.log(`   Response: "${response.substring(0, 50)}..."`);
      
      if (question && response) {
        conversationPairs.push({
          question: question,
          response: response,
          questionIndex: i,
          responseIndex: i + 1
        });
        console.log(`✅ PAIR ADDED: Total pairs now: ${conversationPairs.length}`);
      } else {
        console.log(`❌ PAIR SKIPPED: Empty question or response`);
      }
    }
  }
  
  console.log(`🔗 Found ${conversationPairs.length} conversation pairs`);
  
  // Analyze each conversation pair
  for (const pair of conversationPairs) {
    const question = pair.question.toLowerCase();
    const response = pair.response.toLowerCase();
    
    console.log(`🔍 ANALYZING PAIR: Q: "${question.substring(0, 50)}..." → R: "${response}"`);
    
    // GTIP Analysis - Removed from here, now handled by analyzeGtipConversationCompletion()
    // This function now focuses on other conversation elements
    
    // Sales Channels Analysis - ANY response completes the phase
    if (!analysis.salesChannels && (question.includes("sales channel") || question.includes("satış kanal"))) {
      // ANY response to sales channels question completes the phase
      if (response.trim().length > 0) {
        analysis.salesChannels = "provided";
        console.log(`✅ SALES CHANNELS COMPLETED: User responded: "${response}"`);
      }
    }
    
    // Website Analysis - ANY response completes the phase
    if (!analysis.website && (question.includes("website") || question.includes("websiten"))) {
      // ANY response to website question completes the phase
      if (response.trim().length > 0) {
        analysis.website = "provided";
        console.log(`✅ WEBSITE COMPLETED: User responded: "${response}"`);
      }
    }
    
    // Name Analysis - ANY response completes the phase
    if (!analysis.name && (question.includes("name") || question.includes("isim"))) {
      // ANY response to name question completes the phase
      if (response.trim().length > 0) {
        analysis.name = "provided";
        console.log(`✅ NAME COMPLETED: User responded: "${response}"`);
      }
    }
    
    // Email Analysis - ANY response completes the phase
    if (!analysis.email && (question.includes("email") || question.includes("e-posta"))) {
      // ANY response to email question completes the phase
      if (response.trim().length > 0) {
        analysis.email = "provided";
        console.log(`✅ EMAIL COMPLETED: User responded: "${response}"`);
      }
    }
    
    // Phone Analysis - ANY response completes the phase
    if (!analysis.phone && (question.includes("phone") || question.includes("telefon"))) {
      // ANY response to phone question completes the phase
      if (response.trim().length > 0) {
        analysis.phone = "provided";
        console.log(`✅ PHONE COMPLETED: User responded: "${response}"`);
      }
    }
    
    // Keywords Analysis - ANY response completes the phase
    if (!analysis.keywords && (question.includes("keywords") || question.includes("anahtar"))) {
      // ANY response to keywords question completes the phase
      if (response.trim().length > 0) {
        const positiveWords = ["yes", "evet", "good", "iyi", "ok", "describes", "tanımlar", "perfect", "suitable", "right", "correct", "yep", "yeah"];
        const negativeWords = ["no", "hayır", "not good", "wrong", "change", "different"];
        
        const hasPositive = positiveWords.some(word => response.includes(word));
        const hasNegative = negativeWords.some(word => response.includes(word));
        
        if (hasPositive) {
          analysis.keywords = "accepted";
          console.log(`✅ KEYWORDS ACCEPTED: User accepted keywords: "${response}"`);
        } else if (hasNegative) {
          analysis.keywords = "rejected";
          console.log(`❌ KEYWORDS REJECTED: User rejected keywords: "${response}"`);
        } else {
          // Any other response still completes the phase
          analysis.keywords = "responded";
          console.log(`✅ KEYWORDS COMPLETED: User responded: "${response}"`);
        }
      }
    }
  }
  
  console.log('🎯 ADVANCED ANALYSIS RESULTS:', analysis);
  return analysis;
}

// Smart phase system based on collected vs suggested information
// Smart phase detection based on what the bot is currently asking
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function detectCurrentPhaseFromBotQuestion(messages: any[]): { step: number; phase: string; progress: number } {
  console.log('🔍 BOT-QUESTION-BASED PHASE DETECTION - Analyzing what bot is asking...');
  console.log(`📊 Total messages received: ${messages.length}`);
  
  // Helper function to extract text content from message
  function extractMessageContent(msg: any): string {
    if (!msg) return '';
    
    if (typeof msg.content === 'string') {
      return msg.content;
    }
    
    if (Array.isArray(msg.content)) {
      return msg.content.map((c: any) => {
        if (typeof c === 'string') return c;
        if (c.text) return c.text;
        if (c.type === 'output_text' && c.text) return c.text;
        return '';
      }).join(' ').trim();
    }
    
    return '';
  }
  
  // Find the last assistant message to understand current phase
  let lastAssistantMessage = '';
  let assistantMessageCount = 0;
  
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    // More flexible filtering - check for role instead of type
    if (msg && msg.role === 'assistant') {
      assistantMessageCount++;
      if (!lastAssistantMessage) {
        lastAssistantMessage = extractMessageContent(msg).toLowerCase();
        console.log(`🤖 Found assistant message at index ${i}: "${lastAssistantMessage.substring(0, 100)}..."`);
        break;
      }
    }
  }
  
  console.log(`📊 Total assistant messages found: ${assistantMessageCount}`);
  
  console.log(`🤖 Last bot question: "${lastAssistantMessage.substring(0, 100)}..."`);
  
  // Phase detection based on bot's current question
  if (!lastAssistantMessage) {
    console.log('🎯 NO BOT MESSAGE YET - Analyzing user context to predict next bot question...');
    
    // If no bot messages yet, predict what the bot SHOULD ask next based on user messages
    const userMessages = messages.filter(msg => msg && msg.role === 'user');
    console.log(`👤 Found ${userMessages.length} user messages for context analysis`);
    
    if (userMessages.length >= 4) {
      // User has provided: product, country, GTIP response, and more
      console.log('🎯 USER PROVIDED 4+ MESSAGES - Bot should ask about SALES_CHANNELS next');
      return { step: 3, phase: 'SALES_CHANNELS', progress: 25 };
    } else if (userMessages.length >= 3) {
      // User has provided: product, country, and GTIP response
      console.log('🎯 USER PROVIDED 3 MESSAGES - Bot should ask about SALES_CHANNELS next');
      return { step: 3, phase: 'SALES_CHANNELS', progress: 25 };
    } else if (userMessages.length >= 2) {
      // User has provided: product and country
      console.log('🎯 USER PROVIDED 2 MESSAGES - Bot should ask about GTIP next');
      return { step: 2, phase: 'GTIP', progress: 20 };
    } else if (userMessages.length >= 1) {
      // User has provided: product only
      console.log('🎯 USER PROVIDED 1 MESSAGE - Bot should ask about COUNTRY next');
      return { step: 1, phase: 'COUNTRY', progress: 10 };
        } else {
      // No user messages yet
      console.log('🎯 NO USER MESSAGES YET - Phase: INITIAL');
      return { step: 0, phase: 'INITIAL', progress: 0 };
    }
  }
  
  // GTIP Phase Detection (20% progress) - Only if GTIP conversation is NOT completed
  const gtipKeywords = [
    'gtip', 'hs code', 'shall we use', 'kullanalım mı', 'gtip code', 'gtip kod',
    'do you know', 'biliyor musunuz', 'gtip kodu', 'tariff code', 'gümrük kodu',
    'use this code', 'bu kodu', 'suggested code', 'önerilen kod'
  ];
  
  const hasGtipKeyword = gtipKeywords.some(keyword => lastAssistantMessage.includes(keyword));
  
  if (hasGtipKeyword) {
    // Check if GTIP conversation is actually completed by analyzing full conversation
    const gtipConversationStatus = analyzeGtipConversationCompletion(messages);
    
    if (!gtipConversationStatus.isCompleted) {
    console.log('🎯 BOT IS ASKING ABOUT GTIP - Phase: GTIP (20%)');
      console.log(`🔍 Matched GTIP keywords: ${gtipKeywords.filter(k => lastAssistantMessage.includes(k)).join(', ')}`);
      console.log(`📊 GTIP Status: ${gtipConversationStatus.status} - Conversation not completed yet`);
    return { step: 2, phase: 'GTIP', progress: 20 };
    } else {
      console.log('🎯 GTIP CONVERSATION COMPLETED - Moving to next phase');
      console.log(`📊 GTIP Final Status: ${gtipConversationStatus.status}`);
      // Don't return GTIP phase, let it fall through to next phase detection
    }
  }
  
  // Sales Channels Phase Detection (25% progress) - Only if Sales Channels conversation is NOT completed
  const salesChannelsKeywords = [
    'sales channel', 'satış kanal', 'wholesaler', 'importer', 'distributor', 
    'toptan', 'perakende', 'retail', 'what sales', 'hangi satış',
    'channels do you use', 'kanal kullan', 'selling method', 'satış yöntemi',
    'how do you sell', 'nasıl satıyorsunuz', 'distribution channel', 'dağıtım kanalı',
    'bu ürünü hangi', 'this product', 'satış kanalları', 'sales channels'
  ];
  
  const hasSalesChannelsKeyword = salesChannelsKeywords.some(keyword => lastAssistantMessage.includes(keyword));
  const hasExampleWithChannels = lastAssistantMessage.includes('for example') && 
    (lastAssistantMessage.includes('wholesaler') || lastAssistantMessage.includes('importer') || lastAssistantMessage.includes('distributor'));
  const hasChannelExamples = lastAssistantMessage.includes('toptancılar') || lastAssistantMessage.includes('ithalatçılar') || lastAssistantMessage.includes('distribütörler');
  
  if (hasSalesChannelsKeyword || hasExampleWithChannels || hasChannelExamples) {
    // Check if Sales Channels conversation is actually completed
    const salesChannelsConversationStatus = analyzeSalesChannelsConversationCompletion(messages);
    
    if (!salesChannelsConversationStatus.isCompleted) {
    console.log('🎯 BOT IS ASKING ABOUT SALES CHANNELS - Phase: SALES_CHANNELS (25%)');
      console.log('🛒 SALES CHANNELS DETECTED - Bot is asking about sales channel options');
    console.log(`🔍 Matched keywords: ${salesChannelsKeywords.filter(k => lastAssistantMessage.includes(k)).join(', ')}`);
      console.log(`📊 Sales Channels Status: ${salesChannelsConversationStatus.status} - Conversation not completed yet`);
    return { step: 3, phase: 'SALES_CHANNELS', progress: 25 };
    } else {
      console.log('🎯 SALES CHANNELS CONVERSATION COMPLETED - Moving to next phase');
      console.log(`📊 Sales Channels Final Status: ${salesChannelsConversationStatus.status}`);
      // Don't return SALES_CHANNELS phase, let it fall through to next phase detection
    }
  }
  
  // Website Phase Detection (40% progress)
  if (lastAssistantMessage.includes('website') || lastAssistantMessage.includes('websiten') ||
      lastAssistantMessage.includes('web site') || lastAssistantMessage.includes('domain')) {
    console.log('🎯 BOT IS ASKING ABOUT WEBSITE - Phase: WEBSITE (40%)');
    return { step: 4, phase: 'WEBSITE', progress: 40 };
  }
  
  // Name Phase Detection
  if (lastAssistantMessage.includes('name') || lastAssistantMessage.includes('isim') ||
      lastAssistantMessage.includes('your name') || lastAssistantMessage.includes('adınız')) {
    console.log('🎯 BOT IS ASKING ABOUT NAME - Phase: NAME');
    return { step: 5, phase: 'NAME', progress: 45 };
  }
  
  // Email Phase Detection
  if (lastAssistantMessage.includes('email') || lastAssistantMessage.includes('e-posta') ||
      lastAssistantMessage.includes('mail') || lastAssistantMessage.includes('corporate email')) {
    console.log('🎯 BOT IS ASKING ABOUT EMAIL - Phase: EMAIL');
    return { step: 6, phase: 'EMAIL', progress: 50 };
  }
  
  // Phone Phase Detection
  if (lastAssistantMessage.includes('phone') || lastAssistantMessage.includes('telefon') ||
      lastAssistantMessage.includes('number') || lastAssistantMessage.includes('numara')) {
    console.log('🎯 BOT IS ASKING ABOUT PHONE - Phase: PHONE');
    return { step: 7, phase: 'PHONE', progress: 55 };
  }
  
  // Keywords Phase Detection (60% progress)
  if (lastAssistantMessage.includes('keyword') || lastAssistantMessage.includes('anahtar') ||
      lastAssistantMessage.includes('describe') || lastAssistantMessage.includes('tanımlar')) {
    console.log('🎯 BOT IS ASKING ABOUT KEYWORDS - Phase: KEYWORDS (60%)');
    return { step: 8, phase: 'KEYWORDS', progress: 60 };
  }
  
  // Competitors Phase Detection (80% progress)
  if (lastAssistantMessage.includes('competitor') || lastAssistantMessage.includes('rakip') ||
      lastAssistantMessage.includes('competition') || lastAssistantMessage.includes('keep a note')) {
    console.log('🎯 BOT IS ASKING ABOUT COMPETITORS - Phase: COMPETITORS (80%)');
    return { step: 9, phase: 'COMPETITORS', progress: 80 };
  }
  
  // Customers Phase Detection
  if (lastAssistantMessage.includes('customer') || lastAssistantMessage.includes('müşteri') ||
      lastAssistantMessage.includes('potential customer') || lastAssistantMessage.includes('potansiyel müşteri')) {
    console.log('🎯 BOT IS ASKING ABOUT CUSTOMERS - Phase: CUSTOMERS');
    return { step: 10, phase: 'CUSTOMERS', progress: 90 };
  }
  
  // Demo Phase Detection (100% progress)
  if (lastAssistantMessage.includes('demo') || lastAssistantMessage.includes('meeting') ||
      lastAssistantMessage.includes('call') || lastAssistantMessage.includes('schedule') ||
      lastAssistantMessage.includes('calendly') || lastAssistantMessage.includes('summary')) {
    console.log('🎯 BOT IS ASKING ABOUT DEMO/MEETING - Phase: DEMO (100%)');
    return { step: 11, phase: 'DEMO', progress: 100 };
  }
  
  // Country Phase Detection (if asking about country)
  if (lastAssistantMessage.includes('country') || lastAssistantMessage.includes('ülke') ||
      lastAssistantMessage.includes('which country') || lastAssistantMessage.includes('hangi ülke')) {
    console.log('🎯 BOT IS ASKING ABOUT COUNTRY - Phase: COUNTRY');
    return { step: 1, phase: 'COUNTRY', progress: 10 };
  }
  
  // Default: Try to detect from conversation flow
  console.log('🎯 COULD NOT DETECT FROM BOT QUESTION - Using fallback detection');
  return { step: 0, phase: 'INITIAL', progress: 0 };
}

function getConversationPhase(messages: any[], collectedInfo: any): { phase: string; step: number; progress: number } {
  console.log('🔍 SMART PHASE ANALYSIS - Using information-based detection...');
  
  // ALWAYS use information-based detection (PRIMARY METHOD)
  // This ensures we progress based on what information we have, not what the bot is asking
  console.log('📊 Using INFORMATION-BASED detection as primary method');
  
  const userMessages = messages.filter(msg => msg.role === "user" && msg.content);
  const assistantMessages = messages.filter(msg => msg.role === "assistant" && msg.content);
  
  console.log(`👤 User messages: ${userMessages.length}, 🤖 Assistant messages: ${assistantMessages.length}`);
  
  // Phase configuration is now handled by milestone detection logic below
  // COUNTRY=20%, SALES_CHANNELS=40%, PHONE=60%, COMPETITORS=80%, DEMO=100%
  
  console.log('📊 COLLECTED INFO STATUS:');
  console.log(`  Product: ${collectedInfo.product ? '✅' : '❌'} ${collectedInfo.product || ''}`);
  console.log(`  Country: ${collectedInfo.country ? '✅' : '❌'} ${collectedInfo.country || ''}`);
  console.log(`  GTIP: ${collectedInfo.gtip ? '✅' : '❌'} ${collectedInfo.gtip || ''}`);
  console.log(`  Sales Channels: ${collectedInfo.salesChannels ? '✅' : '❌'} ${collectedInfo.salesChannels || ''}`);
  console.log(`  Website: ${collectedInfo.website ? '✅' : '❌'} ${collectedInfo.website || ''}`);
  console.log(`  Name: ${collectedInfo.name ? '✅' : '❌'} ${collectedInfo.name || ''}`);
  console.log(`  Email: ${collectedInfo.email ? '✅' : '❌'} ${collectedInfo.email || ''}`);
  console.log(`  Phone: ${collectedInfo.phone ? '✅' : '❌'} ${collectedInfo.phone || ''}`);
  console.log(`  Keywords: ${collectedInfo.keywords ? '✅' : '❌'} ${collectedInfo.keywords || ''}`);
  console.log(`  Competitors: ${collectedInfo.competitors ? '✅' : '❌'} ${collectedInfo.competitors || ''}`);
  console.log(`  Customers: ${collectedInfo.customers ? '✅' : '❌'} ${collectedInfo.customers || ''}`);
  
  // Find the first missing information - Enhanced logic
  let currentStep = 0;
  let currentPhase = "INITIAL";
  let currentProgress = 0;
  
  console.log('🔍 MILESTONE ANALYSIS - Finding highest milestone reached:');
  
  // Find the highest milestone percentage reached
  let highestMilestone = 0;
  let currentMilestonePhase = "INITIAL";
  
  // Check milestones in order and find the highest one reached
  if (collectedInfo.competitors) {
    highestMilestone = 80;
    currentMilestonePhase = "COMPETITORS";
    console.log(`✅ COMPETITORS milestone reached: 80%`);
  } else if (collectedInfo.phone) {
    highestMilestone = 60;
    currentMilestonePhase = "PHONE";
    console.log(`✅ PHONE milestone reached: 60%`);
  } else if (collectedInfo.salesChannels) {
    highestMilestone = 40;
    currentMilestonePhase = "SALES_CHANNELS";
    console.log(`✅ SALES_CHANNELS milestone reached: 40%`);
  } else if (collectedInfo.country) {
    highestMilestone = 20;
    currentMilestonePhase = "COUNTRY";
    console.log(`✅ COUNTRY milestone reached: 20%`);
  } else {
    highestMilestone = 0;
    currentMilestonePhase = "INITIAL";
    console.log(`❌ No milestones reached yet: 0%`);
  }
  
  // Check for demo phase (100%) - when both competitors and customers are complete
  if (collectedInfo.competitors && collectedInfo.customers) {
    highestMilestone = 100;
    currentMilestonePhase = "DEMO";
    console.log(`✅ DEMO milestone reached: 100%`);
  }
  
  // Set the results
  currentProgress = highestMilestone;
  currentPhase = currentMilestonePhase;
  currentStep = Math.floor(highestMilestone / 20); // Convert percentage to step number
  
  console.log(`🎯 FALLBACK PHASE RESULT: Step ${currentStep}/12 - ${currentPhase} (${currentProgress}%)`);
  return { phase: currentPhase, step: currentStep, progress: currentProgress };
}

// Simplified conversation state using efficient phase system
async function getConversationState(messages: any[]) {
  console.log('🚀 CONVERSATION STATE ANALYSIS STARTING...');
  console.log(`📊 Total messages: ${messages.length}`);
  
  // Extract ALL information from conversation (both collected and suggested)
  const userMessages = messages.filter(msg => msg.role === "user" && msg.content);
  const assistantMessages = messages.filter(msg => msg.role === "assistant" && msg.content);
  const allUserText = userMessages.map(msg => msg.content).join(" ").toLowerCase();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const allAssistantText = assistantMessages.map(msg => 
    typeof msg.content === 'string' ? msg.content : ''
  ).join(" ").toLowerCase();
  
  const collectedInfo: any = {
    // COLLECTED from user
    product: null,
    country: null, 
    website: null,
    name: null,
    email: null,
    phone: null,
    
    // SUGGESTED by assistant and accepted/rejected by user
    gtip: null,
    salesChannels: null, 
    keywords: null,
    competitors: null,
    customers: null
  };
  
  console.log('📊 EXTRACTING INFORMATION FROM CONVERSATION...');
  
  // 1. PRODUCT (collect from user)
  for (const userMsg of userMessages) {
    if (!collectedInfo.product) {
      try {
        const analysis = await analyzeUserMessage(userMsg.content);
        if (analysis.isProduct && analysis.productName) {
          collectedInfo.product = analysis.productName;
          console.log(`📦 PRODUCT COLLECTED: "${analysis.productName}"`);
          break;
        }
      } catch {
        // Ignore errors
      }
    }
  }
  
  // 2. COUNTRY (collect from user) - Smart detection from conversation flow
  collectedInfo.country = detectCountryFromConversation(messages);
  if (collectedInfo.country) {
    console.log(`🌍 COUNTRY COLLECTED: "${collectedInfo.country}"`);
  }
  
  // 3. GTIP (suggest by assistant, accept/reject by user) - Use comprehensive analysis
  const gtipAnalysis = analyzeGtipConversationCompletion(messages);
  if (gtipAnalysis.isCompleted) {
    collectedInfo.gtip = gtipAnalysis.status;
    console.log(`🔢 GTIP COMPLETED: Status="${gtipAnalysis.status}"`);
  }
  
  // 4. SALES CHANNELS (suggest by assistant, accept/reject by user) - Use comprehensive analysis
  const salesChannelsAnalysis = analyzeSalesChannelsConversationCompletion(messages);
  if (salesChannelsAnalysis.isCompleted) {
    collectedInfo.salesChannels = salesChannelsAnalysis.status;
    console.log(`🛒 SALES CHANNELS COMPLETED: Status="${salesChannelsAnalysis.status}"`);
  }
  
  // 5. KEYWORDS (suggest by assistant, accept/reject by user) - Use comprehensive analysis
  const keywordsAnalysis = analyzeKeywordsConversationCompletion(messages);
  if (keywordsAnalysis.isCompleted) {
    collectedInfo.keywords = keywordsAnalysis.status;
    console.log(`🔑 KEYWORDS COMPLETED: Status="${keywordsAnalysis.status}"`);
  }
  
  // 6. WEBSITE - Extract from user messages
  if (!collectedInfo.website && userMessages.length >= 6) {
    const websiteMsg = userMessages[5]?.content?.toLowerCase() || '';
    if (websiteMsg.includes('.com') || websiteMsg.includes('.net') || websiteMsg.includes('www.') || 
        websiteMsg.includes('.org') || websiteMsg.includes('.co')) {
      collectedInfo.website = userMessages[5].content.trim();
      console.log(`🌐 WEBSITE DETECTED: "${collectedInfo.website}"`);
    }
  }
  
  // 7. NAME - Extract from user messages
  if (!collectedInfo.name && userMessages.length >= 7) {
    const nameMsg = userMessages[6]?.content?.trim() || '';
    if (nameMsg && nameMsg.length > 1 && !nameMsg.includes('@') && !nameMsg.includes('.com')) {
      collectedInfo.name = nameMsg;
      console.log(`👤 NAME DETECTED: "${collectedInfo.name}"`);
    }
  }
  
  // 8. EMAIL - Extract from user messages
  if (!collectedInfo.email && userMessages.length >= 8) {
    const emailMsg = userMessages[7]?.content?.toLowerCase() || '';
    if (emailMsg.includes('@')) {
      collectedInfo.email = userMessages[7].content.trim();
      console.log(`📧 EMAIL DETECTED: "${collectedInfo.email}"`);
    }
  }
  
  // 9. PHONE - Extract from user messages
  if (!collectedInfo.phone && userMessages.length >= 9) {
    const phoneMsg = userMessages[8]?.content?.trim() || '';
    if (phoneMsg && /\d{3,}/.test(phoneMsg)) {
      collectedInfo.phone = phoneMsg;
      console.log(`📱 PHONE DETECTED: "${collectedInfo.phone}"`);
    }
  }
  
  // 10-12. ADVANCED CONVERSATION CONTEXT ANALYSIS for other phases
  // Analyze the full conversation to detect completed phases
  const conversationAnalysis = analyzeFullConversation(messages);
  
  // Use conversation analysis for keywords if not already set
  if (!collectedInfo.keywords && conversationAnalysis.keywords) {
  collectedInfo.keywords = conversationAnalysis.keywords;
  }
  
  // Log what was detected
  if (collectedInfo.gtip) {
    if (typeof collectedInfo.gtip === 'object') {
      console.log(`🔢 GTIP ${collectedInfo.gtip.status.toUpperCase()}: Code="${collectedInfo.gtip.code || 'none'}", Source="${collectedInfo.gtip.source}"`);
    } else {
      console.log(`🔢 GTIP ${collectedInfo.gtip.toUpperCase()}`);
    }
  }
  if (collectedInfo.salesChannels) console.log(`🛒 SALES CHANNELS ${collectedInfo.salesChannels.toUpperCase()}`);
  if (collectedInfo.website) console.log(`🌐 WEBSITE ${collectedInfo.website.toUpperCase()}`);
  if (collectedInfo.name) console.log(`👤 NAME ${collectedInfo.name.toUpperCase()}`);
  if (collectedInfo.email) console.log(`📧 EMAIL ${collectedInfo.email.toUpperCase()}`);
  if (collectedInfo.phone) console.log(`📱 PHONE ${collectedInfo.phone.toUpperCase()}`);
  if (collectedInfo.keywords) console.log(`🔑 KEYWORDS ${collectedInfo.keywords.toUpperCase()}`);
  
  // 10. COMPETITORS (suggest by assistant, accept/reject by user) - Use comprehensive analysis
  const competitorsAnalysis = analyzeCompetitorsConversationCompletion(messages);
  if (competitorsAnalysis.isCompleted) {
    collectedInfo.competitors = competitorsAnalysis.status;
    console.log(`🏢 COMPETITORS COMPLETED: Status="${competitorsAnalysis.status}"`);
  }
  
  // 11. CUSTOMERS (suggest by assistant, accept/reject by user) - Use comprehensive analysis
  const customersAnalysis = analyzeCustomersConversationCompletion(messages);
  if (customersAnalysis.isCompleted) {
    collectedInfo.customers = customersAnalysis.status;
    console.log(`👥 CUSTOMERS COMPLETED: Status="${customersAnalysis.status}"`);
  }
  
  // Now get phase info with collected information
  const phaseInfo = getConversationPhase(messages, collectedInfo);
  
  const state: any = {
    detectedLanguage: 'turkish', // Default to Turkish
    userStartedWithProduct: !!collectedInfo.product,
    currentPhase: phaseInfo.phase,
    currentStep: phaseInfo.step,
    progress: phaseInfo.progress || 0,
    product: collectedInfo.product,
    country: collectedInfo.country,
    // Add all collected information
    collectedInfo: collectedInfo
  };
  
  console.log(`📍 PHASE INFO: Step ${phaseInfo.step}/12 - ${phaseInfo.phase} (${phaseInfo.progress || 0}%)`);

  // Detect language from first message
  if (userMessages.length > 0) {
    const firstMessage = userMessages[0].content;
    console.log(`🔤 ANALYZING FIRST MESSAGE FOR LANGUAGE: "${firstMessage}"`);
    
    try {
      const analysis = await analyzeUserMessage(firstMessage);
      state.detectedLanguage = analysis.language;
      console.log(`🌐 LANGUAGE DETECTED: ${analysis.language}`);
    } catch {
      console.log(`⚠️  AI ANALYSIS FAILED, USING FALLBACK`);
      state.detectedLanguage = /[çğıöşüÇĞIİÖŞÜ]/.test(allUserText) ? 'turkish' : 'english';
      console.log(`🌐 FALLBACK LANGUAGE DETECTED: ${state.detectedLanguage}`);
    }
  }

  console.log('🎯 FINAL CONVERSATION STATE:', {
    step: state.currentStep,
    phase: state.currentPhase,
    language: state.detectedLanguage,
    product: state.product || 'None',
    country: state.country || 'None',
    userStartedWithProduct: state.userStartedWithProduct
  });

  return state;
}


export async function POST(request: Request) {
  try {
    const { messages, toolsState } = await request.json();

    const tools = await getTools(toolsState);

    console.log("🚀 ITAI EXPORT ASSISTANT - API REQUEST RECEIVED");
    console.log("Tools:", tools);
    console.log("Received messages count:", messages?.length || 0);

    // Debug: Log message structure to understand the format
    if (messages && messages.length > 0) {
      console.log("🔍 MESSAGE STRUCTURE DEBUG:");
      console.log(`📊 Total messages received: ${messages.length}`);
      
      let userCount = 0;
      let assistantCount = 0;
      
      messages.forEach((msg: any, index: number) => {
        console.log(`  [${index}] Type: ${msg.type || 'undefined'}, Role: ${msg.role || 'undefined'}`);
        
        if (msg.role === 'user') userCount++;
        if (msg.role === 'assistant') assistantCount++;
        
        if (msg.content) {
      if (typeof msg.content === 'string') {
            console.log(`       Content: "${msg.content.substring(0, 50)}..."`);
      } else if (Array.isArray(msg.content)) {
            console.log(`       Content Array: ${msg.content.length} items`);
            msg.content.forEach((c: any, i: number) => {
              if (c.text) {
                console.log(`         [${i}] Text: "${c.text.substring(0, 50)}..."`);
              }
    });
      }
    }
      });
      
      console.log(`📊 MESSAGE SUMMARY: ${userCount} user messages, ${assistantCount} assistant messages`);
      
      if (assistantCount === 0) {
        console.log("⚠️  WARNING: No assistant messages found! This will cause conversation analysis to fail.");
        console.log("🔍 This suggests the conversation history is not being properly maintained.");
      }
    }

    // Get conversation state for flow guidance
    const conversationState = await getConversationState(messages);
    
    // Efficient phase debugging
    const phaseEmojis = ["🏁", "📦", "🌍", "🔢", "🛒", "🌐", "👤", "📧", "📱", "🔑", "🏢", "👥", "📅"];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const phaseNames = ["INITIAL", "PRODUCT", "COUNTRY", "GTIP", "SALES_CHANNELS", "WEBSITE", "NAME", "EMAIL", "PHONE", "KEYWORDS", "COMPETITORS", "CUSTOMERS", "DEMO"];
    
    const currentStep = conversationState.currentStep || 0;
    const currentPhase = conversationState.currentPhase || "INITIAL";
    const progress = conversationState.progress || 0;
    const emoji = phaseEmojis[currentStep] || "💬";
    const phaseName = currentPhase; // Use actual phase name, not array lookup
    
    console.log(`📍 CURRENT PHASE: ${emoji} Step ${currentStep}/12 - ${phaseName} (${progress}%)`);
    console.log(`🌐 Language: ${conversationState.detectedLanguage}`);
    console.log(`📦 Product: ${conversationState.product || 'None'}`);
    console.log(`🌍 Country: ${conversationState.country || 'None'}`);
    console.log(`🚀 User Started with Product: ${conversationState.userStartedWithProduct ? 'Yes' : 'No'}`);
    console.log(`📊 Information Collection Progress: ${progress}%`);
    
    // Show what should happen next based on current step
    const nextSteps = [
      "🏁 Ready to start - Ask for product name",
      "📦 Ask for target country", 
      "🌍 Ask for GTIP code",
      "🔢 Ask for sales channels",
      "🛒 Ask for website",
      "🌐 Ask for name",
      "👤 Ask for email",
      "📧 Ask for phone",
      "📱 Show keywords and ask for confirmation",
      "🔑 Show 2 competitors and ask to keep note",
      "🏢 Show 2 customers and ask to keep note",
      "👥 Offer demo and provide summary",
      "📅 Conversation complete!"
    ];
    
    const nextStep = Math.min(currentStep, nextSteps.length - 1);
    console.log(`⏭️  NEXT ACTION: ${nextSteps[nextStep]}`);

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

    // Send phase information first before streaming starts
    const phaseData = {
      event: "phase.update",
      data: {
        phase: currentPhase,
        step: currentStep,
        progress: progress,
        language: conversationState.detectedLanguage,
        collectedInfo: conversationState.collectedInfo
      }
    };

    // Create a ReadableStream that emits SSE data
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send phase information first
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(phaseData)}\n\n`)
          );
          for await (const chunk of events) {
            // Convert OpenAI chat completion chunks to the format frontend expects
            if (chunk.choices && chunk.choices[0]) {
              const delta = chunk.choices[0].delta;
              
              // Handle content delta
              if (delta.content) {
                // Send original content without any filtering
                const originalText = delta.content;
                
                // Only send if there's actual content
                if (originalText.length > 0) {
                // Convert to the format frontend expects
                const data = JSON.stringify({
                    event: 'response.output_text.delta',
                    data: {
                      delta: originalText,
                      item_id: 'assistant_message_1'
                    }
                  });
                  
                controller.enqueue(`data: ${data}\n\n`);
              }
            }
          }
          }
          
          // Send completion event
          const completionData = JSON.stringify({
            event: 'response.completed',
            data: {
              response: {
                output: []
              }
            }
          });
          controller.enqueue(`data: ${completionData}\n\n`);
          
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
