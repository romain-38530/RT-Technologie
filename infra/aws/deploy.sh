#!/bin/bash

# RT-Technologie - Script de déploiement automatique
# Ce script met à jour l'application sur AWS EC2

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo "=========================================="
echo "RT-Technologie - Déploiement Production"
echo "=========================================="
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.production.yml" ]; then
    log_error "Fichier docker-compose.production.yml non trouvé"
    log_error "Assurez-vous d'être dans le répertoire rt-technologie"
    exit 1
fi

# Vérifier que le fichier .env existe
if [ ! -f ".env" ]; then
    log_error "Fichier .env non trouvé"
    log_error "Copiez .env.production en .env et configurez-le:"
    log_error "  cp .env.production .env"
    log_error "  nano .env"
    exit 1
fi

# Menu de déploiement
echo "Options de déploiement:"
echo "1) Déploiement complet (arrêt, rebuild, redémarrage)"
echo "2) Mise à jour rapide (sans rebuild)"
echo "3) Redémarrage des services"
echo "4) Arrêt de tous les services"
echo "5) Voir les logs"
echo "6) Backup MongoDB"
echo "7) Status des services"
echo "8) Cleanup (nettoyer images/volumes inutilisés)"
echo ""
read -p "Choisissez une option (1-8): " choice

case $choice in
    1)
        log_step "Déploiement complet..."

        log_info "Arrêt des services existants..."
        docker-compose -f docker-compose.production.yml down

        log_info "Pull des dernières images de base..."
        docker-compose -f docker-compose.production.yml pull mongodb redis

        log_info "Build des images applicatives..."
        docker-compose -f docker-compose.production.yml build --no-cache

        log_info "Démarrage des services..."
        docker-compose -f docker-compose.production.yml up -d

        log_info "Attente que les services démarrent (30s)..."
        sleep 30

        log_info "Vérification de l'état des services..."
        docker-compose -f docker-compose.production.yml ps

        log_step "Déploiement terminé!"
        log_info "Vérifiez les logs avec: docker-compose -f docker-compose.production.yml logs -f"
        ;;

    2)
        log_step "Mise à jour rapide..."

        log_info "Pull du code (si git)..."
        if [ -d ".git" ]; then
            git pull
        fi

        log_info "Redémarrage des services..."
        docker-compose -f docker-compose.production.yml up -d

        log_step "Mise à jour terminée!"
        ;;

    3)
        log_step "Redémarrage des services..."
        docker-compose -f docker-compose.production.yml restart
        log_step "Services redémarrés!"
        ;;

    4)
        log_step "Arrêt de tous les services..."
        docker-compose -f docker-compose.production.yml down
        log_step "Tous les services sont arrêtés"
        ;;

    5)
        log_step "Affichage des logs..."
        echo ""
        echo "Logs disponibles:"
        echo "- Tous: docker-compose -f docker-compose.production.yml logs -f"
        echo "- Service spécifique: docker-compose -f docker-compose.production.yml logs -f <service>"
        echo ""
        read -p "Afficher tous les logs? (y/n): " show_logs
        if [ "$show_logs" = "y" ]; then
            docker-compose -f docker-compose.production.yml logs -f
        fi
        ;;

    6)
        log_step "Backup MongoDB..."

        BACKUP_DIR=~/rt-technologie/backups
        mkdir -p $BACKUP_DIR

        DATE=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="mongodb_backup_${DATE}.gz"

        # Récupérer le mot de passe depuis .env
        MONGO_PASSWORD=$(grep MONGODB_ROOT_PASSWORD .env | cut -d '=' -f2)

        if [ -z "$MONGO_PASSWORD" ]; then
            log_error "MONGODB_ROOT_PASSWORD non trouvé dans .env"
            exit 1
        fi

        log_info "Création de la sauvegarde..."
        docker exec rt-mongodb-prod mongodump \
            --username=rt_admin \
            --password=$MONGO_PASSWORD \
            --authenticationDatabase=admin \
            --gzip \
            --archive > ${BACKUP_DIR}/${BACKUP_FILE}

        log_info "Sauvegarde créée: ${BACKUP_FILE}"
        log_info "Taille: $(du -h ${BACKUP_DIR}/${BACKUP_FILE} | cut -f1)"

        # Nettoyer les vieilles sauvegardes (garder les 7 dernières)
        cd ${BACKUP_DIR}
        ls -t mongodb_backup_*.gz | tail -n +8 | xargs -r rm

        log_step "Backup terminé!"
        ;;

    7)
        log_step "Status des services..."
        echo ""
        echo "=== Conteneurs Docker ==="
        docker-compose -f docker-compose.production.yml ps
        echo ""
        echo "=== Utilisation des ressources ==="
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
        echo ""
        echo "=== Espace disque ==="
        df -h | grep -E "Filesystem|/dev/root"
        echo ""
        echo "=== Health checks ==="
        docker inspect --format='{{.Name}}: {{.State.Health.Status}}' $(docker ps -q) 2>/dev/null || echo "Aucun healthcheck configuré"
        ;;

    8)
        log_step "Cleanup des ressources Docker..."

        log_warn "Ceci va supprimer:"
        log_warn "- Toutes les images Docker inutilisées"
        log_warn "- Tous les conteneurs arrêtés"
        log_warn "- Tous les réseaux inutilisés"
        log_warn "- Le cache de build"
        echo ""
        read -p "Confirmer? (y/n): " confirm

        if [ "$confirm" = "y" ]; then
            log_info "Nettoyage en cours..."
            docker system prune -a -f --volumes
            log_step "Cleanup terminé!"
            echo ""
            log_info "Espace disque libéré:"
            df -h | grep -E "Filesystem|/dev/root"
        else
            log_info "Cleanup annulé"
        fi
        ;;

    *)
        log_error "Option invalide"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
log_info "Script terminé"
echo "=========================================="
