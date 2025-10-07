'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Card components not used in this component
import { Button } from '@/components/ui/button';
import { 
  X, 
  MessageCircle, 
  User, 
  Bot, 
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ConversationInfo {
  id: string;
  contact_name: string;
  product: string;
  created_at: string;
  language: string;
}

interface ChatHistorySidebarProps {
  conversationId: string | null;
  onClose: () => void;
}

export function ChatHistorySidebar({ conversationId, onClose }: ChatHistorySidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationInfo, setConversationInfo] = useState<ConversationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChatHistory = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/conversations/chat?id=${conversationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      if (data.success) {
        setMessages(data.messages || []);
        setConversationInfo(data.conversation);
      } else {
        throw new Error(data.error || 'Failed to fetch chat history');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchChatHistory();
    }
  }, [conversationId, fetchChatHistory]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageFlag = (language: string) => {
    switch (language) {
      case 'tr': return '🇹🇷';
      case 'en': return '🇺🇸';
      default: return '🌍';
    }
  };

  if (!conversationId) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col"
      >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Chat History</h3>
              {conversationInfo && (
                <p className="text-white/90 text-sm">
                  {conversationInfo.contact_name || 'Unknown'} - {conversationInfo.product || 'No product'}
                  {conversationInfo.language && (
                    <span className="ml-2">{getLanguageFlag(conversationInfo.language)}</span>
                  )}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-gray-600">Loading chat history...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Chat</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchChatHistory} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Found</h3>
              <p className="text-gray-600">This conversation doesn&apos;t have any chat messages.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation Info */}
            {conversationInfo && (
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Started: {formatTimestamp(conversationInfo.created_at)}</span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium">
                        {message.role === 'user' ? 'User' : 'ITAI Assistant'}
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-2">
          <MessageCircle className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">
            {messages.length > 0 ? `${messages.length} messages` : 'No messages'}
          </span>
        </div>
      </div>
      </motion.div>
    </AnimatePresence>
  );
}
