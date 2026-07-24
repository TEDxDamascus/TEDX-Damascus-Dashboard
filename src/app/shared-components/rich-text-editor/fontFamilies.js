/** Slug → CSS stack for blog content fonts (kept in sync with GET /public/blogs/fonts). */
export const EDITOR_FONT_CSS_MAP = {
  helvetica_neue: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  cairo: '"Cairo", sans-serif',
  montserrat: '"Montserrat", sans-serif',
  poppins: '"Poppins", sans-serif',
  tajawal: '"Tajawal", sans-serif',
};

export function editorFontSlugToCss(slug) {
  const key = String(slug || '').trim();
  return EDITOR_FONT_CSS_MAP[key] || EDITOR_FONT_CSS_MAP.cairo;
}

export function editorFontCssToSlug(cssValue) {
  const normalized = String(cssValue || '')
    .replace(/['"]/g, '')
    .toLowerCase();
  if (!normalized) return null;

  for (const [slug, css] of Object.entries(EDITOR_FONT_CSS_MAP)) {
    const cssNorm = css.replace(/['"]/g, '').toLowerCase();
    if (normalized === cssNorm || normalized.includes(slug.replace(/_/g, ' '))) {
      return slug;
    }
    const primary = cssNorm.split(',')[0].trim();
    if (normalized.includes(primary)) return slug;
  }
  return null;
}
