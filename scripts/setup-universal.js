import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const N8N_HOST = process.env.N8N_URL || 'https://n8n.srv1201204.hstgr.cloud';
const API_KEY = process.env.N8N_API_KEY;

if (!API_KEY) {
    console.error('❌ N8N_API_KEY is missing');
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
        const res = await api.post('/credentials', { name, type, data });
        console.log(`✅ Created credential ${name} (ID: ${res.data.id})`);
        return res.data.id;
    } catch (e) {
        if (e.response?.status === 409) {
            console.log(`⚠️ Credential ${name} exists. Fetching ID...`);
            const list = await api.get('/credentials');
            const found = list.data.data.find(c => c.name === name);
            if (found) return found.id;
        }
        console.error(`❌ Failed to create credential ${name}:`, e.message);
        return null;
    }
}

async function importWorkflow(filePath, credentialMappings) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let workflow = JSON.parse(content);

        let jsonString = JSON.stringify(workflow);
        for (const [placeholder, id] of Object.entries(credentialMappings)) {
            if (id) {
                jsonString = jsonString.replace(new RegExp(placeholder, 'g'), id);
            }
        }
        workflow = JSON.parse(jsonString);
        delete workflow.tags;

        // Check/Update
        let existingId = null;
        try {
            const list = await api.get('/workflows');
            const found = list.data.data.find(w => w.name === workflow.name);
            if (found) existingId = found.id;
        } catch (_) { }

        let workflowId;
        if (existingId) {
            await api.put(`/workflows/${existingId}`, {
                nodes: workflow.nodes,
                connections: workflow.connections,
                settings: workflow.settings,
                staticData: workflow.staticData
            });
            console.log(`✅ Updated workflow: ${workflow.name} (ID: ${existingId})`);
            workflowId = existingId;
        } else {
            const res = await api.post('/workflows', {
                name: workflow.name,
                nodes: workflow.nodes,
                connections: workflow.connections,
                settings: workflow.settings
            });
            console.log(`✅ Created workflow: ${workflow.name} (ID: ${res.data.id})`);
            workflowId = res.data.id;
        }

        await api.post(`/workflows/${workflowId}/activate`);
        console.log(`🚀 Activated workflow: ${workflow.name}`);

        // Execute it!
        console.log(`▶️ Executing workflow...`);
        try {
            const exec = await api.post(`/workflows/${workflowId}/execute`);
            console.log(`🎉 Execution started! ID: ${exec.data.id}`);
        } catch (ex) {
            console.log(`⚠️ Could not trigger execution automatically (maybe manual trigger only). Please click Execute in UI.`);
        }

    } catch (e) {
        console.error(`❌ Error importing ${filePath}:`);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', JSON.stringify(e.response.data, null, 2));
        } else {
            console.error(e.message);
        }
    }
}

async function main() {
    console.log('🔄 Setting up Universal Agent...');

    // Airtop Credential
    // Note: The genericAuthType is httpHeaderAuth
    const airtopId = await createCredential('Airtop API Key', 'httpHeaderAuth', {
        name: 'Authorization',
        value: `Bearer ${process.env.AIRTOP_API_KEY}`
    });

    const mappings = {};
    if (airtopId) mappings['AIRTOP_API_KEY'] = airtopId; // Matches the placeholder in json

    await importWorkflow('n8n-workflows/universal-registration-agent.json', mappings);
}

main();
