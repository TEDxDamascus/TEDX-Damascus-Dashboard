function formatDetail(detail) {
  if (!detail) return '';
  if (typeof detail === 'string') return detail;
  const field = detail.field || detail.path || detail.property;
  const message = detail.message || detail.msg;
  if (field && message) return `${field}: ${message}`;
  return message || '';
}

export function getApiErrorMessage(error, fallback = 'An unexpected error occurred') {
  const data = error?.data ?? error?.response?.data;
  const details = data?.details ?? data?.errors;
  if (Array.isArray(details) && details.length) {
    const joined = details.map(formatDetail).filter(Boolean).join(' · ');
    if (joined) return joined;
  }
  if (Array.isArray(data?.message)) {
    const joined = data.message.filter(Boolean).join(' · ');
    if (joined) return joined;
  }
  return data?.message || error?.message || fallback;
}

/** Include optional arrays only when they have items; on update send [] so they can be cleared. */
export function assignOptionalArray(payload, key, values, isUpdate) {
  const list = Array.isArray(values) ? values : [];
  if (list.length) {
    payload[key] = list;
  } else if (isUpdate) {
    payload[key] = [];
  }
}

function isEmptyObject(value) {
  return (
    value == null ||
    (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
  );
}

/** Optional nested object: omit when empty on create; send {} on update to clear. */
export function assignOptionalObject(payload, key, value, isUpdate) {
  if (!isEmptyObject(value)) {
    payload[key] = value;
  } else if (isUpdate) {
    payload[key] = {};
  }
}

/** Optional string: omit when empty on create; send "" on update to clear. */
export function assignOptionalString(payload, key, value, isUpdate) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text) {
    payload[key] = text;
  } else if (isUpdate) {
    payload[key] = '';
  }
}

function trimmedLocale(value) {
  return {
    en: typeof value?.en === 'string' ? value.en.trim() : '',
    ar: typeof value?.ar === 'string' ? value.ar.trim() : '',
  };
}

/**
 * Optional { en, ar }: omit when empty on create; send {} on update to clear.
 * requireBoth (default true) matches slug/category: both locales or nothing.
 */
export function assignOptionalLocale(payload, key, value, isUpdate, requireBoth = true) {
  const locale = trimmedLocale(value);
  const hasValue = requireBoth ? Boolean(locale.en && locale.ar) : Boolean(locale.en || locale.ar);
  if (hasValue) {
    payload[key] = locale;
  } else if (isUpdate) {
    payload[key] = {};
  }
}
