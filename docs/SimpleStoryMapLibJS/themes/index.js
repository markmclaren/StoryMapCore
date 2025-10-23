/**
 * StoryMapJS Themes Index
 * Unified exports for theme system
 */

// Import theme modules
import './base-theme.css';
import './theme-builder.js';

// Re-export theme builder
export { ThemeBuilder, themeBuilder } from './theme-builder.js';

// Default export
export default {
  ThemeBuilder,
  themeBuilder
};
