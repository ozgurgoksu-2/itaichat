import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // Fetch conversation from database
    const { data, error } = await supabaseAdmin
      .from('conversation_summaries')
      .select('id, chat_history, conversation_data, contact_name, product, created_at, language')
      .eq('id', conversationId)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch conversation' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Extract chat messages from chat_history column
    let chatMessages = []
    
    if (data.chat_history && typeof data.chat_history === 'object') {
      // Check if messages exist in chat_history
      if (data.chat_history.messages && Array.isArray(data.chat_history.messages)) {
        chatMessages = data.chat_history.messages
      }
    } else if (data.conversation_data && typeof data.conversation_data === 'object') {
      // Fallback to conversation_data for backward compatibility
      if (data.conversation_data.messages && Array.isArray(data.conversation_data.messages)) {
        chatMessages = data.conversation_data.messages
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
      }
    }

    // Format messages for display (if they're already formatted from chat_history, use as is)
    const formattedMessages = chatMessages.map((message: any, index: number) => {
      // If message is already formatted (from chat_history), use it directly
      if (message.id && message.role && message.content && message.timestamp) {
        return message
      }
      
      // Otherwise format it (for backward compatibility)
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
        id: message.id || index + 1,
        role: message.role,
        content: content,
        timestamp: message.timestamp || new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      conversation: {
        id: data.id,
        contact_name: data.contact_name,
        product: data.product,
        created_at: data.created_at,
        language: data.language
      },
      messages: formattedMessages
    })

  } catch (error) {
    console.error('Error fetching conversation chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
