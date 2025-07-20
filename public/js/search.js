// static/js/search.js (optionnel, avec Lunr.js)
document.addEventListener('DOMContentLoaded', () => {
  const indexUrl = '/index.json';
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  fetch(indexUrl)
    .then(response => response.json())
    .then(data => {
      const idx = lunr(function () {
        this.ref('url');
        this.field('title');
        this.field('content');
        data.articles.forEach(doc => this.add(doc));
      });

      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length < 3) {
          searchResults.innerHTML = '';
          return;
        }
        const results = idx.search(query);
        searchResults.innerHTML = results.map(result => {
          const article = data.articles.find(a => a.url === result.ref);
          return `<a href="${article.url}">${article.title} (${article.date})</a>`;
        }).join('<br>');
      });
    })
    .catch(error => console.error('Erreur de chargement de l’index:', error));
});