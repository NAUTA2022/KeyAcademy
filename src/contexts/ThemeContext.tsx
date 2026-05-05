// Dark mode is handled directly in Navbar + index.html inline script.
// This file is kept as a stub to avoid breaking imports if any remain.
export const useTheme = () => ({
  dark: document.documentElement.classList.contains('dark'),
  toggleDark: () => {},
});
