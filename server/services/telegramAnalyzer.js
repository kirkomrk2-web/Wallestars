import Anthropic from '@anthropic-ai/sdk';

/**
 * Telegram Message AI Analyzer
 * Modular, portable analyzer for Telegram messages using Claude AI
 * Can be easily integrated into any Netlify project
 */

export class TelegramMessageAnalyzer {
  constructor(apiKey) {
    this.anthropic = new Anthropic({ apiKey });
    this.model = 'claude-3-5-sonnet-20241022';
  }

  /**
   * Analyze a single message with AI
   * @param {Object} message - Telegram message object
   * @param {Array} analysisTypes - Types of analysis to perform
   * @returns {Object} Analysis results
   */
  async analyzeMessage(message, analysisTypes = ['all']) {
    const analyses = {};

    if (analysisTypes.includes('all') || analysisTypes.includes('sentiment')) {
      analyses.sentiment = await this.analyzeSentiment(message);
    }

    if (analysisTypes.includes('all') || analysisTypes.includes('category')) {
      analyses.category = await this.categorizeMessage(message);
    }

    if (analysisTypes.includes('all') || analysisTypes.includes('entities')) {
      analyses.entities = await this.extractEntities(message);
    }

    if (analysisTypes.includes('all') || analysisTypes.includes('summary')) {
      analyses.summary = await this.summarizeMessage(message);
    }

    if (analysisTypes.includes('all') || analysisTypes.includes('actionItems')) {
      analyses.actionItems = await this.extractActionItems(message);
    }

    return analyses;
  }

  /**
   * Batch analyze multiple messages
   * @param {Array} messages - Array of Telegram messages
   * @param {Object} options - Analysis options
   */
  async analyzeMessages(messages, options = {}) {
    const {
      analysisTypes = ['all'],
      batchSize = 10,
      includeStats = true
    } = options;

    const results = [];
    const batches = this.createBatches(messages, batchSize);

    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(msg => this.analyzeMessage(msg, analysisTypes))
      );
      results.push(...batchResults);
    }

    if (includeStats) {
      return {
        messages: results,
        stats: this.generateStatistics(results)
      };
    }

    return results;
  }

  /**
   * Analyze sentiment of a message
   */
  async analyzeSentiment(message) {
    const prompt = `Analyze the sentiment of this Telegram message:

Message: "${message.message}"

Provide:
1. Overall sentiment (positive/negative/neutral)
2. Confidence score (0-100)
3. Emotional tone (e.g., happy, sad, angry, excited, professional)
4. Brief explanation

Format as JSON: { "sentiment": "...", "confidence": 0-100, "tone": "...", "explanation": "..." }`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    return this.parseJSON(response.content[0].text);
  }

  /**
   * Categorize message into topics
   */
  async categorizeMessage(message) {
    const prompt = `Categorize this Telegram message:

Message: "${message.message}"

Provide:
1. Primary category (e.g., work, personal, finance, shopping, travel, news, entertainment)
2. Subcategories (up to 3)
3. Tags/keywords (up to 5)
4. Priority level (low/medium/high/urgent)

Format as JSON: { "category": "...", "subcategories": [], "tags": [], "priority": "..." }`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    return this.parseJSON(response.content[0].text);
  }

  /**
   * Extract named entities (people, places, organizations, dates, etc.)
   */
  async extractEntities(message) {
    const prompt = `Extract entities from this Telegram message:

Message: "${message.message}"

Identify:
1. People (names, usernames)
2. Organizations/Companies
3. Locations (cities, countries, addresses)
4. Dates/Times
5. URLs/Links
6. Email addresses
7. Phone numbers
8. Money amounts
9. Products/Services

Format as JSON: { "people": [], "organizations": [], "locations": [], "dates": [], "urls": [], "emails": [], "phones": [], "money": [], "products": [] }`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    });

    return this.parseJSON(response.content[0].text);
  }

  /**
   * Generate a concise summary
   */
  async summarizeMessage(message) {
    if (!message.message || message.message.length < 50) {
      return { summary: message.message, keyPoints: [] };
    }

    const prompt = `Summarize this Telegram message:

Message: "${message.message}"

Provide:
1. One-sentence summary (max 100 chars)
2. Key points (up to 3 bullet points)
3. Main topic

Format as JSON: { "summary": "...", "keyPoints": [], "topic": "..." }`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    return this.parseJSON(response.content[0].text);
  }

  /**
   * Extract action items and tasks
   */
  async extractActionItems(message) {
    const prompt = `Extract action items from this Telegram message:

Message: "${message.message}"

Identify:
1. Tasks to do
2. Deadlines/due dates
3. Assignees (if mentioned)
4. Priority level

Format as JSON: { "tasks": [{ "task": "...", "deadline": "...", "assignee": "...", "priority": "..." }], "hasActionItems": true/false }`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    });

    return this.parseJSON(response.content[0].text);
  }

  /**
   * Advanced: Conversation thread analysis
   */
  async analyzeConversationThread(messages) {
    const conversationText = messages
      .map((m, i) => `[${i + 1}] ${m.message}`)
      .join('\n\n');

    const prompt = `Analyze this Telegram conversation thread:

${conversationText}

Provide:
1. Main topics discussed
2. Key decisions made
3. Action items for participants
4. Sentiment progression (how mood changed)
5. Summary of the conversation

Format as JSON with these fields: { "topics": [], "decisions": [], "actionItems": [], "sentimentProgression": "...", "summary": "..." }`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    return this.parseJSON(response.content[0].text);
  }

  /**
   * Smart search: Semantic search across messages
   */
  async smartSearch(messages, query) {
    const messagesText = messages
      .slice(0, 50) // Limit for token efficiency
      .map((m, i) => `[${m.id}] ${m.message}`)
      .join('\n');

    const prompt = `Given this query: "${query}"

Find the most relevant messages from this list:

${messagesText}

Return the IDs of the top 5 most relevant messages and explain why each is relevant.

Format as JSON: { "results": [{ "messageId": "...", "relevance": "...", "reason": "..." }] }`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    return this.parseJSON(response.content[0].text);
  }

  /**
   * Generate insights from message collection
   */
  async generateInsights(messages) {
    const stats = this.generateBasicStats(messages);

    const prompt = `Analyze these Telegram message statistics and generate insights:

Total messages: ${stats.total}
Text messages: ${stats.textMessages}
Media messages: ${stats.mediaMessages}
Date range: ${stats.dateRange.start} to ${stats.dateRange.end}
Top words: ${stats.topWords.slice(0, 10).map(w => w.word).join(', ')}
Message frequency by day: ${JSON.stringify(stats.messagesByDay)}

Provide:
1. Communication patterns (when user is most active)
2. Behavioral insights (what user saves most)
3. Recommendations (how to better organize saved messages)
4. Trends over time

Format as JSON: { "patterns": "...", "insights": [], "recommendations": [], "trends": [] }`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    });

    return this.parseJSON(response.content[0].text);
  }

  /**
   * Helper: Parse JSON from AI response
   */
  parseJSON(text) {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                       text.match(/```\n([\s\S]*?)\n```/) ||
                       [null, text];

      return JSON.parse(jsonMatch[1] || text);
    } catch (error) {
      console.error('JSON parse error:', error);
      return { error: 'Failed to parse AI response', raw: text };
    }
  }

  /**
   * Helper: Create batches for processing
   */
  createBatches(array, size) {
    const batches = [];
    for (let i = 0; i < array.length; i += size) {
      batches.push(array.slice(i, i + size));
    }
    return batches;
  }

  /**
   * Helper: Generate basic statistics
   */
  generateBasicStats(messages) {
    const stats = {
      total: messages.length,
      textMessages: messages.filter(m => m.message).length,
      mediaMessages: messages.filter(m => m.media).length,
      dateRange: {
        start: new Date(Math.min(...messages.map(m => m.date * 1000))).toISOString(),
        end: new Date(Math.max(...messages.map(m => m.date * 1000))).toISOString()
      },
      topWords: [],
      messagesByDay: {}
    };

    // Word frequency
    const wordCount = {};
    messages.forEach(m => {
      if (m.message) {
        const words = m.message.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 3);

        words.forEach(word => {
          wordCount[word] = (wordCount[word] || 0) + 1;
        });
      }
    });

    stats.topWords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    // Messages by day
    messages.forEach(m => {
      const date = new Date(m.date * 1000).toISOString().split('T')[0];
      stats.messagesByDay[date] = (stats.messagesByDay[date] || 0) + 1;
    });

    return stats;
  }

  /**
   * Generate statistics from analysis results
   */
  generateStatistics(results) {
    const stats = {
      sentiments: { positive: 0, negative: 0, neutral: 0 },
      categories: {},
      totalEntities: 0,
      actionableMessages: 0,
      averageConfidence: 0
    };

    let confidenceSum = 0;
    let confidenceCount = 0;

    results.forEach(result => {
      if (result.sentiment) {
        stats.sentiments[result.sentiment.sentiment]++;
        confidenceSum += result.sentiment.confidence;
        confidenceCount++;
      }

      if (result.category) {
        const cat = result.category.category;
        stats.categories[cat] = (stats.categories[cat] || 0) + 1;
      }

      if (result.entities) {
        stats.totalEntities += Object.values(result.entities)
          .reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      }

      if (result.actionItems && result.actionItems.hasActionItems) {
        stats.actionableMessages++;
      }
    });

    stats.averageConfidence = confidenceCount > 0
      ? Math.round(confidenceSum / confidenceCount)
      : 0;

    return stats;
  }
}

export default TelegramMessageAnalyzer;
