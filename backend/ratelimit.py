from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Limiter singleton; init happens in app.py
limiter = Limiter(key_func=get_remote_address)

