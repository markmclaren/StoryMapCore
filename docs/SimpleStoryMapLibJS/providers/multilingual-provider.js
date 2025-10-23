/**
 * Multilingual Data Provider
 * Generic provider for multilingual story maps with custom map initialization
 * and language switching functionality
 */

/**
 * Multilingual Data Provider Class
 * Handles multilingual data loading, custom map initialization, and language switching
 */
class MultilingualDataProvider {
  constructor() {
    this.currentLanguage = 'en';
    this.languages = {};
    this.storyData = null;
    this.fullData = null;
  }

  /**
   * Load multilingual data from JSON file
   */
  async loadData(config) {
    try {
      const response = await fetch(config.jsonUrl);
      if (!response.ok) {
        throw new Error(`Failed to load ${config.jsonUrl}: ${response.status}`);
      }

      this.fullData = await response.json();

      // Validate structure
      if (!this.fullData.languages || !this.fullData.storymaps) {
        throw new Error('Invalid multilingual JSON structure. Expected languages and storymaps properties.');
      }

      // Set default language
      this.currentLanguage = config.defaultLanguage || 'en';

      // Validate that the language exists
      if (!this.fullData.languages[this.currentLanguage]) {
        console.warn(`Language '${this.currentLanguage}' not found, falling back to 'en'`);
        this.currentLanguage = 'en';
      }

      // Store languages for reference
      this.languages = this.fullData.languages;

      // Get slides for current language
      const languageData = this.fullData.storymaps[this.currentLanguage];
      if (!languageData || !languageData.storymap || !languageData.storymap.slides) {
        throw new Error(`No slides found for language '${this.currentLanguage}'`);
      }

      this.storyData = languageData.storymap.slides;

      // Update page title if available
      if (this.fullData.languages[this.currentLanguage].title) {
        document.title = this.fullData.languages[this.currentLanguage].title;
      }

      return this.storyData;

    } catch (error) {
      console.error('Error loading multilingual data:', error);
      throw error;
    }
  }



  /**
   * Initialize language selector dropdown
   */
  initializeLanguageSelector() {
    const languageSelector = document.getElementById('language-selector');
    if (!languageSelector) return;

    // Clear existing options
    languageSelector.innerHTML = '';

    // Populate language options
    Object.keys(this.languages).forEach(langCode => {
      const langInfo = this.languages[langCode];
      const option = document.createElement('option');
      option.value = langCode;
      option.textContent = langInfo.name;
      if (langCode === this.currentLanguage) {
        option.selected = true;
      }
      languageSelector.appendChild(option);
    });

    // Set initial page title
    const currentLangData = this.languages[this.currentLanguage];
    if (currentLangData && currentLangData.title) {
      document.title = currentLangData.title;
    }

    // Update navigation button text
    this.updateNavButtonText();
  }

  /**
   * Update navigation button text based on current language
   */
  updateNavButtonText() {
    const currentLangData = this.languages[this.currentLanguage];
    if (!currentLangData) return;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');

    if (prevBtn) prevBtn.textContent = currentLangData.prev || 'Previous';
    if (nextBtn) nextBtn.textContent = currentLangData.next || 'Next';
    if (restartBtn) restartBtn.textContent = currentLangData.restart || 'Restart';
  }

  /**
   * Switch to a different language
   */
  switchLanguage(newLanguage, options = {}) {
    if (!this.fullData || !this.fullData.languages[newLanguage] || !this.fullData.storymaps[newLanguage]) {
      console.warn(`Language '${newLanguage}' not available`);
      return null;
    }

    this.currentLanguage = newLanguage;

    // Get slides for new language
    const languageData = this.fullData.storymaps[newLanguage];
    this.storyData = languageData.storymap.slides;

    // Update page title
    if (this.fullData.languages[newLanguage].title) {
      document.title = this.fullData.languages[newLanguage].title;
    }

    // Update navigation buttons
    this.updateNavButtonText();

    return this.storyData;
  }

  /**
   * Switch language and maintain slide position
   */
  switchLanguageWithPosition(newLanguage, currentSlideIndex, options = {}) {
    const { maintainSlidePosition = true } = options;

    // Switch the language data first
    const newSlides = this.switchLanguage(newLanguage, options);
    if (!newSlides) return null;

    // If maintaining position is disabled, reset to first slide
    if (!maintainSlidePosition) {
      return { newSlides, targetSlideIndex: 0 };
    }

    // Try to maintain the current slide position
    let targetSlideIndex = currentSlideIndex;

    // If current slide index is beyond the new language's slide count, go to last slide
    if (currentSlideIndex >= newSlides.length) {
      targetSlideIndex = newSlides.length - 1;
    }

    // Ensure we don't go below 0
    if (targetSlideIndex < 0) {
      targetSlideIndex = 0;
    }

    return { newSlides, targetSlideIndex };
  }

  /**
   * Get current language data
   */
  getCurrentLanguageData() {
    return this.languages[this.currentLanguage] || null;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return Object.keys(this.languages);
  }

  /**
   * Get language info for a specific language
   */
  getLanguageInfo(langCode) {
    return this.languages[langCode] || null;
  }

  /**
   * Get styling configuration for the story map
   */
  getStylingConfig() {
    return {
      markerRadius: 10,
      markerRadiusActive: 12,
      markerColor: "#8C4B00",
      markerColorActive: "#F29F05",
      markerStrokeWidth: 2,
      markerStrokeWidthActive: 2,
      markerStrokeColor: "#ffffff",
      lineColor: "#FFFFFF",
      lineColorActive: "#F29F05",
      lineWidth: 2,
      lineWidthActive: 2,
      lineDasharray: [2, 2]
    };
  }

  /**
   * Get features configuration
   */
  getFeaturesConfig() {
    return {
      animations: true,
      keyboardNavigation: true,
      progressBar: false // We'll handle progress display manually
    };
  }

  /**
   * Create a simple multilingual story map with minimal configuration
   * @deprecated Use the standard StoryMap constructor with mapProvider instead
   */
  static createSimpleMultilingualStoryMap(config) {
    const {
      jsonUrl,
      mapContainer = 'map',
      defaultLanguage = 'en',
      mapType = 'sentinel2', // 'sentinel2' or 'standard'
      maintainSlidePosition = true  // Maintain slide position when switching languages
    } = config;

    // Determine map provider based on mapType
    const mapProvider = mapType === 'sentinel2' ? 'satellite' : 'standard';

    return {
      jsonUrl,
      dataLoader: (loadConfig) => {
        const provider = new MultilingualDataProvider();
        return provider.loadData({ ...loadConfig, defaultLanguage });
      },
      mapProvider: mapProvider,
      mapContainer,
      features: new MultilingualDataProvider().getFeaturesConfig(),
      styling: new MultilingualDataProvider().getStylingConfig()
    };
  }
}

/**
 * Factory function to create a multilingual data provider instance
 */
function createMultilingualProvider() {
  return new MultilingualDataProvider();
}

/**
 * Convenience function for loading multilingual data
 */
async function loadMultilingualData(config) {
  const provider = new MultilingualDataProvider();
  return await provider.loadData(config);
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MultilingualDataProvider,
    createMultilingualProvider,
    loadMultilingualData
  };
}

if (typeof window !== 'undefined') {
  window.MultilingualDataProvider = MultilingualDataProvider;
  window.createMultilingualProvider = createMultilingualProvider;
  window.loadMultilingualData = loadMultilingualData;
}
