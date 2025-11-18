const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { complete } = require('../../../packages/ai-client/src/index.js');
const { addSecurityHeaders, handleCorsPreflight, requireAuth, rateLimiter, limitBodySize } = require('../../../packages/security/src/index.js');

const PORT = Number(process.env.AFFRET_IA_PORT || '3010');
const SCORING_THRESHOLD = Number(process.env.AFFRET_IA_MIN_SCORING || '80');
const PRICE_MARGIN = Number(process.env.AFFRET_IA_PRICE_MARGIN || '0.05'); // +5%

let mongo = null;
const store = {
  orders: new Map(),
  carriers: [],
  policies: new Map(),   // orderId -> { chain: [] }
  grids: new Map(),      // ownerOrgId -> [{ origin, mode, lines }]
  bids: new Map(),       // orderId -> [{carrierId, price, currency, scoring, at}]
  assignments: new Map() // orderId -> { carrierId, price, currency, at, source }
};

function loadSeeds() {
  try {
    const base = path.resolve(process.cwd(), 'infra', 'seeds');
    const orders = JSON.parse(fs.readFileSync(path.join(base, 'orders.json'), 'utf-8')) || [];
    orders.forEach((o) => store.orders.set(o.id, o));
    store.carriers = JSON.parse(fs.readFileSync(path.join(base, 'carriers.json'), 'utf-8')) || [];
    const pol = JSON.parse(fs.readFileSync(path.join(base, 'dispatch-policies.json'), 'utf-8')) || [];
    pol.forEach((p) => store.policies.set(p.orderId, p));
    const gridsSeed = JSON.parse(fs.readFileSync(path.join(base, 'grids.json'), 'utf-8')) || [];
    gridsSeed.forEach((g) => {
      if (!Array.isArray(g.grids)) return;
      const arr = store.grids.get(g.ownerOrgId) || [];
      arr.push(...g.grids);
      store.grids.set(g.ownerOrgId, arr);
    });
    console.log(`[affret-ia] Seeds chargées: ${store.orders.size} ordres, ${store.carriers.length} transporteurs`);
  } catch (e) { console.warn('[affret-ia] Seeds manquantes:', e.message); }
}

async function loadMongo() {
  if (!process.env.MONGODB_URI) return;
  try {
    mongo = require('../../../packages/data-mongo/src/index.js');
    const db = await mongo.connect();
    const [orders, carriers, policies, grids, bids, assigns] = await Promise.all([
      db.collection('orders').find({}).toArray(),
      db.collection('carriers').find({}).toArray(),
      db.collection('dispatch_policies').find({}).toArray(),
      db.collection('grids').find({}).toArray(),
      db.collection('affret_bids').find({}).toArray(),
      db.collection('affret_assignments').find({}).toArray(),
    ]);
    (orders || []).forEach((o) => store.orders.set(o.id, o));
    if (carriers?.length) store.carriers = carriers;
    (policies || []).forEach((p) => store.policies.set(p.orderId, p));
    (grids || []).forEach((g) => {
      let gridsArr = [];
      if (Array.isArray(g.grids)) gridsArr = g.grids;
      else if (Array.isArray(g.lines)) gridsArr = [{ origin: g.origin || '', mode: g.mode || 'FTL', lines: g.lines }];
      const arr = store.grids.get(g.ownerOrgId) || [];
      arr.push(...gridsArr);
      store.grids.set(g.ownerOrgId, arr);
    });
    (bids || []).forEach((b) => {
      if (!store.bids.has(b.orderId)) store.bids.set(b.orderId, []);
      store.bids.get(b.orderId).push({ carrierId: b.carrierId, price: b.price, currency: b.currency, scoring: b.scoring, at: b.at });
    });
    (assigns || []).forEach((a) => store.assignments.set(a.orderId, a));
    console.log('[affret-ia] Mongo chargé: orders=%d carriers=%d bids=%d assigns=%d', store.orders.size, store.carriers.length, bids?.length || 0, assigns?.length || 0);
  } catch (e) { console.warn('[affret-ia] Mongo indisponible:', e.message); }
}

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

async function quoteWithAI(order) {
  const prompt = `Tu es affréteur. Propose un prix all-in (EUR) et 1-2 transporteurs id parmi: ${store.carriers.map(c=>c.id).join(', ')} pour l'ordre suivant. Réponds JSON: {"price": number, "currency":"EUR", "suggestedCarriers":["id"]}.
Order: id=${order.id}, from=${order.ship_from}, to=${order.ship_to}, pallets=${order.pallets}, weight=${order.weight}kg.`;
  const { content } = await complete(prompt, { max_tokens: 200 });
  try {
    const firstJson = content.match(/\{[\s\S]*\}/);
    if (firstJson) return JSON.parse(firstJson[0]);
  } catch {}
  return null;
}

function allowedCarriersForOrder(orderId) {
  const policy = store.policies.get(orderId);
  if (policy?.chain?.length) return policy.chain;
  return store.carriers.map((c) => c.id);
}

function isPremiumCarrier(id) {
  const c = store.carriers.find((x) => x.id === id);
  return !!(c && c.premium === true);
}

function findGridPrice(order) {
  if (!order) return null;
  const owner = order.ownerOrgId || 'IND-1';
  const origin = order.origin || order.ship_from || '';
  const destination = (order.ship_to || '').toLowerCase();
  const pallets = Number(order.pallets || 0);
  const grids = store.grids.get(owner) || [];
  const isFTL = pallets >= 33 || (order.weight && order.weight > 12000);
  const mode = isFTL ? 'FTL' : 'LTL';
  const grid = grids.find((g) => g.origin && g.origin.toLowerCase() === origin.toLowerCase() && g.mode === mode);
  if (!grid) return null;
  if (mode === 'FTL') {
    const line = (grid.lines || []).find((l) => (l.to || '').toLowerCase() === destination);
    if (line) return { price: line.price, currency: line.currency || 'EUR', mode };
  } else {
    const line = (grid.lines || []).find((l) => {
      const to = (l.to || '').toLowerCase();
      const min = Number(l.minPallets || 0), max = Number(l.maxPallets || 0);
      return to === destination && pallets >= min && pallets <= max;
    });
    if (line) {
      return { price: line.pricePerPallet * pallets, currency: line.currency || 'EUR', mode, pricePerPallet: line.pricePerPallet };
    }
  }
  return null;
}

const limiter = rateLimiter({ windowMs: 60000, max: 120 });
const parseBody = limitBodySize(512 * 1024);
const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method || 'GET';
  const traceIdHdr = req.headers['x-trace-id'];
  const traceId = Array.isArray(traceIdHdr) ? traceIdHdr[0] : traceIdHdr;
  addSecurityHeaders(res);
  if (handleCorsPreflight(req, res)) return;
  if (!limiter(req, res)) return;

  if (method === 'GET' && urlObj.pathname === '/health') {
    return json(res, 200, { status: 'ok', mongo: !!process.env.MONGODB_URI, bids: store.bids.size, assignments: store.assignments.size });
  }

  // GET /affret-ia/quote/:orderId
  if (method === 'GET' && /^\/affret-ia\/quote\/.+/.test(urlObj.pathname)) {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    const orderId = urlObj.pathname.split('/').pop();
    const order = store.orders.get(orderId);
    if (!order) return json(res, 404, { error: 'Order not found' });
    const premiumAllowed = allowedCarriersForOrder(orderId).filter((id) => isPremiumCarrier(id));
    if (!premiumAllowed.length) return json(res, 403, { error: 'no_premium_carrier' });
    try {
      let q = null;
      const gridRef = findGridPrice(order);
      if (process.env.OPENROUTER_API_KEY) {
        q = await quoteWithAI(order);
      }
      if (!q) {
        const base = gridRef?.price || (1.1 * (order.weight || 1000) / 10 + (order.pallets || 1) * 5);
        q = { price: Math.round(base), currency: gridRef?.currency || 'EUR', suggestedCarriers: premiumAllowed.slice(0, 2), priceRef: gridRef || null };
      } else if (gridRef) {
        q.priceRef = gridRef;
      }

      // === INTÉGRATION PALETTES ===
      // Ajouter le coût de retour des palettes et suggérer le meilleur site
      let palletInfo = null;
      if (order.pallets && order.pallets > 0 && order.ship_to) {
        try {
          const PALETTE_API_URL = process.env.PALETTE_API_URL || 'http://localhost:3009';

          // Extraire les coordonnées GPS de la destination (simulé pour l'exemple)
          // En production, il faudrait géocoder order.ship_to
          const deliveryLocation = order.deliveryLocation || { lat: 48.8566, lng: 2.3522 };

          // Appeler le service palette pour trouver le meilleur site
          const matchResponse = await fetch(`${PALETTE_API_URL}/palette/match/site`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deliveryLocation,
              companyId: order.ownerOrgId || 'IND-1',
              quantity: order.pallets
            })
          });

          if (matchResponse.ok) {
            const matchData = await matchResponse.json();
            const bestSite = matchData.bestSite;

            // Calculer le coût de retour (0.50 EUR par km + 5 EUR par palette)
            const returnDistance = bestSite.distance || 0;
            const returnCost = Math.round(returnDistance * 0.5 + order.pallets * 5);

            palletInfo = {
              pallets: order.pallets,
              returnSite: {
                id: bestSite.siteId,
                name: bestSite.site.name,
                distance: returnDistance,
                address: bestSite.site.address
              },
              returnCost,
              recommendation: `Retour palettes suggéré: ${bestSite.site.name} à ${Math.round(returnDistance * 10) / 10}km. Coût estimé: ${returnCost} EUR.`
            };

            // Ajouter le coût de retour au prix total
            q.price += returnCost;
            q.priceBreakdown = {
              baseTransport: q.price - returnCost,
              palletReturn: returnCost,
              total: q.price
            };
          }
        } catch (e) {
          // Si le service palette est indisponible, on continue sans cette info
          console.warn('[affret-ia] Service palette indisponible:', e.message);
        }
      }

      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, { orderId, ...q, palletInfo, traceId: traceId || null });
    } catch (e) {
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 502, { error: e.message, traceId: traceId || null });
    }
  }

  // GET /affret-ia/bids/:orderId
  if (method === 'GET' && /^\/affret-ia\/bids\/.+/.test(urlObj.pathname)) {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    const orderId = urlObj.pathname.split('/').pop();
    const bids = (store.bids.get(orderId) || []).filter((b) => isPremiumCarrier(b.carrierId));
    return json(res, 200, { orderId, bids, traceId: traceId || null });
  }

  // GET /affret-ia/assignment/:orderId
  if (method === 'GET' && /^\/affret-ia\/assignment\/.+/.test(urlObj.pathname)) {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    const orderId = urlObj.pathname.split('/').pop();
    const assign = store.assignments.get(orderId) || null;
    return json(res, 200, { orderId, assignment: assign, traceId: traceId || null });
  }

  // POST /affret-ia/bid
  if (method === 'POST' && urlObj.pathname === '/affret-ia/bid') {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    try {
      const body = (await parseBody(req)) || {};
      const { orderId, carrierId, price, currency = 'EUR' } = body;
      if (!orderId || !carrierId || !price) return json(res, 400, { error: 'orderId/carrierId/price requis' });
      const order = store.orders.get(orderId);
      if (!order) return json(res, 404, { error: 'Order not found' });
      if (!isPremiumCarrier(carrierId)) return json(res, 403, { error: 'carrier_not_premium' });

      const carrier = store.carriers.find((c) => c.id === carrierId);
      const scoring = carrier?.scoring ?? null;
      if (!store.bids.has(orderId)) store.bids.set(orderId, []);
      const bid = { carrierId, price: Number(price), currency, scoring, at: new Date().toISOString() };
      store.bids.get(orderId).push(bid);
      if (mongo) { try { const db = await mongo.getDb(); await db.collection('affret_bids').insertOne({ orderId, ...bid }); } catch {} }

      const bids = (store.bids.get(orderId) || []).filter((b) => isPremiumCarrier(b.carrierId) && allowedCarriersForOrder(orderId).includes(b.carrierId));
      const gridRef = findGridPrice(order);
      const avgBids = bids.length ? (bids.reduce((s, b) => s + (b.price || 0), 0) / bids.length) : bid.price;
      const refPrice = gridRef?.price || avgBids;
      const withinRange = bid.price <= refPrice * (1 + PRICE_MARGIN);
      const scoringOk = scoring == null || scoring >= SCORING_THRESHOLD;
      let assignment = store.assignments.get(orderId) || null;
      if (!assignment && withinRange && scoringOk) {
        assignment = { orderId, carrierId, price: bid.price, currency, at: new Date().toISOString(), source: 'bid', priceRef: gridRef || null };
        store.assignments.set(orderId, assignment);
        if (mongo) { try { const db = await mongo.getDb(); await db.collection('affret_assignments').updateOne({ orderId }, { $set: assignment }, { upsert: true }); } catch {} }
      }
      return json(res, 200, { ok: true, orderId, bid, stats: { avgBids: avgBids, refPrice }, assigned: assignment || null, traceId: traceId || null });
    } catch (e) {
      return json(res, 400, { error: 'Invalid JSON', traceId: traceId || null });
    }
  }

  // POST /affret-ia/dispatch { orderId }
  if (method === 'POST' && urlObj.pathname === '/affret-ia/dispatch') {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    try {
      const body = (await parseBody(req)) || {};
      const order = store.orders.get(body.orderId);
      if (!order) return json(res, 404, { error: 'Order not found' });
      const existing = store.assignments.get(body.orderId);
      if (existing) return json(res, 200, { assignedCarrierId: existing.carrierId, quote: null, traceId: traceId || null, source: existing.source });

      const allowedPremium = allowedCarriersForOrder(order.id).filter((id) => isPremiumCarrier(id));
      if (!allowedPremium.length) return json(res, 403, { error: 'no_premium_carrier' });

      const gridRef = findGridPrice(order);
      let quote = null;
      if (process.env.OPENROUTER_API_KEY) {
        quote = await quoteWithAI(order);
      }
      let chosen = quote?.suggestedCarriers?.find((c) => allowedPremium.includes(c)) || allowedPremium.find((c) => c) || null;
      if (chosen) {
        const assignment = { orderId: body.orderId, carrierId: chosen, price: quote?.price || gridRef?.price || null, currency: quote?.currency || gridRef?.currency || 'EUR', at: new Date().toISOString(), source: quote ? 'ai' : 'fallback', priceRef: gridRef || null };
        store.assignments.set(body.orderId, assignment);
        if (mongo) { try { const db = await mongo.getDb(); await db.collection('affret_assignments').updateOne({ orderId: body.orderId }, { $set: assignment }, { upsert: true }); } catch {} }
      }
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, { assignedCarrierId: chosen, quote: quote || null, priceRef: gridRef || null, traceId: traceId || null });
    } catch (e) {
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 400, { error: 'Invalid JSON', traceId: traceId || null });
    }
  }

  // POST /affret/optimize-pallet-routes
  // Optimise l'ordre des livraisons pour minimiser la distance avec retours palettes
  if (method === 'POST' && urlObj.pathname === '/affret/optimize-pallet-routes') {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    try {
      const body = (await parseBody(req)) || {};
      const { deliveries } = body; // [{ orderId, location: {lat, lng}, pallets, address }]

      if (!deliveries || !Array.isArray(deliveries) || deliveries.length === 0) {
        return json(res, 400, { error: 'deliveries array requis' });
      }

      // 1. Pour chaque livraison, récupérer le meilleur site de retour via le service palette
      const PALETTE_API_URL = process.env.PALETTE_API_URL || 'http://localhost:3009';
      const deliveriesWithSites = await Promise.all(
        deliveries.map(async (delivery) => {
          try {
            // Appeler le service palette pour matching de site
            const matchResponse = await fetch(`${PALETTE_API_URL}/palette/match/site`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                deliveryLocation: delivery.location,
                companyId: delivery.companyId || 'IND-1',
                quantity: delivery.pallets || 0
              })
            });

            if (!matchResponse.ok) {
              return { ...delivery, returnSite: null, error: 'no_site_available' };
            }

            const matchData = await matchResponse.json();
            return {
              ...delivery,
              returnSite: matchData.bestSite,
              alternatives: matchData.alternatives || []
            };
          } catch (e) {
            return { ...delivery, returnSite: null, error: e.message };
          }
        })
      );

      // 2. Optimiser l'ordre des livraisons (TSP simplifié - Greedy nearest neighbor)
      if (deliveriesWithSites.length === 0) {
        return json(res, 200, { optimizedRoute: [], totalDistance: 0, traceId: traceId || null });
      }

      let optimizedRoute = [];
      let currentLocation = deliveriesWithSites[0].location; // Départ = première livraison
      let remaining = [...deliveriesWithSites];
      let totalDistance = 0;

      while (remaining.length > 0) {
        // Trouver la livraison la plus proche
        let nearestIndex = 0;
        let nearestDistance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          remaining[0].location.lat,
          remaining[0].location.lng
        );

        for (let i = 1; i < remaining.length; i++) {
          const dist = calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            remaining[i].location.lat,
            remaining[i].location.lng
          );
          if (dist < nearestDistance) {
            nearestDistance = dist;
            nearestIndex = i;
          }
        }

        const nextDelivery = remaining.splice(nearestIndex, 1)[0];
        totalDistance += nearestDistance;

        // Si un site de retour est disponible, calculer la distance vers ce site
        let returnDistance = 0;
        if (nextDelivery.returnSite) {
          returnDistance = calculateDistance(
            nextDelivery.location.lat,
            nextDelivery.location.lng,
            nextDelivery.returnSite.site.gps.lat,
            nextDelivery.returnSite.site.gps.lng
          );
          totalDistance += returnDistance;
        }

        optimizedRoute.push({
          step: optimizedRoute.length + 1,
          type: 'delivery',
          orderId: nextDelivery.orderId,
          address: nextDelivery.address,
          location: nextDelivery.location,
          pallets: nextDelivery.pallets,
          distanceFromPrevious: nearestDistance,
          returnSite: nextDelivery.returnSite ? {
            siteId: nextDelivery.returnSite.siteId,
            name: nextDelivery.returnSite.site.name,
            distance: returnDistance,
            location: nextDelivery.returnSite.site.gps
          } : null
        });

        // Si site de retour, ajouter une étape de retour
        if (nextDelivery.returnSite) {
          currentLocation = nextDelivery.returnSite.site.gps;
          optimizedRoute.push({
            step: optimizedRoute.length + 1,
            type: 'pallet_return',
            siteId: nextDelivery.returnSite.siteId,
            siteName: nextDelivery.returnSite.site.name,
            location: nextDelivery.returnSite.site.gps,
            pallets: nextDelivery.pallets,
            distanceFromPrevious: returnDistance
          });
        } else {
          currentLocation = nextDelivery.location;
        }
      }

      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, {
        optimizedRoute,
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalSteps: optimizedRoute.length,
        deliveries: deliveriesWithSites.length,
        traceId: traceId || null
      });
    } catch (e) {
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 400, { error: 'Invalid request', detail: e.message, traceId: traceId || null });
    }
  }

  // GET /affret/pallet-alerts
  // Analyse les quotas et détecte les problèmes potentiels
  if (method === 'GET' && urlObj.pathname === '/affret/pallet-alerts') {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    try {
      const PALETTE_API_URL = process.env.PALETTE_API_URL || 'http://localhost:3009';

      // 1. Récupérer tous les sites
      const sitesResponse = await fetch(`${PALETTE_API_URL}/palette/sites`);
      if (!sitesResponse.ok) {
        throw new Error('Impossible de récupérer les sites de palettes');
      }
      const { sites } = await sitesResponse.json();

      // 2. Analyser chaque site pour détecter les problèmes
      const alerts = [];

      for (const site of sites) {
        // Récupérer les détails avec quota
        const siteDetailResponse = await fetch(`${PALETTE_API_URL}/palette/sites/${site.id}`);
        if (!siteDetailResponse.ok) continue;

        const { quota } = await siteDetailResponse.json();
        const utilizationPercent = (quota.consumed / quota.dailyMax) * 100;

        // Alerte si > 90% de saturation
        if (utilizationPercent > 90) {
          alerts.push({
            type: 'SITE_NEAR_SATURATION',
            severity: utilizationPercent > 95 ? 'CRITICAL' : 'WARNING',
            siteId: site.id,
            siteName: site.name,
            message: `Site proche de saturation: ${Math.round(utilizationPercent)}% (${quota.consumed}/${quota.dailyMax})`,
            data: { utilizationPercent, consumed: quota.consumed, max: quota.dailyMax },
            suggestedActions: [
              'Augmenter le quota journalier',
              'Rediriger les nouvelles livraisons vers sites alternatifs',
              'Planifier un ramassage urgent'
            ]
          });
        }

        // Alerte si quota complètement saturé
        if (quota.consumed >= quota.dailyMax) {
          alerts.push({
            type: 'SITE_FULL',
            severity: 'CRITICAL',
            siteId: site.id,
            siteName: site.name,
            message: `Site COMPLET: ${quota.consumed}/${quota.dailyMax} palettes`,
            data: { consumed: quota.consumed, max: quota.dailyMax },
            suggestedActions: [
              'URGENT: Augmenter le quota immédiatement',
              'Bloquer les nouvelles affectations vers ce site',
              'Contacter le logisticien pour ramassage'
            ]
          });
        }
      }

      // 3. Analyser les ledgers des entreprises pour détecter les soldes très négatifs
      // On suppose que les companyIds sont connus (sinon il faudrait un endpoint GET /palette/companies)
      const companyIds = [...new Set(sites.map(s => s.companyId))];

      for (const companyId of companyIds) {
        try {
          const ledgerResponse = await fetch(`${PALETTE_API_URL}/palette/ledger/${companyId}`);
          if (!ledgerResponse.ok) continue;

          const { ledger } = await ledgerResponse.json();

          // Alerte si solde < -100 palettes
          if (ledger.balance < -100) {
            alerts.push({
              type: 'COMPANY_HIGH_DEBT',
              severity: ledger.balance < -200 ? 'CRITICAL' : 'WARNING',
              companyId: ledger.companyId,
              message: `Entreprise ${ledger.companyId} a un solde très négatif: ${ledger.balance} palettes`,
              data: { balance: ledger.balance, transactions: ledger.history.length },
              suggestedActions: [
                'Contacter l\'entreprise pour régularisation',
                'Bloquer l\'émission de nouveaux chèques',
                'Planifier une restitution massive'
              ]
            });
          }
        } catch (e) {
          // Ignorer si ledger non trouvé
        }
      }

      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, {
        alerts,
        totalAlerts: alerts.length,
        critical: alerts.filter(a => a.severity === 'CRITICAL').length,
        warnings: alerts.filter(a => a.severity === 'WARNING').length,
        timestamp: new Date().toISOString(),
        traceId: traceId || null
      });
    } catch (e) {
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 500, { error: 'Internal error', detail: e.message, traceId: traceId || null });
    }
  }

  return json(res, 404, { error: 'Not Found' });
});

// Helper pour calculer la distance (Haversine)
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

loadSeeds();
loadMongo();
server.listen(PORT, () => console.log(`[affret-ia] HTTP prêt sur :${PORT}`));
