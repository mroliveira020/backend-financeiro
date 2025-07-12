from flask import Blueprint
from flask_cors import CORS

dashboard_bp = Blueprint('dashboard', __name__)

# Libera o CORS apenas para as rotas do dashboard
CORS(dashboard_bp, resources={r"/*": {"origins": "http://localhost:5173"}})

from . import routes