/**
 * RT Technologie - Geo-Tracking Service
 *
 * Service de géolocalisation temps réel avec :
 * - Tracking GPS toutes les 15 secondes
 * - Géofencing automatique (rayon 200m)
 * - Calcul d'ETA avec TomTom Traffic API
 * - Détection automatique des statuts de mission
 *
 * Port: 3016
 */

// Protection contre les redéclarations lors du hot reload
if (!global.__geo_tracking_modules) {
  global.__geo_tracking_modules = {};
  require('dotenv').config();
}

// Helper pour require avec cache
function requireOnce(name, path) {
  if (!global.__geo_tracking_modules[name]) {
    global.__geo_tracking_modules[name] = require(path);
  }
  return global.__geo_tracking_modules[name];
}

var express = requireOnce('express', 'express');
var cors = requireOnce('cors', 'cors');
var helmet = requireOnce('helmet', 'helmet');
var mongodb = requireOnce('mongodb', 'mongodb');
var MongoClient = mongodb.MongoClient;
var winston = requireOnce('winston', 'winston');
var Joi = requireOnce('joi', 'joi');
var jwt = requireOnce('jsonwebtoken', 'jsonwebtoken');
var axios = requireOnce('axios', 'axios');

// Configuration
var PORT = process.env.GEO_TRACKING_PORT || 3020;
var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rt-technologie';
var TOMTOM_API_KEY = process.env.TOMTOM_API_KEY || '';
var JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
var GEOFENCE_RADIUS_METERS = 200; // Rayon de détection en mètres

// Logger
if (!global.__geo_tracking_logger) {
  global.__geo_tracking_logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/geo-tracking.log' })
  ]);
}
var logger = global.__geo_tracking_logger;

// Express app - Fermer l'ancien serveur si nécessaire
if (global.__geo_tracking_server) {
  try {
    global.__geo_tracking_server.close();
  } catch (e) {
    // Ignore
  }
}

if (!global.__geo_tracking_app) {
  global.__geo_tracking_app = express();
  global.__geo_tracking_app.use(helmet());
  global.__geo_tracking_app.use(cors());
  global.__geo_tracking_app.use(express.json());
}
var app = global.__geo_tracking_app;
// MongoDB connection
if (!global.__geo_tracking_db) {
  MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
    .then(client => {
      global.__geo_tracking_db = client.db();
      logger.info('✅ Connected to MongoDB');
    })
    .catch(err => {
      logger.error('❌ MongoDB connection failed:', err);
      logger.warn('⚠️  Running without MongoDB - some features may be limited');
      global.__geo_tracking_db = null;
    });
}
var db = global.__geo_tracking_db;

// ============================================================================
// MIDDLEWARES
// ============================================================================

/**
 * Middleware d'authentification JWT
 */
var authMiddleware = function(req, res, next) {
  var authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  var token = authHeader.substring(7);

  try {
    var decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('Invalid token:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ============================================================================
// UTILITAIRES GÉOGRAPHIQUES
// ============================================================================

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 * @param {number} lat1 - Latitude point 1
 * @param {number} lon1 - Longitude point 1
 * @param {number} lat2 - Latitude point 2
 * @param {number} lon2 - Longitude point 2
 * @returns {number} Distance en mètres
 */
var calculateDistance = function(lat1, lon1, lat2, lon2) {
  var R = 6371000; // Rayon de la Terre en mètres
  var φ1 = lat1 * Math.PI / 180;
  var φ2 = lat2 * Math.PI / 180;
  var Δφ = (lat2 - lat1) * Math.PI / 180;
  var Δλ = (lon2 - lon1) * Math.PI / 180;

  var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Vérifie si un point est dans un géofence
 * @param {number} lat - Latitude du point
 * @param {number} lon - Longitude du point
 * @param {object} center - Centre du géofence {latitude, longitude}
 * @param {number} radiusMeters - Rayon du géofence en mètres
 * @returns {boolean}
 */
var isInGeofence = function(lat, lon, center, radiusMeters) {
  if (radiusMeters === undefined) radiusMeters = GEOFENCE_RADIUS_METERS;
  var distance = calculateDistance(lat, lon, center.latitude, center.longitude);
  return distance <= radiusMeters;
};

/**
 * Détecte les événements de géofencing
 * @param {object} position - Position actuelle
 * @param {object} order - Commande avec pickup et delivery
 * @param {object} lastPosition - Dernière position connue
 * @returns {object|null} Événement détecté ou null
 */
var detectGeofenceEvent = async function(position, order, lastPosition) {
  var latitude = position.latitude;
  var longitude = position.longitude;
  var timestamp = position.timestamp;

  // Vérifier entrée dans zone de chargement
  if (order.pickup && order.pickup.location) {
    var inPickupZone = isInGeofence(latitude, longitude, order.pickup.location);

    if (inPickupZone && lastPosition) {
      var wasInPickupZone = isInGeofence(
        lastPosition.latitude,
        lastPosition.longitude,
        order.pickup.location
      );

      // Transition : hors zone → dans zone
      if (!wasInPickupZone) {
        return {
          type: 'ARRIVAL_PICKUP',
          detectedAt: timestamp,
          location: {
            latitude: order.pickup.location.latitude,
            longitude: order.pickup.location.longitude,
            name: order.pickup.name || 'Point de chargement',
            address: order.pickup.address
          },
          automatic: true
        };
      }
    }

    // Transition : dans zone → hors zone (départ après chargement)
    if (!inPickupZone && lastPosition) {
      var wasInPickupZone = isInGeofence(
        lastPosition.latitude,
        lastPosition.longitude,
        order.pickup.location
      );

      if (wasInPickupZone && order.status === 'LOADING') {
        return {
          type: 'DEPARTURE_PICKUP',
          detectedAt: timestamp,
          location: {
            latitude: order.pickup.location.latitude,
            longitude: order.pickup.location.longitude,
            name: order.pickup.name || 'Point de chargement',
            address: order.pickup.address
          },
          automatic: true
        };
      }
    }
  }

  // Vérifier entrée dans zone de livraison
  if (order.delivery && order.delivery.location) {
    var inDeliveryZone = isInGeofence(latitude, longitude, order.delivery.location);

    if (inDeliveryZone && lastPosition) {
      var wasInDeliveryZone = isInGeofence(
        lastPosition.latitude,
        lastPosition.longitude,
        order.delivery.location
      );

      // Transition : hors zone → dans zone
      if (!wasInDeliveryZone) {
        return {
          type: 'ARRIVAL_DELIVERY',
          detectedAt: timestamp,
          location: {
            latitude: order.delivery.location.latitude,
            longitude: order.delivery.location.longitude,
            name: order.delivery.name || 'Point de livraison',
            address: order.delivery.address
          },
          automatic: true
        };
      }
    }
  }

  return null;
};

/**
 * Calcule l'ETA avec TomTom Traffic API
 * @param {number} fromLat - Latitude départ
 * @param {number} fromLon - Longitude départ
 * @param {number} toLat - Latitude arrivée
 * @param {number} toLon - Longitude arrivée
 * @returns {object} ETA avec durée, distance, retard trafic
 */
var calculateETA = async function(fromLat, fromLon, toLat, toLon) {
  if (!TOMTOM_API_KEY) {
    logger.warn('⚠️  TomTom API key not configured, using simple calculation');

    // Calcul simple sans trafic (vitesse moyenne 60 km/h)
    var distanceMeters = calculateDistance(fromLat, fromLon, toLat, toLon);
    var distanceKm = distanceMeters / 1000;
    var durationMinutes = Math.round((distanceKm / 60) * 60);
    var arrivalTime = new Date(Date.now() + durationMinutes * 60 * 1000);

    return {
      arrivalTime: arrivalTime.toISOString(),
      durationMinutes,
      distanceKm: Math.round(distanceKm * 10) / 10,
      trafficDelay: 0,
      confidence: 'LOW'
    };
  }

  try {
    // Appel API TomTom Routing
    var url = `https://api.tomtom.com/routing/1/calculateRoute/${fromLat},${fromLon}:${toLat},${toLon}/json`;
    var response = await axios.get(url, {
      params: {
        key: TOMTOM_API_KEY,
        traffic: true,
        routeType: 'fastest',
        travelMode: 'truck',
        vehicleCommercial: true
      },
      timeout: 5000
    });

    var route = response.data.routes[0];
    var summary = route.summary;

    var durationMinutes = Math.round(summary.travelTimeInSeconds / 60);
    var distanceKm = Math.round(summary.lengthInMeters / 100) / 10;
    var trafficDelay = Math.round((summary.trafficDelayInSeconds || 0) / 60);
    var arrivalTime = new Date(Date.now() + summary.travelTimeInSeconds * 1000);

    return {
      arrivalTime: arrivalTime.toISOString(),
      durationMinutes,
      distanceKm,
      trafficDelay,
      confidence: 'HIGH'
    };
  } catch (error) {
    logger.error('TomTom API error:', error.message);

    // Fallback sur calcul simple
    var distanceMeters = calculateDistance(fromLat, fromLon, toLat, toLon);
    var distanceKm = distanceMeters / 1000;
    var durationMinutes = Math.round((distanceKm / 60) * 60);
    var arrivalTime = new Date(Date.now() + durationMinutes * 60 * 1000);

    return {
      arrivalTime: arrivalTime.toISOString(),
      durationMinutes,
      distanceKm: Math.round(distanceKm * 10) / 10,
      trafficDelay: 0,
      confidence: 'LOW'
    };
  }
};

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Health check
 */
app.get('/geo-tracking/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Enregistrer une position GPS
 */
app.post('/geo-tracking/positions', authMiddleware, async (req, res) => {
  // Validation
  var schema = Joi.object({
    orderId: Joi.string().required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    timestamp: Joi.date().iso().required(),
    accuracy: Joi.number().min(0).optional(),
    speed: Joi.number().min(0).optional(),
    heading: Joi.number().min(0).max(360).optional()
  });

  var validation = schema.validate(req.body);
  var error = validation.error;
  var value = validation.value;
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    var orderId = value.orderId;
    var latitude = value.latitude;
    var longitude = value.longitude;
    var timestamp = value.timestamp;
    var accuracy = value.accuracy;
    var speed = value.speed;
    var heading = value.heading;

    // Récupérer la commande
    var order = await db.collection('orders').findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Récupérer la dernière position
    var lastPosition = await db.collection('positions')
      .findOne({ orderId }, { sort: { timestamp: -1 } });

    // Enregistrer la nouvelle position
    var positionDoc = {
      orderId,
      latitude,
      longitude,
      timestamp: new Date(timestamp),
      accuracy,
      speed,
      heading,
      createdAt: new Date()
    };

    var result = await db.collection('positions').insertOne(positionDoc);
    var positionId = result.insertedId.toString();

    logger.info(`📍 Position saved for order ${orderId}: ${latitude}, ${longitude}`);

    // Détecter événements de géofencing
    var geofenceEvent = null;
    if (order.pickup || order.delivery) {
      geofenceEvent = await detectGeofenceEvent(
        { latitude, longitude, timestamp: new Date(timestamp) },
        order,
        lastPosition
      );

      if (geofenceEvent) {
        // Enregistrer l'événement
        await db.collection('geofence_events').insertOne({
          orderId,
          ...geofenceEvent,
          createdAt: new Date()
        });

        logger.info(`🎯 Geofence event detected: ${geofenceEvent.type} for order ${orderId}`);

        // Mettre à jour le statut de la commande
        var statusMap = {
          'ARRIVAL_PICKUP': 'ARRIVED_PICKUP',
          'DEPARTURE_PICKUP': 'IN_TRANSIT',
          'ARRIVAL_DELIVERY': 'ARRIVED_DELIVERY'
        };

        if (statusMap[geofenceEvent.type]) {
          await db.collection('orders').updateOne(
            { orderId },
            {
              $set: {
                status: statusMap[geofenceEvent.type],
                lastStatusUpdate: new Date()
              }
            }
          );
        }
      }
    }

    // Calculer l'ETA pour la prochaine destination
    var eta = null;
    var destination = null;

    if (order.status === 'EN_ROUTE_PICKUP' && order.pickup) {
      destination = order.pickup.location;
    } else if (['LOADED', 'IN_TRANSIT', 'EN_ROUTE_DELIVERY'].includes(order.status) && order.delivery) {
      destination = order.delivery.location;
    }

    if (destination) {
      eta = await calculateETA(latitude, longitude, destination.latitude, destination.longitude);

      // Mettre à jour l'ETA dans la commande
      await db.collection('orders').updateOne(
        { orderId },
        {
          $set: {
            currentETA: eta,
            lastETAUpdate: new Date()
          }
        }
      );
    }

    res.json({
      success: true,
      positionId,
      geofenceEvent,
      eta
    });
  } catch (err) {
    logger.error('Error saving position:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Récupérer l'historique des positions
 */
app.get('/geo-tracking/positions/:orderId', authMiddleware, async (req, res) => {
  try {
    var orderId = req.params.orderId;
    var from = req.query.from;
    var to = req.query.to;
    var limit = req.query.limit || 100;

    var query = { orderId };

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    var positions = await db.collection('positions')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();

    var totalCount = await db.collection('positions').countDocuments({ orderId });

    res.json({
      orderId,
      positions: positions.map(p => ({
        id: p._id.toString(),
        latitude: p.latitude,
        longitude: p.longitude,
        timestamp: p.timestamp,
        accuracy: p.accuracy,
        speed: p.speed,
        heading: p.heading
      })),
      totalCount
    });
  } catch (err) {
    logger.error('Error fetching positions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Calculer l'ETA
 */
app.get('/geo-tracking/eta/:orderId', authMiddleware, async (req, res) => {
  try {
    var orderId = req.params.orderId;
    var currentLat = req.query.currentLat;
    var currentLon = req.query.currentLon;

    if (!currentLat || !currentLon) {
      return res.status(400).json({ error: 'currentLat and currentLon are required' });
    }

    var order = await db.collection('orders').findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    var destination = null;
    if (order.status === 'EN_ROUTE_PICKUP' && order.pickup) {
      destination = {
        ...order.pickup.location,
        name: order.pickup.name,
        address: order.pickup.address
      };
    } else if (['LOADED', 'IN_TRANSIT', 'EN_ROUTE_DELIVERY'].includes(order.status) && order.delivery) {
      destination = {
        ...order.delivery.location,
        name: order.delivery.name,
        address: order.delivery.address
      };
    }

    if (!destination) {
      return res.status(400).json({ error: 'No active destination for this order' });
    }

    var eta = await calculateETA(
      parseFloat(currentLat),
      parseFloat(currentLon),
      destination.latitude,
      destination.longitude
    );

    res.json({
      orderId,
      destination: {
        latitude: destination.latitude,
        longitude: destination.longitude,
        name: destination.name
      },
      eta
    });
  } catch (err) {
    logger.error('Error calculating ETA:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Récupérer les événements de géofencing
 */
app.get('/geo-tracking/geofence/events/:orderId', authMiddleware, async (req, res) => {
  try {
    var orderId = req.params.orderId;

    var events = await db.collection('geofence_events')
      .find({ orderId })
      .sort({ detectedAt: 1 })
      .toArray();

    res.json({
      orderId,
      events: events.map(e => ({
        type: e.type,
        detectedAt: e.detectedAt,
        location: e.location,
        automatic: e.automatic
      }))
    });
  } catch (err) {
    logger.error('Error fetching geofence events:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// DÉMARRAGE DU SERVEUR
// ============================================================================

if (!global.__geo_tracking_initialized) {
  global.__geo_tracking_initialized = true;

  global.__geo_tracking_server = app.listen(PORT, () => {
    logger.info(`🚀 Geo-Tracking Service running on http://localhost:${PORT}`);
    logger.info(`📡 Ready to track positions with ${TOMTOM_API_KEY ? 'TomTom API' : 'basic calculation'}`);
    logger.info(`🎯 Geofencing radius: ${GEOFENCE_RADIUS_METERS}m`);
  });
} else {
  logger.info('[geo-tracking] Server already initialized, skipping restart');
}

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
