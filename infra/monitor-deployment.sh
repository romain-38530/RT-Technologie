#!/bin/bash
# =============================================================================
# Script de monitoring en temps réel du déploiement AWS
# À lancer dans AWS CloudShell
# =============================================================================

REGION="eu-central-1"
CLUSTER="rt-technologie-cluster"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Liste de tous les services
SERVICES=(
  "client-onboarding:3020"
  "core-orders:3030"
  "affret-ia:3010"
  "vigilance:3040"
  "notifications:3050"
  "authz:3007"
  "admin-gateway:3008"
  "pricing-grids:3060"
  "planning:3070"
  "bourse:3080"
  "palette:3090"
  "wms-sync:3100"
  "erp-sync:3110"
  "tms-sync:3120"
  "tracking-ia:3130"
  "chatbot:3140"
  "geo-tracking:3150"
  "ecpmr:3160"
  "storage-market:3170"
  "training:3180"
)

clear

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}      🚀 MONITORING DÉPLOIEMENT RT-TECHNOLOGIE                 ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Région: ${BLUE}$REGION${NC}"
echo -e "Cluster: ${BLUE}$CLUSTER${NC}"
echo -e "Services: ${BLUE}${#SERVICES[@]}${NC}"
echo ""

# Fonction pour obtenir le statut d'un service
get_service_status() {
  local service_name=$1
  local port=$2

  # Vérifier si le service existe
  local service_status=$(aws ecs describe-services \
    --cluster $CLUSTER \
    --services rt-$service_name-service \
    --region $REGION \
    --query 'services[0].status' \
    --output text 2>/dev/null)

  if [ "$service_status" = "ACTIVE" ]; then
    local running=$(aws ecs describe-services \
      --cluster $CLUSTER \
      --services rt-$service_name-service \
      --region $REGION \
      --query 'services[0].runningCount' \
      --output text 2>/dev/null)

    local desired=$(aws ecs describe-services \
      --cluster $CLUSTER \
      --services rt-$service_name-service \
      --region $REGION \
      --query 'services[0].desiredCount' \
      --output text 2>/dev/null)

    if [ "$running" = "$desired" ] && [ "$running" -gt 0 ]; then
      # Récupérer l'IP
      local task_arn=$(aws ecs list-tasks \
        --cluster $CLUSTER \
        --service-name rt-$service_name-service \
        --region $REGION \
        --query 'taskArns[0]' \
        --output text 2>/dev/null)

      if [ -n "$task_arn" ] && [ "$task_arn" != "None" ]; then
        local eni=$(aws ecs describe-tasks \
          --cluster $CLUSTER \
          --tasks $task_arn \
          --region $REGION \
          --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
          --output text 2>/dev/null)

        local ip=$(aws ec2 describe-network-interfaces \
          --network-interface-ids $eni \
          --region $REGION \
          --query 'NetworkInterfaces[0].Association.PublicIp' \
          --output text 2>/dev/null)

        if [ -n "$ip" ] && [ "$ip" != "None" ]; then
          echo -e "${GREEN}✓ RUNNING${NC}  http://$ip:$port"
          return 0
        fi
      fi
      echo -e "${YELLOW}⏳ STARTING${NC} ($running/$desired)"
      return 1
    else
      echo -e "${YELLOW}⏳ DEPLOYING${NC} ($running/$desired)"
      return 1
    fi
  else
    # Vérifier si l'image existe dans ECR
    local image_exists=$(aws ecr describe-images \
      --repository-name rt-$service_name \
      --region $REGION \
      --query 'imageDetails[0].imageTags[0]' \
      --output text 2>/dev/null)

    if [ -n "$image_exists" ] && [ "$image_exists" != "None" ]; then
      echo -e "${CYAN}⏳ READY${NC}    (image pushed, service not created)"
      return 2
    else
      # Vérifier si un build est en cours
      if [ -f "/tmp/b-$service_name.log" ]; then
        local log_size=$(stat -f%z "/tmp/b-$service_name.log" 2>/dev/null || stat -c%s "/tmp/b-$service_name.log" 2>/dev/null)
        if [ "$log_size" -gt 0 ]; then
          echo -e "${MAGENTA}🔨 BUILDING${NC} (log: ${log_size} bytes)"
          return 3
        fi
      fi
      echo -e "${RED}⏸  PENDING${NC}  (not started)"
      return 4
    fi
  fi
}

# Tableau de résumé
RUNNING=0
STARTING=0
DEPLOYING=0
READY=0
BUILDING=0
PENDING=0

echo -e "${CYAN}───────────────────────────────────────────────────────────────${NC}"
printf "%-20s %-8s %-40s\n" "SERVICE" "PORT" "STATUS"
echo -e "${CYAN}───────────────────────────────────────────────────────────────${NC}"

for service_info in "${SERVICES[@]}"; do
  service_name="${service_info%:*}"
  port="${service_info#*:}"

  printf "%-20s %-8s " "$service_name" "$port"
  get_service_status "$service_name" "$port"
  status=$?

  case $status in
    0) ((RUNNING++)) ;;
    1) ((STARTING++)) ;;
    2) ((READY++)) ;;
    3) ((BUILDING++)) ;;
    4) ((PENDING++)) ;;
  esac
done

echo -e "${CYAN}───────────────────────────────────────────────────────────────${NC}"
echo ""

# Résumé
echo -e "${CYAN}📊 RÉSUMÉ:${NC}"
echo ""
echo -e "  ${GREEN}✓ Running:${NC}   $RUNNING/${#SERVICES[@]}"
echo -e "  ${YELLOW}⏳ Starting:${NC}  $STARTING/${#SERVICES[@]}"
echo -e "  ${YELLOW}⏳ Deploying:${NC} $DEPLOYING/${#SERVICES[@]}"
echo -e "  ${CYAN}⏳ Ready:${NC}     $READY/${#SERVICES[@]}"
echo -e "  ${MAGENTA}🔨 Building:${NC}  $BUILDING/${#SERVICES[@]}"
echo -e "  ${RED}⏸  Pending:${NC}   $PENDING/${#SERVICES[@]}"
echo ""

# Barre de progression
TOTAL=${#SERVICES[@]}
COMPLETED=$RUNNING
PERCENTAGE=$((COMPLETED * 100 / TOTAL))

echo -e "${CYAN}📈 PROGRESSION GLOBALE:${NC}"
echo ""

# Créer la barre de progression
BAR_LENGTH=50
FILLED=$((PERCENTAGE * BAR_LENGTH / 100))
EMPTY=$((BAR_LENGTH - FILLED))

printf "  ["
for ((i=0; i<FILLED; i++)); do
  printf "${GREEN}█${NC}"
done
for ((i=0; i<EMPTY; i++)); do
  printf "░"
done
printf "] ${GREEN}$PERCENTAGE%%${NC} ($COMPLETED/$TOTAL)\n"
echo ""

# Logs des builds en cours
if [ $BUILDING -gt 0 ]; then
  echo -e "${CYAN}🔨 BUILDS EN COURS:${NC}"
  echo ""
  for service_info in "${SERVICES[@]}"; do
    service_name="${service_info%:*}"
    if [ -f "/tmp/b-$service_name.log" ]; then
      log_size=$(stat -f%z "/tmp/b-$service_name.log" 2>/dev/null || stat -c%s "/tmp/b-$service_name.log" 2>/dev/null)
      if [ "$log_size" -gt 0 ]; then
        echo -e "  • ${MAGENTA}$service_name${NC} ($(($log_size / 1024)) KB)"
        # Afficher les 3 dernières lignes du log
        tail -3 "/tmp/b-$service_name.log" 2>/dev/null | sed 's/^/    /'
        echo ""
      fi
    fi
  done
fi

# Estimation du temps restant
if [ $COMPLETED -lt $TOTAL ]; then
  REMAINING=$((TOTAL - COMPLETED))
  # Estimer 3 minutes par service restant
  MINUTES_REMAINING=$((REMAINING * 3))

  echo -e "${CYAN}⏱️  TEMPS ESTIMÉ RESTANT:${NC}"
  echo -e "  ${YELLOW}~$MINUTES_REMAINING minutes${NC} ($REMAINING services restants)"
  echo ""
fi

# Commandes utiles
echo -e "${CYAN}📝 COMMANDES UTILES:${NC}"
echo ""
echo -e "  • Relancer ce script:    ${BLUE}./monitor-deployment.sh${NC}"
echo -e "  • Mode watch (auto):     ${BLUE}watch -n 30 ./monitor-deployment.sh${NC}"
echo -e "  • Voir les IPs:          ${BLUE}~/get-all-ips.sh${NC}"
echo -e "  • Logs d'un service:     ${BLUE}tail -f /tmp/b-SERVICE.log${NC}"
echo -e "  • Logs ECS:              ${BLUE}aws logs tail /ecs/rt-SERVICE --follow${NC}"
echo ""

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

# Si tous les services sont running, afficher les IPs
if [ $COMPLETED -eq $TOTAL ]; then
  echo ""
  echo -e "${GREEN}🎉 TOUS LES SERVICES SONT DÉPLOYÉS !${NC}"
  echo ""
  echo -e "Lancez ${BLUE}~/get-all-ips.sh${NC} pour voir toutes les URLs"
  echo ""
fi
