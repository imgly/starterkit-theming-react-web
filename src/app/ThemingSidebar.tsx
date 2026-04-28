/**
 * Theming Sidebar Component
 *
 * Orchestrates theme controls:
 * - UI Scaling (normal/large)
 * - Theme presets (light/dark)
 * - Custom color pickers (surface, canvas, active, accent)
 */

import { useCallback, useEffect, useState } from 'react';
import type CreativeEditorSDK from '@cesdk/cesdk-js';

import {
  generateColorAbstractionTokensAccent,
  generateColorAbstractionTokensActive,
  generateColorAbstractionTokensCanvas,
  generateColorAbstractionTokensSurface,
  generateStaticTokens
} from './color';
import { ScaleControl, type Scale } from './ScaleControl';
import { ThemeControl, type Theme } from './ThemeControl';
import { ColorPickerSection, type ColorType } from './ColorPickerSection';

import styles from './ThemingSidebar.module.css';

interface ThemingSidebarProps {
  cesdk: CreativeEditorSDK | null;
}

const THEME_COLORS = {
  light: {
    surfaceColor: '#D6DBE1',
    canvasColor: '#D6DBE1',
    activeColor: '#4E545A',
    accentColor: '#4260F5'
  },
  dark: {
    surfaceColor: '#121A21',
    canvasColor: '#121A21',
    activeColor: '#F5F5F5',
    accentColor: '#415AD3'
  }
};

const COLOR_PRESETS = {
  surface: ['#DCDFE1', '#230D38', '#242623', '#FCEFEB', '#060709'],
  canvas: ['#DCDFE1', '#230D38', '#242623', '#FCEFEB', '#060709'],
  active: ['#5D6266', '#D142A3', '#BBC6A4', '#F4BCAC', '#4D5E6D'],
  accent: ['#3E4044', '#66D3EB', '#F6CE4B', '#265E7A', '#D0FDEB']
};

export function ThemingSidebar({ cesdk }: ThemingSidebarProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');
  const [currentScale, setCurrentScale] = useState<Scale>('normal');
  const [customSurfaceColor, setCustomSurfaceColor] = useState<string | null>(
    null
  );
  const [customCanvasColor, setCustomCanvasColor] = useState<string | null>(
    null
  );
  const [customActiveColor, setCustomActiveColor] = useState<string | null>(
    null
  );
  const [customAccentColor, setCustomAccentColor] = useState<string | null>(
    null
  );
  const [openModal, setOpenModal] = useState<ColorType | null>(null);

  // Get effective colors (custom or theme defaults)
  const getEffectiveColors = useCallback(() => {
    const themeColors = THEME_COLORS[currentTheme];
    return {
      surfaceColor: customSurfaceColor || themeColors.surfaceColor,
      canvasColor: customCanvasColor || themeColors.canvasColor,
      activeColor: customActiveColor || themeColors.activeColor,
      accentColor: customAccentColor || themeColors.accentColor
    };
  }, [
    currentTheme,
    customSurfaceColor,
    customCanvasColor,
    customActiveColor,
    customAccentColor
  ]);

  // Generate and apply custom theme
  const applyCustomTheme = useCallback(
    (
      surfaceColor: string,
      canvasColor: string,
      activeColor: string,
      accentColor: string
    ) => {
      const customTheme = {
        ...generateColorAbstractionTokensAccent(accentColor),
        ...generateColorAbstractionTokensSurface(surfaceColor),
        ...generateColorAbstractionTokensCanvas(canvasColor),
        ...generateColorAbstractionTokensActive(activeColor),
        ...generateStaticTokens()
      };

      let styleElement = document.getElementById(
        'cesdk-custom-theme'
      ) as HTMLStyleElement;
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'cesdk-custom-theme';
        document.head.appendChild(styleElement);
      }

      const cssText = Object.entries(customTheme)
        .map(([key, value]) => `${key}: ${value};`)
        .join('\n');

      styleElement.textContent = `.ubq-public { ${cssText} }`;
    },
    []
  );

  // Clear custom theme
  const clearCustomTheme = useCallback(() => {
    const styleElement = document.getElementById('cesdk-custom-theme');
    if (styleElement) {
      styleElement.remove();
    }
  }, []);

  // Update theme when custom colors change
  useEffect(() => {
    if (
      customSurfaceColor ||
      customCanvasColor ||
      customActiveColor ||
      customAccentColor
    ) {
      const colors = getEffectiveColors();
      applyCustomTheme(
        colors.surfaceColor,
        colors.canvasColor,
        colors.activeColor,
        colors.accentColor
      );
    } else {
      clearCustomTheme();
    }
  }, [
    customSurfaceColor,
    customCanvasColor,
    customActiveColor,
    customAccentColor,
    getEffectiveColors,
    applyCustomTheme,
    clearCustomTheme
  ]);

  // Handle theme change - reset custom colors
  const handleThemeChange = useCallback(
    (theme: Theme) => {
      setCurrentTheme(theme);
      setCustomSurfaceColor(null);
      setCustomCanvasColor(null);
      setCustomActiveColor(null);
      setCustomAccentColor(null);
      clearCustomTheme();
    },
    [clearCustomTheme]
  );

  // Handle color changes for each type
  const handleColorChange = useCallback((type: ColorType, color: string) => {
    if (type === 'surface') setCustomSurfaceColor(color);
    if (type === 'canvas') setCustomCanvasColor(color);
    if (type === 'active') setCustomActiveColor(color);
    if (type === 'accent') setCustomAccentColor(color);
  }, []);

  // Handle modal toggle
  const handleModalToggle = useCallback((type: ColorType) => {
    setOpenModal((current) => (current === type ? null : type));
  }, []);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(`.${styles.colorPickerSelection}`) &&
        !target.closest(`.${styles.colorPickerModal}`)
      ) {
        setOpenModal(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const colors = getEffectiveColors();

  return (
    <div className={styles.sidebar}>
      <ScaleControl
        cesdk={cesdk}
        currentScale={currentScale}
        onScaleChange={setCurrentScale}
      />

      <hr className={styles.divider} />

      <ThemeControl
        cesdk={cesdk}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />

      <ColorPickerSection
        label="Surface Background"
        type="surface"
        currentColor={colors.surfaceColor}
        presets={COLOR_PRESETS.surface}
        isOpen={openModal === 'surface'}
        onToggle={() => handleModalToggle('surface')}
        onColorChange={(color) => handleColorChange('surface', color)}
        onPresetClick={(color) => handleColorChange('surface', color)}
      />

      <ColorPickerSection
        label="Canvas Background"
        type="canvas"
        currentColor={colors.canvasColor}
        presets={COLOR_PRESETS.canvas}
        isOpen={openModal === 'canvas'}
        onToggle={() => handleModalToggle('canvas')}
        onColorChange={(color) => handleColorChange('canvas', color)}
        onPresetClick={(color) => handleColorChange('canvas', color)}
      />

      <ColorPickerSection
        label="Active"
        type="active"
        currentColor={colors.activeColor}
        presets={COLOR_PRESETS.active}
        isOpen={openModal === 'active'}
        onToggle={() => handleModalToggle('active')}
        onColorChange={(color) => handleColorChange('active', color)}
        onPresetClick={(color) => handleColorChange('active', color)}
      />

      <ColorPickerSection
        label="Accent"
        type="accent"
        currentColor={colors.accentColor}
        presets={COLOR_PRESETS.accent}
        isOpen={openModal === 'accent'}
        onToggle={() => handleModalToggle('accent')}
        onColorChange={(color) => handleColorChange('accent', color)}
        onPresetClick={(color) => handleColorChange('accent', color)}
      />
    </div>
  );
}
