/**
 * Sound Manager for Terminal Typing Effects
 * Handles audio feedback for typing animations
 */

class SoundManager {
    constructor() {
        this.isEnabled = true;
        this.volume = 0.3;
        this.sounds = {};
        this.audioContext = null;
        this.masterGain = null;
        
        this.initializeAudio();
        this.createSounds();
    }

    initializeAudio() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create master gain node for volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            
            console.log('🔊 Audio context initialized');
        } catch (error) {
            console.warn('⚠️ Audio context not supported:', error);
            this.isEnabled = false;
        }
    }

    createSounds() {
        if (!this.audioContext) return;

        // Create typing sounds using Web Audio API
        this.sounds = {
            keypress: this.createKeypressSound(),
            backspace: this.createBackspaceSound(),
            enter: this.createEnterSound(),
            startup: this.createStartupSound(),
            complete: this.createCompleteSound()
        };
    }

    createKeypressSound() {
        return () => {
            if (!this.isEnabled || !this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Create a subtle click sound
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800 + Math.random() * 400, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }

    createBackspaceSound() {
        return () => {
            if (!this.isEnabled || !this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Lower pitch for backspace
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.15);
        };
    }

    createEnterSound() {
        return () => {
            if (!this.isEnabled || !this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Distinctive enter sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }

    createStartupSound() {
        return () => {
            if (!this.isEnabled || !this.audioContext) return;

            // Create a pleasant startup chime
            const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.masterGain);
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.5);
                }, index * 100);
            });
        };
    }

    createCompleteSound() {
        return () => {
            if (!this.isEnabled || !this.audioContext) return;

            // Success sound - ascending notes
            const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.masterGain);
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                }, index * 80);
            });
        };
    }

    // Public methods
    playKeypress() {
        if (this.sounds.keypress) {
            this.sounds.keypress();
        }
    }

    playBackspace() {
        if (this.sounds.backspace) {
            this.sounds.backspace();
        }
    }

    playEnter() {
        if (this.sounds.enter) {
            this.sounds.enter();
        }
    }

    playStartup() {
        if (this.sounds.startup) {
            this.sounds.startup();
        }
    }

    playComplete() {
        if (this.sounds.complete) {
            this.sounds.complete();
        }
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`🔊 Sound ${enabled ? 'enabled' : 'disabled'}`);
    }

    isAudioEnabled() {
        return this.isEnabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    getVolume() {
        return this.volume;
    }

    // Resume audio context if suspended (required for some browsers)
    async resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('🔊 Audio context resumed');
            } catch (error) {
                console.warn('⚠️ Could not resume audio context:', error);
            }
        }
    }

    // Cleanup
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.sounds = {};
        console.log('🔊 Sound manager destroyed');
    }
}

// Create global instance
const soundManager = new SoundManager();

// Auto-resume audio on user interaction (required by some browsers)
document.addEventListener('click', () => {
    soundManager.resumeAudio();
}, { once: true });

document.addEventListener('keydown', () => {
    soundManager.resumeAudio();
}, { once: true });

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
} else {
    window.SoundManager = SoundManager;
    window.soundManager = soundManager;
}