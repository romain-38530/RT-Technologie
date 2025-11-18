const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

const { addSecurityHeaders, handleCorsPreflight, requireAuth, limitBodySize, rateLimiter } = require('../../../packages/security/src/index.js');
const { AIEngine } = require('./ai-engine/index.js');
const { PrioritizationEngine } = require('./prioritization/index.js');
const { DiagnosticsEngine } = require('./diagnostics/index.js');
const { TeamsIntegration } = require('./teams-integration/index.js');
const { KnowledgeBase } = require('./knowledge-base/index.js');

// In-memory stores (Redis en production)
const store = {
  sessions: new Map(), // sessionId -> { userId, userName, role, botType, messages: [], createdAt, lastActivity }
  tickets: new Map(), // ticketId -> { sessionId, priority, status, createdAt, assignedTo, resolvedAt }
  diagnostics: new Map(), // sessionId -> { results: [], timestamp }
  analytics: {
    totalMessages: 0,
    totalSessions: 0,
    totalTickets: 0,
    resolutionRate: 0,
    averageResponseTime: 0,
    satisfactionScore: 0
  }
};

// Initialize engines
let aiEngine;
let prioritizationEngine;
let diagnosticsEngine;
let teamsIntegration;
let knowledgeBase;

async function initializeEngines() {
  console.log('[chatbot] Initializing AI engines...');
  aiEngine = new AIEngine({
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    internalModelUrl: process.env.INTERNAL_AI_MODEL_URL
  });

  prioritizationEngine = new PrioritizationEngine();
  diagnosticsEngine = new DiagnosticsEngine();
  teamsIntegration = new TeamsIntegration({
    webhookUrl: process.env.TEAMS_WEBHOOK_URL,
    botToken: process.env.TEAMS_BOT_TOKEN
  });

  knowledgeBase = new KnowledgeBase();
  await knowledgeBase.initialize();

  console.log('[chatbot] Engines initialized successfully');
}

function json(res, status, body) {
  const data = JSON.stringify(body);
  addSecurityHeaders(res);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  });
  res.end(data);
}

function notFound(res) {
  json(res, 404, { error: 'Not Found' });
}

const parseBody = limitBodySize(10 * 1024 * 1024); // 10MB for file uploads

// Create or get session
function getOrCreateSession(userId, userName, role, botType) {
  // Check for existing session
  for (const [sessionId, session] of store.sessions.entries()) {
    if (session.userId === userId && session.botType === botType) {
      session.lastActivity = Date.now();
      return { sessionId, session };
    }
  }

  // Create new session
  const sessionId = uuidv4();
  const session = {
    userId,
    userName,
    role,
    botType,
    messages: [],
    createdAt: Date.now(),
    lastActivity: Date.now(),
    context: {}
  };
  store.sessions.set(sessionId, session);
  store.analytics.totalSessions++;
  return { sessionId, session };
}

// Process message with AI
async function processMessage(session, message, attachments = []) {
  const startTime = Date.now();

  // Add user message to history
  session.messages.push({
    id: uuidv4(),
    role: 'user',
    content: message,
    attachments,
    timestamp: Date.now()
  });

  // Get bot configuration
  const botConfig = require(`./bots/${session.botType}.config.js`);

  // Search knowledge base
  const kbResults = await knowledgeBase.search(message, session.botType);

  // Check if diagnostics needed
  let diagnosticsResults = null;
  if (session.botType === 'helpbot' && prioritizationEngine.needsDiagnostics(message)) {
    diagnosticsResults = await diagnosticsEngine.runDiagnostics(session.context, message);
    store.diagnostics.set(session.sessionId, {
      results: diagnosticsResults,
      timestamp: Date.now()
    });
  }

  // Build context for AI
  const context = {
    botType: session.botType,
    userName: session.userName,
    role: session.role,
    conversationHistory: session.messages.slice(-10), // Last 10 messages
    knowledgeBase: kbResults,
    diagnostics: diagnosticsResults,
    currentContext: session.context
  };

  // Get AI response
  const aiResponse = await aiEngine.generateResponse(
    message,
    context,
    botConfig
  );

  // Add AI response to history
  const responseMessage = {
    id: uuidv4(),
    role: 'assistant',
    content: aiResponse.content,
    confidence: aiResponse.confidence,
    suggestedActions: aiResponse.suggestedActions || [],
    timestamp: Date.now()
  };
  session.messages.push(responseMessage);

  // Update analytics
  store.analytics.totalMessages += 2;
  const responseTime = Date.now() - startTime;
  store.analytics.averageResponseTime =
    (store.analytics.averageResponseTime * (store.analytics.totalMessages - 2) + responseTime) /
    store.analytics.totalMessages;

  // Check if escalation needed
  let escalationNeeded = false;
  let priority = null;

  if (session.botType === 'helpbot') {
    priority = prioritizationEngine.assessPriority(message, session.messages, diagnosticsResults);

    // Count unresolved interactions
    const unresolvedCount = session.messages.filter(m =>
      m.role === 'user' && m.timestamp > Date.now() - 10 * 60 * 1000
    ).length;

    escalationNeeded =
      priority === 1 || // Urgent/Critical
      unresolvedCount >= 3 || // 3+ interactions without resolution
      aiResponse.confidence < 0.5; // Low confidence
  }

  return {
    message: responseMessage,
    escalationNeeded,
    priority,
    diagnostics: diagnosticsResults
  };
}

// Create support ticket and transfer to human
async function transferToHuman(sessionId, reason, priority) {
  const session = store.sessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Get conversation context
  const context = {
    sessionId,
    userId: session.userId,
    userName: session.userName,
    role: session.role,
    botType: session.botType,
    messages: session.messages,
    diagnostics: store.diagnostics.get(sessionId),
    reason,
    priority
  };

  // Create ticket
  const ticket = {
    id: ticketId,
    sessionId,
    userId: session.userId,
    userName: session.userName,
    priority,
    status: 'open',
    reason,
    context,
    createdAt: Date.now(),
    assignedTo: null,
    resolvedAt: null
  };

  store.tickets.set(ticketId, ticket);
  store.analytics.totalTickets++;

  // Send to Teams
  await teamsIntegration.createTicket(ticket);

  // Add system message to session
  session.messages.push({
    id: uuidv4(),
    role: 'system',
    content: `Votre demande a été transférée à un technicien. Ticket: ${ticketId}. Un technicien prendra contact avec vous sous peu.`,
    timestamp: Date.now()
  });

  return ticket;
}

// WebSocket connections
const wsConnections = new Map(); // sessionId -> WebSocket

function setupWebSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: '/chatbot/ws'
  });

  wss.on('connection', (ws, req) => {
    const query = url.parse(req.url, true).query;
    const sessionId = query.sessionId;

    if (!sessionId || !store.sessions.has(sessionId)) {
      ws.close(4000, 'Invalid session');
      return;
    }

    console.log(`[chatbot] WebSocket connected: ${sessionId}`);
    wsConnections.set(sessionId, ws);

    ws.on('message', async (data) => {
      try {
        const payload = JSON.parse(data.toString());

        if (payload.type === 'message') {
          const session = store.sessions.get(sessionId);
          const result = await processMessage(
            session,
            payload.message,
            payload.attachments || []
          );

          ws.send(JSON.stringify({
            type: 'response',
            message: result.message,
            escalationNeeded: result.escalationNeeded
          }));

          // Auto-escalate if needed
          if (result.escalationNeeded) {
            const ticket = await transferToHuman(
              sessionId,
              'Automatic escalation',
              result.priority
            );

            ws.send(JSON.stringify({
              type: 'escalated',
              ticket: {
                id: ticket.id,
                priority: ticket.priority
              }
            }));
          }
        } else if (payload.type === 'typing') {
          // Handle typing indicator
          ws.send(JSON.stringify({ type: 'typing', isTyping: true }));
        }
      } catch (err) {
        console.error('[chatbot] WebSocket error:', err);
        ws.send(JSON.stringify({
          type: 'error',
          error: err.message
        }));
      }
    });

    ws.on('close', () => {
      console.log(`[chatbot] WebSocket disconnected: ${sessionId}`);
      wsConnections.delete(sessionId);
    });

    ws.on('error', (err) => {
      console.error('[chatbot] WebSocket error:', err);
      wsConnections.delete(sessionId);
    });
  });

  console.log('[chatbot] WebSocket server initialized');
}

// HTTP Server
const limiter = rateLimiter({ windowMs: 60000, max: 300 });

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const method = req.method || 'GET';
  const pathname = parsed.pathname || '/';

  addSecurityHeaders(res);
  if (handleCorsPreflight(req, res)) return;
  if (!limiter(req, res)) return;

  // Health check
  if (method === 'GET' && pathname === '/health') {
    const mongo = !!process.env.MONGODB_URI;
    return json(res, 200, {
      status: 'ok',
      service: 'chatbot',
      mongo,
      sessions: store.sessions.size,
      tickets: store.tickets.size
    });
  }

  // Authentication (optional via SECURITY_ENFORCE)
  const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
  if (authResult === null) return;

  // POST /chatbot/session - Create or get session
  if (method === 'POST' && pathname === '/chatbot/session') {
    try {
      const body = (await parseBody(req)) || {};
      const { userId, userName, role, botType } = body;

      if (!userId || !botType) {
        return json(res, 400, { error: 'userId and botType required' });
      }

      const validBotTypes = [
        'planif-ia', 'routier', 'quai-wms', 'livraisons',
        'expedition', 'freight-ia', 'copilote-chauffeur', 'helpbot'
      ];

      if (!validBotTypes.includes(botType)) {
        return json(res, 400, { error: 'Invalid botType' });
      }

      const { sessionId, session } = getOrCreateSession(userId, userName, role, botType);

      return json(res, 200, {
        sessionId,
        botType: session.botType,
        userName: session.userName,
        createdAt: session.createdAt
      });
    } catch (err) {
      return json(res, 400, { error: err.message });
    }
  }

  // POST /chatbot/message - Send message
  if (method === 'POST' && pathname === '/chatbot/message') {
    try {
      const body = (await parseBody(req)) || {};
      const { sessionId, message, attachments } = body;

      if (!sessionId || !message) {
        return json(res, 400, { error: 'sessionId and message required' });
      }

      const session = store.sessions.get(sessionId);
      if (!session) {
        return json(res, 404, { error: 'Session not found' });
      }

      const result = await processMessage(session, message, attachments || []);

      // Send to WebSocket if connected
      const ws = wsConnections.get(sessionId);
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: 'response',
          message: result.message
        }));
      }

      return json(res, 200, {
        message: result.message,
        escalationNeeded: result.escalationNeeded,
        diagnostics: result.diagnostics
      });
    } catch (err) {
      console.error('[chatbot] Message error:', err);
      return json(res, 500, { error: err.message });
    }
  }

  // GET /chatbot/history/:sessionId - Get conversation history
  if (method === 'GET' && /^\/chatbot\/history\/.+/.test(pathname)) {
    const sessionId = pathname.split('/').pop();
    const session = store.sessions.get(sessionId);

    if (!session) {
      return json(res, 404, { error: 'Session not found' });
    }

    return json(res, 200, {
      sessionId,
      messages: session.messages,
      context: session.context,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    });
  }

  // POST /chatbot/transfer-to-human - Transfer to human support
  if (method === 'POST' && pathname === '/chatbot/transfer-to-human') {
    try {
      const body = (await parseBody(req)) || {};
      const { sessionId, reason } = body;

      if (!sessionId) {
        return json(res, 400, { error: 'sessionId required' });
      }

      const session = store.sessions.get(sessionId);
      if (!session) {
        return json(res, 404, { error: 'Session not found' });
      }

      // Assess priority
      const lastMessage = session.messages.filter(m => m.role === 'user').slice(-1)[0];
      const priority = prioritizationEngine.assessPriority(
        lastMessage?.content || '',
        session.messages,
        store.diagnostics.get(sessionId)?.results
      );

      const ticket = await transferToHuman(sessionId, reason || 'User requested', priority);

      return json(res, 200, {
        ticket: {
          id: ticket.id,
          priority: ticket.priority,
          status: ticket.status,
          createdAt: ticket.createdAt
        }
      });
    } catch (err) {
      console.error('[chatbot] Transfer error:', err);
      return json(res, 500, { error: err.message });
    }
  }

  // GET /chatbot/diagnostics/:sessionId - Get diagnostics
  if (method === 'GET' && /^\/chatbot\/diagnostics\/.+/.test(pathname)) {
    const sessionId = pathname.split('/').pop();
    const diagnostics = store.diagnostics.get(sessionId);

    if (!diagnostics) {
      return json(res, 404, { error: 'No diagnostics found for this session' });
    }

    return json(res, 200, diagnostics);
  }

  // POST /chatbot/diagnostics/run - Run diagnostics
  if (method === 'POST' && pathname === '/chatbot/diagnostics/run') {
    try {
      const body = (await parseBody(req)) || {};
      const { context, issue } = body;

      if (!context || !issue) {
        return json(res, 400, { error: 'context and issue required' });
      }

      const results = await diagnosticsEngine.runDiagnostics(context, issue);

      return json(res, 200, { results });
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  // GET /chatbot/tickets - List all tickets
  if (method === 'GET' && pathname === '/chatbot/tickets') {
    const status = parsed.query.status;
    const priority = parsed.query.priority;

    const tickets = Array.from(store.tickets.values()).filter(ticket => {
      if (status && ticket.status !== status) return false;
      if (priority && ticket.priority !== parseInt(priority)) return false;
      return true;
    });

    return json(res, 200, { tickets });
  }

  // GET /chatbot/tickets/:ticketId - Get ticket details
  if (method === 'GET' && /^\/chatbot\/tickets\/.+/.test(pathname)) {
    const ticketId = pathname.split('/').pop();
    const ticket = store.tickets.get(ticketId);

    if (!ticket) {
      return json(res, 404, { error: 'Ticket not found' });
    }

    return json(res, 200, { ticket });
  }

  // PATCH /chatbot/tickets/:ticketId - Update ticket
  if (method === 'PATCH' && /^\/chatbot\/tickets\/.+/.test(pathname)) {
    try {
      const ticketId = pathname.split('/').pop();
      const ticket = store.tickets.get(ticketId);

      if (!ticket) {
        return json(res, 404, { error: 'Ticket not found' });
      }

      const body = (await parseBody(req)) || {};

      if (body.status) ticket.status = body.status;
      if (body.assignedTo) ticket.assignedTo = body.assignedTo;
      if (body.status === 'resolved') {
        ticket.resolvedAt = Date.now();
        store.analytics.resolutionRate =
          (store.analytics.resolutionRate * (store.analytics.totalTickets - 1) + 1) /
          store.analytics.totalTickets;
      }

      return json(res, 200, { ticket });
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  // GET /chatbot/analytics - Get analytics
  if (method === 'GET' && pathname === '/chatbot/analytics') {
    return json(res, 200, {
      analytics: store.analytics,
      sessions: {
        total: store.sessions.size,
        active: Array.from(store.sessions.values()).filter(s =>
          Date.now() - s.lastActivity < 30 * 60 * 1000
        ).length
      },
      tickets: {
        total: store.tickets.size,
        open: Array.from(store.tickets.values()).filter(t => t.status === 'open').length,
        resolved: Array.from(store.tickets.values()).filter(t => t.status === 'resolved').length
      }
    });
  }

  // GET /chatbot/knowledge-base/search - Search knowledge base
  if (method === 'GET' && pathname === '/chatbot/knowledge-base/search') {
    try {
      const query = parsed.query.q;
      const botType = parsed.query.botType;

      if (!query) {
        return json(res, 400, { error: 'Query parameter q required' });
      }

      const results = await knowledgeBase.search(query, botType);

      return json(res, 200, { results });
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  return notFound(res);
});

// Initialize and start server
const PORT = process.env.PORT ? Number(process.env.PORT) : 3019;

(async () => {
  try {
    await initializeEngines();

    server.listen(PORT, () => {
      console.log(`[chatbot] HTTP server ready on :${PORT}`);
      setupWebSocket(server);
    });
  } catch (err) {
    console.error('[chatbot] Failed to start:', err);
    process.exit(1);
  }
})();
