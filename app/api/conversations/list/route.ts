import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const country = searchParams.get('country')
    const language = searchParams.get('language')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('conversation_summaries')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (search) {
      query = query.or(`contact_name.ilike.%${search}%,email.ilike.%${search}%,product.ilike.%${search}%,target_country.ilike.%${search}%`)
    }

    if (country) {
      query = query.eq('target_country', country)
    }

    if (language) {
      query = query.eq('language', language)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }

    // Format the data to match the expected interface
    const formattedData = data?.map((conversation, index) => {
      // Parse chat_history to check for chat history
      let conversationData: any = {}
      let hasChatHistory = false
      let messageCount = 0
      
      if (conversation.chat_history && typeof conversation.chat_history === 'object') {
        const chatHistory = conversation.chat_history
        hasChatHistory = !!(chatHistory.messages && Array.isArray(chatHistory.messages) && chatHistory.messages.length > 0)
        messageCount = chatHistory.messages ? chatHistory.messages.length : 0
      }
      
      // Keep conversation_data for backward compatibility
      if (conversation.conversation_data && typeof conversation.conversation_data === 'object') {
        conversationData = conversation.conversation_data
      }

      return {
        idx: offset + index,
        id: conversation.id,
        created_at: conversation.created_at,
        session_id: conversation.session_id || 'unknown',
        product: conversation.product || '',
        target_country: conversation.target_country || '',
        gtip_code: conversation.gtip_code || '',
        sales_channels: conversation.sales_channels || [],
        website: conversation.website || '',
        contact_name: conversation.contact_name || '',
        email: conversation.email || '',
        phone: conversation.phone || '',
        keywords: conversation.keywords || [],
        competitors: JSON.stringify(conversation.competitors || []),
        customers: JSON.stringify(conversation.customers || []),
        language: conversation.language || 'en',
        conversation_data: JSON.stringify(conversationData),
        has_chat_history: hasChatHistory,
        message_count: messageCount
      }
    }) || []

    return NextResponse.json({
      success: true,
      conversations: formattedData,
      total: formattedData.length
    })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
