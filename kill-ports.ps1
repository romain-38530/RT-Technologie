# Script PowerShell pour libérer tous les ports RT-Technologie
# Usage: Clic droit → "Exécuter avec PowerShell" (Administrateur)
# Ou: .\kill-ports.ps1 dans PowerShell

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RT-Technologie - Libération des Ports" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si exécuté en tant qu'administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ATTENTION: Ce script nécessite les droits administrateur!" -ForegroundColor Yellow
    Write-Host "Clic droit sur le script → 'Exécuter en tant qu'administrateur'" -ForegroundColor Yellow
    Write-Host ""
    Pause
    exit
}

# Ports à libérer (tous les ports RT-Technologie)
$ports = 3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3011, 3012, 3013, 3014, 3015, 3016, 3017, 3018, 3019, 3020

Write-Host "Recherche des processus utilisant les ports 3000-3020..." -ForegroundColor Yellow
Write-Host ""

$freedPorts = 0
$busyPorts = 0

foreach ($port in $ports) {
    # Trouver les processus utilisant ce port
    $connections = netstat -ano | Select-String ":$port\s" | Select-String "LISTENING"

    if ($connections) {
        $busyPorts++
        Write-Host "Port $port : " -NoNewline -ForegroundColor White
        Write-Host "OCCUPÉ" -ForegroundColor Red

        # Extraire le PID
        foreach ($connection in $connections) {
            $line = $connection.ToString().Trim()
            $parts = $line -split '\s+' | Where-Object { $_ -ne '' }
            $pid = $parts[-1]

            if ($pid -match '^\d+$') {
                try {
                    # Obtenir le nom du processus
                    $processName = (Get-Process -Id $pid -ErrorAction SilentlyContinue).ProcessName

                    Write-Host "  → Arrêt du processus: $processName (PID: $pid)" -ForegroundColor Yellow

                    # Tuer le processus
                    Stop-Process -Id $pid -Force -ErrorAction Stop

                    Write-Host "  ✓ Processus arrêté avec succès" -ForegroundColor Green
                    $freedPorts++

                } catch {
                    Write-Host "  ✗ Impossible d'arrêter le processus: $_" -ForegroundColor Red
                }
            }
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Résumé:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ports occupés trouvés : $busyPorts" -ForegroundColor White
Write-Host "  Ports libérés         : $freedPorts" -ForegroundColor Green
Write-Host ""

if ($freedPorts -gt 0) {
    Write-Host "✓ Ports libérés avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez maintenant:" -ForegroundColor Cyan
    Write-Host "  1. Démarrer Docker: bash docker-run.sh" -ForegroundColor White
    Write-Host "  2. Ou démarrer en local: pnpm dev" -ForegroundColor White
} elseif ($busyPorts -eq 0) {
    Write-Host "✓ Aucun port occupé - Vous êtes prêt à démarrer!" -ForegroundColor Green
} else {
    Write-Host "⚠ Certains ports n'ont pas pu être libérés" -ForegroundColor Yellow
    Write-Host "Essayez de fermer manuellement les applications concernées" -ForegroundColor Yellow
}

Write-Host ""
Pause
