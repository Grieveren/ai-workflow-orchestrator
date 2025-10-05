import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Helper to render with ThemeProvider
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('ThemeToggle', () => {
  it('renders toggle button', () => {
    renderWithTheme(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('displays correct aria-label for light mode', () => {
    // Set to light mode in localStorage before render
    localStorage.setItem('theme', 'light');
    renderWithTheme(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('displays correct aria-label for dark mode', () => {
    // Set to dark mode in localStorage before render
    localStorage.setItem('theme', 'dark');
    renderWithTheme(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('toggles theme when clicked', async () => {
    const user = userEvent.setup();
    localStorage.setItem('theme', 'light');
    renderWithTheme(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Initially should be light mode
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

    // Click to toggle
    await user.click(button);

    // Should now be dark mode
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    localStorage.setItem('theme', 'light');
    renderWithTheme(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Focus the button
    button.focus();
    expect(button).toHaveFocus();

    // Press Enter to toggle
    await user.keyboard('{Enter}');

    // Theme should have toggled
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('applies custom className', () => {
    renderWithTheme(<ThemeToggle className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('persists theme to localStorage on toggle', async () => {
    const user = userEvent.setup();
    localStorage.setItem('theme', 'light');
    renderWithTheme(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Toggle to dark
    await user.click(button);

    // Check localStorage
    expect(localStorage.getItem('theme')).toBe('dark');

    // Toggle back to light
    await user.click(button);

    // Check localStorage again
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
