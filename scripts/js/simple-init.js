/**
 * Simple initialization for the enhanced portfolio
 * Provides basic functionality without requiring full module system
 */

(function() {
    'use strict';
    
    let isInitialized = false;
    
    // Wait for DOM to be ready
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }
    
    // Simple content panel functionality
    function initContentPanel() {
        const showMoreBtn = document.getElementById('showMoreBtn');
        const expandedContent = document.getElementById('expandedContent');
        
        if (!showMoreBtn || !expandedContent) {
            console.warn('Content panel elements not found');
            return;
        }
        
        let isExpanded = false;
        
        function updateButton() {
            const btnLabel = showMoreBtn.querySelector('.btn-label');
            const btnIcon = showMoreBtn.querySelector('.btn-icon');
            
            if (btnLabel) {
                btnLabel.textContent = isExpanded ? 'cat about.md' : 'cat about.md';
            }
            
            if (btnIcon) {
                btnIcon.textContent = isExpanded ? '▲' : '▼';
                btnIcon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
            }
            
            showMoreBtn.setAttribute('aria-expanded', isExpanded.toString());
            expandedContent.setAttribute('aria-hidden', (!isExpanded).toString());
        }
        
        function toggleContent() {
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                expandedContent.classList.add('show');
            } else {
                expandedContent.classList.remove('show');
            }
            
            updateButton();
        }
        
        showMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleContent();
        });
        
        // Keyboard support
        showMoreBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleContent();
            }
        });
        
        // Initialize button state
        updateButton();
        
        console.log('✅ Content panel initialized');
    }
    
    // Simple terminal initialization
    function initTerminal() {
        const terminalContainer = document.getElementById('terminalContainer');
        const terminalOutput = document.getElementById('terminalOutput');
        const terminalCode = document.getElementById('terminalCode');
        const statusText = document.getElementById('statusText');
        const statusIndicator = document.getElementById('statusIndicator');
        
        if (!terminalContainer || !terminalOutput || !terminalCode) {
            console.warn('Terminal elements not found');
            return;
        }
        
        // Simple typing animation
        let currentText = '';
        let targetText = 'echo "Welcome to my portfolio!"\nWelcome to my portfolio!\n\nls -la\ntotal 42\ndrwxr-xr-x  5 dan  staff   160 Dec 12 10:30 .\ndrwxr-xr-x  3 dan  staff    96 Dec 12 10:25 ..\n-rw-r--r--  1 dan  staff   420 Dec 12 10:30 README.md\ndrwxr-xr-x  8 dan  staff   256 Dec 12 10:28 projects\ndrwxr-xr-x  4 dan  staff   128 Dec 12 10:29 skills\n\ncat skills/languages.txt\nJavaScript, Python, TypeScript, Go, Rust\nReact, Vue, Node.js, Django, FastAPI\nAWS, Docker, Kubernetes, PostgreSQL\n\n# Currently working with AI/ML tools:\npip install openai anthropic\ncurl -X POST "https://api.openai.com/v1/chat/completions" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello!"}]}\'\n\n$ ';
        
        let typeIndex = 0;
        let isTyping = false;
        
        function typeCharacter() {
            if (typeIndex < targetText.length && isTyping) {
                currentText += targetText[typeIndex];
                terminalCode.textContent = currentText;
                typeIndex++;
                
                // Variable typing speed for more realistic effect
                const delay = Math.random() * 100 + 50;
                setTimeout(typeCharacter, delay);
                
                // Update status
                if (statusText) statusText.textContent = 'Typing...';
                if (statusIndicator) statusIndicator.style.color = '#ff00ff';
                
            } else {
                // Typing complete
                if (statusText) statusText.textContent = 'Ready';
                if (statusIndicator) statusIndicator.style.color = '#00f5ff';
                isTyping = false;
                
                // Restart after delay
                setTimeout(() => {
                    startTyping();
                }, 10000);
            }
        }
        
        function startTyping() {
            if (isTyping) return;
            
            currentText = '';
            typeIndex = 0;
            isTyping = true;
            terminalCode.textContent = '';
            
            // Start typing with a small delay
            setTimeout(typeCharacter, 500);
        }
        
        // Initialize terminal
        terminalCode.textContent = 'Initializing terminal...';
        setTimeout(startTyping, 2000);
        
        console.log('✅ Terminal initialized');
    }
    
    // Initialize sound toggle
    function initSoundToggle() {
        const soundToggle = document.getElementById('soundToggle');
        if (!soundToggle) return;
        
        let soundEnabled = false;
        
        soundToggle.addEventListener('click', function() {
            soundEnabled = !soundEnabled;
            soundToggle.classList.toggle('muted', !soundEnabled);
            soundToggle.setAttribute('aria-pressed', soundEnabled.toString());
            
            console.log('Sound', soundEnabled ? 'enabled' : 'disabled');
        });
        
        console.log('✅ Sound toggle initialized');
    }
    
    // Add some interactive effects
    function initInteractiveEffects() {
        // Add hover effects to social links
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px) scale(1.05)';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Add click effect to terminal
        const terminalContainer = document.getElementById('terminalContainer');
        if (terminalContainer) {
            terminalContainer.addEventListener('click', function() {
                this.classList.add('focused');
                setTimeout(() => {
                    this.classList.remove('focused');
                }, 2000);
            });
        }
        
        console.log('✅ Interactive effects initialized');
    }
    
    // Main initialization function
    function init() {
        if (isInitialized) return;
        
        console.log('🚀 Initializing enhanced portfolio...');
        
        try {
            initContentPanel();
            initTerminal();
            initSoundToggle();
            initInteractiveEffects();
            
            isInitialized = true;
            console.log('✅ Portfolio initialization complete!');
            
        } catch (error) {
            console.error('❌ Portfolio initialization failed:', error);
        }
    }
    
    // Initialize when DOM is ready
    ready(init);
    
    // Export for debugging
    window.portfolioSimple = {
        init,
        isInitialized: () => isInitialized
    };
    
})();