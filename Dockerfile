# Dockerfile - Système de Sourcing Permanent
# RT-Technologie

FROM python:3.11-slim

# Métadonnées
LABEL maintainer="RT-Technologie"
LABEL description="Système de Sourcing Permanent pour Usine Agroalimentaire"
LABEL version="1.0"

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Créer utilisateur non-root
RUN useradd -m -u 1000 sourcing && \
    mkdir -p /app /var/log/gunicorn /var/run/gunicorn && \
    chown -R sourcing:sourcing /app /var/log/gunicorn /var/run/gunicorn

# Définir le répertoire de travail
WORKDIR /app

# Copier requirements et installer dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY --chown=sourcing:sourcing . .

# Passer à l'utilisateur non-root
USER sourcing

# Exposer le port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/', timeout=5)" || exit 1

# Commande de démarrage
CMD ["gunicorn", "--config", "gunicorn_config.py", "wsgi:application"]
