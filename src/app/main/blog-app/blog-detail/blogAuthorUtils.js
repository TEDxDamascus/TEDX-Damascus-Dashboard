import { ensureLocaleValue } from '../../../shared-components/locale-input';
import {
  isLikelyMongoObjectId,
  mediaFormValueToApiId,
  normalizeMediaFormValue,
} from '../../../shared-components/image-picker';

function pickAuthorLabel(item) {
  if (!item || typeof item !== 'object') return '';
  if (typeof item.name === 'string') return item.name.trim();
  if (item.name && typeof item.name === 'object') {
    return String(item.name.en || item.name.ar || '').trim();
  }
  return String(item.label || item.email || '').trim();
}

function localeFromUnknown(raw) {
  if (!raw) return { en: '', ar: '' };
  if (typeof raw === 'string') return { en: raw, ar: '' };
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return {
      en: String(raw.en ?? ''),
      ar: String(raw.ar ?? ''),
    };
  }
  return { en: '', ar: '' };
}

/** Read `author_description` from list/detail payloads (flat or nested `author`). */
export function extractAuthorDescription(source) {
  if (!source || typeof source !== 'object') return { en: '', ar: '' };
  const nested = source.author && typeof source.author === 'object' ? source.author : null;
  return localeFromUnknown(
    source.author_description ?? nested?.description ?? nested?.author_description ?? null,
  );
}

export function authorDescriptionHasText(value) {
  const d = localeFromUnknown(value);
  return Boolean(String(d.en || '').trim() || String(d.ar || '').trim());
}

/** `{ en, ar }` for PATCH/POST, or `null` when both locales are empty. */
export function toAuthorDescriptionApi(value) {
  const d = localeFromUnknown(value);
  const en = String(d.en || '').trim();
  const ar = String(d.ar || '').trim();
  if (!en && !ar) return null;
  return { en, ar };
}

export function sourceHasAuthor(source) {
  if (!source || typeof source !== 'object') return false;
  const nested = source.author && typeof source.author === 'object' ? source.author : null;
  const type = String(
    source.author_type || nested?.type || nested?.author_type || '',
  ).toLowerCase();
  if (type === 'no_author') return false;
  if (type === 'admin' || type === 'external' || type === 'custom') return true;
  const userId =
    source.author_user_id ?? source.user_id ?? source.author_admin?.id ?? nested?.user_id;
  if (userId) return true;
  const name = source.author_name ?? nested?.name;
  if (typeof name === 'string' && name.trim()) return true;
  if (name && typeof name === 'object' && (name.en || name.ar)) return true;
  return false;
}

function extractAuthorOptionsArray(body) {
  const d = body?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.options)) return d.options;
  if (Array.isArray(d?.authors)) return d.authors;
  return [];
}

/** Normalize one row from GET `/blogs/author-options`. */
export function mapAuthorOptionFromApi(item) {
  if (!item || typeof item !== 'object') return null;
  const id = item._id ?? item.id ?? item.user_id ?? item.author_user_id;
  if (id == null || id === '') return null;

  return {
    id: String(id),
    label: pickAuthorLabel(item) || String(id),
    type: String(item.type || item.author_type || 'admin').toLowerCase(),
    description: item.description ? ensureLocaleValue(item.description) : null,
    imageUrl: String(item.image_url || item.image || item.avatar || '').trim(),
  };
}

export function authorOptionsFromApi(body) {
  return extractAuthorOptionsArray(body).map(mapAuthorOptionFromApi).filter(Boolean);
}

export function mapAuthorFromApi(source) {
  const nestedAuthor = source?.author && typeof source.author === 'object' ? source.author : null;
  const authorType = String(source?.author_type || nestedAuthor?.type || '').toLowerCase();
  const userId = source?.author_user_id ?? source?.user_id ?? nestedAuthor?.user_id;
  const userIdStr =
    userId != null && userId !== '' && isLikelyMongoObjectId(String(userId))
      ? String(userId)
      : null;

  if (
    authorType === 'no_author' ||
    (!authorType && !userIdStr && !source?.author_name && !nestedAuthor?.name)
  ) {
    return {
      author_type: 'no_author',
      author_admin: null,
      author_name: ensureLocaleValue(),
      author_description: ensureLocaleValue(),
      author_image: { id: '', url: '' },
      author_image_url: '',
    };
  }

  if (
    authorType === 'external' ||
    authorType === 'custom' ||
    (!userIdStr && (source?.author_name || nestedAuthor?.name))
  ) {
    // API nests the image inside source.author.image — also check flat variants
    const rawImage =
      source.author_image ??
      source.author_photo ??
      nestedAuthor?.image ?? // ← source.author.image (الشكل الحقيقي للـ API)
      source.photo ??
      source.image ??
      source.avatar ??
      null;

    const rawImageUrl =
      source.author_image_url ??
      source.author_photo_url ??
      nestedAuthor?.image_url ?? // ← source.author.image_url
      source.photo_url ??
      source.image_url ??
      source.avatar_url ??
      null;

    const imageFromApi = normalizeMediaFormValue(rawImage ?? rawImageUrl);

    const externalUrl =
      typeof rawImageUrl === 'string'
        ? rawImageUrl.trim()
        : typeof rawImage === 'string' && !isLikelyMongoObjectId(rawImage)
          ? rawImage.trim()
          : '';

    return {
      author_type: 'external',
      author_admin: null,
      author_name: localeFromUnknown(source.author_name ?? nestedAuthor?.name),
      author_description: extractAuthorDescription(source),
      author_image: imageFromApi,
      author_image_url: externalUrl,
    };
  }

  if (userIdStr || authorType === 'admin') {
    const label =
      pickAuthorLabel(source.author_user) ||
      (typeof source.author_user_name === 'string'
        ? source.author_user_name
        : ensureLocaleValue(source.author_user_name).en ||
          ensureLocaleValue(source.author_user_name).ar) ||
      pickAuthorLabel({ name: source.user_name }) ||
      userIdStr;

    const nestedName =
      source.author && typeof source.author === 'object' ? source.author.name : null;
    const authorName = localeFromUnknown(source.author_name ?? nestedName);
    if (!authorName.en && !authorName.ar && label) {
      authorName.en = label;
    }

    const nestedAuthor = source.author && typeof source.author === 'object' ? source.author : null;
    const rawImage = source.author_image ?? nestedAuthor?.image ?? null;
    const rawImageUrl = source.author_image_url ?? nestedAuthor?.image_url ?? null;

    return {
      author_type: 'external',
      author_admin: null,
      author_name: authorName,
      author_description: extractAuthorDescription(source),
      author_image: normalizeMediaFormValue(rawImage ?? rawImageUrl),
      author_image_url: typeof rawImageUrl === 'string' ? rawImageUrl.trim() : '',
    };
  }

  return {
    author_type: 'no_author',
    author_admin: null,
    author_name: ensureLocaleValue(),
    author_description: extractAuthorDescription(source),
    author_image: { id: '', url: '' },
    author_image_url: '',
  };
}

export function buildAuthorApiPayload(data, sanitizeLocaleObject) {
  const type = String(data?.author_type || 'no_author').toLowerCase();
  const description = sanitizeLocaleObject(data.author_description);

  if (type === 'no_author' || type === '') {
    return { author_type: 'no_author' };
  }

  if (type === 'external' || type === 'custom' || type === 'admin') {
    const name = sanitizeLocaleObject(data.author_name);
    const label = String(data?.author_admin?.label || '').trim();
    const hasName = Boolean(name.en || name.ar || label);
    if (!hasName) return { author_type: 'no_author' };

    const payload = {
      author_type: 'external',
      author_name: {
        en: name.en || label,
        ar: name.ar || '',
      },
      author_description: description,
    };

    const imageId = mediaFormValueToApiId(data.author_image);
    const imageUrl = String(data.author_image_url || '').trim();

    if (imageId) {
      payload.author_image = imageId;
    } else if (imageUrl) {
      payload.author_image_url = imageUrl;
    }

    return payload;
  }

  return { author_type: 'no_author' };
}

export function getAuthorDisplayName(blog, locale = 'en') {
  if (!blog) return '';
  if (blog.author_type === 'external' || blog.author_type === 'admin') {
    const name = ensureLocaleValue(blog.author_name);
    return String(name[locale] || name.en || name.ar || blog.author_admin?.label || '').trim();
  }
  return '';
}
