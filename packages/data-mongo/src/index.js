const { MongoClient } = require('mongodb');

let client = null;
let db = null;

async function connect() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'rt';
  if (!uri) throw new Error('MONGODB_URI not set');
  if (client && db) return db;
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 6000 });
  await client.connect();
  db = client.db(dbName);
  return db;
}

function collection(name) {
  if (!db) throw new Error('Mongo not connected');
  return db.collection(name);
}

async function getDb() {
  if (db) return db;
  return connect();
}

module.exports = { connect, collection, getDb };
