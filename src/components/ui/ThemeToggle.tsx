import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

/**
 * ThemeToggle component for switching between light and dark themes
 *
 * Uses ThemeContext to manage theme state and displays appropriate icon
 * with smooth transitions. Fully accessible with ARIA labels and keyboard navigation.
 *
 * @example
 * <ThemeToggle />
 * <ThemeToggle className="ml-4" />
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';
  const ariaLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      onClick={toggleTheme}
      aria-label={ariaLabel}
      className={`
        relative w-10 h-10 rounded-xl p-2
        bg-white dark:bg-gray-800
        border border-gray-300 dark:border-gray-600
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        transition-all duration-200
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {/* Icon container with crossfade animation */}
      <div className="relative w-full h-full">
        {/* Sun icon (light mode) */}
        <Sun
          className={`
            absolute inset-0 w-full h-full
            text-yellow-500
            transition-all duration-300
            ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `.trim().replace(/\s+/g, ' ')}
        />

        {/* Moon icon (dark mode) */}
        <Moon
          className={`
            absolute inset-0 w-full h-full
            text-purple-400
            transition-all duration-300
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          `.trim().replace(/\s+/g, ' ')}
        />
      </div>
    </button>
  );
}
