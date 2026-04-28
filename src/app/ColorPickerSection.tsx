/**
 * Color Picker Section Component
 *
 * Provides a color picker with:
 * - Preset color swatches
 * - Color preview trigger
 * - Modal with native color picker and hex input
 */

import { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';

import styles from './ThemingSidebar.module.css';

export type ColorType = 'surface' | 'canvas' | 'active' | 'accent';

interface ColorPickerSectionProps {
  label: string;
  type: ColorType;
  currentColor: string;
  presets: string[];
  isOpen: boolean;
  onToggle: () => void;
  onColorChange: (color: string) => void;
  onPresetClick: (color: string) => void;
}

export function ColorPickerSection({
  label,
  type,
  currentColor,
  presets,
  isOpen,
  onToggle,
  onColorChange,
  onPresetClick
}: ColorPickerSectionProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const hexInputRef = useRef<HTMLInputElement>(null);

  // Update input values when color changes
  useEffect(() => {
    if (colorInputRef.current) {
      colorInputRef.current.value = currentColor.toUpperCase();
    }
    if (hexInputRef.current) {
      hexInputRef.current.value = currentColor.replace('#', '').toUpperCase();
    }
  }, [currentColor]);

  const handleColorInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value;
      onColorChange(color);
      if (hexInputRef.current) {
        hexInputRef.current.value = color.replace('#', '').toUpperCase();
      }
    },
    [onColorChange]
  );

  const handleHexInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanHex = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
      if (cleanHex.length === 6) {
        const color = `#${cleanHex}`;
        onColorChange(color);
      }
    },
    [onColorChange]
  );

  const handleHexBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    let hex = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
    if (hex.length < 6) {
      hex = hex.padEnd(6, '0');
    }
    e.target.value = hex.toUpperCase();
  }, []);

  return (
    <div className={styles.colorPickerWrapper}>
      <span className={styles.colorPickerLabel}>{label}</span>
      <div className={styles.colorPickerSelection}>
        <div className={styles.colorPresets}>
          {presets.map((color) => (
            <button
              key={color}
              className={styles.colorPreset}
              style={{ background: color }}
              onClick={(e) => {
                e.stopPropagation();
                onPresetClick(color);
              }}
            />
          ))}
        </div>
        <div
          className={styles.colorPickerTrigger}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <span
            className={styles.colorPreview}
            style={{ background: currentColor }}
          />
          <span className={styles.caretIcon}>
            <svg viewBox="0 0 8 6" fill="none">
              <path
                d="M1 1.5L4 4.5L7 1.5"
                stroke="#161617"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <div
          className={classNames(styles.colorPickerModal, {
            [styles.open]: isOpen
          })}
        >
          <input
            ref={colorInputRef}
            type="color"
            defaultValue={currentColor}
            onChange={handleColorInputChange}
          />
          <div className={styles.hexInputWrapper}>
            <span>#</span>
            <input
              ref={hexInputRef}
              type="text"
              defaultValue={currentColor.replace('#', '').toUpperCase()}
              maxLength={6}
              onChange={handleHexInputChange}
              onBlur={handleHexBlur}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
