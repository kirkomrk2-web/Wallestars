import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const N8N_HOST = process.env.N8N_URL || 'https://n8n.srv1201204.hstgr.cloud';
const API_KEY = process.env.N8N_API_KEY;

if (!API_KEY) {
    console.error('❌ N8N_API_KEY is missing in .env');
    process.exit(1);
}

const api = axios.create({
    baseURL: `${N8N_HOST}/api/v1`,
    headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json'
    }
});

async function createCredential(name, type, data) {
    try {
        console.log(`Trying to create ${name}...`);
        const res = await api.post('/credentials', {
            name,
            type,
            data
        });
        console.log(`✅ Created credential ${name} (ID: ${res.data.id})`);
        return res.data.id;
    } catch (e) {
        console.error(`❌ Failed to create credential ${name}:`, e.response?.data?.message || e.message);
        return null;
    }
}

async function main() {
    console.log('🔄 Starting Credential Setup...');

    // 1. AirTop (HTTP Header Auth)
    await createCredential('Airtop API Key', 'httpHeaderAuth', {
        name: 'Authorization',
        value: `Bearer ${process.env.AIRTOP_API_KEY}`
    });

    // 2. Supabase
    // Note: Supabase API credential often requires 'allowedDomains' in some versions
    await createCredential('Supabase Wallestars', 'supabaseApi', {
        url: process.env.SUPABASE_URL,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        allowedDomains: [] // Attempting fix for schema validation error
    });

    // 3. Anthropic
    await createCredential('Anthropic Claude', 'anthropicApi', {
        apiKey: process.env.ANTHROPIC_API_KEY
    });

    // 4. Slack
    await createCredential('Slack Wallestars', 'slackApi', {
        accessToken: process.env.SLACK_BOT_TOKEN
    });

    console.log('Done!');
}

main();
