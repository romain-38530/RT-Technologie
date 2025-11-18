/**
 * Exemple d'intégration du Chatbot Widget dans l'app web-industry
 * Ce fichier montre comment intégrer le chatbot dans n'importe quelle app RT Technologie
 */

import React from 'react';
import { ChatWidget, ChatProvider } from '@rt/chatbot-widget';

interface ChatbotIntegrationProps {
  userId: string;
  userName: string;
  organizationId: string;
}

export const ChatbotIntegration: React.FC<ChatbotIntegrationProps> = ({
  userId,
  userName,
  organizationId
}) => {
  // Configuration du chatbot pour l'espace industriel
  const botType = 'planif-ia'; // Assistant Planif'IA pour les industriels

  // Contexte métier à transmettre au chatbot
  const context = {
    organizationId,
    module: 'industry',
    currentPage: window.location.pathname,
    // Ajoutez d'autres données contextuelles pertinentes
  };

  // Callbacks optionnels
  const handleSessionCreated = (session: any) => {
    console.log('[Chatbot] Session créée:', session);
  };

  const handleMessageSent = (message: any) => {
    console.log('[Chatbot] Message envoyé:', message);
  };

  const handleEscalation = (ticket: any) => {
    console.log('[Chatbot] Escalade vers technicien:', ticket);
    // Vous pouvez afficher une notification ici
    alert(`Ticket créé: ${ticket.id}. Un technicien va vous contacter.`);
  };

  return (
    <ChatProvider
      botType={botType}
      userId={userId}
      userName={userName}
      role="industrial"
      apiUrl={process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:3019'}
      context={context}
    >
      <ChatWidget
        botType={botType}
        userId={userId}
        userName={userName}
        role="industrial"
        context={context}
        onSessionCreated={handleSessionCreated}
        onMessageSent={handleMessageSent}
        onEscalation={handleEscalation}
      />
    </ChatProvider>
  );
};

/**
 * Utilisation dans l'app:
 *
 * Dans votre layout ou page principale (_app.tsx ou layout.tsx):
 *
 * import { ChatbotIntegration } from '@/components/ChatbotIntegration';
 *
 * // Dans le composant:
 * <ChatbotIntegration
 *   userId={user.id}
 *   userName={user.name}
 *   organizationId={user.organizationId}
 * />
 */

/**
 * Mapping des botTypes par application:
 *
 * - web-industry: 'planif-ia' (Assistant Planif'IA)
 * - web-transporter: 'routier' (Assistant Routier)
 * - web-logistician: 'quai-wms' (Assistant Quai & WMS)
 * - web-recipient: 'livraisons' (Assistant Livraisons)
 * - web-supplier: 'expedition' (Assistant Expédition)
 * - web-forwarder: 'freight-ia' (Assistant Freight IA)
 * - mobile-driver: 'copilote-chauffeur' (Copilote Chauffeur)
 * - backoffice-admin: 'helpbot' (RT HelpBot)
 * - kiosk: 'helpbot' (RT HelpBot)
 */
