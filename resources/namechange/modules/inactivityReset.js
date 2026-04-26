
const INACTIVITY_MS = 3 * 60 * 1000; // 10 minutes

let timeoutId = null;

function isIndexPage() {
  const path = window.location.pathname;
  const page = path.split('/').pop() || '';
  return page === '' || page === 'index.html';
}

function resetTimer() {
  if (isIndexPage()) return;

  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    window.location.href = 'index.html';
  }, INACTIVITY_MS);
}

function init() {
  if (isIndexPage()) return;

  const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
  events.forEach((event) => document.addEventListener(event, resetTimer));

  resetTimer();
}

export default { init };
