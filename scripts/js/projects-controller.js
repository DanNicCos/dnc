/**
 * Projects Controller - Manages project showcase section
 * Handles project navigation, expansion, filtering, and animations
 */

class ProjectsController {
    constructor() {
        this.projects = window.projectsData || [];
        this.currentProjectIndex = 0;
        this.isExpanded = false;
        this.autoRotateTimer = null;
        this.autoRotateInterval = 15000; // 15 seconds
        
        // DOM elements
        this.elements = {};
        this.findElements();
        
        // Initialize
        this.init();
    }

    findElements() {
        this.elements = {
            container: document.getElementById('projectsContainer'),
            navigator: document.querySelector('.projects-navigator'),
            currentProject: document.querySelector('.current-project'),
            projectCard: document.querySelector('.project-card'),
            projectTitle: document.querySelector('.project-title'),
            projectSubtitle: document.querySelector('.project-subtitle'),
            projectDescription: document.querySelector('.project-description'),
            projectDetails: document.getElementById('projectDetails'),
            techStack: document.querySelector('.tech-stack'),
            projectMetrics: document.querySelector('.project-metrics'),
            navigationDots: document.querySelector('.navigation-dots'),
            expandButton: document.getElementById('expandProjectBtn'),
            prevButton: document.querySelector('.prev-project'),
            nextButton: document.querySelector('.next-project'),
            currentProjectNum: document.getElementById('currentProjectNum'),
            totalProjectsNum: document.getElementById('totalProjectsNum'),
            projectStatus: document.querySelector('.project-status')
        };
    }

    init() {
        if (!this.elements.container || this.projects.length === 0) {
            console.warn('Projects controller initialization failed - missing elements or data');
            return;
        }

        this.setupEventListeners();
        this.createNavigationDots();
        this.displayCurrentProject();
        this.startAutoRotate();
        
        console.log('✅ Projects controller initialized');
    }

    setupEventListeners() {
        // Project navigation
        if (this.elements.prevButton) {
            this.elements.prevButton.addEventListener('click', () => this.previousProject());
        }
        
        if (this.elements.nextButton) {
            this.elements.nextButton.addEventListener('click', () => this.nextProject());
        }

        // Project expansion
        if (this.elements.expandButton) {
            this.elements.expandButton.addEventListener('click', () => this.toggleProjectDetails());
        }

        // Card click for expansion
        if (this.elements.projectCard) {
            this.elements.projectCard.addEventListener('click', (e) => {
                // Only expand if not clicking on navigation buttons
                if (!e.target.closest('.project-nav') && !e.target.closest('.expand-project-btn')) {
                    this.toggleProjectDetails();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Pause auto-rotate on hover
        if (this.elements.container) {
            this.elements.container.addEventListener('mouseenter', () => this.pauseAutoRotate());
            this.elements.container.addEventListener('mouseleave', () => this.startAutoRotate());
        }
    }

    createNavigationDots() {
        if (!this.elements.navigationDots) return;

        this.elements.navigationDots.innerHTML = '';
        
        this.projects.forEach((project, index) => {
            const dot = document.createElement('button');
            dot.className = `nav-dot ${index === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `View ${project.title}`);
            dot.addEventListener('click', () => this.goToProject(index));
            
            // Add project identifier
            const identifier = document.createElement('span');
            identifier.className = 'dot-label';
            identifier.textContent = project.id.toUpperCase();
            dot.appendChild(identifier);
            
            this.elements.navigationDots.appendChild(dot);
        });
    }

    displayCurrentProject() {
        const project = this.projects[this.currentProjectIndex];
        if (!project) return;

        // Update main content
        if (this.elements.projectTitle) {
            this.elements.projectTitle.textContent = project.title;
        }
        
        if (this.elements.projectSubtitle) {
            this.elements.projectSubtitle.textContent = project.subtitle;
        }
        
        if (this.elements.projectDescription) {
            this.elements.projectDescription.textContent = project.description;
        }

        if (this.elements.projectStatus) {
            this.elements.projectStatus.textContent = project.status;
        }

        // Update project counter
        if (this.elements.currentProjectNum) {
            this.elements.currentProjectNum.textContent = String(this.currentProjectIndex + 1).padStart(2, '0');
        }
        
        if (this.elements.totalProjectsNum) {
            this.elements.totalProjectsNum.textContent = String(this.projects.length).padStart(2, '0');
        }

        // Update tech stack
        this.displayTechStack(project.techStack);
        
        // Update metrics
        this.displayMetrics(project.metrics);
        
        // Update navigation dots
        this.updateNavigationDots();
        
        // Update project card styling based on category
        this.updateProjectStyling(project);

        console.log(`📊 Displaying project: ${project.title}`);
    }

    displayTechStack(techStack) {
        if (!this.elements.techStack || !techStack) return;
        
        this.elements.techStack.innerHTML = '';
        
        techStack.forEach(tech => {
            const badge = document.createElement('span');
            badge.className = 'tech-badge';
            badge.textContent = tech;
            this.elements.techStack.appendChild(badge);
        });
    }

    displayMetrics(metrics) {
        if (!this.elements.projectMetrics || !metrics) return;
        
        this.elements.projectMetrics.innerHTML = '';
        
        Object.entries(metrics).forEach(([key, value]) => {
            const metric = document.createElement('div');
            metric.className = 'metric-item';
            metric.innerHTML = `
                <span class="metric-label">${key}</span>
                <span class="metric-value">${value}</span>
            `;
            this.elements.projectMetrics.appendChild(metric);
        });
    }

    updateNavigationDots() {
        const dots = this.elements.navigationDots?.querySelectorAll('.nav-dot');
        if (!dots) return;
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentProjectIndex);
        });
    }

    updateProjectStyling(project) {
        if (!this.elements.projectCard) return;
        
        // Remove existing category classes
        this.elements.projectCard.classList.remove('ai-agents', 'productivity-ai', 'education-tech');
        
        // Add category-specific styling
        const categoryClass = project.category.toLowerCase().replace(/\s+/g, '-');
        this.elements.projectCard.classList.add(categoryClass);
    }

    toggleProjectDetails() {
        this.isExpanded = !this.isExpanded;
        
        if (this.elements.projectDetails) {
            this.elements.projectDetails.classList.toggle('expanded', this.isExpanded);
        }
        
        if (this.elements.expandButton) {
            this.elements.expandButton.setAttribute('aria-expanded', this.isExpanded);
            const buttonText = this.elements.expandButton.querySelector('.btn-label');
            if (buttonText) {
                buttonText.textContent = this.isExpanded ? 'hide --details' : 'show --details';
            }
        }

        // Update project details content
        if (this.isExpanded) {
            this.displayExpandedContent();
        }

        // Pause auto-rotate when expanded
        if (this.isExpanded) {
            this.pauseAutoRotate();
        } else {
            this.startAutoRotate();
        }

        console.log(`Project details ${this.isExpanded ? 'expanded' : 'collapsed'}`);
    }

    displayExpandedContent() {
        const project = this.projects[this.currentProjectIndex];
        if (!project || !this.elements.projectDetails) return;

        // Create expanded content HTML
        const expandedHTML = `
            <div class="expanded-project-content">
                <div class="project-overview">
                    <h4>Overview</h4>
                    <p>${project.longDescription}</p>
                </div>
                
                <div class="project-highlights">
                    <h4>Key Features</h4>
                    <ul>
                        ${project.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="project-challenges">
                    <h4>Technical Challenges</h4>
                    ${project.challenges.map(challenge => `
                        <div class="challenge-item">
                            <strong>Challenge:</strong> ${challenge.problem}<br>
                            <strong>Solution:</strong> ${challenge.solution}
                        </div>
                    `).join('')}
                </div>
                
                ${project.links.github ? `
                    <div class="project-links">
                        <a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="project-link">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                            </svg>
                            View on GitHub
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.elements.projectDetails.innerHTML = expandedHTML;
    }

    // Navigation methods
    nextProject() {
        this.currentProjectIndex = (this.currentProjectIndex + 1) % this.projects.length;
        this.displayCurrentProject();
        this.resetAutoRotate();
    }

    previousProject() {
        this.currentProjectIndex = (this.currentProjectIndex - 1 + this.projects.length) % this.projects.length;
        this.displayCurrentProject();
        this.resetAutoRotate();
    }

    goToProject(index) {
        if (index >= 0 && index < this.projects.length) {
            this.currentProjectIndex = index;
            this.displayCurrentProject();
            this.resetAutoRotate();
        }
    }

    handleKeyboard(event) {
        if (!this.elements.container?.matches(':hover')) return;

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousProject();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextProject();
                break;
            case ' ':
            case 'Enter':
                if (event.target === this.elements.container) {
                    event.preventDefault();
                    this.toggleProjectDetails();
                }
                break;
        }
    }

    // Auto-rotation methods
    startAutoRotate() {
        if (this.isExpanded) return;
        
        this.clearAutoRotate();
        this.autoRotateTimer = setInterval(() => {
            if (!this.isExpanded && !this.elements.container?.matches(':hover')) {
                this.nextProject();
            }
        }, this.autoRotateInterval);
    }

    pauseAutoRotate() {
        this.clearAutoRotate();
    }

    resetAutoRotate() {
        this.clearAutoRotate();
        this.startAutoRotate();
    }

    clearAutoRotate() {
        if (this.autoRotateTimer) {
            clearInterval(this.autoRotateTimer);
            this.autoRotateTimer = null;
        }
    }

    // Public API
    getCurrentProject() {
        return this.projects[this.currentProjectIndex];
    }

    getState() {
        return {
            currentProject: this.currentProjectIndex,
            isExpanded: this.isExpanded,
            totalProjects: this.projects.length
        };
    }

    destroy() {
        this.clearAutoRotate();
        // Remove event listeners if needed
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.projectsController = new ProjectsController();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectsController;
}