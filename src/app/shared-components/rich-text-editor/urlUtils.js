export function normalizeUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }

    return parsed.href;
  } catch {
    return '';
  }
}

export function isYoutubeUrl(url) {
  const normalized = normalizeUrl(url);
  if (!normalized) return false;

  try {
    const { hostname } = new URL(normalized);
    return /(^|\.)youtube\.com$|(^|\.)youtu\.be$|(^|\.)youtube-nocookie\.com$/i.test(hostname);
  } catch {
    return false;
  }
}
