/**
 * Main Application Entry Point (Refactored)
 * Clean, modular initialization using the new architecture
 */

import { AppManager } from './core/app-manager.js';
import { NavigationManager } from './core/navigation-manager.js';
import { eventBus, EVENTS } from './core/event-bus.js';
import { store, actions, selectors } from './core/state-store.js';
import { APP_CONFIG, ENV, FEATURES } from './core/config.js';
import { dom, debug } from './core/utils.js';

class PortfolioApp {
    constructor() {
        this.appManager = null;
        this.navigationManager = null;
        this.components = new Map();
        this.isInitialized = false;
        
        // Start initialization
        this.init();
    }

    async init() {
        try {
            debug.mark('app-init-start');
            debug.log('Portfolio application starting...', 'PortfolioApp');
            
            // Set loading state
            actions.setAppLoading(true);
            
            // Initialize core systems
            await this.initializeCoreManagers();
            
            // Setup global error handling
            this.setupErrorHandling();
            
            // Setup state synchronization
            this.setupStateSync();
            
            // Initialize feature flags
            this.applyFeatureFlags();
            
            // Mark as ready
            this.isInitialized = true;
            actions.setAppInitialized(true);
            actions.setAppLoading(false);
            
            debug.mark('app-init-end');
            debug.measure('App Initialization', 'app-init-start', 'app-init-end');
            debug.log('Portfolio application ready!', 'PortfolioApp');
            
        } catch (error) {
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize core application managers
     */
    async initializeCoreManagers() {
        debug.log('Initializing core managers...', 'PortfolioApp');
        
        // Initialize app manager (handles components and controllers)
        this.appManager = new AppManager();
        await this.appManager.init();
        this.components.set('appManager', this.appManager);
        
        // Initialize navigation manager
        this.navigationManager = new NavigationManager(this.appManager);
        await this.navigationManager.init();
        this.components.set('navigationManager', this.navigationManager);
        
        // Setup enhanced navigation interactions
        this.navigationManager.enhanceNavigationInteractions();
        this.navigationManager.setupKeyboardNavigation();
        
        debug.log('Core managers initialized successfully', 'PortfolioApp');
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleGlobalError('Runtime Error', event.error);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError('Unhandled Promise Rejection', event.reason);
        });

        // Listen for component errors
        eventBus.on(EVENTS.COMPONENT_ERROR, (data) => {
            this.handleComponentError(data);
        });

        debug.log('Error handling setup complete', 'PortfolioApp');
    }

    /**
     * Setup state synchronization with components
     */
    setupStateSync() {
        // Sync UI state with scroll position
        store.subscribe('ui.scrollPosition', (position) => {
            // Update any components that need scroll position
            eventBus.emit(EVENTS.UI_RESIZE, { scrollPosition: position });
        });

        // Sync terminal state
        eventBus.on(EVENTS.TERMINAL_SNIPPET_CHANGE, (data) => {
            actions.setCurrentSnippet(data.index);
        });

        eventBus.on(EVENTS.TERMINAL_SOUND_TOGGLE, (data) => {
            actions.toggleTerminalSound();
        });

        // Sync projects state
        eventBus.on(EVENTS.PROJECTS_CHANGE, (data) => {
            actions.setCurrentProject(data.index);
        });

        eventBus.on(EVENTS.PROJECTS_EXPAND, () => {
            actions.setProjectsExpanded(true);
        });

        eventBus.on(EVENTS.PROJECTS_COLLAPSE, () => {
            actions.setProjectsExpanded(false);
        });

        // Sync content panel state
        eventBus.on(EVENTS.CONTENT_EXPAND, () => {
            actions.setContentExpanded(true);
        });

        eventBus.on(EVENTS.CONTENT_COLLAPSE, () => {
            actions.setContentExpanded(false);
        });

        debug.log('State synchronization setup complete', 'PortfolioApp');
    }

    /**
     * Apply feature flags and conditional functionality
     */
    applyFeatureFlags() {
        // Apply reduced motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.classList.add('reduce-motion');
            actions.updatePreferences({ animationsEnabled: false });
        }

        // Apply feature flags
        if (!FEATURES.enableAnimations) {
            document.documentElement.classList.add('no-animations');
        }

        if (!FEATURES.enableSoundEffects) {
            actions.updatePreferences({ soundEnabled: false });
        }

        // Development mode enhancements
        if (ENV.isDevelopment) {
            this.enableDevelopmentMode();
        }

        debug.log('Feature flags applied', 'PortfolioApp');
    }

    /**
     * Enable development mode features
     */
    enableDevelopmentMode() {
        // Expose app instance globally for debugging
        window.portfolioApp = this;
        window.portfolioStore = store;
        window.portfolioEventBus = eventBus;
        
        // Add development styles
        const devStyle = dom.createElement('style', {}, `
            body::before {
                content: 'DEV MODE';
                position: fixed;
                top: 10px;
                right: 10px;
                background: #ff4444;
                color: white;
                padding: 4px 8px;
                font-size: 12px;
                z-index: 10000;
                border-radius: 3px;
            }
        `);
        document.head.appendChild(devStyle);
        
        // Add keyboard shortcuts for debugging
        this.setupDevelopmentKeyboards();
        
        debug.log('Development mode enabled', 'PortfolioApp');
    }

    /**
     * Setup development keyboard shortcuts
     */
    setupDevelopmentKeyboards() {
        document.addEventListener('keydown', (event) => {
            // Alt + D for debug info
            if (event.altKey && event.key === 'd') {
                event.preventDefault();
                console.log('=== Portfolio Debug Info ===');
                console.log('App Status:', this.getStatus());
                console.log('State Snapshot:', store.getSnapshot());
                console.log('Event Bus Status:', eventBus.eventNames());
            }
            
            // Alt + R for reset
            if (event.altKey && event.key === 'r') {
                event.preventDefault();
                console.log('Resetting application state...');
                store.reset();
                location.reload();
            }
        });
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        debug.log(`Initialization failed: ${error.message}`, 'PortfolioApp', 'error');
        
        actions.setAppError(error, 'Failed to initialize application');
        actions.setAppLoading(false);
        
        // Show error UI
        this.showErrorUI(error);
        
        // Emit error event
        eventBus.emit(EVENTS.APP_ERROR, { error, phase: 'initialization' });
    }

    /**
     * Handle global runtime errors
     */
    handleGlobalError(type, error) {
        debug.log(`${type}: ${error?.message || error}`, 'PortfolioApp', 'error');
        
        // Update error state but don't break the app
        actions.setAppError(error, type);
        
        // Emit error event
        eventBus.emit(EVENTS.APP_ERROR, { error, type, phase: 'runtime' });
    }

    /**
     * Handle component-specific errors
     */
    handleComponentError(data) {
        const { component, error, message } = data;
        debug.log(`Component Error [${component}]: ${message}`, 'PortfolioApp', 'error');
        
        // Track component errors but don't crash the app
        if (error && ENV.isDevelopment) {
            console.error(`Component [${component}] Error:`, error);
        }
    }

    /**
     * Show error UI to user
     */
    showErrorUI(error) {
        const errorContainer = dom.createElement('div', {
            className: 'app-error',
            style: `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--color-bg-primary);
                border: 2px solid var(--color-error);
                padding: 2rem;
                border-radius: 8px;
                max-width: 500px;
                z-index: 10000;
                text-align: center;
            `
        });

        errorContainer.innerHTML = `
            <h3 style="color: var(--color-error); margin-bottom: 1rem;">
                Application Error
            </h3>
            <p style="margin-bottom: 1.5rem;">
                Sorry, something went wrong while loading the portfolio.
            </p>
            <button onclick="location.reload()" style="
                background: var(--color-primary);
                color: var(--color-bg-primary);
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
            ">
                Reload Page
            </button>
        `;

        document.body.appendChild(errorContainer);
    }

    // Public API

    /**
     * Get application status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isReady: selectors.isAppReady(),
            components: Array.from(this.components.keys()),
            controllers: this.appManager?.getStatus()?.controllers || {},
            state: store.getSnapshot()
        };
    }

    /**
     * Get component by name
     */
    getComponent(name) {
        return this.components.get(name) || null;
    }

    /**
     * Get controller by name
     */
    getController(name) {
        return this.appManager?.getController(name) || null;
    }

    /**
     * Restart application
     */
    async restart() {
        debug.log('Restarting application...', 'PortfolioApp');
        
        // Cleanup existing components
        this.cleanup();
        
        // Reset state
        store.reset();
        
        // Reinitialize
        await this.init();
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        // Destroy all components
        this.components.forEach((component) => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        this.components.clear();
        this.isInitialized = false;
        
        debug.log('Application cleanup complete', 'PortfolioApp');
    }

    /**
     * Check if app is ready
     */
    isReady() {
        return this.isInitialized && selectors.isAppReady();
    }
}

// Initialize the application
const app = new PortfolioApp();

// Export for external access
if (typeof window !== 'undefined') {
    window.PortfolioApp = app;
}

export default PortfolioApp;