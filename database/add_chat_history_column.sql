-- Add chat_history column to existing conversation_summaries table
-- This script can be run safely multiple times

-- Add chat_history column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_summaries' 
        AND column_name = 'chat_history'
    ) THEN
        ALTER TABLE public.conversation_summaries 
        ADD COLUMN chat_history JSONB NULL;
        
        -- Add comment for documentation
        COMMENT ON COLUMN public.conversation_summaries.chat_history IS 'Stores complete chat conversation between AI and user in JSONB format';
    END IF;
END $$;

-- Add index for chat_history queries if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_chat_history 
ON public.conversation_summaries USING GIN (chat_history);

-- Add index to check if conversation has chat history
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_has_chat 
ON public.conversation_summaries ((chat_history IS NOT NULL AND jsonb_array_length(COALESCE(chat_history->'messages', '[]'::jsonb)) > 0));

-- Example chat_history structure:
/*
{
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "Hello, I want to export textiles to Italy",
      "timestamp": "2025-10-07T09:45:00.000Z"
    },
    {
      "id": 2,
      "role": "assistant", 
      "content": "Great! I can help you with textile exports to Italy. Let me gather some information...",
      "timestamp": "2025-10-07T09:45:15.000Z"
    },
    {
      "id": 3,
      "role": "user",
      "content": "What documents do I need?",
      "timestamp": "2025-10-07T09:46:00.000Z"
    }
  ],
  "metadata": {
    "chatStarted": "2025-10-07T09:45:00.000Z",
    "chatCompleted": "2025-10-07T10:00:00.000Z",
    "messageCount": 15,
    "language": "en",
    "hasChatHistory": true
  }
}
*/
