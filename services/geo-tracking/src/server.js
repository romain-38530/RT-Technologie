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

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { MongoClient } = require('mongodb');
const winston = require('winston');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Configuration
const PORT = process.env.PORT || 3016;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rt-technologie';
const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const GEOFENCE_RADIUS_METERS = 200; // Rayon de détection en mètres

// Logger
const logger = winston.createLogger({
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
  ]
});

// Express app
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then(client => {
    db = client.db();
    logger.info('✅ Connected to MongoDB');
  })
  .catch(err => {
    logger.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

// ============================================================================
// MIDDLEWARES
// ============================================================================

/**
 * Middleware d'authentification JWT
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
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
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Rayon de la Terre en mètres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Vérifie si un point est dans un géofence
 * @param {number} lat - Latitude du point
 * @param {number} lon - Longitude du point
 * @param {object} center - Centre du géofence {latitude, longitude}
 * @param {number} radiusMeters - Rayon du géofence en mètres
 * @returns {boolean}
 */
function isInGeofence(lat, lon, center, radiusMeters = GEOFENCE_RADIUS_METERS) {
  const distance = calculateDistance(lat, lon, center.latitude, center.longitude);
  return distance <= radiusMeters;
}

/**
 * Détecte les événements de géofencing
 * @param {object} position - Position actuelle
 * @param {object} order - Commande avec pickup et delivery
 * @param {object} lastPosition - Dernière position connue
 * @returns {object|null} Événement détecté ou null
 */
async function detectGeofenceEvent(position, order, lastPosition) {
  const { latitude, longitude, timestamp } = position;

  // Vérifier entrée dans zone de chargement
  if (order.pickup && order.pickup.location) {
    const inPickupZone = isInGeofence(latitude, longitude, order.pickup.location);

    if (inPickupZone && lastPosition) {
      const wasInPickupZone = isInGeofence(
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
      const wasInPickupZone = isInGeofence(
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
    const inDeliveryZone = isInGeofence(latitude, longitude, order.delivery.location);

    if (inDeliveryZone && lastPosition) {
      const wasInDeliveryZone = isInGeofence(
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
}

/**
 * Calcule l'ETA avec TomTom Traffic API
 * @param {number} fromLat - Latitude départ
 * @param {number} fromLon - Longitude départ
 * @param {number} toLat - Latitude arrivée
 * @param {number} toLon - Longitude arrivée
 * @returns {object} ETA avec durée, distance, retard trafic
 */
async function calculateETA(fromLat, fromLon, toLat, toLon) {
  if (!TOMTOM_API_KEY) {
    logger.warn('⚠️  TomTom API key not configured, using simple calculation');

    // Calcul simple sans trafic (vitesse moyenne 60 km/h)
    const distanceMeters = calculateDistance(fromLat, fromLon, toLat, toLon);
    const distanceKm = distanceMeters / 1000;
    const durationMinutes = Math.round((distanceKm / 60) * 60);
    const arrivalTime = new Date(Date.now() + durationMinutes * 60 * 1000);

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
    const url = `https://api.tomtom.com/routing/1/calculateRoute/${fromLat},${fromLon}:${toLat},${toLon}/json`;
    const response = await axios.get(url, {
      params: {
        key: TOMTOM_API_KEY,
        traffic: true,
        routeType: 'fastest',
        travelMode: 'truck',
        vehicleCommercial: true
      },
      timeout: 5000
    });

    const route = response.data.routes[0];
    const summary = route.summary;

    const durationMinutes = Math.round(summary.travelTimeInSeconds / 60);
    const distanceKm = Math.round(summary.lengthInMeters / 100) / 10;
    const trafficDelay = Math.round((summary.trafficDelayInSeconds || 0) / 60);
    const arrivalTime = new Date(Date.now() + summary.travelTimeInSeconds * 1000);

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
    const distanceMeters = calculateDistance(fromLat, fromLon, toLat, toLon);
    const distanceKm = distanceMeters / 1000;
    const durationMinutes = Math.round((distanceKm / 60) * 60);
    const arrivalTime = new Date(Date.now() + durationMinutes * 60 * 1000);

    return {
      arrivalTime: arrivalTime.toISOString(),
      durationMinutes,
      distanceKm: Math.round(distanceKm * 10) / 10,
      trafficDelay: 0,
      confidence: 'LOW'
    };
  }
}

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
  const schema = Joi.object({
    orderId: Joi.string().required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    timestamp: Joi.date().iso().required(),
    accuracy: Joi.number().min(0).optional(),
    speed: Joi.number().min(0).optional(),
    heading: Joi.number().min(0).max(360).optional()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { orderId, latitude, longitude, timestamp, accuracy, speed, heading } = value;

    // Récupérer la commande
    const order = await db.collection('orders').findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Récupérer la dernière position
    const lastPosition = await db.collection('positions')
      .findOne({ orderId }, { sort: { timestamp: -1 } });

    // Enregistrer la nouvelle position
    const positionDoc = {
      orderId,
      latitude,
      longitude,
      timestamp: new Date(timestamp),
      accuracy,
      speed,
      heading,
      createdAt: new Date()
    };

    const result = await db.collection('positions').insertOne(positionDoc);
    const positionId = result.insertedId.toString();

    logger.info(`📍 Position saved for order ${orderId}: ${latitude}, ${longitude}`);

    // Détecter événements de géofencing
    let geofenceEvent = null;
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
        const statusMap = {
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
    let eta = null;
    let destination = null;

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
    const { orderId } = req.params;
    const { from, to, limit = 100 } = req.query;

    const query = { orderId };

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const positions = await db.collection('positions')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();

    const totalCount = await db.collection('positions').countDocuments({ orderId });

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
    const { orderId } = req.params;
    const { currentLat, currentLon } = req.query;

    if (!currentLat || !currentLon) {
      return res.status(400).json({ error: 'currentLat and currentLon are required' });
    }

    const order = await db.collection('orders').findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let destination = null;
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

    const eta = await calculateETA(
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
    const { orderId } = req.params;

    const events = await db.collection('geofence_events')
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

app.listen(PORT, () => {
  logger.info(`🚀 Geo-Tracking Service running on http://localhost:${PORT}`);
  logger.info(`📡 Ready to track positions with ${TOMTOM_API_KEY ? 'TomTom API' : 'basic calculation'}`);
  logger.info(`🎯 Geofencing radius: ${GEOFENCE_RADIUS_METERS}m`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
