import React from 'react';
import { User, Bot } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-2 rounded-lg max-w-[80%]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot size={16} className="text-blue-600" />
        </div>
      )}

      <div className={`max-w-[75%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-800'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((file) => (
                <div key={file.id} className="text-xs opacity-80">
                  📎 {file.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {format(message.timestamp, 'HH:mm', { locale: fr })}
          {message.confidence !== undefined && !isUser && (
            <span className="ml-2">• {Math.round(message.confidence * 100)}%</span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center order-2">
          <User size={16} className="text-gray-600" />
        </div>
      )}
    </div>
  );
};
