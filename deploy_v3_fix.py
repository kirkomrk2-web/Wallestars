import os
import json
import requests
import sys

# Configuration
ENV_FILE = '.env'
FILE_PATH = 'n8n-workflows/wallester-registration-agent-v3.json'

def load_env():
    config = {}
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    config[key.strip()] = value.strip()
    return config

def deploy():
    config = load_env()
    api_key = config.get('N8N_API_KEY')
    base_url = config.get('N8N_URL')

    if not api_key or not base_url:
        print("Error: Credentials missing")
        return

    base_url = base_url.rstrip('/')
    endpoint = f"{base_url}/api/v1/workflows"
    
    headers = {
        'X-N8N-API-KEY': api_key,
        'Content-Type': 'application/json'
    }

    print(f"Reading {FILE_PATH}...")
    try:
        with open(FILE_PATH, 'r') as f:
            workflow_data = json.load(f)
        
        # FIX: Remove tags
        if 'tags' in workflow_data:
            print("Removing 'tags' field...")
            del workflow_data['tags']
        
        response = requests.post(endpoint, headers=headers, json=workflow_data)
        
        if response.status_code == 200:
            res_json = response.json()
            print(f"✅ Successfully imported: {workflow_data.get('name', 'Unknown')}")
            print(f"   ID: {res_json.get('id')}")
        else:
            print(f"❌ Failed to import: {FILE_PATH}")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")

    except Exception as e:
        print(f"❌ Exception: {str(e)}")

if __name__ == '__main__':
    deploy()
