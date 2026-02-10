# 🤖 Telegram AI Message Analyzer - Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Netlify Deployment](#netlify-deployment)
5. [API Documentation](#api-documentation)
6. [Integration Examples](#integration-examples)
7. [Claude/Brave Extension Prompts](#claudebrave-extension-prompts)
8. [Advanced Features](#advanced-features)

---

## Overview

The Telegram AI Message Analyzer is a **modular, AI-powered system** for analyzing Telegram messages using Claude AI. It provides:

- ✅ **Sentiment Analysis** - Detect emotional tone
- ✅ **Smart Categorization** - Auto-categorize messages
- ✅ **Entity Extraction** - Find people, places, dates, URLs, etc.
- ✅ **Summarization** - Generate concise summaries
- ✅ **Action Items** - Extract tasks and deadlines
- ✅ **Conversation Analysis** - Analyze entire threads
- ✅ **Smart Search** - Semantic search across messages
- ✅ **Insights Generation** - Behavioral patterns and trends

### Key Features

🔹 **Portable** - Use standalone or integrate into any project
🔹 **Serverless-Ready** - Deploy to Netlify, Vercel, AWS Lambda
🔹 **Batch Processing** - Analyze thousands of messages efficiently
🔹 **Real-time** - Instant analysis with Claude 3.5 Sonnet/Haiku
🔹 **Modular** - Pick only the features you need

---

## Quick Start

### 1. Installation

```bash
# Clone or download the project
git clone your-repo-url
cd Wallestars

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### 2. Configuration

Edit `.env`:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-your-key-here
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=your_hash_here

# Optional
PORT=3000
NODE_ENV=development
```

### 3. Run Locally

```bash
# Start the server
npm run dev

# Server runs on http://localhost:3000
# Frontend on http://localhost:5173
```

### 4. Test the API

```bash
# Health check
curl http://localhost:3000/api/telegram/analyze/health

# Analyze a message
curl -X POST http://localhost:3000/api/telegram/analyze/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "id": 1,
      "message": "Meeting tomorrow at 3pm to discuss Q4 budget"
    },
    "analysisTypes": ["sentiment", "actionItems"]
  }'
```

---

## Architecture

### Module Structure

```
├── server/
│   ├── services/
│   │   ├── telegramAnalyzer.js      # Core AI analyzer (portable!)
│   │   └── telegramService.js       # Telegram API integration
│   ├── routes/
│   │   ├── telegramAnalysis.js      # Analysis API routes
│   │   └── telegram.js              # Telegram auth routes
│
├── netlify/
│   └── functions/
│       ├── analyze-message.js       # Serverless function (single)
│       └── analyze-batch.js         # Serverless function (batch)
│
├── src/
│   ├── pages/
│   │   ├── TelegramLogin.jsx        # QR/Phone login UI
│   │   └── TelegramSavedMessages.jsx # Message viewer + analyzer
│
└── netlify.toml                     # Netlify config
```

### Core Class: `TelegramMessageAnalyzer`

The heart of the system is a **portable, framework-agnostic class**:

```javascript
import TelegramMessageAnalyzer from './server/services/telegramAnalyzer.js';

const analyzer = new TelegramMessageAnalyzer(ANTHROPIC_API_KEY);

// Analyze single message
const result = await analyzer.analyzeMessage(message, ['sentiment', 'category']);

// Batch analyze
const results = await analyzer.analyzeMessages(messages, {
  analysisTypes: ['all'],
  batchSize: 10
});

// Smart search
const searchResults = await analyzer.smartSearch(messages, 'budget planning');

// Generate insights
const insights = await analyzer.generateInsights(messages);
```

---

## Netlify Deployment

### Step 1: Prepare

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login
```

### Step 2: Configure

Create `netlify.toml` (already included):

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[functions]
  node_bundler = "esbuild"
  external_node_modules = ["@anthropic-ai/sdk", "telegram"]
```

### Step 3: Deploy

```bash
# Initialize Netlify
netlify init

# Set environment variables
netlify env:set ANTHROPIC_API_KEY "your-key"
netlify env:set TELEGRAM_API_ID "your-id"
netlify env:set TELEGRAM_API_HASH "your-hash"

# Deploy
netlify deploy --prod
```

### Step 4: Use Serverless Functions

```bash
# Your functions will be available at:
https://your-site.netlify.app/.netlify/functions/analyze-message
https://your-site.netlify.app/.netlify/functions/analyze-batch
```

Example usage:

```javascript
// Analyze a message
const response = await fetch('https://your-site.netlify.app/.netlify/functions/analyze-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Important meeting tomorrow',
    analysisType: 'all'
  })
});

const data = await response.json();
console.log(data.analysis);
```

---

## API Documentation

### Base URL

- **Local**: `http://localhost:3000/api/telegram/analyze`
- **Netlify**: `https://your-site.netlify.app/.netlify/functions`

### Endpoints

#### 1. Analyze Single Message

```
POST /analyze/message
```

**Request:**
```json
{
  "message": {
    "id": 123,
    "message": "Can you send the report by Friday?",
    "date": 1706000000
  },
  "analysisTypes": ["sentiment", "actionItems", "category"]
}
```

**Response:**
```json
{
  "success": true,
  "messageId": 123,
  "analysis": {
    "sentiment": {
      "sentiment": "neutral",
      "confidence": 85,
      "tone": "professional",
      "explanation": "Business request with deadline"
    },
    "actionItems": {
      "tasks": [{
        "task": "Send report",
        "deadline": "Friday",
        "priority": "medium"
      }],
      "hasActionItems": true
    },
    "category": {
      "category": "work",
      "subcategories": ["requests", "deadlines"],
      "tags": ["report", "friday"],
      "priority": "medium"
    }
  }
}
```

#### 2. Batch Analyze

```
POST /analyze/batch
```

**Request:**
```json
{
  "messages": [
    { "id": 1, "message": "Meeting at 3pm" },
    { "id": 2, "message": "Love this new feature!" }
  ],
  "analysisTypes": ["sentiment", "category"],
  "batchSize": 10
}
```

**Response:**
```json
{
  "success": true,
  "messages": [...],
  "stats": {
    "sentiments": { "positive": 5, "neutral": 3, "negative": 2 },
    "categories": { "work": 6, "personal": 4 },
    "averageConfidence": 87
  }
}
```

#### 3. Analyze Saved Messages

```
POST /analyze/saved-messages
```

Fetches and analyzes your Telegram saved messages.

**Request:**
```json
{
  "limit": 100,
  "analysisTypes": ["sentiment", "category", "entities"]
}
```

#### 4. Analyze Conversation Thread

```
POST /analyze/conversation
```

Analyzes a conversation thread.

**Request:**
```json
{
  "messages": [
    { "id": 1, "message": "What do you think about the proposal?" },
    { "id": 2, "message": "I think we should proceed" },
    { "id": 3, "message": "Great, let's finalize by Friday" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "topics": ["proposal discussion", "decision making"],
    "decisions": ["Proceed with proposal"],
    "actionItems": ["Finalize by Friday"],
    "sentimentProgression": "neutral → positive → decisive",
    "summary": "Team discussed and decided to proceed with proposal, deadline Friday"
  }
}
```

#### 5. Smart Search

```
POST /analyze/smart-search
```

Semantic search using AI.

**Request:**
```json
{
  "query": "important meetings next week",
  "limit": 100
}
```

**Response:**
```json
{
  "success": true,
  "query": "important meetings next week",
  "results": [
    {
      "messageId": "456",
      "relevance": "high",
      "reason": "Mentions team meeting scheduled for Tuesday"
    }
  ]
}
```

#### 6. Generate Insights

```
POST /analyze/insights
```

Generate behavioral insights from your messages.

**Request:**
```json
{
  "limit": 500
}
```

**Response:**
```json
{
  "success": true,
  "insights": {
    "patterns": "Most active on weekdays between 9am-5pm",
    "insights": [
      "Frequent work-related discussions",
      "High priority task tracking",
      "Regular financial tracking"
    ],
    "recommendations": [
      "Create separate categories for work/personal",
      "Set up automated task reminders",
      "Archive old messages monthly"
    ],
    "trends": [
      "Increasing work-related messages",
      "More action items detected recently"
    ]
  }
}
```

---

## Integration Examples

### React Component

```jsx
import React, { useState } from 'react';

function MessageAnalyzer() {
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeMessage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/telegram/analyze/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: { id: Date.now(), message },
          analysisTypes: ['all']
        })
      });

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message to analyze..."
      />
      <button onClick={analyzeMessage} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {analysis && (
        <div>
          <h3>Sentiment: {analysis.sentiment?.sentiment}</h3>
          <h3>Category: {analysis.category?.category}</h3>
          <h3>Summary: {analysis.summary?.summary}</h3>
        </div>
      )}
    </div>
  );
}
```

### Node.js Script

```javascript
import TelegramMessageAnalyzer from './server/services/telegramAnalyzer.js';

const analyzer = new TelegramMessageAnalyzer(process.env.ANTHROPIC_API_KEY);

// Analyze your data
const messages = [
  { id: 1, message: 'Project deadline next Friday' },
  { id: 2, message: 'Love the new design!' }
];

const results = await analyzer.analyzeMessages(messages, {
  analysisTypes: ['sentiment', 'category', 'actionItems'],
  batchSize: 10
});

console.log(results.stats);
```

### Python Integration (via API)

```python
import requests

def analyze_message(text):
    response = requests.post(
        'https://your-site.netlify.app/.netlify/functions/analyze-message',
        json={
            'message': text,
            'analysisType': 'all'
        }
    )
    return response.json()

result = analyze_message('Meeting tomorrow at 3pm')
print(f"Sentiment: {result['analysis']['sentiment']['sentiment']}")
print(f"Category: {result['analysis']['category']['category']}")
```

---

## Claude/Brave Extension Prompts

### Use Case 1: Personal Message Assistant

**Prompt for Claude:**

```
You are a personal message assistant analyzing Telegram saved messages.

User's saved messages:
[paste messages here]

Tasks:
1. Categorize all messages (work/personal/finance/shopping/etc.)
2. Extract all action items with deadlines
3. Identify important people mentioned
4. Summarize key information by category
5. Highlight urgent items needing attention

Format as:
## Action Items
- [list with deadlines]

## By Category
### Work
- [summaries]

### Personal
- [summaries]

## Important Contacts
- [people mentioned frequently]

## Urgent Attention
- [items needing immediate action]
```

### Use Case 2: Research & Knowledge Extraction

**Prompt for Claude:**

```
Analyze these Telegram messages as a knowledge base:

Messages:
[paste messages]

Extract:
1. All URLs/links (categorize by topic)
2. Key facts, statistics, quotes
3. People/organizations mentioned
4. Dates and events
5. Create a searchable index

Organize as:
## Resource Library
### By Topic
- [categorized links]

## Key Information
- Facts: [list]
- Statistics: [list]
- Notable Quotes: [list]

## Timeline
- [chronological events]

## Entity Index
- People: [list]
- Organizations: [list]
```

### Use Case 3: Productivity Optimizer

**Prompt for Claude:**

```
Analyze my Telegram usage patterns:

Messages (last 30 days):
[paste message data]

Analyze and provide:
1. Peak activity times
2. Most common message types
3. Recurring action items
4. Time spent on different categories
5. Productivity insights
6. Optimization recommendations

Format as:
## Usage Patterns
[analysis]

## Time Investment
[breakdown by category]

## Recommendations
1. [specific actionable advice]
2. [automation opportunities]
3. [organization improvements]
```

### Use Case 4: Sentiment Tracker

**Prompt for Claude:**

```
Track my emotional well-being through message sentiment:

Messages:
[paste messages with dates]

Provide:
1. Sentiment trend over time (graph description)
2. Triggers for negative sentiment
3. Positive sentiment patterns
4. Overall emotional health assessment
5. Recommendations for balance

Format:
## Sentiment Timeline
[daily/weekly breakdown]

## Positive Triggers
[what makes you happy]

## Stress Indicators
[warning signs]

## Well-being Score
[1-10 with explanation]

## Recommendations
[actionable advice]
```

### Use Case 5: Business Intelligence

**Prompt for Claude:**

```
Extract business insights from my Telegram messages:

Messages:
[paste business-related messages]

Extract:
1. Deals/opportunities mentioned
2. Client interactions summary
3. Project status updates
4. Financial mentions
5. Partnership discussions
6. Market intelligence

Organize as:
## Opportunities
- [list with priority]

## Client Activity
- [summaries by client]

## Projects
- [status tracking]

## Financial Data
- [mentions of money, budgets]

## Strategic Insights
- [patterns and recommendations]
```

---

## Advanced Features

### Custom Analysis Prompts

Extend the analyzer with custom prompts:

```javascript
async function customAnalysis(message, customPrompt) {
  const analyzer = new TelegramMessageAnalyzer(API_KEY);

  const prompt = `
    ${customPrompt}

    Message: "${message.message}"

    Provide analysis in JSON format.
  `;

  const response = await analyzer.anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });

  return analyzer.parseJSON(response.content[0].text);
}

// Example: Detect spam
const spamAnalysis = await customAnalysis(message,
  "Is this message spam? Return: { \"isSpam\": true/false, \"confidence\": 0-100, \"reason\": \"...\" }"
);
```

### Webhooks Integration

Set up webhooks for real-time analysis:

```javascript
// In your Telegram bot
bot.on('message', async (msg) => {
  const analysis = await fetch('/.netlify/functions/analyze-message', {
    method: 'POST',
    body: JSON.stringify({ message: msg.text })
  }).then(r => r.json());

  // Act on analysis
  if (analysis.actionItems?.hasActionItems) {
    sendNotification(msg.chat.id, 'Action items detected!');
  }
});
```

### Export & Reporting

```javascript
async function generateReport(messages) {
  const analyzer = new TelegramMessageAnalyzer(API_KEY);

  const analysis = await analyzer.analyzeMessages(messages);
  const insights = await analyzer.generateInsights(messages);

  // Generate PDF, CSV, or JSON report
  const report = {
    generatedAt: new Date().toISOString(),
    totalMessages: messages.length,
    analysis: analysis.stats,
    insights,
    messages: analysis.messages
  };

  return report;
}
```

---

## Performance Tips

1. **Batch Processing**: Use batch analysis for 10+ messages
2. **Model Selection**: Use `haiku` for speed, `sonnet` for quality
3. **Caching**: Cache frequently analyzed messages
4. **Rate Limiting**: Respect Anthropic API rate limits
5. **Parallel Processing**: Use `Promise.all()` for independent analyses

---

## Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Validate input** - Sanitize user messages before analysis
3. **Rate limiting** - Implement request throttling
4. **Data privacy** - Don't store sensitive data
5. **HTTPS only** - Always use secure connections

---

## Troubleshooting

### Common Issues

**Issue**: "API key not configured"
- **Solution**: Set `ANTHROPIC_API_KEY` in `.env`

**Issue**: "Telegram connection failed"
- **Solution**: Check `TELEGRAM_API_ID` and `TELEGRAM_API_HASH`

**Issue**: "Analysis timeout"
- **Solution**: Reduce batch size or use faster model

**Issue**: "JSON parse error"
- **Solution**: Update prompts to ensure valid JSON output

---

## Support & Resources

- **Documentation**: This file
- **Example Code**: `/server/services/telegramAnalyzer.js`
- **API Reference**: See API Documentation section
- **Netlify Docs**: https://docs.netlify.com/functions/overview/
- **Claude API**: https://docs.anthropic.com/

---

## License

MIT License - Use freely in your projects!

---

**Built with ❤️ using Claude AI and Telegram API**
