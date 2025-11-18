import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ChatContextValue, ChatSession, ChatMessage, Ticket, FileAttachment, BotType } from './types';

interface ChatProviderProps {
  children: React.ReactNode;
  botType: BotType;
  userId: string;
  userName: string;
  role: string;
  apiUrl?: string;
  wsUrl?: string;
  context?: Record<string, any>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  botType,
  userId,
  userName,
  role,
  apiUrl = 'http://localhost:3019',
  wsUrl,
  context
}) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);

  // Create session on mount
  useEffect(() => {
    createSession();
  }, [botType, userId]);

  // WebSocket connection
  useEffect(() => {
    if (!session) return;

    const wsUrlFinal = wsUrl || apiUrl.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrlFinal}/chatbot/ws?sessionId=${session.sessionId}`);

    ws.onopen = () => {
      console.log('[ChatWidget] WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'response') {
        setMessages(prev => [...prev, data.message]);
        setUnreadCount(prev => prev + 1);
        setIsTyping(false);
      } else if (data.type === 'typing') {
        setIsTyping(data.isTyping);
      } else if (data.type === 'escalated') {
        // Handle escalation notification
        console.log('[ChatWidget] Escalated:', data.ticket);
      }
    };

    ws.onclose = () => {
      console.log('[ChatWidget] WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error('[ChatWidget] WebSocket error:', err);
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [session, apiUrl, wsUrl]);

  const createSession = async () => {
    try {
      const response = await fetch(`${apiUrl}/chatbot/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, role, botType })
      });

      if (!response.ok) throw new Error('Failed to create session');

      const data = await response.json();
      setSession({
        sessionId: data.sessionId,
        botType: data.botType,
        userName: data.userName,
        createdAt: data.createdAt,
        lastActivity: Date.now()
      });

      // Load history
      await loadHistory(data.sessionId);
    } catch (err) {
      console.error('[ChatWidget] Failed to create session:', err);
    }
  };

  const loadHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`${apiUrl}/chatbot/history/${sessionId}`);
      if (!response.ok) throw new Error('Failed to load history');

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('[ChatWidget] Failed to load history:', err);
    }
  };

  const sendMessage = useCallback(async (content: string, attachments?: FileAttachment[]) => {
    if (!session) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Send via WebSocket if connected, otherwise HTTP
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        message: content,
        attachments
      }));
    } else {
      try {
        const response = await fetch(`${apiUrl}/chatbot/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.sessionId,
            message: content,
            attachments
          })
        });

        if (!response.ok) throw new Error('Failed to send message');

        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setIsTyping(false);
      } catch (err) {
        console.error('[ChatWidget] Failed to send message:', err);
        setIsTyping(false);
      }
    }
  }, [session, apiUrl]);

  const escalateToHuman = useCallback(async (reason?: string): Promise<Ticket | null> => {
    if (!session) return null;

    try {
      const response = await fetch(`${apiUrl}/chatbot/transfer-to-human`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          reason: reason || 'User requested'
        })
      });

      if (!response.ok) throw new Error('Failed to escalate');

      const data = await response.json();
      return data.ticket;
    } catch (err) {
      console.error('[ChatWidget] Failed to escalate:', err);
      return null;
    }
  }, [session, apiUrl]);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const value: ChatContextValue = {
    session,
    messages,
    isConnected,
    isTyping,
    unreadCount,
    sendMessage,
    escalateToHuman,
    clearUnread
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};
