/** MongoDB ObjectId: 24 hex chars (string form used by APIs). */
const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

/**
 * Resolve any image field shape (plain URL string, `{id,url}` object, empty) to a safe
 * `<img>` src. Absolute `http://` media URLs are rewritten to go through the `/media`
 * proxy (see vite.config.js / vercel.json) so they load over the page's own origin —
 * otherwise a `http://` image embedded in an `https://` deploy (e.g. Vercel) is blocked
 * as mixed content and silently fails to render.
 *
 * Uploaded media is served by a dedicated object-storage host on its own port, separate
 * from the API host that `/api` proxies to — routing it through `/api` hits the wrong
 * backend and 404s, so it needs its own `/media` proxy target instead.
 */
export function toDisplayImageUrl(raw) {
  let url = '';
  if (typeof raw === 'string') {
    url = raw.trim();
  } else if (raw && typeof raw === 'object') {
    url = String(raw.url ?? raw.secure_url ?? raw.path ?? '').trim();
  }
  if (!url) return '';
  if (/^http:\/\//i.test(url)) {
    try {
      const { pathname, search, hash } = new URL(url);
      return `/media${pathname}${search}${hash}`;
    } catch {
      return url;
    }
  }
  return url;
}

export function isLikelyMongoObjectId(s) {
  return typeof s === 'string' && OBJECT_ID_RE.test(s.trim());
}

/**
 * Normalize to `{ id, url }` for forms.
 * API may return a URL string, an id string, or populated `{ _id, id, url }`.
 */
export function normalizeMediaFormValue(raw) {
  if (raw == null || raw === '') return { id: '', url: '' };
  if (typeof raw === 'object' && !Array.isArray(raw) && ('id' in raw || 'url' in raw)) {
    return {
      id: String(raw.id ?? raw._id ?? '').trim(),
      url: String(raw.url ?? '').trim(),
    };
  }
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) return { id: '', url: '' };
    if (OBJECT_ID_RE.test(t)) return { id: t, url: '' };
    return { id: '', url: t };
  }
  if (typeof raw === 'object' && (raw._id != null || raw.id != null)) {
    const id = String(raw._id ?? raw.id ?? '').trim();
    const url = String(raw.url ?? raw.secure_url ?? '').trim();
    return { id, url };
  }
  return { id: '', url: '' };
}

/** Value to send as `blog_image` / `og_image` when the API expects a Mongo id. */
export function mediaFormValueToApiId(value) {
  const { id, url } = normalizeMediaFormValue(value);
  if (id && isLikelyMongoObjectId(id)) return id;
  if (url && isLikelyMongoObjectId(url)) return url.trim();
  return '';
}

/** `<img src>` / thumbnail when the form stores `{ id, url }` or a legacy URL string. */
export function mediaFormValueToPreviewSrc(value) {
  const { id, url } = normalizeMediaFormValue(value);
  if (url) return toDisplayImageUrl(url);
  if (id && /^https?:\/\//i.test(id)) return toDisplayImageUrl(id);
  return '';
}

export function mediaFieldToDisplayUrl(raw) {
  if (raw == null || raw === '') return '';
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (/^https?:\/\//i.test(t)) return toDisplayImageUrl(t);
    return '';
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const u = raw.url ?? raw.secure_url ?? raw.path;
    if (u && String(u).trim()) return toDisplayImageUrl(String(u).trim());
  }
  return '';
}

export function mediaSelectionMatches(current, item) {
  if (!item || (!item.id && !item.url && !item._id)) return false;
  const itemId = String(item._id ?? item.id ?? '').trim();
  const itemUrl = String(item.url ?? '').trim();
  if (!current) return false;
  if (typeof current === 'string') {
    const t = current.trim();
    return (itemUrl && t === itemUrl) || (itemId && t === itemId);
  }
  const { id, url } = normalizeMediaFormValue(current);
  if (id && itemId && id === itemId) return true;
  if (url && itemUrl && url === itemUrl) return true;
  return false;
}
