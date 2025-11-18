/**
 * RT Technologie Chatbot Widget
 * Composant React réutilisable pour intégration dans toutes les apps
 */

export { ChatWidget } from './ChatWidget';
export { ChatProvider, useChatContext } from './ChatContext';
export { MessageBubble } from './components/MessageBubble';
export { FileUpload } from './components/FileUpload';
export { QuickActions } from './components/QuickActions';
export { StatusIndicator } from './components/StatusIndicator';
export { UrgencySelector } from './components/UrgencySelector';

export type {
  ChatMessage,
  ChatSession,
  BotType,
  Priority,
  ChatWidgetProps
} from './types';
