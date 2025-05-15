// Initialize theme based on user preference
export function initializeTheme() {
  // Check if theme is stored in localStorage
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme) {
    // Apply stored theme
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  } else {
    // Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", prefersDark);
    localStorage.setItem("theme", prefersDark ? "dark" : "light");
  }
}
