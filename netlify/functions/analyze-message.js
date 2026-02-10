/**
 * Netlify Function: Analyze Telegram Message
 * Serverless endpoint for AI-powered message analysis
 *
 * Deploy: netlify deploy --prod
 * Endpoint: /.netlify/functions/analyze-message
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, analysisType = 'all' } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Perform analysis based on type
    let result;

    switch (analysisType) {
      case 'sentiment':
        result = await analyzeSentiment(message);
        break;
      case 'category':
        result = await categorizeMessage(message);
        break;
      case 'entities':
        result = await extractEntities(message);
        break;
      case 'summary':
        result = await summarizeMessage(message);
        break;
      case 'actionItems':
        result = await extractActionItems(message);
        break;
      case 'all':
      default:
        result = await analyzeAll(message);
        break;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: message.substring(0, 100) + '...',
        analysis: result
      })
    };

  } catch (error) {
    console.error('Analysis error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

// Analysis functions
async function analyzeSentiment(messageText) {
  const prompt = `Analyze sentiment: "${messageText}"
Return JSON: { "sentiment": "positive/negative/neutral", "confidence": 0-100, "tone": "...", "explanation": "..." }`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(response.content[0].text);
}

async function categorizeMessage(messageText) {
  const prompt = `Categorize: "${messageText}"
Return JSON: { "category": "...", "subcategories": [], "tags": [], "priority": "low/medium/high/urgent" }`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(response.content[0].text);
}

async function extractEntities(messageText) {
  const prompt = `Extract entities: "${messageText}"
Return JSON: { "people": [], "organizations": [], "locations": [], "dates": [], "urls": [], "emails": [], "phones": [], "money": [], "products": [] }`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(response.content[0].text);
}

async function summarizeMessage(messageText) {
  if (messageText.length < 50) {
    return { summary: messageText, keyPoints: [], topic: 'short message' };
  }

  const prompt = `Summarize: "${messageText}"
Return JSON: { "summary": "one sentence", "keyPoints": ["point1", "point2"], "topic": "..." }`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(response.content[0].text);
}

async function extractActionItems(messageText) {
  const prompt = `Extract action items: "${messageText}"
Return JSON: { "tasks": [{ "task": "...", "deadline": "...", "priority": "..." }], "hasActionItems": true/false }`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(response.content[0].text);
}

async function analyzeAll(messageText) {
  const [sentiment, category, entities, summary, actionItems] = await Promise.all([
    analyzeSentiment(messageText),
    categorizeMessage(messageText),
    extractEntities(messageText),
    summarizeMessage(messageText),
    extractActionItems(messageText)
  ]);

  return { sentiment, category, entities, summary, actionItems };
}

function parseJSON(text) {
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                     text.match(/```\n([\s\S]*?)\n```/) ||
                     [null, text];
    return JSON.parse(jsonMatch[1] || text);
  } catch (error) {
    return { error: 'Parse failed', raw: text };
  }
}
