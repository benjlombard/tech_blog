document.addEventListener('DOMContentLoaded', () => {
    // Toggle thème
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.dataset.theme;
        document.documentElement.dataset.theme = currentTheme === 'dark' ? 'light' : 'dark';
      });
    }
  
    // Toggle menu burger
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }
  
    // Recherche basique (sans index externe pour l'instant)
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    if (searchInput && searchResults) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 3) {
          searchResults.innerHTML = '';
          return;
        }
        // Simulation de recherche (à remplacer par une vraie logique avec index.json)
        const pages = [
          { title: "Accueil", url: "/", date: "2025-07-20" },
          { title: "À propos", url: "/about/", date: "2025-07-20" },
          { title: "Docker", url: "/categories/docker/", date: "2025-07-20" }
        ];
        const results = pages.filter(page => page.title.toLowerCase().includes(query));
        searchResults.innerHTML = results.map(result => 
          `<a href="${result.url}">${result.title} (${result.date})</a>`
        ).join('<br>');
      });
    }
  });