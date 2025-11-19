#!/bin/bash
# =============================================================================
# Script pour mettre à jour les IPs dans deploy-all-frontends.sh
# Après avoir récupéré les IPs depuis AWS CloudShell
# =============================================================================

set -e

echo "════════════════════════════════════════════════════════"
echo "🔧 Mise à jour des IPs Backend pour Vercel"
echo "════════════════════════════════════════════════════════"
echo ""

# Demander les IPs à l'utilisateur
echo "Entrez les IPs publiques obtenues depuis AWS CloudShell:"
echo ""

read -p "IP de core-orders (port 3030): " CORE_ORDERS_IP
read -p "IP de affret-ia (port 3010): " AFFRET_IA_IP
read -p "IP de vigilance (port 3040): " VIGILANCE_IP
read -p "IP de authz (port 3007): " AUTHZ_IP
read -p "IP de notifications (port 3050): " NOTIFICATIONS_IP

echo ""
echo "📝 IPs saisies:"
echo "  core-orders: $CORE_ORDERS_IP:3030"
echo "  affret-ia: $AFFRET_IA_IP:3010"
echo "  vigilance: $VIGILANCE_IP:3040"
echo "  authz: $AUTHZ_IP:3007"
echo "  notifications: $NOTIFICATIONS_IP:3050"
echo ""

read -p "Confirmer (y/n)? " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

# Mettre à jour le fichier deploy-all-frontends.sh
SCRIPT_FILE="infra/deploy-all-frontends.sh"

if [ ! -f "$SCRIPT_FILE" ]; then
    echo "❌ Fichier $SCRIPT_FILE introuvable"
    exit 1
fi

echo "🔄 Mise à jour de $SCRIPT_FILE..."

# Backup
cp "$SCRIPT_FILE" "$SCRIPT_FILE.backup"

# Remplacer les IPs
sed -i "s|REPLACE_WITH_CORE_ORDERS_IP|$CORE_ORDERS_IP|g" "$SCRIPT_FILE"
sed -i "s|REPLACE_WITH_AFFRET_IA_IP|$AFFRET_IA_IP|g" "$SCRIPT_FILE"
sed -i "s|REPLACE_WITH_VIGILANCE_IP|$VIGILANCE_IP|g" "$SCRIPT_FILE"
sed -i "s|REPLACE_WITH_AUTHZ_IP|$AUTHZ_IP|g" "$SCRIPT_FILE"
sed -i "s|REPLACE_WITH_NOTIFICATIONS_IP|$NOTIFICATIONS_IP|g" "$SCRIPT_FILE"

echo "✓ Fichier mis à jour"
echo ""

# Afficher les nouvelles valeurs
echo "🌐 Nouvelles URLs configurées:"
grep -E "(ORDERS_API_URL|AFFRET_API_URL|VIGILANCE_API_URL|AUTHZ_URL|NOTIFICATIONS_URL)=" "$SCRIPT_FILE" | head -5
echo ""

echo "════════════════════════════════════════════════════════"
echo "✅ Configuration terminée"
echo ""
echo "Vous pouvez maintenant lancer:"
echo "  chmod +x infra/deploy-all-frontends.sh"
echo "  ./infra/deploy-all-frontends.sh"
echo "════════════════════════════════════════════════════════"
echo ""
