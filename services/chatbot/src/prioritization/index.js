/**
 * Prioritization Engine for RT HelpBot
 *
 * Priority Levels:
 * 1 - URGENT/CRITICAL: Immediate technician transfer required
 * 2 - IMPORTANT: Priority handling with reinforced follow-up
 * 3 - STANDARD: Normal handling by bot with documentation resources
 */

class PrioritizationEngine {
  constructor() {
    // Critical keywords that trigger immediate escalation
    this.criticalKeywords = [
      'bloqué', 'blocage', 'bloqu',
      'impossible', 'ne peux pas', 'cannot',
      'urgent', 'critique', 'critical',
      'perte de données', 'data loss',
      'sécurité', 'security breach',
      'production down', 'production arrêtée',
      'clients impactés', 'customers impacted',
      'crash', 'plantage', 'freeze',
      'api down', 'api ne répond pas',
      'erp déconnecté', 'erp disconnect',
      'commandes bloquées', 'orders blocked',
      'documents non transmis', 'documents not sent',
      'affectation impossible', 'cannot assign'
    ];

    // Important keywords that require priority handling
    this.importantKeywords = [
      'erreur', 'error',
      'problème', 'problem',
      'bug',
      'ne fonctionne pas', 'not working',
      'affret ia', 'affret.ia',
      'signature électronique', 'e-signature',
      'rendez-vous', 'rdv', 'appointment',
      'grille tarifaire', 'pricing grid',
      'tracking',
      'pod', 'proof of delivery',
      'intégration', 'integration'
    ];

    // Issues that require diagnostics
    this.diagnosticsKeywords = [
      'api', 'erp', 'tms', 'wms',
      'connexion', 'connection',
      'intégration', 'integration',
      'synchronisation', 'sync',
      'timeout', 'slow', 'lent',
      'erreur serveur', 'server error',
      'transporteur', 'carrier',
      'document', 'fichier', 'file'
    ];
  }

  /**
   * Assess priority level of a support request
   * @param {string} message - Current user message
   * @param {Array} conversationHistory - Full conversation history
   * @param {Array} diagnosticsResults - Results from diagnostics if available
   * @returns {number} Priority level (1-3)
   */
  assessPriority(message, conversationHistory = [], diagnosticsResults = null) {
    const lowerMessage = message.toLowerCase();

    // Priority 1: URGENT/CRITICAL
    // Check for critical keywords
    for (const keyword of this.criticalKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        console.log(`[Prioritization] URGENT detected: keyword "${keyword}"`);
        return 1;
      }
    }

    // Check for multiple exclamation marks (indicates urgency)
    if ((message.match(/!/g) || []).length >= 3) {
      console.log('[Prioritization] URGENT detected: multiple exclamation marks');
      return 1;
    }

    // Check for critical diagnostic failures
    if (diagnosticsResults && diagnosticsResults.length > 0) {
      const criticalFailures = diagnosticsResults.filter(d =>
        d.status === 'error' && d.severity === 'critical'
      );

      if (criticalFailures.length > 0) {
        console.log('[Prioritization] URGENT detected: critical diagnostic failures');
        return 1;
      }
    }

    // Check conversation duration without resolution
    if (conversationHistory.length > 0) {
      const userMessages = conversationHistory.filter(m => m.role === 'user');
      const recentUserMessages = userMessages.filter(m =>
        Date.now() - m.timestamp < 15 * 60 * 1000 // Last 15 minutes
      );

      // If 4+ user messages in 15 minutes without resolution
      if (recentUserMessages.length >= 4) {
        console.log('[Prioritization] URGENT detected: prolonged unresolved issue');
        return 1;
      }
    }

    // Priority 2: IMPORTANT
    // Check for important keywords
    for (const keyword of this.importantKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        console.log(`[Prioritization] IMPORTANT detected: keyword "${keyword}"`);
        return 2;
      }
    }

    // Check for important diagnostic warnings
    if (diagnosticsResults && diagnosticsResults.length > 0) {
      const importantWarnings = diagnosticsResults.filter(d =>
        d.status === 'warning' || (d.status === 'error' && d.severity === 'high')
      );

      if (importantWarnings.length >= 2) {
        console.log('[Prioritization] IMPORTANT detected: multiple diagnostic warnings');
        return 2;
      }
    }

    // Check for business impact keywords
    const businessImpactKeywords = [
      'client', 'customer', 'commande', 'order',
      'livraison', 'delivery', 'transport', 'chauffeur', 'driver'
    ];

    let businessImpactScore = 0;
    for (const keyword of businessImpactKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        businessImpactScore++;
      }
    }

    if (businessImpactScore >= 2) {
      console.log('[Prioritization] IMPORTANT detected: business impact');
      return 2;
    }

    // Priority 3: STANDARD
    console.log('[Prioritization] STANDARD priority');
    return 3;
  }

  /**
   * Determine if diagnostics should be run
   */
  needsDiagnostics(message) {
    const lowerMessage = message.toLowerCase();

    for (const keyword of this.diagnosticsKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return true;
      }
    }

    return false;
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
        return 'UNKNOWN';
    }
  }

  /**
   * Get priority color for UI
   */
  getPriorityColor(priority) {
    switch (priority) {
      case 1:
        return '#DC2626'; // Red
      case 2:
        return '#F59E0B'; // Amber
      case 3:
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  }

  /**
   * Get expected response time based on priority
   */
  getExpectedResponseTime(priority) {
    switch (priority) {
      case 1:
        return '< 15 minutes'; // Immediate
      case 2:
        return '< 1 hour';
      case 3:
        return '< 4 hours';
      default:
        return 'Unknown';
    }
  }

  /**
   * Determine if escalation is needed based on interaction count
   */
  shouldEscalate(conversationHistory, currentPriority) {
    if (currentPriority === 1) {
      // Always escalate urgent issues
      return true;
    }

    // Count unresolved user interactions
    const userMessages = conversationHistory.filter(m => m.role === 'user');
    const recentMessages = userMessages.filter(m =>
      Date.now() - m.timestamp < 30 * 60 * 1000 // Last 30 minutes
    );

    // Escalate after 3 interactions without resolution
    if (recentMessages.length >= 3) {
      return true;
    }

    // Check for frustration indicators
    const lastUserMessages = userMessages.slice(-2);
    const frustrationIndicators = [
      'toujours pas', 'still not',
      'ne comprend pas', 'don\'t understand',
      'déjà dit', 'already said',
      'répète', 'repeat',
      'technicien', 'human', 'personne'
    ];

    for (const msg of lastUserMessages) {
      const lowerContent = msg.content.toLowerCase();
      for (const indicator of frustrationIndicators) {
        if (lowerContent.includes(indicator)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Generate escalation message for user
   */
  getEscalationMessage(priority, ticketId) {
    const priorityLabel = this.getPriorityLabel(priority);
    const responseTime = this.getExpectedResponseTime(priority);

    let message = `Votre demande a été transférée à notre équipe technique.\n\n`;
    message += `📋 Ticket: ${ticketId}\n`;
    message += `⚡ Priorité: ${priorityLabel}\n`;
    message += `⏱️ Temps de réponse estimé: ${responseTime}\n\n`;

    if (priority === 1) {
      message += `🚨 Votre demande est traitée en URGENCE. Un technicien va vous contacter immédiatement.`;
    } else if (priority === 2) {
      message += `⚠️ Votre demande est traitée en PRIORITÉ. Un technicien prendra contact avec vous rapidement.`;
    } else {
      message += `✅ Un technicien reviendra vers vous dans les meilleurs délais.`;
    }

    return message;
  }

  /**
   * Analyze conversation patterns
   */
  analyzeConversationPatterns(conversationHistory) {
    const patterns = {
      repetitiveQuestions: false,
      escalatingTone: false,
      technicalIssue: false,
      businessImpact: false
    };

    if (conversationHistory.length < 2) {
      return patterns;
    }

    // Check for repetitive questions
    const userMessages = conversationHistory.filter(m => m.role === 'user');
    const messageContents = userMessages.map(m => m.content.toLowerCase());

    for (let i = 0; i < messageContents.length - 1; i++) {
      for (let j = i + 1; j < messageContents.length; j++) {
        // Simple similarity check (can be enhanced with Levenshtein distance)
        const similarity = this.calculateSimilarity(messageContents[i], messageContents[j]);
        if (similarity > 0.7) {
          patterns.repetitiveQuestions = true;
          break;
        }
      }
    }

    // Check for escalating tone (more exclamation marks, caps)
    const recentMessages = userMessages.slice(-3);
    let exclamationTrend = 0;
    let capsTrend = 0;

    recentMessages.forEach((msg, idx) => {
      const exclamations = (msg.content.match(/!/g) || []).length;
      const capsRatio = (msg.content.match(/[A-Z]/g) || []).length / msg.content.length;

      if (idx > 0) {
        if (exclamations > exclamationTrend) exclamationTrend = exclamations;
        if (capsRatio > capsTrend) capsTrend = capsRatio;
      }
    });

    if (exclamationTrend >= 2 || capsTrend > 0.3) {
      patterns.escalatingTone = true;
    }

    // Check for technical issue keywords
    const technicalKeywords = ['api', 'erreur', 'error', 'bug', 'crash', 'timeout'];
    patterns.technicalIssue = messageContents.some(msg =>
      technicalKeywords.some(kw => msg.includes(kw))
    );

    // Check for business impact keywords
    const businessKeywords = ['client', 'commande', 'livraison', 'urgent', 'perdu'];
    patterns.businessImpact = messageContents.some(msg =>
      businessKeywords.some(kw => msg.includes(kw))
    );

    return patterns;
  }

  /**
   * Simple string similarity calculation
   */
  calculateSimilarity(str1, str2) {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));

    return (2 * commonWords.length) / (words1.length + words2.length);
  }
}

module.exports = { PrioritizationEngine };
