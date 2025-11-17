// Business rules (pricing plans)
// Industry: 499€/mo = vigilance, add carriers, automated planning, pricing grids
// Industry addon: +200€/mo Affret.IA
// Transporter invited by an industry: free on that industry's flows
// Transporter self-service: 499€/mo same functions as industry
// Transporter addon: +200€/mo Affret.IA; Premium marketplace access +200€/mo

const FEATURES = {
  VIGILANCE: 'vigilance.module',
  CARRIER_ADD: 'carrier.add',
  PLANNING_AUTO: 'planning.automation',
  PRICING_GRIDS: 'pricing.grids',
  AFFRET_IA: 'affretia.integration',
  MARKETPLACE: 'marketplace.access',
};

const PLANS = {
  INDUSTRY_BASE: new Set([
    FEATURES.VIGILANCE,
    FEATURES.CARRIER_ADD,
    FEATURES.PLANNING_AUTO,
    FEATURES.PRICING_GRIDS,
  ]),
  TRANSPORTER_BASE: new Set([
    FEATURES.VIGILANCE,
    FEATURES.CARRIER_ADD,
    FEATURES.PLANNING_AUTO,
    FEATURES.PRICING_GRIDS,
  ]),
};

const ADDONS = {
  AFFRET_IA: FEATURES.AFFRET_IA,
  PREMIUM_MARKETPLACE: FEATURES.MARKETPLACE,
};

function featuresFor(org) {
  const planKey = (org?.plan || '').toUpperCase();
  const base = PLANS[planKey] || new Set();
  const out = new Set(base);
  for (const a of (org?.addons || [])) {
    const k = String(a).toUpperCase();
    if (ADDONS[k]) out.add(ADDONS[k]);
  }
  return out;
}

function hasFeature(org, feature) {
  return featuresFor(org).has(feature);
}

// Context-aware entitlement check: if a transporter is invited by an industry for a given flow,
// the industry's entitlements apply for that flow.
// ctx: { ownerOrg?: object, actorRelation?: 'INVITED_CARRIER' | null }
function hasFeatureWithContext(actorOrg, feature, ctx = {}) {
  if (hasFeature(actorOrg, feature)) return true;
  if (ctx && ctx.actorRelation === 'INVITED_CARRIER' && ctx.ownerOrg) {
    return hasFeature(ctx.ownerOrg, feature);
  }
  return false;
}

module.exports = { FEATURES, PLANS, ADDONS, featuresFor, hasFeature, hasFeatureWithContext };
