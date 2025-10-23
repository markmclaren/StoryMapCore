/**
 * SimpleStoryMapLibJS Theme Builder
 * Utility for creating and customizing themes dynamically
 * Generates CSS custom properties for flexible theming
 */

/**
 * Theme Builder Class
 * Creates and manages theme configurations
 */
class ThemeBuilder {
  constructor() {
    this.themes = new Map();
    this.currentTheme = 'default';
    this.customProperties = new Set();

    // Initialize with default theme
    this.createDefaultTheme();
  }

  /**
   * Create the default theme
   */
  createDefaultTheme() {
    const defaultTheme = {
      name: 'default',
      colors: {
        primary: '#333333',
        secondary: '#666666',
        accent: '#ff0000',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#333333',
        textMuted: '#666666',
        border: '#e0e0e0',
        shadow: 'rgba(0, 0, 0, 0.1)'
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSizeBase: '16px',
        fontSizeSm: '14px',
        fontSizeLg: '18px',
        fontSizeXl: '24px',
        fontSizeXxl: '32px',
        lineHeightBase: '1.6',
        lineHeightTight: '1.4',
        lineHeightLoose: '1.8'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
      },
      layout: {
        containerMaxWidth: '1200px',
        containerPadding: '20px',
        borderRadius: '8px',
        borderRadiusSm: '4px',
        borderRadiusLg: '12px'
      },
      map: {
        height: '400px',
        borderRadius: '8px',
        shadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      },
      markers: {
        size: '10px',
        sizeActive: '12px',
        color: '#888888',
        colorActive: '#ff0000',
        strokeWidth: '2px',
        strokeWidthActive: '3px',
        strokeColor: '#ffffff'
      },
      lines: {
        width: '2px',
        widthActive: '3px',
        color: '#000000',
        colorActive: '#ff0000',
        dasharray: '2 2'
      },
      transitions: {
        fast: '0.15s ease',
        base: '0.3s ease',
        slow: '0.5s ease',
        slideDuration: '0.5s',
        slideEasing: 'ease-in-out'
      },
      shadows: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
      }
    };

    this.themes.set('default', defaultTheme);
  }

  /**
   * Create a new theme based on an existing theme
   */
  createTheme(name, baseTheme = 'default', overrides = {}) {
    const base = this.themes.get(baseTheme);
    if (!base) {
      throw new Error(`Base theme '${baseTheme}' not found`);
    }

    const newTheme = this.deepMerge({}, base, overrides);
    newTheme.name = name;

    this.themes.set(name, newTheme);
    return newTheme;
  }

  /**
   * Create a theme from color palette
   */
  createThemeFromPalette(name, colors, options = {}) {
    const baseTheme = options.baseTheme || 'default';
    const base = this.themes.get(baseTheme);

    const themeOverrides = {
      colors: {
        ...base.colors,
        ...colors
      }
    };

    return this.createTheme(name, baseTheme, themeOverrides);
  }

  /**
   * Generate CSS custom properties for a theme
   */
  generateCSS(themeName = 'default') {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new Error(`Theme '${themeName}' not found`);
    }

    let css = `/* Theme: ${theme.name} */\n`;
    css += ':root {\n';

    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      css += `  --storymap-${key}-color: ${value};\n`;
    });

    // Typography
    Object.entries(theme.typography).forEach(([key, value]) => {
      css += `  --storymap-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};\n`;
    });

    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      css += `  --storymap-spacing-${key}: ${value};\n`;
    });

    // Layout
    Object.entries(theme.layout).forEach(([key, value]) => {
      css += `  --storymap-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};\n`;
    });

    // Map
    Object.entries(theme.map).forEach(([key, value]) => {
      css += `  --storymap-map-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};\n`;
    });

    // Markers
    Object.entries(theme.markers).forEach(([key, value]) => {
      css += `  --storymap-marker-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};\n`;
    });

    // Lines
    Object.entries(theme.lines).forEach(([key, value]) => {
      css += `  --storymap-line-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};\n`;
    });

    // Transitions
    Object.entries(theme.transitions).forEach(([key, value]) => {
      css += `  --storymap-transition-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};\n`;
    });

    // Shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      css += `  --storymap-shadow-${key}: ${value};\n`;
    });

    css += '}\n';

    // Add responsive adjustments
    css += this.generateResponsiveCSS(theme);

    return css;
  }

  /**
   * Generate responsive CSS adjustments
   */
  generateResponsiveCSS(theme) {
    let css = '';

    // Mobile adjustments
    css += '@media (max-width: 767px) {\n';
    css += '  :root {\n';
    css += `    --storymap-container-padding: ${theme.spacing.md};\n`;
    css += `    --storymap-font-size-xl: ${theme.typography.fontSizeLg};\n`;
    css += `    --storymap-font-size-xxl: ${theme.typography.fontSizeXl};\n`;
    css += `    --storymap-spacing-lg: ${theme.spacing.md};\n`;
    css += `    --storymap-spacing-xl: ${theme.spacing.lg};\n`;
    css += '  }\n';
    css += '}\n';

    // Small mobile adjustments
    css += '@media (max-width: 480px) {\n';
    css += '  :root {\n';
    css += `    --storymap-container-padding: ${theme.spacing.sm};\n`;
    css += `    --storymap-font-size-lg: ${theme.typography.fontSizeBase};\n`;
    css += `    --storymap-font-size-xl: ${theme.typography.fontSizeLg};\n`;
    css += `    --storymap-spacing-md: ${theme.spacing.sm};\n`;
    css += `    --storymap-spacing-lg: ${theme.spacing.md};\n`;
    css += '  }\n';
    css += '}\n';

    return css;
  }

  /**
   * Apply theme to the page
   */
  applyTheme(themeName) {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new Error(`Theme '${themeName}' not found`);
    }

    // Remove existing theme styles
    this.removeThemeStyles();

    // Generate and inject new theme CSS
    const css = this.generateCSS(themeName);
    const style = document.createElement('style');
    style.id = `storymap-theme-${themeName}`;
    style.textContent = css;
    document.head.appendChild(style);

    this.currentTheme = themeName;
    return theme;
  }

  /**
   * Remove theme styles from the page
   */
  removeThemeStyles() {
    const existingStyles = document.querySelectorAll('style[id^="storymap-theme-"]');
    existingStyles.forEach(style => style.remove());
  }

  /**
   * Get available themes
   */
  getAvailableThemes() {
    return Array.from(this.themes.keys());
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Get theme configuration
   */
  getTheme(themeName) {
    return this.themes.get(themeName);
  }

  /**
   * Delete a theme
   */
  deleteTheme(themeName) {
    if (themeName === 'default') {
      throw new Error('Cannot delete default theme');
    }

    if (this.currentTheme === themeName) {
      this.applyTheme('default');
    }

    return this.themes.delete(themeName);
  }

  /**
   * Create preset themes
   */
  createPresetThemes() {
    // Dark theme
    this.createTheme('dark', 'default', {
      colors: {
        primary: '#ffffff',
        secondary: '#cccccc',
        accent: '#ff4444',
        background: '#1a1a1a',
        surface: '#2d2d2d',
        text: '#ffffff',
        textMuted: '#999999',
        border: '#404040',
        shadow: 'rgba(0, 0, 0, 0.3)'
      }
    });

    // Blue theme
    this.createTheme('blue', 'default', {
      colors: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#3b82f6',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#1e293b',
        textMuted: '#64748b',
        border: '#e2e8f0',
        shadow: 'rgba(59, 130, 246, 0.1)'
      }
    });

    // Green theme
    this.createTheme('green', 'default', {
      colors: {
        primary: '#166534',
        secondary: '#16a34a',
        accent: '#16a34a',
        background: '#f0fdf4',
        surface: '#ffffff',
        text: '#14532d',
        textMuted: '#15803d',
        border: '#bbf7d0',
        shadow: 'rgba(22, 163, 74, 0.1)'
      }
    });

    // Purple theme
    this.createTheme('purple', 'default', {
      colors: {
        primary: '#7c3aed',
        secondary: '#8b5cf6',
        accent: '#8b5cf6',
        background: '#faf5ff',
        surface: '#ffffff',
        text: '#581c87',
        textMuted: '#7c3aed',
        border: '#e9d5ff',
        shadow: 'rgba(139, 92, 246, 0.1)'
      }
    });
  }

  /**
   * Deep merge utility for theme objects
   */
  deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
    return this.deepMerge(target, ...sources);
  }

  /**
   * Check if value is an object
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Export theme as CSS string
   */
  exportThemeCSS(themeName) {
    return this.generateCSS(themeName);
  }

  /**
   * Export theme as JSON
   */
  exportThemeJSON(themeName) {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new Error(`Theme '${themeName}' not found`);
    }
    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme from JSON
   */
  importThemeJSON(themeJson, name) {
    try {
      const theme = JSON.parse(themeJson);
      theme.name = name || theme.name || 'imported';
      this.themes.set(theme.name, theme);
      return theme;
    } catch (error) {
      throw new Error('Invalid theme JSON: ' + error.message);
    }
  }

  /**
   * Reset to default theme
   */
  reset() {
    this.themes.clear();
    this.createDefaultTheme();
    this.applyTheme('default');
  }
}

// Create global instance
const themeBuilder = new ThemeBuilder();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeBuilder, themeBuilder };
}

if (typeof window !== 'undefined') {
  window.ThemeBuilder = ThemeBuilder;
  window.themeBuilder = themeBuilder;
}
