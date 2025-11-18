// Utiliser des variables globales pour éviter les erreurs de redéclaration
if (!global.__chatbot_http) global.__chatbot_http = require('http');
if (!global.__chatbot_https) global.__chatbot_https = require('https');
if (!global.__chatbot_url) global.__chatbot_url = require('url');
if (!global.__chatbot_fs) global.__chatbot_fs = require('fs');
if (!global.__chatbot_path) global.__chatbot_path = require('path');
if (!global.__chatbot_ws) global.__chatbot_ws = require('ws');
if (!global.__chatbot_uuid) global.__chatbot_uuid = require('uuid');

var http = global.__chatbot_http;
var https = global.__chatbot_https;
var url = global.__chatbot_url;
var fs = global.__chatbot_fs;
var path = global.__chatbot_path;
var WebSocketServer = global.__chatbot_ws.WebSocketServer;
var uuidv4 = global.__chatbot_uuid.v4;

if (!global.__chatbot_security) {
  global.__chatbot_security = require('../../../packages/security/src/index.js');
}
if (!global.__chatbot_AIEngine) {
  global.__chatbot_AIEngine = require('./ai-engine/index.js').AIEngine;
}
if (!global.__chatbot_PrioritizationEngine) {
  global.__chatbot_PrioritizationEngine = require('./prioritization/index.js').PrioritizationEngine;
}
if (!global.__chatbot_DiagnosticsEngine) {
  global.__chatbot_DiagnosticsEngine = require('./diagnostics/index.js').DiagnosticsEngine;
}
if (!global.__chatbot_TeamsIntegration) {
  global.__chatbot_TeamsIntegration = require('./teams-integration/index.js').TeamsIntegration;
}
if (!global.__chatbot_KnowledgeBase) {
  global.__chatbot_KnowledgeBase = require('./knowledge-base/index.js').KnowledgeBase;
}

var addSecurityHeaders = global.__chatbot_security.addSecurityHeaders;
var handleCorsPreflight = global.__chatbot_security.handleCorsPreflight;
var requireAuth = global.__chatbot_security.requireAuth;
var limitBodySize = global.__chatbot_security.limitBodySize;
var rateLimiter = global.__chatbot_security.rateLimiter;
var AIEngine = global.__chatbot_AIEngine;
var PrioritizationEngine = global.__chatbot_PrioritizationEngine;
var DiagnosticsEngine = global.__chatbot_DiagnosticsEngine;
var TeamsIntegration = global.__chatbot_TeamsIntegration;
var KnowledgeBase = global.__chatbot_KnowledgeBase;

// In-memory stores (Redis en production)
if (!global.__chatbot_store) {
  global.__chatbot_store = {
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
}
var store = global.__chatbot_store;

// Initialize engines
if (!global.__chatbot_engines) {
  global.__chatbot_engines = {
    aiEngine: null,
    prioritizationEngine: null,
    diagnosticsEngine: null,
    teamsIntegration: null,
    knowledgeBase: null
  };
}

var initializeEngines = async function() {
  console.log('[chatbot] Initializing AI engines...');
  global.__chatbot_engines.aiEngine = new AIEngine({
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    internalModelUrl: process.env.INTERNAL_AI_MODEL_URL
  });

  global.__chatbot_engines.prioritizationEngine = new PrioritizationEngine();
  global.__chatbot_engines.diagnosticsEngine = new DiagnosticsEngine();
  global.__chatbot_engines.teamsIntegration = new TeamsIntegration({
    webhookUrl: process.env.TEAMS_WEBHOOK_URL,
    botToken: process.env.TEAMS_BOT_TOKEN
  });

  global.__chatbot_engines.knowledgeBase = new KnowledgeBase();
  await global.__chatbot_engines.knowledgeBase.initialize();

  console.log('[chatbot] Engines initialized successfully');
};

var json = function(res, status, body) {
  var data = JSON.stringify(body);
  addSecurityHeaders(res);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  });
  res.end(data);
};

var notFound = function(res) {
  json(res, 404, { error: 'Not Found' });
};

var parseBody = limitBodySize(10 * 1024 * 1024); // 10MB for file uploads

// Create or get session
var getOrCreateSession = function(userId, userName, role, botType) {
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
};

// Process message with AI
var processMessage = async function(session, message, attachments = []) {
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
  var botConfig = require(`./bots/${session.botType}.config.js`);

  // Search knowledge base
  var kbResults = await global.__chatbot_engines.knowledgeBase.search(message, session.botType);

  // Check if diagnostics needed
  var diagnosticsResults = null;
  if (session.botType === 'helpbot' && global.__chatbot_engines.prioritizationEngine.needsDiagnostics(message)) {
    diagnosticsResults = await global.__chatbot_engines.diagnosticsEngine.runDiagnostics(session.context, message);
    store.diagnostics.set(session.sessionId, {
      results: diagnosticsResults,
      timestamp: Date.now()
    });
  }

  // Build context for AI
  var context = {
    botType: session.botType,
    userName: session.userName,
    role: session.role,
    conversationHistory: session.messages.slice(-10), // Last 10 messages
    knowledgeBase: kbResults,
    diagnostics: diagnosticsResults,
    currentContext: session.context
  };

  // Get AI response
  var aiResponse = await global.__chatbot_engines.aiEngine.generateResponse(
    message,
    context,
    botConfig
  );

  // Add AI response to history
  var responseMessage = {
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
  var responseTime = Date.now() - startTime;
  store.analytics.averageResponseTime =
    (store.analytics.averageResponseTime * (store.analytics.totalMessages - 2) + responseTime) /
    store.analytics.totalMessages;

  // Check if escalation needed
  var escalationNeeded = false;
  var priority = null;

  if (session.botType === 'helpbot') {
    priority = global.__chatbot_engines.prioritizationEngine.assessPriority(message, session.messages, diagnosticsResults);

    // Count unresolved interactions
    var unresolvedCount = session.messages.filter(m =>
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
};

// Create support ticket and transfer to human
var transferToHuman = async function(sessionId, reason, priority) {
  var session = store.sessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  var ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Get conversation context
  var context = {
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
  var ticket = {
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
  await global.__chatbot_engines.teamsIntegration.createTicket(ticket);

  // Add system message to session
  session.messages.push({
    id: uuidv4(),
    role: 'system',
    content: `Votre demande a été transférée à un technicien. Ticket: ${ticketId}. Un technicien prendra contact avec vous sous peu.`,
    timestamp: Date.now()
  });

  return ticket;
};

// WebSocket connections
if (!global.__chatbot_wsConnections) {
  global.__chatbot_wsConnections = new Map();
}
var wsConnections = global.__chatbot_wsConnections;

var setupWebSocket = function(server) {
  var wss = new WebSocketServer({
    server,
    path: '/chatbot/ws'
  });

  wss.on('connection', (ws, req) => {
    var query = url.parse(req.url, true).query;
    var sessionId = query.sessionId;

    if (!sessionId || !store.sessions.has(sessionId)) {
      ws.close(4000, 'Invalid session');
      return;
    }

    console.log(`[chatbot] WebSocket connected: ${sessionId}`);
    wsConnections.set(sessionId, ws);

    ws.on('message', async (data) => {
      try {
        var payload = JSON.parse(data.toString());

        if (payload.type === 'message') {
          var session = store.sessions.get(sessionId);
          var result = await processMessage(
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
            var ticket = await transferToHuman(
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
};

// HTTP Server
var limiter = rateLimiter({ windowMs: 60000, max: 300 });

if (global.__chatbot_server) {
  try {
    global.__chatbot_server.close();
  } catch (e) {
    // Ignore errors on close
  }
}

global.__chatbot_server = http.createServer(async (req, res) => {
  var parsed = url.parse(req.url, true);
  var method = req.method || 'GET';
  var pathname = parsed.pathname || '/';

  addSecurityHeaders(res);
  if (handleCorsPreflight(req, res)) return;
  if (!limiter(req, res)) return;

  // Health check
  if (method === 'GET' && pathname === '/health') {
    var mongo = !!process.env.MONGODB_URI;
    return json(res, 200, {
      status: 'ok',
      service: 'chatbot',
      mongo,
      sessions: store.sessions.size,
      tickets: store.tickets.size
    });
  }

  // Authentication (optional via SECURITY_ENFORCE)
  var authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
  if (authResult === null) return;

  // POST /chatbot/session - Create or get session
  if (method === 'POST' && pathname === '/chatbot/session') {
    try {
      var body = (await parseBody(req)) || {};
      var userId = body.userId;
      var userName = body.userName;
      var role = body.role;
      var botType = body.botType;

      if (!userId || !botType) {
        return json(res, 400, { error: 'userId and botType required' });
      }

      var validBotTypes = [
        'planif-ia', 'routier', 'quai-wms', 'livraisons',
        'expedition', 'freight-ia', 'copilote-chauffeur', 'helpbot'
      ];

      if (!validBotTypes.includes(botType)) {
        return json(res, 400, { error: 'Invalid botType' });
      }

      var result = getOrCreateSession(userId, userName, role, botType);
      var sessionId = result.sessionId;
      var session = result.session;

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
      var body = (await parseBody(req)) || {};
      var sessionId = body.sessionId;
      var message = body.message;
      var attachments = body.attachments;

      if (!sessionId || !message) {
        return json(res, 400, { error: 'sessionId and message required' });
      }

      var session = store.sessions.get(sessionId);
      if (!session) {
        return json(res, 404, { error: 'Session not found' });
      }

      var result = await processMessage(session, message, attachments || []);

      // Send to WebSocket if connected
      var ws = wsConnections.get(sessionId);
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
    var sessionId = pathname.split('/').pop();
    var session = store.sessions.get(sessionId);

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
      var body = (await parseBody(req)) || {};
      var sessionId = body.sessionId;
      var reason = body.reason;

      if (!sessionId) {
        return json(res, 400, { error: 'sessionId required' });
      }

      var session = store.sessions.get(sessionId);
      if (!session) {
        return json(res, 404, { error: 'Session not found' });
      }

      // Assess priority
      var lastMessage = session.messages.filter(m => m.role === 'user').slice(-1)[0];
      var priority = global.__chatbot_engines.prioritizationEngine.assessPriority(
        lastMessage?.content || '',
        session.messages,
        store.diagnostics.get(sessionId)?.results
      );

      var ticket = await transferToHuman(sessionId, reason || 'User requested', priority);

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
    var sessionId = pathname.split('/').pop();
    var diagnostics = store.diagnostics.get(sessionId);

    if (!diagnostics) {
      return json(res, 404, { error: 'No diagnostics found for this session' });
    }

    return json(res, 200, diagnostics);
  }

  // POST /chatbot/diagnostics/run - Run diagnostics
  if (method === 'POST' && pathname === '/chatbot/diagnostics/run') {
    try {
      var body = (await parseBody(req)) || {};
      var context = body.context;
      var issue = body.issue;

      if (!context || !issue) {
        return json(res, 400, { error: 'context and issue required' });
      }

      var results = await global.__chatbot_engines.diagnosticsEngine.runDiagnostics(context, issue);

      return json(res, 200, { results });
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  // GET /chatbot/tickets - List all tickets
  if (method === 'GET' && pathname === '/chatbot/tickets') {
    var status = parsed.query.status;
    var priority = parsed.query.priority;

    var tickets = Array.from(store.tickets.values()).filter(ticket => {
      if (status && ticket.status !== status) return false;
      if (priority && ticket.priority !== parseInt(priority)) return false;
      return true;
    });

    return json(res, 200, { tickets });
  }

  // GET /chatbot/tickets/:ticketId - Get ticket details
  if (method === 'GET' && /^\/chatbot\/tickets\/.+/.test(pathname)) {
    var ticketId = pathname.split('/').pop();
    var ticket = store.tickets.get(ticketId);

    if (!ticket) {
      return json(res, 404, { error: 'Ticket not found' });
    }

    return json(res, 200, { ticket });
  }

  // PATCH /chatbot/tickets/:ticketId - Update ticket
  if (method === 'PATCH' && /^\/chatbot\/tickets\/.+/.test(pathname)) {
    try {
      var ticketId = pathname.split('/').pop();
      var ticket = store.tickets.get(ticketId);

      if (!ticket) {
        return json(res, 404, { error: 'Ticket not found' });
      }

      var body = (await parseBody(req)) || {};

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
      var query = parsed.query.q;
      var botType = parsed.query.botType;

      if (!query) {
        return json(res, 400, { error: 'Query parameter q required' });
      }

      var results = await global.__chatbot_engines.knowledgeBase.search(query, botType);

      return json(res, 200, { results });
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  return notFound(res);
});

var server = global.__chatbot_server;

// Initialize and start server
var PORT = process.env.CHATBOT_PORT ? Number(process.env.CHATBOT_PORT) : 3019;

// Éviter de redémarrer si déjà en cours d'exécution
if (!global.__chatbot_initialized) {
  global.__chatbot_initialized = true;

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
} else {
  console.log('[chatbot] Server already initialized, skipping restart');
}
