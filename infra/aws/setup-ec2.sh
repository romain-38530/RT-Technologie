#!/bin/bash

# RT-Technologie - Script d'installation automatique EC2
# Ce script configure une instance EC2 Ubuntu pour héberger l'application

set -e

echo "=========================================="
echo "RT-Technologie - Installation EC2"
echo "=========================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que le script est exécuté sur Ubuntu
if [ ! -f /etc/lsb-release ]; then
    log_error "Ce script doit être exécuté sur Ubuntu"
    exit 1
fi

log_info "Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

log_info "Installation des prérequis..."
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    gnupg \
    lsb-release \
    git \
    htop \
    ufw

# Installation Docker
log_info "Installation de Docker..."
if ! command -v docker &> /dev/null; then
    # Ajout du repository Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Ajouter l'utilisateur au groupe docker
    sudo usermod -aG docker $USER

    log_info "Docker installé avec succès"
else
    log_warn "Docker est déjà installé"
fi

# Installation Docker Compose standalone
log_info "Installation de Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log_info "Docker Compose installé avec succès"
else
    log_warn "Docker Compose est déjà installé"
fi

# Vérification des versions
log_info "Versions installées:"
docker --version
docker-compose --version

# Configuration du pare-feu UFW
log_info "Configuration du pare-feu..."
sudo ufw --force enable
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

log_info "Pare-feu configuré"

# Optimisation système pour Docker
log_info "Optimisation système..."

# Augmenter les limites de fichiers ouverts
sudo tee -a /etc/security/limits.conf > /dev/null <<EOF
* soft nofile 65536
* hard nofile 65536
EOF

# Optimisation réseau
sudo tee -a /etc/sysctl.conf > /dev/null <<EOF
# RT-Technologie optimizations
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.ip_local_port_range = 1024 65535
EOF

sudo sysctl -p

# Créer les dossiers nécessaires
log_info "Création des dossiers de travail..."
mkdir -p ~/rt-technologie
mkdir -p ~/rt-technologie/logs
mkdir -p ~/rt-technologie/backups

# Configuration de logrotate pour les logs Docker
log_info "Configuration de la rotation des logs..."
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker

# Installation de Nginx
log_info "Installation de Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    log_info "Nginx installé avec succès"
else
    log_warn "Nginx est déjà installé"
fi

# Créer un script de monitoring simple
log_info "Création du script de monitoring..."
cat > ~/rt-technologie/monitor.sh <<'EOF'
#!/bin/bash

echo "=========================================="
echo "RT-Technologie - Status"
echo "=========================================="
echo ""

echo "=== Conteneurs Docker ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "=== Utilisation CPU/RAM ==="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""

echo "=== Espace disque ==="
df -h | grep -E "Filesystem|/dev/root"
echo ""

echo "=== RAM système ==="
free -h
echo ""
EOF

chmod +x ~/rt-technologie/monitor.sh

# Script de sauvegarde MongoDB
log_info "Création du script de backup MongoDB..."
cat > ~/rt-technologie/backup-mongodb.sh <<'EOF'
#!/bin/bash

BACKUP_DIR=~/rt-technologie/backups
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="mongodb_backup_${DATE}.gz"

echo "Sauvegarde MongoDB en cours..."

docker exec rt-mongodb-prod mongodump \
    --username=rt_admin \
    --password=$MONGODB_PASSWORD \
    --authenticationDatabase=admin \
    --gzip \
    --archive > ${BACKUP_DIR}/${BACKUP_FILE}

echo "Sauvegarde créée: ${BACKUP_FILE}"

# Garder seulement les 7 dernières sauvegardes
cd ${BACKUP_DIR}
ls -t mongodb_backup_*.gz | tail -n +8 | xargs -r rm

echo "Anciennes sauvegardes nettoyées"
EOF

chmod +x ~/rt-technologie/backup-mongodb.sh

# Créer un cron job pour les backups automatiques (tous les jours à 2h du matin)
log_info "Configuration des backups automatiques..."
(crontab -l 2>/dev/null; echo "0 2 * * * ~/rt-technologie/backup-mongodb.sh >> ~/rt-technologie/logs/backup.log 2>&1") | crontab -

echo ""
echo "=========================================="
log_info "Installation terminée avec succès!"
echo "=========================================="
echo ""
echo "Prochaines étapes:"
echo "1. Déconnectez-vous et reconnectez-vous pour que les groupes Docker prennent effet:"
echo "   exit"
echo ""
echo "2. Clonez ou transférez votre code:"
echo "   cd ~/rt-technologie"
echo "   git clone <VOTRE_REPO> ."
echo ""
echo "3. Configurez le fichier .env:"
echo "   cp .env.production .env"
echo "   nano .env"
echo ""
echo "4. Lancez l'application:"
echo "   docker-compose -f docker-compose.production.yml up -d"
echo ""
echo "5. Utilisez le script de monitoring:"
echo "   ~/rt-technologie/monitor.sh"
echo ""
echo "=========================================="
