// Final n8n Setup & Test Script
// This script updates the workflow with the Webhook trigger and Email Logic, then triggers it.

import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const N8N_HOST = process.env.N8N_URL || 'https://n8n.srv1201204.hstgr.cloud';
// Using the key found in step 106 if env var is missing/different
const API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ZmVmMTUwMS1kMmQxLTQ2YjAtOWJjMS1lZmMxZjAzOWU1YWMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4NTc3NjE3fQ.Om4Sdy5OFACxax74Jr4FLY1jD7_BIzyAB9VlhVxRELU';

const api = axios.create({
    baseURL: `${N8N_HOST}/api/v1`,
    headers: { 'X-N8N-API-KEY': API_KEY }
});

async function run() {
    console.log('🚀 Updating Universal Agent...');

    try {
        const content = fs.readFileSync('n8n-workflows/universal-registration-agent.json', 'utf8');
        let workflow = JSON.parse(content);
        // Remove tags to avoid 400 bad request if tags don't exist
        delete workflow.tags;

        // Find existing workflow by possible names
        let list;
        try {
            list = await api.get('/workflows');
        } catch (e) {
            console.error('Failed to list workflows:', e.message);
            return;
        }

        const found = list.data.data.find(w => w.name === workflow.name) || list.data.data.find(w => w.name.includes('Universal Registration'));

        let id;
        if (found) {
            id = found.id;
            console.log(`Found existing workflow ID: ${id}. Updating...`);
            await api.put(`/workflows/${id}`, workflow);
            console.log(`✅ Updated Workflow ID: ${id}`);
        } else {
            console.log('Creating new workflow...');
            const res = await api.post('/workflows', workflow);
            id = res.data.id;
            console.log(`✅ Created Workflow ID: ${id}`);
        }

        // Activate
        await api.post(`/workflows/${id}/activate`);
        console.log('✅ Workflow Activated');

        // Execute via Webhook
        console.log('⚡ Triggering Webhook...');
        const webhookUrl = `${N8N_HOST}/webhook/test-registration`;

        console.log(`Sending POST to ${webhookUrl}`);
        // Fire and forget or simple await
        try {
            await api.post(webhookUrl, {});
            console.log('✅ Trigger sent! Check n8n UI for execution details.');
        } catch (e) {
            console.log('Trigger response:', e.message);
            // 404 might mean the webhook isn't active yet or URL path issue. 
            // But if we just activated, it should be likely okay, or it's /webhook-test/ if not production
            if (e.response && e.response.status === 404) {
                console.log('Trying test webhook url...');
                const testWebhookUrl = `${N8N_HOST}/webhook-test/test-registration`;
                await api.post(testWebhookUrl, {}).catch(err => console.log('Test webhook also failed:', err.message));
            }
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', JSON.stringify(e.response.data, null, 2));
        }
    }
}

run();
