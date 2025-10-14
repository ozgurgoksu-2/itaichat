import { Item } from "@/lib/assistant";

export interface ConversationData {
  hasProduct: boolean;
  hasTargetMarket: boolean;
  hasGtipCode: boolean;
  hasSalesChannels: boolean;
  hasContactInfo: boolean;
  hasKeywords: boolean;
  hasCompetitors: boolean;
  hasCustomers: boolean;
  extractedData: {
    product?: string;
    country?: string;
    gtipCode?: string;
    salesChannels?: string[];
    website?: string;
    name?: string;
    email?: string;
    phone?: string;
    keywords?: string[];
    competitors?: Array<{name: string; website?: string}>;
    customers?: Array<{name: string; website?: string}>;
  };
}

export function analyzeConversationMessages(messages: Item[]): ConversationData {
  const data: ConversationData = {
    hasProduct: false,
    hasTargetMarket: false,
    hasGtipCode: false,
    hasSalesChannels: false,
    hasContactInfo: false,
    hasKeywords: false,
    hasCompetitors: false,
    hasCustomers: false,
    extractedData: {}
  };

  // Get conversation messages in order
  const conversationFlow: Array<{role: "user" | "assistant", content: string}> = [];

  messages.forEach(msg => {
    if (msg.type === "message") {
      let content = "";
      if (Array.isArray(msg.content)) {
        content = msg.content.map(c => c.text || "").join(" ").trim();
      } else if (typeof msg.content === "string") {
        content = msg.content;
      }

      if (msg.role === "user" || msg.role === "assistant") {
        conversationFlow.push({
          role: msg.role,
          content: content
        });
      }
    }
  });

  // Analyze conversation step by step following the actual conversation flow
  for (let i = 0; i < conversationFlow.length; i++) {
    const msg = conversationFlow[i];
    const nextMsg = i < conversationFlow.length - 1 ? conversationFlow[i + 1] : null;
    const content = msg.content.toLowerCase();

    // 1. PRODUCT - Look for assistant asking about product and user responding
    if (!data.hasProduct) {
      if (msg.role === "assistant" && nextMsg && nextMsg.role === "user") {
        // Assistant asks about product
        if (content.includes("which product") || content.includes("hangi ürün") || 
            content.includes("product do you want") || content.includes("ürününüzün ihracatını")) {
          // User responds with something (not empty, not just yes/no)
          const userResponse = nextMsg.content.trim().toLowerCase();
          if (userResponse.length > 2 && 
              !["yes", "no", "evet", "hayır", "ok"].includes(userResponse)) {
            data.hasProduct = true;
            data.extractedData.product = nextMsg.content.trim();
          }
        }
      }
      // Also check if user directly mentions a product
      else if (msg.role === "user") {
        // Check for common product patterns
        const productPatterns = [
          /\b(mobile phone|phone|smartphone|telefon)\b/,
          /\b(motorbike|motorcycle|motosiklet)\b/,
          /\b(textile|fabric|kumaş)\b/,
          /\b(watermelon|karpuz)\b/,
          /\b(tv|television|televizyon)\b/,
          /\b(apple|banana|muz|elma)\b/,
          /\b(wheat|buğday|corn|mısır)\b/,
          /\b(car|araba|automobile)\b/
        ];
        
        if (productPatterns.some(pattern => pattern.test(content))) {
          data.hasProduct = true;
          data.extractedData.product = msg.content.trim();
        }
      }
    }

    // 2. TARGET MARKET - Look for assistant asking about country and user responding
    if (!data.hasTargetMarket && data.hasProduct) {
      if (msg.role === "assistant" && nextMsg && nextMsg.role === "user") {
        // Assistant asks about country
        if (content.includes("which country") || content.includes("hangi ülke") || 
            content.includes("country do you want") || content.includes("ülkeye bu ürünü")) {
          // User responds with a country name
          const userResponse = nextMsg.content.trim().toLowerCase();
          const countries = [
            "germany", "almanya", "italy", "italya", "france", "fransa", 
            "usa", "america", "amerika", "spain", "ispanya", "uk", "ingiltere",
            "netherlands", "hollanda", "belgium", "belçika", "austria", "avusturya"
          ];
          
          if (countries.some(country => userResponse.includes(country)) || 
              userResponse.length > 2) { // Any reasonable response
            data.hasTargetMarket = true;
            data.extractedData.country = nextMsg.content.trim();
          }
        }
      }
      // Also check if user directly mentions a country
      else if (msg.role === "user") {
        const countries = ["germany", "almanya", "italy", "italya", "france", "fransa", "usa", "america", "amerika"];
        if (countries.some(country => content.includes(country))) {
          data.hasTargetMarket = true;
          data.extractedData.country = msg.content.trim();
        }
      }
    }

    // 3. GTIP CODE - Look for assistant asking about GTIP and user responding
    if (!data.hasGtipCode && data.hasTargetMarket) {
      if (msg.role === "assistant" && nextMsg && nextMsg.role === "user") {
        // Assistant asks about GTIP code
        if (content.includes("gtip code") || content.includes("gtip kod")) {
          // User responds (yes/no or actual code)
          const userResponse = nextMsg.content.trim().toLowerCase();
          if (userResponse.includes("yes") || userResponse.includes("evet") || 
              userResponse.includes("no") || userResponse.includes("hayır") ||
              /\b\d{4,6}\b/.test(userResponse)) {
            data.hasGtipCode = true;
            data.extractedData.gtipCode = nextMsg.content.trim();
          }
        }
      }
      // Also check if GTIP code is mentioned anywhere
      else if (content.includes("gtip") || /\b\d{6}\b/.test(content)) {
        data.hasGtipCode = true;
      }
    }

    // 4. SALES CHANNELS - Look for assistant asking about sales channels and user responding
    if (!data.hasSalesChannels && data.hasGtipCode) {
      if (msg.role === "assistant" && nextMsg && nextMsg.role === "user") {
        // Assistant asks about sales channels
        if (content.includes("sales channel") || content.includes("satış kanal")) {
          // User responds with channels
          const userResponse = nextMsg.content.trim().toLowerCase();
          const salesKeywords = ["wholesaler", "distributor", "importer", "all", "hepsi", "toptancı", "distribütör"];
          if (salesKeywords.some(keyword => userResponse.includes(keyword)) || 
              userResponse.length > 2) {
            data.hasSalesChannels = true;
            data.extractedData.salesChannels = [nextMsg.content.trim()];
          }
        }
      }
      // Also check if sales channels are mentioned directly
      else if (msg.role === "user") {
        const salesKeywords = ["wholesaler", "distributor", "importer", "all of them", "hepsi", "toptancı"];
        if (salesKeywords.some(keyword => content.includes(keyword))) {
          data.hasSalesChannels = true;
        }
      }
    }

    // 5. CONTACT INFO - Look for website, name, email, phone collection
    if (!data.hasContactInfo && data.hasSalesChannels) {
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const phonePattern = /[\+]?[0-9][\d\s\-\(\)]{7,15}/;
      
      if (msg.role === "user") {
        const hasEmail = emailPattern.test(content);
        const hasPhone = phonePattern.test(content);
        if (hasEmail || hasPhone) {
          data.hasContactInfo = true;
          if (hasEmail) {
            const emailMatch = content.match(emailPattern);
            data.extractedData.email = emailMatch ? emailMatch[0] : undefined;
          }
          if (hasPhone) {
            const phoneMatch = content.match(phonePattern);
            data.extractedData.phone = phoneMatch ? phoneMatch[0] : undefined;
          }
        }
      }
      // Check for assistant asking contact questions and user responding
      else if (msg.role === "assistant" && nextMsg && nextMsg.role === "user") {
        if (content.includes("phone number") || content.includes("telefon") ||
            content.includes("email") || content.includes("e-posta") ||
            content.includes("your name") || content.includes("isminiz") ||
            content.includes("website") || content.includes("websiten")) {
          // User provided some contact info
          data.hasContactInfo = true;
          
          // Extract specific info
          const userResponse = nextMsg.content.trim();
          if (content.includes("email") || content.includes("e-posta")) {
            data.extractedData.email = userResponse;
          } else if (content.includes("phone") || content.includes("telefon")) {
            data.extractedData.phone = userResponse;
          } else if (content.includes("name") || content.includes("isminiz")) {
            data.extractedData.name = userResponse;
          } else if (content.includes("website")) {
            data.extractedData.website = userResponse;
          }
        }
      }
    }

    // 6. KEYWORDS - Look for assistant asking about keywords and user responding (ANY response)
    // OR when competitors/customers phase starts (competitor/rakip mentioned)
    if (!data.hasKeywords && data.hasContactInfo) {
      if (msg.role === "assistant" && nextMsg && nextMsg.role === "user") {
        // Assistant asks about keywords
        if (content.includes("keywords describe") || content.includes("anahtar kelime") ||
            content.includes("do these keywords") || content.includes("bu anahtar kelimeler") ||
            content.includes("keywords") || content.includes("kelime")) {
          // User responds with ANY answer (not empty)
          const userResponse = nextMsg.content.trim();
          if (userResponse.length > 0) {
            data.hasKeywords = true;
            console.log("✅ Keywords detected - Assistant asked, user responded:", userResponse);
          }
        }
      }
      // Also check if keywords are mentioned anywhere in assistant messages
      else if (msg.role === "assistant" && (content.includes("keywords") || content.includes("kelime"))) {
        // If assistant mentions keywords and there's a conversation flow, mark as collected
        if (conversationFlow.length > 10) { // Ensure we're deep in conversation
          data.hasKeywords = true;
          console.log("✅ Keywords detected - Assistant mentioned keywords in conversation");
        }
      }
      // Keywords phase completes when competitor/rakip is mentioned (next phase starts)
      else if (msg.role === "assistant" && (content.includes("competitor") || content.includes("rakip"))) {
        data.hasKeywords = true;
        console.log("✅ Keywords phase completed - Competitors phase started");
      }
    }

    // 7. COMPETITORS - Look for assistant presenting competitors (more flexible)
    if (!data.hasCompetitors && data.hasKeywords) {
      if (msg.role === "assistant") {
        // Assistant presents competitors - look for competitor mentions
        if (content.includes("competitor") || content.includes("rakip")) {
          data.hasCompetitors = true;
          console.log("✅ Competitors detected - Assistant mentioned competitors");
          
          // Try to extract competitor info if websites are present
          if (content.includes("www.") || content.includes("http") || content.includes(".com")) {
            const competitorMatches = msg.content.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/g);
            if (competitorMatches) {
              data.extractedData.competitors = competitorMatches.map(match => {
                const parts = match.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/);
                return parts ? { name: parts[1].trim(), website: parts[2].trim() } : null;
              }).filter(Boolean) as Array<{name: string; website: string}>;
            }
          }
        }
      }
    }

    // 8. CUSTOMERS - Look for assistant presenting customers (more flexible)
    if (!data.hasCustomers && data.hasCompetitors) {
      if (msg.role === "assistant") {
        // Assistant presents customers - look for customer mentions
        if (content.includes("customer") || content.includes("müşteri") || content.includes("interested")) {
          data.hasCustomers = true;
          console.log("✅ Customers detected - Assistant mentioned customers");
          
          // Try to extract customer info if websites are present
          if (content.includes("www.") || content.includes("http") || content.includes(".com")) {
            const customerMatches = msg.content.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/g);
            if (customerMatches) {
              data.extractedData.customers = customerMatches.map(match => {
                const parts = match.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/);
                return parts ? { name: parts[1].trim(), website: parts[2].trim() } : null;
              }).filter(Boolean) as Array<{name: string; website: string}>;
            }
          }
        }
      }
    }
  }

  // Extract data from final demo/summary message if available
  extractFromDemoMessage(conversationFlow, data);

  // Debug logging to help track progress detection
  console.log("🔍 CONVERSATION ANALYZER RESULTS:");
  console.log("📦 Product:", data.hasProduct ? "✅" : "❌", data.extractedData.product || "");
  console.log("🌍 Target Market:", data.hasTargetMarket ? "✅" : "❌", data.extractedData.country || "");
  console.log("🔢 GTIP Code:", data.hasGtipCode ? "✅" : "❌", data.extractedData.gtipCode || "");
  console.log("🛒 Sales Channels:", data.hasSalesChannels ? "✅" : "❌", data.extractedData.salesChannels || "");
  console.log("📞 Contact Info:", data.hasContactInfo ? "✅" : "❌");
  console.log("🔑 Keywords:", data.hasKeywords ? "✅" : "❌");
  console.log("🏢 Competitors:", data.hasCompetitors ? "✅" : "❌", data.extractedData.competitors?.length || 0);
  console.log("👥 Customers:", data.hasCustomers ? "✅" : "❌", data.extractedData.customers?.length || 0);

  return data;
}

// Helper function to extract data from demo/summary message
function extractFromDemoMessage(conversationFlow: Array<{role: string, content: string}>, data: ConversationData) {
  // Look for the final demo/summary message (usually the last comprehensive assistant message)
  const demoMessage = conversationFlow.reverse().find(msg => {
    if (msg.role === "assistant") {
      const content = msg.content.toLowerCase();
      
      // Look for demo message indicators
      const demoIndicators = [
        'here is a comprehensive summary', 'summary of all collected information',
        'product:', 'target country:', 'gtip code:', 'sales channels:', 'website:',
        'name:', 'email:', 'phone:', 'keywords:', 'competitors:', 'customers:',
        'ürün:', 'hedef ülke:', 'gtip kod', 'satış kanal', 'isim:', 'e-posta:', 'telefon:'
      ];
      
      // Count how many fields are mentioned - demo message should have most/all
      const fieldCount = demoIndicators.filter(indicator => content.includes(indicator)).length;
      
      return fieldCount >= 6; // Must contain at least 6 key fields
    }
    return false;
  });
  
  // Restore original order
  conversationFlow.reverse();
  
  if (demoMessage) {
    console.log("🔍 EXTRACTING ALL DATA FROM DEMO MESSAGE");
    const summaryContent = demoMessage.content;
    
    // Extract product (if null)
    const productMatch = summaryContent.match(/\*\*Product:\*\*\s*([^\n\*]+)/i) ||
                      summaryContent.match(/Product:\s*([^\n]+)/i) ||
                      summaryContent.match(/- Product:\s*([^\n]+)/i) ||
                      summaryContent.match(/\*\*Ürün:\*\*\s*([^\n\*]+)/i) ||
                      summaryContent.match(/Ürün:\s*([^\n]+)/i);
    if (productMatch && !data.extractedData.product) {
      data.extractedData.product = productMatch[1].trim();
      console.log("✅ Product extracted from demo:", data.extractedData.product);
    }

    // Extract country (if null)
    const countryMatch = summaryContent.match(/\*\*Target Country:\*\*\s*([^\n\*]+)/i) ||
                      summaryContent.match(/Target Country:\s*([^\n]+)/i) ||
                      summaryContent.match(/- Target Country:\s*([^\n]+)/i) ||
                      summaryContent.match(/\*\*Hedef Ülke:\*\*\s*([^\n\*]+)/i) ||
                      summaryContent.match(/Hedef Ülke:\s*([^\n]+)/i);
    if (countryMatch && !data.extractedData.country) {
      data.extractedData.country = countryMatch[1].trim();
      console.log("✅ Country extracted from demo:", data.extractedData.country);
    }

    // Extract GTIP Code (if null)
    const gtipMatch = summaryContent.match(/\*\*GTIP Code:\*\*\s*([^\n\*]+)/i) ||
                   summaryContent.match(/GTIP Code:\s*([^\n]+)/i) ||
                   summaryContent.match(/- GTIP Code:\s*([^\n]+)/i) ||
                   summaryContent.match(/\*\*GTİP Kod:\*\*\s*([^\n\*]+)/i) ||
                   summaryContent.match(/GTİP Kod:\s*([^\n]+)/i);
    if (gtipMatch && !data.extractedData.gtipCode) {
      data.extractedData.gtipCode = gtipMatch[1].trim();
      console.log("✅ GTIP Code extracted from demo:", data.extractedData.gtipCode);
    }

    // Extract Sales Channels (if null/empty)
    const salesChannelsMatch = summaryContent.match(/\*\*Sales Channels:\*\*\s*([^\n\*]+)/i) ||
                            summaryContent.match(/Sales Channels:\s*([^\n]+)/i) ||
                            summaryContent.match(/- Sales Channels:\s*([^\n]+)/i) ||
                            summaryContent.match(/\*\*Satış Kanalları:\*\*\s*([^\n\*]+)/i) ||
                            summaryContent.match(/Satış Kanalları:\s*([^\n]+)/i);
    if (salesChannelsMatch && (!data.extractedData.salesChannels || data.extractedData.salesChannels.length === 0)) {
      const channelsText = salesChannelsMatch[1];
      const channels = channelsText.split(/[,;]/).map(c => c.trim()).filter(c => c.length > 0);
      data.extractedData.salesChannels = channels;
      console.log("✅ Sales Channels extracted from demo:", data.extractedData.salesChannels);
    }

    // Extract Website (if null)
    const websiteMatch = summaryContent.match(/\*\*Website:\*\*\s*([^\n\*\s]+)/i) ||
                      summaryContent.match(/Website:\s*([^\n\s]+)/i) ||
                      summaryContent.match(/- Website:\s*([^\n\s]+)/i) ||
                      summaryContent.match(/\*\*Web Sitesi:\*\*\s*([^\n\*\s]+)/i) ||
                      summaryContent.match(/Web Sitesi:\s*([^\n\s]+)/i);
    if (websiteMatch && !data.extractedData.website) {
      data.extractedData.website = websiteMatch[1].trim();
      console.log("✅ Website extracted from demo:", data.extractedData.website);
    }

    // Extract Name (if null)
    const nameMatch = summaryContent.match(/\*\*Name:\*\*\s*([^\n\*]+)/i) ||
                   summaryContent.match(/Name:\s*([^\n]+)/i) ||
                   summaryContent.match(/- Name:\s*([^\n]+)/i) ||
                   summaryContent.match(/\*\*İsim:\*\*\s*([^\n\*]+)/i) ||
                   summaryContent.match(/İsim:\s*([^\n]+)/i);
    if (nameMatch && !data.extractedData.name) {
      data.extractedData.name = nameMatch[1].trim();
      console.log("✅ Name extracted from demo:", data.extractedData.name);
    }

    // Extract Email (if null)
    const emailMatch = summaryContent.match(/\*\*Email:\*\*\s*([^\n\*\s]+)/i) ||
                    summaryContent.match(/Email:\s*([^\n\s]+)/i) ||
                    summaryContent.match(/- Email:\s*([^\n\s]+)/i) ||
                    summaryContent.match(/\*\*E-posta:\*\*\s*([^\n\*\s]+)/i) ||
                    summaryContent.match(/E-posta:\s*([^\n\s]+)/i);
    if (emailMatch && !data.extractedData.email) {
      data.extractedData.email = emailMatch[1].trim();
      console.log("✅ Email extracted from demo:", data.extractedData.email);
    }

    // Extract Phone (if null)
    const phoneMatch = summaryContent.match(/\*\*Phone:\*\*\s*([^\n\*]+)/i) ||
                    summaryContent.match(/Phone:\s*([^\n]+)/i) ||
                    summaryContent.match(/- Phone:\s*([^\n]+)/i) ||
                    summaryContent.match(/\*\*Telefon:\*\*\s*([^\n\*]+)/i) ||
                    summaryContent.match(/Telefon:\s*([^\n]+)/i);
    if (phoneMatch && !data.extractedData.phone) {
      data.extractedData.phone = phoneMatch[1].trim();
      console.log("✅ Phone extracted from demo:", data.extractedData.phone);
    }

    // Extract Keywords (if null/empty)
    const keywordsSection = summaryContent.match(/\*\*Keywords:\*\*\s*([^\n\*]+)/i) ||
                         summaryContent.match(/Keywords:\s*([^\n]+)/i) ||
                         summaryContent.match(/- Keywords:\s*([^\n]+)/i) ||
                         summaryContent.match(/\*\*Anahtar Kelimeler:\*\*\s*([^\n\*]+)/i) ||
                         summaryContent.match(/Anahtar Kelimeler:\s*([^\n]+)/i);
    if (keywordsSection && (!data.extractedData.keywords || data.extractedData.keywords.length === 0)) {
      const keywordsText = keywordsSection[1];
      const keywords = keywordsText.split(/[,;]/).map(k => k.trim()).filter(k => k.length > 0);
      data.extractedData.keywords = keywords;
      console.log("✅ Keywords extracted from demo:", data.extractedData.keywords);
    }

    // Extract Competitors (if null/empty)
    const competitorsSection = summaryContent.match(/\*\*Competitors:\*\*([\s\S]*?)(?=\*\*|$)/i) ||
                            summaryContent.match(/Competitors:([\s\S]*?)(?=\n\n|$)/i) ||
                            summaryContent.match(/- Competitors:([\s\S]*?)(?=\n\n|$)/i) ||
                            summaryContent.match(/\*\*Rakipler:\*\*([\s\S]*?)(?=\*\*|$)/i) ||
                            summaryContent.match(/Rakipler:([\s\S]*?)(?=\n\n|$)/i);
    if (competitorsSection && (!data.extractedData.competitors || data.extractedData.competitors.length === 0)) {
      const competitorsText = competitorsSection[1];
      // Extract company names and websites from the competitors section
      const competitorMatches = competitorsText.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/g);
      if (competitorMatches) {
        data.extractedData.competitors = competitorMatches.map(match => {
          const parts = match.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/);
          return parts ? { name: parts[1].trim(), website: parts[2].trim() } : null;
        }).filter(Boolean) as Array<{name: string; website: string}>;
        console.log("✅ Competitors extracted from demo:", data.extractedData.competitors);
      }
    }

    // Extract Customers (if null/empty)
    const customersSection = summaryContent.match(/\*\*Customers:\*\*([\s\S]*?)(?=\*\*|$)/i) ||
                          summaryContent.match(/Customers:([\s\S]*?)(?=\n\n|$)/i) ||
                          summaryContent.match(/- Customers:([\s\S]*?)(?=\n\n|$)/i) ||
                          summaryContent.match(/\*\*Müşteriler:\*\*([\s\S]*?)(?=\*\*|$)/i) ||
                          summaryContent.match(/Müşteriler:([\s\S]*?)(?=\n\n|$)/i);
    if (customersSection && (!data.extractedData.customers || data.extractedData.customers.length === 0)) {
      const customersText = customersSection[1];
      // Extract company names and websites from the customers section
      const customerMatches = customersText.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/g);
      if (customerMatches) {
        data.extractedData.customers = customerMatches.map(match => {
          const parts = match.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/);
          return parts ? { name: parts[1].trim(), website: parts[2].trim() } : null;
        }).filter(Boolean) as Array<{name: string; website: string}>;
        console.log("✅ Customers extracted from demo:", data.extractedData.customers);
      }
    }
  }
}
