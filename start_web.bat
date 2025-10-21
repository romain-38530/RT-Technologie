@echo off
REM Script de démarrage rapide de l'interface web (Windows)
REM Système de Sourcing Permanent - RT-Technologie

echo ================================================================================
echo 🚀 DÉMARRAGE DE L'INTERFACE WEB
echo ================================================================================
echo.
echo 📦 Vérification des dépendances...

python -c "import flask" 2>nul
if errorlevel 1 (
    echo ⚠️  Flask n'est pas installé. Installation en cours...
    pip install -q flask
    echo ✅ Flask installé
)

echo.
echo 🌐 Démarrage du serveur web...
echo.
echo ================================================================================
echo L'interface web sera accessible à l'adresse suivante:
echo.
echo    👉  http://localhost:5000
echo.
echo ================================================================================
echo.
echo Appuyez sur CTRL+C pour arrêter le serveur
echo.

set PYTHONPATH=%cd%
python web_app.py

pause
