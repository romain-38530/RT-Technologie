#!/bin/bash
# ============================================================================
# RT-Technologie - Services Monitoring Script
# ============================================================================
# Description: Monitoring en temps réel de tous les services
# Author: RT-Technologie DevOps Team
# Version: 1.0.0
# Date: 2025-11-18
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Services configuration
declare -A SERVICES=(
  [3001]="core-orders"
  [3002]="notifications"
  [3003]="tms-sync"
  [3004]="planning"
  [3005]="affret-ia"
  [3006]="vigilance"
  [3007]="authz"
  [3008]="admin-gateway"
  [3009]="ecpmr"
  [3011]="palette"
  [3012]="training"
  [3013]="storage-market"
  [3014]="pricing-grids"
  [3015]="tracking-ia"
  [3016]="bourse"
  [3017]="wms-sync"
  [3018]="erp-sync"
  [3019]="chatbot"
  [3020]="geo-tracking"
)

# Function to check service health
check_service() {
  local port=$1
  local name=$2

  # Try to curl the health endpoint
  local response=$(curl -s --max-time 2 "http://localhost:$port/health" 2>/dev/null)
  local exit_code=$?

  if [ $exit_code -eq 0 ]; then
    # Check if response contains "ok" or "healthy"
    if echo "$response" | grep -qi "ok\|healthy\|running"; then
      echo -e "${GREEN}UP${NC}"
    else
      echo -e "${YELLOW}DEGRADED${NC}"
    fi
  else
    echo -e "${RED}DOWN${NC}"
  fi
}

# Function to get memory usage
get_memory_usage() {
  local port=$1

  # Get process using the port
  local pid=$(lsof -ti:$port 2>/dev/null || netstat -ano | grep ":$port " | grep LISTEN | awk '{print $5}' | head -1)

  if [ ! -z "$pid" ]; then
    # Get memory usage in MB
    local mem=$(ps -p $pid -o rss= 2>/dev/null | awk '{print int($1/1024)}')
    if [ ! -z "$mem" ]; then
      echo "${mem}MB"
    else
      echo "N/A"
    fi
  else
    echo "N/A"
  fi
}

# Function to display header
display_header() {
  clear
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}RT-Technologie - Services Monitor${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo -e "Time: $(date '+%Y-%m-%d %H:%M:%S')"
  echo ""
  printf "%-6s %-20s %-12s %-10s\n" "PORT" "SERVICE" "STATUS" "MEMORY"
  echo "------------------------------------------------------"
}

# Function to monitor all services
monitor_services() {
  while true; do
    display_header

    local total_services=${#SERVICES[@]}
    local up_count=0
    local down_count=0

    # Sort ports numerically
    for port in $(echo "${!SERVICES[@]}" | tr ' ' '\n' | sort -n); do
      name=${SERVICES[$port]}
      status=$(check_service $port $name)
      memory=$(get_memory_usage $port)

      # Count status
      if echo "$status" | grep -q "UP"; then
        ((up_count++))
      else
        ((down_count++))
      fi

      # Display service info
      printf "%-6s %-20s %-20s %-10s\n" "$port" "$name" "$status" "$memory"
    done

    # Summary
    echo "------------------------------------------------------"
    echo -e "Total: $total_services | ${GREEN}UP: $up_count${NC} | ${RED}DOWN: $down_count${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop monitoring${NC}"

    # Wait 5 seconds before refresh
    sleep 5
  done
}

# Function to check once (no loop)
check_once() {
  display_header

  for port in $(echo "${!SERVICES[@]}" | tr ' ' '\n' | sort -n); do
    name=${SERVICES[$port]}
    status=$(check_service $port $name)
    memory=$(get_memory_usage $port)
    printf "%-6s %-20s %-20s %-10s\n" "$port" "$name" "$status" "$memory"
  done

  echo ""
}

# Function to check specific service
check_specific() {
  local port=$1

  if [ -z "${SERVICES[$port]}" ]; then
    echo -e "${RED}Error: Unknown service port $port${NC}"
    exit 1
  fi

  local name=${SERVICES[$port]}
  echo "Checking $name on port $port..."

  local status=$(check_service $port $name)
  local memory=$(get_memory_usage $port)

  echo -e "Status: $status"
  echo -e "Memory: $memory"

  # Try to get detailed health info
  echo ""
  echo "Health endpoint response:"
  curl -s "http://localhost:$port/health" | jq '.' 2>/dev/null || curl -s "http://localhost:$port/health"
}

# Function to show help
show_help() {
  echo "RT-Technologie Services Monitor"
  echo ""
  echo "Usage:"
  echo "  $0                 - Monitor all services (continuous)"
  echo "  $0 --once          - Check all services once"
  echo "  $0 --port <PORT>   - Check specific service"
  echo "  $0 --help          - Show this help"
  echo ""
  echo "Examples:"
  echo "  $0                 # Start continuous monitoring"
  echo "  $0 --once          # Check all services once"
  echo "  $0 --port 3001     # Check core-orders service"
}

# Main
case "${1}" in
  --once)
    check_once
    ;;
  --port)
    if [ -z "$2" ]; then
      echo -e "${RED}Error: Port number required${NC}"
      show_help
      exit 1
    fi
    check_specific $2
    ;;
  --help|-h)
    show_help
    ;;
  "")
    monitor_services
    ;;
  *)
    echo -e "${RED}Error: Unknown option $1${NC}"
    show_help
    exit 1
    ;;
esac
