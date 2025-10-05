import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

// Test component that uses the theme context
function TestComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={() => setTheme('light')} data-testid="set-light">Set Light</button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">Set Dark</button>
      <button onClick={toggleTheme} data-testid="toggle">Toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      })
    });

    // Mock matchMedia for system preference detection
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should provide theme context to children', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toBeInTheDocument();
  });

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );

    consoleError.mockRestore();
  });

  it('should default to light theme when no preference is stored', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('should load theme from localStorage if available', () => {
    localStorageMock['theme'] = 'dark';

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('should detect system preference for dark mode', () => {
    // Mock dark mode system preference
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? true : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    })));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('should update theme when setTheme is called', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setDarkButton = screen.getByTestId('set-dark');

    await act(async () => {
      setDarkButton.click();
    });

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('should toggle between light and dark themes', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle');

    // Initial state is light
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    // Toggle to dark
    await act(async () => {
      toggleButton.click();
    });
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

    // Toggle back to light
    await act(async () => {
      toggleButton.click();
    });
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('should persist theme to localStorage when changed', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setDarkButton = screen.getByTestId('set-dark');

    await act(async () => {
      setDarkButton.click();
    });

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  it('should apply theme class to document root element', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setDarkButton = screen.getByTestId('set-dark');

    await act(async () => {
      setDarkButton.click();
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });
  });

  it('should set colorScheme style on document root', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setDarkButton = screen.getByTestId('set-dark');

    await act(async () => {
      setDarkButton.click();
    });

    await waitFor(() => {
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw errors
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('localStorage unavailable');
      }),
      setItem: vi.fn(() => {
        throw new Error('localStorage unavailable');
      })
    });

    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should still render with default theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    consoleWarn.mockRestore();
  });
});
