import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

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
        // Try to create directly
        const res = await api.post('/credentials', {
            name,
            type,
            data
        });
        console.log(`✅ Created credential ${name} (ID: ${res.data.id})`);
        return res.data.id;
    } catch (e) {
        // If 409 conflict or similar, try to find existing
        if (e.response?.status === 409 || e.response?.data?.message?.includes('already exists')) {
            console.log(`⚠️ Credential ${name} might already exist. Attempting to match...`);
            // We can't list credentials easily if GET fails, so we might have to assume manual intervention or fix GET
            // Let's try to list again just in case
            try {
                const list = await api.get('/credentials');
                const found = list.data.data.find(c => c.name === name);
                if (found) return found.id;
            } catch (err) {
                console.log('Could not list credentials.');
            }
        }

        console.error(`❌ Failed to create credential ${name}:`, e.response?.data || e.message);
        return null;
    }
}

async function importWorkflow(filePath, credentialMappings) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let workflow = JSON.parse(content);

        // Replace credential IDs in the workflow JSON
        let jsonString = JSON.stringify(workflow);
        for (const [placeholder, id] of Object.entries(credentialMappings)) {
            if (id) {
                jsonString = jsonString.replace(new RegExp(placeholder, 'g'), id);
            }
        }
        workflow = JSON.parse(jsonString);

        // Remove tags for now to avoid errors
        delete workflow.tags;

        // Check if exists
        let existingId = null;
        try {
            const list = await api.get('/workflows');
            const found = list.data.data.find(w => w.name === workflow.name);
            if (found) existingId = found.id;
        } catch (e) {
            console.log('Could not list workflows to check existence.');
        }

        if (existingId) {
            // Update
            await api.put(`/workflows/${existingId}`, {
                nodes: workflow.nodes,
                connections: workflow.connections,
                settings: workflow.settings,
                staticData: workflow.staticData
                // tags removed
            });
            console.log(`✅ Updated workflow: ${workflow.name} (ID: ${existingId})`);
            await api.post(`/workflows/${existingId}/activate`);
            console.log(`🚀 Activated workflow: ${workflow.name}`);
        } else {
            // Create
            const res = await api.post('/workflows', {
                name: workflow.name,
                nodes: workflow.nodes,
                connections: workflow.connections,
                settings: workflow.settings,
                // tags removed
            });
            console.log(`✅ Created workflow: ${workflow.name} (ID: ${res.data.id})`);

            await api.post(`/workflows/${res.data.id}/activate`);
            console.log(`🚀 Activated workflow: ${workflow.name}`);
        }

    } catch (e) {
        console.error(`❌ Failed to import workflow from ${filePath}:`, e.response?.data || e.message);
    }
}

async function main() {
    console.log('🔄 Starting n8n Setup (Retry)...');

    // 1. Create Credentials
    const supabaseId = await createCredential('Supabase Wallestars', 'supabaseApi', {
        url: process.env.SUPABASE_URL,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    const anthropicId = await createCredential('Anthropic Claude', 'anthropicApi', {
        apiKey: process.env.ANTHROPIC_API_KEY
    });

    const airtopId = await createCredential('Airtop API Key', 'httpHeaderAuth', {
        name: 'Authorization',
        value: `Bearer ${process.env.AIRTOP_API_KEY}`
    });

    const slackId = await createCredential('Slack Wallestars', 'slackApi', {
        token: process.env.SLACK_BOT_TOKEN || 'REDACTED-placeholder'
    });

    const mappings = {};
    if (supabaseId) mappings['SUPABASE_CRED_ID'] = supabaseId;
    if (anthropicId) mappings['ANTHROPIC_CRED_ID'] = anthropicId;
    if (airtopId) mappings['AIRTOP_CRED_ID'] = airtopId;
    if (slackId) mappings['SLACK_CRED_ID'] = slackId;

    // 2. Import Workflows
    await importWorkflow('n8n-workflows/airtop-session-manager.json', mappings);
    await importWorkflow('n8n-workflows/wallester-registration-agent.json', mappings);

    console.log('✅ Setup Complete!');
}

main();
