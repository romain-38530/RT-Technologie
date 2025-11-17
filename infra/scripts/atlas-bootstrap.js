// Prints ready-to-run curl commands to bootstrap MongoDB Atlas (access list, db user, clusters)
// Uses HTTP Digest auth with public/private API keys.
// Env required: MONGODB_ATLAS_PUBLIC_KEY, MONGODB_ATLAS_PRIVATE_KEY, MONGODB_ATLAS_PROJECT_ID
// Optional: MONGODB_ATLAS_IP (CIDR or IP), MONGODB_ATLAS_DB_USERNAME, MONGODB_ATLAS_DB_PASSWORD

function env(name, required = false, def = '') {
  const v = process.env[name] || def;
  if (required && !v) throw new Error(`Missing ${name}`);
  return v;
}

function main() {
  const PUB = env('MONGODB_ATLAS_PUBLIC_KEY', true);
  const PRIV = env('MONGODB_ATLAS_PRIVATE_KEY', true);
  const PROJ = env('MONGODB_ATLAS_PROJECT_ID', true);
  const IP = env('MONGODB_ATLAS_IP', false, '0.0.0.0/0');
  const DBU = env('MONGODB_ATLAS_DB_USERNAME', false, 'app_user');
  const DBP = env('MONGODB_ATLAS_DB_PASSWORD', false, 'change-me-strong');

  const base = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${PROJ}`;
  const auth = `--digest -u "${PUB}:${PRIV}"`;

  const addAccess = `curl ${auth} -H "Content-Type: application/json" -X POST "${base}/accessList" -d '{"ipAddress":"${IP}","comment":"RT Backoffice access"}'`;
  const addUser = `curl ${auth} -H "Content-Type: application/json" -X POST "${base}/databaseUsers" -d '{"databaseName":"admin","username":"${DBU}","password":"${DBP}","roles":[{"databaseName":"${process.env.MONGODB_DB||'rt'}","roleName":"readWrite"}]}'`;
  const listClusters = `curl ${auth} "${base}/clusters"`;

  console.log('--- MongoDB Atlas bootstrap commands ---');
  console.log('\n# 1) Autoriser IP');
  console.log(addAccess);
  console.log('\n# 2) Créer utilisateur DB applicatif');
  console.log(addUser);
  console.log('\n# 3) Lister clusters');
  console.log(listClusters);
  console.log('\n# Remplacez IP/username/password si nécessaire.');
}

try { main(); } catch (e) { console.error(e.message); process.exit(1); }

