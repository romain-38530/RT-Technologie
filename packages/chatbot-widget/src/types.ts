/**
 * Type definitions for Chatbot Widget
 */

export type BotType =
  | 'planif-ia'
  | 'routier'
  | 'quai-wms'
  | 'livraisons'
  | 'expedition'
  | 'freight-ia'
  | 'copilote-chauffeur'
  | 'helpbot';

export type Priority = 1 | 2 | 3;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: FileAttachment[];
  confidence?: number;
  suggestedActions?: SuggestedAction[];
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface SuggestedAction {
  type: 'navigate' | 'diagnostic' | 'escalate' | 'action';
  label: string;
  url?: string;
  action?: string;
  params?: Record<string, any>;
}

export interface ChatSession {
  sessionId: string;
  botType: BotType;
  userName: string;
  createdAt: number;
  lastActivity: number;
}

export interface Ticket {
  id: string;
  priority: Priority;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: number;
}

export interface ChatWidgetProps {
  botType: BotType;
  userId: string;
  userName: string;
  role: string;
  apiUrl?: string;
  wsUrl?: string;
  context?: Record<string, any>;
  onSessionCreated?: (session: ChatSession) => void;
  onMessageSent?: (message: ChatMessage) => void;
  onEscalation?: (ticket: Ticket) => void;
  className?: string;
}

export interface ChatContextValue {
  session: ChatSession | null;
  messages: ChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  unreadCount: number;
  sendMessage: (content: string, attachments?: FileAttachment[]) => Promise<void>;
  escalateToHuman: (reason?: string) => Promise<Ticket | null>;
  clearUnread: () => void;
}
