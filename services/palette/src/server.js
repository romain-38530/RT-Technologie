const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { addSecurityHeaders, handleCorsPreflight, requireAuth, limitBodySize, rateLimiter } = require('../../../packages/security/src/index.js');

const PORT = Number(process.env.PALETTE_PORT || '3011');
const parseBody = limitBodySize(2 * 1024 * 1024); // 2MB pour photos

// In-memory stores
const store = {
  companies: new Map(),        // companyId -> { id, name, type, ... }
  sites: new Map(),            // siteId -> { id, companyId, address, gps, quotas, ... }
  palletLedger: new Map(),     // companyId -> { balance, history: [...] }
  palletCheques: new Map(),    // chequeId -> { id, from, to, quantity, status, qrCode, signatures, photos, ... }
  palletDisputes: new Map(),   // disputeId -> { chequeId, claimant, reason, photos, status, resolution, ... }
  palletSiteQuota: new Map(),  // siteId -> { daily, consumed, openingHours, availableDays, priority, ... }
};

// Charger les seeds
function loadSeeds() {
  try {
    const base = path.resolve(process.cwd(), 'infra', 'seeds');

    // Companies (transporteurs, industriels, logisticiens)
    const companies = loadJSON(path.join(base, 'palette-companies.json')) || [];
    companies.forEach(c => store.companies.set(c.id, c));

    // Sites de restitution
    const sites = loadJSON(path.join(base, 'palette-sites.json')) || [];
    sites.forEach(s => {
      store.sites.set(s.id, s);
      // Initialiser les quotas
      store.palletSiteQuota.set(s.id, {
        siteId: s.id,
        dailyMax: s.quotaDailyMax || 100,
        consumed: 0,
        openingHours: s.openingHours || { start: '08:00', end: '18:00' },
        availableDays: s.availableDays || [1, 2, 3, 4, 5], // Lun-Ven
        priority: s.priority || 'NETWORK', // INTERNAL | NETWORK
        lastReset: new Date().toISOString().split('T')[0]
      });
    });

    // Ledger initial (soldes palettes)
    const ledger = loadJSON(path.join(base, 'palette-ledger.json')) || [];
    ledger.forEach(l => store.palletLedger.set(l.companyId, l));

    console.log(`[palette] Seeds: ${store.companies.size} companies, ${store.sites.size} sites`);
  } catch (e) {
    console.warn('[palette] Erreur chargement seeds:', e.message);
  }
}

function loadJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e) {
    return null;
  }
}

// Fonction helper JSON
function json(res, status, body) {
  const data = JSON.stringify(body);
  addSecurityHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

// Générer un chèque-palette avec QR code
function generatePalletCheque(params) {
  const { fromCompanyId, toSiteId, orderId, quantity, transporterPlate } = params;
  const chequeId = `CHQ-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const qrCode = `RT-PALETTE://${chequeId}`;

  const cheque = {
    id: chequeId,
    orderId,
    fromCompanyId,
    toSiteId,
    quantity: Number(quantity),
    palletType: 'EURO_EPAL',
    transporterPlate: transporterPlate || '',
    qrCode,
    status: 'EMIS', // EMIS → DEPOSE → RECU → LITIGE
    createdAt: new Date().toISOString(),
    depositedAt: null,
    receivedAt: null,
    signatures: {
      transporter: null,
      receiver: null
    },
    photos: [],
    geolocations: {
      deposit: null,
      receipt: null
    },
    cryptoSignature: generateEd25519Signature(chequeId)
  };

  store.palletCheques.set(chequeId, cheque);
  return cheque;
}

// Signature Ed25519 simulée (en production, utiliser une vraie lib crypto)
function generateEd25519Signature(data) {
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `ed25519:${hash.substring(0, 64)}`;
}

// Matching intelligent de site (Affret.IA)
async function findBestReturnSite(deliveryLocation, companyId) {
  const { lat, lng } = deliveryLocation;
  const maxRadius = Number(process.env.PALETTE_MATCH_RADIUS_KM || '30');

  const candidates = [];
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay(); // 0=Dim, 1=Lun, ...

  for (const [siteId, site] of store.sites.entries()) {
    // Vérifier le quota du jour
    const quota = store.palletSiteQuota.get(siteId);
    if (!quota) continue;

    // Reset quota si nouveau jour
    if (quota.lastReset !== today) {
      quota.consumed = 0;
      quota.lastReset = today;
    }

    // Quota atteint ?
    if (quota.consumed >= quota.dailyMax) continue;

    // Jour disponible ?
    if (!quota.availableDays.includes(dayOfWeek)) continue;

    // Calcul distance (formule Haversine simplifiée)
    const distance = calculateDistance(lat, lng, site.gps.lat, site.gps.lng);
    if (distance > maxRadius) continue;

    // Priorité interne ?
    let priorityScore = 1;
    if (quota.priority === 'INTERNAL' && site.companyId === companyId) {
      priorityScore = 2;
    }

    candidates.push({
      siteId,
      site,
      distance,
      quotaRemaining: quota.dailyMax - quota.consumed,
      priorityScore,
      score: (priorityScore * 1000) - distance // Plus le score est élevé, mieux c'est
    });
  }

  if (candidates.length === 0) return null;

  // Trier par score décroissant
  candidates.sort((a, b) => b.score - a.score);

  return {
    bestSite: candidates[0],
    alternatives: candidates.slice(1, 3) // Top 3
  };
}

// Calcul distance Haversine (approximatif en km)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Rayon terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Mettre à jour le ledger
function updateLedger(companyId, delta, reason, chequeId) {
  if (!store.palletLedger.has(companyId)) {
    store.palletLedger.set(companyId, { companyId, balance: 0, history: [] });
  }
  const ledger = store.palletLedger.get(companyId);
  ledger.balance += delta;
  ledger.history.push({
    date: new Date().toISOString(),
    delta,
    reason,
    chequeId,
    newBalance: ledger.balance
  });
}

// Rate limiter
const limiter = rateLimiter({ windowMs: 60000, max: 240 });

// Serveur HTTP
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method || 'GET';
  const pathname = url.pathname;
  const traceIdHdr = req.headers['x-trace-id'];
  const traceId = Array.isArray(traceIdHdr) ? traceIdHdr[0] : traceIdHdr;

  addSecurityHeaders(res);
  if (handleCorsPreflight(req, res)) return;
  if (!limiter(req, res)) return;

  // Health check
  if (method === 'GET' && pathname === '/health') {
    return json(res, 200, {
      status: 'ok',
      mongo: !!process.env.MONGODB_URI,
      cheques: store.palletCheques.size,
      sites: store.sites.size
    });
  }

  // Auth (optionnel selon env)
  const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
  if (authResult === null) return;

  // ========== ENDPOINTS CHÈQUES-PALETTE ==========

  // POST /palette/cheques/generate
  // Génère un chèque-palette pour une commande
  if (method === 'POST' && pathname === '/palette/cheques/generate') {
    try {
      const body = (await parseBody(req)) || {};
      const { fromCompanyId, orderId, quantity, deliveryLocation, transporterPlate } = body;

      if (!fromCompanyId || !orderId || !quantity || !deliveryLocation) {
        return json(res, 400, { error: 'fromCompanyId, orderId, quantity, deliveryLocation requis' });
      }

      // Matching IA pour trouver le meilleur site
      const match = await findBestReturnSite(deliveryLocation, fromCompanyId);

      if (!match || !match.bestSite) {
        return json(res, 404, { error: 'no_site_available', message: 'Aucun site de restitution disponible dans un rayon de 30km' });
      }

      const toSiteId = match.bestSite.siteId;

      // Générer le chèque
      const cheque = generatePalletCheque({ fromCompanyId, toSiteId, orderId, quantity, transporterPlate });

      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 201, {
        cheque,
        matchedSite: match.bestSite,
        alternatives: match.alternatives,
        traceId: traceId || null
      });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // GET /palette/cheques/:id
  // Récupère un chèque-palette par ID
  if (method === 'GET' && /^\/palette\/cheques\/.+/.test(pathname)) {
    const chequeId = pathname.split('/').pop();
    const cheque = store.palletCheques.get(chequeId);

    if (!cheque) return json(res, 404, { error: 'Chèque-palette introuvable' });

    if (traceId) res.setHeader('x-trace-id', traceId);
    return json(res, 200, { cheque, traceId: traceId || null });
  }

  // POST /palette/cheques/:id/deposit
  // Dépose un chèque-palette (scan transporteur)
  if (method === 'POST' && /^\/palette\/cheques\/.+\/deposit$/.test(pathname)) {
    const chequeId = pathname.split('/')[2];
    const cheque = store.palletCheques.get(chequeId);

    if (!cheque) return json(res, 404, { error: 'Chèque-palette introuvable' });
    if (cheque.status !== 'EMIS') return json(res, 400, { error: 'Chèque déjà déposé ou reçu' });

    try {
      const body = (await parseBody(req)) || {};
      const { transporterSignature, geolocation, photo } = body;

      if (!transporterSignature || !geolocation) {
        return json(res, 400, { error: 'transporterSignature et geolocation requis' });
      }

      cheque.status = 'DEPOSE';
      cheque.depositedAt = new Date().toISOString();
      cheque.signatures.transporter = transporterSignature;
      cheque.geolocations.deposit = geolocation;
      if (photo) cheque.photos.push({ type: 'DEPOSIT', url: photo, at: new Date().toISOString() });

      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, { cheque, traceId: traceId || null });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // POST /palette/cheques/:id/receive
  // Réceptionne un chèque-palette (scan logisticien/industriel)
  if (method === 'POST' && /^\/palette\/cheques\/.+\/receive$/.test(pathname)) {
    const chequeId = pathname.split('/')[2];
    const cheque = store.palletCheques.get(chequeId);

    if (!cheque) return json(res, 404, { error: 'Chèque-palette introuvable' });
    if (cheque.status !== 'DEPOSE') return json(res, 400, { error: 'Chèque doit être déposé avant réception' });

    try {
      const body = (await parseBody(req)) || {};
      const { receiverSignature, geolocation, photo, quantityReceived } = body;

      if (!receiverSignature || !geolocation) {
        return json(res, 400, { error: 'receiverSignature et geolocation requis' });
      }

      cheque.status = 'RECU';
      cheque.receivedAt = new Date().toISOString();
      cheque.signatures.receiver = receiverSignature;
      cheque.geolocations.receipt = geolocation;
      cheque.quantityReceived = quantityReceived || cheque.quantity;
      if (photo) cheque.photos.push({ type: 'RECEIPT', url: photo, at: new Date().toISOString() });

      // Mettre à jour le ledger
      updateLedger(cheque.fromCompanyId, -cheque.quantityReceived, 'CHEQUE_RECEIVED', chequeId);

      // Incrémenter le quota du site
      const quota = store.palletSiteQuota.get(cheque.toSiteId);
      if (quota) quota.consumed += cheque.quantityReceived;

      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, { cheque, traceId: traceId || null });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // ========== ENDPOINTS LEDGER ==========

  // GET /palette/ledger/:companyId
  // Récupère le solde palettes d'une entreprise
  if (method === 'GET' && /^\/palette\/ledger\/.+/.test(pathname)) {
    const companyId = pathname.split('/').pop();
    const ledger = store.palletLedger.get(companyId) || { companyId, balance: 0, history: [] };

    if (traceId) res.setHeader('x-trace-id', traceId);
    return json(res, 200, { ledger, traceId: traceId || null });
  }

  // ========== ENDPOINTS SITES ==========

  // GET /palette/sites
  // Liste tous les sites de restitution
  if (method === 'GET' && pathname === '/palette/sites') {
    const sitesList = Array.from(store.sites.values());

    if (traceId) res.setHeader('x-trace-id', traceId);
    return json(res, 200, { sites: sitesList, traceId: traceId || null });
  }

  // GET /palette/sites/:id
  // Détail d'un site
  if (method === 'GET' && /^\/palette\/sites\/.+/.test(pathname)) {
    const siteId = pathname.split('/').pop();
    const site = store.sites.get(siteId);
    const quota = store.palletSiteQuota.get(siteId);

    if (!site) return json(res, 404, { error: 'Site introuvable' });

    if (traceId) res.setHeader('x-trace-id', traceId);
    return json(res, 200, { site, quota, traceId: traceId || null });
  }

  // POST /palette/sites/:id/quota
  // Mettre à jour les quotas d'un site
  if (method === 'POST' && /^\/palette\/sites\/.+\/quota$/.test(pathname)) {
    const siteId = pathname.split('/')[2];
    const site = store.sites.get(siteId);

    if (!site) return json(res, 404, { error: 'Site introuvable' });

    try {
      const body = (await parseBody(req)) || {};
      const { dailyMax, openingHours, availableDays, priority } = body;

      const quota = store.palletSiteQuota.get(siteId);
      if (dailyMax !== undefined) quota.dailyMax = Number(dailyMax);
      if (openingHours) quota.openingHours = openingHours;
      if (availableDays) quota.availableDays = availableDays;
      if (priority) quota.priority = priority;

      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, { quota, traceId: traceId || null });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // ========== ENDPOINTS LITIGES ==========

  // POST /palette/disputes
  // Créer un litige
  if (method === 'POST' && pathname === '/palette/disputes') {
    try {
      const body = (await parseBody(req)) || {};
      const { chequeId, claimantId, reason, photos, comments } = body;

      if (!chequeId || !claimantId || !reason) {
        return json(res, 400, { error: 'chequeId, claimantId, reason requis' });
      }

      const cheque = store.palletCheques.get(chequeId);
      if (!cheque) return json(res, 404, { error: 'Chèque-palette introuvable' });

      const disputeId = `DISP-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      const dispute = {
        id: disputeId,
        chequeId,
        claimantId,
        reason,
        photos: photos || [],
        comments: comments || '',
        status: 'OPEN', // OPEN → PROPOSED → RESOLVED | ESCALATED
        createdAt: new Date().toISOString(),
        resolution: null,
        proposedSolution: null,
        validatedBy: []
      };

      store.palletDisputes.set(disputeId, dispute);
      cheque.status = 'LITIGE';

      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 201, { dispute, traceId: traceId || null });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // GET /palette/disputes
  // Liste des litiges
  if (method === 'GET' && pathname === '/palette/disputes') {
    const disputesList = Array.from(store.palletDisputes.values());

    if (traceId) res.setHeader('x-trace-id', traceId);
    return json(res, 200, { disputes: disputesList, traceId: traceId || null });
  }

  // ========== MATCHING IA ==========

  // POST /palette/match/site
  // Trouve le meilleur site de restitution pour une localisation
  if (method === 'POST' && pathname === '/palette/match/site') {
    try {
      const body = (await parseBody(req)) || {};
      const { deliveryLocation, companyId } = body;

      if (!deliveryLocation || !deliveryLocation.lat || !deliveryLocation.lng) {
        return json(res, 400, { error: 'deliveryLocation avec lat/lng requis' });
      }

      const match = await findBestReturnSite(deliveryLocation, companyId);

      if (!match || !match.bestSite) {
        return json(res, 404, { error: 'no_site_available', message: 'Aucun site de restitution disponible' });
      }

      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, {
        bestSite: match.bestSite,
        alternatives: match.alternatives,
        traceId: traceId || null
      });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  return json(res, 404, { error: 'Not Found' });
});

// Charger les seeds et démarrer le serveur
loadSeeds();
server.listen(PORT, () => {
  console.log(`[palette] HTTP prêt sur :${PORT}`);
});
