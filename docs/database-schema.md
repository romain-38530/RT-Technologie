# RT-Technologie - Schéma de Base de Données (ERD)

## Vue d'ensemble

**Base de données:** MongoDB Atlas
**Cluster:** StagingRT
**Database:** rt-technologie
**Collections:** 40+
**Indexes:** 103+

## Diagramme Entité-Relation (ERD) Principal

```plantuml
@startuml RT-Technologie-ERD-Main
!define Table(name,desc) class name as "desc" << (T,#FFAAAA) >>
!define primary_key(x) <b>x</b>
!define foreign_key(x) <i>x</i>
!define index(x) <u>x</u>

skinparam class {
    BackgroundColor WhiteSmoke
    ArrowColor Black
    BorderColor DarkGray
}

' Core Entities

entity "organizations" as org {
    primary_key(orgId): ObjectId
    --
    name: String
    type: INDUSTRY | TRANSPORTER | LOGISTICIAN | FORWARDER
    vatNumber: String <<unique>>
    email: String
    phone: String
    address: Object
    status: PENDING_VERIFICATION | VERIFIED | SUSPENDED
    plan: FREE | PRO | ENTERPRISE
    features: Array<String>
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    orgId (unique)
    email (unique)
    vatNumber (unique)
    type
    status
}

entity "users" as user {
    primary_key(userId): ObjectId
    --
    foreign_key(orgId): ObjectId
    email: String <<unique>>
    passwordHash: String
    firstName: String
    lastName: String
    role: ADMIN | USER | MANAGER
    locale: String
    lastLogin: Date
    isActive: Boolean
    createdAt: Date
    --
    <<indexes>>
    userId (unique)
    email (unique)
    orgId
    role
}

entity "orders" as order {
    primary_key(orderId): String
    --
    foreign_key(industryId): String
    foreign_key(carrierId): String (nullable)
    foreign_key(driverId): String (nullable)
    status: NEW | DISPATCHED | ACCEPTED | IN_TRANSIT | DELIVERED | CANCELLED
    type: FTL | LTL | EXPRESS
    pickupAddress: Object
    deliveryAddress: Object
    pickupDate: Date
    deliveryDate: Date
    pickupSlot: String
    deliverySlot: String
    palletCount: Number
    weight: Number
    volume: Number
    temperature: String
    price: Number
    currency: String
    reference: String
    notes: String
    dispatchedAt: Date
    acceptedAt: Date
    deliveredAt: Date
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    orderId (unique)
    industryId
    carrierId
    status
    pickupDate
    deliveryDate
    createdAt
}

entity "carriers" as carrier {
    primary_key(id): String
    --
    foreign_key(orgId): String
    name: String
    vatNumber: String
    siret: String
    licenseNumber: String
    email: String
    phone: String
    fleetSize: Number
    vehicleTypes: Array<String>
    coverageZones: Array<String>
    rating: Number
    completedOrders: Number
    isActive: Boolean
    createdAt: Date
    --
    <<indexes>>
    id (unique)
    orgId
    isActive
}

entity "vigilance" as vigilance {
    primary_key(carrierId): String
    --
    status: OK | WARNING | BLOCKED
    vatValid: Boolean
    lastCheck: Date
    issues: Array<Object>
    blockedReason: String
    blockedAt: Date
    checkedBy: String
    --
    <<indexes>>
    carrierId (unique)
    status
}

entity "dispatch_policies" as dispatch {
    primary_key(orderId): String
    --
    foreign_key(industryId): String
    carrierChain: Array<String>
    currentIndex: Number
    slaHours: Number
    reminderMinutes: Array<Number>
    escalateToAffret: Boolean
    autoAccept: Boolean
    createdAt: Date
    --
    <<indexes>>
    orderId (unique)
    industryId
}

entity "invitations" as invitation {
    primary_key(_id): ObjectId
    --
    foreign_key(industryId): String
    foreign_key(carrierId): String
    status: PENDING | ACCEPTED | DECLINED | EXPIRED
    sentAt: Date
    respondedAt: Date
    expiresAt: Date
    --
    <<indexes>>
    industryId
    carrierId
    status
}

entity "palettes" as palette {
    primary_key(paletteId): String
    --
    type: EPAL | EUR | CUSTOM
    status: AVAILABLE | IN_USE | DAMAGED | LOST
    foreign_key(currentOwnerId): String
    location: Object
    qrCode: String <<unique>>
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    paletteId (unique)
    qrCode (unique)
    currentOwnerId
    status
    type
}

entity "palette_cheques" as cheque {
    primary_key(chequeId): String
    --
    foreign_key(orderId): String
    foreign_key(issuerId): String
    foreign_key(transporterId): String
    foreign_key(receiverId): String
    quantity: Number
    type: EPAL
    status: EMIS | DEPOSE | RECU | ANNULE
    qrCode: String <<unique>>
    signature: String (Ed25519)
    depositSite: Object
    depositSignature: String
    depositPhoto: String
    depositedAt: Date
    receiveSignature: String
    receivePhoto: String
    receivedAt: Date
    createdAt: Date
    --
    <<indexes>>
    chequeId (unique)
    orderId
    transporterId
    receiverId
    status
    qrCode (unique)
}

entity "palette_ledger" as ledger {
    primary_key(_id): ObjectId
    --
    foreign_key(companyId): String
    foreign_key(chequeId): String
    type: CREDIT | DEBIT
    quantity: Number
    balance: Number
    description: String
    createdAt: Date
    --
    <<indexes>>
    companyId
    chequeId
    createdAt
}

entity "palette_disputes" as dispute {
    primary_key(disputeId): ObjectId
    --
    foreign_key(chequeId): String
    foreign_key(reportedBy): String
    reason: MISSING | DAMAGED | QUANTITY_MISMATCH | LOCATION_ERROR
    status: OPEN | INVESTIGATING | RESOLVED | REJECTED
    description: String
    photos: Array<String>
    resolution: String
    resolvedBy: String
    resolvedAt: Date
    createdAt: Date
    --
    <<indexes>>
    disputeId (unique)
    chequeId
    status
    reportedBy
}

entity "logistician_sites" as site {
    primary_key(siteId): ObjectId
    --
    foreign_key(logisticianId): String
    name: String
    address: Object
    location: Object <<2dsphere>>
    capacity: Number
    occupancy: Number
    paletteQuota: Object
    openingHours: Object
    contactPerson: String
    contactPhone: String
    isActive: Boolean
    createdAt: Date
    --
    <<indexes>>
    siteId (unique)
    logisticianId
    location (2dsphere)
    isActive
}

' Relationships
org ||--o{ user : "has"
org ||--o{ carrier : "operates"
org ||--o{ order : "creates"
carrier ||--o| vigilance : "monitored by"
order ||--o| dispatch : "has policy"
order ||--o{ cheque : "generates"
org ||--o{ invitation : "sends/receives"
cheque ||--o{ ledger : "updates"
cheque ||--o| dispute : "may have"
org ||--o{ site : "owns"
order ||--|| palette : "uses"

note right of org
    **Organization**
    Central entity representing
    Industrial, Transporter,
    Logistician, or Forwarder
end note

note right of vigilance
    **Compliance Monitoring**
    Carrier status: OK, WARNING, BLOCKED
    Checked via VIES/INSEE APIs
    Blocks dispatch if BLOCKED
end note

note right of dispatch
    **Dispatch Policy**
    Defines carrier chain
    SLA management (default 2h)
    Auto-escalation to Affret.IA
end note

note right of cheque
    **Digital Pallet Check**
    Circular economy system
    QR code + Ed25519 signature
    Workflow: EMIS → DEPOSE → RECU
end note

@enduml
```

## ERD - Storage Marketplace

```plantuml
@startuml RT-Technologie-ERD-Storage
skinparam class {
    BackgroundColor WhiteSmoke
    ArrowColor Black
    BorderColor DarkGray
}

entity "storage_needs" as need {
    primary_key(needId): ObjectId
    --
    foreign_key(industrialId): String
    title: String
    description: String
    location: Object <<2dsphere>>
    address: Object
    capacityRequired: Number
    unit: PALLETS | SQM | CBM
    startDate: Date
    endDate: Date
    duration: Number
    temperatureMin: Number
    temperatureMax: Number
    requirements: Object
    budget: Number
    currency: String
    status: DRAFT | PUBLISHED | CONTRACTED | EXPIRED
    visibility: GLOBAL | DIRECT
    invitedLogisticians: Array<String>
    offerCount: Number
    publishedAt: Date
    contractedAt: Date
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    needId (unique)
    industrialId
    status
    location (2dsphere)
    publishedAt
}

entity "storage_offers" as offer {
    primary_key(offerId): ObjectId
    --
    foreign_key(needId): ObjectId
    foreign_key(logisticianId): String
    foreign_key(siteId): String
    price: Number
    priceUnit: PER_PALLET | PER_SQM | PER_CBM
    currency: String
    availableCapacity: Number
    startDate: Date
    description: String
    certifications: Array<String>
    services: Array<String>
    status: SUBMITTED | ACCEPTED | REJECTED | WITHDRAWN
    aiScore: Number
    aiRanking: Number
    submittedAt: Date
    respondedAt: Date
    createdAt: Date
    --
    <<indexes>>
    offerId (unique)
    needId
    logisticianId
    status
    aiRanking
    submittedAt
}

entity "storage_contracts" as contract {
    primary_key(contractId): ObjectId
    --
    foreign_key(needId): ObjectId
    foreign_key(offerId): ObjectId
    foreign_key(industrialId): String
    foreign_key(logisticianId): String
    foreign_key(siteId): String
    startDate: Date
    endDate: Date
    capacity: Number
    price: Number
    paymentTerms: String
    status: ACTIVE | SUSPENDED | TERMINATED | COMPLETED
    contractPdf: String
    signedByIndustrial: Boolean
    signedByLogistician: Boolean
    signedAt: Date
    terminatedAt: Date
    terminationReason: String
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    contractId (unique)
    needId (unique)
    offerId (unique)
    industrialId
    logisticianId
    status
}

entity "wms_inventory" as inventory {
    primary_key(inventoryId): ObjectId
    --
    foreign_key(contractId): ObjectId
    foreign_key(siteId): String
    date: Date
    productSku: String
    productName: String
    quantity: Number
    unit: String
    location: String (zone/aisle/rack)
    batchNumber: String
    expiryDate: Date
    lastMovement: Date
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    inventoryId (unique)
    contractId
    siteId
    productSku
    date
}

entity "wms_movements" as movement {
    primary_key(movementId): ObjectId
    --
    foreign_key(contractId): ObjectId
    foreign_key(siteId): String
    type: IN | OUT | TRANSFER | ADJUSTMENT
    productSku: String
    quantity: Number
    unit: String
    fromLocation: String
    toLocation: String
    reason: String
    reference: String (order/receipt number)
    performedBy: String
    timestamp: Date
    createdAt: Date
    --
    <<indexes>>
    movementId (unique)
    contractId
    siteId
    type
    timestamp
}

' Relationships
need ||--o{ offer : "receives"
offer ||--o| contract : "accepted as"
need ||--|| contract : "becomes"
contract ||--o{ inventory : "tracks"
contract ||--o{ movement : "logs"

note right of need
    **Storage Request**
    Published by industrials
    Visibility: GLOBAL or DIRECT
    AI-powered offer ranking
end note

note right of offer
    **Logistician Offer**
    AI scoring algorithm:
    - Price: 40%
    - Proximity: 25%
    - Reliability: 20%
    - Reactivity: 15%
end note

note right of contract
    **Storage Contract**
    Generated from accepted offer
    Includes digital signatures
    Activates WMS sync
end note

note right of inventory
    **WMS Integration**
    Real-time inventory tracking
    Product-level visibility
    Batch & expiry management
end note

@enduml
```

## ERD - Planning & Geo-Tracking

```plantuml
@startuml RT-Technologie-ERD-Planning
skinparam class {
    BackgroundColor WhiteSmoke
    ArrowColor Black
    BorderColor DarkGray
}

entity "plannings" as planning {
    primary_key(planningId): String
    --
    foreign_key(driverId): String
    foreign_key(vehicleId): String
    date: Date
    shift: MORNING | AFTERNOON | NIGHT
    status: DRAFT | PUBLISHED | IN_PROGRESS | COMPLETED | CANCELLED
    foreign_key(orders): Array<String>
    totalDistance: Number
    totalDuration: Number
    startTime: Date
    endTime: Date
    breakDuration: Number
    createdBy: String
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    planningId (unique)
    driverId
    vehicleId
    date
    status
}

entity "routes" as route {
    primary_key(routeId): String
    --
    foreign_key(planningId): String
    waypoints: Array<Object>
    optimizedOrder: Array<Number>
    totalDistance: Number
    totalDuration: Number
    optimizationScore: Number
    algorithm: DIJKSTRA | A_STAR | GENETIC
    trafficConsidered: Boolean
    calculatedAt: Date
    createdAt: Date
    --
    <<indexes>>
    routeId (unique)
    planningId
    optimizationScore
}

entity "planning_slots" as slot {
    primary_key(slotId): ObjectId
    --
    foreign_key(siteId): String
    date: Date
    startTime: String
    endTime: String
    type: PICKUP | DELIVERY
    capacity: Number
    booked: Number
    status: AVAILABLE | FULL | BLOCKED
    createdAt: Date
    --
    <<indexes>>
    slotId (unique)
    siteId
    date
    type
    status
}

entity "geo_locations" as location {
    primary_key(_id): ObjectId
    --
    foreign_key(deviceId): String
    foreign_key(orderId): String
    foreign_key(driverId): String
    location: Object <<2dsphere>>
    latitude: Number
    longitude: Number
    accuracy: Number
    speed: Number
    heading: Number
    altitude: Number
    timestamp: Date
    createdAt: Date
    --
    <<indexes>>
    deviceId
    orderId
    driverId
    location (2dsphere)
    timestamp
}

entity "tracking_events" as event {
    primary_key(eventId): String
    --
    foreign_key(orderId): String
    type: DISPATCHED | PICKUP_STARTED | PICKUP_COMPLETED | IN_TRANSIT | DELIVERY_STARTED | DELIVERED | EXCEPTION
    location: Object <<2dsphere>>
    latitude: Number
    longitude: Number
    description: String
    metadata: Object
    photo: String
    signature: String
    performedBy: String
    timestamp: Date
    createdAt: Date
    --
    <<indexes>>
    eventId (unique)
    orderId
    type
    timestamp
}

entity "tracking_predictions" as prediction {
    primary_key(_id): ObjectId
    --
    foreign_key(orderId): String
    predictedEta: Date
    confidence: Number
    factors: Object
    trafficDelay: Number
    weatherImpact: Number
    calculatedAt: Date
    actualArrival: Date
    accuracy: Number
    --
    <<indexes>>
    orderId
    predictedEta
    confidence
}

entity "geofence_events" as geofence {
    primary_key(_id): ObjectId
    --
    foreign_key(orderId): String
    foreign_key(driverId): String
    type: PICKUP_ZONE_ENTERED | PICKUP_ZONE_EXITED | DELIVERY_ZONE_ENTERED | DELIVERY_ZONE_EXITED
    location: Object <<2dsphere>>
    radius: Number
    enteredAt: Date
    exitedAt: Date
    duration: Number
    createdAt: Date
    --
    <<indexes>>
    orderId
    driverId
    type
    enteredAt
}

' Relationships
planning ||--o| route : "optimized by"
planning ||--o{ slot : "reserves"
planning ||--o{ location : "tracked via"
planning ||--o{ event : "generates"
planning ||--o| prediction : "has"
location ||--o{ geofence : "triggers"

note right of planning
    **Daily Planning**
    Driver/vehicle assignment
    Multi-order optimization
    Route optimization
end note

note right of location
    **GPS Tracking**
    Real-time position updates
    Geospatial queries (2dsphere)
    Speed & heading monitoring
end note

note right of prediction
    **AI ETA Prediction**
    TomTom Traffic API integration
    ML-based arrival prediction
    Confidence scoring
end note

note right of geofence
    **Geofencing**
    Automatic zone detection
    Entry/exit timestamps
    Radius-based alerts
end note

@enduml
```

## ERD - Chatbot & Notifications

```plantuml
@startuml RT-Technologie-ERD-Communications
skinparam class {
    BackgroundColor WhiteSmoke
    ArrowColor Black
    BorderColor DarkGray
}

entity "chatbot_conversations" as conversation {
    primary_key(conversationId): String
    --
    foreign_key(userId): String
    foreign_key(orgId): String
    botType: HELPBOT | PLANIF_IA | ROUTIER | QUAI_WMS | LIVRAISONS | EXPEDITION | FREIGHT_IA | COPILOTE_CHAUFFEUR
    status: ACTIVE | TRANSFERRED | CLOSED
    language: String
    startedAt: Date
    closedAt: Date
    duration: Number
    messageCount: Number
    transferredToHuman: Boolean
    transferredAt: Date
    humanAgent: String
    satisfaction: Number
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    conversationId (unique)
    userId
    orgId
    botType
    status
    createdAt
}

entity "chatbot_messages" as message {
    primary_key(messageId): String
    --
    foreign_key(conversationId): String
    role: USER | ASSISTANT | SYSTEM
    content: String
    intent: String
    confidence: Number
    suggestedActions: Array<String>
    metadata: Object
    processingTime: Number
    timestamp: Date
    createdAt: Date
    --
    <<indexes>>
    messageId (unique)
    conversationId
    role
    timestamp
}

entity "chatbot_knowledge_base" as knowledge {
    primary_key(articleId): ObjectId
    --
    category: String
    title: String
    content: String
    keywords: Array<String>
    botTypes: Array<String>
    language: String
    priority: Number
    viewCount: Number
    helpfulCount: Number
    lastUpdated: Date
    createdAt: Date
    --
    <<indexes>>
    articleId (unique)
    category
    keywords
    botTypes
    language
}

entity "chatbot_diagnostics" as diagnostic {
    primary_key(_id): ObjectId
    --
    foreign_key(conversationId): String
    issue: String
    severity: LOW | MEDIUM | HIGH | CRITICAL
    affectedService: String
    diagnosticResults: Object
    recommendedActions: Array<String>
    escalated: Boolean
    escalatedTo: String
    performedAt: Date
    --
    <<indexes>>
    conversationId
    severity
    escalated
    performedAt
}

entity "notifications" as notification {
    primary_key(notificationId): ObjectId
    --
    foreign_key(userId): String
    foreign_key(orgId): String
    type: EMAIL | SMS | PUSH | IN_APP
    channel: String
    priority: LOW | NORMAL | HIGH | URGENT
    subject: String
    body: String
    templateId: String
    variables: Object
    status: PENDING | SENT | DELIVERED | FAILED | BOUNCED
    sentAt: Date
    deliveredAt: Date
    openedAt: Date
    clickedAt: Date
    failureReason: String
    retryCount: Number
    maxRetries: Number
    scheduledFor: Date
    expiresAt: Date
    read: Boolean
    readAt: Date
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    notificationId (unique)
    userId
    orgId
    type
    status
    priority
    read
    createdAt
    sentAt
}

entity "notification_templates" as template {
    primary_key(templateId): String
    --
    name: String
    type: EMAIL | SMS | PUSH
    language: String
    subject: String
    bodyHtml: String
    bodyText: String
    variables: Array<String>
    category: String
    isActive: Boolean
    version: Number
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    templateId (unique)
    name
    type
    language
    isActive
}

entity "notification_preferences" as preference {
    primary_key(_id): ObjectId
    --
    foreign_key(userId): String
    channel: EMAIL | SMS | PUSH | IN_APP
    category: ORDER_UPDATES | DISPATCH | PALLET | STORAGE | SUPPORT | MARKETING
    enabled: Boolean
    frequency: REAL_TIME | HOURLY | DAILY | WEEKLY
    quietHoursStart: String
    quietHoursEnd: String
    updatedAt: Date
    --
    <<indexes>>
    userId
    channel
    category
}

' Relationships
conversation ||--o{ message : "contains"
conversation ||--o{ diagnostic : "may trigger"
message ||--o{ knowledge : "searches"
notification ||--|| template : "uses"
notification ||--|| preference : "respects"

note right of conversation
    **AI Chatbot Sessions**
    8 specialized bots
    GPT-4o-mini powered
    Human escalation
end note

note right of diagnostic
    **Auto Diagnostics**
    Severity assessment
    Service health checks
    Teams escalation
end note

note right of notification
    **Multi-channel Notifications**
    Email, SMS, Push, In-app
    Template-based
    Retry mechanism
    Delivery tracking
end note

@enduml
```

## ERD - Authentication & Onboarding

```plantuml
@startuml RT-Technologie-ERD-Auth
skinparam class {
    BackgroundColor WhiteSmoke
    ArrowColor Black
    BorderColor DarkGray
}

entity "organizations" as org {
    primary_key(orgId): ObjectId
    --
    name: String
    type: INDUSTRY | TRANSPORTER | LOGISTICIAN | FORWARDER
    vatNumber: String <<unique>>
    siret: String
    email: String
    phone: String
    address: Object
    legalForm: String
    registrationNumber: String
    status: PENDING_VERIFICATION | VERIFIED | SUSPENDED | BLOCKED
    plan: FREE | PRO | ENTERPRISE
    subscriptionStart: Date
    subscriptionEnd: Date
    paymentMethod: String
    billingAddress: Object
    features: Array<String>
    limits: Object
    verifiedAt: Date
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    orgId (unique)
    email (unique)
    vatNumber (unique)
    type
    status
    plan
}

entity "users" as user {
    primary_key(userId): ObjectId
    --
    foreign_key(orgId): ObjectId
    email: String <<unique>>
    passwordHash: String
    firstName: String
    lastName: String
    role: ADMIN | USER | MANAGER | DRIVER
    permissions: Array<String>
    locale: String
    timezone: String
    phone: String
    avatar: String
    lastLogin: Date
    loginCount: Number
    isActive: Boolean
    isMfaEnabled: Boolean
    mfaSecret: String
    emailVerified: Boolean
    phoneVerified: Boolean
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    userId (unique)
    email (unique)
    orgId
    role
    isActive
}

entity "roles" as role {
    primary_key(roleId): ObjectId
    --
    name: String <<unique>>
    displayName: String
    description: String
    foreign_key(permissions): Array<ObjectId>
    isSystem: Boolean
    isActive: Boolean
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    roleId (unique)
    name (unique)
}

entity "permissions" as permission {
    primary_key(permissionId): ObjectId
    --
    resource: String
    action: CREATE | READ | UPDATE | DELETE | EXECUTE
    scope: OWN | ORG | GLOBAL
    conditions: Object
    isSystem: Boolean
    createdAt: Date
    --
    <<indexes>>
    permissionId (unique)
    resource + action (compound unique)
}

entity "subscription_plans" as plan {
    primary_key(planId): String
    --
    name: String
    type: FREE | PRO | ENTERPRISE
    userType: INDUSTRY | TRANSPORTER | LOGISTICIAN | FORWARDER
    price: Number
    currency: String
    billingPeriod: MONTHLY | YEARLY
    features: Array<String>
    limits: Object
    isActive: Boolean
    displayOrder: Number
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    planId (unique)
    name
    userType
    isActive
}

entity "company_verifications" as verification {
    primary_key(_id): ObjectId
    --
    foreign_key(orgId): ObjectId
    vatNumber: String
    source: VIES | INSEE
    isValid: Boolean
    companyName: String
    address: Object
    status: String
    verifiedAt: Date
    expiresAt: Date
    errorCode: String
    errorMessage: String
    createdAt: Date
    --
    <<indexes>>
    orgId
    vatNumber
    verifiedAt
}

entity "clients" as client {
    primary_key(clientId): ObjectId
    --
    foreign_key(orgId): ObjectId
    registrationType: SELF | INVITED | IMPORTED
    onboardingStep: Number
    onboardingCompleted: Boolean
    contractPdf: String
    contractSignature: String
    contractSignedAt: Date
    contractSignedBy: String
    signatureMethod: ELECTRONIC | HANDWRITTEN
    signatureIp: String
    kycVerified: Boolean
    kycDocuments: Array<String>
    termsAccepted: Boolean
    termsVersion: String
    termsAcceptedAt: Date
    gdprConsent: Boolean
    gdprConsentAt: Date
    referralSource: String
    referralCode: String
    notes: String
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    clientId (unique)
    orgId (unique)
    registrationType
    onboardingCompleted
}

entity "contracts" as contract {
    primary_key(contractId): ObjectId
    --
    foreign_key(clientId): ObjectId
    foreign_key(planId): String
    type: SUBSCRIPTION | STORAGE | TRANSPORT | SERVICE
    status: DRAFT | PENDING_SIGNATURE | SIGNED | ACTIVE | EXPIRED | TERMINATED
    pdfUrl: String
    pdfHash: String
    templateVersion: String
    variables: Object
    signedBy: String
    signatureDate: Date
    signatureMethod: String
    signatureProof: String
    startDate: Date
    endDate: Date
    autoRenew: Boolean
    terminationNotice: Number
    createdAt: Date
    updatedAt: Date
    --
    <<indexes>>
    contractId (unique)
    clientId
    planId
    type
    status
}

entity "api_keys" as apikey {
    primary_key(keyId): ObjectId
    --
    foreign_key(orgId): ObjectId
    foreign_key(userId): ObjectId
    name: String
    keyHash: String
    keyPrefix: String
    scopes: Array<String>
    rateLimit: Number
    isActive: Boolean
    lastUsed: Date
    usageCount: Number
    expiresAt: Date
    createdAt: Date
    --
    <<indexes>>
    keyId (unique)
    keyHash (unique)
    orgId
    isActive
}

entity "audit_logs" as audit {
    primary_key(logId): ObjectId
    --
    foreign_key(userId): ObjectId
    foreign_key(orgId): ObjectId
    action: String
    resource: String
    resourceId: String
    method: String
    endpoint: String
    ipAddress: String
    userAgent: String
    statusCode: Number
    duration: Number
    before: Object
    after: Object
    timestamp: Date
    --
    <<indexes>>
    userId
    orgId
    action
    resource
    timestamp
}

' Relationships
org ||--o{ user : "employs"
user }o--|| role : "has"
role }o--o{ permission : "grants"
org ||--|| plan : "subscribes to"
org ||--o{ verification : "verified by"
org ||--|| client : "registered as"
client ||--o{ contract : "signs"
org ||--o{ apikey : "owns"
user ||--o{ audit : "performs"

note right of org
    **Organization**
    Multi-tenant root entity
    Plan-based features
    VAT verification required
end note

note right of user
    **User Account**
    JWT-based authentication
    Role-based access control
    MFA optional
end note

note right of verification
    **VAT Verification**
    VIES (EU) or INSEE (FR) API
    Cached for 30 days
    Auto-fills company data
end note

note right of client
    **Onboarding Flow**
    5-step registration
    eIDAS electronic signature
    PDF contract generation
end note

@enduml
```

## Collections avec Indexes Géospatiaux

### Collections avec index 2dsphere

| Collection | Champ Géospatial | Usage |
|------------|------------------|-------|
| **storage_listings** | `location` | Recherche de sites de stockage par proximité (Haversine) |
| **storage_needs** | `location` | Matching de besoins avec offres proches |
| **logistician_sites** | `location` | Géolocalisation des entrepôts |
| **transport_offers** | `pickupLocation`, `deliveryLocation` | Recherche de transports par zone |
| **geo_locations** | `location` | Suivi GPS temps réel des véhicules |

### Exemple de requête géospatiale

```javascript
// Trouver tous les sites de stockage dans un rayon de 30km
db.logistician_sites.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [2.3522, 48.8566] // Paris
      },
      $maxDistance: 30000 // 30km en mètres
    }
  },
  isActive: true,
  "capacity": { $gte: 100 }
})
```

## Statistiques de la Base de Données

| Métrique | Valeur |
|----------|--------|
| **Collections totales** | 40+ |
| **Indexes totaux** | 103+ |
| **Indexes uniques** | 15+ |
| **Indexes géospatiaux (2dsphere)** | 5 |
| **Indexes composés** | 10+ |
| **Collections avec données seed** | 6 |
| **Taille estimée (prod)** | TBD |

## Conventions de Nommage

1. **IDs primaires**: Suffixe `Id` (ex: `orderId`, `userId`)
2. **Foreign keys**: Préfixe du nom de l'entité + `Id` (ex: `industryId`, `carrierId`)
3. **Timestamps**: `createdAt`, `updatedAt`, `deletedAt`
4. **Statuts**: UPPER_SNAKE_CASE (ex: `PENDING_VERIFICATION`)
5. **Indexes**: Nom explicite avec préfixe de type (ex: `idx_orders_status`, `geo_sites_location`)

## Notes Importantes

1. **MongoDB Atlas** est utilisé avec réplication automatique
2. **Indexes 2dsphere** permettent des requêtes géospatiales performantes
3. **TTL Indexes** pourraient être ajoutés sur `notifications`, `tracking_events` pour l'archivage automatique
4. **Sharding** pourrait être nécessaire sur `orders`, `geo_locations`, `notifications` en production à grande échelle
5. **Backup automatique** quotidien via MongoDB Atlas
