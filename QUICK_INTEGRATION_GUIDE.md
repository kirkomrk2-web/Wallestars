# ⚡ Quick Integration Guide - Add to Any Netlify Project

## 5-Minute Setup

### Step 1: Copy Files

Copy these files to your project:

```bash
# Core analyzer (framework-agnostic)
cp server/services/telegramAnalyzer.js → your-project/lib/

# Netlify functions
cp netlify/functions/analyze-message.js → your-project/netlify/functions/
cp netlify/functions/analyze-batch.js → your-project/netlify/functions/
```

### Step 2: Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### Step 3: Set Environment Variables

In Netlify dashboard or CLI:

```bash
netlify env:set ANTHROPIC_API_KEY "sk-ant-your-key"
```

### Step 4: Deploy

```bash
netlify deploy --prod
```

### Step 5: Use It!

```javascript
// In your app
const response = await fetch('/.netlify/functions/analyze-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Your message here',
    analysisType: 'all'
  })
});

const { analysis } = await response.json();
console.log(analysis.sentiment); // { sentiment: 'positive', confidence: 95, ... }
```

---

## Integration Examples

### Next.js

```typescript
// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import TelegramMessageAnalyzer from '@/lib/telegramAnalyzer';

export async function POST(request: Request) {
  const { message } = await request.json();

  const analyzer = new TelegramMessageAnalyzer(process.env.ANTHROPIC_API_KEY!);
  const analysis = await analyzer.analyzeMessage(message, ['sentiment', 'category']);

  return NextResponse.json({ analysis });
}
```

### SvelteKit

```javascript
// src/routes/api/analyze/+server.js
import { json } from '@sveltejs/kit';
import TelegramMessageAnalyzer from '$lib/telegramAnalyzer';

export async function POST({ request }) {
  const { message } = await request.json();

  const analyzer = new TelegramMessageAnalyzer(import.meta.env.VITE_ANTHROPIC_API_KEY);
  const analysis = await analyzer.analyzeMessage(message);

  return json({ analysis });
}
```

### Astro

```astro
---
// src/pages/api/analyze.json.ts
import type { APIRoute } from 'astro';
import TelegramMessageAnalyzer from '../../lib/telegramAnalyzer';

export const POST: APIRoute = async ({ request }) => {
  const { message } = await request.json();

  const analyzer = new TelegramMessageAnalyzer(import.meta.env.ANTHROPIC_API_KEY);
  const analysis = await analyzer.analyzeMessage(message);

  return new Response(JSON.stringify({ analysis }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
---
```

### Remix

```typescript
// app/routes/api.analyze.tsx
import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import TelegramMessageAnalyzer from '~/lib/telegramAnalyzer';

export const action: ActionFunction = async ({ request }) => {
  const { message } = await request.json();

  const analyzer = new TelegramMessageAnalyzer(process.env.ANTHROPIC_API_KEY!);
  const analysis = await analyzer.analyzeMessage(message);

  return json({ analysis });
};
```

### Vanilla JS (Static Site)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Message Analyzer</title>
</head>
<body>
  <textarea id="message" placeholder="Enter message..."></textarea>
  <button onclick="analyze()">Analyze</button>
  <div id="result"></div>

  <script>
    async function analyze() {
      const message = document.getElementById('message').value;

      const response = await fetch('/.netlify/functions/analyze-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          analysisType: 'all'
        })
      });

      const { analysis } = await response.json();

      document.getElementById('result').innerHTML = `
        <h3>Sentiment: ${analysis.sentiment.sentiment}</h3>
        <p>Category: ${analysis.category.category}</p>
        <p>Summary: ${analysis.summary.summary}</p>
      `;
    }
  </script>
</body>
</html>
```

---

## Frontend Components

### React Component

```jsx
import { useState } from 'react';

export function MessageAnalyzer() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/analyze-message', {
        method: 'POST',
        body: JSON.stringify({ message, analysisType: 'all' })
      });
      const data = await res.json();
      setResult(data.analysis);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyzer">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message to analyze..."
        rows={4}
      />
      <button onClick={analyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {result && (
        <div className="results">
          <div className="result-item">
            <strong>Sentiment:</strong>
            <span className={`sentiment-${result.sentiment.sentiment}`}>
              {result.sentiment.sentiment} ({result.sentiment.confidence}%)
            </span>
          </div>

          <div className="result-item">
            <strong>Category:</strong>
            <span>{result.category.category}</span>
            <div className="tags">
              {result.category.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="result-item">
            <strong>Summary:</strong>
            <p>{result.summary.summary}</p>
          </div>

          {result.actionItems.hasActionItems && (
            <div className="result-item">
              <strong>Action Items:</strong>
              <ul>
                {result.actionItems.tasks.map((task, i) => (
                  <li key={i}>
                    {task.task}
                    {task.deadline && ` - Due: ${task.deadline}`}
                    <span className={`priority-${task.priority}`}>
                      {task.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.entities && (
            <div className="result-item">
              <strong>Detected Entities:</strong>
              {result.entities.people.length > 0 && (
                <div>People: {result.entities.people.join(', ')}</div>
              )}
              {result.entities.urls.length > 0 && (
                <div>Links: {result.entities.urls.join(', ')}</div>
              )}
              {result.entities.dates.length > 0 && (
                <div>Dates: {result.entities.dates.join(', ')}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Vue Component

```vue
<template>
  <div class="analyzer">
    <textarea
      v-model="message"
      placeholder="Type message to analyze..."
      rows="4"
    />
    <button @click="analyze" :disabled="loading">
      {{ loading ? 'Analyzing...' : 'Analyze' }}
    </button>

    <div v-if="result" class="results">
      <div class="result-item">
        <strong>Sentiment:</strong>
        <span :class="`sentiment-${result.sentiment.sentiment}`">
          {{ result.sentiment.sentiment }} ({{ result.sentiment.confidence }}%)
        </span>
      </div>

      <div class="result-item">
        <strong>Category:</strong> {{ result.category.category }}
      </div>

      <div class="result-item">
        <strong>Summary:</strong> {{ result.summary.summary }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const message = ref('');
const result = ref(null);
const loading = ref(false);

const analyze = async () => {
  loading.value = true;
  try {
    const res = await fetch('/.netlify/functions/analyze-message', {
      method: 'POST',
      body: JSON.stringify({ message: message.value, analysisType: 'all' })
    });
    const data = await res.json();
    result.value = data.analysis;
  } finally {
    loading.value = false;
  }
};
</script>
```

### Svelte Component

```svelte
<script>
  let message = '';
  let result = null;
  let loading = false;

  async function analyze() {
    loading = true;
    try {
      const res = await fetch('/.netlify/functions/analyze-message', {
        method: 'POST',
        body: JSON.stringify({ message, analysisType: 'all' })
      });
      const data = await res.json();
      result = data.analysis;
    } finally {
      loading = false;
    }
  }
</script>

<div class="analyzer">
  <textarea bind:value={message} placeholder="Type message..." rows="4" />
  <button on:click={analyze} disabled={loading}>
    {loading ? 'Analyzing...' : 'Analyze'}
  </button>

  {#if result}
    <div class="results">
      <div>Sentiment: {result.sentiment.sentiment} ({result.sentiment.confidence}%)</div>
      <div>Category: {result.category.category}</div>
      <div>Summary: {result.summary.summary}</div>
    </div>
  {/if}
</div>
```

---

## Customization

### Add Custom Analysis Types

Edit `netlify/functions/analyze-message.js`:

```javascript
// Add your custom analysis function
async function detectSpam(messageText) {
  const prompt = `Is this spam? "${messageText}"
Return JSON: { "isSpam": true/false, "confidence": 0-100, "reason": "..." }`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(response.content[0].text);
}

// Add to switch statement
case 'spam':
  result = await detectSpam(message);
  break;
```

### Change AI Model

For faster/cheaper analysis, use Haiku:

```javascript
const response = await anthropic.messages.create({
  model: 'claude-3-5-haiku-20241022', // Faster, cheaper
  // model: 'claude-3-5-sonnet-20241022', // Higher quality
  max_tokens: 500,
  messages: [{ role: 'user', content: prompt }]
});
```

---

## Testing

```bash
# Test locally
curl -X POST http://localhost:8888/.netlify/functions/analyze-message \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message", "analysisType": "sentiment"}'

# Test on Netlify
curl -X POST https://your-site.netlify.app/.netlify/functions/analyze-message \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message", "analysisType": "all"}'
```

---

## Performance Optimization

### 1. Use Haiku for Batch Processing

```javascript
// In analyze-batch.js
const response = await anthropic.messages.create({
  model: 'claude-3-5-haiku-20241022', // Much faster!
  max_tokens: 200,
  messages: [{ role: 'user', content: prompt }]
});
```

### 2. Implement Caching

```javascript
const cache = new Map();

function getCachedAnalysis(messageHash) {
  return cache.get(messageHash);
}

function cacheAnalysis(messageHash, analysis) {
  cache.set(messageHash, analysis);
  setTimeout(() => cache.delete(messageHash), 3600000); // 1 hour
}
```

### 3. Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20 // 20 requests per minute
});

app.use('/api/analyze', limiter);
```

---

## Costs Estimation

### Anthropic API Pricing (as of 2024)

- **Claude 3.5 Sonnet**: $3 per million input tokens, $15 per million output tokens
- **Claude 3.5 Haiku**: $0.25 per million input tokens, $1.25 per million output tokens

### Example Costs

**Analyzing 1000 messages with Sonnet:**
- Average: 200 tokens input + 300 tokens output per message
- Cost: ~$0.60

**Analyzing 1000 messages with Haiku:**
- Cost: ~$0.05

**Recommendation:** Use Haiku for batch analysis, Sonnet for detailed single-message analysis.

---

## Troubleshooting

### Function Timeout

Netlify functions have a 10-second timeout. For large batches:

```javascript
// Split into smaller batches
const BATCH_SIZE = 5; // Process 5 at a time
const batches = createBatches(messages, BATCH_SIZE);
```

### CORS Issues

Add to `netlify.toml`:

```toml
[[headers]]
  for = "/.netlify/functions/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "POST, OPTIONS"
```

### Memory Issues

Reduce batch size or use streaming:

```javascript
// Process in smaller chunks
for (let i = 0; i < messages.length; i += 10) {
  const chunk = messages.slice(i, i + 10);
  await processChunk(chunk);
}
```

---

## Next Steps

1. ✅ Copy files to your project
2. ✅ Install dependencies
3. ✅ Set environment variables
4. ✅ Test locally with `netlify dev`
5. ✅ Deploy to Netlify
6. ✅ Integrate into your app
7. ✅ Customize analysis types
8. ✅ Add your own features!

**Questions?** Check the full guide: `TELEGRAM_AI_ANALYZER_GUIDE.md`
