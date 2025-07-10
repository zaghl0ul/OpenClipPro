# Theme System Documentation

## Overview

The application now supports four distinct themes that can be switched dynamically:

1. **Cyberpunk** - The current neon aesthetic with dark backgrounds and vibrant colors
2. **Brutalism** - Bold, raw design with thick borders and stark contrasts
3. **Windows 98** - Retro computing nostalgia with classic gray interfaces
4. **Classic** - Timeless and elegant design with clean lines and subtle shadows

## Implementation Details

### Theme CSS Variables

Each theme defines CSS custom properties for:
- Background colors (`--color-bg-primary`, `--color-bg-secondary`, etc.)
- Text colors (`--color-text-primary`, `--color-text-secondary`, etc.)
- Accent colors (`--color-accent`, `--color-accent-hover`, etc.)
- Gradients (`--gradient-primary`, `--gradient-secondary`)
- Shadows (`--shadow-glow`, `--shadow-card`)
- Animations (`--animation-glow`, `--animation-neon`)

### Theme Switching

Themes are applied using the `data-theme` attribute on the document root:
- `data-theme="cyberpunk"` - Current neon aesthetic
- `data-theme="brutalism"` - Bold, raw design
- `data-theme="windows98"` - Retro computing style
- `data-theme="classic"` - Timeless elegance

### Theme Persistence

The selected theme is stored in localStorage and automatically applied on page load.

### Theme Switcher

Located in the Settings page, the theme switcher allows users to:
- View all available themes with descriptions
- Switch between themes instantly
- See the current active theme highlighted

## Theme Characteristics

### Cyberpunk Theme
- Dark backgrounds with neon accents
- Glassmorphism effects with blur
- Animated gradients and glowing effects
- Purple and pink color palette
- Futuristic typography and spacing

### Brutalism Theme
- High contrast black and white
- Thick borders (3px) on all elements
- Sharp, geometric shapes
- Bold typography with uppercase text
- Red accent colors for emphasis

### Windows 98 Theme
- Classic gray color scheme
- Outset/inset border effects
- Retro button styling
- Blue accent colors
- Authentic 90s computing aesthetic

### Classic Theme
- Clean, minimal design
- Subtle shadows and borders
- Professional color palette
- Rounded corners
- Blue accent colors

## Usage

1. Navigate to Settings page
2. Find the "Theme Preferences" section
3. Click on any theme to switch instantly
4. The theme will be saved and persist across sessions

## Technical Implementation

### Files Modified
- `themes.css` - Complete theme definitions
- `index.css` - Theme import
- `index.html` - Theme initialization script
- `components/SimpleThemeSwitcher.tsx` - Theme switching component
- `pages/SettingsPage.tsx` - Theme switcher integration
- `components/Layout.tsx` - Theme-aware styling

### CSS Classes
- `.card` - Theme-aware card styling
- `.btn-primary` - Theme-aware button styling
- `.nav-link` - Theme-aware navigation styling
- `.theme-switcher` - Theme switcher container
- `.theme-option` - Individual theme option styling

## Future Enhancements

- Theme-specific animations and transitions
- Custom theme creation
- Theme preview in switcher
- Automatic theme detection based on system preferences
- Dark/light mode variants for each theme