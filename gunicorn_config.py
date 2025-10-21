# -*- coding: utf-8 -*-
"""
Configuration Gunicorn pour Production
Système de Sourcing Permanent - RT-Technologie
"""

import multiprocessing
import os

# Adresse et port d'écoute
bind = "0.0.0.0:8000"

# Nombre de workers (2-4 x nombre de CPU cores)
workers = multiprocessing.cpu_count() * 2 + 1

# Type de worker
worker_class = "sync"

# Timeout (30 secondes)
timeout = 30

# Keepalive
keepalive = 2

# Logs (avec fallback pour Docker)
log_dir = "/var/log/gunicorn"
if not os.path.exists(log_dir):
    log_dir = "/app/logs" if os.path.exists("/app") else "logs"
    os.makedirs(log_dir, exist_ok=True)

accesslog = os.path.join(log_dir, "sourcing-access.log")
errorlog = os.path.join(log_dir, "sourcing-error.log")
loglevel = "info"

# Process naming
proc_name = "sourcing-system"

# Daemon mode (mettre à False si utilisation avec systemd)
daemon = False

# PID file (avec fallback pour Docker)
pid_dir = "/var/run/gunicorn"
if not os.path.exists(pid_dir):
    pid_dir = "/app/run" if os.path.exists("/app") else "run"
    os.makedirs(pid_dir, exist_ok=True)

pidfile = os.path.join(pid_dir, "sourcing.pid")

# User et group (à adapter selon votre serveur)
# user = "www-data"
# group = "www-data"

# Nombre max de requêtes avant restart d'un worker (prévenir memory leaks)
max_requests = 1000
max_requests_jitter = 50

# Préchargement de l'application
preload_app = True

# Callback au démarrage du serveur
def on_starting(server):
    print("=" * 80)
    print("Démarrage du serveur Gunicorn - Système de Sourcing Permanent")
    print("=" * 80)

def on_reload(server):
    print("Rechargement de l'application...")

def worker_int(worker):
    print(f"Worker {worker.pid} interrompu")

def worker_abort(worker):
    print(f"Worker {worker.pid} abandonné")
