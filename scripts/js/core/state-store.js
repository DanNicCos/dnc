/**
 * State Store
 * Centralized state management with reactivity and persistence
 */

import { eventBus } from './event-bus.js';
import { storage } from './utils.js';

class StateStore {
    constructor() {
        this.state = {};
        this.subscribers = new Map();
        this.middleware = [];
        this.history = [];
        this.maxHistorySize = 50;
        this.persistentKeys = new Set();
        
        // Initialize with default state
        this.state = this.getInitialState();
        
        // Load persistent state
        this.loadPersistedState();
    }

    /**
     * Get initial application state
     */
    getInitialState() {
        return {
            // Application state
            app: {
                isInitialized: false,
                isLoading: false,
                hasError: false,
                errorMessage: null,
                theme: 'dark',
                reducedMotion: false
            },

            // UI state
            ui: {
                scrollPosition: 0,
                scrollDirection: 'up',
                isAtTop: true,
                navigationVisible: true,
                activeSection: null,
                windowSize: {
                    width: window.innerWidth || 1920,
                    height: window.innerHeight || 1080
                }
            },

            // Terminal state
            terminal: {
                isActive: false,
                currentSnippet: 0,
                isTyping: false,
                soundEnabled: true,
                autoRotate: true,
                isPaused: false
            },

            // Projects state
            projects: {
                currentProject: 0,
                totalProjects: 0,
                isExpanded: false,
                loadedProjects: []
            },

            // Content panel state
            content: {
                isExpanded: false,
                animating: false
            },

            // User preferences
            preferences: {
                soundEnabled: true,
                animationsEnabled: true,
                autoAdvanceProjects: false,
                terminalAutoRotate: true
            }
        };
    }

    /**
     * Get state value by path
     */
    get(path) {
        if (!path) return this.state;
        
        return path.split('.').reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : undefined;
        }, this.state);
    }

    /**
     * Set state value by path
     */
    set(path, value, options = {}) {
        const { silent = false, persist = false } = options;
        
        if (persist) {
            this.persistentKeys.add(path);
        }

        const previousState = JSON.parse(JSON.stringify(this.state));
        
        // Set the value
        this._setByPath(path, value);
        
        // Add to history
        this._addToHistory(path, value, previousState);
        
        // Run middleware
        this._runMiddleware(path, value, previousState);
        
        // Notify subscribers
        if (!silent) {
            this._notifySubscribers(path, value, previousState);
        }

        // Persist if needed
        if (persist || this.persistentKeys.has(path)) {
            this._persistState(path, value);
        }
    }

    /**
     * Update state with partial object
     */
    update(updates, options = {}) {
        const changes = {};
        
        Object.entries(updates).forEach(([path, value]) => {
            const previousValue = this.get(path);
            this.set(path, value, { ...options, silent: true });
            changes[path] = { value, previousValue };
        });

        // Notify subscribers about batch update
        if (!options.silent) {
            this._notifySubscribers('*', changes, this.state);
        }
    }

    /**
     * Subscribe to state changes
     */
    subscribe(path, callback, options = {}) {
        const { immediate = false } = options;
        
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        
        const subscription = {
            callback,
            id: this._generateId(),
            options
        };
        
        this.subscribers.get(path).add(subscription);
        
        // Call immediately if requested
        if (immediate) {
            callback(this.get(path), undefined, path);
        }
        
        // Return unsubscribe function
        return () => this.unsubscribe(path, subscription.id);
    }

    /**
     * Unsubscribe from state changes
     */
    unsubscribe(path, subscriptionId) {
        const pathSubscribers = this.subscribers.get(path);
        if (!pathSubscribers) return false;
        
        for (const subscription of pathSubscribers) {
            if (subscription.id === subscriptionId) {
                pathSubscribers.delete(subscription);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Add middleware for state changes
     */
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }
        
        this.middleware.push(middleware);
        return () => this.removeMiddleware(middleware);
    }

    /**
     * Remove middleware
     */
    removeMiddleware(middleware) {
        const index = this.middleware.indexOf(middleware);
        if (index !== -1) {
            this.middleware.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Reset state to initial values
     */
    reset(preservePersistent = true) {
        const persistentData = {};
        
        if (preservePersistent) {
            // Save persistent data
            for (const key of this.persistentKeys) {
                persistentData[key] = this.get(key);
            }
        }
        
        this.state = this.getInitialState();
        
        if (preservePersistent) {
            // Restore persistent data
            Object.entries(persistentData).forEach(([path, value]) => {
                this.set(path, value, { silent: true });
            });
        }
        
        this._notifySubscribers('*', this.state, {});
    }

    /**
     * Get state snapshot for debugging
     */
    getSnapshot() {
        return {
            state: JSON.parse(JSON.stringify(this.state)),
            subscribers: Array.from(this.subscribers.keys()),
            middleware: this.middleware.length,
            history: this.history.length,
            persistent: Array.from(this.persistentKeys)
        };
    }

    /**
     * Undo last state change
     */
    undo() {
        if (this.history.length === 0) return false;
        
        const lastChange = this.history.pop();
        this._setByPath(lastChange.path, lastChange.previousValue);
        this._notifySubscribers(lastChange.path, lastChange.previousValue, lastChange.value);
        
        return true;
    }

    // Private methods

    _setByPath(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        const target = keys.reduce((obj, key) => {
            if (!(key in obj)) {
                obj[key] = {};
            }
            return obj[key];
        }, this.state);
        
        target[lastKey] = value;
    }

    _addToHistory(path, value, previousState) {
        const previousValue = this.get(path);
        
        this.history.push({
            path,
            value: previousValue,
            previousValue: JSON.parse(JSON.stringify(previousValue)),
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    _runMiddleware(path, value, previousState) {
        for (const middleware of this.middleware) {
            try {
                middleware(path, value, previousState, this.state);
            } catch (error) {
                console.error('State middleware error:', error);
            }
        }
    }

    _notifySubscribers(path, value, previousState) {
        // Notify exact path subscribers
        const pathSubscribers = this.subscribers.get(path);
        if (pathSubscribers) {
            for (const subscription of pathSubscribers) {
                try {
                    subscription.callback(value, previousState, path);
                } catch (error) {
                    console.error('State subscriber error:', error);
                }
            }
        }
        
        // Notify wildcard subscribers
        const wildcardSubscribers = this.subscribers.get('*');
        if (wildcardSubscribers && path !== '*') {
            for (const subscription of wildcardSubscribers) {
                try {
                    subscription.callback(value, previousState, path);
                } catch (error) {
                    console.error('State wildcard subscriber error:', error);
                }
            }
        }
        
        // Notify parent path subscribers
        if (path.includes('.')) {
            const parentPath = path.substring(0, path.lastIndexOf('.'));
            const parentValue = this.get(parentPath);
            this._notifySubscribers(parentPath, parentValue, previousState);
        }
    }

    _persistState(path, value) {
        try {
            const key = `portfolio_state_${path}`;
            storage.set(key, value);
        } catch (error) {
            console.warn(`Failed to persist state for ${path}:`, error);
        }
    }

    loadPersistedState() {
        // Load common persistent preferences
        const persistentPaths = [
            'preferences.soundEnabled',
            'preferences.animationsEnabled',
            'preferences.autoAdvanceProjects',
            'preferences.terminalAutoRotate',
            'app.theme'
        ];

        persistentPaths.forEach(path => {
            const key = `portfolio_state_${path}`;
            const stored = storage.get(key);
            
            if (stored !== null) {
                this.persistentKeys.add(path);
                this._setByPath(path, stored);
            }
        });
    }

    _generateId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Create singleton instance
export const store = new StateStore();

// Export class for testing
export { StateStore };

// State action creators (helper functions)
export const actions = {
    // App actions
    setAppInitialized: (initialized) => store.set('app.isInitialized', initialized),
    setAppLoading: (loading) => store.set('app.isLoading', loading),
    setAppError: (error, message = null) => {
        store.update({
            'app.hasError': !!error,
            'app.errorMessage': message || (error?.message) || null
        });
    },

    // UI actions
    setScrollPosition: (position) => store.set('ui.scrollPosition', position),
    setScrollDirection: (direction) => store.set('ui.scrollDirection', direction),
    setWindowSize: (width, height) => store.set('ui.windowSize', { width, height }),
    setActiveSection: (section) => store.set('ui.activeSection', section),

    // Terminal actions
    setTerminalActive: (active) => store.set('terminal.isActive', active),
    setCurrentSnippet: (index) => store.set('terminal.currentSnippet', index),
    setTerminalTyping: (typing) => store.set('terminal.isTyping', typing),
    toggleTerminalSound: () => {
        const current = store.get('terminal.soundEnabled');
        store.set('terminal.soundEnabled', !current, { persist: true });
    },

    // Projects actions
    setCurrentProject: (index) => store.set('projects.currentProject', index),
    setProjectsExpanded: (expanded) => store.set('projects.isExpanded', expanded),
    setLoadedProjects: (projects) => store.set('projects.loadedProjects', projects),

    // Content actions
    setContentExpanded: (expanded) => store.set('content.isExpanded', expanded),

    // Preferences actions
    updatePreferences: (prefs) => {
        Object.entries(prefs).forEach(([key, value]) => {
            store.set(`preferences.${key}`, value, { persist: true });
        });
    }
};

// State selectors (helper functions)
export const selectors = {
    // App selectors
    isAppReady: () => store.get('app.isInitialized') && !store.get('app.hasError'),
    getAppError: () => store.get('app.errorMessage'),

    // UI selectors
    getScrollInfo: () => ({
        position: store.get('ui.scrollPosition'),
        direction: store.get('ui.scrollDirection'),
        isAtTop: store.get('ui.isAtTop')
    }),

    // Terminal selectors
    getTerminalState: () => ({
        isActive: store.get('terminal.isActive'),
        currentSnippet: store.get('terminal.currentSnippet'),
        isTyping: store.get('terminal.isTyping'),
        soundEnabled: store.get('terminal.soundEnabled')
    }),

    // Projects selectors
    getProjectsState: () => ({
        current: store.get('projects.currentProject'),
        total: store.get('projects.totalProjects'),
        isExpanded: store.get('projects.isExpanded')
    }),

    // Preferences selectors
    getPreferences: () => store.get('preferences')
};