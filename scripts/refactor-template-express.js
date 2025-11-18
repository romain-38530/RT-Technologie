/**
 * Template de refactorisation pour les services Express
 *
 * Usage:
 * 1. Remplacer SERVICENAME par le nom du service (ex: geo_tracking)
 * 2. Copier ce template en haut du fichier server.js
 */

// ========== DÉBUT TEMPLATE REFACTORISATION ==========

// Protection contre les redéclarations - Namespace global pour SERVICENAME
if (!global.__SERVICENAME_modules) {
  global.__SERVICENAME_modules = {};
}

// Fonction helper pour require avec cache global
function requireOnce(moduleName, requirePath) {
  const key = `__SERVICENAME_${moduleName}`;
  if (!global.__SERVICENAME_modules[moduleName]) {
    global.__SERVICENAME_modules[moduleName] = require(requirePath);
  }
  return global.__SERVICENAME_modules[moduleName];
}

// Remplacer les require() standard par requireOnce()
// Avant: const express = require('express');
// Après:  var express = requireOnce('express', 'express');

// Pour les déstructurations:
// Avant: const { MongoClient } = require('mongodb');
// Après:  var { MongoClient } = requireOnce('mongodb_destructure', 'mongodb');

// Protection du serveur Express
if (global.__SERVICENAME_app) {
  console.log('[SERVICENAME] Closing existing server...');
  if (global.__SERVICENAME_server) {
    try {
      global.__SERVICENAME_server.close();
    } catch (e) {
      // Ignore
    }
  }
}

// Protection des stores/données en mémoire
if (!global.__SERVICENAME_store) {
  global.__SERVICENAME_store = {
    // Initialiser vos stores ici
  };
}
var store = global.__SERVICENAME_store;

// Protection de l'initialisation
if (!global.__SERVICENAME_initialized) {
  global.__SERVICENAME_initialized = true;

  // Votre code d'initialisation ici

} else {
  console.log('[SERVICENAME] Already initialized, skipping restart');
  // Optionnel: exporter l'app existante
  module.exports = global.__SERVICENAME_app;
}

// ========== FIN TEMPLATE REFACTORISATION ==========

// Conseils supplémentaires:
// 1. Remplacer TOUS les 'const' par 'var' dans le reste du fichier
// 2. Remplacer 'function name()' par 'var name = function()'
// 3. Stocker l'app Express: global.__SERVICENAME_app = app;
// 4. Stocker le server: global.__SERVICENAME_server = server;
