const https = require('https');
const http = require('http');

/**
 * Microsoft Teams Integration
 * Handles ticket creation, notifications, and bidirectional chat
 */
class TeamsIntegration {
  constructor(config) {
    this.webhookUrl = config.webhookUrl;
    this.botToken = config.botToken;
    this.enabled = !!this.webhookUrl;

    console.log('[TeamsIntegration] Initialized:', {
      enabled: this.enabled,
      hasWebhook: !!this.webhookUrl,
      hasToken: !!this.botToken
    });
  }

  /**
   * Create a support ticket in Teams
   */
  async createTicket(ticket) {
    if (!this.enabled) {
      console.warn('[TeamsIntegration] Disabled - no webhook URL');
      return { sent: false, reason: 'disabled' };
    }

    const priorityEmoji = this.getPriorityEmoji(ticket.priority);
    const priorityColor = this.getPriorityColor(ticket.priority);
    const priorityLabel = this.getPriorityLabel(ticket.priority);

    // Build adaptive card for Teams
    const card = {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.4',
            body: [
              {
                type: 'Container',
                style: this.getPriorityStyle(ticket.priority),
                items: [
                  {
                    type: 'ColumnSet',
                    columns: [
                      {
                        type: 'Column',
                        width: 'auto',
                        items: [
                          {
                            type: 'TextBlock',
                            text: priorityEmoji,
                            size: 'ExtraLarge'
                          }
                        ]
                      },
                      {
                        type: 'Column',
                        width: 'stretch',
                        items: [
                          {
                            type: 'TextBlock',
                            text: `Nouveau Ticket: ${ticket.id}`,
                            weight: 'Bolder',
                            size: 'Large'
                          },
                          {
                            type: 'TextBlock',
                            text: `Priorité: ${priorityLabel}`,
                            color: priorityColor,
                            weight: 'Bolder'
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                type: 'FactSet',
                facts: [
                  {
                    title: 'Utilisateur:',
                    value: ticket.userName || ticket.userId
                  },
                  {
                    title: 'Rôle:',
                    value: ticket.context.role || 'N/A'
                  },
                  {
                    title: 'Bot:',
                    value: this.formatBotType(ticket.context.botType)
                  },
                  {
                    title: 'Session:',
                    value: ticket.sessionId
                  },
                  {
                    title: 'Raison:',
                    value: ticket.reason
                  },
                  {
                    title: 'Créé le:',
                    value: new Date(ticket.createdAt).toLocaleString('fr-FR')
                  }
                ]
              },
              {
                type: 'TextBlock',
                text: 'Derniers messages:',
                weight: 'Bolder',
                separator: true
              },
              ...this.buildMessageItems(ticket.context.messages)
            ],
            actions: [
              {
                type: 'Action.OpenUrl',
                title: 'Voir dans le dashboard',
                url: `${process.env.DASHBOARD_URL || 'https://admin.rt-technologie.com'}/chatbot/tickets/${ticket.id}`
              },
              {
                type: 'Action.Submit',
                title: 'Prendre en charge',
                data: {
                  action: 'assign',
                  ticketId: ticket.id
                }
              },
              {
                type: 'Action.Submit',
                title: 'Résoudre',
                data: {
                  action: 'resolve',
                  ticketId: ticket.id
                }
              }
            ]
          }
        }
      ]
    };

    // Add diagnostics section if available
    if (ticket.context.diagnostics && ticket.context.diagnostics.results) {
      const diagnosticsItems = this.buildDiagnosticsItems(ticket.context.diagnostics.results);
      if (diagnosticsItems.length > 0) {
        card.attachments[0].content.body.push(
          {
            type: 'TextBlock',
            text: 'Diagnostics:',
            weight: 'Bolder',
            separator: true
          },
          ...diagnosticsItems
        );
      }
    }

    try {
      await this.sendToWebhook(card);
      console.log(`[TeamsIntegration] Ticket ${ticket.id} sent to Teams`);
      return { sent: true };
    } catch (err) {
      console.error('[TeamsIntegration] Failed to send ticket:', err);
      return { sent: false, error: err.message };
    }
  }

  /**
   * Send notification to Teams
   */
  async sendNotification(title, message, type = 'info') {
    if (!this.enabled) {
      return { sent: false, reason: 'disabled' };
    }

    const emoji = this.getNotificationEmoji(type);
    const color = this.getNotificationColor(type);

    const card = {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.4',
            body: [
              {
                type: 'Container',
                style: type === 'error' ? 'attention' : type === 'warning' ? 'warning' : 'default',
                items: [
                  {
                    type: 'ColumnSet',
                    columns: [
                      {
                        type: 'Column',
                        width: 'auto',
                        items: [
                          {
                            type: 'TextBlock',
                            text: emoji,
                            size: 'Large'
                          }
                        ]
                      },
                      {
                        type: 'Column',
                        width: 'stretch',
                        items: [
                          {
                            type: 'TextBlock',
                            text: title,
                            weight: 'Bolder',
                            size: 'Medium'
                          },
                          {
                            type: 'TextBlock',
                            text: message,
                            wrap: true
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ]
    };

    try {
      await this.sendToWebhook(card);
      return { sent: true };
    } catch (err) {
      console.error('[TeamsIntegration] Failed to send notification:', err);
      return { sent: false, error: err.message };
    }
  }

  /**
   * Send update about ticket status
   */
  async sendTicketUpdate(ticketId, status, message) {
    if (!this.enabled) {
      return { sent: false, reason: 'disabled' };
    }

    const emoji = status === 'resolved' ? '✅' : status === 'in_progress' ? '⏳' : '📝';

    return this.sendNotification(
      `Ticket ${ticketId} - ${status}`,
      message,
      status === 'resolved' ? 'success' : 'info'
    );
  }

  /**
   * Send webhook request
   */
  sendToWebhook(payload) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify(payload);
      const u = new URL(this.webhookUrl);
      const isHttps = u.protocol === 'https:';

      const options = {
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: u.pathname + (u.search || ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const client = isHttps ? https : http;
      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data });
          } else {
            reject(new Error(`Teams webhook returned ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  /**
   * Build message items for adaptive card
   */
  buildMessageItems(messages) {
    if (!messages || messages.length === 0) {
      return [];
    }

    // Get last 5 messages
    const recentMessages = messages.slice(-5);
    const items = [];

    recentMessages.forEach((msg) => {
      const roleIcon = msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : '⚙️';
      const roleName = msg.role === 'user' ? 'Utilisateur' : msg.role === 'assistant' ? 'Bot' : 'Système';

      items.push({
        type: 'TextBlock',
        text: `${roleIcon} **${roleName}**: ${msg.content}`,
        wrap: true,
        spacing: 'Small'
      });
    });

    return items;
  }

  /**
   * Build diagnostics items for adaptive card
   */
  buildDiagnosticsItems(diagnostics) {
    if (!diagnostics || diagnostics.length === 0) {
      return [];
    }

    const items = [];

    diagnostics.forEach((diag) => {
      const statusIcon = diag.status === 'ok' ? '✅' :
        diag.status === 'warning' ? '⚠️' :
          diag.status === 'error' ? '❌' : '❓';

      items.push({
        type: 'TextBlock',
        text: `${statusIcon} **${diag.check}**: ${diag.message}`,
        wrap: true,
        spacing: 'Small',
        color: diag.status === 'error' ? 'Attention' : diag.status === 'warning' ? 'Warning' : 'Default'
      });
    });

    return items;
  }

  /**
   * Get priority emoji
   */
  getPriorityEmoji(priority) {
    switch (priority) {
      case 1:
        return '🚨';
      case 2:
        return '⚠️';
      case 3:
        return '📋';
      default:
        return '❓';
    }
  }

  /**
   * Get priority color for adaptive card
   */
  getPriorityColor(priority) {
    switch (priority) {
      case 1:
        return 'Attention';
      case 2:
        return 'Warning';
      case 3:
        return 'Good';
      default:
        return 'Default';
    }
  }

  /**
   * Get priority style for container
   */
  getPriorityStyle(priority) {
    switch (priority) {
      case 1:
        return 'attention';
      case 2:
        return 'warning';
      default:
        return 'default';
    }
  }

  /**
   * Get priority label
   */
  getPriorityLabel(priority) {
    switch (priority) {
      case 1:
        return 'URGENT/CRITIQUE';
      case 2:
        return 'IMPORTANT';
      case 3:
        return 'STANDARD';
      default:
        return 'INCONNU';
    }
  }

  /**
   * Get notification emoji
   */
  getNotificationEmoji(type) {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  }

  /**
   * Get notification color
   */
  getNotificationColor(type) {
    switch (type) {
      case 'success':
        return 'Good';
      case 'error':
        return 'Attention';
      case 'warning':
        return 'Warning';
      default:
        return 'Default';
    }
  }

  /**
   * Format bot type for display
   */
  formatBotType(botType) {
    const names = {
      'planif-ia': 'Assistant Planif\'IA',
      'routier': 'Assistant Routier',
      'quai-wms': 'Assistant Quai & WMS',
      'livraisons': 'Assistant Livraisons',
      'expedition': 'Assistant Expédition',
      'freight-ia': 'Assistant Freight IA',
      'copilote-chauffeur': 'Copilote Chauffeur',
      'helpbot': 'RT HelpBot'
    };

    return names[botType] || botType;
  }
}

module.exports = { TeamsIntegration };
