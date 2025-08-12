/**
 * Content Panel Controller (Refactored)
 * Modern, modular implementation using the new base architecture
 */

import { BaseController } from './core/base-component.js';
import { eventBus, EVENTS } from './core/event-bus.js';
import { APP_CONFIG } from './core/config.js';
import { dom, animation } from './core/utils.js';
import { store, actions } from './core/state-store.js';

export class ContentPanelController extends BaseController {
    constructor() {
        // Find the main content area as our container
        super('ContentPanel', APP_CONFIG.selectors.mainContent);
        
        this.showMoreBtn = null;
        this.expandedContent = null;
        this.animationDuration = 300;
    }

    /**
     * Setup phase - find elements and validate
     */
    async setup() {
        // Find required elements using centralized selectors
        this.showMoreBtn = this.$(APP_CONFIG.selectors.showMoreBtn);
        this.expandedContent = this.$(APP_CONFIG.selectors.expandedContent);
        
        if (!this.showMoreBtn || !this.expandedContent) {
            throw new Error('Content panel elements not found');
        }

        // Get animation duration from config
        this.animationDuration = this.getConfig('animationDuration') || this.animationDuration;
        
        // Initialize state from store
        const isExpanded = store.get('content.isExpanded');
        this.setState({ 
            isExpanded,
            animating: false 
        });
        
        // Set initial UI state
        this._updateUI(isExpanded, true); // silent initial update
        
        this.log('Setup complete');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Button click handler
        this.addEventListener(this.showMoreBtn, 'click', (e) => {
            e.preventDefault();
            this.toggle();
        });
        
        // Keyboard navigation
        this.addEventListener(this.showMoreBtn, 'keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Listen to state changes
        store.subscribe('content.isExpanded', (isExpanded) => {
            this._updateUI(isExpanded);
        });

        // Listen for external expand/collapse commands
        this.addEventListener(EVENTS.CONTENT_EXPAND, () => {
            this.expand();
        });

        this.addEventListener(EVENTS.CONTENT_COLLAPSE, () => {
            this.collapse();
        });

        this.log('Event listeners bound');
    }

    /**
     * Toggle content visibility
     */
    async toggle() {
        if (this.state.animating) {
            this.log('Animation in progress, ignoring toggle', 'warn');
            return;
        }

        const newState = !this.state.isExpanded;
        
        try {
            this.setState({ animating: true });
            
            if (newState) {
                await this._expand();
            } else {
                await this._collapse();
            }
            
            // Update global state
            actions.setContentExpanded(newState);
            
            // Update local state
            this.setState({ 
                isExpanded: newState,
                animating: false 
            });
            
            // Emit event for other components
            this.emit(newState ? 'expanded' : 'collapsed');
            
            this.log(`Content ${newState ? 'expanded' : 'collapsed'}`);
            
        } catch (error) {
            this.setState({ animating: false });
            this.handleError('Toggle animation failed', error);
        }
    }

    /**
     * Expand content
     */
    async expand() {
        if (this.state.isExpanded || this.state.animating) {
            return;
        }
        
        await this.toggle();
    }

    /**
     * Collapse content
     */
    async collapse() {
        if (!this.state.isExpanded || this.state.animating) {
            return;
        }
        
        await this.toggle();
    }

    /**
     * Internal expand animation
     */
    async _expand() {
        // Add expanding class for CSS hooks
        dom.addClass(this.expandedContent, 'expanding');
        dom.addClass(this.expandedContent, 'show');
        
        // Animate using CSS transitions
        await animation.transition(this.expandedContent, {
            maxHeight: `${this.expandedContent.scrollHeight}px`,
            opacity: '1'
        }, this.animationDuration);
        
        // Clean up classes
        dom.removeClass(this.expandedContent, 'expanding');
        
        // Optional: Smooth scroll to make content visible
        setTimeout(() => {
            if (this.isVisible() && !this._isInViewport()) {
                this._scrollToContent();
            }
        }, 50);
    }

    /**
     * Internal collapse animation
     */
    async _collapse() {
        // Add collapsing class for CSS hooks
        dom.addClass(this.expandedContent, 'collapsing');
        
        // Animate collapse
        await animation.transition(this.expandedContent, {
            maxHeight: '0px',
            opacity: '0'
        }, this.animationDuration);
        
        // Remove classes after animation
        dom.removeClass(this.expandedContent, 'show');
        dom.removeClass(this.expandedContent, 'collapsing');
        
        // Optional: Scroll back to button
        setTimeout(() => {
            if (this.showMoreBtn) {
                this._scrollToButton();
            }
        }, 50);
    }

    /**
     * Update UI elements based on state
     */
    _updateUI(isExpanded, silent = false) {
        if (!this.showMoreBtn || !this.expandedContent) return;
        
        // Update ARIA attributes
        this.showMoreBtn.setAttribute('aria-expanded', isExpanded.toString());
        this.expandedContent.setAttribute('aria-hidden', (!isExpanded).toString());
        
        // Update button text/icon if needed
        const buttonIcon = this.showMoreBtn.querySelector('.btn-icon');
        if (buttonIcon) {
            buttonIcon.textContent = isExpanded ? '▲' : '▼';
        }
        
        // Update CSS classes for styling hooks
        dom.toggleClass(this.element, 'content-expanded', isExpanded);
        dom.toggleClass(this.showMoreBtn, 'expanded', isExpanded);
        
        if (!silent) {
            // Emit UI update event
            eventBus.emit(isExpanded ? EVENTS.CONTENT_EXPAND : EVENTS.CONTENT_COLLAPSE, {
                isExpanded,
                component: this.name
            });
        }
    }

    /**
     * Scroll to make expanded content visible
     */
    _scrollToContent() {
        this.expandedContent.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }

    /**
     * Scroll back to button
     */
    _scrollToButton() {
        this.showMoreBtn.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    /**
     * Check if expanded content is in viewport
     */
    _isInViewport() {
        if (!this.expandedContent) return false;
        
        const rect = this.expandedContent.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        return rect.bottom <= windowHeight && rect.top >= 0;
    }

    /**
     * Handle resize events
     */
    onResize(data) {
        // Adjust content positioning if needed on resize
        if (this.state.isExpanded && this.state.animating) {
            // Recalculate heights during animation if window resized
            this.log('Adjusting for window resize during animation');
        }
    }

    /**
     * State change handler
     */
    onStateChange(currentState, previousState) {
        // React to state changes if needed
        if (previousState.animating !== currentState.animating) {
            // Enable/disable button during animations
            this.showMoreBtn.disabled = currentState.animating;
        }
    }

    /**
     * Cleanup when component is destroyed
     */
    onDestroy() {
        // Reset UI state
        if (this.expandedContent) {
            dom.removeClass(this.expandedContent, 'show');
            this.expandedContent.style.maxHeight = '';
            this.expandedContent.style.opacity = '';
        }
        
        if (this.showMoreBtn) {
            this.showMoreBtn.disabled = false;
        }
        
        this.log('Component destroyed');
    }

    /**
     * Get public state
     */
    getPublicState() {
        return {
            isExpanded: this.state.isExpanded,
            animating: this.state.animating,
            isVisible: this.isVisible()
        };
    }

    /**
     * Default options specific to content panel
     */
    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            animationDuration: 300,
            autoScroll: true
        };
    }

    /**
     * Initial state specific to content panel
     */
    getInitialState() {
        return {
            ...super.getInitialState(),
            isExpanded: false,
            animating: false
        };
    }
}

// Factory function for easy instantiation
export function createContentPanel() {
    return new ContentPanelController();
}

// Auto-initialize if not using module system
if (typeof window !== 'undefined' && !window.PortfolioApp) {
    document.addEventListener('DOMContentLoaded', () => {
        window.contentPanelController = new ContentPanelController();
    });
}