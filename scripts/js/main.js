/**
 * Main Application Script - Updated with Content Panel Controller
 * Initializes all components and handles global functionality
 */

class DanNicCosApp {
    constructor() {
        this.terminalController = null;
        this.contentPanelController = null; // NEW: Content panel controller
        this.projectsController = null; // NEW: Projects controller
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }

    onDOMReady() {
        console.log('🚀 DanNicCos site initializing...');
        
        try {
            this.initializeComponents();
            this.setupEventListeners();
            this.initializeAccessibility();
            this.isInitialized = true;
            
            console.log('✅ Site initialization complete');
        } catch (error) {
            console.error('❌ Error during site initialization:', error);
        }
    }

    initializeComponents() {
        // Initialize terminal controller
        this.initTerminalController();
        
        // NEW: Initialize content panel controller
        this.initContentPanelController();
        
        // NEW: Initialize projects controller
        this.initProjectsController();
        
        // Initialize any quote rotation if utils.ts is available
        this.initQuoteRotation();
        
        // Initialize smooth scrolling
        this.initSmoothScrolling();
    }

    initTerminalController() {
        try {
            this.terminalController = new TerminalController('terminalContainer', {
                autoStart: true,
                autoRotate: true,
                rotateInterval: 10000, // 10 seconds between auto-rotations
                typingSpeed: 50
            });
            
            console.log('✅ Terminal controller initialized');
        } catch (error) {
            console.warn('⚠️ Terminal controller initialization failed:', error.message);
        }
    }

    // NEW: Initialize content panel controller
    initContentPanelController() {
        try {
            // The ContentPanelController initializes itself on DOMContentLoaded
            // We just need to store a reference if it exists
            setTimeout(() => {
                if (window.contentPanelController) {
                    this.contentPanelController = window.contentPanelController;
                    console.log('✅ Content panel controller initialized');
                }
            }, 100);
        } catch (error) {
            console.warn('⚠️ Content panel controller initialization failed:', error.message);
        }
    }

    // NEW: Initialize projects controller
    initProjectsController() {
        try {
            // The ProjectsController initializes itself on DOMContentLoaded
            // We just need to store a reference if it exists
            setTimeout(() => {
                if (window.projectsController) {
                    this.projectsController = window.projectsController;
                    console.log('✅ Projects controller initialized');
                }
            }, 150);
        } catch (error) {
            console.warn('⚠️ Projects controller initialization failed:', error.message);
        }
    }

    initQuoteRotation() {
        // Check if quote rotation is available from utils.ts
        if (typeof startQuoteRotation === 'function') {
            const quoteElement = document.querySelector('.quote');
            if (quoteElement) {
                startQuoteRotation(4000); // 4 second intervals
                console.log('✅ Quote rotation initialized');
            }
        }
    }

    initSmoothScrolling() {
        // Enhanced smooth scrolling for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupEventListeners() {
        // Home icon click handler
        const homeIcon = document.querySelector('.home-icon');
        if (homeIcon) {
            homeIcon.addEventListener('click', this.handleHomeClick.bind(this));
        }

        // Brand name click handler with glitch effect
        const brandName = document.querySelector('.brand-name');
        if (brandName) {
            brandName.addEventListener('click', this.handleBrandClick.bind(this));
        }

        // Handle window resize for responsive adjustments
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Handle keyboard navigation
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));

        console.log('✅ Event listeners setup complete');
    }

    initializeAccessibility() {
        // Add skip to main content link for screen readers
        this.addSkipLink();
        
        // Enhance focus management
        this.setupFocusManagement();
        
        // Add ARIA labels where needed
        this.enhanceARIA();
        
        console.log('✅ Accessibility enhancements applied');
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
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
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add id to main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }

    setupFocusManagement() {
        // Improve focus visibility
        const style = document.createElement('style');
        style.textContent = `
            .focus-visible {
                outline: 2px solid var(--color-primary);
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    enhanceARIA() {
        // Add ARIA labels to interactive elements that need them
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach((link, index) => {
            if (!link.getAttribute('aria-label')) {
                const href = link.getAttribute('href');
                if (href.includes('github')) {
                    link.setAttribute('aria-label', 'Visit GitHub profile');
                } else if (href.includes('x.com') || href.includes('twitter')) {
                    link.setAttribute('aria-label', 'Visit X (Twitter) profile');
                } else if (href.includes('substack')) {
                    link.setAttribute('aria-label', 'Visit Substack newsletter');
                }
            }
        });

        // Add role and aria-label to terminal container
        const terminalContainer = document.getElementById('terminalContainer');
        if (terminalContainer) {
            terminalContainer.setAttribute('role', 'application');
            terminalContainer.setAttribute('aria-label', 'Interactive code terminal - click to cycle through code examples');
            terminalContainer.setAttribute('tabindex', '0');
        }
    }

    // Event Handlers
    handleHomeClick(event) {
        event.preventDefault();
        
        // Scroll to top smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        console.log('🏠 Home clicked - scrolled to top');
    }

    handleBrandClick(event) {
        // Add extra glitch effect on click
        const brandName = event.target;
        brandName.style.animation = 'none';
        brandName.offsetHeight; // Trigger reflow
        brandName.style.animation = 'glitch 0.3s ease-in-out, gradient-shift 8s ease infinite';
        
        console.log('✨ Brand name clicked - glitch effect triggered');
    }

    handleResize() {
        // Handle any resize-specific logic
        if (this.terminalController) {
            // Could add responsive terminal adjustments here
            console.log('📱 Window resized');
        }
    }

    handleVisibilityChange() {
        if (document.hidden && this.terminalController) {
            // Pause terminal when tab is not visible
            this.terminalController.pauseDemo();
        } else if (this.terminalController) {
            // Resume terminal when tab becomes visible
            this.terminalController.resumeDemo();
        }
    }

    handleGlobalKeydown(event) {
        // Global keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'k':
                    // Ctrl+K to focus on terminal
                    event.preventDefault();
                    const terminalContainer = document.getElementById('terminalContainer');
                    if (terminalContainer) {
                        terminalContainer.focus();
                        terminalContainer.scrollIntoView({ behavior: 'smooth' });
                    }
                    break;
            }
        }

        // Terminal-specific shortcuts (when terminal is focused)
        const terminalContainer = document.getElementById('terminalContainer');
        if (document.activeElement === terminalContainer) {
            switch (event.key) {
                case 'Escape':
                    event.preventDefault();
                    terminalContainer.blur();
                    break;
            }
        }
    }

    onTerminalStatusChange(detail) {
        console.log(`🖥️ Terminal status changed to: ${detail.status}`);
        
        // Could add analytics tracking here
        // Could add additional UI feedback here
    }

    // Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API
    getTerminalController() {
        return this.terminalController;
    }

    // NEW: Content panel control methods
    getContentPanelController() {
        return this.contentPanelController;
    }

    expandContentPanel() {
        if (this.contentPanelController) {
            this.contentPanelController.expand();
        }
    }

    collapseContentPanel() {
        if (this.contentPanelController) {
            this.contentPanelController.collapse();
        }
    }

    // NEW: Projects control methods
    getProjectsController() {
        return this.projectsController;
    }

    nextProject() {
        if (this.projectsController) {
            this.projectsController.nextProject();
        }
    }

    previousProject() {
        if (this.projectsController) {
            this.projectsController.previousProject();
        }
    }

    goToProject(index) {
        if (this.projectsController) {
            this.projectsController.goToProject(index);
        }
    }

    isReady() {
        return this.isInitialized;
    }

    // Terminal control methods for external use
    nextCodeExample() {
        if (this.terminalController) {
            this.terminalController.nextSnippet();
        }
    }

    previousCodeExample() {
        if (this.terminalController) {
            this.terminalController.previousSnippet();
        }
    }

    toggleTerminalSound() {
        if (this.terminalController) {
            this.terminalController.toggleSound();
        }
    }

    pauseTerminal() {
        if (this.terminalController) {
            this.terminalController.pauseDemo();
        }
    }

    resumeTerminal() {
        if (this.terminalController) {
            this.terminalController.resumeDemo();
        }
    }

    getTerminalState() {
        if (this.terminalController) {
            return this.terminalController.getState();
        }
        return null;
    }
}

// Initialize the application
const app = new DanNicCosApp();

// Make app available globally for debugging
if (typeof window !== 'undefined') {
    window.DanNicCosApp = app;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DanNicCosApp;
}