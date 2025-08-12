/**
 * Navigation Manager
 * Handles navigation interactions, scroll management, and UI state
 */

import { BaseComponent } from './base-component.js';
import { eventBus, EVENTS } from './event-bus.js';
import { APP_CONFIG } from './config.js';
import { dom, nav, animation } from './utils.js';

export class NavigationManager extends BaseComponent {
    constructor(appManager) {
        super('NavigationManager', document.body);
        
        this.appManager = appManager;
        this.homeIcon = null;
        this.brandName = null;
        this.currentScrollPosition = 0;
        this.isScrolling = false;
    }

    async setup() {
        // Find navigation elements
        this.homeIcon = dom.$(APP_CONFIG.selectors.homeIcon);
        this.brandName = dom.$(APP_CONFIG.selectors.brandName);
        
        if (!this.homeIcon) {
            throw new Error('Home icon not found');
        }

        // Track initial scroll position
        this.currentScrollPosition = nav.getScrollPosition().y;
        
        this.log('Navigation manager setup complete');
    }

    bindEvents() {
        // Home icon click
        if (this.homeIcon) {
            this.addEventListener(this.homeIcon, 'click', (e) => {
                this.handleHomeClick(e);
            });
        }

        // Brand name click with glitch effect
        if (this.brandName) {
            this.addEventListener(this.brandName, 'click', (e) => {
                this.handleBrandClick(e);
            });
        }

        // Scroll tracking
        this.addEventListener(window, 'scroll', () => {
            this.handleScroll();
        });

        // Listen for navigation events from other components
        this.addEventListener(EVENTS.NAV_HOME, () => {
            this.scrollToTop();
        });

        this.addEventListener(EVENTS.NAV_SCROLL, (data) => {
            this.scrollToTarget(data.target, data.options);
        });

        this.log('Navigation event listeners bound');
    }

    /**
     * Handle home icon click
     */
    handleHomeClick(event) {
        event.preventDefault();
        this.scrollToTop();
        
        this.emit('home_clicked');
        this.log('Home clicked - scrolled to top');
    }

    /**
     * Handle brand name click with glitch effect
     */
    async handleBrandClick(event) {
        if (!this.brandName) return;

        try {
            // Trigger glitch animation
            await this.triggerGlitchEffect();
            
            this.emit('brand_clicked');
            this.log('Brand name clicked - glitch effect triggered');
        } catch (error) {
            this.log('Failed to trigger glitch effect', 'error');
        }
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const newPosition = nav.getScrollPosition().y;
        const scrollDelta = newPosition - this.currentScrollPosition;
        
        // Update scroll state
        this.setState({
            scrollPosition: newPosition,
            scrollDirection: scrollDelta > 0 ? 'down' : 'up',
            isAtTop: newPosition < 50
        });

        // Emit scroll event for other components
        eventBus.emit(EVENTS.NAV_SCROLL, {
            position: newPosition,
            delta: scrollDelta,
            direction: this.state.scrollDirection,
            isAtTop: this.state.isAtTop
        });

        this.currentScrollPosition = newPosition;

        // Update navigation state based on scroll
        this.updateNavigationState();
    }

    /**
     * Update navigation appearance based on scroll position
     */
    updateNavigationState() {
        const { isAtTop } = this.state;
        
        // Add/remove classes based on scroll position
        const header = dom.$('.header');
        if (header) {
            dom.toggleClass(header, 'scrolled', !isAtTop);
        }

        // Update brand visibility or styling if needed
        if (this.brandName) {
            dom.toggleClass(this.brandName, 'scrolled', !isAtTop);
        }
    }

    /**
     * Scroll to top of page
     */
    scrollToTop() {
        this.isScrolling = true;
        
        nav.scrollToTop();
        
        // Reset scroll tracking after animation
        setTimeout(() => {
            this.isScrolling = false;
            this.currentScrollPosition = 0;
            this.setState({ 
                scrollPosition: 0, 
                isAtTop: true 
            });
        }, 500); // Approximate scroll animation time
        
        this.emit('scrolled_to_top');
    }

    /**
     * Scroll to specific target
     */
    scrollToTarget(target, options = {}) {
        const element = typeof target === 'string' ? dom.$(target) : target;
        if (!element) {
            this.log(`Scroll target not found: ${target}`, 'warn');
            return;
        }

        this.isScrolling = true;
        
        nav.scrollTo(element, {
            behavior: APP_CONFIG.animations.scrollBehavior,
            block: 'start',
            ...options
        });

        // Reset scroll tracking after animation
        setTimeout(() => {
            this.isScrolling = false;
        }, 500);

        this.emit('scrolled_to_target', { target, element });
        this.log(`Scrolled to target: ${target}`);
    }

    /**
     * Trigger glitch effect on brand name
     */
    async triggerGlitchEffect() {
        if (!this.brandName) return;

        // Reset animation
        this.brandName.style.animation = 'none';
        this.brandName.offsetHeight; // Force reflow
        
        // Apply glitch effect
        const glitchAnimation = `glitch ${APP_CONFIG.animations.glitchDuration} ${APP_CONFIG.animations.glitchEasing}, gradient-shift ${APP_CONFIG.animations.gradientShift}`;
        this.brandName.style.animation = glitchAnimation;
        
        // Return promise that resolves when animation completes
        return new Promise(resolve => {
            const handleAnimationEnd = () => {
                this.brandName.removeEventListener('animationend', handleAnimationEnd);
                resolve();
            };
            this.brandName.addEventListener('animationend', handleAnimationEnd, { once: true });
        });
    }

    /**
     * Check if element is in current viewport
     */
    isElementInViewport(element, threshold = 0) {
        return nav.isInViewport(element, threshold);
    }

    /**
     * Get current scroll progress (0-1)
     */
    getScrollProgress() {
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (documentHeight <= 0) return 0;
        
        return Math.min(this.state.scrollPosition / documentHeight, 1);
    }

    /**
     * Show/hide navigation elements
     */
    toggleNavigation(visible = true) {
        const header = dom.$('.header');
        if (!header) return;

        if (visible) {
            animation.fadeIn(header, 300);
        } else {
            animation.fadeOut(header, 300);
        }

        this.setState({ navigationVisible: visible });
        this.emit('navigation_toggled', { visible });
    }

    /**
     * Smooth scroll to section with offset
     */
    scrollToSection(sectionId, offset = 0) {
        const section = dom.$(`#${sectionId}`) || dom.$(`.${sectionId}`);
        if (!section) {
            this.log(`Section not found: ${sectionId}`, 'warn');
            return;
        }

        const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        this.emit('scrolled_to_section', { sectionId, element: section });
    }

    /**
     * Add smooth hover effects to navigation elements
     */
    enhanceNavigationInteractions() {
        // Enhance home icon with hover effects
        if (this.homeIcon) {
            this.homeIcon.addEventListener('mouseenter', () => {
                this.homeIcon.style.transform = 'scale(1.1)';
                this.homeIcon.style.transition = 'transform 0.2s ease';
            });

            this.homeIcon.addEventListener('mouseleave', () => {
                this.homeIcon.style.transform = 'scale(1)';
            });
        }

        // Enhance brand name interactions
        if (this.brandName) {
            this.brandName.addEventListener('mouseenter', () => {
                this.brandName.style.textShadow = '0 0 20px var(--color-primary)';
                this.brandName.style.transition = 'text-shadow 0.3s ease';
            });

            this.brandName.addEventListener('mouseleave', () => {
                this.brandName.style.textShadow = 'none';
            });
        }

        this.log('Navigation interactions enhanced');
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        this.addEventListener(document, 'keydown', (event) => {
            // Handle keyboard navigation shortcuts
            switch (event.key) {
                case 'Home':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        this.scrollToTop();
                    }
                    break;
                case 'End':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        this.scrollToBottom();
                    }
                    break;
                case 'PageUp':
                    // Let browser handle, but track it
                    this.emit('keyboard_navigation', { key: 'PageUp' });
                    break;
                case 'PageDown':
                    // Let browser handle, but track it
                    this.emit('keyboard_navigation', { key: 'PageDown' });
                    break;
            }
        });

        this.log('Keyboard navigation setup complete');
    }

    /**
     * Scroll to bottom of page
     */
    scrollToBottom() {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });

        this.emit('scrolled_to_bottom');
    }

    /**
     * Get current navigation state
     */
    getNavigationState() {
        return {
            scrollPosition: this.state.scrollPosition,
            scrollDirection: this.state.scrollDirection,
            isAtTop: this.state.isAtTop,
            scrollProgress: this.getScrollProgress(),
            navigationVisible: this.state.navigationVisible,
            isScrolling: this.isScrolling
        };
    }

    /**
     * Reset navigation state
     */
    reset() {
        this.currentScrollPosition = 0;
        this.isScrolling = false;
        
        this.setState({
            scrollPosition: 0,
            scrollDirection: 'up',
            isAtTop: true,
            navigationVisible: true
        });

        this.log('Navigation state reset');
    }
}