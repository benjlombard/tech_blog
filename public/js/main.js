/**
 * KYROSTECH - JavaScript Principal
 * Script propre et performant
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation
    initThemeToggle();
    initMobileNavigation();
    initScrollEffects();
    initNewsletterForm();
    initAnimations();
    
    console.log('🚀 Kyrostech loaded successfully');
});

/**
 * Gestion du thème sombre/clair
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    if (!themeToggle) return;
    
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    
    // Gérer le clic sur le toggle
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Animation du bouton
        if (themeIcon) {
            themeIcon.style.transform = 'scale(0.8) rotate(180deg)';
            setTimeout(() => {
                themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
                themeIcon.style.transform = 'scale(1) rotate(0deg)';
            }, 150);
        }
    });
    
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    }
}

/**
 * Navigation mobile
 */
function initMobileNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (!mobileToggle || !navMenu) return;
    
    let isMenuOpen = false;
    
    // Toggle du menu
    mobileToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });
    
    // Fermer le menu au clic sur un lien
    navMenu.addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-link')) {
            closeMenu();
        }
    });
    
    // Fermer le menu au clic extérieur
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
            closeMenu();
        }
    });
    
    // Fermer le menu avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });
    
    // Gérer le redimensionnement
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && isMenuOpen) {
            closeMenu();
        }
    });
    
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        navMenu.classList.toggle('show', isMenuOpen);
        mobileToggle.textContent = isMenuOpen ? '✕' : '☰';
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        
        // Accessibilité
        mobileToggle.setAttribute('aria-expanded', isMenuOpen);
        navMenu.setAttribute('aria-hidden', !isMenuOpen);
    }
    
    function closeMenu() {
        if (!isMenuOpen) return;
        
        isMenuOpen = false;
        navMenu.classList.remove('show');
        mobileToggle.textContent = '☰';
        document.body.style.overflow = '';
        
        mobileToggle.setAttribute('aria-expanded', false);
        navMenu.setAttribute('aria-hidden', true);
    }
}

/**
 * Effets de scroll
 */
function initScrollEffects() {
    const header = document.querySelector('.site-header');
    let lastScrollY = 0;
    let ticking = false;
    
    // Header avec effet de scroll
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    });
    
    function updateScrollEffects() {
        const scrollY = window.pageYOffset;
        
        // Header background
        if (header) {
            header.classList.toggle('scrolled', scrollY > 50);
        }
        
        // Bouton retour en haut
        updateBackToTop(scrollY);
        
        lastScrollY = scrollY;
        ticking = false;
    }
    
    // Créer et gérer le bouton retour en haut
    function updateBackToTop(scrollY) {
        let backToTop = document.getElementById('back-to-top');
        
        if (!backToTop) {
            backToTop = createBackToTopButton();
        }
        
        const shouldShow = scrollY > 300;
        backToTop.style.opacity = shouldShow ? '1' : '0';
        backToTop.style.pointerEvents = shouldShow ? 'auto' : 'none';
    }
    
    function createBackToTopButton() {
        const button = document.createElement('button');
        button.id = 'back-to-top';
        button.innerHTML = '↑';
        button.setAttribute('aria-label', 'Retour en haut de page');
        
        // Styles CSS via classe
        button.className = 'back-to-top-btn';
        
        // Ajouter les styles CSS si pas déjà présents
        if (!document.querySelector('#back-to-top-styles')) {
            const style = document.createElement('style');
            style.id = 'back-to-top-styles';
            style.textContent = `
                .back-to-top-btn {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 3rem;
                    height: 3rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    font-size: 1.5rem;
                    cursor: pointer;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s ease;
                    z-index: 1000;
                    box-shadow: var(--shadow-lg);
                }
                .back-to-top-btn:hover {
                    background: var(--primary-hover);
                    transform: translateY(-2px);
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(button);
        
        // Fonctionnalité de scroll
        button.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        return button;
    }
}

/**
 * Formulaire newsletter
 */
function initNewsletterForm() {
    const forms = document.querySelectorAll('.newsletter-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleNewsletterSubmission(this);
        });
    });
    
    async function handleNewsletterSubmission(form) {
        const emailInput = form.querySelector('input[type="email"]');
        const submitButton = form.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();
        
        if (!isValidEmail(email)) {
            showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }
        
        // État de chargement
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Inscription en cours...';
        submitButton.disabled = true;
        
        try {
            // Simulation d'envoi (remplacer par vraie logique)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Succès
            submitButton.textContent = '✅ Inscrit !';
            showNotification('Inscription réussie ! Merci de votre confiance.', 'success');
            
            // Reset après délai
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                emailInput.value = '';
            }, 2000);
            
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            showNotification('Erreur lors de l\'inscription. Veuillez réessayer.', 'error');
        }
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

/**
 * Animations au scroll
 */
function initAnimations() {
    // Observer pour les animations d'entrée
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observer les éléments à animer
        document.querySelectorAll('.article-card, .hero-content, .newsletter-card').forEach(el => {
            observer.observe(el);
        });
        
        // Ajouter les styles d'animation si pas présents
        if (!document.querySelector('#animation-styles')) {
            const style = document.createElement('style');
            style.id = 'animation-styles';
            style.textContent = `
                .article-card,
                .hero-content,
                .newsletter-card {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.6s ease;
                }
                .animate-in {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

/**
 * Système de notifications
 */
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Fermer">&times;</button>
        </div>
    `;
    
    // Ajouter les styles si pas présents
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: var(--radius-lg);
                padding: 1rem;
                box-shadow: var(--shadow-xl);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 400px;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .notification-message {
                flex: 1;
                color: var(--text-primary);
            }
            .notification-close {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                font-size: 1.2rem;
                padding: 0;
                margin-left: 0.5rem;
            }
            .notification-success { border-color: var(--secondary); }
            .notification-error { border-color: #ef4444; }
            .notification-warning { border-color: var(--accent); }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Gestion de la fermeture
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Auto-fermeture
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
}

function hideNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Liens smooth scroll
 */
document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }
});

/**
 * Gestion des erreurs globales
 */
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});