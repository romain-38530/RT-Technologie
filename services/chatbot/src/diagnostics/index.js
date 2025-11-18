const http = require('http');
const https = require('https');

/**
 * Diagnostics Engine
 * Performs automated diagnostics via API calls
 */
class DiagnosticsEngine {
  constructor() {
    this.serviceUrls = {
      coreOrders: process.env.CORE_ORDERS_URL || 'http://localhost:3001',
      erpSync: process.env.ERP_SYNC_URL || 'http://localhost:3004',
      tmsSync: process.env.TMS_SYNC_URL || 'http://localhost:3009',
      wmsSync: process.env.WMS_SYNC_URL || 'http://localhost:3005',
      trackingIA: process.env.TRACKING_IA_URL || 'http://localhost:3002',
      affretIA: process.env.AFFRET_IA_URL || 'http://localhost:3011',
      vigilance: process.env.VIGILANCE_URL || 'http://localhost:3012',
      notifications: process.env.NOTIFICATIONS_URL || 'http://localhost:3008',
      ecpmr: process.env.ECPMR_URL || 'http://localhost:3015'
    };

    this.diagnosticChecks = {
      api_health: this.checkAPIHealth.bind(this),
      erp_connection: this.checkERPConnection.bind(this),
      tms_connection: this.checkTMSConnection.bind(this),
      wms_connection: this.checkWMSConnection.bind(this),
      carrier_status: this.checkCarrierStatus.bind(this),
      document_transmission: this.checkDocumentTransmission.bind(this),
      order_status: this.checkOrderStatus.bind(this),
      server_health: this.checkServerHealth.bind(this),
      file_format: this.checkFileFormat.bind(this)
    };
  }

  /**
   * Run diagnostics based on issue context
   */
  async runDiagnostics(context, issue) {
    const results = [];
    const lowerIssue = issue.toLowerCase();

    console.log('[Diagnostics] Running diagnostics for issue:', issue);

    // Determine which checks to run based on keywords
    const checksToRun = [];

    // Always check API health
    checksToRun.push('api_health');

    // ERP-related issues
    if (lowerIssue.includes('erp') || lowerIssue.includes('commande') || lowerIssue.includes('order')) {
      checksToRun.push('erp_connection', 'order_status');
    }

    // TMS-related issues
    if (lowerIssue.includes('tms') || lowerIssue.includes('transport') || lowerIssue.includes('affectation')) {
      checksToRun.push('tms_connection', 'carrier_status');
    }

    // WMS-related issues
    if (lowerIssue.includes('wms') || lowerIssue.includes('entrepôt') || lowerIssue.includes('warehouse')) {
      checksToRun.push('wms_connection');
    }

    // Tracking issues
    if (lowerIssue.includes('tracking') || lowerIssue.includes('suivi') || lowerIssue.includes('localisation')) {
      checksToRun.push('carrier_status');
    }

    // Document issues
    if (lowerIssue.includes('document') || lowerIssue.includes('pod') || lowerIssue.includes('cmr') || lowerIssue.includes('fichier')) {
      checksToRun.push('document_transmission', 'file_format');
    }

    // Transporteur issues
    if (lowerIssue.includes('transporteur') || lowerIssue.includes('carrier') || lowerIssue.includes('chauffeur')) {
      checksToRun.push('carrier_status');
    }

    // Performance issues
    if (lowerIssue.includes('lent') || lowerIssue.includes('slow') || lowerIssue.includes('timeout')) {
      checksToRun.push('server_health');
    }

    // Run all selected checks
    for (const checkName of checksToRun) {
      const checkFn = this.diagnosticChecks[checkName];
      if (checkFn) {
        try {
          const result = await checkFn(context);
          results.push(result);
        } catch (err) {
          results.push({
            check: checkName,
            status: 'error',
            severity: 'high',
            message: `Erreur lors du diagnostic: ${err.message}`,
            timestamp: Date.now()
          });
        }
      }
    }

    console.log(`[Diagnostics] Completed ${results.length} checks`);

    return results;
  }

  /**
   * Check API Health
   */
  async checkAPIHealth(context) {
    const results = [];
    const services = ['coreOrders', 'erpSync', 'tmsSync', 'vigilance', 'notifications'];

    for (const serviceName of services) {
      const serviceUrl = this.serviceUrls[serviceName];
      if (!serviceUrl) continue;

      try {
        const response = await this.httpGet(`${serviceUrl}/health`, 5000);
        results.push({
          service: serviceName,
          status: response.status === 'ok' ? 'ok' : 'warning',
          responseTime: response.responseTime || 'N/A'
        });
      } catch (err) {
        results.push({
          service: serviceName,
          status: 'error',
          error: err.message
        });
      }
    }

    const failedServices = results.filter(r => r.status === 'error');
    const severity = failedServices.length > 2 ? 'critical' : failedServices.length > 0 ? 'high' : 'low';

    return {
      check: 'api_health',
      status: failedServices.length === 0 ? 'ok' : 'error',
      severity,
      message: failedServices.length === 0
        ? 'Tous les services sont opérationnels'
        : `${failedServices.length} service(s) inaccessible(s): ${failedServices.map(r => r.service).join(', ')}`,
      details: results,
      timestamp: Date.now()
    };
  }

  /**
   * Check ERP Connection
   */
  async checkERPConnection(context) {
    try {
      const response = await this.httpGet(`${this.serviceUrls.erpSync}/health`, 5000);

      const isConnected = response.status === 'ok' && response.erpConnected !== false;

      return {
        check: 'erp_connection',
        status: isConnected ? 'ok' : 'error',
        severity: isConnected ? 'low' : 'critical',
        message: isConnected
          ? 'Connexion ERP opérationnelle'
          : 'Connexion ERP défaillante - Vérifiez les identifiants et la disponibilité du serveur ERP',
        details: response,
        timestamp: Date.now()
      };
    } catch (err) {
      return {
        check: 'erp_connection',
        status: 'error',
        severity: 'critical',
        message: `Impossible de vérifier la connexion ERP: ${err.message}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Check TMS Connection
   */
  async checkTMSConnection(context) {
    try {
      const response = await this.httpGet(`${this.serviceUrls.tmsSync}/health`, 5000);

      const isConnected = response.status === 'ok' && response.tmsConnected !== false;

      return {
        check: 'tms_connection',
        status: isConnected ? 'ok' : 'warning',
        severity: isConnected ? 'low' : 'high',
        message: isConnected
          ? 'Connexion TMS opérationnelle'
          : 'Connexion TMS défaillante - Certaines fonctionnalités transport peuvent être limitées',
        details: response,
        timestamp: Date.now()
      };
    } catch (err) {
      return {
        check: 'tms_connection',
        status: 'error',
        severity: 'high',
        message: `Impossible de vérifier la connexion TMS: ${err.message}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Check WMS Connection
   */
  async checkWMSConnection(context) {
    try {
      const response = await this.httpGet(`${this.serviceUrls.wmsSync}/health`, 5000);

      const isConnected = response.status === 'ok' && response.wmsConnected !== false;

      return {
        check: 'wms_connection',
        status: isConnected ? 'ok' : 'warning',
        severity: isConnected ? 'low' : 'high',
        message: isConnected
          ? 'Connexion WMS opérationnelle'
          : 'Connexion WMS défaillante - Gestion des stocks et quais peut être impactée',
        details: response,
        timestamp: Date.now()
      };
    } catch (err) {
      return {
        check: 'wms_connection',
        status: 'error',
        severity: 'high',
        message: `Impossible de vérifier la connexion WMS: ${err.message}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Check Carrier Status
   */
  async checkCarrierStatus(context) {
    if (!context.carrierId) {
      return {
        check: 'carrier_status',
        status: 'skipped',
        severity: 'low',
        message: 'Aucun transporteur spécifié dans le contexte',
        timestamp: Date.now()
      };
    }

    try {
      const response = await this.httpGet(
        `${this.serviceUrls.vigilance}/vigilance/status/${context.carrierId}`,
        5000
      );

      const status = response.status || 'UNKNOWN';
      const isBlocked = status === 'BLOCKED';

      return {
        check: 'carrier_status',
        status: isBlocked ? 'error' : 'ok',
        severity: isBlocked ? 'critical' : 'low',
        message: isBlocked
          ? `Le transporteur ${context.carrierId} est BLOQUÉ par la vigilance`
          : `Le transporteur ${context.carrierId} est opérationnel (statut: ${status})`,
        details: response,
        timestamp: Date.now()
      };
    } catch (err) {
      return {
        check: 'carrier_status',
        status: 'warning',
        severity: 'medium',
        message: `Impossible de vérifier le statut du transporteur: ${err.message}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Check Document Transmission
   */
  async checkDocumentTransmission(context) {
    if (!context.orderId) {
      return {
        check: 'document_transmission',
        status: 'skipped',
        severity: 'low',
        message: 'Aucune commande spécifiée dans le contexte',
        timestamp: Date.now()
      };
    }

    try {
      const response = await this.httpGet(
        `${this.serviceUrls.ecpmr}/ecpmr/documents?orderId=${context.orderId}`,
        5000
      );

      const documents = response.documents || [];
      const pendingDocs = documents.filter(d => d.status === 'pending');
      const failedDocs = documents.filter(d => d.status === 'failed');

      let status = 'ok';
      let severity = 'low';
      let message = 'Tous les documents sont transmis';

      if (failedDocs.length > 0) {
        status = 'error';
        severity = 'high';
        message = `${failedDocs.length} document(s) en échec de transmission`;
      } else if (pendingDocs.length > 0) {
        status = 'warning';
        severity = 'medium';
        message = `${pendingDocs.length} document(s) en attente de transmission`;
      }

      return {
        check: 'document_transmission',
        status,
        severity,
        message,
        details: { total: documents.length, pending: pendingDocs.length, failed: failedDocs.length },
        timestamp: Date.now()
      };
    } catch (err) {
      return {
        check: 'document_transmission',
        status: 'error',
        severity: 'high',
        message: `Impossible de vérifier la transmission des documents: ${err.message}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Check Order Status
   */
  async checkOrderStatus(context) {
    if (!context.orderId) {
      return {
        check: 'order_status',
        status: 'skipped',
        severity: 'low',
        message: 'Aucune commande spécifiée dans le contexte',
        timestamp: Date.now()
      };
    }

    try {
      const response = await this.httpGet(
        `${this.serviceUrls.coreOrders}/industry/orders/${context.orderId}`,
        5000
      );

      const orderStatus = response.status || 'UNKNOWN';
      const isProblematic = ['ERROR', 'BLOCKED', 'ESCALATED_AFFRETIA'].includes(orderStatus);

      return {
        check: 'order_status',
        status: isProblematic ? 'warning' : 'ok',
        severity: isProblematic ? 'high' : 'low',
        message: `Statut de la commande: ${orderStatus}`,
        details: response,
        timestamp: Date.now()
      };
    } catch (err) {
      return {
        check: 'order_status',
        status: 'error',
        severity: 'high',
        message: `Impossible de récupérer le statut de la commande: ${err.message}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Check Server Health (memory, CPU simulation)
   */
  async checkServerHealth(context) {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const heapUsagePercent = Math.round((heapUsedMB / heapTotalMB) * 100);

    let status = 'ok';
    let severity = 'low';
    let message = `Serveur sain - Mémoire: ${heapUsedMB}MB / ${heapTotalMB}MB (${heapUsagePercent}%)`;

    if (heapUsagePercent > 90) {
      status = 'error';
      severity = 'critical';
      message = `Mémoire critique: ${heapUsagePercent}% utilisé - Risque de ralentissement`;
    } else if (heapUsagePercent > 75) {
      status = 'warning';
      severity = 'medium';
      message = `Mémoire élevée: ${heapUsagePercent}% utilisé - Surveiller`;
    }

    return {
      check: 'server_health',
      status,
      severity,
      message,
      details: {
        heapUsedMB,
        heapTotalMB,
        heapUsagePercent,
        uptime: Math.round(process.uptime())
      },
      timestamp: Date.now()
    };
  }

  /**
   * Check File Format (mock implementation)
   */
  async checkFileFormat(context) {
    if (!context.fileName) {
      return {
        check: 'file_format',
        status: 'skipped',
        severity: 'low',
        message: 'Aucun fichier spécifié dans le contexte',
        timestamp: Date.now()
      };
    }

    // Mock validation - in production, would check actual file
    const validExtensions = ['.pdf', '.csv', '.xlsx', '.xml', '.json'];
    const extension = context.fileName.substring(context.fileName.lastIndexOf('.')).toLowerCase();

    const isValid = validExtensions.includes(extension);

    return {
      check: 'file_format',
      status: isValid ? 'ok' : 'error',
      severity: isValid ? 'low' : 'high',
      message: isValid
        ? `Format de fichier valide: ${extension}`
        : `Format de fichier non supporté: ${extension}. Formats acceptés: ${validExtensions.join(', ')}`,
      timestamp: Date.now()
    };
  }

  /**
   * HTTP GET helper
   */
  httpGet(targetUrl, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const u = new URL(targetUrl);
      const isHttps = u.protocol === 'https:';

      const options = {
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: u.pathname + (u.search || ''),
        method: 'GET',
        timeout
      };

      const client = isHttps ? https : http;
      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          try {
            const json = data ? JSON.parse(data) : {};
            json.responseTime = responseTime;
            resolve(json);
          } catch (err) {
            resolve({ status: 'ok', responseTime, raw: data });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });

      req.end();
    });
  }
}

module.exports = { DiagnosticsEngine };
