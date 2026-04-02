/**
 * CE.SDK Theming Editor Starterkit - React Entry Point
 *
 * Demonstrates how to customize the CE.SDK editor appearance with themes.
 * Shows both built-in themes (light/dark) and custom theme configuration.
 *
 * @see https://img.ly/docs/cesdk/js/configuration-2c1c3d/
 */

import type { Configuration } from '@cesdk/cesdk-js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';

// ============================================================================
// Configuration
// ============================================================================

export const editorConfig: Configuration = {
  // Unique user identifier for analytics (customize for your app)
  userId: 'starterkit-theming-user'

  // Local assets (uncomment and set path for self-hosted assets)
  // baseURL: `/assets/`,

  // License key (required for production)
  // license: 'YOUR_LICENSE_KEY',
};

// ============================================================================
// Initialize React Application
// ============================================================================

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
root.render(
  <StrictMode>
    <App editorConfig={editorConfig} />
  </StrictMode>
);
