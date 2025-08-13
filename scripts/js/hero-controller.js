/**
 * Hero Controller - Handles hero section interactions
 * Manages the expand/collapse functionality for hero details
 */

class HeroController {
    constructor() {
        this.isExpanded = false;
        this.elements = {};
        
        this.init();
    }

    init() {
        this.findElements();
        
        if (!this.elements.expandButton || !this.elements.details) {
            console.warn('Hero controller: Required elements not found');
            return;
        }

        this.setupEventListeners();
        console.log('✅ Hero controller initialized');
    }

    findElements() {
        this.elements = {
            expandButton: document.getElementById('heroExpand'),
            details: document.getElementById('heroDetails'),
            arrow: document.querySelector('.expand-arrow')
        };
    }

    setupEventListeners() {
        // Handle expand button click
        this.elements.expandButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleDetails();
        });

        // Handle keyboard interaction
        this.elements.expandButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleDetails();
            }
        });
    }

    toggleDetails() {
        this.isExpanded = !this.isExpanded;
        
        // Update button state
        this.elements.expandButton.setAttribute('aria-expanded', this.isExpanded);
        
        // Update details visibility
        this.elements.details.setAttribute('aria-hidden', !this.isExpanded);
        
        // Add/remove expanded class for CSS transition
        if (this.isExpanded) {
            this.elements.details.classList.add('expanded');
            this.elements.expandButton.querySelector('.expand-prompt').textContent = '$ cat about.md --less';
        } else {
            this.elements.details.classList.remove('expanded');
            this.elements.expandButton.querySelector('.expand-prompt').textContent = '$ cat about.md';
        }
        
        console.log(`Hero details ${this.isExpanded ? 'expanded' : 'collapsed'}`);
    }

    // Public API
    getState() {
        return {
            isExpanded: this.isExpanded
        };
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.heroController = new HeroController();
    });
} else {
    window.heroController = new HeroController();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeroController;
}