/**
 * KYROSTECH - Gestionnaire des Articles Favoris
 * Système complet de gestion des favoris avec persistance locale
 */

class KyrostechFavorites {
    constructor() {
        this.storageKey = 'kyrostech-favorites';
        this.favorites = this.loadFavorites();
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.addFavoriteButtonsToArticles();
        
        // Si on est sur la page favoris
        if (window.location.pathname.includes('/favorites/')) {
            this.renderFavoritesPage();
        }
        
        this.isInitialized = true;
        console.log('🎉 Gestionnaire de favoris Kyrostech initialisé');
    }

    // Charger les favoris depuis localStorage
    loadFavorites() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Erreur lors du chargement des favoris:', error);
            return [];
        }
    }

    // Sauvegarder les favoris
    saveFavorites() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
            this.dispatchFavoritesChangedEvent();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }

    // Événement personnalisé pour les changements
    dispatchFavoritesChangedEvent() {
        window.dispatchEvent(new CustomEvent('favoritesChanged', {
            detail: { favorites: this.favorites, count: this.favorites.length }
        }));
    }

    // Ajouter les boutons favoris aux articles existants
    addFavoriteButtonsToArticles() {
        const articleCards = document.querySelectorAll('.article-card');
        
        articleCards.forEach(card => {
            // Éviter les doublons
            if (card.querySelector('.favorite-btn')) return;
            
            const articleData = this.extractArticleData(card);
            if (!articleData) return;
            
            const favoriteBtn = this.createFavoriteButton(articleData);
            
            // Ajouter le bouton à l'image ou au header de l'article
            const articleImage = card.querySelector('.article-image, .article-header');
            if (articleImage) {
                articleImage.style.position = 'relative';
                articleImage.appendChild(favoriteBtn);
            }
        });
    }

    // Extraire les données d'un article depuis le DOM
    extractArticleData(card) {
        try {
            const titleElement = card.querySelector('.article-title a, .article-title');
            const excerptElement = card.querySelector('.article-excerpt, .article-description');
            const categoryElement = card.querySelector('.category-tag');
            const dateElement = card.querySelector('.article-date time, .article-date');
            const readingTimeElement = card.querySelector('.reading-time');
            
            if (!titleElement) return null;
            
            const title = titleElement.textContent.trim();
            const url = titleElement.href || window.location.pathname;
            const id = this.generateArticleId(title, url);
            
            return {
                id,
                title,
                excerpt: excerptElement ? excerptElement.textContent.trim() : '',
                url,
                category: categoryElement ? categoryElement.textContent.trim().toLowerCase() : 'general',
                categoryLabel: categoryElement ? categoryElement.textContent.trim() : 'Général',
                date: dateElement ? dateElement.getAttribute('datetime') || dateElement.textContent : new Date().toISOString(),
                readingTime: this.extractReadingTime(readingTimeElement?.textContent || '5 min')
            };
        } catch (error) {
            console.error('Erreur lors de l\'extraction des données:', error);
            return null;
        }
    }

    // Générer un ID unique pour un article
    generateArticleId(title, url) {
        const titleSlug = title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        const urlSlug = url.split('/').pop() || '';
        return urlSlug || titleSlug || `article-${Date.now()}`;
    }

    // Extraire le temps de lecture
    extractReadingTime(text) {
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 5;
    }

    // Créer un bouton favori
    createFavoriteButton(articleData) {
        const button = document.createElement('button');
        button.className = 'favorite-btn';
        button.setAttribute('data-article-id', articleData.id);
        button.setAttribute('title', 'Ajouter aux favoris');
        button.setAttribute('aria-label', 'Ajouter aux favoris');
        
        const isFavorited = this.isFavorite(articleData.id);
        if (isFavorited) {
            button.classList.add('favorited');
            button.setAttribute('title', 'Retirer des favoris');
        }
        
        button.innerHTML = '<span class="heart">🤍</span>';
        if (isFavorited) {
            button.querySelector('.heart').textContent = '❤️';
        }
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleFavorite(articleData, button);
        });
        
        return button;
    }

    // Basculer le statut favori
    toggleFavorite(articleData, buttonElement = null) {
        const isFavorited = this.isFavorite(articleData.id);
        
        if (isFavorited) {
            this.removeFavorite(articleData.id);
            if (buttonElement) {
                buttonElement.classList.remove('favorited');
                buttonElement.querySelector('.heart').textContent = '🤍';
                buttonElement.setAttribute('title', 'Ajouter aux favoris');
            }
            this.showNotification('Article retiré des favoris', 'success');
        } else {
            this.addFavorite(articleData);
            if (buttonElement) {
                buttonElement.classList.add('favorited');
                buttonElement.querySelector('.heart').textContent = '❤️';
                buttonElement.setAttribute('title', 'Retirer des favoris');
            }
            this.showNotification('Article ajouté aux favoris!', 'success');
        }
        
        // Mettre à jour la page favoris si on y est
        if (window.location.pathname.includes('/favorites/')) {
            this.renderFavoritesPage();
        }
    }

    // Ajouter un favori
    addFavorite(articleData) {
        if (!this.isFavorite(articleData.id)) {
            this.favorites.push({
                ...articleData,
                addedAt: new Date().toISOString()
            });
            this.saveFavorites();
            return true;
        }
        return false;
    }

    // Supprimer un favori
    removeFavorite(articleId) {
        const index = this.favorites.findIndex(fav => fav.id === articleId);
        if (index !== -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
            return true;
        }
        return false;
    }

    // Vérifier si un article est en favori
    isFavorite(articleId) {
        return this.favorites.some(fav => fav.id === articleId);
    }

    // Afficher la page des favoris
    renderFavoritesPage() {
        const grid = document.getElementById('favoritesGrid');
        const emptyState = document.getElementById('emptyState');
        const countElement = document.getElementById('favoritesCount');
        
        if (!grid) return;
        
        this.updateFavoritesCount(countElement);
        
        if (this.favorites.length === 0) {
            grid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        grid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        // Trier par date d'ajout (plus récent en premier)
        const sortedFavorites = [...this.favorites].sort((a, b) => 
            new Date(b.addedAt) - new Date(a.addedAt)
        );
        
        grid.innerHTML = sortedFavorites.map(article => this.createFavoriteCard(article)).join('');
        
        // Ajouter les event listeners
        grid.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const articleId = btn.dataset.articleId;
                const articleData = this.favorites.find(fav => fav.id === articleId);
                this.toggleFavorite(articleData, btn);
            });
        });
    }

    // Créer une carte d'article favori
    createFavoriteCard(article) {
        const addedDate = new Date(article.addedAt).toLocaleDateString('fr-FR');
        const categoryIcon = this.getCategoryIcon(article.category);
        
        return `
            <article class="article-card">
                <div class="article-image">
                    ${categoryIcon}
                    <button class="favorite-btn favorited" data-article-id="${article.id}" title="Retirer des favoris">
                        <span class="heart">❤️</span>
                    </button>
                </div>
                <div class="article-content">
                    <div class="article-meta">
                        <span class="category-tag">${article.categoryLabel || article.category}</span>
                        <span class="article-date">${new Date(article.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <h3 class="article-title">
                        <a href="${article.url}">${article.title}</a>
                    </h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-footer">
                        <span class="reading-time">⏱️ ${article.readingTime} min</span>
                        <span class="article-date">Ajouté le ${addedDate}</span>
                    </div>
                </div>
            </article>
        `;
    }

    // Obtenir l'icône de catégorie
    getCategoryIcon(category) {
        const icons = {
            'docker': '🐳',
            'ia': '🤖',
            'devops': '🚀',
            'dev': '💻',
            'développement': '💻',
            'tech': '⚡',
            'technologies': '⚡',
            'systemes': '🛠️',
            'systèmes': '🛠️'
        };
        return icons[category.toLowerCase()] || '📄';
    }

    // Mettre à jour le compteur
    updateFavoritesCount(element = null) {
        const count = this.favorites.length;
        const countText = count === 0 ? 'Aucun article favori' : 
                        count === 1 ? '1 article favori' : 
                        `${count} articles favoris`;
        
        if (element) {
            element.textContent = countText;
        }
        
        // Mettre à jour le badge dans la navigation si présent
        const navBadge = document.querySelector('.favorites-badge');
        if (navBadge) {
            navBadge.textContent = count > 0 ? count : '';
            navBadge.style.display = count > 0 ? 'inline' : 'none';
        }
    }

    // Configuration des event listeners pour la page favoris
    setupEventListeners() {
        // Event listeners pour la page favoris
        const exportBtn = document.getElementById('exportBtn');
        const importBtn = document.getElementById('importBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');
        const importFile = document.getElementById('importFile');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportFavorites());
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importFavorites());
        }
        
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllFavorites());
        }
        
        if (importFile) {
            importFile.addEventListener('change', (e) => this.handleImportFile(e));
        }
        
        // Observer pour les nouveaux articles ajoutés dynamiquement
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1 && node.querySelector('.article-card')) {
                                this.addFavoriteButtonsToArticles();
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // Exporter les favoris
    exportFavorites() {
        const data = {
            favorites: this.favorites,
            exportDate: new Date().toISOString(),
            version: '1.0',
            source: 'Kyrostech Blog'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kyrostech-favoris-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Favoris exportés avec succès!', 'success');
    }

    // Importer les favoris
    importFavorites() {
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.click();
        }
    }

    // Gérer l'import de fichier
    handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.favorites && Array.isArray(data.favorites)) {
                    // Fusionner avec les favoris existants
                    const newFavorites = data.favorites.filter(fav => 
                        !this.isFavorite(fav.id)
                    );
                    
                    this.favorites.push(...newFavorites);
                    this.saveFavorites();
                    this.renderFavoritesPage();
                    
                    this.showNotification(
                        `${newFavorites.length} nouveaux favoris importés!`, 
                        'success'
                    );
                } else {
                    throw new Error('Format de fichier invalide');
                }
            } catch (error) {
                console.error('Erreur lors de l\'import:', error);
                this.showNotification('Erreur lors de l\'import du fichier', 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset de l'input
        event.target.value = '';
    }

    // Vider tous les favoris
    clearAllFavorites() {
        if (this.favorites.length === 0) return;
        
        if (confirm('Êtes-vous sûr de vouloir supprimer tous vos articles favoris ?')) {
            this.favorites = [];
            this.saveFavorites();
            this.renderFavoritesPage();
            this.showNotification('Tous les favoris ont été supprimés', 'success');
        }
    }

    // Afficher une notification
    showNotification(message, type = 'success') {
        // Utiliser le système de notification existant ou créer le nôtre
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }
        
        // Notification basique si le système principal n'est pas disponible
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 1rem 1.5rem;
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
            color: var(--text-primary);
        `;
        
        const icon = type === 'success' ? '✅' : '❌';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${icon}</span>
                <span>${message}</span>
                <button onclick="this.parentNode.parentNode.remove()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; margin-left: auto;">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto-fermeture
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }

    // API publique
    getFavorites() {
        return [...this.favorites];
    }

    getFavoritesCount() {
        return this.favorites.length;
    }

    // Méthodes utilitaires
    static getInstance() {
        if (!window.kyrostechFavorites) {
            window.kyrostechFavorites = new KyrostechFavorites();
        }
        return window.kyrostechFavorites;
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', function() {
    window.kyrostechFavorites = KyrostechFavorites.getInstance();
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KyrostechFavorites;
}