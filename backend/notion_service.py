import requests
import json
from config import NOTION_DATABASE_ID, HEADERS

NOTION_API_URL = "https://api.notion.com/v1/databases"

def get_notion_data():
    """Busca os dados do Notion"""
    url = f"https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}/query"
    response = requests.post(url, headers=HEADERS)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.json()}

def add_notion_entry(data):
    """Adiciona um novo registro no Notion"""
    url = "https://api.notion.com/v1/pages"
    payload = {
        "parent": {"database_id": NOTION_DATABASE_ID},
        "properties": {
            "Nome": {
                "title": [{"text": {"content": data["nome"]}}]
            },
            "Valor": {
                "number": data["valor"]
            }
        }
    }
    
    response = requests.post(url, headers=HEADERS, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.json()}

def update_notion_entry(page_id, data):
    """Atualiza um registro no Notion"""
    url = f"https://api.notion.com/v1/pages/{page_id}"
    payload = {
        "properties": {
            "Nome": {
                "title": [{"text": {"content": data["nome"]}}]
            },
            "Valor": {
                "number": data["valor"]
            }
        }
    }
    
    response = requests.patch(url, headers=HEADERS, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.json()}
