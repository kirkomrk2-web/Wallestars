/**
 * Netlify Function: Batch Analyze Messages
 * Analyze multiple messages efficiently
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { messages, analysisType = 'summary', batchSize = 10 } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages array is required' })
      };
    }

    // Limit batch size
    const limit = Math.min(messages.length, 50);
    const messagesToAnalyze = messages.slice(0, limit);

    // Analyze in smaller batches to avoid timeouts
    const results = [];
    for (let i = 0; i < messagesToAnalyze.length; i += batchSize) {
      const batch = messagesToAnalyze.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(msg => analyzeMessage(msg, analysisType))
      );
      results.push(...batchResults);
    }

    // Generate statistics
    const stats = generateStats(results);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: results.length,
        results,
        stats
      })
    };

  } catch (error) {
    console.error('Batch analysis error:', error);
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

async function analyzeMessage(message, type) {
  const text = message.message || message.text || '';

  if (!text) {
    return { id: message.id, error: 'No text content' };
  }

  try {
    let analysis;

    if (type === 'summary') {
      analysis = await quickSummary(text);
    } else if (type === 'sentiment') {
      analysis = await quickSentiment(text);
    } else if (type === 'category') {
      analysis = await quickCategory(text);
    }

    return {
      id: message.id,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      analysis
    };
  } catch (error) {
    return {
      id: message.id,
      error: error.message
    };
  }
}

async function quickSummary(text) {
  if (text.length < 30) {
    return { summary: text, category: 'short' };
  }

  const prompt = `Summarize in 1 sentence and categorize: "${text.substring(0, 500)}"
JSON: { "summary": "...", "category": "work/personal/finance/shopping/news/entertainment/other" }`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022', // Faster model for batch
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(response.content[0].text);
}

async function quickSentiment(text) {
  const prompt = `Sentiment: "${text.substring(0, 500)}"
JSON: { "sentiment": "positive/negative/neutral", "confidence": 0-100 }`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 150,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(response.content[0].text);
}

async function quickCategory(text) {
  const prompt = `Categorize: "${text.substring(0, 500)}"
JSON: { "category": "work/personal/finance/shopping/news/entertainment/other", "tags": ["tag1", "tag2"] }`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(response.content[0].text);
}

function generateStats(results) {
  const stats = {
    total: results.length,
    successful: results.filter(r => !r.error).length,
    failed: results.filter(r => r.error).length,
    categories: {},
    sentiments: {}
  };

  results.forEach(result => {
    if (result.analysis) {
      if (result.analysis.category) {
        const cat = result.analysis.category;
        stats.categories[cat] = (stats.categories[cat] || 0) + 1;
      }
      if (result.analysis.sentiment) {
        const sent = result.analysis.sentiment;
        stats.sentiments[sent] = (stats.sentiments[sent] || 0) + 1;
      }
    }
  });

  return stats;
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
