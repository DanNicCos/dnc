/**
 * Projects Data - Showcase of key AI engineering projects
 */

const projectsData = [
    {
        id: 'dynamo',
        title: 'The Dynamo',
        subtitle: 'Versatile AI Agent Framework',
        category: 'AI Agents',
        status: 'Production',
        description: 'A versatile agent framework that adapts to various AI tasks and workflows.',
        longDescription: `The Dynamo represents a breakthrough in AI agent architecture, designed for maximum versatility and adaptability. Built to handle complex reasoning tasks, workflow orchestration, and multi-modal interactions, it serves as a foundational framework for building intelligent systems that can adapt to diverse use cases.

The system emphasizes modularity, allowing for easy extension and customization while maintaining robust performance across different domains.`,
        techStack: ['Python', 'FastAPI', 'Docker', 'OpenAI API', 'Anthropic Claude', 'Vector Databases', 'Redis'],
        highlights: [
            'Multi-modal AI interactions',
            'Adaptive workflow orchestration',
            'Scalable agent architecture',
            'Real-time decision making'
        ],
        challenges: [
            {
                problem: 'Agent State Management',
                solution: 'Implemented persistent state tracking with Redis-backed memory systems'
            },
            {
                problem: 'Multi-AI Model Coordination',
                solution: 'Created unified API layer abstracting different AI providers'
            }
        ],
        metrics: {
            'Response Time': '< 200ms',
            'Uptime': '99.9%',
            'Concurrent Agents': '50+',
            'Task Success Rate': '94%'
        },
        links: {
            github: 'https://github.com/DanNicCos/dynamo',
            demo: null,
            docs: null
        },
        image: null,
        featured: true
    },
    {
        id: 'tof-p',
        title: 'TOF-P (Telos Flow Personal)',
        subtitle: 'AI-Powered Personal Development System',
        category: 'Productivity AI',
        status: 'Active Development',
        description: 'Comprehensive personal development system using AI to analyze journal entries and track goal alignment.',
        longDescription: `Telos Flow Personal (TOF-P) revolutionizes personal development through AI-driven insights and systematic tracking. The system analyzes daily journal entries, identifies patterns in goal alignment, and implements spaced repetition for key insights.

Built around the concept of "telos" (ultimate purpose), TOF-P helps users maintain alignment with their core values while providing actionable analytics across multiple time horizons - daily reflections, weekly patterns, monthly progress, and quarterly strategic reviews.`,
        techStack: ['Python', 'NLP', 'SQLite', 'Pandas', 'Matplotlib', 'OpenAI API', 'Spaced Repetition', 'Data Analytics'],
        highlights: [
            'Automated journal analysis with sentiment tracking',
            'Values-goals alignment scoring',
            'Spaced repetition system for insights',
            'Multi-timeframe analytics dashboard',
            'Privacy-first local data storage'
        ],
        challenges: [
            {
                problem: 'Natural Language Understanding',
                solution: 'Fine-tuned NLP models for personal development contexts and emotion detection'
            },
            {
                problem: 'Meaningful Pattern Recognition',
                solution: 'Developed custom algorithms correlating daily activities with long-term goal progress'
            }
        ],
        metrics: {
            'Journal Entries Analyzed': '1,200+',
            'Insight Retention': '87%',
            'Goal Completion Rate': '+23%',
            'Daily Active Users': 'Personal Use'
        },
        links: {
            github: 'https://github.com/DanNicCos/tof-p',
            demo: null,
            docs: null
        },
        image: null,
        featured: true
    },
    {
        id: 'tof-l',
        title: 'TOF-L (Telos Flow Learning)',
        subtitle: 'AI-Enhanced CLI Learning Framework',
        category: 'Education Tech',
        status: 'Production',
        description: 'Sophisticated command-line framework for structured learning with AI-powered content processing.',
        longDescription: `Telos Flow Learning (TOF-L) transforms raw educational material into structured, testable knowledge through AI processing. Built as an interconnected system of Bash scripts, it creates a complete learning workflow from content ingestion to progress tracking.

The system leverages the 'fabric' AI tool to process lesson materials into structured notes and corresponding assessments, then provides intelligent feedback and progress analytics. It serves as a personal learning command center, making complex topics more digestible and trackable.`,
        techStack: ['Bash Scripting', 'Fabric AI', 'CLI Tools', 'Git Integration', 'Data Processing', 'Progress Tracking', 'Test Generation'],
        highlights: [
            'Automated content structuring with AI',
            'Dynamic test generation and grading',
            'Progress tracking and analytics',
            'Modular script architecture',
            'Git-based lesson versioning',
            'Customizable learning workflows'
        ],
        challenges: [
            {
                problem: 'Content Quality Consistency',
                solution: 'Implemented validation pipelines and feedback loops for AI-generated content'
            },
            {
                problem: 'Cross-Platform Compatibility',
                solution: 'Designed portable Bash scripts with environment detection and graceful fallbacks'
            }
        ],
        metrics: {
            'Lessons Processed': '150+',
            'Test Questions Generated': '800+',
            'Learning Efficiency': '+40%',
            'Knowledge Retention': '89%'
        },
        links: {
            github: 'https://github.com/DanNicCos/tof-l',
            demo: null,
            docs: null
        },
        image: null,
        featured: true
    }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { projectsData };
} else {
    window.projectsData = projectsData;
}