/**
 * Terminal Controller - Main orchestrator for interactive terminal
 * Manages code snippets, typing animation, user interaction, and state
 */

class TerminalController {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            autoStart: true,
            autoRotate: true,
            rotateInterval: 8000,
            typingSpeed: 60,
            ...options
        };
        
        // State
        this.currentSnippetIndex = 0;
        this.isTyping = false;
        this.isPaused = false;
        this.isUserInteracting = false;
        this.autoRotateTimer = null;
        
        // Get code snippets
        this.snippets = window.codeSnippets || [];
        
        // DOM elements
        this.elements = {};
        this.findElements();
        
        // Components
        this.typingEngine = null;
        this.soundManager = window.soundManager;
        
        // Initialize
        this.init();
    }

    findElements() {
        if (!this.container) {
            throw new Error('Terminal container not found');
        }

        this.elements = {
            container: this.container,
            title: this.container.querySelector('#terminalTitle'),
            output: this.container.querySelector('#codeOutput'),
            cursor: this.container.querySelector('#terminalCursor'),
            status: this.container.querySelector('#statusIndicator'),
            soundToggle: this.container.querySelector('#soundToggle'),
            statusText: this.container.querySelector('.status-text')
        };

        // Validate required elements
        const required = ['output', 'cursor', 'status'];
        for (const key of required) {
            if (!this.elements[key]) {
                console.error(`Required terminal element not found: ${key}`);
            }
        }
    }

    init() {
        console.log('🖥️ Terminal controller initializing...');
        
        // Initialize typing engine
        this.typingEngine = new TypingEngine(this.elements.output, {
            baseSpeed: this.options.typingSpeed,
            speedVariation: 20,
            pauseChance: 0.08,
            errorChance: 0.015
        });

        // Set up event listeners
        this.setupEventListeners();
        
        // Set up typing callbacks
        this.setupTypingCallbacks();
        
        // Initialize UI state
        this.updateUI();
        
        // Auto-start if enabled
        if (this.options.autoStart && this.snippets.length > 0) {
            setTimeout(() => this.startDemo(), 1000);
        }
        
        console.log('✅ Terminal controller initialized');
    }

    setupEventListeners() {
        // Container click - cycle to next snippet
        this.elements.container.addEventListener('click', (e) => {
            // Don't trigger on sound toggle clicks
            if (e.target.closest('.sound-toggle')) return;
            
            this.handleUserInteraction();
        });

        // Sound toggle
        if (this.elements.soundToggle) {
            this.elements.soundToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSound();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.terminal-container')) {
                this.handleKeydown(e);
            }
        });

        // Visibility change - pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseDemo();
            } else {
                this.resumeDemo();
            }
        });

        // Window focus events
        window.addEventListener('blur', () => this.pauseDemo());
        window.addEventListener('focus', () => this.resumeDemo());
    }

    setupTypingCallbacks() {
        this.typingEngine.onTypingProgress((current, total) => {
            this.updateProgress(current, total);
        });

        this.typingEngine.onTypingComplete(() => {
            this.onTypingComplete();
        });

        this.typingEngine.onTypingError((error) => {
            console.error('Typing error:', error);
            this.setState('error');
        });
    }

    // Main demo control
    async startDemo() {
        if (this.snippets.length === 0) {
            console.warn('No code snippets available');
            return;
        }

        console.log('🚀 Starting terminal demo');
        
        // Play startup sound
        if (this.soundManager) {
            this.soundManager.playStartup();
        }

        // Set initial state
        this.setState('typing');
        this.updateTerminalTitle();
        
        // Start typing current snippet
        await this.typeCurrentSnippet();
        
        // Set up auto-rotation if enabled
        if (this.options.autoRotate) {
            this.startAutoRotation();
        }
    }

    async typeCurrentSnippet() {
        const snippet = this.snippets[this.currentSnippetIndex];
        if (!snippet) return;

        try {
            this.isTyping = true;
            this.updateUI();
            
            // Clear previous content
            this.elements.output.textContent = '';
            
            // Update title
            this.updateTerminalTitle(snippet.title);
            
            // Type the code
            await this.typingEngine.typeText(snippet.code, snippet.language);
            
        } catch (error) {
            console.error('Error typing snippet:', error);
            this.setState('error');
        } finally {
            this.isTyping = false;
        }
    }

    onTypingComplete() {
        this.setState('completed');
        this.updateUI();
        
        console.log(`✅ Completed typing snippet: ${this.snippets[this.currentSnippetIndex]?.id}`);
    }

    // User interaction
    handleUserInteraction() {
        this.isUserInteracting = true;
        
        // Stop auto-rotation temporarily
        this.stopAutoRotation();
        
        // Move to next snippet
        this.nextSnippet();
        
        // Resume auto-rotation after a delay
        setTimeout(() => {
            this.isUserInteracting = false;
            if (this.options.autoRotate) {
                this.startAutoRotation();
            }
        }, 5000);
    }

    handleKeydown(e) {
        switch (e.key) {
            case ' ':
            case 'ArrowRight':
                e.preventDefault();
                this.nextSnippet();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previousSnippet();
                break;
            case 'p':
            case 'Pause':
                e.preventDefault();
                this.togglePause();
                break;
            case 's':
                e.preventDefault();
                this.toggleSound();
                break;
            case 'r':
                e.preventDefault();
                this.restartCurrentSnippet();
                break;
        }
    }

    // Snippet navigation
    nextSnippet() {
        this.currentSnippetIndex = (this.currentSnippetIndex + 1) % this.snippets.length;
        this.typeCurrentSnippet();
    }

    previousSnippet() {
        this.currentSnippetIndex = this.currentSnippetIndex === 0 
            ? this.snippets.length - 1 
            : this.currentSnippetIndex - 1;
        this.typeCurrentSnippet();
    }

    restartCurrentSnippet() {
        this.typeCurrentSnippet();
    }

    // Auto-rotation
    startAutoRotation() {
        if (this.autoRotateTimer) {
            clearInterval(this.autoRotateTimer);
        }
        
        this.autoRotateTimer = setInterval(() => {
            if (!this.isUserInteracting && !this.isPaused) {
                this.nextSnippet();
            }
        }, this.options.rotateInterval);
    }

    stopAutoRotation() {
        if (this.autoRotateTimer) {
            clearInterval(this.autoRotateTimer);
            this.autoRotateTimer = null;
        }
    }

    // Playback control
    togglePause() {
        if (this.isPaused) {
            this.resumeDemo();
        } else {
            this.pauseDemo();
        }
    }

    pauseDemo() {
        this.isPaused = true;
        this.typingEngine.pause();
        this.stopAutoRotation();
        this.setState('paused');
        this.updateUI();
    }

    resumeDemo() {
        this.isPaused = false;
        this.typingEngine.resume();
        if (this.options.autoRotate && !this.isUserInteracting) {
            this.startAutoRotation();
        }
        this.setState('typing');
        this.updateUI();
    }

    // Sound control
    toggleSound() {
        if (this.soundManager) {
            const isEnabled = this.soundManager.isAudioEnabled();
            this.soundManager.setEnabled(!isEnabled);
            this.updateSoundToggleUI();
        }
    }

    updateSoundToggleUI() {
        if (this.elements.soundToggle && this.soundManager) {
            const isEnabled = this.soundManager.isAudioEnabled();
            this.elements.soundToggle.classList.toggle('muted', !isEnabled);
            this.elements.soundToggle.setAttribute('aria-label', 
                isEnabled ? 'Mute sound' : 'Unmute sound');
        }
    }

    // State management
    setState(state) {
        // Remove existing state classes
        const states = ['typing', 'paused', 'completed', 'error', 'idle'];
        states.forEach(s => this.elements.container.classList.remove(s));
        
        // Add new state
        this.elements.container.classList.add(state);
        
        // Update status indicator
        if (this.elements.status) {
            this.elements.status.className = `status-indicator ${state}`;
        }
    }

    // UI updates
    updateUI() {
        this.updateProgress();
        this.updateTerminalTitle();
        this.updateStatusText();
        this.updateSoundToggleUI();
    }

    updateProgress(current, total) {
        // Could add a progress bar here if needed
        if (current && total) {
            const percentage = Math.round((current / total) * 100);
            console.log(`Typing progress: ${percentage}%`);
        }
    }

    updateTerminalTitle(customTitle) {
        if (this.elements.title) {
            const snippet = this.snippets[this.currentSnippetIndex];
            const title = customTitle || snippet?.title || '~/projects';
            this.elements.title.textContent = title;
        }
    }

    updateStatusText() {
        if (this.elements.statusText) {
            let text = 'Click anywhere to see next project';
            
            if (this.isPaused) {
                text = 'Paused - click to continue';
            } else if (this.isTyping) {
                text = 'Typing... click to skip';
            }
            
            this.elements.statusText.textContent = text;
        }
    }

    // Public API
    getCurrentSnippet() {
        return this.snippets[this.currentSnippetIndex];
    }

    getSnippetCount() {
        return this.snippets.length;
    }

    getCurrentIndex() {
        return this.currentSnippetIndex;
    }

    setSnippet(index) {
        if (index >= 0 && index < this.snippets.length) {
            this.currentSnippetIndex = index;
            this.typeCurrentSnippet();
        }
    }

    getState() {
        return {
            isTyping: this.isTyping,
            isPaused: this.isPaused,
            currentIndex: this.currentSnippetIndex,
            snippetCount: this.snippets.length
        };
    }

    // Configuration
    setTypingSpeed(speed) {
        this.options.typingSpeed = speed;
        this.typingEngine.setSpeed(speed);
    }

    setAutoRotate(enabled) {
        this.options.autoRotate = enabled;
        if (enabled) {
            this.startAutoRotation();
        } else {
            this.stopAutoRotation();
        }
    }

    // Cleanup
    destroy() {
        console.log('🛑 Destroying terminal controller');
        
        this.stopAutoRotation();
        
        if (this.typingEngine) {
            this.typingEngine.destroy();
        }
        
        // Remove event listeners
        this.elements.container.removeEventListener('click', this.handleUserInteraction);
        
        // Clear references
        this.container = null;
        this.elements = {};
        this.typingEngine = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerminalController;
} else {
    window.TerminalController = TerminalController;
}