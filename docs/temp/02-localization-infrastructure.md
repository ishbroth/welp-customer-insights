# Localization Infrastructure Plan

## Overview
Implement i18n (internationalization) infrastructure to support multiple languages and make all user-facing text translatable.

## Current State
- All text is hardcoded in components
- No i18n library installed
- No translation files
- Not ready for multi-language support

## Work to be Done

### 1. Install Dependencies
```bash
npm install react-i18next i18next
```

### 2. Create Translation Structure
- Create `src/locales/` directory
- Create `src/locales/en/` for English translations
- Organize by feature:
  - `common.json` - Shared text (buttons, labels)
  - `auth.json` - Authentication text
  - `reviews.json` - Review-related text
  - `profile.json` - Profile text
  - `errors.json` - Error messages
  - `validation.json` - Form validation messages

### 3. Configure i18next
- Create `src/lib/i18n.ts` configuration file
- Set default language to English
- Configure fallback language
- Set up namespace loading

### 4. Extract Hardcoded Strings
Priority order:
1. Error messages
2. Success messages
3. Button labels
4. Form labels
5. Page headings
6. Placeholder text
7. Tooltips and help text
8. Long-form content

### 5. Create Translation Keys
Use consistent naming convention:
- `common.buttons.submit`
- `auth.login.title`
- `errors.network.timeout`
- `validation.required.email`

### 6. Implement useTranslation Hook
- Replace hardcoded strings with `t()` function
- Add to all components systematically
- Start with critical user flows

### 7. Handle Dynamic Content
- Date/time formatting with locale
- Number formatting
- Currency formatting
- Pluralization rules

### 8. Language Switcher
- Create language selector component
- Store preference in localStorage
- Add to user profile settings

## Files to Create
- `src/lib/i18n.ts` - i18n configuration
- `src/locales/en/common.json`
- `src/locales/en/auth.json`
- `src/locales/en/reviews.json`
- `src/locales/en/profile.json`
- `src/locales/en/errors.json`
- `src/locales/en/validation.json`
- `src/components/ui/language-selector.tsx`
- `src/hooks/useLocale.ts` - Custom locale hook

## Files to Update
- `src/main.tsx` - Initialize i18n
- All component files - Replace hardcoded text

## Deliverables
- Fully functional i18n setup
- All user-facing text extracted to translation files
- Language switcher component
- Documentation for adding new languages
