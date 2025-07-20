# ===== 6. JavaScript d'intégration =====
# Fichier: static/js/hugo-search.js

class HugoSearch {
    constructor() {
        this.searchEndpoint = '/search.json';
        this.articles = [];
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        await this.loadSearchData();
        this.setupEventListeners();
        this.renderInitialResults();
    }
    
    async loadSearchData() {
        this.isLoading = true;
        try {
            const response = await fetch(this.searchEndpoint);
            const data = await response.json();
            this.articles = data.articles;
            this.categories = data.categories;
            this.tags = data.tags;
            
            console.log(`✅ Index de recherche chargé: ${this.articles.length} articles`);
        } catch (error) {
            console.error('❌ Erreur de chargement:', error);
            this.showErrorMessage();
        }
        this.isLoading = false;
    }
    
    search(query, filters = {}) {
        if (this.isLoading) return [];
        
        return this.articles.filter(article => {
            // Logique de filtrage identique à l'artefact
            if (query) {
                const searchText = `${article.title} ${article.excerpt} ${article.content}`.toLowerCase();
                if (!searchText.includes(query.toLowerCase())) {
                    return false;
                }
            }
            
            // Autres filtres...
            return true;
        });
    }
    
    showErrorMessage() {
        const container = document.getElementById('searchResults');
        if (container) {
            container.innerHTML = `
                <div class="search-error">
                    <h3>⚠️ Erreur de chargement</h3>
                    <p>Impossible de charger l'index de recherche. Veuillez réessayer.</p>
                </div>
            `;
        }
    }
}