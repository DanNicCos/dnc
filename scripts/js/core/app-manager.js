/**
 * Application Manager
 * Core application initialization and component orchestration
 */

import { BaseComponent } from './base-component.js';
import { eventBus, EVENTS } from './event-bus.js';
import { APP_CONFIG } from './config.js';
import { dom, async as asyncUtils } from './utils.js';

export class AppManager extends BaseComponent {
    constructor() {
        super('AppManager', document.body, {
            autoInit: false // We'll control initialization timing
        });
        
        this.controllers = new Map();
        this.componentRegistry = new Map();
        this.initializationPromise = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._performInit();
        return this.initializationPromise;
    }

    async _performInit() {
        try {
            this.log('Application initializing...');
            
            // Wait for DOM to be ready
            await this._waitForDOM();
            
            // Emit app initialization event
            await eventBus.emit(EVENTS.APP_INIT);
            
            // Initialize core systems
            await this._initializeCoreComponents();
            
            // Initialize controllers
            await this._initializeControllers();
            
            // Setup global event listeners
            this._setupGlobalEventListeners();
            
            // Mark as initialized
            this.isInitialized = true;
            this.setState({ isReady: true });
            
            this.log('Application initialization complete');
            
            // Emit app ready event
            await eventBus.emit(EVENTS.APP_READY, {
                controllers: Array.from(this.controllers.keys()),
                components: Array.from(this.componentRegistry.keys())
            });
            
        } catch (error) {
            this.handleError('Application initialization failed', error);
            await eventBus.emit(EVENTS.APP_ERROR, { error });
            throw error;
        }
    }

    /**
     * Wait for DOM to be ready
     */
    _waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            } else {
                resolve();
            }
        });
    }

    /**
     * Initialize core application components
     */
    async _initializeCoreComponents() {
        this.log('Initializing core components...');
        
        // Initialize accessibility enhancements
        await this._initializeAccessibility();
        
        // Initialize smooth scrolling
        this._initializeSmoothScrolling();
        
        // Initialize quote rotation if available
        this._initializeQuoteRotation();
        
        this.log('Core components initialized');
    }

    /**
     * Initialize all controllers
     */
    async _initializeControllers() {
        this.log('Initializing controllers...');
        
        const controllerInits = [
            this._initializeTerminalController(),
            this._initializeContentPanelController(),
            this._initializeProjectsController()
        ];

        // Initialize controllers in parallel but handle failures individually
        const results = await Promise.allSettled(controllerInits);
        
        results.forEach((result, index) => {
            const controllerNames = ['Terminal', 'ContentPanel', 'Projects'];
            if (result.status === 'rejected') {
                this.log(`${controllerNames[index]} controller initialization failed: ${result.reason.message}`, 'warn');
            }
        });
        
        this.log(`Controllers initialized: ${this.controllers.size} active`);
    }

    /**
     * Initialize terminal controller
     */
    async _initializeTerminalController() {
        try {
            // Check if TerminalController class is available
            if (typeof TerminalController === 'undefined') {
                throw new Error('TerminalController class not found');
            }

            const container = dom.$(APP_CONFIG.selectors.terminalContainer);
            if (!container) {
                throw new Error('Terminal container not found');
            }

            const options = APP_CONFIG.components.terminal;
            const controller = new TerminalController(container, options);
            
            this.controllers.set('terminal', controller);
            this.log('Terminal controller initialized');
            
            return controller;
        } catch (error) {
            this.log(`Terminal controller initialization failed: ${error.message}`, 'warn');
            return null;
        }
    }

    /**
     * Initialize content panel controller
     */
    async _initializeContentPanelController() {
        try {
            // Wait a bit for the controller to be available
            await asyncUtils.delay(APP_CONFIG.timing.initializationDelay);
            
            if (window.contentPanelController) {
                this.controllers.set('contentPanel', window.contentPanelController);
                this.log('Content panel controller initialized');
                return window.contentPanelController;
            } else {
                throw new Error('ContentPanelController not found on window object');
            }
        } catch (error) {
            this.log(`Content panel controller initialization failed: ${error.message}`, 'warn');
            return null;
        }
    }

    /**
     * Initialize projects controller
     */
    async _initializeProjectsController() {
        try {
            // Wait a bit longer for the projects controller
            await asyncUtils.delay(APP_CONFIG.timing.controllerInitDelay);
            
            if (window.projectsController) {
                this.controllers.set('projects', window.projectsController);
                this.log('Projects controller initialized');
                return window.projectsController;
            } else {
                throw new Error('ProjectsController not found on window object');
            }
        } catch (error) {
            this.log(`Projects controller initialization failed: ${error.message}`, 'warn');
            return null;
        }
    }

    /**
     * Setup global event listeners
     */
    _setupGlobalEventListeners() {
        this.log('Setting up global event listeners...');

        // Window resize handler
        this.addEventListener(window, 'resize', 
            asyncUtils.debounce(() => {
                eventBus.emit(EVENTS.UI_RESIZE, {
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }, APP_CONFIG.timing.resizeDebounceDelay)
        );

        // Visibility change handler
        this.addEventListener(document, 'visibilitychange', () => {
            eventBus.emit(EVENTS.UI_VISIBILITY_CHANGE, {
                hidden: document.hidden
            });
        });

        // Global keyboard shortcuts
        this.addEventListener(document, 'keydown', (event) => {
            this._handleGlobalKeydown(event);
        });

        // Handle component-specific events
        this._setupComponentEventHandlers();
        
        this.log('Global event listeners setup complete');
    }

    /**
     * Setup component-specific event handlers
     */
    _setupComponentEventHandlers() {
        // Terminal pause/resume on visibility change
        this.addEventListener(EVENTS.UI_VISIBILITY_CHANGE, ({ hidden }) => {
            const terminal = this.getController('terminal');
            if (terminal) {
                if (hidden && typeof terminal.pauseDemo === 'function') {
                    terminal.pauseDemo();
                } else if (!hidden && typeof terminal.resumeDemo === 'function') {
                    terminal.resumeDemo();
                }
            }
        });

        // Handle resize events for controllers
        this.addEventListener(EVENTS.UI_RESIZE, (data) => {
            this.controllers.forEach((controller, name) => {
                if (controller && typeof controller.onResize === 'function') {
                    controller.onResize(data);
                }
            });
        });
    }

    /**
     * Handle global keyboard shortcuts
     */
    _handleGlobalKeydown(event) {
        // Ctrl/Cmd + K to focus terminal
        if ((event.ctrlKey || event.metaKey) && event.key === APP_CONFIG.shortcuts.focusTerminal) {
            event.preventDefault();
            const terminal = this.getController('terminal');
            const container = dom.$(APP_CONFIG.selectors.terminalContainer);
            
            if (container) {
                container.focus();
                container.scrollIntoView({ behavior: 'smooth' });
                
                eventBus.emit(EVENTS.UI_FOCUS, {
                    target: 'terminal',
                    element: container
                });
            }
        }

        // Escape to blur focused elements
        if (event.key === APP_CONFIG.shortcuts.escapeKey) {
            const activeElement = document.activeElement;
            if (activeElement && activeElement !== document.body) {
                activeElement.blur();
                
                eventBus.emit(EVENTS.UI_BLUR, {
                    element: activeElement
                });
            }
        }
    }

    /**
     * Initialize accessibility enhancements
     */
    async _initializeAccessibility() {
        this.log('Initializing accessibility enhancements...');
        
        // Add skip link
        this._addSkipLink();
        
        // Setup focus management
        this._setupFocusManagement();
        
        // Enhance ARIA labels
        this._enhanceARIALabels();
        
        this.log('Accessibility enhancements applied');
    }

    _addSkipLink() {
        const existingSkipLink = dom.$(`.${APP_CONFIG.classes.skipLink}`);
        if (existingSkipLink) return;

        const skipLink = dom.createElement('a', {
            href: '#main-content',
            className: APP_CONFIG.classes.skipLink,
            style: `
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--color-bg-primary);
                color: var(--color-primary);
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 10000;
                transition: top 0.3s;
            `
        }, APP_CONFIG.aria.skipLinkText);

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Ensure main content has ID
        const mainContent = dom.$(APP_CONFIG.selectors.mainContent);
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }

    _setupFocusManagement() {
        // Add focus-visible styles if not already present
        const existingStyle = dom.$('style[data-focus-visible]');
        if (existingStyle) return;

        const style = dom.createElement('style', {
            'data-focus-visible': 'true'
        }, `
            .${APP_CONFIG.classes.focusVisible} {
                outline: 2px solid var(--color-primary);
                outline-offset: 2px;
            }
        `);

        document.head.appendChild(style);
    }

    _enhanceARIALabels() {
        // Enhance social links
        const socialLinks = dom.$$(APP_CONFIG.selectors.socialLinks);
        socialLinks.forEach(link => {
            if (link.getAttribute('aria-label')) return;

            const href = link.getAttribute('href') || '';
            if (href.includes('github')) {
                link.setAttribute('aria-label', APP_CONFIG.aria.githubLabel);
            } else if (href.includes('x.com') || href.includes('twitter')) {
                link.setAttribute('aria-label', APP_CONFIG.aria.twitterLabel);
            } else if (href.includes('substack')) {
                link.setAttribute('aria-label', APP_CONFIG.aria.substackLabel);
            }
        });

        // Enhance terminal container
        const terminalContainer = dom.$(APP_CONFIG.selectors.terminalContainer);
        if (terminalContainer) {
            terminalContainer.setAttribute('role', APP_CONFIG.aria.terminalRole);
            terminalContainer.setAttribute('aria-label', APP_CONFIG.aria.terminalLabel);
            terminalContainer.setAttribute('tabindex', '0');
        }
    }

    _initializeSmoothScrolling() {
        const anchors = dom.$$('a[href^="#"]');
        
        anchors.forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = dom.$(anchor.getAttribute('href'));
                
                if (target) {
                    target.scrollIntoView({
                        behavior: APP_CONFIG.animations.scrollBehavior,
                        block: 'start'
                    });
                }
            });
        });
    }

    _initializeQuoteRotation() {
        if (typeof startQuoteRotation === 'function') {
            const quoteElement = dom.$('.quote');
            if (quoteElement) {
                startQuoteRotation(APP_CONFIG.timing.quoteRotationInterval);
                this.log('Quote rotation initialized');
            }
        }
    }

    // Public API

    /**
     * Get controller by name
     */
    getController(name) {
        return this.controllers.get(name) || null;
    }

    /**
     * Get all controllers
     */
    getControllers() {
        return new Map(this.controllers);
    }

    /**
     * Register a component
     */
    registerComponent(name, instance) {
        this.componentRegistry.set(name, instance);
        this.log(`Component registered: ${name}`);
    }

    /**
     * Get registered component
     */
    getComponent(name) {
        return this.componentRegistry.get(name) || null;
    }

    /**
     * Check if app is ready
     */
    isReady() {
        return this.isInitialized && this.state.isReady;
    }

    /**
     * Get app status for debugging
     */
    getStatus() {
        return {
            isReady: this.isReady(),
            controllers: Object.fromEntries(
                Array.from(this.controllers.entries()).map(([name, controller]) => [
                    name, 
                    controller ? 'initialized' : 'failed'
                ])
            ),
            components: Array.from(this.componentRegistry.keys()),
            eventListeners: this.eventListeners.size
        };
    }
}