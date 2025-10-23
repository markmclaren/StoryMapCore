/**
 * StoryMapCore Data Provider Utilities
 * Loose utility functions for common data loading patterns
 * Supports simple JSON and multi-language configurations
 */

/**
 * Data Provider Utilities
 * Each function returns processed story data
 */
const DataProviders = {
  /**
   * Simple JSON provider (from Obama and Arya's Journey examples)
   * Loads a single JSON file and extracts story data
   */
  simple: async (config) => {
    const response = await fetch(config.jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to load ${config.jsonUrl}: ${response.status}`);
    }

    const data = await response.json();

    // Handle different JSON structures
    if (data.storymap && data.storymap.slides) {
      return data.storymap.slides;
    } else if (data.slides) {
      return data.slides;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error('Invalid JSON structure. Expected slides array or storymap.slides.');
    }
  },

  /**
   * Multi-language provider (from Las Rutas del Oro Ilegal example)
   * Loads JSON with multiple language versions and handles language switching
   */
  multilingual: async (config) => {
    const response = await fetch(config.jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to load ${config.jsonUrl}: ${response.status}`);
    }

    const fullData = await response.json();

    // Validate structure
    if (!fullData.languages || !fullData.storymaps) {
      throw new Error('Invalid multilingual JSON structure. Expected languages and storymaps properties.');
    }

    // Set default language if not specified
    const defaultLanguage = config.defaultLanguage || 'en';
    let currentLanguage = config.language || defaultLanguage;

    // Validate that the language exists
    if (!fullData.languages[currentLanguage]) {
      console.warn(`Language '${currentLanguage}' not found, falling back to '${defaultLanguage}'`);
      currentLanguage = defaultLanguage;
    }

    // Get slides for current language
    const languageData = fullData.storymaps[currentLanguage];
    if (!languageData || !languageData.storymap || !languageData.storymap.slides) {
      throw new Error(`No slides found for language '${currentLanguage}'`);
    }

    // Return enhanced data with language support
    return {
      slides: languageData.storymap.slides,
      languages: fullData.languages,
      currentLanguage: currentLanguage,
      fullData: fullData,

      // Method to switch language
      switchLanguage: (newLanguage) => {
        if (fullData.languages[newLanguage] && fullData.storymaps[newLanguage]) {
          this.currentLanguage = newLanguage;
          this.slides = fullData.storymaps[newLanguage].storymap.slides;

          // Update page title if available
          if (fullData.languages[newLanguage].title) {
            document.title = fullData.languages[newLanguage].title;
          }

          return this.slides;
        }
        return null;
      },

      // Get available languages
      getAvailableLanguages: () => {
        return Object.keys(fullData.languages);
      },

      // Get language info
      getLanguageInfo: (langCode) => {
        return fullData.languages[langCode] || null;
      }
    };
  },

  /**
   * Custom data provider
   * For completely custom data loading logic
   */
  custom: async (config) => {
    if (typeof config.dataLoader !== 'function') {
      throw new Error('Custom data provider requires config.dataLoader function');
    }

    return await config.dataLoader(config);
  },

  /**
   * URL parameter provider
   * Loads data based on URL parameters (useful for dynamic loading)
   */
  urlParams: async (config) => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataUrl = urlParams.get('data') || urlParams.get('story') || config.jsonUrl;

    if (!dataUrl) {
      throw new Error('No data URL found in parameters or config');
    }

    // Merge URL params with config
    const finalConfig = { ...config, jsonUrl: dataUrl };

    // Detect if it's multilingual based on URL or config
    if (urlParams.get('lang') || config.multilingual) {
      return DataProviders.multilingual(finalConfig);
    } else {
      return DataProviders.simple(finalConfig);
    }
  }
};

/**
 * Helper function to create data loader with automatic provider detection
 */
async function loadStoryData(config) {
  // Auto-detect provider based on configuration
  if (config.dataLoader) {
    return DataProviders.custom(config);
  } else if (config.multilingual || config.languages) {
    return DataProviders.multilingual(config);
  } else if (config.urlParams) {
    return DataProviders.urlParams(config);
  } else {
    return DataProviders.simple(config);
  }
}

/**
 * Data validation utilities
 */
const DataValidators = {
  /**
   * Validate slide data structure
   */
  validateSlide: (slide, index) => {
    const errors = [];

    if (!slide) {
      errors.push(`Slide ${index}: Slide is null or undefined`);
      return errors;
    }

    // Check for required text content
    if (!slide.text || !slide.text.headline) {
      errors.push(`Slide ${index}: Missing headline in slide.text`);
    }

    // Check location validity
    if (slide.location) {
      if (!DataValidators.isValidLocation(slide.location)) {
        errors.push(`Slide ${index}: Invalid location data`);
      }
    }

    // Check media validity
    if (slide.media && slide.media.url) {
      if (!DataValidators.isValidMediaUrl(slide.media.url)) {
        errors.push(`Slide ${index}: Invalid media URL`);
      }
    }

    return errors;
  },

  /**
   * Validate location data
   */
  isValidLocation: (location) => {
    return (
      location &&
      typeof location.lat === 'number' &&
      typeof location.lon === 'number' &&
      !isNaN(location.lat) &&
      !isNaN(location.lon)
    );
  },

  /**
   * Validate media URL
   */
  isValidMediaUrl: (url) => {
    if (typeof url !== 'string') return false;

    // Check for YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return true;
    }

    // Check for image URLs
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return true;
    }

    // Check for video URLs
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return true;
    }

    return false;
  },

  /**
   * Validate entire story data
   */
  validateStoryData: (data) => {
    const errors = [];

    if (!Array.isArray(data)) {
      errors.push('Story data must be an array of slides');
      return errors;
    }

    if (data.length === 0) {
      errors.push('Story data cannot be empty');
      return errors;
    }

    data.forEach((slide, index) => {
      const slideErrors = DataValidators.validateSlide(slide, index);
      errors.push(...slideErrors);
    });

    return errors;
  }
};

/**
 * Data transformation utilities
 */
const DataTransformers = {
  /**
   * Add default values to slides
   */
  addDefaults: (slides, defaults = {}) => {
    return slides.map(slide => ({
      text: {
        headline: '',
        text: '',
        ...defaults.text,
        ...slide.text
      },
      location: {
        lat: 0,
        lon: 0,
        zoom: 2,
        line: false,
        ...defaults.location,
        ...slide.location
      },
      media: {
        url: '',
        caption: '',
        credit: '',
        ...defaults.media,
        ...slide.media
      },
      background: {
        color: '',
        url: '',
        opacity: 100,
        ...defaults.background,
        ...slide.background
      },
      ...slide
    }));
  },

  /**
   * Filter slides by criteria
   */
  filterSlides: (slides, criteria) => {
    return slides.filter(slide => {
      // Filter by location validity
      if (criteria.validLocationsOnly) {
        if (!DataValidators.isValidLocation(slide.location)) {
          return false;
        }
      }

      // Filter by media availability
      if (criteria.withMediaOnly) {
        if (!slide.media || !slide.media.url) {
          return false;
        }
      }

      // Filter by custom function
      if (typeof criteria.customFilter === 'function') {
        return criteria.customFilter(slide);
      }

      return true;
    });
  },

  /**
   * Sort slides by criteria
   */
  sortSlides: (slides, sortBy = 'index') => {
    const sorted = [...slides];

    switch (sortBy) {
      case 'location':
        return sorted.sort((a, b) => {
          if (!a.location || !b.location) return 0;
          return a.location.lat - b.location.lat;
        });

      case 'date':
        return sorted.sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return new Date(a.date) - new Date(b.date);
        });

      case 'headline':
        return sorted.sort((a, b) => {
          if (!a.text || !b.text) return 0;
          return a.text.headline.localeCompare(b.text.headline);
        });

      default:
        return sorted; // Keep original order
    }
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DataProviders,
    DataValidators,
    DataTransformers,
    loadStoryData
  };
}

if (typeof window !== 'undefined') {
  window.DataProviders = DataProviders;
  window.DataValidators = DataValidators;
  window.DataTransformers = DataTransformers;
  window.loadStoryData = loadStoryData;
}
