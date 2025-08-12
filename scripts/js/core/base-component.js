/**
 * Base Component Class
 * Provides common functionality and lifecycle for all portfolio components
 */

import { eventBus, EVENTS } from './event-bus.js';
import { APP_CONFIG } from './config.js';

export class BaseComponent {
    constructor(name, element, options = {}) {
        if (!name) {
            throw new Error('Component name is required');
        }

        this.name = name;
        this.element = element;
        this.options = { ...this.getDefaultOptions(), ...options };
        this.state = this.getInitialState();
        this.isInitialized = false;
        this.isDestroyed = false;
        this.eventListeners = new Map(); // Track event listeners for cleanup
        
        // Bind methods to preserve context
        this.destroy = this.destroy.bind(this);
        this.handleError = this.handleError.bind(this);

        // Auto-initialize if element is provided and ready
        if (this.element && this.options.autoInit !== false) {
            this.init();
        }
    }

    /**
     * Initialize the component
     * Override in subclasses for custom initialization logic
     */
    async init() {
        if (this.isInitialized || this.isDestroyed) {
            return;
        }

        try {
            this.log('Initializing...');
            
            // Emit initialization event
            eventBus.emit(EVENTS.COMPONENT_INIT, {
                component: this.name,
                instance: this
            });

            // Setup phase
            await this.setup();
            
            // Bind events phase
            this.bindEvents();
            
            // Post-initialization phase
            await this.onReady();
            
            this.isInitialized = true;
            this.log('Initialized successfully');

            // Emit ready event
            eventBus.emit(EVENTS.COMPONENT_READY, {
                component: this.name,
                instance: this
            });

        } catch (error) {
            this.handleError('Initialization failed', error);
        }
    }

    /**
     * Setup phase - called during initialization
     * Override in subclasses for setup logic
     */
    async setup() {
        // Default implementation - can be overridden
    }

    /**
     * Bind events phase - called during initialization
     * Override in subclasses for event binding
     */
    bindEvents() {
        // Default implementation - can be overridden
    }

    /**
     * Ready phase - called after initialization is complete
     * Override in subclasses for post-initialization logic
     */
    async onReady() {
        // Default implementation - can be overridden
    }

    /**
     * Update component state
     * @param {Object} newState - State updates
     * @param {boolean} silent - Don't emit state change event
     */
    setState(newState, silent = false) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };

        if (!silent) {
            this.onStateChange(this.state, prevState);
        }
    }

    /**
     * State change handler
     * Override in subclasses to react to state changes
     */
    onStateChange(currentState, previousState) {
        // Default implementation - can be overridden
    }

    /**
     * Add event listener with automatic cleanup tracking
     * @param {Element|string} target - Element or event bus event name
     * @param {string} event - Event name (for DOM) or callback (for event bus)
     * @param {Function} handler - Event handler (for DOM) or options (for event bus)
     * @param {Object} options - Event options
     */
    addEventListener(target, event, handler, options = {}) {
        let unsubscribe;

        if (typeof target === 'string') {
            // Event bus subscription
            unsubscribe = eventBus.on(target, event, handler);
            const key = `eventBus:${target}`;
            
            if (!this.eventListeners.has(key)) {
                this.eventListeners.set(key, []);
            }
            this.eventListeners.get(key).push(unsubscribe);
        } else {
            // DOM event listener
            target.addEventListener(event, handler, options);
            const key = `dom:${event}`;
            
            if (!this.eventListeners.has(key)) {
                this.eventListeners.set(key, []);
            }
            this.eventListeners.get(key).push({
                target,
                event,
                handler,
                options
            });
        }
    }

    /**
     * Remove specific event listener
     */
    removeEventListener(target, event, handler) {
        if (typeof target === 'string') {
            eventBus.off(target, handler);
        } else {
            target.removeEventListener(event, handler);
        }
    }

    /**
     * Emit event through event bus
     */
    emit(event, data = null) {
        const eventName = `${this.name.toLowerCase()}:${event}`;
        return eventBus.emit(eventName, {
            component: this.name,
            instance: this,
            ...data
        });
    }

    /**
     * Get component configuration
     */
    getConfig(key = null) {
        const componentConfig = APP_CONFIG.components[this.name.toLowerCase()] || {};
        return key ? componentConfig[key] : componentConfig;
    }

    /**
     * Default options - override in subclasses
     */
    getDefaultOptions() {
        return {
            autoInit: true,
            debug: APP_CONFIG.debug.enableLogging
        };
    }

    /**
     * Initial state - override in subclasses
     */
    getInitialState() {
        return {
            isReady: false,
            hasError: false,
            errorMessage: null
        };
    }

    /**
     * Log message with component context
     */
    log(message, type = 'info') {
        if (!this.options.debug) return;

        const prefix = `${APP_CONFIG.debug.logPrefix} [${this.name}]`;
        const icon = APP_CONFIG.debug[`${type}Icon`] || APP_CONFIG.debug.infoIcon;
        
        console[type](`${icon} ${prefix}`, message);
    }

    /**
     * Handle component errors
     */
    handleError(message, error = null) {
        this.setState({
            hasError: true,
            errorMessage: message
        }, true); // Silent state update

        this.log(`${message}${error ? `: ${error.message}` : ''}`, 'error');

        // Emit error event
        eventBus.emit(EVENTS.COMPONENT_ERROR, {
            component: this.name,
            instance: this,
            message,
            error
        });

        // Re-throw if in development
        if (APP_CONFIG.debug.enableLogging && error) {
            throw error;
        }
    }

    /**
     * Clean up component resources
     */
    destroy() {
        if (this.isDestroyed) {
            return;
        }

        this.log('Destroying component...');

        // Remove all tracked event listeners
        for (const [key, listeners] of this.eventListeners) {
            if (key.startsWith('eventBus:')) {
                // Event bus listeners
                listeners.forEach(unsubscribe => {
                    if (typeof unsubscribe === 'function') {
                        unsubscribe();
                    }
                });
            } else if (key.startsWith('dom:')) {
                // DOM listeners
                listeners.forEach(({ target, event, handler, options }) => {
                    target.removeEventListener(event, handler, options);
                });
            }
        }

        this.eventListeners.clear();

        // Call cleanup hook
        this.onDestroy();

        // Emit destroy event
        eventBus.emit(EVENTS.COMPONENT_DESTROY, {
            component: this.name,
            instance: this
        });

        this.isDestroyed = true;
        this.isInitialized = false;
        this.log('Component destroyed');
    }

    /**
     * Cleanup hook - override in subclasses
     */
    onDestroy() {
        // Default implementation - can be overridden
    }

    /**
     * Check if component is ready
     */
    isReady() {
        return this.isInitialized && !this.isDestroyed && !this.state.hasError;
    }

    /**
     * Get component info for debugging
     */
    getInfo() {
        return {
            name: this.name,
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            state: this.state,
            options: this.options,
            eventListenerCount: this.eventListeners.size
        };
    }
}

/**
 * Controller Base Class
 * Extends BaseComponent with controller-specific functionality
 */
export class BaseController extends BaseComponent {
    constructor(name, containerId, options = {}) {
        const element = typeof containerId === 'string' 
            ? document.getElementById(containerId) || document.querySelector(containerId)
            : containerId;

        if (!element) {
            throw new Error(`Controller "${name}": Container element not found: ${containerId}`);
        }

        super(name, element, options);
        this.containerId = containerId;
    }

    /**
     * Find element within controller's container
     */
    $(selector) {
        return this.element.querySelector(selector);
    }

    /**
     * Find all elements within controller's container
     */
    $$(selector) {
        return this.element.querySelectorAll(selector);
    }

    /**
     * Check if controller's element is visible
     */
    isVisible() {
        if (!this.element) return false;
        
        const rect = this.element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    /**
     * Scroll controller into view
     */
    scrollIntoView(options = {}) {
        if (this.element) {
            this.element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                ...options
            });
        }
    }
}