  document.addEventListener('DOMContentLoaded', function() {
    // Show content after DOM is loaded
    setTimeout(function() {
      const loadingScreen = document.getElementById('loading-screen');
      loadingScreen.classList.add('opacity-0');
      loadingScreen.style.transition = 'opacity 0.6s ease';
      
      // Remove from DOM after fade out
      setTimeout(function() {
        loadingScreen.classList.add('hidden');
      }, 600);
    }, 1000); // Adding a minimum delay so loading is visible
  });

  // Fallback to ensure loading screen is removed even if some resources fail
  window.addEventListener('load', function() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen.classList.contains('hidden')) {
      loadingScreen.classList.add('opacity-0');
      loadingScreen.style.transition = 'opacity 0.6s ease';
      
      setTimeout(function() {
        loadingScreen.classList.add('hidden');
      }, 600);
    }
  });