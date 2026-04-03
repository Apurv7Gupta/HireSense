import { useEffect, useState, useCallback } from "react";

const THEME_KEY = "app-theme";

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const ThemeToggleButton = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || getSystemTheme();
  });

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.5rem 1rem",

        borderRadius: "var(--border-radius-md)",
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        color: "var(--text-main)",
        fontFamily: "var(--font-family)",
        fontWeight: "600",
        fontSize: "0.85rem",

        cursor: "pointer",
        transition: "var(--transition-base)",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      <span
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",

          background: isDark ? "var(--brand-accent)" : "var(--status-warning)",
          boxShadow: isDark
            ? "0 0 8px var(--brand-primary)"
            : "0 0 8px var(--status-warning)",
          flexShrink: 0,
        }}
      />

      <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
};

export default ThemeToggleButton;
