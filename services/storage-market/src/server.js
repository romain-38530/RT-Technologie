const http = global.http || require('http');
const https = global.https || require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { sendEmail } = require('../../../packages/notify-client/src/index.js');
const { addSecurityHeaders, handleCorsPreflight, requireAuth, limitBodySize, rateLimiter } = require('../../../packages/security/src/index.js');
const { hasFeature, FEATURES } = require('../../../packages/entitlements/src/index.js');

// In-memory stores
const store = {
  storageNeeds: new Map(),
  logisticianSites: new Map(),
  storageOffers: new Map(),
  storageContracts: new Map(),
  logisticianCapacities: new Map(),
  wmsConnections: new Map(),
  subscriptions: new Map(),
};

function loadJSON(p) {
  try {
    const data = fs.readFileSync(p, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load', p, e.message);
    return null;
  }
}

async function loadSeeds() {
  const base = path.resolve(process.cwd(), 'infra', 'seeds');

  if (process.env.MONGODB_URI) {
    try {
      const mongo = require('../../../packages/data-mongo/src/index.js');
      await mongo.connect();
      const db = await mongo.getDb();

      const [needs, sites, offers, contracts] = await Promise.all([
        db.collection('storage_needs').find({}).toArray(),
        db.collection('logistician_sites').find({}).toArray(),
        db.collection('storage_offers').find({}).toArray(),
        db.collection('storage_contracts').find({}).toArray(),
      ]);

      (needs || []).forEach((n) => store.storageNeeds.set(n.id, n));
      (sites || []).forEach((s) => {
        const arr = store.logisticianSites.get(s.logisticianId) || [];
        arr.push(s);
        store.logisticianSites.set(s.logisticianId, arr);
      });
      (offers || []).forEach((o) => {
        const arr = store.storageOffers.get(o.needId) || [];
        arr.push(o);
        store.storageOffers.set(o.needId, arr);
      });
      (contracts || []).forEach((c) => store.storageContracts.set(c.id, c));

      console.log(`[storage-market] Mongo loaded: ${store.storageNeeds.size} needs, ${store.storageContracts.size} contracts.`);
      return;
    } catch (e) {
      console.warn('[storage-market] Mongo unavailable, fallback to seeds:', e.message);
    }
  }

  const needs = loadJSON(path.join(base, 'storage-needs.json')) || [];
  needs.forEach((n) => store.storageNeeds.set(n.id, n));

  const sites = loadJSON(path.join(base, 'logistician-sites.json')) || [];
  sites.forEach((s) => {
    const arr = store.logisticianSites.get(s.logisticianId) || [];
    arr.push(s);
    store.logisticianSites.set(s.logisticianId, arr);
  });

  const offers = loadJSON(path.join(base, 'storage-offers.json')) || [];
  offers.forEach((o) => {
    const arr = store.storageOffers.get(o.needId) || [];
    arr.push(o);
    store.storageOffers.set(o.needId, arr);
  });

  const contracts = loadJSON(path.join(base, 'storage-contracts.json')) || [];
  contracts.forEach((c) => store.storageContracts.set(c.id, c));

  console.log(`[storage-market] Seeds loaded: ${store.storageNeeds.size} needs, ${store.storageContracts.size} contracts.`);
}

function json(res, status, body) {
  const data = JSON.stringify(body);
  addSecurityHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

function notFound(res) {
  json(res, 404, { error: 'Not Found' });
}

const parseBody = limitBodySize(5 * 1024 * 1024); // 5MB for documents

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Haversine distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// AI Ranking Algorithm
function rankOffers(offers, need) {
  const ranked = offers.map(offer => {
    let score = 0;
    const reasons = [];

    // 1. Price (40 points)
    const prices = offers.map(o => o.totalPrice || 0);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const priceRatio = (offer.totalPrice || 0) / avgPrice;

    if (priceRatio <= 0.8) {
      score += 40;
      reasons.push('Prix très compétitif (-20% vs moyenne)');
    } else if (priceRatio <= 1.0) {
      score += 40 * (1.2 - priceRatio) / 0.2;
      reasons.push('Prix avantageux');
    } else if (priceRatio <= 1.2) {
      score += 40 * (1.2 - priceRatio) / 0.2;
      reasons.push('Prix dans la moyenne');
    } else {
      reasons.push('Prix au-dessus de la moyenne');
    }

    // 2. Proximity (25 points)
    if (need.location && offer.siteLocation) {
      const distance = calculateDistance(
        need.location.lat, need.location.lon,
        offer.siteLocation.lat, offer.siteLocation.lon
      );

      if (distance <= 50) {
        score += 25;
        reasons.push(`Très proche (${Math.round(distance)}km)`);
      } else if (distance <= 100) {
        score += 25 * (100 - distance) / 50;
        reasons.push(`Proximité acceptable (${Math.round(distance)}km)`);
      } else if (distance <= 200) {
        score += 25 * (200 - distance) / 100 * 0.5;
        reasons.push(`Distance modérée (${Math.round(distance)}km)`);
      } else {
        reasons.push(`Distance élevée (${Math.round(distance)}km)`);
      }
    }

    // 3. Reliability (20 points)
    const reliability = offer.reliabilityScore || 75;
    score += (reliability / 100) * 20;
    if (reliability >= 90) {
      reasons.push('Excellent historique de fiabilité');
    } else if (reliability >= 75) {
      reasons.push('Bonne fiabilité');
    }

    // 4. Reactivity (15 points)
    const responseTime = offer.responseTimeHours || 24;
    if (responseTime <= 2) {
      score += 15;
      reasons.push('Réponse ultra-rapide');
    } else if (responseTime <= 6) {
      score += 15 * (6 - responseTime) / 4;
      reasons.push('Réponse rapide');
    } else if (responseTime <= 24) {
      score += 15 * (24 - responseTime) / 18 * 0.5;
      reasons.push('Réponse dans les délais');
    }

    return {
      ...offer,
      aiScore: Math.round(score * 10) / 10,
      aiReasons: reasons,
      aiRank: 0 // Will be set after sorting
    };
  });

  // Sort by score descending
  ranked.sort((a, b) => b.aiScore - a.aiScore);

  // Assign ranks
  ranked.forEach((offer, index) => {
    offer.aiRank = index + 1;
    if (index < 3) {
      offer.aiRecommended = true;
    }
  });

  return ranked;
}

const limiter = rateLimiter({ windowMs: 60000, max: 240 });

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
    return json(res, 200, { status: 'ok', service: 'storage-market', mongo });
  }

  // Auth (optional via SECURITY_ENFORCE)
  const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
  if (authResult === null) return;

  // ============================================
  // PUBLICATION DE BESOINS (Industriel)
  // ============================================

  // POST /storage-market/needs/create
  if (method === 'POST' && pathname === '/storage-market/needs/create') {
    try {
      const body = await parseBody(req);
      const need = {
        id: generateId('NEED'),
        createdAt: new Date().toISOString(),
        status: 'PUBLISHED',
        ownerOrgId: body.ownerOrgId || authResult?.claims?.orgId || 'IND-1',
        ...body
      };

      store.storageNeeds.set(need.id, need);

      if (process.env.MONGODB_URI) {
        try {
          const mongo = require('../../../packages/data-mongo/src/index.js');
          const db = await mongo.getDb();
          await db.collection('storage_needs').insertOne(need);
        } catch (e) {
          console.warn('[storage-market] save mongo failed', e.message);
        }
      }

      // Send notifications to matching logisticians
      if (need.publicationType === 'GLOBAL' || need.publicationType === 'MIXED') {
        // TODO: Notify subscribed logisticians
        console.log('[storage-market] New need published globally:', need.id);
      }

      return json(res, 201, { need });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // GET /storage-market/needs
  if (method === 'GET' && pathname === '/storage-market/needs') {
    const ownerOrgId = parsed.query.ownerOrgId;
    const status = parsed.query.status;
    const publicationType = parsed.query.publicationType;

    let needs = Array.from(store.storageNeeds.values());

    if (ownerOrgId) {
      needs = needs.filter(n => n.ownerOrgId === ownerOrgId);
    }
    if (status) {
      needs = needs.filter(n => n.status === status);
    }
    if (publicationType) {
      needs = needs.filter(n => n.publicationType === publicationType || n.publicationType === 'MIXED');
    }

    return json(res, 200, { items: needs });
  }

  // GET /storage-market/needs/:id
  if (method === 'GET' && /^\/storage-market\/needs\/[^\/]+$/.test(pathname)) {
    const id = pathname.split('/').pop();
    const need = store.storageNeeds.get(id);
    if (!need) return notFound(res);
    return json(res, 200, { need });
  }

  // PUT /storage-market/needs/:id
  if (method === 'PUT' && /^\/storage-market\/needs\/[^\/]+$/.test(pathname)) {
    const id = pathname.split('/').pop();
    const need = store.storageNeeds.get(id);
    if (!need) return notFound(res);

    try {
      const body = await parseBody(req);
      const updated = { ...need, ...body, id, updatedAt: new Date().toISOString() };
      store.storageNeeds.set(id, updated);

      if (process.env.MONGODB_URI) {
        try {
          const mongo = require('../../../packages/data-mongo/src/index.js');
          const db = await mongo.getDb();
          await db.collection('storage_needs').updateOne({ id }, { $set: updated });
        } catch (e) {
          console.warn('[storage-market] update mongo failed', e.message);
        }
      }

      return json(res, 200, { need: updated });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // DELETE /storage-market/needs/:id
  if (method === 'DELETE' && /^\/storage-market\/needs\/[^\/]+$/.test(pathname)) {
    const id = pathname.split('/').pop();
    const need = store.storageNeeds.get(id);
    if (!need) return notFound(res);

    store.storageNeeds.delete(id);

    if (process.env.MONGODB_URI) {
      try {
        const mongo = require('../../../packages/data-mongo/src/index.js');
        const db = await mongo.getDb();
        await db.collection('storage_needs').deleteOne({ id });
      } catch (e) {
        console.warn('[storage-market] delete mongo failed', e.message);
      }
    }

    return json(res, 200, { deleted: true, id });
  }

  // ============================================
  // OFFRES DES LOGISTICIENS
  // ============================================

  // POST /storage-market/offers/send
  if (method === 'POST' && pathname === '/storage-market/offers/send') {
    try {
      const body = await parseBody(req);
      const offer = {
        id: generateId('OFFER'),
        createdAt: new Date().toISOString(),
        status: 'SUBMITTED',
        logisticianId: body.logisticianId || authResult?.claims?.orgId || 'LOG-1',
        ...body
      };

      const arr = store.storageOffers.get(offer.needId) || [];
      arr.push(offer);
      store.storageOffers.set(offer.needId, arr);

      if (process.env.MONGODB_URI) {
        try {
          const mongo = require('../../../packages/data-mongo/src/index.js');
          const db = await mongo.getDb();
          await db.collection('storage_offers').insertOne(offer);
        } catch (e) {
          console.warn('[storage-market] save mongo failed', e.message);
        }
      }

      // Notify industriel
      const need = store.storageNeeds.get(offer.needId);
      if (need) {
        console.log(`[storage-market] New offer received for need ${offer.needId}`);
        // TODO: Send email notification
      }

      return json(res, 201, { offer });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // GET /storage-market/offers/:needId
  if (method === 'GET' && /^\/storage-market\/offers\/[^\/]+$/.test(pathname)) {
    const needId = pathname.split('/').pop();
    const offers = store.storageOffers.get(needId) || [];
    return json(res, 200, { items: offers });
  }

  // POST /storage-market/offers/ranking
  if (method === 'POST' && pathname === '/storage-market/offers/ranking') {
    try {
      const body = await parseBody(req);
      const needId = body.needId;

      const need = store.storageNeeds.get(needId);
      if (!need) return json(res, 404, { error: 'Need not found' });

      const offers = store.storageOffers.get(needId) || [];
      const ranked = rankOffers(offers, need);

      return json(res, 200, {
        items: ranked,
        top3: ranked.slice(0, 3)
      });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // ============================================
  // CAPACITES LOGISTIQUES
  // ============================================

  // POST /storage-market/logistician-capacity
  if (method === 'POST' && pathname === '/storage-market/logistician-capacity') {
    try {
      const body = await parseBody(req);
      const site = {
        id: generateId('SITE'),
        createdAt: new Date().toISOString(),
        logisticianId: body.logisticianId || authResult?.claims?.orgId || 'LOG-1',
        ...body
      };

      const arr = store.logisticianSites.get(site.logisticianId) || [];
      arr.push(site);
      store.logisticianSites.set(site.logisticianId, arr);

      if (process.env.MONGODB_URI) {
        try {
          const mongo = require('../../../packages/data-mongo/src/index.js');
          const db = await mongo.getDb();
          await db.collection('logistician_sites').insertOne(site);
        } catch (e) {
          console.warn('[storage-market] save mongo failed', e.message);
        }
      }

      return json(res, 201, { site });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // PUT /storage-market/logistician-capacity/:siteId
  if (method === 'PUT' && /^\/storage-market\/logistician-capacity\/[^\/]+$/.test(pathname)) {
    const siteId = pathname.split('/').pop();

    let site = null;
    let logisticianId = null;

    for (const [lid, sites] of store.logisticianSites.entries()) {
      const found = sites.find(s => s.id === siteId);
      if (found) {
        site = found;
        logisticianId = lid;
        break;
      }
    }

    if (!site) return notFound(res);

    try {
      const body = await parseBody(req);
      const updated = { ...site, ...body, id: siteId, updatedAt: new Date().toISOString() };

      const arr = store.logisticianSites.get(logisticianId);
      const idx = arr.findIndex(s => s.id === siteId);
      arr[idx] = updated;

      if (process.env.MONGODB_URI) {
        try {
          const mongo = require('../../../packages/data-mongo/src/index.js');
          const db = await mongo.getDb();
          await db.collection('logistician_sites').updateOne({ id: siteId }, { $set: updated });
        } catch (e) {
          console.warn('[storage-market] update mongo failed', e.message);
        }
      }

      return json(res, 200, { site: updated });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // GET /storage-market/logistician-capacity/:logisticianId
  if (method === 'GET' && /^\/storage-market\/logistician-capacity\/[^\/]+$/.test(pathname)) {
    const logisticianId = pathname.split('/').pop();
    const sites = store.logisticianSites.get(logisticianId) || [];
    return json(res, 200, { items: sites });
  }

  // ============================================
  // CONTRACTUALISATION
  // ============================================

  // POST /storage-market/contracts/create
  if (method === 'POST' && pathname === '/storage-market/contracts/create') {
    try {
      const body = await parseBody(req);
      const contract = {
        id: generateId('CONTRACT'),
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        ...body
      };

      store.storageContracts.set(contract.id, contract);

      // Update need status
      const need = store.storageNeeds.get(contract.needId);
      if (need) {
        need.status = 'CONTRACTED';
        need.contractId = contract.id;
      }

      // Update offer status
      const offers = store.storageOffers.get(contract.needId) || [];
      offers.forEach(offer => {
        if (offer.id === contract.offerId) {
          offer.status = 'ACCEPTED';
        } else {
          offer.status = 'REJECTED';
        }
      });

      if (process.env.MONGODB_URI) {
        try {
          const mongo = require('../../../packages/data-mongo/src/index.js');
          const db = await mongo.getDb();
          await db.collection('storage_contracts').insertOne(contract);
          if (need) {
            await db.collection('storage_needs').updateOne({ id: contract.needId }, { $set: need });
          }
        } catch (e) {
          console.warn('[storage-market] save mongo failed', e.message);
        }
      }

      return json(res, 201, { contract });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // GET /storage-market/contracts/:id
  if (method === 'GET' && /^\/storage-market\/contracts\/[^\/]+$/.test(pathname)) {
    const id = pathname.split('/').pop();
    const contract = store.storageContracts.get(id);
    if (!contract) return notFound(res);
    return json(res, 200, { contract });
  }

  // PUT /storage-market/contracts/:id/status
  if (method === 'PUT' && /^\/storage-market\/contracts\/[^\/]+\/status$/.test(pathname)) {
    const id = pathname.split('/')[3];
    const contract = store.storageContracts.get(id);
    if (!contract) return notFound(res);

    try {
      const body = await parseBody(req);
      contract.status = body.status;
      contract.updatedAt = new Date().toISOString();

      if (process.env.MONGODB_URI) {
        try {
          const mongo = require('../../../packages/data-mongo/src/index.js');
          const db = await mongo.getDb();
          await db.collection('storage_contracts').updateOne({ id }, { $set: contract });
        } catch (e) {
          console.warn('[storage-market] update mongo failed', e.message);
        }
      }

      return json(res, 200, { contract });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // GET /storage-market/contracts
  if (method === 'GET' && pathname === '/storage-market/contracts') {
    const industrialId = parsed.query.industrialId;
    const logisticianId = parsed.query.logisticianId;
    const status = parsed.query.status;

    let contracts = Array.from(store.storageContracts.values());

    if (industrialId) {
      contracts = contracts.filter(c => c.industrialId === industrialId);
    }
    if (logisticianId) {
      contracts = contracts.filter(c => c.logisticianId === logisticianId);
    }
    if (status) {
      contracts = contracts.filter(c => c.status === status);
    }

    return json(res, 200, { items: contracts });
  }

  // ============================================
  // INTEGRATION WMS
  // ============================================

  // POST /storage-market/wms/connect
  if (method === 'POST' && pathname === '/storage-market/wms/connect') {
    try {
      const body = await parseBody(req);
      const connection = {
        id: generateId('WMS'),
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        ...body
      };

      store.wmsConnections.set(connection.contractId, connection);

      return json(res, 201, { connection });
    } catch (e) {
      return json(res, 400, { error: 'Invalid request', detail: e.message });
    }
  }

  // GET /storage-market/wms/inventory/:contractId
  if (method === 'GET' && /^\/storage-market\/wms\/inventory\/[^\/]+$/.test(pathname)) {
    const contractId = pathname.split('/').pop();
    const connection = store.wmsConnections.get(contractId);

    if (!connection) {
      return json(res, 404, { error: 'WMS connection not found' });
    }

    // Mock inventory data
    const inventory = {
      contractId,
      lastUpdate: new Date().toISOString(),
      totalPallets: 150,
      availableSpace: 50,
      items: [
        { sku: 'PROD-001', quantity: 500, location: 'A-01-01' },
        { sku: 'PROD-002', quantity: 300, location: 'A-01-02' },
        { sku: 'PROD-003', quantity: 750, location: 'A-02-01' },
      ]
    };

    return json(res, 200, { inventory });
  }

  // GET /storage-market/wms/movements/:contractId
  if (method === 'GET' && /^\/storage-market\/wms\/movements\/[^\/]+$/.test(pathname)) {
    const contractId = pathname.split('/').pop();
    const connection = store.wmsConnections.get(contractId);

    if (!connection) {
      return json(res, 404, { error: 'WMS connection not found' });
    }

    // Mock movements data
    const movements = {
      contractId,
      period: {
        from: parsed.query.from || new Date(Date.now() - 30*24*60*60*1000).toISOString(),
        to: parsed.query.to || new Date().toISOString()
      },
      items: [
        { date: new Date().toISOString(), type: 'IN', sku: 'PROD-001', quantity: 100, ref: 'BL-001' },
        { date: new Date(Date.now() - 24*60*60*1000).toISOString(), type: 'OUT', sku: 'PROD-002', quantity: 50, ref: 'BL-002' },
        { date: new Date(Date.now() - 48*60*60*1000).toISOString(), type: 'IN', sku: 'PROD-003', quantity: 200, ref: 'BL-003' },
      ]
    };

    return json(res, 200, { movements });
  }

  // ============================================
  // ADMIN
  // ============================================

  // GET /storage-market/admin/stats
  if (method === 'GET' && pathname === '/storage-market/admin/stats') {
    const stats = {
      totalNeeds: store.storageNeeds.size,
      totalOffers: Array.from(store.storageOffers.values()).reduce((sum, arr) => sum + arr.length, 0),
      totalContracts: store.storageContracts.size,
      totalSites: Array.from(store.logisticianSites.values()).reduce((sum, arr) => sum + arr.length, 0),
      activeContracts: Array.from(store.storageContracts.values()).filter(c => c.status === 'ACTIVE').length,
      needsByStatus: {},
      contractsByStatus: {},
      averageOffersPerNeed: 0,
    };

    for (const need of store.storageNeeds.values()) {
      stats.needsByStatus[need.status] = (stats.needsByStatus[need.status] || 0) + 1;
    }

    for (const contract of store.storageContracts.values()) {
      stats.contractsByStatus[contract.status] = (stats.contractsByStatus[contract.status] || 0) + 1;
    }

    if (store.storageNeeds.size > 0) {
      stats.averageOffersPerNeed = stats.totalOffers / store.storageNeeds.size;
    }

    return json(res, 200, { stats });
  }

  // GET /storage-market/admin/logisticians
  if (method === 'GET' && pathname === '/storage-market/admin/logisticians') {
    const subscriptions = Array.from(store.subscriptions.values());
    return json(res, 200, { items: subscriptions });
  }

  // POST /storage-market/admin/logisticians/:id/approve
  if (method === 'POST' && /^\/storage-market\/admin\/logisticians\/[^\/]+\/approve$/.test(pathname)) {
    const id = pathname.split('/')[4];

    let subscription = store.subscriptions.get(id);
    if (!subscription) {
      subscription = {
        id,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
    }

    subscription.status = 'APPROVED';
    subscription.approvedAt = new Date().toISOString();
    store.subscriptions.set(id, subscription);

    return json(res, 200, { subscription });
  }

  return notFound(res);
});

const PORT = process.env.STORAGE_MARKET_PORT ? Number(process.env.STORAGE_MARKET_PORT) : 3013;

loadSeeds().then(() => {
  server.listen(PORT, () => {
    console.log(`[storage-market] HTTP ready on :${PORT}`);
  });
});
