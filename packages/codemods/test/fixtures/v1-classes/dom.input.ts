const notices = document.querySelectorAll<HTMLElement>('.env-notice');
const first = <HTMLElement>document.querySelector(".env-heatmap .env-heatmap-cell");

for (const notice of notices) {
  if (notice.matches('.env-notice-tone')) notice.classList.remove('env-notice');
}

export const diffLabel = document.querySelector('.env-diff-count .env-counter-label');

export { first };
