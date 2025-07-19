// Theme Management
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        // Get saved theme or default to dark
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.applyTheme();
        this.bindEvents();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'dark' ? '🌙' : '☀️';
        }
    }

    toggle() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
    }

    bindEvents() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggle());
        }
    }
}

// Mobile Menu
class MobileMenu {
    constructor() {
        this.init();
    }

    init() {
        this.menu = document.getElementById('nav-menu');
        this.toggle = document.getElementById('mobile-toggle');
        this.hamburger = this.toggle?.querySelector('.hamburger');
        this.isOpen = false;
        
        this.bindEvents();
    }

    bindEvents() {
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleMenu());
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.nav')) {
                this.closeMenu();
            }
        });

        // Close menu when pressing escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Close menu when window resizes to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.menu?.classList.add('active');
        this.hamburger?.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.menu?.classList.remove('active');
        this.hamburger?.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
    }
}

// Smooth Scrolling
class SmoothScrolling {
    constructor() {
        this.init();
    }

    init() {
        // Handle anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    this.scrollToElement(targetElement);
                }
            }
        });
    }

    scrollToElement(element) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Intersection Observer for animations
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        // Only run if user prefers motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        this.observeElements();
    }

    observeElements() {
        const elements = document.querySelectorAll('.article-card, .category-card, .stat-item');
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            this.observer.observe(el);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// Header scroll effect
class HeaderEffects {
    constructor() {
        this.init();
    }

    init() {
        this.header = document.querySelector('.header');
        this.lastScrollY = 0;
        this.ticking = false;

        window.addEventListener('scroll', () => {
            this.lastScrollY = window.scrollY;
            
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.updateHeader();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        });
    }

    updateHeader() {
        if (this.header) {
            if (this.lastScrollY > 100) {
                this.header.style.background = 'rgba(10, 10, 11, 0.95)';
                this.header.style.backdropFilter = 'blur(20px)';
            } else {
                this.header.style.background = 'rgba(10, 10, 11, 0.8)';
                this.header.style.backdropFilter = 'blur(12px)';
            }
        }
    }
}

// Newsletter form handling
class Newsletter {
    constructor() {
        this.init();
    }

    init() {
        const form = document.querySelector('.newsletter-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        const input = e.target.querySelector('input[type="email"]');
        const button = e.target.querySelector('button');
        
        if (input && input.value) {
            // Show loading state
            const originalText = button.textContent;
            button.textContent = 'Inscription...';
            button.disabled = true;

            // Simulate API call (replace with actual implementation)
            setTimeout(() => {
                button.textContent = '✓ Inscrit !';
                button.style.background = '#10b981';
                input.value = '';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                    button.disabled = false;
                }, 2000);
            }, 1000);
        }
    }
}

// Reading progress indicator
class ReadingProgress {
    constructor() {
        this.init();
    }

    init() {
        // Only show on article pages
        if (document.body.classList.contains('single') || 
            document.querySelector('.article-content')) {
            this.createProgressBar();
            this.bindScrollEvent();
        }
    }

    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            z-index: 1001;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
        this.progressBar = progressBar;
    }

    bindScrollEvent() {
        window.addEventListener('scroll', () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / documentHeight) * 100;
            
            if (this.progressBar) {
                this.progressBar.style.width = `${Math.min(progress, 100)}%`;
            }
        });
    }
}

// Copy code functionality
class CodeCopy {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('pre code').forEach(block => {
            this.addCopyButton(block);
        });
    }

    addCopyButton(codeBlock) {
        const pre = codeBlock.parentElement;
        const button = document.createElement('button');
        
        button.textContent = '📋';
        button.className = 'copy-code-btn';
        button.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 0.25rem;
            padding: 0.5rem;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        pre.style.position = 'relative';
        pre.appendChild(button);

        pre.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
        });

        pre.addEventListener('mouseleave', () => {
            button.style.opacity = '0';
        });

        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeBlock.textContent);
                button.textContent = '✓';
                setTimeout(() => {
                    button.textContent = '📋';
                }, 1000);
            } catch (err) {
                console.error('Failed to copy code:', err);
            }
        });
    }
}

// Search functionality (if implemented)
class Search {
    constructor() {
        this.searchData = null;
        this.init();
    }

    async init() {
        // Load search index if available
        try {
            const response = await fetch('/index.json');
            this.searchData = await response.json();
        } catch (err) {
            console.log('Search index not available');
        }
    }

    search(query) {
        if (!this.searchData) return [];
        
        query = query.toLowerCase();
        return this.searchData.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query) ||
            item.tags?.some(tag => tag.toLowerCase().includes(query))
        );
    }
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new MobileMenu();
    new SmoothScrolling();
    new ScrollAnimations();
    new HeaderEffects();
    new Newsletter();
    new ReadingProgress();
    new CodeCopy();
    new Search();
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Page became visible, could trigger analytics or other events
        console.log('Page visible');
    }
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    });
}