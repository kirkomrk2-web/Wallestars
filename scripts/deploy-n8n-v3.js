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
        const res = await api.post('/credentials', { name, type, data });
        console.log(`✅ Created credential ${name} (ID: ${res.data.id})`);
        return res.data.id;
    } catch (e) {
        if (e.response?.status === 409 || e.response?.data?.message?.includes('already exists')) {
            console.log(`⚠️ Credential ${name} exists. Fetching ID...`);
            try {
                const list = await api.get('/credentials');
                const found = list.data.data.find(c => c.name === name);
                if (found) return found.id;
            } catch (err) { }
        }
        console.error(`❌ Failed/Skipped credential ${name}:`, e.response?.data?.message || e.message);
        return null; // Return null to indicate failure/skip
    }
}

async function importWorkflow(filePath, credentialMappings, workflowIdMappings = {}) {
    try {
        const fullPath = path.resolve(filePath);
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ File not found: ${filePath}`);
            return null;
        }

        let content = fs.readFileSync(fullPath, 'utf8');

        // Replace mappings
        for (const [placeholder, id] of Object.entries(credentialMappings)) {
            if (id) content = content.replace(new RegExp(placeholder, 'g'), id);
        }
        for (const [placeholder, id] of Object.entries(workflowIdMappings)) {
            if (id) content = content.replace(new RegExp(placeholder, 'g'), id);
        }

        let workflow = JSON.parse(content);
        if (workflow.tags) delete workflow.tags;

        console.log(`Reading workflow: ${workflow.name} (Nodes: ${workflow.nodes?.length})`);

        // Check if exists
        let existingId = null;
        try {
            const list = await api.get('/workflows');
            const found = list.data.data.find(w => w.name === workflow.name);
            if (found) existingId = found.id;
        } catch (_) { }

        let finalId;
        const payload = {
            name: workflow.name,
            nodes: workflow.nodes,
            connections: workflow.connections,
            settings: workflow.settings,
            staticData: workflow.staticData
        };

        if (existingId) {
            await api.put(`/workflows/${existingId}`, payload);
            console.log(`✅ Updated workflow: ${workflow.name} (ID: ${existingId})`);
            finalId = existingId;
        } else {
            const res = await api.post('/workflows', payload);
            console.log(`✅ Created workflow: ${workflow.name} (ID: ${res.data.id})`);
            finalId = res.data.id;
        }

        await api.post(`/workflows/${finalId}/activate`);
        console.log(`🚀 Activated workflow: ${workflow.name}`);
        return finalId;

    } catch (e) {
        console.error(`❌ Failed to import ${filePath}:`, e.response?.data || e.message);
        return null;
    }
}

async function main() {
    console.log('🔄 Deploying V3 Workflows...');

    // 1. Credentials
    const supabaseId = await createCredential('Supabase Wallestars', 'supabaseApi', {
        url: process.env.SUPABASE_URL,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        allowedDomains: [] // Fix for validation error
    });

    const airtopId = await createCredential('Airtop API Key', 'httpHeaderAuth', {
        name: 'Authorization',
        value: `Bearer ${process.env.AIRTOP_API_KEY}`
    });

    // Slack (Optional - removed strict Validation check by just not sending if not critical)
    // Or try creating with just token if type is slackApi
    const slackId = await createCredential('Slack Wallestars', 'slackApi', {
        token: process.env.SLACK_BOT_TOKEN
    });

    let gmailId = null;
    try {
        const list = await api.get('/credentials');
        const found = list.data.data.find(c => c.name === 'Gmail Wallestars');
        if (found) gmailId = found.id;
    } catch (e) { }

    const credMappings = {};
    if (supabaseId) credMappings['SUPABASE_CRED_ID'] = supabaseId;
    if (airtopId) credMappings['AIRTOP_API_KEY'] = airtopId;
    if (slackId) credMappings['SLACK_CRED_ID'] = slackId;
    if (gmailId) credMappings['YOUR_CREDENTIAL_ID'] = gmailId;

    // 2. Import Workers First (to get IDs)
    const smsWorkerId = await importWorkflow('n8n-workflows/duoplus-sms-worker-improved.json', credMappings);
    const emailWorkerId = await importWorkflow('n8n-workflows/email-otp-extractor.json', credMappings);

    // 3. Map Worker IDs
    const wfMappings = {};
    // Map the string placeholders to IDs
    if (smsWorkerId) wfMappings['duoplus-sms-worker-improved'] = smsWorkerId;
    if (emailWorkerId) wfMappings['email-otp-extractor'] = emailWorkerId;

    // 4. Import Main V3
    await importWorkflow('n8n-workflows/wallester-registration-agent-v3.json', credMappings, wfMappings);

    console.log('\n✅ Deployment Script Finished.');
}

main();
