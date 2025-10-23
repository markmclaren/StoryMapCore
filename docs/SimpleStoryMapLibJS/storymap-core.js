/**
 * SimpleStoryMapLibJS Core Library
 * Flexibility-First Architecture - Maximum customization with clean distribution
 *
 * This library extracts the 95% shared functionality from existing examples
 * while maintaining maximum flexibility for customization.
 */

class StoryMap {
  constructor(config = {}) {
    this.config = {
      // Data configuration
      jsonUrl: config.jsonUrl,
      dataLoader: config.dataLoader,

      // Map configuration
      mapProvider: config.mapProvider,
      mapInitializer: config.mapInitializer,
      mapContainer: config.mapContainer || 'map',

      // UI configuration
      features: {
        animations: config.features?.animations !== false,
        keyboardNavigation: config.features?.keyboardNavigation !== false,
        progressBar: config.features?.progressBar !== false,
        ...config.features
      },

      // Styling constants (customizable)
      styling: {
        markerRadius: config.styling?.markerRadius || 10,
        markerRadiusActive: config.styling?.markerRadiusActive || 12,
        markerColor: config.styling?.markerColor || '#888888',
        markerColorActive: config.styling?.markerColorActive || '#ff0000',
        markerStrokeWidth: config.styling?.markerStrokeWidth || 2,
        markerStrokeWidthActive: config.styling?.markerStrokeWidthActive || 3,
        markerStrokeColor: config.styling?.markerStrokeColor || '#ffffff',
        lineColor: config.styling?.lineColor || '#000000',
        lineColorActive: config.styling?.lineColorActive || '#ff0000',
        lineWidth: config.styling?.lineWidth || 2,
        lineDasharray: config.styling?.lineDasharray || [2, 2],
        ...config.styling
      }
    };

    // Internal state
    this.map = null;
    this.storyData = null;
    this.currentSlideIndex = 0;
    this.markers = [];
    this.lines = [];
    this.isAnimating = false;

    // Start initialization
    this.initialize();
  }

  async initialize() {
    try {
      // Load story data
      await this.loadStoryData();

      // Initialize map
      this.initializeMap();

      // Set up event listeners
      this.setupEventListeners();

      // Note: updateSlide() will be called after map loads

    } catch (error) {
      console.error('StoryMap initialization failed:', error);
    }
  }

  async loadStoryData() {
    if (this.config.dataLoader) {
      // Use custom data loader (e.g., for multi-language support)
      this.storyData = await this.config.dataLoader(this.config);
    } else if (this.config.jsonUrl) {
      // Default JSON loading
      const response = await fetch(this.config.jsonUrl);
      const data = await response.json();
      this.storyData = data.storymap?.slides || data.slides || data;
    } else {
      throw new Error('No data source provided. Please specify jsonUrl or dataLoader.');
    }
  }

  initializeMap() {
    // Find first valid slide for initial map position
    const firstValidSlide = this.storyData.find(slide =>
      this.isValidLocation(slide.location)
    );

    if (this.config.mapInitializer && firstValidSlide) {
      // Use custom map initializer (maximum flexibility)
      this.map = this.config.mapInitializer(
        this.config.mapContainer,
        firstValidSlide
      );
    } else if (this.config.mapProvider && firstValidSlide) {
      // Use built-in map provider
      this.map = this.initializeMapProvider(firstValidSlide);
    } else {
      throw new Error('No map initialization method provided.');
    }

    // Set up map event handlers
    this.setupMapEventHandlers();
  }

  initializeMapProvider(firstSlide) {
    // This will be implemented in Phase 2 with provider utilities
    // For now, basic maplibregl setup
    return new maplibregl.Map({
      container: this.config.mapContainer,
      center: [
        parseFloat(firstSlide.location.lon),
        parseFloat(firstSlide.location.lat)
      ],
      zoom: parseFloat(firstSlide.location.zoom) || 2,
      style: 'https://tiles.openfreemap.org/styles/liberty'
    });
  }

  setupMapEventHandlers() {
    if (!this.map) return;

    this.map.on('load', () => {
      this.createAllLines();
      this.createAllMarkers();
      // Now that the map is loaded, update the initial slide
      this.updateSlide();
    });

    // Clean up attribution controls
    this.cleanupAttributionControls();
  }

  cleanupAttributionControls() {
    if (!this.map) return;

    const controls = document.querySelectorAll('.maplibregl-ctrl-attrib');
    controls.forEach(ctrl => ctrl.remove());

    const attributionControl = new maplibregl.AttributionControl({
      compact: true
    });
    this.map.addControl(attributionControl);

    // Collapse attribution by default
    setTimeout(() => {
      const detailsElem = document.querySelector('details.maplibregl-compact-show');
      if (detailsElem && detailsElem.hasAttribute('open')) {
        detailsElem.removeAttribute('open');
      }
    }, 100);
  }

  setupEventListeners() {
    // Navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.navigatePrevious());
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.navigateNext());
    }
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restart());
    }

    // Keyboard navigation
    if (this.config.features.keyboardNavigation) {
      document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
          this.navigatePrevious();
        } else if (event.key === 'ArrowRight') {
          this.navigateNext();
        }
      });
    }
  }

  // Navigation methods
  navigatePrevious() {
    if (this.currentSlideIndex > 0 && !this.isAnimating) {
      this.currentSlideIndex--;
      this.updateSlide('prev');
    }
  }

  navigateNext() {
    if (this.currentSlideIndex < this.storyData.length - 1 && !this.isAnimating) {
      this.currentSlideIndex++;
      this.updateSlide('next');
    }
  }

  restart() {
    if (!this.isAnimating) {
      this.currentSlideIndex = 0;

      // Find the first slide with valid coordinates and fly to it (like old implementation)
      const firstValidSlide = this.storyData.find(slide =>
        this.isValidLocation(slide.location)
      );

      if (firstValidSlide) {
        this.flyToSlide(this.storyData.indexOf(firstValidSlide));
      }

      this.updateSlide('none');
    }
  }

  navigateToSlide(targetIndex) {
    if (targetIndex >= 0 && targetIndex < this.storyData.length && !this.isAnimating) {
      this.currentSlideIndex = targetIndex;
      this.updateSlide('none');
    }
  }

  // Map utility methods
  isValidLocation(location) {
    return (
      location &&
      location.lat !== null &&
      location.lat !== undefined &&
      !isNaN(parseFloat(location.lat)) &&
      location.lon !== null &&
      location.lon !== undefined &&
      !isNaN(parseFloat(location.lon))
    );
  }

  flyToSlide(slideIndex) {
    const slide = this.storyData[slideIndex];
    if (slide && this.isValidLocation(slide.location) && this.map) {
      this.map.flyTo({
        center: [parseFloat(slide.location.lon), parseFloat(slide.location.lat)],
        zoom: parseFloat(slide.location.zoom) || this.map.getZoom(),
        essential: true
      });
    }
  }

  // Marker and line management
  createAllMarkers() {
    if (!this.map || !this.storyData) return;

    // Create all markers in the inactive layer first
    this.createInactiveMarkers();

    // Create empty active marker layer
    this.createActiveMarker();

    // Move the current slide's marker to active layer (only if it has valid coordinates)
    if (this.isValidLocation(this.storyData[this.currentSlideIndex].location)) {
      this.moveMarkerToActive(this.currentSlideIndex);
    }
  }

  createAllLines() {
    if (!this.map || !this.storyData) return;

    // Create line segments between consecutive slides that have line: true
    for (let i = 0; i < this.storyData.length - 1; i++) {
      const currentSlide = this.storyData[i];
      const nextSlide = this.storyData[i + 1];

      // Check if current slide has line: true and both slides have valid locations
      if (
        currentSlide.location &&
        currentSlide.location.line === true &&
        this.isValidLocation(currentSlide.location) &&
        this.isValidLocation(nextSlide.location)
      ) {
        this.createLineSegment(i, currentSlide, nextSlide);
      }
    }
  }

  createLineSegment(index, currentSlide, nextSlide) {
    if (!this.map) return;

    const lineId = `line-${index}`;
    const sourceId = `line-source-${index}`;

    // Create great circle line using Turf.js
    const startPoint = turf.point([
      parseFloat(currentSlide.location.lon),
      parseFloat(currentSlide.location.lat)
    ]);
    const endPoint = turf.point([
      parseFloat(nextSlide.location.lon),
      parseFloat(nextSlide.location.lat)
    ]);

    // Generate great circle line with appropriate resolution
    const greatCircleLine = turf.greatCircle(startPoint, endPoint, {
      npoints: 100 // Number of points to generate for smooth curve
    });

    // Add source for this great circle line segment
    this.map.addSource(sourceId, {
      type: "geojson",
      data: greatCircleLine,
    });

    // Add layer for this line segment with styling
    this.map.addLayer({
      id: lineId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": this.config.styling.lineColor,
        "line-width": this.config.styling.lineWidth,
        "line-dasharray": this.config.styling.lineDasharray,
      },
    });

    this.lines.push({ id: lineId, targetSlideIndex: index + 1 });
  }

  createInactiveMarkers() {
    if (!this.map || !this.storyData) return;

    // Collect all valid marker locations
    const inactiveMarkerFeatures = this.storyData
      .map((slide, index) => {
        if (this.isValidLocation(slide.location)) {
          return {
            type: "Feature",
            properties: {
              slideIndex: index,
              isActive: false,
              isClickable: true
            },
            geometry: {
              type: "Point",
              coordinates: [
                parseFloat(slide.location.lon),
                parseFloat(slide.location.lat)
              ]
            }
          };
        }
        return null;
      })
      .filter(feature => feature !== null);

    // Add source for inactive markers
    this.map.addSource("inactive-markers", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: inactiveMarkerFeatures
      }
    });

    // Add circle layer for inactive markers
    this.map.addLayer({
      id: "inactive-marker-circles",
      type: "circle",
      source: "inactive-markers",
      paint: {
        "circle-radius": this.config.styling.markerRadius,
        "circle-color": this.config.styling.markerColor,
        "circle-stroke-width": this.config.styling.markerStrokeWidth,
        "circle-stroke-color": this.config.styling.markerStrokeColor,
        "circle-opacity": 1
      }
    });

    // Add click event listener to the inactive markers layer
    this.map.on("click", "inactive-marker-circles", (e) => {
      if (e.features.length > 0) {
        const clickedSlideIndex = e.features[0].properties.slideIndex;
        if (clickedSlideIndex !== this.currentSlideIndex && !this.isAnimating) {
          this.navigateToSlide(clickedSlideIndex);
        }
      }
    });

    // Add hover effects for inactive markers
    this.map.on("mouseenter", "inactive-marker-circles", () => {
      this.map.getCanvas().style.cursor = "pointer";
    });

    this.map.on("mouseleave", "inactive-marker-circles", () => {
      this.map.getCanvas().style.cursor = "";
    });
  }

  createActiveMarker() {
    if (!this.map) return;

    // Add source for active marker (initially empty)
    this.map.addSource("active-marker", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: []
      }
    });

    // Add circle layer for active marker (added last so it renders on top)
    this.map.addLayer({
      id: "active-marker-circle",
      type: "circle",
      source: "active-marker",
      paint: {
        "circle-radius": this.config.styling.markerRadiusActive,
        "circle-color": this.config.styling.markerColorActive,
        "circle-stroke-width": this.config.styling.markerStrokeWidthActive,
        "circle-stroke-color": this.config.styling.markerStrokeColor,
        "circle-opacity": 1
      }
    });

    // Add click event listener to the active marker layer
    this.map.on("click", "active-marker-circle", (e) => {
      if (e.features.length > 0) {
        const clickedSlideIndex = e.features[0].properties.slideIndex;
        if (clickedSlideIndex !== this.currentSlideIndex && !this.isAnimating) {
          this.navigateToSlide(clickedSlideIndex);
        }
      }
    });

    // Add hover effects for active marker
    this.map.on("mouseenter", "active-marker-circle", () => {
      this.map.getCanvas().style.cursor = "pointer";
    });

    this.map.on("mouseleave", "active-marker-circle", () => {
      this.map.getCanvas().style.cursor = "";
    });
  }

  updateMapElements() {
    if (!this.map) return;

    // Update line colors based on current slide
    this.updateLineColors();

    // Update marker colors
    this.updateMarkerColors();
  }

  updateLineColors() {
    if (!this.map) return;

    // Update all lines based on current slide
    this.lines.forEach((line) => {
      if (line.targetSlideIndex === this.currentSlideIndex) {
        // This line leads to the current slide, make it active color
        this.map.setPaintProperty(line.id, "line-color", this.config.styling.lineColorActive);
      } else {
        // All other lines are inactive color
        this.map.setPaintProperty(line.id, "line-color", this.config.styling.lineColor);
      }
    });
  }

  updateMarkerColors() {
    if (!this.map) return;

    const previousActiveIndex = this.getPreviouslyActiveMarkerIndex();

    // If there's a previously active marker that's different from current, move it to inactive
    if (previousActiveIndex !== null && previousActiveIndex !== this.currentSlideIndex) {
      this.moveMarkerToInactive(previousActiveIndex);
    }

    // Move current marker to active layer (if it's not already there and has valid coordinates)
    if (this.currentSlideIndex !== previousActiveIndex && this.isValidLocation(this.storyData[this.currentSlideIndex].location)) {
      this.moveMarkerToActive(this.currentSlideIndex);
    }
  }

  getPreviouslyActiveMarkerIndex() {
    if (!this.map) return null;

    const activeSource = this.map.getSource("active-marker");
    if (activeSource && activeSource._data && activeSource._data.features.length > 0) {
      return activeSource._data.features[0].properties.slideIndex;
    }
    return null;
  }

  moveMarkerToInactive(slideIndex) {
    if (!this.map) return;

    // Get the marker data from the active layer
    const activeSource = this.map.getSource("active-marker");
    if (!activeSource || activeSource._data.features.length === 0) return;

    const markerFeature = activeSource._data.features[0];

    // Add to inactive markers
    const inactiveSource = this.map.getSource("inactive-markers");
    if (inactiveSource) {
      const inactiveData = inactiveSource._data;
      inactiveData.features.push({
        ...markerFeature,
        properties: {
          ...markerFeature.properties,
          isActive: false
        }
      });
      inactiveSource.setData(inactiveData);
    }

    // Clear the active marker
    activeSource.setData({
      type: "FeatureCollection",
      features: []
    });
  }

  moveMarkerToActive(slideIndex) {
    if (!this.map || !this.storyData) return;

    // Find the marker in inactive markers and move it to active
    const inactiveSource = this.map.getSource("inactive-markers");
    if (!inactiveSource) return;

    const inactiveData = inactiveSource._data;
    const markerIndex = inactiveData.features.findIndex(
      feature => feature.properties.slideIndex === slideIndex
    );

    if (markerIndex !== -1) {
      const markerFeature = inactiveData.features[markerIndex];

      // Set up the active marker source with this marker
      const activeSource = this.map.getSource("active-marker");
      if (activeSource) {
        activeSource.setData({
          type: "FeatureCollection",
          features: [{
            ...markerFeature,
            properties: {
              ...markerFeature.properties,
              isActive: true
            }
          }]
        });
      }

      // Remove from inactive markers
      inactiveData.features.splice(markerIndex, 1);
      inactiveSource.setData(inactiveData);
    }
  }

  // Slide update system
  updateSlide(direction = 'none') {
    const slide = this.storyData[this.currentSlideIndex];
    if (!slide) return;

    // Update content
    this.updateContent(slide, direction);

    // Update map
    if (this.isValidLocation(slide.location)) {
      this.flyToSlide(this.currentSlideIndex);
    }

    // Update UI elements
    this.updateProgress();
    this.updateButtonStates();
    this.updateBackground(slide);

    // Update map elements (markers and lines) after content updates
    this.updateMapElements();
  }

  updateContent(slide, direction) {
    const contentWrapper = document.getElementById('content-wrapper');
    if (!contentWrapper) return;

    // Handle animations
    if (direction !== 'none' && this.config.features.animations && !this.isAnimating) {
      this.animateSlideTransition(contentWrapper, slide, direction);
    } else {
      this.updateSlideContent(slide);
    }
  }

  animateSlideTransition(contentWrapper, slide, direction) {
    this.isAnimating = true;

    const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';

    contentWrapper.classList.add(outClass);

    setTimeout(() => {
      contentWrapper.classList.remove(outClass);
      this.updateSlideContent(slide);
      contentWrapper.classList.add(inClass);

      setTimeout(() => {
        contentWrapper.classList.remove(inClass);
        this.isAnimating = false;
      }, 500);
    }, 500);
  }

  updateSlideContent(slide) {
    // Update headline
    const headline = document.getElementById('headline');
    if (headline) {
      headline.textContent = slide.text?.headline || '';
    }

    // Update text content
    const text = document.getElementById('text');
    if (text) {
      text.innerHTML = slide.text?.text || '';
    }

    // Update media
    this.updateMedia(slide);
  }

  updateMedia(slide) {
    const mediaContainer = document.getElementById('media');
    if (!mediaContainer) return;

    mediaContainer.innerHTML = '';

    if (slide.media?.url) {
      if (slide.media.url.includes('youtube.com')) {
        this.embedYouTube(mediaContainer, slide.media.url, slide.media.caption);
      } else if (slide.media.url.match(/\.(jpg|jpeg|png|gif)$/i)) {
        this.embedImage(mediaContainer, slide.media.url, slide.media.caption);
      }
    }
  }

  embedYouTube(container, url, caption) {
    const iframe = document.createElement('iframe');
    iframe.src = url.replace('watch?v=', 'embed/');
    iframe.width = '100%';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    container.appendChild(iframe);

    if (caption) {
      const captionDiv = document.createElement('div');
      captionDiv.className = 'media-caption';
      captionDiv.textContent = caption;
      container.appendChild(captionDiv);
    }
  }

  embedImage(container, url, caption) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = caption || '';
    img.style.width = '100%';
    container.appendChild(img);

    if (caption) {
      const captionDiv = document.createElement('div');
      captionDiv.className = 'media-caption';
      captionDiv.textContent = caption;
      container.appendChild(captionDiv);
    }
  }

  updateBackground(slide) {
    const storyContent = document.getElementById('story-content');
    if (!storyContent) return;

    // Reset styles
    storyContent.style.backgroundImage = '';
    storyContent.style.backgroundColor = '';

    if (slide.background) {
      if (slide.background.color) {
        storyContent.style.backgroundColor = slide.background.color;
      }

      if (slide.background.url) {
        this.setBackgroundImage(storyContent, slide.background);
      }
    }
  }

  setBackgroundImage(container, background) {
    // Create overlay for background image
    let overlay = container.querySelector('.story-bg-image-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'story-bg-image-overlay';
      Object.assign(overlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
        zIndex: '0',
        opacity: '1',
        transition: 'opacity 0.3s ease, background-image 0.3s ease'
      });
      container.insertBefore(overlay, container.firstChild);
    }

    // Set background image
    overlay.style.backgroundImage = `url('${background.url}')`;
    overlay.style.display = 'block';

    const opacity = background.opacity !== undefined ? background.opacity / 100 : 1;
    overlay.style.opacity = opacity.toString();

    // Ensure content is above overlay
    const contentWrapper = document.getElementById('content-wrapper');
    if (contentWrapper) {
      contentWrapper.style.position = 'relative';
      contentWrapper.style.zIndex = '1';
    }
  }

  updateProgress() {
    const progressDiv = document.getElementById('progress');
    if (progressDiv && this.storyData) {
      progressDiv.textContent = `${this.currentSlideIndex + 1}/${this.storyData.length}`;
    }
  }

  updateButtonStates() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Previous and restart buttons
    const canGoBack = this.currentSlideIndex > 0;
    if (prevBtn) {
      prevBtn.disabled = !canGoBack;
      if (canGoBack) {
        prevBtn.classList.remove('disabled');
      } else {
        prevBtn.classList.add('disabled');
      }
    }
    if (restartBtn) {
      restartBtn.disabled = !canGoBack;
      if (canGoBack) {
        restartBtn.classList.remove('disabled');
      } else {
        restartBtn.classList.add('disabled');
      }
    }

    // Next button
    const canGoNext = this.currentSlideIndex < this.storyData.length - 1;
    if (nextBtn) {
      nextBtn.disabled = !canGoNext;
      if (canGoNext) {
        nextBtn.classList.remove('disabled');
      } else {
        nextBtn.classList.add('disabled');
      }
    }
  }

  // Public API methods
  goToSlide(index) {
    this.navigateToSlide(index);
  }

  next() {
    this.navigateNext();
  }

  previous() {
    this.navigatePrevious();
  }

  getCurrentSlide() {
    return this.currentSlideIndex;
  }

  getTotalSlides() {
    return this.storyData ? this.storyData.length : 0;
  }

  // Utility methods for customization
  getConfig() {
    return { ...this.config };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StoryMap;
}

if (typeof window !== 'undefined') {
  window.StoryMap = StoryMap;
}
