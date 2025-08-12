/**
 * Utility Functions
 * Common helper functions used throughout the portfolio application
 */

import { APP_CONFIG, ENV } from './config.js';

// DOM Utilities
export const dom = {
    /**
     * Query selector with error handling
     */
    $(selector, context = document) {
        try {
            return context.querySelector(selector);
        } catch (error) {
            console.error(`Invalid selector: ${selector}`, error);
            return null;
        }
    },

    /**
     * Query selector all with error handling
     */
    $$(selector, context = document) {
        try {
            return context.querySelectorAll(selector);
        } catch (error) {
            console.error(`Invalid selector: ${selector}`, error);
            return [];
        }
    },

    /**
     * Check if element exists and is visible
     */
    isVisible(element) {
        if (!element) return false;
        
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        return style.display !== 'none' 
            && style.visibility !== 'hidden' 
            && style.opacity !== '0'
            && rect.width > 0 
            && rect.height > 0;
    },

    /**
     * Add CSS class with existence check
     */
    addClass(element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    },

    /**
     * Remove CSS class with existence check
     */
    removeClass(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    },

    /**
     * Toggle CSS class with existence check
     */
    toggleClass(element, className, force = undefined) {
        if (element && className) {
            return element.classList.toggle(className, force);
        }
        return false;
    },

    /**
     * Wait for element to exist in DOM
     */
    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = this.$(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = this.$(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Timeout fallback
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element not found: ${selector}`));
            }, timeout);
        });
    },

    /**
     * Create element with attributes and content
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        if (content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else {
                element.appendChild(content);
            }
        }

        return element;
    }
};

// Async Utilities
export const async = {
    /**
     * Promisified setTimeout
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Debounce function calls
     */
    debounce(func, delay, immediate = false) {
        let timeoutId;
        
        return function executedFunction(...args) {
            const callNow = immediate && !timeoutId;
            
            clearTimeout(timeoutId);
            
            timeoutId = setTimeout(() => {
                timeoutId = null;
                if (!immediate) func.apply(this, args);
            }, delay);
            
            if (callNow) func.apply(this, args);
        };
    },

    /**
     * Throttle function calls
     */
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        
        return function executedFunction(...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    },

    /**
     * Retry async operation with exponential backoff
     */
    async retry(operation, maxAttempts = 3, baseDelay = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw error;
                }
                
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await this.delay(delay);
            }
        }
    }
};

// Type checking utilities
export const is = {
    string: (value) => typeof value === 'string',
    number: (value) => typeof value === 'number' && !isNaN(value),
    function: (value) => typeof value === 'function',
    object: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
    array: (value) => Array.isArray(value),
    null: (value) => value === null,
    undefined: (value) => value === undefined,
    boolean: (value) => typeof value === 'boolean',
    empty: (value) => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }
};

// URL and navigation utilities
export const nav = {
    /**
     * Smooth scroll to element
     */
    scrollTo(target, options = {}) {
        const element = typeof target === 'string' ? dom.$(target) : target;
        if (!element) return;

        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            ...options
        });
    },

    /**
     * Scroll to top of page
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },

    /**
     * Get current scroll position
     */
    getScrollPosition() {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop
        };
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element, threshold = 0) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top >= -threshold &&
            rect.left >= -threshold &&
            rect.bottom <= windowHeight + threshold &&
            rect.right <= windowWidth + threshold
        );
    }
};

// Performance utilities
export const perf = {
    /**
     * Measure execution time of a function
     */
    measure(fn, label = 'Operation') {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`${label} took ${(end - start).toFixed(2)}ms`);
        return result;
    },

    /**
     * Request animation frame wrapper
     */
    nextFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    },

    /**
     * Request idle callback wrapper
     */
    whenIdle(timeout = 5000) {
        return new Promise(resolve => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(resolve, { timeout });
            } else {
                setTimeout(resolve, 0);
            }
        });
    }
};

// Local storage utilities
export const storage = {
    /**
     * Set item in localStorage with error handling
     */
    set(key, value) {
        if (!ENV.supportsLocalStorage) return false;
        
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Failed to set localStorage item:', error);
            return false;
        }
    },

    /**
     * Get item from localStorage with error handling
     */
    get(key, defaultValue = null) {
        if (!ENV.supportsLocalStorage) return defaultValue;
        
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to get localStorage item:', error);
            return defaultValue;
        }
    },

    /**
     * Remove item from localStorage
     */
    remove(key) {
        if (!ENV.supportsLocalStorage) return false;
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove localStorage item:', error);
            return false;
        }
    },

    /**
     * Clear all localStorage
     */
    clear() {
        if (!ENV.supportsLocalStorage) return false;
        
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }
};

// Animation utilities
export const animation = {
    /**
     * CSS animation with promise
     */
    animate(element, animationName, duration = 300) {
        if (!element) return Promise.resolve();
        
        return new Promise(resolve => {
            const handleAnimationEnd = () => {
                element.removeEventListener('animationend', handleAnimationEnd);
                element.style.animation = '';
                resolve();
            };

            element.addEventListener('animationend', handleAnimationEnd);
            element.style.animation = `${animationName} ${duration}ms ease`;
        });
    },

    /**
     * CSS transition with promise
     */
    transition(element, properties, duration = 300) {
        if (!element) return Promise.resolve();
        
        return new Promise(resolve => {
            const handleTransitionEnd = () => {
                element.removeEventListener('transitionend', handleTransitionEnd);
                element.style.transition = '';
                resolve();
            };

            element.addEventListener('transitionend', handleTransitionEnd);
            element.style.transition = `all ${duration}ms ease`;
            
            Object.entries(properties).forEach(([prop, value]) => {
                element.style[prop] = value;
            });
        });
    },

    /**
     * Fade in element
     */
    fadeIn(element, duration = 300) {
        if (!element) return Promise.resolve();
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        return this.transition(element, { opacity: '1' }, duration);
    },

    /**
     * Fade out element
     */
    fadeOut(element, duration = 300) {
        if (!element) return Promise.resolve();
        
        return this.transition(element, { opacity: '0' }, duration)
            .then(() => {
                element.style.display = 'none';
            });
    }
};

// Validation utilities
export const validate = {
    /**
     * Email validation
     */
    email(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * URL validation
     */
    url(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Required field validation
     */
    required(value) {
        return !is.empty(value);
    }
};

// Feature detection utilities
export const supports = {
    /**
     * Check if CSS property is supported
     */
    css(property, value = '') {
        const element = document.createElement('div');
        const prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'];
        
        for (const prefix of prefixes) {
            const fullProperty = prefix + property;
            if (fullProperty in element.style) {
                if (value) {
                    element.style[fullProperty] = value;
                    return element.style[fullProperty] === value;
                }
                return true;
            }
        }
        return false;
    },

    /**
     * Check for touch support
     */
    touch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    /**
     * Check for reduced motion preference
     */
    reducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
};

// Debug utilities
export const debug = {
    /**
     * Log with timestamp and context
     */
    log(message, context = '', type = 'info') {
        if (!APP_CONFIG.debug.enableLogging) return;
        
        const timestamp = new Date().toISOString();
        const prefix = context ? `[${context}]` : '';
        const icon = APP_CONFIG.debug[`${type}Icon`] || APP_CONFIG.debug.infoIcon;
        
        console[type](`${icon} ${timestamp} ${prefix}`, message);
    },

    /**
     * Performance mark
     */
    mark(name) {
        if (performance.mark) {
            performance.mark(name);
        }
    },

    /**
     * Performance measure
     */
    measure(name, startMark, endMark) {
        if (performance.measure) {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
        }
    }
};