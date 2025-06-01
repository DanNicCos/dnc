/**
 * Video Controller Module
 * Handles video playback, pause on hover, and status updates
 */

class VideoController {
    constructor(videoId, containerId, statusId) {
        this.video = document.getElementById(videoId);
        this.container = document.getElementById(containerId);
        this.status = document.getElementById(statusId);
        this.hoverTimeout = null;
        
        this.init();
    }

    init() {
        if (!this.video || !this.container || !this.status) {
            console.warn('VideoController: Required elements not found');
            return;
        }

        this.setupEventListeners();
        this.attemptAutoPlay();
    }

    setupEventListeners() {
        // Video state events
        this.video.addEventListener('loadeddata', () => this.attemptAutoPlay());
        this.video.addEventListener('play', () => this.updateStatus('PLAYING'));
        this.video.addEventListener('pause', () => this.updateStatus('PAUSED'));
        this.video.addEventListener('ended', () => this.updateStatus('ENDED'));
        this.video.addEventListener('waiting', () => this.updateStatus('LOADING'));
        this.video.addEventListener('canplay', () => {
            if (!this.video.paused) {
                this.updateStatus('PLAYING');
            }
        });

        // Container interaction events
        this.container.addEventListener('mouseenter', () => this.handleMouseEnter());
        this.container.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.container.addEventListener('click', (e) => this.handleClick(e));

        // Keyboard accessibility
        this.container.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Make container focusable for keyboard users
        if (!this.container.hasAttribute('tabindex')) {
            this.container.setAttribute('tabindex', '0');
        }
    }

    attemptAutoPlay() {
        this.video.play().catch(error => {
            console.log('Auto-play was prevented:', error.message);
            this.updateStatus('PAUSED');
        });
    }

    updateStatus(status) {
        if (!this.status) return;
        
        this.status.textContent = status;
        this.status.className = `video-status ${status.toLowerCase()}`;
        
        // Dispatch custom event for external listeners
        this.container.dispatchEvent(new CustomEvent('videoStatusChange', {
            detail: { status, video: this.video }
        }));
    }

    handleMouseEnter() {
        this.clearHoverTimeout();
        
        if (!this.video.paused) {
            this.video.pause();
        }
    }

    handleMouseLeave() {
        this.clearHoverTimeout();
        
        // Add slight delay to prevent immediate play on quick mouse movements
        this.hoverTimeout = setTimeout(() => {
            if (this.video.paused && !this.video.ended) {
                this.video.play().catch(error => {
                    console.log('Play was prevented:', error.message);
                });
            }
        }, 100);
    }

    handleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        this.togglePlayPause();
    }

    handleKeydown(event) {
        // Handle spacebar and Enter key for accessibility
        if (event.code === 'Space' || event.code === 'Enter') {
            event.preventDefault();
            this.togglePlayPause();
        }
    }

    togglePlayPause() {
        if (this.video.paused || this.video.ended) {
            this.video.play().catch(error => {
                console.log('Play was prevented:', error.message);
            });
        } else {
            this.video.pause();
        }
    }

    clearHoverTimeout() {
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
    }

    // Public API methods
    play() {
        return this.video.play();
    }

    pause() {
        this.video.pause();
    }

    getCurrentTime() {
        return this.video.currentTime;
    }

    getDuration() {
        return this.video.duration;
    }

    setVolume(volume) {
        this.video.volume = Math.max(0, Math.min(1, volume));
    }

    getVolume() {
        return this.video.volume;
    }

    isPaused() {
        return this.video.paused;
    }

    isEnded() {
        return this.video.ended;
    }

    // Cleanup method
    destroy() {
        this.clearHoverTimeout();
        
        // Remove event listeners if needed
        // Note: Modern browsers handle this automatically when elements are removed
        if (this.container) {
            this.container.removeAttribute('tabindex');
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoController;
}

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
    window.VideoController = VideoController;
}