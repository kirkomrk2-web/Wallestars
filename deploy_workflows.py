import os
import json
import requests
import sys

# Configuration
ENV_FILE = '.env'
WORKFLOWS = [
    'n8n-workflows/duoplus-sms-worker-improved.json',
    'n8n-workflows/email-otp-extractor.json',
    'n8n-workflows/wallester-registration-agent-v3.json'
]

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

    if not api_key:
        print("Error: N8N_API_KEY not found in .env")
        return
    if not base_url:
        print("Error: N8N_URL not found in .env")
        return

    # Ensure URL doesn't end with slash
    base_url = base_url.rstrip('/')
    endpoint = f"{base_url}/api/v1/workflows"
    
    headers = {
        'X-N8N-API-KEY': api_key,
        'Content-Type': 'application/json'
    }

    print(f"Deploying to {base_url}...")

    for file_path in WORKFLOWS:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue

        print(f"Reading {file_path}...")
        try:
            with open(file_path, 'r') as f:
                workflow_data = json.load(f)
            
            # n8n API expects the workflow object directly. 
            # If the file is an array (from UI export sometimes), we might need to handle it.
            # Usually export is a single object { "name": ..., "nodes": ... }
            
            # We also might want to check if it already exists to update it, 
            # but simpler is to just create it (POST) and let user delete old ones, 
            # or use PUT if we knew the ID. Since we don't know IDs, we POST.
            
            response = requests.post(endpoint, headers=headers, json=workflow_data)
            
            if response.status_code == 200:
                res_json = response.json()
                print(f"✅ Successfully imported: {workflow_data.get('name', 'Unknown')}")
                print(f"   ID: {res_json.get('id')}")
            else:
                print(f"❌ Failed to import: {file_path}")
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text}")

        except Exception as e:
            print(f"❌ Exception processing {file_path}: {str(e)}")

if __name__ == '__main__':
    deploy()
