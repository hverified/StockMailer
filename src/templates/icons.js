function iconHistory() {
  return `
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <circle cx="4" cy="6" r="1"></circle>
      <circle cx="4" cy="12" r="1"></circle>
      <circle cx="4" cy="18" r="1"></circle>
    </svg>
  `;
}

function iconSearch() {
  return `
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
  `;
}

function iconHealth() {
  return `
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
  `;
}

function iconPlay() {
  return `
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  `;
}

module.exports = {
  iconHistory,
  iconSearch,
  iconHealth,
  iconPlay,
};
