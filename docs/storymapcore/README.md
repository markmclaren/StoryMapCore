# StoryMapJS

A flexible, customizable story map library that extracts the best patterns from existing story mapping tools while maintaining maximum flexibility for customization.

[![npm version](https://badge.fury.io/js/storymapjs.svg)](https://badge.fury.io/js/storymapjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **Maximum Flexibility**: Customize any aspect of your story map
- **Multiple Map Providers**: PMTiles, Standard tiles, Satellite imagery, Mapbox
- **Multi-language Support**: Built-in internationalization
- **Responsive Design**: Works on all devices
- **Customizable Styling**: Easy CSS customization with custom.css files
- **No Build Step Required**: Pure JavaScript, works everywhere
- **CDN Ready**: Easy distribution via npm or CDN

## 🚀 Quick Start

### CDN Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Story Map</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/storymapjs@1.0.0/storymap-core.css">
    <script src="https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js"></script>
    <script src="https://unpkg.com/pmtiles@2.11.0/dist/index.js"></script>
</head>
<body>
    <div class="storymap-wrapper">
        <div class="storymap-content">
            <div class="story-content">
                <div id="content-wrapper">
                    <h1 id="headline"></h1>
                    <div id="text"></div>
                    <div id="media"></div>
                </div>
            </div>
            <div class="storymap-navigation">
                <div class="storymap-progress">
                    <span id="progress"></span>
                </div>
                <div>
                    <button id="prev-btn">Previous</button>
                    <button id="next-btn">Next</button>
                    <button id="restart-btn">Restart</button>
                </div>
            </div>
        </div>
        <div class="storymap-map-container">
            <div id="map"></div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/storymapjs@1.0.0/storymap-core.js"></script>
    <script>
        const storyMap = new StoryMap({
            jsonUrl: 'your-story-data.json',
            mapProvider: 'standard'
        });
    </script>
</body>
</html>
```

### NPM Usage

```bash
npm install storymapjs
```

```javascript
import StoryMap from 'storymapjs';
import 'storymapjs/css';

const storyMap = new StoryMap({
    jsonUrl: 'your-story-data.json',
    mapProvider: 'standard'
});
```

## 📖 Usage Examples

### Basic Example (Obama-style)

```javascript
const storyMap = new StoryMap({
    jsonUrl: 'obama.json',
    mapProvider: 'standard'
});
```

### PMTiles Example (Arya's Journey-style)

```javascript
const storyMap = new StoryMap({
    jsonUrl: 'aryas-journey.json',
    mapInitializer: (container, firstSlide) => {
        // Custom PMTiles setup
        const protocol = new pmtiles.Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);

        return new maplibregl.Map({
            container: container,
            style: {
                version: 8,
                sources: {
                    storymap: {
                        type: "raster",
                        url: `pmtiles://aryas-journey.pmtiles`
                    }
                },
                layers: [{
                    id: "pmtiles-layer",
                    source: "storymap",
                    type: "raster"
                }]
            },
            center: [parseFloat(firstSlide.location.lon), parseFloat(firstSlide.location.lat)],
            zoom: parseFloat(firstSlide.location.zoom) || 2
        });
    }
});
```

### Multi-language Example (Multilingual Provider)

```javascript
// Multilingual data loader with language state management
const multilingualDataLoader = async (config) => {
    const provider = new MultilingualDataProvider();

    // Load the full multilingual data
    const fullData = await provider.loadData(config);

    // Set up language selector
    provider.initializeLanguageSelector();

    // Handle language switching
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            const newLanguage = this.value;
            const currentSlideIndex = storyMap.currentSlideIndex;

            // Switch language while maintaining slide position
            const result = provider.switchLanguageWithPosition(newLanguage, currentSlideIndex, {
                maintainSlidePosition: true
            });

            if (result && result.newSlides) {
                // Update story map with new data
                storyMap.storyData = result.newSlides;
                storyMap.currentSlideIndex = result.targetSlideIndex;

                // Clear existing map elements and update
                if (storyMap.map) {
                    storyMap.recreateMapElements();
                }

                // Update the slide
                storyMap.updateSlide();
            }
        });
    }

    return fullData;
};

// Create StoryMap instance using the same pattern as other examples
const storyMap = new StoryMap({
    jsonUrl: 'multilingual-story.json',
    dataLoader: multilingualDataLoader,
    mapProvider: 'satellite',  // Use built-in satellite provider (Sentinel-2)
    mapContainer: 'map',
    features: {
        animations: true,
        keyboardNavigation: true,
        progressBar: false
    },
    styling: {
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
    }
});
```

### Advanced Customization

```javascript
const storyMap = new StoryMap({
    jsonUrl: 'custom-story.json',
    mapProvider: 'pmtiles',
    features: {
        animations: true,
        keyboardNavigation: true,
        progressBar: true
    },
    styling: {
        markerColor: '#00ff00',
        markerColorActive: '#ff6600',
        lineColor: '#ffffff',
        lineColorActive: '#ffff00'
    }
});
```


## 🗺️ Map Providers

### Standard Tiles
```javascript
const storyMap = new StoryMap({
    jsonUrl: 'story.json',
    mapProvider: 'standard' // Uses OpenFreeMap tiles
});
```

### PMTiles
```javascript
const storyMap = new StoryMap({
    jsonUrl: 'story.json',
    mapProvider: 'pmtiles',
    pmtilesUrl: 'data.pmtiles'
});
```

### Satellite Imagery
```javascript
const storyMap = new StoryMap({
    jsonUrl: 'story.json',
    mapProvider: 'satellite' // Uses Sentinel-2 imagery
});
```

### Custom Style URL
```javascript
const storyMap = new StoryMap({
    jsonUrl: 'story.json',
    mapStyle: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg' // Custom style URL
});
```

### Mapbox
```javascript
const storyMap = new StoryMap({
    jsonUrl: 'story.json',
    mapProvider: 'mapbox',
    accessToken: 'your-mapbox-token'
});
```

## 🌍 Data Formats

### Simple JSON Format
```json
{
    "storymap": {
        "slides": [
            {
                "text": {
                    "headline": "Slide Title",
                    "text": "Slide content with <strong>HTML</strong> support"
                },
                "location": {
                    "lat": 40.7128,
                    "lon": -74.0060,
                    "zoom": 10,
                    "line": true
                },
                "media": {
                    "url": "https://example.com/image.jpg",
                    "caption": "Image caption",
                    "credit": "Photo credit"
                },
                "background": {
                    "color": "#f0f0f0",
                    "url": "https://example.com/background.jpg",
                    "opacity": 50
                }
            }
        ]
    }
}
```

### Multi-language JSON Format
```json
{
    "languages": {
        "en": {
            "name": "English",
            "title": "Story Title",
            "prev": "Previous",
            "next": "Next"
        },
        "es": {
            "name": "Español",
            "title": "Título de la Historia",
            "prev": "Anterior",
            "next": "Siguiente"
        }
    },
    "storymaps": {
        "en": {
            "storymap": {
                "slides": [...]
            }
        },
        "es": {
            "storymap": {
                "slides": [...]
            }
        }
    }
}
```

## 📱 Responsive Design

The library is fully responsive and includes:

- Mobile-first CSS
- Touch-friendly navigation
- Optimized layouts for all screen sizes
- Accessibility features
- Dark mode support
- High contrast mode support
- Reduced motion support

## 🎯 API Reference

### StoryMap Class

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `jsonUrl` | string | - | URL to JSON data file |
| `dataLoader` | function | - | Custom data loading function |
| `mapProvider` | string | - | Map provider ('standard', 'pmtiles', 'satellite', 'mapbox') |
| `mapStyle` | string | - | Custom map style URL (alternative to mapProvider) |
| `mapInitializer` | function | - | Custom map initialization function |
| `features` | object | - | Feature toggles |
| `styling` | object | - | Style customizations |

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `goToSlide(index)` | number | Navigate to specific slide |
| `next()` | - | Go to next slide |
| `previous()` | - | Go to previous slide |
| `getCurrentSlide()` | - | Get current slide index |
| `getTotalSlides()` | - | Get total number of slides |
| `getConfig()` | - | Get current configuration |
| `updateConfig(config)` | object | Update configuration |

### Map Providers

#### MapProviders.standard(config)
Standard OpenFreeMap tiles.

#### MapProviders.pmtiles(config)
PMTiles for offline/local tiles.

#### MapProviders.satellite(config)
Sentinel-2 satellite imagery.

#### MapProviders.mapbox(config)
Mapbox with access token.

#### MapProviders.custom(config)
Custom map initialization.

### Data Providers

#### DataProviders.simple(config)
Load simple JSON data.

#### MultilingualDataProvider
Generic provider for multilingual story maps with language switching and custom map initialization.

**Configuration Options:**
- `maintainSlidePosition` (boolean, default: true) - Maintain slide position when switching languages

**Methods:**
- `switchLanguage(language, options)` - Switch to a different language
- `switchLanguageWithPosition(language, currentIndex, options)` - Switch language while maintaining slide position

```javascript
// Recommended approach - follows same pattern as other examples
const storyMap = new StoryMap({
    jsonUrl: 'multilingual-story.json',
    dataLoader: async (config) => {
        const provider = new MultilingualDataProvider();
        const fullData = await provider.loadData(config);
        provider.initializeLanguageSelector();
        return fullData;
    },
    mapProvider: 'satellite',  // Use built-in satellite provider (Sentinel-2)
    features: {
        animations: true,
        keyboardNavigation: true,
        progressBar: false
    },
    styling: {
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
    }
});

// Language switching that maintains slide position
const languageSelector = document.getElementById('language-selector');
languageSelector.addEventListener('change', function() {
    const provider = new MultilingualDataProvider();
    const result = provider.switchLanguageWithPosition(this.value, storyMap.currentSlideIndex, {
        maintainSlidePosition: true
    });

    if (result) {
        storyMap.storyData = result.newSlides;
        storyMap.currentSlideIndex = result.targetSlideIndex;
        storyMap.recreateMapElements();
        storyMap.updateSlide();
    }
});
```

#### DataProviders.custom(config)
Custom data loading logic.

### Media Providers

#### MediaProviders.youtube(config)
YouTube video embedding.

#### MediaProviders.image(config)
Image display with lightbox.

#### MediaProviders.video(config)
Video file embedding.

#### MediaProviders.audio(config)
Audio file embedding.

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/yourusername/StoryMapJS.git
cd StoryMapJS

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## 📄 License

MIT © [Your Name]

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Inspired by existing story mapping tools
- Built with MapLibre GL JS
- PMTiles support for offline maps
- OpenFreeMap for free tile hosting

## 📞 Support

- 📧 Email: support@storymapjs.com
- 💬 Discord: [Join our community](https://discord.gg/storymapjs)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/StoryMapJS/issues)
- 📖 Docs: [Full Documentation](https://docs.storymapjs.com)

---

Made with ❤️ for storytellers and map enthusiasts
