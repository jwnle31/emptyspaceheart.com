// Apply theme before React loads to prevent jarring transitions
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;

if (shouldBeDark) {
  document.documentElement.classList.add('dark');
}
