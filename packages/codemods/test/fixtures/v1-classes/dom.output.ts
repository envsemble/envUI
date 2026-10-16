const notices = document.querySelectorAll<HTMLElement>('.env-alert');
const first = <HTMLElement>document.querySelector(".env-calendar-heatmap .env-calendar-heatmap-cell");

for (const notice of notices) {
  if (notice.matches('.env-alert-tone')) notice.classList.remove('env-alert');
}

export { first };
