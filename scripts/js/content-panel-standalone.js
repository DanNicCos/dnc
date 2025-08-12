/**
 * Standalone Content Panel Controller
 * Simple implementation without dependencies for reliable functionality
 */

class ContentPanelController {
    constructor() {
        this.showMoreBtn = document.getElementById('showMoreBtn');
        this.expandedContent = document.getElementById('expandedContent');
        this.isExpanded = false;
        
        this.init();
    }

    init() {
        if (!this.showMoreBtn || !this.expandedContent) {
            console.warn('Content panel elements not found');
            return;
        }

        // Set up event listeners
        this.showMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleContent();
        });
        
        // Handle keyboard navigation
        this.showMoreBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleContent();
            }
        });
        
        console.log('✅ Content panel controller initialized');
    }

    toggleContent() {
        this.isExpanded = !this.isExpanded;
        
        if (this.isExpanded) {
            this.showContent();
        } else {
            this.hideContent();
        }
        
        // Update ARIA attributes
        this.showMoreBtn.setAttribute('aria-expanded', this.isExpanded);
        this.expandedContent.setAttribute('aria-hidden', !this.isExpanded);
        
        console.log(`Content panel ${this.isExpanded ? 'expanded' : 'collapsed'}`);
    }

    showContent() {
        // Add show class to trigger CSS animation
        this.expandedContent.classList.add('show');
        
        // Optional: Scroll to ensure content is visible
        setTimeout(() => {
            const rect = this.expandedContent.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            if (rect.bottom > viewportHeight) {
                this.expandedContent.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }, 100);
    }

    hideContent() {
        // Remove show class to trigger CSS animation
        this.expandedContent.classList.remove('show');
        
        // Optional: Scroll back to button
        setTimeout(() => {
            this.showMoreBtn.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    }

    expand() {
        if (!this.isExpanded) {
            this.toggleContent();
        }
    }

    collapse() {
        if (this.isExpanded) {
            this.toggleContent();
        }
    }

    getState() {
        return {
            isExpanded: this.isExpanded
        };
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.contentPanelController = new ContentPanelController();
    });
} else {
    window.contentPanelController = new ContentPanelController();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentPanelController;
}