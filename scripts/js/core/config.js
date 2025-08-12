/**
 * Application Configuration
 * Centralized constants and settings for the portfolio application
 */

export const APP_CONFIG = {
    // Application metadata
    name: 'DanNicCos Portfolio',
    version: '2.0.0',
    author: 'DanNicCos',

    // Performance settings
    timing: {
        terminalRotateInterval: 10000,
        terminalTypingSpeed: 50,
        resizeDebounceDelay: 250,
        initializationDelay: 100,
        controllerInitDelay: 150,
        quoteRotationInterval: 4000
    },

    // Component selectors
    selectors: {
        terminalContainer: '#terminalContainer',
        terminalTitle: '#terminalTitle',
        terminalCursor: '#terminalCursor',
        codeOutput: '#codeOutput',
        statusIndicator: '#statusIndicator',
        soundToggle: '#soundToggle',
        homeIcon: '.home-icon',
        brandName: '.brand-name',
        mainContent: '.main-content',
        socialLinks: '.social-link',
        showMoreBtn: '#showMoreBtn',
        expandedContent: '#expandedContent',
        projectsContainer: '#projectsContainer',
        currentProjectNum: '#currentProjectNum',
        totalProjectsNum: '#totalProjectsNum',
        expandProjectBtn: '#expandProjectBtn',
        projectDetails: '#projectDetails'
    },

    // CSS classes
    classes: {
        skipLink: 'skip-link',
        focusVisible: 'focus-visible',
        terminalActive: 'terminal-active',
        expanded: 'expanded',
        collapsed: 'collapsed',
        loading: 'loading',
        error: 'error'
    },

    // ARIA labels and descriptions
    aria: {
        terminalLabel: 'Interactive code terminal - click to cycle through code examples',
        terminalRole: 'application',
        skipLinkText: 'Skip to main content',
        githubLabel: 'Visit GitHub profile',
        twitterLabel: 'Visit X (Twitter) profile',
        substackLabel: 'Visit Substack newsletter',
        soundToggleLabel: 'Toggle sound',
        homeLabel: 'Home',
        expandedFalse: 'false',
        expandedTrue: 'true'
    },

    // Animation settings
    animations: {
        scrollBehavior: 'smooth',
        glitchDuration: '0.3s',
        glitchEasing: 'ease-in-out',
        gradientShift: '8s ease infinite'
    },

    // Keyboard shortcuts
    shortcuts: {
        focusTerminal: 'k', // Ctrl/Cmd + K
        escapeKey: 'Escape'
    },

    // Component initialization options
    components: {
        terminal: {
            autoStart: true,
            autoRotate: true,
            rotateInterval: 10000,
            typingSpeed: 50
        },
        contentPanel: {
            animationDuration: 300,
            expandOnInit: false
        },
        projects: {
            autoAdvance: false,
            transitionDuration: 400
        }
    },

    // Error messages
    messages: {
        terminalInitError: 'Terminal controller initialization failed',
        contentPanelInitError: 'Content panel controller initialization failed',
        projectsInitError: 'Projects controller initialization failed',
        componentNotFound: 'Component not found',
        initializationError: 'Error during site initialization',
        controllerNotReady: 'Controller not yet initialized'
    },

    // Debug settings
    debug: {
        enableLogging: true,
        logPrefix: '🚀 Portfolio:',
        successIcon: '✅',
        warningIcon: '⚠️',
        errorIcon: '❌',
        infoIcon: 'ℹ️'
    },

    // External URLs
    urls: {
        github: 'https://github.com/DanNicCos',
        twitter: 'https://x.com/DanNicCos',
        substack: 'https://dnccoding.substack.com/'
    }
};

// Environment detection
export const ENV = {
    isDevelopment: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !window.location.search.includes('production=true'),
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
    supportsModules: 'noModule' in HTMLScriptElement.prototype,
    supportsLocalStorage: (() => {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch {
            return false;
        }
    })()
};

// Feature flags for progressive enhancement
export const FEATURES = {
    enableSoundEffects: true,
    enableAnimations: true,
    enableAnalytics: ENV.isProduction,
    enableServiceWorker: ENV.isProduction,
    enableErrorReporting: ENV.isProduction
};