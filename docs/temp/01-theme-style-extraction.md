# Theme and Style Extraction Plan

## Overview
Extract all theme colors, typography, spacing, and style constants from components into centralized configuration files.

## Current State
- Tailwind config has custom `welp` colors defined
- CSS variables in use for HSL-based theming
- Inline styles and hardcoded colors scattered in components

## Work to be Done

### 1. Audit Current Theme Usage
- Search for all hardcoded color values (hex, rgb, hsl)
- Find inline `className` strings with colors
- Identify custom styles not using Tailwind
- Document all color usages

### 2. Consolidate Colors
- Move all colors to `tailwind.config.ts`
- Create semantic color tokens (e.g., `success`, `warning`, `error`)
- Ensure all `welp` brand colors are complete
- Add missing color variants (hover states, active states)

### 3. Typography System
- Define font sizes in config
- Create text style classes (heading-1, heading-2, body, caption, etc.)
- Standardize line heights and letter spacing
- Create typography utility classes

### 4. Spacing System
- Audit all custom padding/margin values
- Ensure using Tailwind spacing scale consistently
- Define custom spacing if needed in config

### 5. Component Style Patterns
- Create reusable style patterns in `src/lib/stylePatterns.ts`
- Examples: card styles, button variants, input styles
- Use with `cn()` utility for composition

### 6. Remove Dark Mode Configuration
- Remove dark mode configuration from `tailwind.config.ts`
- Remove any dark mode class variants from components
- Clean up unused dark mode CSS variables
- Simplify theme to light mode only

### 7. Replace Hardcoded Styles
- Replace inline colors with Tailwind classes
- Replace custom CSS with Tailwind utilities where possible
- Update all components to use semantic tokens

## Files to Create
- `src/config/theme.ts` - Theme configuration object
- `src/lib/stylePatterns.ts` - Reusable style utilities

## Files to Update
- `tailwind.config.ts` - Add missing tokens
- `src/index.css` - Add CSS custom properties
- All component files using hardcoded styles

## Deliverables
- Centralized theme configuration
- Consistent color usage across app
- Clean light-mode only theme
- Dark mode configuration removed
- Style guide documentation
