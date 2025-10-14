import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { analyzeConversationMessages } from '@/lib/conversation-analyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatMessages, language = 'en' } = body

    if (!chatMessages || !Array.isArray(chatMessages)) {
      return NextResponse.json(
        { error: 'Chat messages are required' },
        { status: 400 }
      )
    }

    // Analyze the conversation to extract data
    analyzeConversationMessages(chatMessages)
    
    // Check if conversation has summary message (demo phase completed)
    const hasSummaryMessage = chatMessages.some(message => {
      if (message.type === 'message' && message.role === 'assistant') {
        let content = '';
        if (Array.isArray(message.content)) {
          content = message.content.map((c: any) => c.text || '').join(' ').trim();
        } else if (typeof message.content === 'string') {
          content = message.content;
        }
        
        const contentLower = content.toLowerCase();
        const summaryIndicators = [
          'ürün:', 'product:', 'hedef ülke:', 'target country:', 'gtip kod', 'gtip code',
          'satış kanal', 'sales channel', 'website:', 'web site:', 'isim:', 'name:',
          'e-posta:', 'email:', 'telefon:', 'phone:', 'anahtar kelime', 'keyword',
          'rakip', 'competitor', 'müşteri', 'customer'
        ];
        
        const indicatorCount = summaryIndicators.filter(indicator => contentLower.includes(indicator)).length;
        return indicatorCount >= 6;
      }
      return false;
    });

    if (!hasSummaryMessage) {
      return NextResponse.json(
        { error: 'Summary message not found - conversation not complete yet' },
        { status: 400 }
      )
    }

    // Extract data from conversation for database
    const extractedData = extractConversationDataAdvanced(chatMessages)
    
    // 🚨 DEBUG: Log extracted data
    console.log("🔍 EXTRACTED CONVERSATION DATA:");
    console.log("📦 Product:", extractedData.product || "NOT FOUND");
    console.log("🌍 Country:", extractedData.country || "NOT FOUND");
    console.log("🔢 GTIP Code:", extractedData.gtipCode || "NOT FOUND");
    console.log("🛒 Sales Channels:", extractedData.salesChannels || "NOT FOUND");
    console.log("🌐 Website:", extractedData.website || "NOT FOUND");
    console.log("👤 Name:", extractedData.name || "NOT FOUND");
    console.log("📧 Email:", extractedData.email || "NOT FOUND");
    console.log("📱 Phone:", extractedData.phone || "NOT FOUND");
    console.log("🔑 Keywords:", extractedData.keywords || "NOT FOUND");
    console.log("🏢 Competitors:", extractedData.competitors || "NOT FOUND");
    console.log("👥 Customers:", extractedData.customers || "NOT FOUND");
    
    // Generate session ID from timestamp or use existing
    const sessionId = generateSessionId()
    
    // Format chat messages for storage
    const formattedMessages = chatMessages
      .filter((message: any) => message.type === 'message')
      .map((message: any, index: number) => {
        let content = ''
        
        if (Array.isArray(message.content)) {
          content = message.content
            .map((c: any) => c.text || '')
            .join(' ')
            .trim()
        } else if (typeof message.content === 'string') {
          content = message.content
        }

        return {
          id: index + 1,
          role: message.role,
          content: content,
          timestamp: new Date().toISOString()
        }
      })

    // Prepare chat history data
    const chatHistoryData = {
      messages: formattedMessages,
      metadata: {
        chatStarted: formattedMessages.length > 0 ? new Date().toISOString() : null,
        chatCompleted: new Date().toISOString(),
        messageCount: formattedMessages.length,
        language: language,
        hasChatHistory: formattedMessages.length > 0,
        extractedFromSummary: true
      }
    }

    // Prepare data for database - matching your existing table structure
    const conversationRecord = {
      session_id: sessionId,
      product: extractedData.product || null,
      target_country: extractedData.country || null,
      gtip_code: extractedData.gtipCode || null,
      sales_channels: extractedData.salesChannels || [],
      website: extractedData.website || null,
      contact_name: extractedData.name || null,
      email: extractedData.email || null,
      phone: extractedData.phone || null,
      keywords: extractedData.keywords || [],
      competitors: extractedData.competitors || [],
      customers: extractedData.customers || [],
      language: language,
      chat_history: chatHistoryData, // New column for chat history
      conversation_data: {
        timestamp: new Date().toISOString(),
        summaryData: {
          email: extractedData.email,
          phone: extractedData.phone,
          product: extractedData.product,
          website: extractedData.website,
          gtipCode: extractedData.gtipCode,
          keywords: extractedData.keywords,
          customers: extractedData.customers,
          competitors: extractedData.competitors,
          contactName: extractedData.name,
          salesChannels: extractedData.salesChannels,
          targetCountry: extractedData.country
        },
        extractedFromSummary: true,
        completionData: {
          hasProduct: !!extractedData.product,
          hasTargetMarket: !!extractedData.country,
          hasGtipCode: !!extractedData.gtipCode,
          hasSalesChannels: extractedData.salesChannels && extractedData.salesChannels.length > 0,
          hasContactInfo: !!(extractedData.name || extractedData.email || extractedData.phone),
          hasKeywords: extractedData.keywords && extractedData.keywords.length > 0,
          hasCompetitors: extractedData.competitors && extractedData.competitors.length > 0,
          hasCustomers: extractedData.customers && extractedData.customers.length > 0
        }
      }
    }

    // Save to Supabase
    const { data, error } = await supabaseAdmin
      .from('conversation_summaries')
      .insert([conversationRecord])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save conversation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      conversationId: data[0]?.id,
      message: 'Conversation saved successfully'
    })

  } catch (error) {
    console.error('Error saving conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to extract more detailed data from conversation
function extractConversationDataAdvanced(messages: any[]) {
  const data: any = {
    product: null,
    country: null,
    gtipCode: null,
    salesChannels: [],
    website: null,
    name: null,
    email: null,
    phone: null,
    keywords: [],
    competitors: [],
    customers: []
  }

  // First, look for the final demo/summary message - prioritize the last comprehensive message
  const summaryMessage = messages.reverse().find(message => {
    if (message.type === 'message' && message.role === 'assistant') {
      let content = '';
      if (Array.isArray(message.content)) {
        content = message.content.map((c: any) => c.text || '').join(' ').trim();
      } else if (typeof message.content === 'string') {
        content = message.content;
      }
      
      const contentLower = content.toLowerCase();
      
      // Look for final demo message with comprehensive summary
      const demoIndicators = [
        'here is a comprehensive summary', 'summary of all collected information',
        'product:', 'target country:', 'gtip code:', 'sales channels:', 'website:',
        'name:', 'email:', 'phone:', 'keywords:', 'competitors:', 'customers:'
      ];
      
      // Count how many fields are mentioned - final summary should have most/all
      const fieldCount = demoIndicators.filter(indicator => contentLower.includes(indicator)).length;
      
      return fieldCount >= 8; // Must contain at least 8 key fields to be considered final summary
    }
    return false;
  });
  
  // Restore original order
  messages.reverse();

  if (summaryMessage) {
    let summaryContent = '';
    if (Array.isArray(summaryMessage.content)) {
      summaryContent = summaryMessage.content.map((c: any) => c.text || '').join(' ').trim();
    } else if (typeof summaryMessage.content === 'string') {
      summaryContent = summaryMessage.content;
    }

    // Enhanced extraction from structured summary format - multiple patterns
    console.log("🔍 EXTRACTING FROM FINAL SUMMARY MESSAGE");
    
    // Product extraction - multiple patterns
    const productMatch = summaryContent.match(/\*\*Product:\*\*\s*([^\n\*]+)/i) ||
                      summaryContent.match(/Product:\s*([^\n]+)/i) ||
                      summaryContent.match(/- Product:\s*([^\n]+)/i);
    if (productMatch) {
      data.product = productMatch[1].trim();
      console.log("✅ Product extracted:", data.product);
    }

    // Country extraction - multiple patterns  
    const countryMatch = summaryContent.match(/\*\*Target Country:\*\*\s*([^\n\*]+)/i) ||
                      summaryContent.match(/Target Country:\s*([^\n]+)/i) ||
                      summaryContent.match(/- Target Country:\s*([^\n]+)/i);
    if (countryMatch) {
      data.country = countryMatch[1].trim();
      console.log("✅ Country extracted:", data.country);
    }

    // GTIP Code extraction
    const gtipMatch = summaryContent.match(/\*\*GTIP Code:\*\*\s*([^\n\*]+)/i) ||
                   summaryContent.match(/GTIP Code:\s*([^\n]+)/i) ||
                   summaryContent.match(/- GTIP Code:\s*([^\n]+)/i);
    if (gtipMatch) {
      data.gtipCode = gtipMatch[1].trim();
      console.log("✅ GTIP Code extracted:", data.gtipCode);
    }

    // Sales Channels extraction
    const channelsMatch = summaryContent.match(/\*\*Sales Channels:\*\*\s*([^\n\*]+)/i) ||
                       summaryContent.match(/Sales Channels:\s*([^\n]+)/i) ||
                       summaryContent.match(/- Sales Channels:\s*([^\n]+)/i);
    if (channelsMatch) {
      const channels = channelsMatch[1].trim();
      if (channels.toLowerCase().includes('wholesaler') || channels.toLowerCase().includes('all') || 
          channels.toLowerCase().includes('toptancı')) {
        data.salesChannels = ['Toptancılar', 'Distribütörler', 'İthalatçılar'];
      } else {
        data.salesChannels = [channels];
      }
      console.log("✅ Sales Channels extracted:", data.salesChannels);
    }

    // Website extraction
    const websiteMatch = summaryContent.match(/\*\*Website:\*\*\s*([^\n\*\s]+)/i) ||
                      summaryContent.match(/Website:\s*([^\n\s]+)/i) ||
                      summaryContent.match(/- Website:\s*([^\n\s]+)/i);
    if (websiteMatch) {
      data.website = websiteMatch[1].trim();
      console.log("✅ Website extracted:", data.website);
    }

    // Name extraction
    const nameMatch = summaryContent.match(/\*\*Name:\*\*\s*([^\n\*]+)/i) ||
                   summaryContent.match(/Name:\s*([^\n]+)/i) ||
                   summaryContent.match(/- Name:\s*([^\n]+)/i);
    if (nameMatch) {
      data.name = nameMatch[1].trim();
      console.log("✅ Name extracted:", data.name);
    }

    // Email extraction
    const emailMatch = summaryContent.match(/\*\*Email:\*\*\s*([^\n\*\s]+)/i) ||
                    summaryContent.match(/Email:\s*([^\n\s]+)/i) ||
                    summaryContent.match(/- Email:\s*([^\n\s]+)/i);
    if (emailMatch) {
      data.email = emailMatch[1].trim();
      console.log("✅ Email extracted:", data.email);
    }

    // Phone extraction
    const phoneMatch = summaryContent.match(/\*\*Phone:\*\*\s*([^\n\*]+)/i) ||
                    summaryContent.match(/Phone:\s*([^\n]+)/i) ||
                    summaryContent.match(/- Phone:\s*([^\n]+)/i);
    if (phoneMatch) {
      data.phone = phoneMatch[1].trim();
      console.log("✅ Phone extracted:", data.phone);
    }

    // Keywords extraction from summary
    const keywordsSection = summaryContent.match(/\*\*Keywords:\*\*\s*([^\n\*]+)/i) ||
                         summaryContent.match(/Keywords:\s*([^\n]+)/i) ||
                         summaryContent.match(/- Keywords:\s*([^\n]+)/i);
    if (keywordsSection) {
      const keywordsText = keywordsSection[1];
      // Split by common separators
      const keywords = keywordsText.split(/[,;]/).map(k => k.trim()).filter(k => k.length > 0);
      data.keywords = keywords;
      console.log("✅ Keywords extracted:", data.keywords);
    }

    // Competitors extraction from summary
    const competitorsSection = summaryContent.match(/\*\*Competitors:\*\*\s*([^\n\*]+)/i) ||
                            summaryContent.match(/Competitors:\s*([^\n]+)/i) ||
                            summaryContent.match(/- Competitors:\s*([^\n]+)/i);
    if (competitorsSection) {
      const competitorsText = competitorsSection[1];
      // Extract company names and websites
      const compMatches = competitorsText.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/g);
      if (compMatches) {
        compMatches.forEach(match => {
          const parts = match.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/);
          if (parts) {
            const name = parts[1].trim();
            const website = cleanWebsiteUrl(parts[2].trim());
            if (isValidCompanyWebsite(website)) {
              data.competitors.push({ name, website, source: 'summary' });
            }
          }
        });
      }
      console.log("✅ Competitors extracted:", data.competitors);
    }

    // Customers extraction from summary
    const customersSection = summaryContent.match(/\*\*Customers:\*\*\s*([^\n\*]+)/i) ||
                          summaryContent.match(/Customers:\s*([^\n]+)/i) ||
                          summaryContent.match(/- Customers:\s*([^\n]+)/i) ||
                          summaryContent.match(/\*\*Potential Customers:\*\*\s*([^\n\*]+)/i);
    if (customersSection) {
      const customersText = customersSection[1];
      // Extract company names and websites
      const custMatches = customersText.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/g);
      if (custMatches) {
        custMatches.forEach(match => {
          const parts = match.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/);
          if (parts) {
            const name = parts[1].trim();
            const website = cleanWebsiteUrl(parts[2].trim());
            if (isValidCompanyWebsite(website)) {
              data.customers.push({ name, website, source: 'summary' });
            }
          }
        });
      }
      console.log("✅ Customers extracted:", data.customers);
    }
  }

  // Process messages sequentially to extract conversation flow data
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const nextMessage = i < messages.length - 1 ? messages[i + 1] : null;
    
    if (message.type === 'message') {
      let content = '';
      
      if (Array.isArray(message.content)) {
        content = message.content.map((c: any) => c.text || '').join(' ').trim();
      } else if (typeof message.content === 'string') {
        content = message.content;
      }

      const contentLower = content.toLowerCase();

      // Extract from user responses following assistant questions
      if (message.role === 'user' && nextMessage) {
        // nextContent variable removed as it was unused

        // Look at previous assistant message to understand context
        const prevMessage = i > 0 ? messages[i - 1] : null;
        let prevContent = '';
        if (prevMessage && Array.isArray(prevMessage.content)) {
          prevContent = prevMessage.content.map((c: any) => c.text || '').join(' ').trim();
        } else if (prevMessage && typeof prevMessage.content === 'string') {
          prevContent = prevMessage.content;
        }

        const prevLower = prevContent.toLowerCase();

        // Extract product (if assistant asks about product and user responds)
        if (!data.product && (prevLower.includes('which product') || prevLower.includes('hangi ürün') || 
            prevLower.includes('product do you want') || prevLower.includes('ürününüzün ihracatını'))) {
          // Clean and format product name
          const productName = content.trim();
          if (productName.length > 0 && productName.length < 100) {
            data.product = productName.charAt(0).toUpperCase() + productName.slice(1).toLowerCase();
          }
        }

        // Extract target country
        if (!data.country && (prevLower.includes('which country') || prevLower.includes('hangi ülke'))) {
          const countryMap: Record<string, string> = {
            'italy': 'İtalya',
            'italya': 'İtalya',
            'germany': 'Almanya', 
            'almanya': 'Almanya',
            'france': 'Fransa',
            'fransa': 'Fransa',
            'usa': 'Amerika',
            'america': 'Amerika',
            'japan': 'Japonya'
          };
          
          Object.entries(countryMap).forEach(([key, value]) => {
            if (contentLower.includes(key)) {
              data.country = value;
            }
          });
        }

        // Extract GTIP code confirmation
        if (!data.gtipCode && prevLower.includes('gtip') && (contentLower.includes('yes') || contentLower.includes('evet'))) {
          const gtipMatch = prevContent.match(/\b\d{4}\.?\d{2}\b/);
          if (gtipMatch) {
            data.gtipCode = gtipMatch[0];
          }
        }

        // Extract sales channels
        if (data.salesChannels.length === 0 && (prevLower.includes('sales channel') || prevLower.includes('satış kanal'))) {
          if (contentLower.includes('all') || contentLower.includes('hepsi')) {
            data.salesChannels = ['Toptancılar', 'Distribütörler', 'İthalatçılar'];
          } else {
            const salesChannelMap: Record<string, string> = {
              'wholesaler': 'Toptancılar',
              'toptancı': 'Toptancılar',
              'distributor': 'Distribütörler', 
              'distribütör': 'Distribütörler',
              'importer': 'İthalatçılar',
              'retailer': 'Perakendeciler'
            };
            
            Object.entries(salesChannelMap).forEach(([key, value]) => {
              if (contentLower.includes(key) && !data.salesChannels.includes(value)) {
                data.salesChannels.push(value);
              }
            });
          }
        }

        // Extract website
        if (!data.website && prevLower.includes('website')) {
          let website = content.trim();
          if (!website.startsWith('http') && !website.startsWith('www.')) {
            website = 'www.' + website;
          }
          data.website = website;
        }

        // Extract name
        if (!data.name && (prevLower.includes('your name') || prevLower.includes('isminiz'))) {
          data.name = content.trim();
        }

        // Extract email
        if (!data.email && (prevLower.includes('email') || prevLower.includes('e-posta'))) {
          const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) {
            data.email = emailMatch[0];
          }
        }

        // Extract phone
        if (!data.phone && (prevLower.includes('phone') || prevLower.includes('telefon'))) {
          const phoneMatch = content.match(/[\+]?[0-9\s\-\(\)]{7,15}/);
          if (phoneMatch) {
            data.phone = phoneMatch[0].trim();
          }
        }

        // Extract keywords confirmation
        if (data.keywords.length === 0 && (prevLower.includes('keywords') || prevLower.includes('kelime') || 
            prevLower.includes('anahtar kelime')) && 
            (contentLower.includes('yes') || contentLower.includes('evet') || contentLower.includes('describes') || 
             contentLower.includes('tanımlar'))) {
          // Extract keywords from previous assistant message - multiple patterns
          let keywordMatches = prevContent.match(/\d+\.\s*([^\n\r]+)/g);
          
          // Try alternative patterns if first doesn't work
          if (!keywordMatches) {
            keywordMatches = prevContent.match(/[-•]\s*([^\n\r]+)/g);
          }
          
          // Try quoted keywords pattern
          if (!keywordMatches) {
            keywordMatches = prevContent.match(/"([^"]+)"/g);
          }
          
          if (keywordMatches) {
            keywordMatches.forEach(match => {
              const keyword = match.replace(/\d+\.\s*/, '').replace(/[-•]\s*/, '').replace(/"/g, '').trim();
              if (keyword && keyword.length > 2 && keyword.length < 100 && !data.keywords.includes(keyword)) {
                data.keywords.push(keyword);
              }
            });
          }
        }
      }

        // Extract competitors and customers from assistant messages
        if (message.role === 'assistant') {
          // Enhanced competitor extraction - look for specific patterns
          if ((contentLower.includes('competitor') || contentLower.includes('rakip')) && 
              !contentLower.includes('calendly') && !contentLower.includes('meeting')) {
            
            // Pattern: "CompanyName (website)" - more flexible matching
            const competitorMatches = content.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/g);
            if (competitorMatches) {
              competitorMatches.forEach(match => {
                const parts = match.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/);
                if (parts) {
                  const name = parts[1].trim();
                  let website = parts[2].trim();
                  
                  // Clean and validate website
                  if (isValidCompanyWebsite(website)) {
                    website = cleanWebsiteUrl(website);
                    
                    // Only add if name is clean and not duplicate
                    if (name.length < 50 && name.length > 2 && 
                        !data.competitors.find((c: any) => c.website === website || c.name === name)) {
                      data.competitors.push({
                        name: name,
                        website: website,
                        type: 'competitor',
                        source: 'ai-suggestion'
                      });
                    }
                  }
                }
              });
            }
          }

          // Enhanced customer extraction - similar pattern
          if ((contentLower.includes('customer') || contentLower.includes('müşteri') || contentLower.includes('interested')) &&
              !contentLower.includes('calendly') && !contentLower.includes('meeting')) {
            
            const customerMatches = content.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/g);
            if (customerMatches) {
              customerMatches.forEach(match => {
                const parts = match.match(/([A-Za-z0-9\s&\.\-]+)\s*\(([^)]+)\)/);
                if (parts) {
                  const name = parts[1].trim();
                  let website = parts[2].trim();
                  
                  // Clean and validate website
                  if (isValidCompanyWebsite(website)) {
                    website = cleanWebsiteUrl(website);
                    
                    // Only add if name is clean and not duplicate
                    if (name.length < 50 && name.length > 2 && 
                        !data.customers.find((c: any) => c.website === website || c.name === name)) {
                      data.customers.push({
                        name: name,
                        website: website,
                        source: 'ai-suggestion',
                        description: 'Potential customer identified from conversation'
                      });
                    }
                  }
                }
              });
            }
          }
      }
    }
  }

  // Clean up duplicates and invalid entries
  data.competitors = data.competitors.filter((comp: any, index: number, array: any[]) => 
    comp.name && comp.website && 
    comp.name.length < 50 && 
    !comp.website.includes('calendly') &&
    array.findIndex((c: any) => c.website === comp.website) === index
  );

  data.customers = data.customers.filter((cust: any, index: number, array: any[]) => 
    cust.name && cust.website && 
    cust.name.length < 50 && 
    !cust.website.includes('calendly') &&
    array.findIndex((c: any) => c.website === cust.website) === index
  );

  return data
}


// Helper function to validate company websites
function isValidCompanyWebsite(website: string): boolean {
  if (!website || typeof website !== 'string') return false;
  
  const websiteLower = website.toLowerCase();
  
  // Forbidden sites
  const forbiddenSites = [
    'wikipedia.org', 'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'amazon.com', 'alibaba.com', 'tradeindia.com', 'made-in-china.com',
    'yellowpages', 'yelp.com', 'google.com', 'maps.google', 'calendly.com',
    'youtube.com', 'tiktok.com', 'pinterest.com', 'reddit.com'
  ];
  
  // Check if website contains any forbidden domains
  if (forbiddenSites.some(forbidden => websiteLower.includes(forbidden))) {
    return false;
  }
  
  // Must contain a valid domain extension
  const validExtensions = ['.com', '.de', '.co.uk', '.net', '.org', '.it', '.fr', '.es', '.nl', '.be', '.ch', '.at'];
  if (!validExtensions.some(ext => websiteLower.includes(ext))) {
    return false;
  }
  
  return true;
}

// Helper function to clean website URLs
function cleanWebsiteUrl(website: string): string {
  if (!website) return '';
  
  // Remove any extra text and extract just the domain
  let cleaned = website.trim();
  
  // Remove protocol if present
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.replace(/^www\./, '');
  
  // Extract just the domain part (remove paths, parameters, etc.)
  cleaned = cleaned.split('/')[0];
  cleaned = cleaned.split('?')[0];
  cleaned = cleaned.split('#')[0];
  
  // Add www. if not present
  if (!cleaned.startsWith('www.')) {
    cleaned = 'www.' + cleaned;
  }
  
  return cleaned;
}

// Helper function to generate session ID
function generateSessionId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `sess_${timestamp}_${random}`
}
