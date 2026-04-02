/**
 * Theming Sidebar Component
 *
 * Orchestrates theme controls:
 * - UI Scaling (normal/large)
 * - Theme presets (light/dark)
 * - Custom color pickers (background, active, accent)
 */

import { useCallback, useEffect, useState } from 'react';
import type CreativeEditorSDK from '@cesdk/cesdk-js';

import {
  generateColorAbstractionTokensAccent,
  generateColorAbstractionTokensActive,
  generateColorAbstractionTokensBackground,
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
    backgroundColor: '#D6DBE1',
    activeColor: '#4E545A',
    accentColor: '#4260F5'
  },
  dark: {
    backgroundColor: '#121A21',
    activeColor: '#F5F5F5',
    accentColor: '#415AD3'
  }
};

const COLOR_PRESETS = {
  background: ['#DCDFE1', '#230D38', '#242623', '#FCEFEB', '#060709'],
  active: ['#5D6266', '#D142A3', '#BBC6A4', '#F4BCAC', '#4D5E6D'],
  accent: ['#3E4044', '#66D3EB', '#F6CE4B', '#265E7A', '#D0FDEB']
};

export function ThemingSidebar({ cesdk }: ThemingSidebarProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');
  const [currentScale, setCurrentScale] = useState<Scale>('normal');
  const [customBackgroundColor, setCustomBackgroundColor] = useState<
    string | null
  >(null);
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
      backgroundColor: customBackgroundColor || themeColors.backgroundColor,
      activeColor: customActiveColor || themeColors.activeColor,
      accentColor: customAccentColor || themeColors.accentColor
    };
  }, [currentTheme, customBackgroundColor, customActiveColor, customAccentColor]);

  // Generate and apply custom theme
  const applyCustomTheme = useCallback(
    (backgroundColor: string, activeColor: string, accentColor: string) => {
      const customTheme = {
        ...generateColorAbstractionTokensAccent(accentColor),
        ...generateColorAbstractionTokensBackground(backgroundColor),
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
    if (customBackgroundColor || customActiveColor || customAccentColor) {
      const colors = getEffectiveColors();
      applyCustomTheme(
        colors.backgroundColor,
        colors.activeColor,
        colors.accentColor
      );
    } else {
      clearCustomTheme();
    }
  }, [
    customBackgroundColor,
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
      setCustomBackgroundColor(null);
      setCustomActiveColor(null);
      setCustomAccentColor(null);
      clearCustomTheme();
    },
    [clearCustomTheme]
  );

  // Handle color changes for each type
  const handleColorChange = useCallback(
    (type: ColorType, color: string) => {
      if (type === 'background') setCustomBackgroundColor(color);
      if (type === 'active') setCustomActiveColor(color);
      if (type === 'accent') setCustomAccentColor(color);
    },
    []
  );

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
        label="Background"
        type="background"
        currentColor={colors.backgroundColor}
        presets={COLOR_PRESETS.background}
        isOpen={openModal === 'background'}
        onToggle={() => handleModalToggle('background')}
        onColorChange={(color) => handleColorChange('background', color)}
        onPresetClick={(color) => handleColorChange('background', color)}
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
