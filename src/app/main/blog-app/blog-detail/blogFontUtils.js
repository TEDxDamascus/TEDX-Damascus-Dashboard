export { EDITOR_FONT_CSS_MAP as BLOG_FONT_CSS_FAMILIES, editorFontSlugToCss as blogFontValueToCssFamily } from '../../../shared-components/rich-text-editor/fontFamilies';

export function ensureContentFont(value, defaultFont = 'cairo') {
  if (typeof value === 'string' && value.trim()) {
    return { en: value.trim(), ar: value.trim() };
  }
  if (value && typeof value === 'object') {
    return {
      en: String(value.en || defaultFont).trim() || defaultFont,
      ar: String(value.ar || defaultFont).trim() || defaultFont,
    };
  }
  return { en: defaultFont, ar: defaultFont };
}

export function contentFontToApiString(value, defaultFont = 'cairo') {
  const v = ensureContentFont(value, defaultFont);
  return v.en || v.ar || defaultFont;
}
