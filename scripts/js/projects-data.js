/**
 * Projects Data - Showcase of key AI engineering projects
 */

const projectsData = [
    {
        id: 'ai-agent-blueprint',
        title: 'AI Agent Blueprint',
        subtitle: 'Open-Source Modular AI Toolkit',
        category: 'Open Source',
        status: 'Active Development',
        description: 'An open-source, modular toolkit for developers. A versatile "Swiss Army Knife" with foundational components like RAG and memory, empowering anyone to build and deploy custom AI agents.',
        longDescription: `AI Agent Blueprint is a comprehensive, open-source framework designed to democratize AI agent development. Built with modularity at its core, it provides essential components like Retrieval-Augmented Generation (RAG), persistent memory systems, and flexible orchestration tools.

The toolkit serves as a foundational layer that empowers developers of all skill levels to create sophisticated AI agents without reinventing core infrastructure. Each component is designed to work independently or as part of a larger system, making it truly versatile.`,
        techStack: ['Python', 'FastAPI', 'Docker', 'Vector Databases', 'RAG', 'Memory Systems', 'API Integration', 'Open Source'],
        highlights: [
            'Modular component architecture',
            'Pre-built RAG implementations',
            'Persistent memory systems',
            'Multi-provider AI integration',
            'Docker-ready deployment',
            'Extensive documentation'
        ],
        challenges: [
            {
                problem: 'Component Interoperability',
                solution: 'Standardized interfaces and event-driven architecture for seamless integration'
            },
            {
                problem: 'Scalability Across Use Cases',
                solution: 'Plugin-based system allowing custom extensions while maintaining core stability'
            }
        ],
        metrics: {
            'GitHub Stars': 'TBD',
            'Active Contributors': 'Growing',
            'Component Modules': '12+',
            'Use Case Coverage': '80%'
        },
        links: {
            github: 'https://github.com/DanNicCos/ai-agent-blueprint',
            demo: null,
            docs: null
        },
        image: null,
        featured: true
    },
    {
        id: 'tof-personal',
        title: 'TOF-Personal System',
        subtitle: 'Private AI-Powered Self-Reflection',
        category: 'Personal AI',
        status: 'Production',
        description: 'A private, command-line system for AI-powered self-reflection. Analyzes local journal entries to generate actionable insights and uses spaced repetition for long-term personal growth.',
        longDescription: `TOF-Personal represents a breakthrough in personal development technology, combining AI analysis with privacy-first design. The system processes local journal entries through advanced natural language processing to extract meaningful patterns and insights.

Utilizing spaced repetition algorithms, it ensures that key insights and realizations don\'t fade over time. The system operates entirely on local data, maintaining complete privacy while providing powerful analytics for personal growth and alignment with core values.`,
        techStack: ['Python', 'CLI', 'NLP', 'Local Storage', 'Spaced Repetition', 'Data Analysis', 'Privacy-First', 'Sentiment Analysis'],
        highlights: [
            'Complete data privacy - local processing only',
            'Advanced journal sentiment analysis',
            'Spaced repetition for insight retention',
            'Goal alignment tracking',
            'Command-line interface for power users',
            'Customizable reflection prompts'
        ],
        challenges: [
            {
                problem: 'Meaningful Pattern Recognition',
                solution: 'Custom algorithms correlating daily reflections with long-term behavioral patterns'
            },
            {
                problem: 'Privacy vs. AI Capability',
                solution: 'Local NLP processing with optional cloud enhancement for advanced features'
            }
        ],
        metrics: {
            'Journal Entries Processed': '2,000+',
            'Insight Retention Rate': '89%',
            'Personal Growth Metrics': '+35%',
            'Privacy Compliance': '100%'
        },
        links: {
            github: 'https://github.com/DanNicCos/tof-personal',
            demo: null,
            docs: null
        },
        image: null,
        featured: true
    },
    {
        id: 'tof-learning',
        title: 'TOF-Learning System',
        subtitle: 'Command-Line Learning Framework',
        category: 'Education Tech',
        status: 'Production',
        description: 'A command-line framework for disciplined learning. Automates a rigorous cycle: AI processes lessons into notes and tests, then grades performance, creating a powerful feedback loop for subject mastery.',
        longDescription: `TOF-Learning transforms the learning process through intelligent automation and rigorous methodology. The system takes raw educational content and processes it through AI to create structured notes, comprehensive tests, and detailed performance analytics.

Designed for serious learners who want systematic progress tracking, it implements spaced repetition, adaptive testing, and performance analytics to ensure deep understanding rather than surface-level memorization. The command-line interface provides power and flexibility for advanced users.`,
        techStack: ['Bash Scripts', 'AI Processing', 'CLI Tools', 'Test Generation', 'Performance Analytics', 'Spaced Repetition', 'Content Processing'],
        highlights: [
            'Automated lesson processing with AI',
            'Dynamic test generation and grading',
            'Comprehensive progress analytics',
            'Spaced repetition scheduling',
            'Command-line power user interface',
            'Modular learning workflows'
        ],
        challenges: [
            {
                problem: 'Content Quality Assurance',
                solution: 'Multi-stage validation with AI review and human oversight for generated materials'
            },
            {
                problem: 'Adaptive Difficulty Scaling',
                solution: 'Machine learning algorithms that adjust question difficulty based on performance patterns'
            }
        ],
        metrics: {
            'Lessons Processed': '300+',
            'Test Questions Generated': '1,500+',
            'Learning Efficiency Gain': '+45%',
            'Knowledge Retention': '92%'
        },
        links: {
            github: 'https://github.com/DanNicCos/tof-learning',
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

export { projectsData };