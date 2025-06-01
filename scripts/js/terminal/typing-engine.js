/**
 * Typing Engine for Terminal Animation
 * Handles realistic typing effects with variable speeds and errors
 */

class TypingEngine {
    constructor(outputElement, options = {}) {
        this.outputElement = outputElement;
        this.options = {
            baseSpeed: 50,          // Base typing speed (ms between characters)
            speedVariation: 30,     // Random variation in speed
            pauseChance: 0.1,       // Chance of brief pause
            pauseDuration: 200,     // Duration of pause
            errorChance: 0.02,      // Chance of typing error
            errorCorrectDelay: 500, // Delay before correcting error
            ...options
        };
        
        this.isTyping = false;
        this.isPaused = false;
        this.currentTimeout = null;
        this.onComplete = null;
        this.onProgress = null;
        this.onError = null;
        
        // Sound integration
        this.soundManager = window.soundManager;
    }

    async typeText(text, language = 'javascript') {
        return new Promise((resolve, reject) => {
            if (this.isTyping) {
                reject(new Error('Already typing'));
                return;
            }

            this.isTyping = true;
            this.isPaused = false;
            this.onComplete = resolve;
            this.onError = reject;
            
            // Clear output
            this.outputElement.textContent = '';
            this.outputElement.className = `language-${language}`;
            
            // Start typing animation
            this._typeCharacters(text, 0);
        });
    }

    _typeCharacters(text, index) {
        if (!this.isTyping || this.isPaused) {
            return;
        }

        if (index >= text.length) {
            this._completeTyping();
            return;
        }

        const char = text[index];
        
        // Calculate typing speed with variation
        const baseSpeed = this.options.baseSpeed;
        const variation = (Math.random() - 0.5) * this.options.speedVariation;
        let speed = baseSpeed + variation;

        // Adjust speed based on character type
        if (char === '\n') {
            speed *= 2; // Longer pause for new lines
            this._playEnterSound();
        } else if (char === ' ') {
            speed *= 1.5; // Slightly longer for spaces
        } else if (/[.!?;]/.test(char)) {
            speed *= 2; // Pause after punctuation
        } else if (/[A-Z]/.test(char)) {
            speed *= 1.2; // Slightly slower for capitals
        } else {
            this._playKeypressSound();
        }

        // Random pause chance
        if (Math.random() < this.options.pauseChance) {
            speed += this.options.pauseDuration;
        }

        // Error simulation
        if (Math.random() < this.options.errorChance && char !== '\n') {
            this._simulateError(text, index, speed);
            return;
        }

        // Type the character
        this.outputElement.textContent += char;
        
        // Trigger syntax highlighting if available
        this._highlightSyntax();
        
        // Progress callback
        if (this.onProgress) {
            this.onProgress(index + 1, text.length);
        }

        // Schedule next character
        this.currentTimeout = setTimeout(() => {
            this._typeCharacters(text, index + 1);
        }, speed);
    }

    _simulateError(text, index, baseSpeed) {
        const char = text[index];
        const wrongChars = 'qwertyuiopasdfghjklzxcvbnm';
        const wrongChar = wrongChars[Math.floor(Math.random() * wrongChars.length)];
        
        // Type wrong character
        this.outputElement.textContent += wrongChar;
        this._playKeypressSound();
        this._highlightSyntax();
        
        // Wait, then backspace and type correct character
        this.currentTimeout = setTimeout(() => {
            // Backspace
            const currentText = this.outputElement.textContent;
            this.outputElement.textContent = currentText.slice(0, -1);
            this._playBackspaceSound();
            this._highlightSyntax();
            
            // Type correct character after short delay
            this.currentTimeout = setTimeout(() => {
                this.outputElement.textContent += char;
                this._playKeypressSound();
                this._highlightSyntax();
                
                // Continue with next character
                this.currentTimeout = setTimeout(() => {
                    this._typeCharacters(text, index + 1);
                }, baseSpeed);
            }, 100);
        }, this.options.errorCorrectDelay);
    }

    _highlightSyntax() {
        // Trigger syntax highlighting if Prism.js is available
        if (window.Prism && this.outputElement.parentElement) {
            try {
                Prism.highlightElement(this.outputElement);
            } catch (error) {
                // Silently ignore highlighting errors during typing
            }
        }
    }

    _playKeypressSound() {
        if (this.soundManager && this.soundManager.isAudioEnabled()) {
            this.soundManager.playKeypress();
        }
    }

    _playBackspaceSound() {
        if (this.soundManager && this.soundManager.isAudioEnabled()) {
            this.soundManager.playBackspace();
        }
    }

    _playEnterSound() {
        if (this.soundManager && this.soundManager.isAudioEnabled()) {
            this.soundManager.playEnter();
        }
    }

    _completeTyping() {
        this.isTyping = false;
        
        // Final syntax highlighting
        this._highlightSyntax();
        
        // Play completion sound
        if (this.soundManager && this.soundManager.isAudioEnabled()) {
            this.soundManager.playComplete();
        }
        
        if (this.onComplete) {
            this.onComplete();
        }
    }

    // Public control methods
    pause() {
        if (this.isTyping) {
            this.isPaused = true;
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);
                this.currentTimeout = null;
            }
        }
    }

    resume() {
        if (this.isTyping && this.isPaused) {
            this.isPaused = false;
            // Resume typing from current position
            const currentText = this.outputElement.textContent;
            const fullText = this.targetText || '';
            if (currentText.length < fullText.length) {
                this._typeCharacters(fullText, currentText.length);
            }
        }
    }

    stop() {
        this.isTyping = false;
        this.isPaused = false;
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
    }

    clear() {
        this.stop();
        this.outputElement.textContent = '';
    }

    // Speed control
    setSpeed(baseSpeed) {
        this.options.baseSpeed = baseSpeed;
    }

    getSpeed() {
        return this.options.baseSpeed;
    }

    // State getters
    isCurrentlyTyping() {
        return this.isTyping;
    }

    isCurrentlyPaused() {
        return this.isPaused;
    }

    // Event handlers
    onTypingProgress(callback) {
        this.onProgress = callback;
    }

    onTypingComplete(callback) {
        this.onComplete = callback;
    }

    onTypingError(callback) {
        this.onError = callback;
    }

    // Advanced typing effects
    async typeWithBackspace(text, language = 'javascript', backspaceCount = 0) {
        if (backspaceCount > 0) {
            await this._simulateBackspace(backspaceCount);
        }
        return this.typeText(text, language);
    }

    async _simulateBackspace(count) {
        return new Promise((resolve) => {
            let remaining = count;
            const backspaceInterval = setInterval(() => {
                if (remaining <= 0) {
                    clearInterval(backspaceInterval);
                    resolve();
                    return;
                }

                const currentText = this.outputElement.textContent;
                if (currentText.length > 0) {
                    this.outputElement.textContent = currentText.slice(0, -1);
                    this._playBackspaceSound();
                    this._highlightSyntax();
                }
                remaining--;
            }, 50);
        });
    }

    // Typewriter effect with cursor
    typeWithCursor(text, language = 'javascript') {
        this.targetText = text;
        return this.typeText(text, language);
    }

    // Batch typing for multiple code blocks
    async typeSequence(codeBlocks) {
        for (const block of codeBlocks) {
            await this.typeText(block.code, block.language);
            if (block.pause) {
                await this._pause(block.pause);
            }
        }
    }

    async _pause(duration) {
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    // Realistic programming patterns
    addRealisticPauses(text) {
        // Add natural pauses at logical points
        return text
            .replace(/;\n/g, ';\n\n') // Pause after statement endings
            .replace(/{\n/g, '{\n\n') // Pause after opening braces
            .replace(/}\n/g, '}\n\n') // Pause after closing braces
            .replace(/\/\/ .+\n/g, match => match + '\n') // Pause after comments
            .replace(/\n\n\n+/g, '\n\n'); // Clean up excessive line breaks
    }

    // Cleanup
    destroy() {
        this.stop();
        this.outputElement = null;
        this.onComplete = null;
        this.onProgress = null;
        this.onError = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TypingEngine;
} else {
    window.TypingEngine = TypingEngine;
}