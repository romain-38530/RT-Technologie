// Script d'initialisation MongoDB pour Docker
// Créé automatiquement au démarrage du conteneur MongoDB

db = db.getSiblingDB('rt_technologie');

print('=== Initialisation de la base de données RT-Technologie ===');

// Créer un utilisateur applicatif (en plus de l'admin root)
db.createUser({
  user: 'rt_app_user',
  pwd: 'rt_app_password_dev',
  roles: [
    {
      role: 'readWrite',
      db: 'rt_technologie'
    }
  ]
});

print('✅ Utilisateur applicatif créé');

// Créer les collections principales si elles n'existent pas
const collections = [
  'users',
  'orders',
  'palettes',
  'notifications',
  'trainings',
  'messages'
];

collections.forEach(collName => {
  if (!db.getCollectionNames().includes(collName)) {
    db.createCollection(collName);
    print(`✅ Collection "${collName}" créée`);
  }
});

print('=== Initialisation terminée ===');
