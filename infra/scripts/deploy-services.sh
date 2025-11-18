#!/bin/bash
# ============================================================================
# RT-Technologie - Deploy Services Script
# ============================================================================
# Description: Automated deployment script for backend services with PM2
# Author: RT-Technologie DevOps Team
# Version: 1.0.0
# Date: 2025-11-18
# ============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="${PROJECT_DIR:-/opt/rt-technologie}"
ENV_FILE="${ENV_FILE:-${PROJECT_DIR}/.env}"
LOG_DIR="${LOG_DIR:-/var/log/rt-technologie}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/rt-technologie}"
HEALTH_CHECK_TIMEOUT=30
ROLLBACK_ON_FAILURE=true

# Services configuration
declare -A SERVICES
SERVICES=(
    ["admin-gateway"]="3008"
    ["authz"]="3007"
    ["core-orders"]="3001"
    ["notifications"]="3002"
    ["planning"]="3004"
    ["tms-sync"]="3003"
    ["ecpmr"]="3009"
    ["vigilance"]="3006"
    ["palette"]="3011"
    ["affret-ia"]="3005"
    ["training"]="3012"
    ["storage-market"]="3013"
    ["pricing-grids"]="3014"
    ["tracking-ia"]="3015"
    ["bourse"]="3016"
    ["wms-sync"]="3017"
    ["erp-sync"]="3018"
)

# ============================================================================
# Helper Functions
# ============================================================================

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    if ! command_exists node; then
        error "Node.js is not installed"
        exit 1
    fi

    if ! command_exists pnpm; then
        error "pnpm is not installed"
        exit 1
    fi

    if ! command_exists pm2; then
        error "PM2 is not installed"
        exit 1
    fi

    if [ ! -d "$PROJECT_DIR" ]; then
        error "Project directory not found: $PROJECT_DIR"
        exit 1
    fi

    success "Prerequisites check passed"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."

    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKUP_DIR"

    success "Directories created"
}

# Backup current deployment
backup_deployment() {
    log "Creating backup of current deployment..."

    BACKUP_NAME="backup-$(date +'%Y%m%d-%H%M%S').tar.gz"
    BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

    cd "$PROJECT_DIR"
    tar -czf "$BACKUP_PATH" \
        --exclude=node_modules \
        --exclude=.next \
        --exclude=.git \
        services packages .env pm2.config.js 2>/dev/null || true

    success "Backup created: $BACKUP_PATH"

    # Keep only last 5 backups
    ls -t "$BACKUP_DIR"/backup-*.tar.gz | tail -n +6 | xargs -r rm
}

# Pull latest code
pull_code() {
    log "Pulling latest code from Git..."

    cd "$PROJECT_DIR"

    # Stash local changes (if any)
    git stash save "Auto-stash before deployment $(date +'%Y-%m-%d %H:%M:%S')" 2>/dev/null || true

    # Pull latest changes
    git pull origin main

    COMMIT_HASH=$(git rev-parse --short HEAD)
    log "Deployed commit: $COMMIT_HASH"

    success "Code pulled successfully"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."

    cd "$PROJECT_DIR"
    pnpm install --frozen-lockfile --prod=false

    success "Dependencies installed"
}

# Build services
build_services() {
    log "Building services..."

    cd "$PROJECT_DIR"
    pnpm build --filter='./services/*' --filter='./packages/*'

    success "Services built successfully"
}

# Health check for a service
health_check() {
    local service_name=$1
    local port=$2
    local max_attempts=$HEALTH_CHECK_TIMEOUT
    local attempt=0

    log "Health checking $service_name on port $port..."

    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s "http://localhost:${port}/health" > /dev/null 2>&1; then
            success "$service_name is healthy"
            return 0
        fi

        sleep 1
        ((attempt++))
    done

    error "$service_name health check failed after ${max_attempts}s"
    return 1
}

# Start services with PM2
start_services() {
    log "Starting services with PM2..."

    cd "$PROJECT_DIR"

    # Check if PM2 ecosystem file exists
    if [ ! -f "infra/scripts/pm2-ecosystem.config.js" ]; then
        error "PM2 ecosystem file not found"
        exit 1
    fi

    # Start or reload services
    if pm2 list | grep -q "online"; then
        log "Reloading existing PM2 processes..."
        pm2 reload infra/scripts/pm2-ecosystem.config.js --update-env
    else
        log "Starting new PM2 processes..."
        pm2 start infra/scripts/pm2-ecosystem.config.js
    fi

    # Save PM2 process list
    pm2 save

    success "Services started"
}

# Run health checks on all services
run_health_checks() {
    log "Running health checks on all services..."

    local failed_services=()

    for service_name in "${!SERVICES[@]}"; do
        port="${SERVICES[$service_name]}"

        if ! health_check "$service_name" "$port"; then
            failed_services+=("$service_name")
        fi
    done

    if [ ${#failed_services[@]} -gt 0 ]; then
        error "Health checks failed for: ${failed_services[*]}"
        return 1
    fi

    success "All services are healthy"
    return 0
}

# Rollback to previous backup
rollback() {
    warning "Initiating rollback..."

    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup-*.tar.gz | head -n1)

    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
        exit 1
    fi

    log "Restoring from backup: $LATEST_BACKUP"

    cd "$PROJECT_DIR"
    tar -xzf "$LATEST_BACKUP"

    # Restart services
    pm2 restart all

    success "Rollback completed"
}

# Cleanup old logs
cleanup_logs() {
    log "Cleaning up old logs..."

    # Delete logs older than 30 days
    find "$LOG_DIR" -type f -name "*.log" -mtime +30 -delete 2>/dev/null || true

    # Rotate PM2 logs
    pm2 flush

    success "Logs cleaned up"
}

# Show deployment summary
show_summary() {
    local status=$1

    echo ""
    echo "============================================"
    echo "  Deployment Summary"
    echo "============================================"
    echo "Status: $status"
    echo "Environment: ${NODE_ENV:-production}"
    echo "Commit: $(git -C "$PROJECT_DIR" rev-parse --short HEAD)"
    echo "Time: $(date +'%Y-%m-%d %H:%M:%S')"
    echo "============================================"
    echo ""

    # Show PM2 status
    pm2 status
}

# ============================================================================
# Main Deployment Flow
# ============================================================================

main() {
    log "Starting RT-Technologie deployment..."

    # Pre-deployment checks
    check_prerequisites
    create_directories

    # Backup current state
    backup_deployment

    # Deploy
    if pull_code && \
       install_dependencies && \
       build_services && \
       start_services; then

        # Post-deployment health checks
        if run_health_checks; then
            cleanup_logs
            success "Deployment completed successfully!"
            show_summary "SUCCESS"
            exit 0
        else
            error "Health checks failed after deployment"

            if [ "$ROLLBACK_ON_FAILURE" = true ]; then
                rollback
                show_summary "ROLLED BACK"
                exit 1
            else
                show_summary "FAILED (no rollback)"
                exit 1
            fi
        fi
    else
        error "Deployment failed during build/start phase"

        if [ "$ROLLBACK_ON_FAILURE" = true ]; then
            rollback
            show_summary "ROLLED BACK"
            exit 1
        else
            show_summary "FAILED (no rollback)"
            exit 1
        fi
    fi
}

# ============================================================================
# CLI Arguments
# ============================================================================

show_help() {
    cat << EOF
RT-Technologie Deployment Script

Usage: $0 [OPTIONS]

Options:
    -h, --help              Show this help message
    -d, --dir DIR           Project directory (default: /opt/rt-technologie)
    -e, --env FILE          Environment file (default: .env)
    -n, --no-rollback       Disable rollback on failure
    -b, --backup-only       Only create backup, don't deploy
    -r, --rollback          Rollback to previous backup
    --health-check          Only run health checks
    --logs                  Show PM2 logs
    --status                Show PM2 status

Examples:
    $0                      # Deploy with defaults
    $0 --no-rollback        # Deploy without automatic rollback
    $0 --backup-only        # Create backup only
    $0 --rollback           # Rollback to previous version
    $0 --health-check       # Run health checks only

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--dir)
            PROJECT_DIR="$2"
            shift 2
            ;;
        -e|--env)
            ENV_FILE="$2"
            shift 2
            ;;
        -n|--no-rollback)
            ROLLBACK_ON_FAILURE=false
            shift
            ;;
        -b|--backup-only)
            backup_deployment
            exit 0
            ;;
        -r|--rollback)
            rollback
            exit 0
            ;;
        --health-check)
            run_health_checks
            exit $?
            ;;
        --logs)
            pm2 logs
            exit 0
            ;;
        --status)
            pm2 status
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main deployment
main
