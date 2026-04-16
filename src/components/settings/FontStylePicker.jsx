import { useState, useEffect } from 'react';
import { Type, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const FONT_OPTIONS = [
  { value: 'default', label: 'Classic', heading: "'Libre Baskerville', serif", body: "'Inter', sans-serif" },
  { value: 'modern', label: 'Modern', heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
  { value: 'elegant', label: 'Elegant', heading: "'Georgia', serif", body: "'Georgia', serif" },
  { value: 'mono', label: 'Mono', heading: "'Courier New', monospace", body: "'Courier New', monospace" },
];

const COLOR_PRESETS = [
  { value: 'default', label: 'Cream', hsl: '0 0% 95%' },
  { value: 'warm', label: 'Warm', hsl: '35 40% 90%' },
  { value: 'cool', label: 'Ice', hsl: '210 30% 92%' },
  { value: 'green', label: 'Sage', hsl: '140 20% 88%' },
  { value: 'pink', label: 'Rose', hsl: '340 30% 90%' },
  { value: 'gold', label: 'Gold', hsl: '42 60% 85%' },
];

function applyFontStyle(fontKey) {
  const font = FONT_OPTIONS.find(f => f.value === fontKey) || FONT_OPTIONS[0];
  document.documentElement.style.setProperty('--font-heading', font.heading);
  document.documentElement.style.setProperty('--font-body', font.body);
  localStorage.setItem('fontStyle', fontKey);
}

function applyFontColor(colorKey) {
  const color = COLOR_PRESETS.find(c => c.value === colorKey) || COLOR_PRESETS[0];
  document.documentElement.style.setProperty('--foreground', color.hsl);
  document.documentElement.style.setProperty('--card-foreground', color.hsl);
  document.documentElement.style.setProperty('--popover-foreground', color.hsl);
  document.documentElement.style.setProperty('--sidebar-foreground', color.hsl);
  localStorage.setItem('fontColor', colorKey);
}

// Apply saved preferences on load
export function initFontPreferences() {
  const savedFont = localStorage.getItem('fontStyle');
  const savedColor = localStorage.getItem('fontColor');
  if (savedFont) applyFontStyle(savedFont);
  if (savedColor) applyFontColor(savedColor);
}

export default function FontStylePicker() {
  const [fontStyle, setFontStyle] = useState(() => localStorage.getItem('fontStyle') || 'default');
  const [fontColor, setFontColor] = useState(() => localStorage.getItem('fontColor') || 'default');

  const handleFontChange = (value) => {
    setFontStyle(value);
    applyFontStyle(value);
  };

  const handleColorChange = (value) => {
    setFontColor(value);
    applyFontColor(value);
  };

  return (
    <div className="space-y-5">
      {/* Font Style */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">Font Style</p>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map(({ value, label, heading }) => (
            <button
              key={value}
              onClick={() => handleFontChange(value)}
              className={cn(
                "relative flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left",
                fontStyle === value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/30 hover:border-muted-foreground/30"
              )}
            >
              {fontStyle === value && (
                <div className="absolute top-2 right-2">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <span
                className="text-base font-bold leading-tight"
                style={{ fontFamily: heading }}
              >
                Aa
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Color */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">Text Color</p>
        <div className="grid grid-cols-3 gap-2">
          {COLOR_PRESETS.map(({ value, label, hsl }) => (
            <button
              key={value}
              onClick={() => handleColorChange(value)}
              className={cn(
                "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                fontColor === value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/30 hover:border-muted-foreground/30"
              )}
            >
              <div
                className="w-8 h-8 rounded-full border border-border/50 shadow-inner"
                style={{ backgroundColor: `hsl(${hsl})` }}
              />
              <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
              {fontColor === value && (
                <div className="absolute top-1.5 right-1.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Live preview */}
        <div className="mt-3 p-3 rounded-xl bg-muted/40 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Preview</p>
          <p
            className="font-heading text-sm font-bold"
            style={{
              color: `hsl(${(COLOR_PRESETS.find(c => c.value === fontColor) || COLOR_PRESETS[0]).hsl})`,
              fontFamily: (FONT_OPTIONS.find(f => f.value === fontStyle) || FONT_OPTIONS[0]).heading,
            }}
          >
            The Midnight Life Cafe
          </p>
          <p
            className="text-xs mt-0.5"
            style={{
              color: `hsl(${(COLOR_PRESETS.find(c => c.value === fontColor) || COLOR_PRESETS[0]).hsl})`,
              fontFamily: (FONT_OPTIONS.find(f => f.value === fontStyle) || FONT_OPTIONS[0]).body,
            }}
          >
            A cozy place for book lovers and late-night readers.
          </p>
        </div>
      </div>
    </div>
  );
}