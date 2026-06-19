export const localeInputTypes = {
  textField: 'textField',
  textFieldMultiple: 'textFieldMultiple',
  editor: 'editor',
};

export const SUPPORTED_LOCALES = ['en', 'ar'];

/** Default value for any locale field: English first as requested. */
export function defaultLocaleValue() {
  return { ar: '', en: '' };
}

/**
 * Ensures value is in shape { ar, en }. Use for RHF defaultValues or when reading API data.
 * @param {unknown} value - raw value (object, string, or undefined)
 * @returns {{ ar: string, en: string }}
 */
export function ensureLocaleValue(value) {
  if (value && typeof value === 'object' && 'ar' in value && 'en' in value) {
    return {
      ar: String(value.ar ?? ''),
      en: String(value.en ?? ''),
    };
  }
  if (typeof value === 'string') {
    return { ar: '', en: value };
  }
  return defaultLocaleValue();
}
