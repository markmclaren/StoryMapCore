/**
 * SimpleStoryMapLibJS Media Provider Utilities
 * Loose utility functions for common media handling patterns
 * Supports YouTube, images, videos, and custom media types
 */

/**
 * Media Provider Utilities
 * Each function returns DOM elements for media display
 */
const MediaProviders = {
  /**
   * YouTube provider (from all examples)
   * Converts YouTube URLs to embed iframes
   */
  youtube: (config) => {
    const container = config.container;
    const url = config.url;
    const options = config.options || {};

    // Convert watch URL to embed URL
    let embedUrl = url.replace('watch?v=', 'embed/');

    // Handle youtu.be URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    // Add parameters
    const params = new URLSearchParams();
    if (options.autoplay) params.append('autoplay', '1');
    if (options.mute) params.append('mute', '1');
    if (options.loop) params.append('loop', '1');
    if (options.controls !== false) params.append('controls', '1');
    if (options.modestBranding) params.append('modestbranding', '1');
    if (options.rel !== false) params.append('rel', '0');

    if (params.toString()) {
      embedUrl += '?' + params.toString();
    }

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.width = options.width || '100%';
    iframe.height = options.height || '315';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';

    // Add to container
    container.appendChild(iframe);

    // Add caption if provided
    if (config.caption) {
      MediaProviders.addCaption(container, config.caption, config.credit);
    }

    return iframe;
  },

  /**
   * Image provider (from all examples)
   * Displays images with optional captions
   */
  image: (config) => {
    const container = config.container;
    const url = config.url;
    const options = config.options || {};

    // Create image element
    const img = document.createElement('img');
    img.src = url;
    img.alt = config.caption || config.alt || '';
    img.loading = 'lazy';

    // Apply styling options
    if (options.width) img.style.width = options.width;
    if (options.height) img.style.height = options.height;
    if (options.maxWidth) img.style.maxWidth = options.maxWidth;
    if (options.borderRadius) img.style.borderRadius = options.borderRadius;
    if (options.objectFit) img.style.objectFit = options.objectFit;

    // Add click handler for lightbox if enabled
    if (options.lightbox) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => MediaProviders.openLightbox(url, config.caption));
    }

    // Add to container
    container.appendChild(img);

    // Add caption if provided
    if (config.caption) {
      MediaProviders.addCaption(container, config.caption, config.credit);
    }

    return img;
  },

  /**
   * Video provider
   * For MP4, WebM, and other video formats
   */
  video: (config) => {
    const container = config.container;
    const url = config.url;
    const options = config.options || {};

    // Create video element
    const video = document.createElement('video');
    video.src = url;
    video.controls = options.controls !== false;
    video.autoplay = options.autoplay || false;
    video.muted = options.muted || false;
    video.loop = options.loop || false;
    video.preload = options.preload || 'metadata';

    // Apply styling
    if (options.width) video.style.width = options.width;
    if (options.height) video.style.height = options.height;
    if (options.maxWidth) video.style.maxWidth = options.maxWidth;

    // Add poster image if provided
    if (options.poster) {
      video.poster = options.poster;
    }

    // Add to container
    container.appendChild(video);

    // Add caption if provided
    if (config.caption) {
      MediaProviders.addCaption(container, config.caption, config.credit);
    }

    return video;
  },

  /**
   * Audio provider
   * For audio files with optional waveform visualization
   */
  audio: (config) => {
    const container = config.container;
    const url = config.url;
    const options = config.options || {};

    // Create audio element
    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = options.controls !== false;
    audio.autoplay = options.autoplay || false;
    audio.loop = options.loop || false;
    audio.preload = options.preload || 'metadata';

    // Apply styling
    if (options.width) audio.style.width = options.width;
    if (options.maxWidth) audio.style.maxWidth = options.maxWidth;

    // Add to container
    container.appendChild(audio);

    // Add caption if provided
    if (config.caption) {
      MediaProviders.addCaption(container, config.caption, config.credit);
    }

    return audio;
  },

  /**
   * Custom media provider
   * For completely custom media handling
   */
  custom: (config) => {
    if (typeof config.mediaHandler !== 'function') {
      throw new Error('Custom media provider requires config.mediaHandler function');
    }

    return config.mediaHandler(config);
  }
};

/**
 * Helper function to create media with automatic type detection
 */
function createMedia(config) {
  const url = config.url;

  // Auto-detect media type
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return MediaProviders.youtube(config);
  } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return MediaProviders.video(config);
  } else if (url.match(/\.(mp3|wav|m4a)$/i)) {
    return MediaProviders.audio(config);
  } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return MediaProviders.image(config);
  } else {
    // Default to image for unknown types
    return MediaProviders.image(config);
  }
}

/**
 * Media utility functions
 */
const MediaUtils = {
  /**
   * Add caption and credit to media container
   */
  addCaption: (container, caption, credit) => {
    if (!caption && !credit) return;

    const captionDiv = document.createElement('div');
    captionDiv.className = 'media-caption';

    if (caption && credit) {
      captionDiv.innerHTML = `<span class="caption-text">${caption}</span> <span class="caption-credit">${credit}</span>`;
    } else if (caption) {
      captionDiv.textContent = caption;
    } else if (credit) {
      captionDiv.textContent = credit;
    }

    container.appendChild(captionDiv);
  },

  /**
   * Open image in lightbox modal
   */
  openLightbox: (imageUrl, caption) => {
    // Create lightbox overlay
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      cursor: pointer;
    `;

    // Create lightbox image
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 8px;
    `;

    // Add caption if provided
    if (caption) {
      const captionDiv = document.createElement('div');
      captionDiv.textContent = caption;
      captionDiv.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 14px;
        text-align: center;
        max-width: 80%;
      `;
      overlay.appendChild(captionDiv);
    }

    // Close on click
    overlay.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // Close on escape key
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        document.removeEventListener('keydown', handleKeyPress);
      }
    };
    document.addEventListener('keydown', handleKeyPress);

    overlay.appendChild(img);
    document.body.appendChild(overlay);
  },

  /**
   * Preload media for better performance
   */
  preloadMedia: (urls) => {
    const promises = urls.map(url => {
      return new Promise((resolve, reject) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          // YouTube embeds don't need preloading
          resolve();
          return;
        }

        const media = url.match(/\.(mp4|webm|ogg|mp3|wav|m4a)$/i) ?
          document.createElement('video') :
          document.createElement('img');

        media.onload = () => resolve();
        media.onerror = () => reject(new Error(`Failed to preload ${url}`));
        media.src = url;
      });
    });

    return Promise.all(promises);
  },

  /**
   * Get media dimensions
   */
  getMediaDimensions: (url) => {
    return new Promise((resolve, reject) => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // Default YouTube dimensions
        resolve({ width: 560, height: 315 });
        return;
      }

      const media = url.match(/\.(mp4|webm|ogg|mp3|wav|m4a)$/i) ?
        document.createElement('video') :
        document.createElement('img');

      media.onload = () => {
        resolve({
          width: media.naturalWidth || media.videoWidth,
          height: media.naturalHeight || media.videoHeight
        });
      };

      media.onerror = () => reject(new Error(`Failed to load ${url}`));
      media.src = url;
    });
  }
};

/**
 * Media validation utilities
 */
const MediaValidators = {
  /**
   * Validate media URL format
   */
  isValidUrl: (url) => {
    if (typeof url !== 'string') return false;

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if URL is from supported media host
   */
  isSupportedHost: (url) => {
    const supportedHosts = [
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'dailymotion.com'
    ];

    try {
      const urlObj = new URL(url);
      return supportedHosts.some(host => urlObj.hostname.includes(host));
    } catch {
      return false;
    }
  },

  /**
   * Get media type from URL
   */
  getMediaType: (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return 'video';
    } else if (url.match(/\.(mp3|wav|m4a)$/i)) {
      return 'audio';
    } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return 'image';
    } else {
      return 'unknown';
    }
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MediaProviders,
    MediaUtils,
    MediaValidators,
    createMedia
  };
}

if (typeof window !== 'undefined') {
  window.MediaProviders = MediaProviders;
  window.MediaUtils = MediaUtils;
  window.MediaValidators = MediaValidators;
  window.createMedia = createMedia;
}
