// Toggle menu mobile
document.addEventListener('DOMContentLoaded', function() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const themeToggle = document.getElementById('theme-toggle');
  
  // Menu mobile
  if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', function() {
          navMenu.classList.toggle('show');
          // Changer l'icône du burger
          this.textContent = navMenu.classList.contains('show') ? '✕' : '☰';
      });
      
      // Fermer le menu quand on clique sur un lien
      navMenu.addEventListener('click', function(e) {
          if (e.target.classList.contains('nav-link')) {
              navMenu.classList.remove('show');
              mobileToggle.textContent = '☰';
          }
      });
  }
  
  // Toggle thème (optionnel - pour basculer entre sombre/clair)
  if (themeToggle) {
      themeToggle.addEventListener('click', function() {
          const html = document.documentElement;
          const currentTheme = html.getAttribute('data-theme');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          const themeIcon = this.querySelector('.theme-icon');
          
          html.setAttribute('data-theme', newTheme);
          themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
          
          // Sauvegarder la préférence
          localStorage.setItem('theme', newTheme);
      });
      
      // Charger la préférence de thème
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      const themeIcon = themeToggle.querySelector('.theme-icon');
      themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
  }
});