import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Paperclip } from 'lucide-react';
import { useChatContext } from './ChatContext';
import { MessageBubble } from './components/MessageBubble';
import { StatusIndicator } from './components/StatusIndicator';
import { QuickActions } from './components/QuickActions';
import { UrgencySelector } from './components/UrgencySelector';
import type { ChatWidgetProps } from './types';

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  botType,
  userId,
  userName,
  role,
  apiUrl = 'http://localhost:3019',
  wsUrl,
  context,
  onSessionCreated,
  onMessageSent,
  onEscalation,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showUrgencySelector, setShowUrgencySelector] = useState(false);

  const {
    session,
    messages,
    isConnected,
    isTyping,
    unreadCount,
    sendMessage,
    escalateToHuman,
    clearUnread
  } = useChatContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Clear unread when opening
  useEffect(() => {
    if (isOpen) {
      clearUnread();
    }
  }, [isOpen, clearUnread]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    try {
      await sendMessage(inputValue, attachments as any);
      setInputValue('');
      setAttachments([]);
      if (onMessageSent) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage) onMessageSent(lastMessage);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleEscalate = async () => {
    try {
      const ticket = await escalateToHuman();
      if (ticket && onEscalation) {
        onEscalation(ticket);
      }
      setShowUrgencySelector(false);
    } catch (err) {
      console.error('Failed to escalate:', err);
    }
  };

  const getBotName = () => {
    const names: Record<string, string> = {
      'planif-ia': 'Assistant Planif\'IA',
      'routier': 'Assistant Routier',
      'quai-wms': 'Assistant Quai & WMS',
      'livraisons': 'Assistant Livraisons',
      'expedition': 'Assistant Expédition',
      'freight-ia': 'Assistant Freight IA',
      'copilote-chauffeur': 'Copilote Chauffeur',
      'helpbot': 'RT HelpBot'
    };
    return names[botType] || 'Assistant RT';
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Ouvrir l'assistance"
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <MessageCircle size={24} />
                <StatusIndicator isConnected={isConnected} className="absolute -bottom-1 -right-1" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{getBotName()}</h3>
                <p className="text-xs opacity-90">
                  {isConnected ? 'En ligne' : 'Hors ligne'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 rounded-full p-1 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">Bonjour ! Comment puis-je vous aider ?</p>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-gray-500 text-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>L'assistant tape...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length > 0 && messages[messages.length - 1]?.suggestedActions && (
            <QuickActions
              actions={messages[messages.length - 1].suggestedActions || []}
              onActionClick={(action) => {
                if (action.type === 'escalate') {
                  setShowUrgencySelector(true);
                }
              }}
            />
          )}

          {/* Urgency Selector */}
          {showUrgencySelector && (
            <UrgencySelector
              onSelect={handleEscalate}
              onCancel={() => setShowUrgencySelector(false)}
            />
          )}

          {/* Input Area */}
          <div className="border-t p-4 bg-white">
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1">
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-blue-600 transition-colors p-2"
                aria-label="Joindre un fichier"
              >
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />

              <button
                onClick={handleSendMessage}
                disabled={!isConnected || (!inputValue.trim() && attachments.length === 0)}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 transition-colors"
                aria-label="Envoyer"
              >
                <Send size={20} />
              </button>
            </div>

            <div className="mt-2 text-center">
              <button
                onClick={() => setShowUrgencySelector(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                Parler à un technicien
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
