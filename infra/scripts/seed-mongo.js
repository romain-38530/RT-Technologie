// Simple Mongo seeder using infra/seeds/*.json
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { connect } = require('../../packages/data-mongo/src/index.js');

async function loadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI');
  const db = await connect();
  const base = path.resolve(process.cwd(), 'infra', 'seeds');

  const carriers = (await loadJson(path.join(base, 'carriers.json'))) || [];
  const orders = (await loadJson(path.join(base, 'orders.json'))) || [];
  const invitations = (await loadJson(path.join(base, 'invitations.json'))) || [];
  const policies = (await loadJson(path.join(base, 'dispatch-policies.json'))) || [];
  const vigilance = (await loadJson(path.join(base, 'vigilance.json'))) || [];
  const planningSlots = (await loadJson(path.join(base, 'planning-slots.json'))) || [];

  // Drop existing collections to remove conflicting indexes
  await db.collection('carriers').drop().catch(() => {});
  await db.collection('orders').drop().catch(() => {});
  await db.collection('invitations').drop().catch(() => {});
  await db.collection('dispatch_policies').drop().catch(() => {});
  await db.collection('vigilance').drop().catch(() => {});
  await db.collection('planning_slots').drop().catch(() => {});

  if (carriers.length) await db.collection('carriers').insertMany(carriers);
  if (orders.length) await db.collection('orders').insertMany(orders);
  if (invitations.length) await db.collection('invitations').insertMany(invitations);
  if (policies.length) await db.collection('dispatch_policies').insertMany(policies);
  if (vigilance.length) await db.collection('vigilance').insertMany(vigilance);
  if (planningSlots.length) await db.collection('planning_slots').insertMany(planningSlots);

  await db.collection('carriers').createIndex({ id: 1 }, { unique: true });
  await db.collection('orders').createIndex({ id: 1 }, { unique: true });
  await db.collection('dispatch_policies').createIndex({ orderId: 1 }, { unique: true });
  await db.collection('vigilance').createIndex({ carrierId: 1 }, { unique: true });

  console.log('Mongo seed complete');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
