function iconHistory() {
  return `
    <svg class="icon icon-history" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9"></circle>
      <polyline points="12 7 12 12 15.5 14"></polyline>
    </svg>
  `;
}

function iconSearch() {
  return `
    <svg class="icon icon-scan" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7"></circle>
      <line x1="20" y1="20" x2="16.5" y2="16.5"></line>
    </svg>
  `;
}

function iconHealth() {
  return `
    <svg class="icon icon-health" viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="3 12 7 12 10 6 14 18 17 12 21 12"></polyline>
    </svg>
  `;
}

function iconPlay() {
  return `
    <svg class="icon icon-run" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9"></circle>
      <polygon points="10 8.5 16 12 10 15.5 10 8.5"></polygon>
    </svg>
  `;
}

function iconReport() {
  return `
    <svg class="icon icon-report" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="4" y1="20" x2="20" y2="20"></line>
      <rect x="5" y="11" width="3" height="7"></rect>
      <rect x="10.5" y="8" width="3" height="10"></rect>
      <rect x="16" y="5" width="3" height="13"></rect>
    </svg>
  `;
}

module.exports = {
  iconHistory,
  iconSearch,
  iconHealth,
  iconPlay,
  iconReport,
};
