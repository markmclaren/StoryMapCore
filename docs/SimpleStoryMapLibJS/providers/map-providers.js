/**
 * SimpleStoryMapLibJS Map Provider Utilities
 * Loose utility functions for common map initialization patterns
 * Not rigid plugins - maximum flexibility for customization
 */

/**
 * Map Provider Utilities
 * Each function returns a configured maplibregl.Map instance
 */
const MapProviders = {
  /**
   * Standard tiles provider (from Obama example)
   * Uses OpenFreeMap tiles - simple and reliable
   */
  standard: (config) => {
    const firstSlide = config.firstSlide || { location: { lon: 0, lat: 0, zoom: 2 } };

    return new maplibregl.Map({
      container: config.container || 'map',
      style: config.style || 'https://tiles.openfreemap.org/styles/liberty',
      center: [
        parseFloat(firstSlide.location.lon),
        parseFloat(firstSlide.location.lat)
      ],
      zoom: parseFloat(firstSlide.location.zoom) || 2,
      ...config.mapOptions
    });
  },

  /**
   * PMTiles provider (from Arya's Journey example)
   * For offline/local tiles using PMTiles format
   */
  pmtiles: (config) => {
    const firstSlide = config.firstSlide || { location: { lon: 0, lat: 0, zoom: 2 } };

    // Set up PMTiles protocol if not already done
    if (!maplibregl.pmtilesProtocol) {
      const protocol = new pmtiles.Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile);
      // Store the protocol instance for adding PMTiles files
      maplibregl.pmtilesProtocol = protocol;
    }

    // Handle PMTiles URL
    const pmtilesUrl = config.pmtilesUrl || config.tilesUrl || 'data.pmtiles';

    // Load the PMTiles file and add it to the protocol
    const p = new pmtiles.PMTiles(pmtilesUrl);
    const protocol = maplibregl.pmtilesProtocol;
    if (protocol && protocol.add) {
      protocol.add(p);
    }

    let styleUrl;

    if (pmtilesUrl.startsWith('pmtiles://')) {
      styleUrl = pmtilesUrl;
    } else {
      styleUrl = `pmtiles://${pmtilesUrl}`;
    }

    // Create style object for PMTiles
    const style = {
      version: 8,
      sources: {
        storymap: {
          type: 'raster',
          url: styleUrl,
          ...config.sourceOptions
        }
      },
      layers: [
        {
          id: 'pmtiles-layer',
          source: 'storymap',
          type: 'raster',
          ...config.layerOptions
        }
      ],
      ...config.styleOptions
    };

    return new maplibregl.Map({
      container: config.container || 'map',
      style: style,
      center: [
        parseFloat(firstSlide.location.lon),
        parseFloat(firstSlide.location.lat)
      ],
      zoom: parseFloat(firstSlide.location.zoom) || 2,
      minZoom: config.minZoom || 0,
      maxZoom: config.maxZoom,
      renderWorldCopies: config.renderWorldCopies !== false,
      ...config.mapOptions
    });
  },

  /**
   * Satellite provider (from Las Rutas del Oro Ilegal example)
   * Uses Sentinel-2 or other satellite imagery
   */
  satellite: (config) => {
    const firstSlide = config.firstSlide || { location: { lon: 0, lat: 0, zoom: 2 } };

    // Default Sentinel-2 style
    const defaultStyle = {
      version: 8,
      sources: {
        'sentinel2-tiles': {
          type: 'raster',
          tiles: [
            'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg'
          ],
          minzoom: 0,
          maxzoom: 13,
          scheme: 'xyz',
          tileSize: 256,
          attribution: '<a href="https://s2maps.eu">Sentinel-2 cloudless - https://s2maps.eu</a> by <a href="https://eox.at">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2024)',
          ...config.sourceOptions
        }
      },
      layers: [
        {
          id: 'sentinel2-layer',
          type: 'raster',
          source: 'sentinel2-tiles',
          layout: { visibility: 'visible' },
          paint: {
            'raster-opacity': 1,
            'raster-fade-duration': 0,
            ...config.paintOptions
          },
          ...config.layerOptions
        }
      ]
    };

    const style = config.style || defaultStyle;

    return new maplibregl.Map({
      container: config.container || 'map',
      style: style,
      center: [
        parseFloat(firstSlide.location.lon),
        parseFloat(firstSlide.location.lat)
      ],
      zoom: parseFloat(firstSlide.location.zoom) || 2,
      ...config.mapOptions
    });
  },

  /**
   * Mapbox provider
   * For users who want to use Mapbox with their own access token
   */
  mapbox: (config) => {
    const firstSlide = config.firstSlide || { location: { lon: 0, lat: 0, zoom: 2 } };

    if (!config.accessToken) {
      throw new Error('Mapbox access token required. Please provide config.accessToken');
    }

    maplibregl.setAccessToken?.(config.accessToken);

    return new maplibregl.Map({
      container: config.container || 'map',
      style: config.style || 'mapbox://styles/mapbox/streets-v12',
      center: [
        parseFloat(firstSlide.location.lon),
        parseFloat(firstSlide.location.lat)
      ],
      zoom: parseFloat(firstSlide.location.zoom) || 2,
      ...config.mapOptions
    });
  },

  /**
   * Custom provider
   * For completely custom map setups
   */
  custom: (config) => {
    if (typeof config.mapInitializer !== 'function') {
      throw new Error('Custom provider requires config.mapInitializer function');
    }

    return config.mapInitializer(config);
  }
};

/**
 * Helper function to create a map with automatic provider detection
 */
function createMap(config) {
  const firstSlide = config.firstSlide;

  // Auto-detect provider based on configuration
  if (config.mapInitializer) {
    return MapProviders.custom(config);
  } else if (config.pmtilesUrl || config.tilesUrl) {
    return MapProviders.pmtiles(config);
  } else if (config.accessToken) {
    return MapProviders.mapbox(config);
  } else if (config.satellite || config.sentinel2) {
    return MapProviders.satellite(config);
  } else {
    return MapProviders.standard(config);
  }
}

/**
 * Map styling utilities
 */
const MapStyles = {
  /**
   * Apply consistent attribution control setup
   */
  setupAttributionControl: (map) => {
    // Remove any existing attribution controls
    const controls = document.querySelectorAll('.maplibregl-ctrl-attrib');
    controls.forEach(ctrl => ctrl.remove());

    // Add single compact attribution control
    const attributionControl = new maplibregl.AttributionControl({
      compact: true
    });
    map.addControl(attributionControl);

    // Collapse attribution by default
    setTimeout(() => {
      const detailsElem = document.querySelector('details.maplibregl-compact-show');
      if (detailsElem && detailsElem.hasAttribute('open')) {
        detailsElem.removeAttribute('open');
      }
    }, 100);
  },

  /**
   * Add navigation controls (zoom in/out, compass, etc.)
   */
  addNavigationControls: (map, options = {}) => {
    const navControl = new maplibregl.NavigationControl({
      showCompass: options.showCompass !== false,
      showZoom: options.showZoom !== false,
      visualizePitch: options.visualizePitch || false
    });
    map.addControl(navControl, options.position || 'top-right');
  },

  /**
   * Add fullscreen control
   */
  addFullscreenControl: (map, options = {}) => {
    const fullscreenControl = new maplibregl.FullscreenControl();
    map.addControl(fullscreenControl, options.position || 'top-right');
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MapProviders, MapStyles, createMap };
}

if (typeof window !== 'undefined') {
  window.MapProviders = MapProviders;
  window.MapStyles = MapStyles;
  window.createMap = createMap;
}
