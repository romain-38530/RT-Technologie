#!/bin/bash

# Script de démarrage rapide de l'interface web
# Système de Sourcing Permanent - RT-Technologie

echo "================================================================================"
echo "🚀 DÉMARRAGE DE L'INTERFACE WEB"
echo "================================================================================"
echo ""
echo "📦 Vérification des dépendances..."

# Vérifier que Flask est installé
if ! python -c "import flask" 2>/dev/null; then
    echo "⚠️  Flask n'est pas installé. Installation en cours..."
    pip install -q flask
    echo "✅ Flask installé"
fi

echo ""
echo "🌐 Démarrage du serveur web..."
echo ""
echo "================================================================================"
echo "L'interface web sera accessible à l'adresse suivante:"
echo ""
echo "   👉  http://localhost:5000"
echo ""
echo "Si vous êtes sur le même réseau, vous pouvez aussi accéder via:"
echo "   👉  http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo "================================================================================"
echo ""
echo "Appuyez sur CTRL+C pour arrêter le serveur"
echo ""

# Définir PYTHONPATH et lancer
export PYTHONPATH="$(pwd)"
python web_app.py
