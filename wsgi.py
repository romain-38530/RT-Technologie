#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
WSGI Configuration pour Production
Système de Sourcing Permanent - RT-Technologie
"""

import sys
import os

# Ajouter le répertoire du projet au PYTHONPATH
project_home = os.path.dirname(os.path.abspath(__file__))
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Importer l'application Flask
from web_app import app as application

if __name__ == "__main__":
    application.run()
