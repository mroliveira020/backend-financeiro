import psycopg2
from psycopg2 import extras
import os
from dotenv import load_dotenv

# Carregar variáveis do arquivo .env
load_dotenv()

def conectar():
    """Estabelece conexão com o banco de dados PostgreSQL"""
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT", "5432")  # Usa 5432 como padrão se não estiver no .env
    )
    cur = conn.cursor(cursor_factory=extras.DictCursor)  # Retorna resultados como dicionário
    return conn, cur
