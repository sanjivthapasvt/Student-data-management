window.addEventListener('load', () => {
    const overlay = document.getElementById('skeletonOverlay');
    overlay.classList.add('fade-out');
    setTimeout(() => { overlay.style.display='none'; }, 300);
  });

  // Fallback: Hide skeleton after 5 seconds (in case something delays the load event)
  setTimeout(() => {
    const overlay = document.getElementById('skeletonOverlay');
    overlay.classList.add('fade-out');
    setTimeout(() => { overlay.style.display='none'; }, 300);
  }, 5000);



  shimmer.config({
    duration: 1500,
    intensity: 0.9
  });
  document.addEventListener('DOMContentLoaded', () => {
    shimmer.wrap('.skeleton-element');
    // simulate data loading if needed
    setTimeout(() => {
      updateStudentCounts();
      initChart();
      shimmer.unwrap('.skeleton-element');
    }, 2000);
  });