/**
 * Code Snippets for Terminal Display
 * Real code examples showcasing modern AI development tools and practices
 */

const codeSnippets = [
    {
        id: 'supabase-integration',
        title: '~/projects/supabase-realtime',
        language: 'javascript',
        description: 'Modern backend-as-a-service with real-time subscriptions and auth',
        code: `// Supabase Real-time Integration
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

// Real-time chat subscription
const channel = supabase
  .channel('chat-room')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log('New message:', payload.new)
  })
  .subscribe()

// Send message with auth
const { data, error } = await supabase
  .from('messages')
  .insert({ content: 'Hello world!', user_id: user.id })`
    },
    {
        id: 'crawl4ai-usage',
        title: '~/projects/ai-web-scraper',
        language: 'python',
        description: 'LLM-friendly web crawling for AI data pipelines',
        code: `# Crawl4AI: AI-Powered Web Scraping
import asyncio
from crawl4ai import AsyncWebCrawler
from crawl4ai.extraction_strategy import JsonCssExtractionStrategy

# Define extraction schema
schema = {
    "name": "ProductExtractor",
    "baseSelector": ".product-item",
    "fields": [
        {"name": "title", "selector": "h3.product-title", "type": "text"},
        {"name": "price", "selector": ".price", "type": "text"}
    ]
}

async def scrape_products():
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url="https://example-store.com/products",
            extraction_strategy=JsonCssExtractionStrategy(schema)
        )
        return result.extracted_content

# Extract structured data for AI training
products = await scrape_products()`
    },
    {
        id: 'docker-containerization',
        title: '~/projects/node-docker-app',
        language: 'dockerfile',
        description: 'Production-ready containerization with multi-stage builds',
        code: `# Multi-stage Docker Build for Node.js
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --chown=nextjs:nodejs ./src ./src

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s \\
  CMD node healthcheck.js

CMD ["node", "src/index.js"]`
    },
    {
        id: 'openai-api-integration',
        title: '~/projects/openai-assistant',
        language: 'javascript',
        description: 'OpenAI GPT integration with streaming and function calling',
        code: `// OpenAI API with Streaming & Function Calling
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Stream GPT-4 response with real-time output
const stream = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a helpful coding assistant." },
    { role: "user", content: "Explain async/await in JavaScript" }
  ],
  tools: [{
    type: "function",
    function: {
      name: "search_docs",
      description: "Search technical documentation",
      parameters: { type: "object", properties: { query: { type: "string" } } }
    }
  }],
  stream: true
})

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '')
}`
    },
    {
        id: 'anthropic-claude-api',
        title: '~/projects/claude-integration',
        language: 'javascript',
        description: 'Anthropic Claude API with advanced reasoning and tool use',
        code: `// Anthropic Claude API with Extended Thinking
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Claude 4 with extended thinking capabilities
const message = await anthropic.messages.create({
  model: "claude-4-opus-20250219",
  max_tokens: 2000,
  thinking_budget: 1500, // Enable extended reasoning
  system: "You are Claude, an AI assistant. Think step-by-step through complex problems.",
  messages: [{
    role: "user",
    content: "Analyze the trade-offs between microservices and monolithic architecture"
  }]
})

// Extract thinking process and response
const thinking = message.content.find(block => block.type === 'thinking')?.content
const response = message.content.find(block => block.type === 'text')?.text

console.log('Claude\\'s reasoning:', thinking)
console.log('Final answer:', response)`
    }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { codeSnippets };
} else {
    window.codeSnippets = codeSnippets;
}