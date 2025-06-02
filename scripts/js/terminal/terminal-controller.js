/**
 * Terminal Controller - Updated with better timing and title synchronization
 * Manages code snippets, typing animation, user interaction, and state
 */

class TerminalController {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            autoStart: true,
            autoRotate: true,
            rotateInterval: 30000, // INCREASED: 30 seconds (was 8000)
            typingSpeed: 60,
            waitAfterComplete: 5000, // NEW: Wait 5 seconds after typing completes
            ...options
        };
        
        // State
        this.currentSnippetIndex = 0;
        this.isTyping = false;
        this.isPaused = false;
        this.isUserInteracting = false;
        this.autoRotateTimer = null;
        this.typingCompleteTimer = null; // NEW: Timer for post-typing delay
        
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

        // Start typing current snippet
        await this.typeCurrentSnippet();
    }

    async typeCurrentSnippet() {
        const snippet = this.snippets[this.currentSnippetIndex];
        if (!snippet) return;

        try {
            this.isTyping = true;
            this.setState('typing');
            
            // IMPORTANT: Update title BEFORE typing starts
            this.updateTerminalTitle(snippet.title);
            this.updateUI();
            
            // Clear previous content
            this.elements.output.textContent = '';
            
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
        
        // NEW: Start delayed auto-rotation after typing completes
        this.scheduleNextRotation();
    }

    // NEW: Schedule next rotation with proper timing
    scheduleNextRotation() {
        // Clear any existing timers
        this.clearRotationTimers();
        
        // Only schedule if auto-rotate is enabled and user isn't interacting
        if (this.options.autoRotate && !this.isUserInteracting && !this.isPaused) {
            this.typingCompleteTimer = setTimeout(() => {
                this.nextSnippet();
            }, this.options.waitAfterComplete);
        }
    }

    // NEW: Clear all rotation timers
    clearRotationTimers() {
        if (this.autoRotateTimer) {
            clearInterval(this.autoRotateTimer);
            this.autoRotateTimer = null;
        }
        if (this.typingCompleteTimer) {
            clearTimeout(this.typingCompleteTimer);
            this.typingCompleteTimer = null;
        }
    }

    // User interaction
    handleUserInteraction() {
        this.isUserInteracting = true;
        
        // Clear all rotation timers
        this.clearRotationTimers();
        
        // Move to next snippet immediately
        this.nextSnippet();
        
        // Resume auto-rotation after a delay
        setTimeout(() => {
            this.isUserInteracting = false;
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
        // Clear timers when manually advancing
        this.clearRotationTimers();
        
        this.currentSnippetIndex = (this.currentSnippetIndex + 1) % this.snippets.length;
        this.typeCurrentSnippet();
    }

    previousSnippet() {
        // Clear timers when manually going back
        this.clearRotationTimers();
        
        this.currentSnippetIndex = this.currentSnippetIndex === 0 
            ? this.snippets.length - 1 
            : this.currentSnippetIndex - 1;
        this.typeCurrentSnippet();
    }

    restartCurrentSnippet() {
        // Clear timers when restarting
        this.clearRotationTimers();
        this.typeCurrentSnippet();
    }

    // Auto-rotation (UPDATED)
    startAutoRotation() {
        // Don't start interval-based rotation anymore
        // Rotation is now handled by scheduleNextRotation() after typing completes
        console.log('Auto-rotation enabled (timer-based after typing completion)');
    }

    stopAutoRotation() {
        this.clearRotationTimers();
        console.log('Auto-rotation disabled');
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
        this.clearRotationTimers(); // Clear timers when paused
        this.setState('paused');
        this.updateUI();
    }

    resumeDemo() {
        this.isPaused = false;
        this.typingEngine.resume();
        // Auto-rotation will resume after current typing completes
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

    // UPDATED: Better title synchronization
    updateTerminalTitle(customTitle) {
        if (this.elements.title) {
            const snippet = this.snippets[this.currentSnippetIndex];
            const title = customTitle || snippet?.title || '~/projects';
            
            // ENSURE title updates immediately
            this.elements.title.textContent = title;
            
            console.log(`📋 Title updated to: ${title}`);
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
            this.clearRotationTimers(); // Clear timers when manually setting
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
        if (!enabled) {
            this.clearRotationTimers();
        }
    }

    // Cleanup
    destroy() {
        console.log('🛑 Destroying terminal controller');
        
        this.clearRotationTimers();
        
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