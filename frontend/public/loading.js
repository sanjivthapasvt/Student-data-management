window.addEventListener('load', () => {
    const overlay = document.getElementById('skeletonOverlay');
    overlay.classList.add('fade-out');
    setTimeout(() => { overlay.style.display='none'; }, 300);
  });

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
    setTimeout(() => {
      updateStudentCounts();
      initChart();
      shimmer.unwrap('.skeleton-element');
    }, 2000);
  });