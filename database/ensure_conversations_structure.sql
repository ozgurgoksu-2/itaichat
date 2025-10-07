-- Ensure conversations table has proper structure for chat history storage
-- This script can be run safely multiple times

-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamp (automatically set)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Session identifier
    session_id TEXT,
    
    -- Business information
    product TEXT,
    target_country TEXT,
    gtip_code TEXT,
    sales_channels TEXT[], -- Array of sales channels
    website TEXT,
    
    -- Contact information
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    
    -- Market analysis
    keywords TEXT[], -- Array of keywords
    competitors JSONB, -- JSON array of competitor objects
    customers JSONB, -- JSON array of customer objects
    
    -- System information
    language TEXT DEFAULT 'en',
    conversation_data JSONB -- Full conversation data and metadata including chat messages
);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_target_country ON conversations(target_country);
CREATE INDEX IF NOT EXISTS idx_conversations_language ON conversations(language);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_name ON conversations(contact_name);
CREATE INDEX IF NOT EXISTS idx_conversations_email ON conversations(email);
CREATE INDEX IF NOT EXISTS idx_conversations_product ON conversations(product);

-- Add index for chat history queries
CREATE INDEX IF NOT EXISTS idx_conversations_has_chat ON conversations USING GIN ((conversation_data->'hasChatHistory'));
CREATE INDEX IF NOT EXISTS idx_conversations_message_count ON conversations USING GIN ((conversation_data->'messageCount'));

-- Enable Row Level Security if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'conversations' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' 
        AND policyname = 'Allow all operations on conversations'
    ) THEN
        CREATE POLICY "Allow all operations on conversations" ON conversations
            FOR ALL USING (true);
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE conversations IS 'Stores all chat conversations with complete message history and extracted business data';
COMMENT ON COLUMN conversations.conversation_data IS 'JSONB field containing: messages array, timestamps, completion flags, and metadata';

-- Example conversation_data structure:
/*
{
  "timestamp": "2025-10-07T10:00:00.000Z",
  "chatStarted": "2025-10-07T09:45:00.000Z",
  "chatCompleted": "2025-10-07T10:00:00.000Z",
  "messageCount": 15,
  "hasChatHistory": true,
  "extractedFromSummary": true,
  "messages": [
    {
      "type": "message",
      "role": "user",
      "content": [{"type": "input_text", "text": "Hello, I want to export textiles to Italy"}]
    },
    {
      "type": "message", 
      "role": "assistant",
      "content": [{"type": "output_text", "text": "Great! I can help you with textile exports to Italy..."}]
    }
  ],
  "summaryData": {
    "product": "Textiles",
    "targetCountry": "Italy",
    "contactName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "website": "www.example.com",
    "gtipCode": "5208.11",
    "salesChannels": ["Wholesalers", "Distributors"],
    "keywords": ["cotton fabric", "textile export", "italian market"],
    "competitors": [
      {"name": "Competitor A", "website": "www.competitor.com", "type": "foreign"}
    ],
    "customers": [
      {"name": "Customer A", "website": "www.customer.com", "description": "Large retailer"}
    ]
  },
  "completionData": {
    "hasProduct": true,
    "hasTargetMarket": true,
    "hasGtipCode": true,
    "hasSalesChannels": true,
    "hasContactInfo": true,
    "hasKeywords": true,
    "hasCompetitors": true,
    "hasCustomers": true
  }
}
*/
