/**
 * Event Bus - Centralized event management for decoupled component communication
 * Implements the observer pattern with namespacing and error handling
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.wildcardListeners = new Map();
        this.maxListeners = 50; // Prevent memory leaks
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name (supports wildcards with *)
     * @param {Function} callback - Event handler
     * @param {Object} options - Subscription options
     * @returns {Function} Unsubscribe function
     */
    on(event, callback, options = {}) {
        if (typeof callback !== 'function') {
            throw new Error('Event callback must be a function');
        }

        const { once = false, priority = 0 } = options;
        
        // Handle wildcard events
        if (event.includes('*')) {
            return this._addWildcardListener(event, callback, { once, priority });
        }

        // Initialize event listeners array if it doesn't exist
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }

        const listeners = this.events.get(event);
        
        // Check max listeners limit
        if (listeners.length >= this.maxListeners) {
            console.warn(`EventBus: Maximum listeners (${this.maxListeners}) reached for event: ${event}`);
            return () => {}; // Return no-op unsubscribe function
        }

        const listener = {
            callback,
            once,
            priority,
            id: this._generateId()
        };

        // Insert listener based on priority (higher priority = earlier execution)
        const insertIndex = listeners.findIndex(l => l.priority < priority);
        if (insertIndex === -1) {
            listeners.push(listener);
        } else {
            listeners.splice(insertIndex, 0, listener);
        }

        // Return unsubscribe function
        return () => this.off(event, listener.id);
    }

    /**
     * Subscribe to an event that fires only once
     */
    once(event, callback, options = {}) {
        return this.on(event, callback, { ...options, once: true });
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {string|Function} callbackOrId - Callback function or listener ID
     */
    off(event, callbackOrId) {
        if (event.includes('*')) {
            return this._removeWildcardListener(event, callbackOrId);
        }

        const listeners = this.events.get(event);
        if (!listeners) return;

        const index = listeners.findIndex(listener => 
            listener.id === callbackOrId || listener.callback === callbackOrId
        );

        if (index !== -1) {
            listeners.splice(index, 1);
            
            // Clean up empty event arrays
            if (listeners.length === 0) {
                this.events.delete(event);
            }
        }
    }

    /**
     * Emit an event to all subscribers
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @returns {Promise} Promise that resolves when all handlers complete
     */
    async emit(event, data = null) {
        const promises = [];

        // Handle direct event listeners
        const listeners = this.events.get(event);
        if (listeners) {
            promises.push(...this._executeListeners(listeners, event, data));
        }

        // Handle wildcard listeners
        for (const [pattern, wildcardListeners] of this.wildcardListeners) {
            if (this._matchesPattern(event, pattern)) {
                promises.push(...this._executeListeners(wildcardListeners, event, data));
            }
        }

        // Wait for all handlers to complete
        try {
            await Promise.all(promises);
        } catch (error) {
            console.error(`EventBus: Error in event handlers for "${event}":`, error);
        }
    }

    /**
     * Emit an event synchronously (not recommended for async handlers)
     */
    emitSync(event, data = null) {
        const listeners = this.events.get(event);
        if (!listeners) return;

        for (const listener of [...listeners]) { // Create copy to avoid modification during iteration
            try {
                listener.callback(data, event);
                
                if (listener.once) {
                    this.off(event, listener.id);
                }
            } catch (error) {
                console.error(`EventBus: Sync handler error for "${event}":`, error);
            }
        }
    }

    /**
     * Remove all listeners for an event or all events
     */
    clear(event = null) {
        if (event) {
            this.events.delete(event);
            // Clear matching wildcard listeners
            for (const pattern of this.wildcardListeners.keys()) {
                if (pattern === event || this._matchesPattern(event, pattern)) {
                    this.wildcardListeners.delete(pattern);
                }
            }
        } else {
            this.events.clear();
            this.wildcardListeners.clear();
        }
    }

    /**
     * Get listener count for an event
     */
    listenerCount(event) {
        const listeners = this.events.get(event) || [];
        let count = listeners.length;

        // Add wildcard listeners that match
        for (const [pattern, wildcardListeners] of this.wildcardListeners) {
            if (this._matchesPattern(event, pattern)) {
                count += wildcardListeners.length;
            }
        }

        return count;
    }

    /**
     * Get all registered events
     */
    eventNames() {
        return [...this.events.keys(), ...this.wildcardListeners.keys()];
    }

    // Private methods

    _addWildcardListener(pattern, callback, options) {
        if (!this.wildcardListeners.has(pattern)) {
            this.wildcardListeners.set(pattern, []);
        }

        const listeners = this.wildcardListeners.get(pattern);
        const listener = {
            callback,
            once: options.once,
            priority: options.priority,
            id: this._generateId()
        };

        listeners.push(listener);
        return () => this._removeWildcardListener(pattern, listener.id);
    }

    _removeWildcardListener(pattern, callbackOrId) {
        const listeners = this.wildcardListeners.get(pattern);
        if (!listeners) return;

        const index = listeners.findIndex(listener => 
            listener.id === callbackOrId || listener.callback === callbackOrId
        );

        if (index !== -1) {
            listeners.splice(index, 1);
            
            if (listeners.length === 0) {
                this.wildcardListeners.delete(pattern);
            }
        }
    }

    _executeListeners(listeners, event, data) {
        const promises = [];

        // Create copy to avoid modification during iteration
        for (const listener of [...listeners]) {
            try {
                const result = listener.callback(data, event);
                
                // Handle async callbacks
                if (result && typeof result.then === 'function') {
                    promises.push(result);
                }

                // Remove one-time listeners
                if (listener.once) {
                    this.off(event, listener.id);
                }
            } catch (error) {
                console.error(`EventBus: Handler error for "${event}":`, error);
            }
        }

        return promises;
    }

    _matchesPattern(event, pattern) {
        // Simple wildcard matching (* matches any characters)
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(event);
    }

    _generateId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Create singleton instance
export const eventBus = new EventBus();

// Export class for testing or multiple instances
export { EventBus };

// Common event names (constants to prevent typos)
export const EVENTS = {
    // Application lifecycle
    APP_INIT: 'app:init',
    APP_READY: 'app:ready',
    APP_ERROR: 'app:error',

    // Component lifecycle
    COMPONENT_INIT: 'component:init',
    COMPONENT_READY: 'component:ready',
    COMPONENT_ERROR: 'component:error',
    COMPONENT_DESTROY: 'component:destroy',

    // Terminal events
    TERMINAL_READY: 'terminal:ready',
    TERMINAL_SNIPPET_CHANGE: 'terminal:snippet:change',
    TERMINAL_TYPING_START: 'terminal:typing:start',
    TERMINAL_TYPING_COMPLETE: 'terminal:typing:complete',
    TERMINAL_SOUND_TOGGLE: 'terminal:sound:toggle',
    TERMINAL_PAUSE: 'terminal:pause',
    TERMINAL_RESUME: 'terminal:resume',

    // Projects events
    PROJECTS_READY: 'projects:ready',
    PROJECTS_CHANGE: 'projects:change',
    PROJECTS_EXPAND: 'projects:expand',
    PROJECTS_COLLAPSE: 'projects:collapse',

    // Content panel events
    CONTENT_EXPAND: 'content:expand',
    CONTENT_COLLAPSE: 'content:collapse',

    // Navigation events
    NAV_HOME: 'nav:home',
    NAV_SCROLL: 'nav:scroll',

    // UI events
    UI_RESIZE: 'ui:resize',
    UI_VISIBILITY_CHANGE: 'ui:visibility:change',
    UI_FOCUS: 'ui:focus',
    UI_BLUR: 'ui:blur'
};