/**
 * Content Panel Controller
 * Handles the show/hide functionality for the expanded content
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
        this.showMoreBtn.addEventListener('click', this.toggleContent.bind(this));
        
        // Handle keyboard navigation
        this.showMoreBtn.addEventListener('keydown', this.handleKeydown.bind(this));
        
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
            this.expandedContent.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 250); // Wait for animation to start
    }

    hideContent() {
        // Remove show class to trigger hide animation
        this.expandedContent.classList.remove('show');
        
        // Optional: Scroll back to button
        setTimeout(() => {
            this.showMoreBtn.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    }

    handleKeydown(event) {
        // Handle Enter and Space keys
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleContent();
        }
    }

    // Public API methods
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.contentPanelController = new ContentPanelController();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentPanelController;
}