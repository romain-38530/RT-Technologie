# Script de test pour le module Palettes + Affret.IA (PowerShell)
# Usage: .\test-palettes-affret.ps1

Write-Host "========================================"
Write-Host "Tests Module Palettes + Affret.IA"
Write-Host "========================================"
Write-Host ""

$PALETTE_URL = "http://localhost:3011"
$AFFRET_URL = "http://localhost:3005"

# Test 1: Health checks
Write-Host "[TEST 1] Vérification des services..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Service Palette (port 3011):"
try {
    $response = Invoke-RestMethod -Uri "$PALETTE_URL/health" -Method Get
    $response | ConvertTo-Json
} catch {
    Write-Host "ERREUR: Service Palette non disponible" -ForegroundColor Red
}
Write-Host ""

Write-Host "Service Affret.IA (port 3005):"
try {
    $response = Invoke-RestMethod -Uri "$AFFRET_URL/health" -Method Get
    $response | ConvertTo-Json
} catch {
    Write-Host "ERREUR: Service Affret.IA non disponible" -ForegroundColor Red
}
Write-Host ""
Write-Host "---"
Write-Host ""

# Test 2: Optimisation de route
Write-Host "[TEST 2] Optimisation de route avec palettes..." -ForegroundColor Yellow
Write-Host ""

$body = @{
    deliveries = @(
        @{
            orderId = "ORD-001"
            location = @{ lat = 48.8566; lng = 2.3522 }
            pallets = 33
            address = "15 Rue de Rivoli, Paris"
            companyId = "IND-1"
        },
        @{
            orderId = "ORD-002"
            location = @{ lat = 48.9023; lng = 2.3789 }
            pallets = 20
            address = "Zone Industrielle Nord, Paris"
            companyId = "IND-1"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$AFFRET_URL/affret/optimize-pallet-routes" -Method Post -Body $body -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Test 3: Alertes palettes
Write-Host "[TEST 3] Récupération des alertes palettes..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$AFFRET_URL/affret/pallet-alerts" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Test 4: Liste des sites
Write-Host "[TEST 4] Liste des sites de retour..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$PALETTE_URL/palette/sites" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Test 5: Ledger d'une entreprise
Write-Host "[TEST 5] Ledger de l'entreprise IND-1..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$PALETTE_URL/palette/ledger/IND-1" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Test 6: Modification quota d'un site
Write-Host "[TEST 6] Modification du quota du site SITE-PARIS-1..." -ForegroundColor Yellow
Write-Host ""

$quotaBody = @{ dailyMax = 180 } | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$PALETTE_URL/palette/sites/SITE-PARIS-1/quota" -Method Post -Body $quotaBody -ContentType "application/json"
    $response | ConvertTo-Json
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Résumé
Write-Host ""
Write-Host "========================================"
Write-Host "Tests terminés !" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "Prochaines étapes :"
Write-Host "1. Ouvrir le backoffice admin: http://localhost:3000/palettes"
Write-Host "2. Consulter la documentation: docs/MODULE_PALETTES_ADMIN_AFFRET.md"
Write-Host "3. Tester les scénarios complets: docs/TESTS_PALETTES_AFFRET.md"
Write-Host ""
