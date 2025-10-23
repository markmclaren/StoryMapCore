/**
 * StoryMapCore Providers Index
 * Unified exports for all provider utilities
 */

// Import all provider modules (using dynamic imports for browser compatibility)
import('./map-providers.js').then(module => {
  window.MapProviders = module.MapProviders;
  window.MapStyles = module.MapStyles;
  window.createMap = module.createMap;
});

import('./data-providers.js').then(module => {
  window.DataProviders = module.DataProviders;
  window.DataValidators = module.DataValidators;
  window.DataTransformers = module.DataTransformers;
  window.loadStoryData = module.loadStoryData;
});

import('./media-providers.js').then(module => {
  window.MediaProviders = module.MediaProviders;
  window.MediaUtils = module.MediaUtils;
  window.MediaValidators = module.MediaValidators;
  window.createMedia = module.createMedia;
});

import('./multilingual-provider.js').then(module => {
  window.MultilingualDataProvider = module.MultilingualDataProvider;
  window.createMultilingualProvider = module.createMultilingualProvider;
  window.loadMultilingualData = module.loadMultilingualData;
});

// For ES modules (when used in Node.js or modern bundlers)
export { MapProviders, MapStyles, createMap } from './map-providers.js';
export { DataProviders, DataValidators, DataTransformers, loadStoryData } from './data-providers.js';
export { MediaProviders, MediaUtils, MediaValidators, createMedia } from './media-providers.js';
export { MultilingualDataProvider, createMultilingualProvider, loadMultilingualData } from './multilingual-provider.js';

// Default export with all providers
import * as MapProviders from './map-providers.js';
import * as DataProviders from './data-providers.js';
import * as MediaProviders from './media-providers.js';

export default {
  Map: MapProviders,
  Data: DataProviders,
  Media: MediaProviders,
  MapProviders,
  DataProviders,
  MediaProviders
};
