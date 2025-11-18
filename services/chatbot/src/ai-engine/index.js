const OpenAI = require('openai').default;
const Anthropic = require('@anthropic-ai/sdk').default;
const https = require('https');
const http = require('http');

class AIEngine {
  constructor(config) {
    this.openaiClient = config.openaiApiKey
      ? new OpenAI({ apiKey: config.openaiApiKey })
      : null;

    this.anthropicClient = config.anthropicApiKey
      ? new Anthropic({ apiKey: config.anthropicApiKey })
      : null;

    this.internalModelUrl = config.internalModelUrl;

    console.log('[AIEngine] Initialized with providers:', {
      openai: !!this.openaiClient,
      anthropic: !!this.anthropicClient,
      internal: !!this.internalModelUrl
    });
  }

  /**
   * Generate AI response based on user message and context
   */
  async generateResponse(userMessage, context, botConfig) {
    const { botType, userName, role, conversationHistory, knowledgeBase, diagnostics } = context;

    // Build system prompt from bot config and context
    const systemPrompt = this.buildSystemPrompt(botConfig, context);

    // Build user prompt with context
    const userPrompt = this.buildUserPrompt(userMessage, {
      conversationHistory,
      knowledgeBase,
      diagnostics
    });

    // Try providers in order: Internal -> OpenAI -> Anthropic -> Fallback
    let response = null;
    let provider = null;

    try {
      if (this.internalModelUrl) {
        response = await this.queryInternalModel(systemPrompt, userPrompt);
        provider = 'internal';
      }
    } catch (err) {
      console.warn('[AIEngine] Internal model failed:', err.message);
    }

    if (!response && this.openaiClient) {
      try {
        response = await this.queryOpenAI(systemPrompt, userPrompt, conversationHistory);
        provider = 'openai';
      } catch (err) {
        console.warn('[AIEngine] OpenAI failed:', err.message);
      }
    }

    if (!response && this.anthropicClient) {
      try {
        response = await this.queryAnthropic(systemPrompt, userPrompt, conversationHistory);
        provider = 'anthropic';
      } catch (err) {
        console.warn('[AIEngine] Anthropic failed:', err.message);
      }
    }

    if (!response) {
      // Fallback to rule-based response
      response = this.getFallbackResponse(userMessage, context);
      provider = 'fallback';
    }

    console.log(`[AIEngine] Response generated via ${provider}`);

    return {
      content: response.content,
      confidence: response.confidence || 0.8,
      suggestedActions: this.extractSuggestedActions(response.content, botConfig),
      provider
    };
  }

  /**
   * Build system prompt from bot configuration
   */
  buildSystemPrompt(botConfig, context) {
    const { userName, role } = context;

    let prompt = `${botConfig.systemPrompt}\n\n`;
    prompt += `Vous assistez actuellement ${userName} qui a le rôle: ${role}.\n`;
    prompt += `Bot type: ${botConfig.name}\n`;
    prompt += `Capabilities: ${botConfig.capabilities.join(', ')}\n\n`;

    prompt += `RÈGLES IMPORTANTES:\n`;
    prompt += `1. Soyez précis, concis et professionnel\n`;
    prompt += `2. Utilisez le contexte de la conversation pour des réponses pertinentes\n`;
    prompt += `3. Si vous ne savez pas, dites-le honnêtement\n`;
    prompt += `4. Suggérez des actions concrètes quand approprié\n`;
    prompt += `5. Pour les problèmes critiques, recommandez un transfert vers un technicien\n`;

    if (botConfig.integrations && botConfig.integrations.length > 0) {
      prompt += `\nIntégrations disponibles: ${botConfig.integrations.join(', ')}\n`;
    }

    return prompt;
  }

  /**
   * Build user prompt with context
   */
  buildUserPrompt(userMessage, contextData) {
    let prompt = '';

    // Add conversation history
    if (contextData.conversationHistory && contextData.conversationHistory.length > 0) {
      prompt += 'HISTORIQUE DE CONVERSATION:\n';
      const recent = contextData.conversationHistory.slice(-5);
      recent.forEach(msg => {
        if (msg.role === 'user') {
          prompt += `Utilisateur: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          prompt += `Assistant: ${msg.content}\n`;
        }
      });
      prompt += '\n';
    }

    // Add knowledge base results
    if (contextData.knowledgeBase && contextData.knowledgeBase.length > 0) {
      prompt += 'INFORMATIONS PERTINENTES DE LA BASE DE CONNAISSANCES:\n';
      contextData.knowledgeBase.forEach((item, idx) => {
        prompt += `${idx + 1}. ${item.title}: ${item.content}\n`;
      });
      prompt += '\n';
    }

    // Add diagnostics results
    if (contextData.diagnostics && contextData.diagnostics.length > 0) {
      prompt += 'RÉSULTATS DE DIAGNOSTICS:\n';
      contextData.diagnostics.forEach(diag => {
        prompt += `- ${diag.check}: ${diag.status} ${diag.message ? '(' + diag.message + ')' : ''}\n`;
      });
      prompt += '\n';
    }

    prompt += `QUESTION ACTUELLE:\n${userMessage}`;

    return prompt;
  }

  /**
   * Query OpenAI GPT-4
   */
  async queryOpenAI(systemPrompt, userPrompt, conversationHistory) {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const completion = await this.openaiClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    const content = completion.choices[0].message.content;
    const finishReason = completion.choices[0].finish_reason;

    return {
      content,
      confidence: finishReason === 'stop' ? 0.9 : 0.7
    };
  }

  /**
   * Query Anthropic Claude
   */
  async queryAnthropic(systemPrompt, userPrompt, conversationHistory) {
    const message = await this.anthropicClient.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    });

    const content = message.content[0].text;

    return {
      content,
      confidence: message.stop_reason === 'end_turn' ? 0.9 : 0.7
    };
  }

  /**
   * Query internal RT model
   */
  async queryInternalModel(systemPrompt, userPrompt) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        system: systemPrompt,
        prompt: userPrompt
      });

      const u = new URL(this.internalModelUrl);
      const isHttps = u.protocol === 'https:';

      const options = {
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: u.pathname,
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
          try {
            const json = JSON.parse(data);
            resolve({
              content: json.response || json.content || json.text,
              confidence: json.confidence || 0.85
            });
          } catch (err) {
            reject(new Error('Invalid response from internal model'));
          }
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  /**
   * Fallback response for when all AI providers fail
   */
  getFallbackResponse(userMessage, context) {
    const lowerMessage = userMessage.toLowerCase();

    // Simple keyword matching
    if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
      return {
        content: `Je suis là pour vous aider. Voici ce que je peux faire:\n\n` +
          `- Répondre à vos questions sur l'utilisation de la plateforme\n` +
          `- Vous guider dans les procédures\n` +
          `- Diagnostiquer les problèmes techniques\n` +
          `- Vous mettre en contact avec un technicien si nécessaire\n\n` +
          `Quelle est votre question ?`,
        confidence: 0.6
      };
    }

    if (lowerMessage.includes('merci') || lowerMessage.includes('thank')) {
      return {
        content: 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions.',
        confidence: 0.9
      };
    }

    if (lowerMessage.includes('problème') || lowerMessage.includes('erreur') || lowerMessage.includes('bug')) {
      return {
        content: `Je comprends que vous rencontrez un problème. Pour mieux vous aider:\n\n` +
          `1. Pouvez-vous décrire précisément ce qui ne fonctionne pas ?\n` +
          `2. Quand avez-vous constaté ce problème ?\n` +
          `3. Avez-vous un message d'erreur ?\n\n` +
          `Si le problème est urgent, je peux vous mettre en contact avec un technicien immédiatement.`,
        confidence: 0.7
      };
    }

    // Default response
    return {
      content: `Je ne suis pas sûr de bien comprendre votre question. Pouvez-vous la reformuler ou me donner plus de détails ?\n\n` +
        `Si vous avez besoin d'une assistance immédiate, je peux vous transférer vers un technicien.`,
      confidence: 0.4
    };
  }

  /**
   * Extract suggested actions from response
   */
  extractSuggestedActions(content, botConfig) {
    const actions = [];

    // Look for action indicators in response
    const actionPatterns = [
      /cliquez sur (?:le bouton )?"([^"]+)"/gi,
      /accédez à (?:la page |l'onglet )?"([^"]+)"/gi,
      /ouvrez (?:le menu |la section )?"([^"]+)"/gi,
      /consultez (?:la documentation |le guide )?"([^"]+)"/gi
    ];

    actionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        actions.push({
          type: 'navigate',
          label: match[1],
          url: null // To be filled by frontend
        });
      }
    });

    // Add bot-specific quick actions
    if (botConfig.quickActions) {
      botConfig.quickActions.forEach(action => {
        if (content.toLowerCase().includes(action.trigger.toLowerCase())) {
          actions.push(action);
        }
      });
    }

    return actions;
  }

  /**
   * Detect user intent from message
   */
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();

    const intents = {
      greeting: ['bonjour', 'salut', 'hello', 'hi', 'bonsoir'],
      help: ['aide', 'help', 'comment', 'how to', 'besoin'],
      problem: ['problème', 'erreur', 'bug', 'ne fonctionne pas', 'doesn\'t work'],
      question: ['?', 'pourquoi', 'quand', 'où', 'qui', 'quoi', 'why', 'when', 'where'],
      thanks: ['merci', 'thank', 'remercie'],
      escalate: ['technicien', 'humain', 'personne', 'human', 'support']
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return intent;
      }
    }

    return 'unknown';
  }
}

module.exports = { AIEngine };
