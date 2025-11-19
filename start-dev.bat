@echo off
REM Script de démarrage rapide pour le développement local
REM Usage: double-cliquer sur ce fichier ou exécuter "start-dev.bat" dans le terminal

echo ========================================
echo RT-Technologie - Démarrage Dev Local
echo ========================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installé ou n'est pas dans le PATH
    echo Téléchargez Node.js sur: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Vérifier si pnpm est installé
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo Installation de pnpm...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo ERREUR: Impossible d'installer pnpm
        pause
        exit /b 1
    )
)

echo pnpm version:
pnpm --version
echo.

REM Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo Installation des dépendances...
    pnpm install
    if %errorlevel% neq 0 (
        echo ERREUR: Échec de l'installation des dépendances
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo Choix de l'application à démarrer:
echo ========================================
echo 1. Backoffice Admin (http://localhost:3000)
echo 2. Web Industry (http://localhost:3001)
echo 3. Web Transporter (http://localhost:3010)
echo 4. Toutes les applications
echo 5. Quitter
echo.

set /p choice="Votre choix (1-5): "

if "%choice%"=="1" (
    echo.
    echo Démarrage de Backoffice Admin...
    cd apps\backoffice-admin
    pnpm dev
) else if "%choice%"=="2" (
    echo.
    echo Démarrage de Web Industry...
    cd apps\web-industry
    pnpm dev
) else if "%choice%"=="3" (
    echo.
    echo Démarrage de Web Transporter...
    cd apps\web-transporter
    pnpm dev
) else if "%choice%"=="4" (
    echo.
    echo Démarrage de toutes les applications...
    pnpm dev
) else if "%choice%"=="5" (
    echo Au revoir!
    exit /b 0
) else (
    echo Choix invalide
    pause
    exit /b 1
)

pause
