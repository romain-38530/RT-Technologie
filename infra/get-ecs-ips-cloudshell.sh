#!/bin/bash
# =============================================================================
# Script pour récupérer les IPs publiques des services ECS
# À exécuter dans AWS CloudShell
# =============================================================================

set -e

REGION="eu-central-1"
CLUSTER="rt-technologie-cluster"

echo "========================================="
echo "🔍 Récupération des IPs des services ECS"
echo "========================================="
echo ""

# Fonction pour récupérer l'IP d'un service
get_service_ip() {
    local service_name=$1
    local port=$2

    echo "📡 Service: $service_name (port $port)"

    # Récupérer le Task ARN
    TASK_ARN=$(aws ecs list-tasks \
        --cluster $CLUSTER \
        --service-name "rt-${service_name}-service" \
        --region $REGION \
        --query 'taskArns[0]' \
        --output text 2>/dev/null)

    if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" = "None" ]; then
        echo "   ❌ Aucune tâche en cours d'exécution"
        echo ""
        return
    fi

    # Récupérer l'ENI ID
    ENI_ID=$(aws ecs describe-tasks \
        --cluster $CLUSTER \
        --tasks $TASK_ARN \
        --region $REGION \
        --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
        --output text 2>/dev/null)

    if [ -z "$ENI_ID" ]; then
        echo "   ❌ Interface réseau non trouvée"
        echo ""
        return
    fi

    # Récupérer l'IP publique
    PUBLIC_IP=$(aws ec2 describe-network-interfaces \
        --network-interface-ids $ENI_ID \
        --region $REGION \
        --query 'NetworkInterfaces[0].Association.PublicIp' \
        --output text 2>/dev/null)

    if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" = "None" ]; then
        echo "   ❌ Pas d'IP publique assignée"
        echo ""
        return
    fi

    echo "   ✅ IP: $PUBLIC_IP"
    echo "   🌐 URL: http://$PUBLIC_IP:$port"
    echo ""

    # Stocker dans une variable globale
    case $service_name in
        "client-onboarding")
            CLIENT_ONBOARDING_IP=$PUBLIC_IP
            CLIENT_ONBOARDING_URL="http://$PUBLIC_IP:$port"
            ;;
        "affret-ia")
            AFFRET_IA_IP=$PUBLIC_IP
            AFFRET_IA_URL="http://$PUBLIC_IP:$port"
            ;;
        "core-orders")
            CORE_ORDERS_IP=$PUBLIC_IP
            CORE_ORDERS_URL="http://$PUBLIC_IP:$port"
            ;;
        "vigilance")
            VIGILANCE_IP=$PUBLIC_IP
            VIGILANCE_URL="http://$PUBLIC_IP:$port"
            ;;
    esac
}

# Récupérer les IPs des services principaux
get_service_ip "client-onboarding" "3020"
get_service_ip "affret-ia" "3010"
get_service_ip "core-orders" "3030"
get_service_ip "vigilance" "3040"

echo "========================================="
echo "📋 RÉSUMÉ - Variables Vercel à configurer"
echo "========================================="
echo ""

if [ -n "$AFFRET_IA_URL" ]; then
    echo "🔹 Pour web-forwarder:"
    echo "   Variable: NEXT_PUBLIC_AFFRET_IA_URL"
    echo "   Valeur: $AFFRET_IA_URL"
    echo ""
fi

if [ -n "$CLIENT_ONBOARDING_URL" ]; then
    echo "🔹 Pour marketing-site:"
    echo "   Variable: NEXT_PUBLIC_API_URL"
    echo "   Valeur: $CLIENT_ONBOARDING_URL"
    echo ""
fi

echo "========================================="
echo "📝 COMMANDES POUR CONFIGURER DANS VERCEL"
echo "========================================="
echo ""

if [ -n "$AFFRET_IA_URL" ]; then
    echo "# web-forwarder"
    echo "# Allez sur: https://vercel.com/rt-technologie/web-forwarder/settings/environment-variables"
    echo "# Créez: NEXT_PUBLIC_AFFRET_IA_URL = $AFFRET_IA_URL"
    echo ""
fi

if [ -n "$CLIENT_ONBOARDING_URL" ]; then
    echo "# marketing-site"
    echo "# Allez sur: https://vercel.com/rt-technologie/marketing-site/settings/environment-variables"
    echo "# Créez: NEXT_PUBLIC_API_URL = $CLIENT_ONBOARDING_URL"
    echo ""
fi

echo "========================================="
echo "✅ Récupération terminée!"
echo "========================================="
echo ""
echo "📌 PROCHAINES ÉTAPES:"
echo ""
echo "1. Copiez les URLs ci-dessus"
echo "2. Allez sur Vercel Dashboard: https://vercel.com/dashboard"
echo "3. Pour chaque projet, allez dans Settings → Environment Variables"
echo "4. Créez les variables avec les valeurs indiquées"
echo "5. Redéployez les applications depuis Vercel ou GitHub"
echo ""

# Exporter les variables pour utilisation dans le terminal actuel
if [ -n "$AFFRET_IA_URL" ]; then
    export NEXT_PUBLIC_AFFRET_IA_URL="$AFFRET_IA_URL"
    echo "✓ Variable exportée: NEXT_PUBLIC_AFFRET_IA_URL"
fi

if [ -n "$CLIENT_ONBOARDING_URL" ]; then
    export NEXT_PUBLIC_API_URL="$CLIENT_ONBOARDING_URL"
    echo "✓ Variable exportée: NEXT_PUBLIC_API_URL"
fi

echo ""
