/**
 * Projects Renderer - Creates and manages the projects grid
 * Renders project cards dynamically from project data
 */

class ProjectsRenderer {
    constructor() {
        this.projects = [];
        this.expandedProjects = new Set();
        
        this.init();
    }

    async init() {
        try {
            // Load projects data
            const { projectsData } = await import('./projects-data.js');
            this.projects = projectsData || [];
            
            if (this.projects.length === 0) {
                console.warn('No projects data found');
                return;
            }

            this.renderProjects();
            this.setupEventListeners();
            
            console.log('✅ Projects renderer initialized with', this.projects.length, 'projects');
        } catch (error) {
            console.error('❌ Failed to initialize projects renderer:', error);
        }
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid) {
            console.warn('Projects grid container not found');
            return;
        }

        projectsGrid.innerHTML = '';
        
        this.projects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            projectsGrid.appendChild(projectCard);
        });
    }

    createProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.projectId = project.id;
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="project-header">
                <div class="project-info">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-subtitle">${project.subtitle}</p>
                    <span class="project-category">${project.category}</span>
                </div>
                <div class="project-status">${project.status}</div>
            </div>
            
            <div class="project-content">
                <p class="project-description">${project.description}</p>
                
                <div class="project-tech">
                    <div class="tech-stack">
                        ${project.techStack.map(tech => 
                            `<span class="tech-badge">${tech}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="project-actions">
                    <button class="project-expand" data-project-id="${project.id}">
                        <span>$ more --details</span>
                        <span>↓</span>
                    </button>
                    
                    <div class="project-links">
                        ${project.links.github ? `
                            <a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="project-link">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                                </svg>
                            </a>
                        ` : ''}
                        ${project.links.demo ? `
                            <a href="${project.links.demo}" target="_blank" rel="noopener noreferrer" class="project-link">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="project-details" id="details-${project.id}">
                <!-- Details content will be generated when expanded -->
            </div>
        `;

        return card;
    }

    setupEventListeners() {
        // Handle expand/collapse buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.project-expand')) {
                e.preventDefault();
                const button = e.target.closest('.project-expand');
                const projectId = button.dataset.projectId;
                this.toggleProjectDetails(projectId);
            }
        });

        // Handle card clicks (expand on click)
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (card && !e.target.closest('.project-actions') && !e.target.closest('a')) {
                e.preventDefault();
                const projectId = card.dataset.projectId;
                this.toggleProjectDetails(projectId);
            }
        });
    }

    toggleProjectDetails(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        const detailsEl = document.getElementById(`details-${projectId}`);
        const expandButton = document.querySelector(`[data-project-id="${projectId}"]`);
        
        if (!project || !detailsEl || !expandButton) return;

        const isExpanded = this.expandedProjects.has(projectId);

        if (isExpanded) {
            // Collapse
            detailsEl.classList.remove('expanded');
            detailsEl.setAttribute('aria-hidden', 'true');
            expandButton.querySelector('span:last-child').textContent = '↓';
            expandButton.querySelector('span:first-child').textContent = '$ more --details';
            this.expandedProjects.delete(projectId);
        } else {
            // Expand
            this.renderProjectDetails(project, detailsEl);
            detailsEl.classList.add('expanded');
            detailsEl.setAttribute('aria-hidden', 'false');
            expandButton.querySelector('span:last-child').textContent = '↑';
            expandButton.querySelector('span:first-child').textContent = '$ less --details';
            this.expandedProjects.add(projectId);
        }

        console.log(`Project ${projectId} ${isExpanded ? 'collapsed' : 'expanded'}`);
    }

    renderProjectDetails(project, container) {
        container.innerHTML = `
            <div class="project-details-content">
                <div class="details-section">
                    <h4 class="details-title">Overview</h4>
                    <p class="details-text">${project.longDescription}</p>
                </div>
                
                <div class="details-section">
                    <h4 class="details-title">Key Highlights</h4>
                    <ul class="highlights-list">
                        ${project.highlights.map(highlight => 
                            `<li>${highlight}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="details-section">
                    <h4 class="details-title">Technical Challenges</h4>
                    ${project.challenges.map(challenge => `
                        <div class="challenge-item">
                            <div class="challenge-problem">Problem: ${challenge.problem}</div>
                            <div class="challenge-solution">Solution: ${challenge.solution}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="details-section">
                    <h4 class="details-title">Project Metrics</h4>
                    <div class="project-metrics">
                        ${Object.entries(project.metrics).map(([key, value]) => `
                            <div class="metric-item">
                                <span class="metric-label">${key}</span>
                                <span class="metric-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Public API
    getProjects() {
        return this.projects;
    }

    getExpandedProjects() {
        return Array.from(this.expandedProjects);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.projectsRenderer = new ProjectsRenderer();
    });
} else {
    window.projectsRenderer = new ProjectsRenderer();
}

// Export for module systems
export { ProjectsRenderer };