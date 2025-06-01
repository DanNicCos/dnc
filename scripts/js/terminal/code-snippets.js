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
        code: `// Supabase Real-time Integration with Authentication
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://your-project.supabase.co',
    'your-anon-key'
)

class RealtimeChat {
    constructor() {
        this.channel = null
        this.user = null
    }

    async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: email.split('@')[0]
                }
            }
        })
        
        if (error) throw error
        this.user = data.user
        return data
    }

    async setupRealtimeSubscription() {
        // Subscribe to database changes
        const channel = supabase
            .channel('chat-room')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                this.handleNewMessage(payload.new)
            })
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState()
                this.updateOnlineUsers(state)
            })
            .subscribe()

        // Track user presence
        await channel.track({
            user_id: this.user.id,
            online_at: new Date().toISOString(),
            display_name: this.user.user_metadata.display_name
        })

        this.channel = channel
    }

    async sendMessage(content) {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                content,
                user_id: this.user.id,
                created_at: new Date().toISOString()
            }])
            .select()

        if (error) throw error
        return data[0]
    }

    handleNewMessage(message) {
        console.log('New message:', message)
        // Update UI with new message
    }

    updateOnlineUsers(presenceState) {
        const users = Object.values(presenceState)
            .map(presence => presence[0])
        console.log('Online users:', users.length)
    }
}

// Usage
const chat = new RealtimeChat()
await chat.signUp('user@example.com', 'secure-password')
await chat.setupRealtimeSubscription()
await chat.sendMessage('Hello, real-time world!')`
    },
    {
        id: 'crawl4ai-usage',
        title: '~/projects/ai-web-scraper',
        language: 'python',
        description: 'LLM-friendly web crawling for AI data pipelines',
        code: `# Crawl4AI: Advanced Web Scraping for LLM Workflows
import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from crawl4ai.extraction_strategy import JsonCssExtractionStrategy

class AIWebScraper:
    def __init__(self):
        self.browser_config = BrowserConfig(
            headless=True,
            verbose=True,
            user_agent="AI-Scraper/1.0"
        )
        
    async def scrape_structured_data(self, url, schema):
        """Extract structured data using CSS selectors"""
        extraction_strategy = JsonCssExtractionStrategy(
            schema=schema,
            verbose=True
        )
        
        run_config = CrawlerRunConfig(
            extraction_strategy=extraction_strategy,
            cache_mode="bypass",
            process_iframes=True
        )
        
        async with AsyncWebCrawler(config=self.browser_config) as crawler:
            result = await crawler.arun(
                url=url,
                config=run_config
            )
            
            return {
                'markdown': result.markdown,
                'structured_data': result.extracted_content,
                'links': result.links,
                'media': result.media
            }
    
    async def scrape_with_llm_extraction(self, url, instructions):
        """Use LLM-based extraction for complex data"""
        from crawl4ai.extraction_strategy import LLMExtractionStrategy
        
        extraction_strategy = LLMExtractionStrategy(
            provider="ollama/llama3.1",
            api_token=None,  # Using local model
            instruction=instructions
        )
        
        run_config = CrawlerRunConfig(
            extraction_strategy=extraction_strategy,
            word_count_threshold=10
        )
        
        async with AsyncWebCrawler(config=self.browser_config) as crawler:
            result = await crawler.arun(url=url, config=run_config)
            return result.extracted_content

# Example usage for product data extraction
async def main():
    scraper = AIWebScraper()
    
    # Define schema for e-commerce products
    product_schema = {
        "name": "ProductExtractor",
        "baseSelector": ".product-item",
        "fields": [
            {
                "name": "title",
                "selector": "h3.product-title",
                "type": "text"
            },
            {
                "name": "price",
                "selector": ".price",
                "type": "text"
            },
            {
                "name": "rating",
                "selector": ".rating",
                "type": "attribute",
                "attribute": "data-rating"
            },
            {
                "name": "image",
                "selector": "img.product-image",
                "type": "attribute",
                "attribute": "src"
            }
        ]
    }
    
    # Scrape product data
    data = await scraper.scrape_structured_data(
        "https://example-store.com/products",
        product_schema
    )
    
    print(f"Extracted {len(data['structured_data'])} products")
    
    # LLM-based extraction for reviews
    reviews = await scraper.scrape_with_llm_extraction(
        "https://example-store.com/reviews",
        "Extract customer reviews with sentiment analysis. Return JSON with review text, rating, and sentiment."
    )
    
    return data, reviews

# Run the scraper
if __name__ == "__main__":
    asyncio.run(main())`
    },
    {
        id: 'docker-containerization',
        title: '~/projects/node-docker-app',
        language: 'dockerfile',
        description: 'Production-ready containerization with multi-stage builds',
        code: `# Multi-stage Dockerfile for Node.js Application
# Stage 1: Dependencies and build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with optimizations
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application (if needed)
RUN npm run build 2>/dev/null || echo "No build script found"

# Stage 2: Production runtime
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD node healthcheck.js

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/index.js"]

# Stage 3: Development (optional)
FROM node:18-alpine AS development

WORKDIR /app

# Install all dependencies including dev dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Install nodemon for development
RUN npm install -g nodemon

# Expose debug port
EXPOSE 3000 9229

# Start with nodemon for development
CMD ["nodemon", "--inspect=0.0.0.0:9229", "src/index.js"]

# Docker Compose configuration
# version: '3.8'
# services:
#   app:
#     build:
#       context: .
#       target: development
#     ports:
#       - "3000:3000"
#       - "9229:9229"
#     volumes:
#       - .:/app
#       - /app/node_modules
#     environment:
#       - NODE_ENV=development
#     depends_on:
#       - redis
#       - postgres
#   
#   redis:
#     image: redis:7-alpine
#     ports:
#       - "6379:6379"
#   
#   postgres:
#     image: postgres:15-alpine
#     environment:
#       POSTGRES_DB: myapp
#       POSTGRES_USER: user
#       POSTGRES_PASSWORD: password
#     ports:
#       - "5432:5432"
#     volumes:
#       - postgres_data:/var/lib/postgresql/data
# 
# volumes:
#   postgres_data:`
    },
    {
        id: 'openai-api-integration',
        title: '~/projects/ai-assistant',
        language: 'javascript',
        description: 'OpenAI GPT integration with streaming and function calling',
        code: `// OpenAI API Integration with Advanced Features
import OpenAI from 'openai'

class AIAssistant {
    constructor(apiKey) {
        this.client = new OpenAI({
            apiKey: apiKey || process.env.OPENAI_API_KEY
        })
        this.conversationHistory = []
        this.tools = this.defineTools()
    }

    defineTools() {
        return [
            {
                type: "function",
                function: {
                    name: "get_weather",
                    description: "Get current weather for a location",
                    parameters: {
                        type: "object",
                        properties: {
                            location: {
                                type: "string",
                                description: "City name, e.g. San Francisco, CA"
                            },
                            unit: {
                                type: "string",
                                enum: ["celsius", "fahrenheit"],
                                description: "Temperature unit"
                            }
                        },
                        required: ["location"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "search_web",
                    description: "Search the web for current information",
                    parameters: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "Search query"
                            }
                        },
                        required: ["query"]
                    }
                }
            }
        ]
    }

    async streamResponse(userMessage, onChunk) {
        this.conversationHistory.push({
            role: "user",
            content: userMessage
        })

        try {
            const stream = await this.client.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful AI assistant with access to real-time tools."
                    },
                    ...this.conversationHistory
                ],
                tools: this.tools,
                tool_choice: "auto",
                stream: true,
                temperature: 0.7,
                max_tokens: 2000
            })

            let assistantMessage = ""
            let toolCalls = []

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta
                
                if (delta?.content) {
                    assistantMessage += delta.content
                    onChunk?.(delta.content)
                }

                if (delta?.tool_calls) {
                    // Handle streaming tool calls
                    for (const toolCall of delta.tool_calls) {
                        if (!toolCalls[toolCall.index]) {
                            toolCalls[toolCall.index] = {
                                id: toolCall.id,
                                type: toolCall.type,
                                function: { name: "", arguments: "" }
                            }
                        }
                        
                        if (toolCall.function?.name) {
                            toolCalls[toolCall.index].function.name += toolCall.function.name
                        }
                        
                        if (toolCall.function?.arguments) {
                            toolCalls[toolCall.index].function.arguments += toolCall.function.arguments
                        }
                    }
                }
            }

            // Execute tool calls if any
            if (toolCalls.length > 0) {
                const toolResults = await this.executeToolCalls(toolCalls)
                return await this.handleToolResults(toolResults, assistantMessage)
            }

            this.conversationHistory.push({
                role: "assistant",
                content: assistantMessage
            })

            return assistantMessage

        } catch (error) {
            console.error('OpenAI API Error:', error)
            throw new Error(\`AI Assistant Error: \${error.message}\`)
        }
    }

    async executeToolCalls(toolCalls) {
        const results = []

        for (const toolCall of toolCalls) {
            const { name, arguments: args } = toolCall.function
            const parsedArgs = JSON.parse(args)

            let result
            switch (name) {
                case 'get_weather':
                    result = await this.getWeather(parsedArgs.location, parsedArgs.unit)
                    break
                case 'search_web':
                    result = await this.searchWeb(parsedArgs.query)
                    break
                default:
                    result = { error: \`Unknown function: \${name}\` }
            }

            results.push({
                tool_call_id: toolCall.id,
                role: "tool",
                content: JSON.stringify(result)
            })
        }

        return results
    }

    async getWeather(location, unit = "celsius") {
        // Mock weather API call
        const weatherData = {
            location,
            temperature: unit === "celsius" ? "22°C" : "72°F",
            condition: "Partly cloudy",
            humidity: "65%",
            wind: "10 km/h"
        }
        
        return weatherData
    }

    async searchWeb(query) {
        // Mock web search - in production, integrate with search API
        return {
            query,
            results: [
                {
                    title: "Search Result for: " + query,
                    snippet: "This is a mock search result. In production, integrate with a real search API.",
                    url: "https://example.com/search"
                }
            ]
        }
    }

    async handleToolResults(toolResults, assistantMessage) {
        // Add tool results to conversation
        this.conversationHistory.push({
            role: "assistant",
            content: assistantMessage,
            tool_calls: toolResults.map(r => ({
                id: r.tool_call_id,
                type: "function"
            }))
        })

        for (const result of toolResults) {
            this.conversationHistory.push(result)
        }

        // Get final response with tool results
        const finalResponse = await this.client.chat.completions.create({
            model: "gpt-4o",
            messages: this.conversationHistory,
            temperature: 0.7
        })

        const finalMessage = finalResponse.choices[0].message.content
        this.conversationHistory.push({
            role: "assistant",
            content: finalMessage
        })

        return finalMessage
    }

    clearHistory() {
        this.conversationHistory = []
    }
}

// Usage example
const assistant = new AIAssistant()

// Stream response with real-time output
await assistant.streamResponse(
    "What's the weather like in Tokyo and can you search for recent AI news?",
    (chunk) => console.log(chunk) // Real-time streaming
)`
    },
    {
        id: 'anthropic-claude-api',
        title: '~/projects/claude-integration',
        language: 'javascript',
        description: 'Anthropic Claude API with advanced reasoning and tool use',
        code: `// Anthropic Claude API Integration
import Anthropic from '@anthropic-ai/sdk'

class ClaudeAssistant {
    constructor(apiKey) {
        this.client = new Anthropic({
            apiKey: apiKey || process.env.ANTHROPIC_API_KEY
        })
        this.conversationHistory = []
    }

    async analyzeWithThinking(prompt, useExtendedThinking = true) {
        try {
            const message = await this.client.messages.create({
                model: "claude-4-opus-20250219",
                max_tokens: 4000,
                thinking_budget: useExtendedThinking ? 2000 : undefined,
                system: \`You are Claude, an AI assistant created by Anthropic. 
                You excel at analysis, reasoning, and providing thoughtful responses.
                When given complex problems, think through them step by step.\`,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })

            // Extract thinking process if available
            const thinking = message.content.find(block => 
                block.type === 'thinking'
            )

            const textResponse = message.content.find(block => 
                block.type === 'text'
            )?.text

            return {
                response: textResponse,
                thinking: thinking?.content || null,
                usage: message.usage
            }

        } catch (error) {
            console.error('Claude API Error:', error)
            throw new Error(\`Claude Assistant Error: \${error.message}\`)
        }
    }

    async streamConversation(userMessage, onUpdate) {
        this.conversationHistory.push({
            role: "user",
            content: userMessage
        })

        try {
            const stream = this.client.messages
                .stream({
                    model: "claude-4-sonnet-20250219",
                    max_tokens: 3000,
                    system: "You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
                    messages: this.conversationHistory
                })
                .on('text', (text) => {
                    onUpdate?.(text)
                })
                .on('contentBlock', (block) => {
                    if (block.type === 'text') {
                        console.log('Content block:', block.text)
                    }
                })

            const finalMessage = await stream.finalMessage()
            
            // Add assistant response to history
            this.conversationHistory.push({
                role: "assistant",
                content: finalMessage.content[0].text
            })

            return finalMessage.content[0].text

        } catch (error) {
            console.error('Claude Streaming Error:', error)
            throw error
        }
    }

    async processDocument(documentContent, analysisType = "summary") {
        const prompts = {
            summary: "Please provide a comprehensive summary of this document, highlighting key points and main themes.",
            analysis: "Analyze this document in detail. Identify patterns, insights, and provide critical analysis.",
            extraction: "Extract key information, facts, and data points from this document in a structured format.",
            questions: "Generate thoughtful questions that this document raises or could be used to answer."
        }

        const prompt = \`\${prompts[analysisType] || prompts.summary}

Document:
\${documentContent}\`

        return await this.analyzeWithThinking(prompt, true)
    }

    async codeReview(code, language = "javascript") {
        const prompt = \`Please review this \${language} code and provide:
1. Code quality assessment
2. Potential bugs or issues
3. Performance improvements
4. Security considerations
5. Best practices recommendations

Code:
\\\`\\\`\\\`\${language}
\${code}
\\\`\\\`\\\`\`

        return await this.analyzeWithThinking(prompt, true)
    }

    async batchProcess(requests) {
        try {
            const batch = await this.client.beta.messages.batches.create({
                requests: requests.map((req, index) => ({
                    custom_id: \`request-\${index}\`,
                    params: {
                        model: "claude-4-sonnet-20250219",
                        max_tokens: 2000,
                        messages: [
                            {
                                role: "user",
                                content: req.content
                            }
                        ]
                    }
                }))
            })

            // Poll for completion
            let batchResult
            while (true) {
                batchResult = await this.client.beta.messages.batches.retrieve(batch.id)
                
                if (batchResult.processing_status === 'ended') {
                    break
                }
                
                await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
            }

            // Get results
            const results = []
            for await (const entry of this.client.beta.messages.batches.results(batch.id)) {
                if (entry.result.type === 'succeeded') {
                    results.push({
                        custom_id: entry.custom_id,
                        content: entry.result.message.content[0].text
                    })
                } else {
                    results.push({
                        custom_id: entry.custom_id,
                        error: entry.result.error
                    })
                }
            }

            return results

        } catch (error) {
            console.error('Batch processing error:', error)
            throw error
        }
    }

    async compareModels(prompt) {
        const models = [
            "claude-4-opus-20250219",
            "claude-4-sonnet-20250219",
            "claude-3-7-sonnet-20250219"
        ]

        const results = {}

        for (const model of models) {
            try {
                const start = Date.now()
                const response = await this.client.messages.create({
                    model,
                    max_tokens: 1000,
                    messages: [{ role: "user", content: prompt }]
                })
                
                results[model] = {
                    response: response.content[0].text,
                    latency: Date.now() - start,
                    tokens: response.usage
                }
            } catch (error) {
                results[model] = { error: error.message }
            }
        }

        return results
    }

    getConversationStats() {
        const userMessages = this.conversationHistory.filter(m => m.role === "user").length
        const assistantMessages = this.conversationHistory.filter(m => m.role === "assistant").length
        
        return {
            totalMessages: this.conversationHistory.length,
            userMessages,
            assistantMessages,
            conversationLength: this.conversationHistory.length
        }
    }

    clearConversation() {
        this.conversationHistory = []
    }
}

// Usage examples
const claude = new ClaudeAssistant()

// Advanced analysis with thinking
const analysis = await claude.analyzeWithThinking(
    "Explain the implications of quantum computing on modern cryptography",
    true // Enable extended thinking
)

// Stream a conversation
await claude.streamConversation(
    "Help me design a scalable microservices architecture",
    (chunk) => process.stdout.write(chunk)
)

// Process multiple documents in batch
const batchResults = await claude.batchProcess([
    { content: "Summarize: Document 1 content..." },
    { content: "Analyze: Document 2 content..." },
    { content: "Extract key points: Document 3 content..." }
])`
    }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { codeSnippets };
} else {
    window.codeSnippets = codeSnippets;
}