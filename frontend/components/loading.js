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
  // loading.js - Skeleton loading implementation

// Show skeleton immediately
document.addEventListener('DOMContentLoaded', function() {
  // Show skeleton overlay
  showSkeleton();
  
  // Hide skeleton when all resources are loaded
  window.addEventListener('load', function() {
    // Add a small delay to ensure everything is rendered
    setTimeout(hideSkeleton, 300);
  });
  
  // Set a fallback timeout in case load event doesn't trigger
  setTimeout(hideSkeleton, 5000);
});

// Function to show skeleton
function showSkeleton() {
  const skeletonOverlay = document.getElementById('skeletonOverlay');
  if (skeletonOverlay) {
    skeletonOverlay.style.display = 'flex';
    skeletonOverlay.style.opacity = '1';
  }
}

// Function to hide skeleton
function hideSkeleton() {
  const skeletonOverlay = document.getElementById('skeletonOverlay');
  if (skeletonOverlay) {
    skeletonOverlay.style.opacity = '0';
    setTimeout(() => {
      skeletonOverlay.style.display = 'none';
    }, 300); // Fade out transition duration
  }
}

// Add skeleton cards during loading
(function() {
  const container = document.getElementById('studentCardsContainer');
  if (container) {
    // Add skeleton card placeholders while data loads
    const skeletonCardsHTML = Array(6).fill(0).map(() => 
      `<div class="skeleton-card"></div>`
    ).join('');
    
    const skeletonCardsContainer = document.createElement('div');
    skeletonCardsContainer.className = 'skeleton-cards-container';
    skeletonCardsContainer.innerHTML = skeletonCardsHTML;
    
    // Add to skeleton overlay
    const skeletonFull = document.querySelector('.skeleton-full');
    if (skeletonFull) {
      skeletonFull.appendChild(skeletonCardsContainer);
    }
  }
})();