# Script pour Nettoyer les Fichiers .md de la Racine
# Usage: .\cleanup-root-docs.ps1

$ErrorActionPreference = "Continue"

# Detection automatique du chemin racine
$rootPath = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host ""
Write-Host "Nettoyage des fichiers .md de la racine" -ForegroundColor Cyan
Write-Host ("=" * 70)
Write-Host "Chemin racine: $rootPath" -ForegroundColor Gray
Write-Host ""

# Fichiers a GARDER a la racine (essentiels)
$keepFiles = @(
    "README.md",
    "START_HERE.md",
    "LICENSE.md",
    "CONTRIBUTING.md"
)

# Creer un dossier archive
$archivePath = Join-Path $rootPath "archive-old-docs"
if (-not (Test-Path $archivePath)) {
    New-Item -ItemType Directory -Path $archivePath -Force | Out-Null
    Write-Host "Dossier archive cree: archive-old-docs" -ForegroundColor Green
    Write-Host ""
}

# Lister tous les fichiers .md a la racine
$allMdFiles = Get-ChildItem -Path $rootPath -Filter "*.md" -File

Write-Host "Fichiers .md trouves a la racine: $($allMdFiles.Count)" -ForegroundColor Yellow
Write-Host ""

$movedCount = 0
$keptCount = 0
$errorCount = 0

foreach ($file in $allMdFiles) {
    if ($keepFiles -contains $file.Name) {
        Write-Host "  [GARDE] $($file.Name)" -ForegroundColor Green
        $keptCount++
    } else {
        try {
            $destination = Join-Path $archivePath $file.Name
            Move-Item -Path $file.FullName -Destination $destination -Force -ErrorAction Stop
            Write-Host "  [ARCHIVE] $($file.Name)" -ForegroundColor Cyan
            $movedCount++
        }
        catch {
            Write-Host "  [ERREUR] $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
}

Write-Host ""
Write-Host ("=" * 70)
Write-Host "Resume du nettoyage:" -ForegroundColor Cyan
Write-Host "  Fichiers archives: $movedCount" -ForegroundColor Cyan
Write-Host "  Fichiers conserves: $keptCount" -ForegroundColor Green
Write-Host "  Erreurs: $errorCount" -ForegroundColor Red
Write-Host ""

# Verifier ce qui reste a la racine
Write-Host "Fichiers .md restants a la racine:" -ForegroundColor Yellow
$remainingFiles = Get-ChildItem -Path $rootPath -Filter "*.md" -File
foreach ($file in $remainingFiles) {
    Write-Host "  - $($file.Name)" -ForegroundColor White
}

Write-Host ""
Write-Host ("=" * 70)
Write-Host "Nettoyage termine!" -ForegroundColor Green
Write-Host ""
Write-Host "Les anciens fichiers sont dans: archive-old-docs/" -ForegroundColor Cyan
Write-Host "La documentation organisee est dans: docs/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si tout fonctionne, vous pouvez supprimer archive-old-docs/" -ForegroundColor Yellow
Write-Host ""
