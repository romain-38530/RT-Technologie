# MongoDB Atlas Configuration - RT-Technologie

## Vue d'ensemble

Ce document décrit la configuration complète de MongoDB Atlas pour RT-Technologie, incluant les clusters, la sécurité, les backups et le monitoring.

## Clusters MongoDB Atlas

### Environnement Development

```yaml
Cluster Name: rt-dev
Tier: M0 (Free Tier)
Provider: AWS
Region: eu-west-3 (Paris)
MongoDB Version: 7.0
Nodes: 1 (Single node)
Storage: 512MB (shared)
IOPS: Shared
RAM: 0.5GB
Auto-scaling: Disabled
High Availability: No (single node)

Backup:
  Type: None (manual snapshots only)
  Retention: N/A

Cost: $0/month
```

**Usage** : Développement local, tests unitaires

---

### Environnement Staging

```yaml
Cluster Name: rt-staging
Tier: M2 (Shared Cluster)
Provider: AWS
Region: eu-west-3 (Paris)
MongoDB Version: 7.0
Nodes: 3 (Replica Set)
Storage: 2GB → 10GB (auto-scaling)
IOPS: ~100
RAM: 2GB
vCPUs: Shared
Auto-scaling: Storage only
High Availability: Yes (3-node replica set)

Backup:
  Type: Cloud Backup (snapshots)
  Frequency: Daily at 03:00 UTC
  Retention: 7 days
  Point-in-time Recovery: No

Cost: ~$9/month
```

**Usage** : Tests d'intégration, QA, pré-production

---

### Environnement Production

```yaml
Cluster Name: rt-production
Tier: M10 (General Purpose)
Provider: AWS
Regions:
  Primary: eu-west-3 (Paris) - Priority 7
  Secondary: eu-central-1 (Frankfurt) - Priority 6
  Secondary: eu-west-2 (London) - Priority 5
MongoDB Version: 7.0
Nodes: 3 (Multi-region Replica Set)
Storage: 10GB → 500GB (auto-scaling enabled)
IOPS: 3000 (provisioned)
RAM: 2GB per node
vCPUs: 2 per node
Auto-scaling:
  Storage: Enabled (10GB → 500GB)
  Compute: Disabled (manual scaling)
High Availability: Yes (Multi-region)
Read Preference: Primary Preferred

Backup:
  Type: Continuous Cloud Backup
  Point-in-time Recovery: Yes (last 48 hours)
  Snapshot Schedule:
    - Every 6 hours
    - Daily snapshots retained for 30 days
    - Weekly snapshots retained for 12 weeks
    - Monthly snapshots retained for 12 months
  Cross-region Replication: Yes (Paris → Frankfurt)

Cost: ~$72/month (M10 cluster + backups)
```

**Usage** : Production avec haute disponibilité

---

## Structure des Bases de Données

### Base de données principale : `rt-production`

#### Collections

```yaml
organizations:
  Description: Organisations (chargeurs, transporteurs, logisticiens, etc.)
  Indexes:
    - _id (unique)
    - role (non-unique)
    - email (unique, sparse)
    - createdAt (TTL index, 90 days for deleted orgs)
  Estimated Size: 10MB
  Estimated Documents: ~1,000

users:
  Description: Utilisateurs de la plateforme
  Indexes:
    - _id (unique)
    - orgId (non-unique)
    - email (unique)
    - roles (multikey)
  Estimated Size: 5MB
  Estimated Documents: ~5,000

orders:
  Description: Commandes de transport (TMS core)
  Indexes:
    - _id (unique)
    - orgId (non-unique)
    - status (non-unique)
    - createdAt (descending)
    - pickup.date (ascending)
    - delivery.date (ascending)
  Estimated Size: 500MB
  Estimated Documents: ~100,000/year
  Sharding: Consider after 1M documents

carriers:
  Description: Transporteurs (vigilance system)
  Indexes:
    - _id (unique)
    - vat (unique)
    - email (unique, sparse)
    - status (non-unique)
    - lastVatCheckAt (ascending)
  Estimated Size: 10MB
  Estimated Documents: ~2,000

palettes:
  Description: Palettes consignées
  Indexes:
    - _id (unique)
    - organizationId (non-unique)
    - status (non-unique)
    - consigneeEmail (non-unique, sparse)
    - createdAt (descending)
  Estimated Size: 100MB
  Estimated Documents: ~50,000

storage_needs:
  Description: Besoins de stockage (marketplace)
  Indexes:
    - _id (unique)
    - organizationId (non-unique)
    - status (non-unique)
    - city + zipCode (compound)
    - expiresAt (TTL index)
  Estimated Size: 50MB
  Estimated Documents: ~10,000

affret_requests:
  Description: Demandes d'affrètement (IA matching)
  Indexes:
    - _id (unique)
    - organizationId (non-unique)
    - status (non-unique)
    - route.origin + route.destination (geospatial)
    - createdAt (descending)
  Estimated Size: 200MB
  Estimated Documents: ~50,000

training_progress:
  Description: Progression formation utilisateurs
  Indexes:
    - _id (unique)
    - userId (non-unique)
    - moduleId (non-unique)
    - completed (non-unique)
  Estimated Size: 10MB
  Estimated Documents: ~20,000

notifications_log:
  Description: Historique des notifications envoyées
  Indexes:
    - _id (unique)
    - to (non-unique)
    - status (non-unique)
    - createdAt (TTL index, 30 days)
  Estimated Size: 100MB
  Estimated Documents: ~500,000
  TTL: 30 days (auto-delete)

pricing_grids:
  Description: Grilles tarifaires
  Indexes:
    - _id (unique)
    - organizationId (non-unique)
    - active (non-unique)
  Estimated Size: 20MB
  Estimated Documents: ~5,000
```

**Total Estimated Storage (1 year)** : ~1GB

---

## Utilisateurs et Permissions

### Database Users

#### 1. Application User (app_user)

```yaml
Username: app_user
Password: <strong-password-256-bits>
Built-in Role: readWrite
Database: rt-production
Scopes: All collections
Purpose: Backend services (normal operations)

Specific Privileges:
  - find, insert, update, remove (all collections)
  - listCollections, listIndexes
  - createIndex (for migrations)

IP Whitelist:
  - NAT Gateway IPs (from Terraform output)
  - GitHub Actions IP range (for CI/CD)

Restrictions:
  - Cannot drop collections
  - Cannot drop database
  - Cannot manage users
```

**Connection String** :
```
mongodb+srv://app_user:<password>@rt-production.xxxxx.mongodb.net/rt-production?retryWrites=true&w=majority
```

---

#### 2. Admin User (admin_user)

```yaml
Username: admin_user
Password: <strong-password-256-bits>
Built-in Role: dbAdminAnyDatabase
Database: admin
Scopes: All databases
Purpose: Database administration, schema migrations

Specific Privileges:
  - Full database admin rights
  - Create/drop collections
  - Manage indexes
  - Backup/restore operations

IP Whitelist:
  - VPN IP (DevOps team)
  - Bastion host IP

Restrictions:
  - Used only for admin tasks
  - Not for application runtime
```

---

#### 3. Backup User (backup_user)

```yaml
Username: backup_user
Password: <strong-password-256-bits>
Built-in Role: backup
Database: admin
Scopes: All databases
Purpose: Automated backups only

Specific Privileges:
  - Read-only access to all databases
  - Backup operations
  - Query oplog

IP Whitelist:
  - Backup server IP
  - AWS Lambda IP (for automated backups)
```

---

#### 4. Read-Only User (readonly_user)

```yaml
Username: readonly_user
Password: <strong-password-256-bits>
Built-in Role: read
Database: rt-production
Scopes: All collections
Purpose: Analytics, BI tools, monitoring

Specific Privileges:
  - Read-only access to all collections
  - Cannot modify data

IP Whitelist:
  - Analytics tools (e.g., Metabase, Tableau)
  - DataDog monitoring
```

---

## Network Security

### IP Access List (Whitelist)

#### Production

```yaml
# AWS NAT Gateway (from Terraform)
- 52.47.XXX.XXX/32 (NAT-AZ-A Paris)
- 15.237.XXX.XXX/32 (NAT-AZ-B Paris)

# GitHub Actions (CI/CD)
- 20.205.243.166/32
- 20.87.245.0/24
- 140.82.112.0/20

# VPN (DevOps team)
- 203.0.113.0/24 (Company VPN)

# Temporary (remove after testing)
- 0.0.0.0/0 (ALL IPs - ONLY FOR INITIAL SETUP, REMOVE ASAP!)

# DataDog Monitoring
- 3.93.194.0/24
```

**Important** :
- NEVER use `0.0.0.0/0` in production long-term
- Update IPs automatically via Terraform after NAT Gateway deployment
- Use VPC Peering for tighter security (recommended)

---

### VPC Peering (Recommended)

```yaml
Enable VPC Peering: Yes
AWS VPC ID: vpc-rt-prod (from Terraform)
VPC CIDR: 10.0.0.0/16
AWS Region: eu-west-3 (Paris)

Benefits:
  - No public internet exposure
  - Lower latency
  - Free data transfer within AWS
  - More secure (private network)

Setup:
  1. In MongoDB Atlas:
     - Network Access → Peering → Create Peering
     - Provider: AWS
     - Region: eu-west-3
     - VPC CIDR: 10.0.0.0/16

  2. In AWS:
     - Accept peering request
     - Update route tables
     - Update security groups

Cost: Free (only data transfer costs)
```

---

## Backup Strategy

### Continuous Backup (Production only)

```yaml
Type: Continuous Cloud Backup
Provider: MongoDB Atlas native
Storage Location: AWS eu-west-3 (Paris)

Point-in-Time Recovery:
  Enabled: Yes
  Retention: Last 48 hours (any second)
  RPO: < 1 minute (Recovery Point Objective)
  RTO: < 1 hour (Recovery Time Objective)

Snapshot Schedule:
  - Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
  - Daily: 03:00 UTC
  - Weekly: Sunday 03:00 UTC
  - Monthly: 1st of month 03:00 UTC

Retention Policy:
  - Hourly snapshots: 48 hours
  - Daily snapshots: 30 days
  - Weekly snapshots: 12 weeks
  - Monthly snapshots: 12 months
  - Yearly snapshots: 5 years (manual, for compliance)

Cross-Region Replication:
  Enabled: Yes
  Destination: AWS eu-central-1 (Frankfurt)
  Frequency: Every 6 hours
  Retention: 7 days

Encryption:
  At-rest: AES-256 (MongoDB Atlas default)
  In-transit: TLS 1.2+ (enforced)
```

### Backup Testing

```yaml
Test Frequency: Monthly
Test Type: Full restore to staging cluster
Success Criteria:
  - Restore completes in < 1 hour
  - Data integrity verified (checksums)
  - Application can connect and query

Disaster Recovery Drill:
  Frequency: Quarterly
  Scenario: Full production failure
  Steps:
    1. Restore from latest snapshot
    2. Verify data consistency
    3. Update DNS to new cluster
    4. Test all services
  Target RTO: < 2 hours
  Target RPO: < 15 minutes
```

---

## Performance Optimization

### Indexing Strategy

```javascript
// Users collection - Optimize login queries
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ orgId: 1 });

// Orders collection - Optimize listing/filtering
db.orders.createIndex({ orgId: 1, createdAt: -1 });
db.orders.createIndex({ status: 1, createdAt: -1 });
db.orders.createIndex({ "pickup.date": 1 });
db.orders.createIndex({ "delivery.date": 1 });

// Carriers collection - Optimize VAT checks
db.carriers.createIndex({ vat: 1 }, { unique: true });
db.carriers.createIndex({ lastVatCheckAt: 1 });

// Palettes collection - Optimize queries by org and status
db.palettes.createIndex({ organizationId: 1, status: 1 });
db.palettes.createIndex({ createdAt: -1 });

// TTL Indexes (auto-delete old documents)
db.notifications_log.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 } // 30 days
);

db.storage_needs.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 } // Expire at specific time
);
```

### Query Optimization

```yaml
Use Projection:
  - Only fetch needed fields
  - Example: db.users.find({}, { name: 1, email: 1 })

Use Limit:
  - Always limit results for listings
  - Example: db.orders.find().limit(100)

Use Covered Queries:
  - Query only indexed fields
  - Avoid fetching full documents when possible

Use Aggregation Pipeline:
  - For complex queries and analytics
  - Better performance than client-side processing

Avoid:
  - $where operator (very slow)
  - Large $in arrays (> 100 items)
  - Unbounded queries without limit
```

---

## Monitoring & Alerts

### MongoDB Atlas Monitoring

```yaml
Built-in Metrics (Real-time):
  - Connections (current, available)
  - Query Execution Times
  - Network traffic (in/out)
  - Disk IOPS
  - CPU utilization
  - Memory utilization
  - Replication lag
  - Index hit ratio

Custom Dashboards:
  - Business KPIs (orders/day, users/day)
  - Slow queries (> 100ms)
  - Error rates
  - Backup status
```

### Alert Configuration

```yaml
Critical Alerts (PagerDuty):
  - Cluster down
  - Replication lag > 10 seconds
  - Disk usage > 90%
  - CPU > 95% for 5 minutes
  - Backup failure
  - Authentication failures > 100/min

Warning Alerts (Email):
  - CPU > 80% for 10 minutes
  - Disk usage > 85%
  - Connections > 80% of max
  - Slow queries > 500ms (sustained)
  - Replication lag > 5 seconds

Info Alerts (Slack):
  - Disk auto-scaling triggered
  - Backup completed successfully
  - Index creation completed
  - User added/removed

Alert Channels:
  - PagerDuty: critical-ops@rt-technologie.com
  - Email: devops@rt-technologie.com
  - Slack: #rt-alerts
  - SMS: +33 X XX XX XX XX (on-call engineer)
```

### Performance Advisor

```yaml
Enabled: Yes
Frequency: Daily
Recommendations:
  - Missing indexes
  - Unused indexes (remove to save memory)
  - Slow queries
  - Schema optimization

Auto-apply: No (manual review required)
```

---

## Security Configuration

### Encryption

```yaml
Encryption at Rest:
  Provider: AWS KMS
  Algorithm: AES-256
  Key Rotation: Automatic (annual)
  Status: Enabled (mandatory for M10+)

Encryption in Transit:
  Protocol: TLS 1.2+ only
  Certificate: MongoDB Atlas provided
  Enforce: Yes (reject non-TLS connections)

Database Authentication:
  Method: SCRAM-SHA-256
  Password Policy:
    - Minimum 16 characters
    - Mixed case, numbers, symbols required
    - Rotation: Every 90 days (mandatory)
```

### Audit Logs

```yaml
Enabled: Yes
Storage: MongoDB Atlas (90 days retention)
Export: S3 bucket (long-term retention)

Events Logged:
  - Authentication (success/failure)
  - Authorization failures
  - CRUD operations (on sensitive collections)
  - Index creation/deletion
  - User management
  - Backup operations
  - Configuration changes

Compliance: GDPR, SOC 2, ISO 27001
```

### Access Control

```yaml
Multi-Factor Authentication (MFA):
  Required: Yes (for all Atlas users)
  Method: TOTP (Google Authenticator, Authy)

API Keys:
  Purpose: Terraform, automation scripts
  Permissions: Limited to specific operations
  Rotation: Every 90 days

IP Whitelist:
  Default: Deny all
  Allow: Only whitelisted IPs
  Review: Monthly (remove unused IPs)
```

---

## Compliance & Data Privacy

### GDPR Compliance

```yaml
Data Residency:
  Primary: EU (Paris)
  Replicas: EU only (Frankfurt, London)
  No data outside EU: Guaranteed

Right to Erasure:
  Implemented: Yes
  API: DELETE /api/users/:id (hard delete)
  Backup purge: After 90 days

Data Export:
  Format: JSON
  API: GET /api/users/:id/export
  Includes: All user data

Consent Management:
  Stored: users.consent field
  Required before processing

Data Processing Agreement (DPA):
  Signed with MongoDB Atlas: Yes
  Available at: https://www.mongodb.com/legal/dpa
```

### Data Retention Policy

```yaml
Active Users:
  Retention: Indefinite (while account active)

Deleted Users:
  Soft delete: 30 days (can be restored)
  Hard delete: After 30 days
  Backup purge: After 90 days

Orders:
  Active: Indefinite
  Completed: 7 years (legal requirement)
  Archived: After 7 years (move to Glacier)

Notifications:
  Retention: 30 days (TTL index)
  Auto-delete: Yes

Logs:
  Audit logs: 90 days (Atlas) + 1 year (S3)
  Application logs: 30 days
```

---

## Migration Strategy

### From Development to Production

```bash
# 1. Export from dev cluster
mongodump --uri="mongodb+srv://user:pass@rt-dev.xxxxx.mongodb.net/rt-dev" --out=/tmp/dump

# 2. Import to production cluster
mongorestore --uri="mongodb+srv://user:pass@rt-production.xxxxx.mongodb.net/rt-production" /tmp/dump/rt-dev

# 3. Verify data integrity
mongo "mongodb+srv://rt-production.xxxxx.mongodb.net" --eval "db.users.count()"
```

### Zero-Downtime Migration

```yaml
Strategy: Dual-write + Read-from-new

Steps:
  1. Setup new cluster (rt-production-v2)
  2. Enable dual-write (write to both clusters)
  3. Migrate existing data (bulk copy)
  4. Verify data consistency
  5. Switch read traffic to new cluster
  6. Monitor for 24h
  7. Disable dual-write
  8. Decommission old cluster

Rollback Plan:
  - Switch read traffic back to old cluster
  - Fix issues
  - Retry migration
```

---

## Cost Optimization

### Current Costs (Monthly)

```yaml
Development (M0): $0
Staging (M2): $9
Production (M10): $57
Backups (Production): $10
Data Transfer: $5

Total: ~$81/month
```

### Cost Reduction Strategies

```yaml
1. Use Free Tier (M0) for dev:
   Savings: $9/month

2. Pause staging cluster when not in use:
   Savings: ~$5/month

3. Optimize storage (delete old data):
   Savings: ~$3/month

4. Use VPC Peering (free data transfer):
   Savings: ~$5/month

Total Potential Savings: ~$22/month (27%)
```

### Scaling Plan

```yaml
Current: M10 (2GB RAM, 10GB storage)

When to scale to M20:
  - Connections > 80% of limit (500)
  - CPU > 80% sustained
  - RAM > 90%
  - Storage > 400GB

M20 Cost: ~$114/month (+$57)

When to scale to M30:
  - High-traffic phase (> 1M orders/month)
  - Multi-tenant expansion

M30 Cost: ~$228/month (+$171)
```

---

## Disaster Recovery Plan

### Scenario 1: Primary Region Failure (Paris)

```yaml
Trigger: Paris region unavailable
Action: Automatic failover to Frankfurt
RTO: < 5 minutes (automatic)
RPO: < 1 minute (continuous replication)
Steps:
  1. Atlas auto-elects new primary (Frankfurt)
  2. Application reconnects automatically (connection string remains same)
  3. Monitor replication lag
  4. Update DNS if needed (manual)
  5. Wait for Paris to recover
  6. Re-sync Paris node
  7. Failback to Paris (manual, during maintenance window)
```

### Scenario 2: Data Corruption

```yaml
Trigger: Malicious update/delete or bug
Action: Point-in-time recovery
RTO: < 1 hour
RPO: < 15 minutes
Steps:
  1. Identify corruption time
  2. Create new cluster from snapshot (5-10 min before corruption)
  3. Verify data integrity
  4. Update application connection strings
  5. Test all critical flows
  6. Switch traffic to new cluster
  7. Investigate root cause
```

### Scenario 3: Complete Atlas Outage

```yaml
Trigger: MongoDB Atlas service-wide issue
Action: Migrate to self-hosted MongoDB (last resort)
RTO: < 4 hours
RPO: Last snapshot (< 6 hours)
Steps:
  1. Spin up EC2 instances with MongoDB
  2. Restore from latest Atlas backup export
  3. Update application connection strings
  4. Manual failover
  5. Monitor until Atlas recovers
  6. Migrate back to Atlas
```

---

## Runbook: Common Operations

### Add New Database User

```bash
# In MongoDB Atlas UI
1. Database Access → Add New Database User
2. Authentication Method: Password (auto-generate)
3. Database User Privileges:
   - Built-in Role: readWrite
   - Database: rt-production
4. Add IP to whitelist (if needed)
5. Save password to AWS Secrets Manager

# Or via Terraform (recommended)
terraform apply -var="create_user=true" -var="username=new_user"
```

### Manual Backup

```bash
# Create on-demand snapshot
1. MongoDB Atlas UI → Backups
2. Click "Take Snapshot Now"
3. Description: "Manual backup before migration"
4. Retention: 7 days
5. Click "Take Snapshot"

# Or via API
curl -X POST "https://cloud.mongodb.com/api/atlas/v1.0/groups/{GROUP_ID}/clusters/{CLUSTER_NAME}/backup/snapshots" \
  -u "{PUBLIC_KEY}:{PRIVATE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"description": "Manual backup", "retentionDays": 7}'
```

### Restore from Backup

```bash
# Via Atlas UI
1. Backups → Select snapshot
2. Click "..." → Restore
3. Choose restoration method:
   - Automated restore (create new cluster)
   - Download (mongodump format)
4. Specify target cluster or download
5. Monitor restore progress

# Point-in-time restore (last 48h)
1. Backups → Continuous Backup
2. Select date/time to restore to
3. Create new cluster from this point
4. Verify data
5. Switch application traffic
```

### Performance Troubleshooting

```bash
# Check slow queries
1. Atlas UI → Performance Advisor
2. Review slow queries (> 100ms)
3. Check suggested indexes
4. Create indexes via:
   db.collection.createIndex({ field: 1 })

# Check current operations
db.currentOp()

# Kill long-running query
db.killOp(<opId>)

# Analyze query performance
db.orders.find({ status: "pending" }).explain("executionStats")
```

---

## Terraform Integration

```hcl
# infra/terraform/mongodb-atlas.tf

# Configure Atlas provider
terraform {
  required_providers {
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 1.14"
    }
  }
}

provider "mongodbatlas" {
  public_key  = var.mongodb_atlas_public_key
  private_key = var.mongodb_atlas_private_key
}

# Create production cluster
resource "mongodbatlas_cluster" "production" {
  project_id   = var.mongodb_atlas_project_id
  name         = "rt-production"
  cluster_type = "REPLICASET"

  provider_name               = "AWS"
  provider_instance_size_name = "M10"
  provider_region_name        = "EU_WEST_3" # Paris

  replication_specs {
    num_shards = 1
    regions_config {
      region_name     = "EU_WEST_3" # Paris
      electable_nodes = 2
      priority        = 7
    }
    regions_config {
      region_name     = "EU_CENTRAL_1" # Frankfurt
      electable_nodes = 1
      priority        = 6
    }
  }

  mongo_db_major_version = "7.0"
  auto_scaling_disk_gb_enabled = true

  backup_enabled = true
  pit_enabled    = true

  encryption_at_rest_provider = "AWS"
}

# Add IP whitelist (from Terraform NAT Gateway output)
resource "mongodbatlas_project_ip_access_list" "nat_gateways" {
  for_each   = toset(var.nat_gateway_ips)
  project_id = var.mongodb_atlas_project_id
  ip_address = each.value
  comment    = "NAT Gateway ${each.key}"
}

# Create database user
resource "mongodbatlas_database_user" "app_user" {
  username           = "app_user"
  password           = random_password.mongodb_app_password.result
  project_id         = var.mongodb_atlas_project_id
  auth_database_name = "admin"

  roles {
    role_name     = "readWrite"
    database_name = "rt-production"
  }
}

# Output connection string
output "mongodb_connection_string" {
  value     = mongodbatlas_cluster.production.connection_strings[0].standard_srv
  sensitive = true
}
```

---

## Useful Links

- MongoDB Atlas Dashboard: https://cloud.mongodb.com
- Documentation: https://docs.atlas.mongodb.com
- Status Page: https://status.mongodb.com
- Support: https://support.mongodb.com

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-18
**Maintained by**: RT-Technologie DevOps Team
**Contact**: devops@rt-technologie.com
