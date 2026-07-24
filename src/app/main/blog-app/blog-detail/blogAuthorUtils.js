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
  const authorType = String(source?.author_type || '').toLowerCase();
  const userId = source?.author_user_id ?? source?.user_id;
  const userIdStr =
    userId != null && userId !== '' && isLikelyMongoObjectId(String(userId))
      ? String(userId)
      : null;

  if (authorType === 'external' || (!userIdStr && source?.author_name)) {
    const imageFromApi = normalizeMediaFormValue(source.author_image ?? source.author_image_url);
    const externalUrl =
      typeof source.author_image_url === 'string' ? source.author_image_url.trim() : '';

    return {
      author_type: 'external',
      author_admin: null,
      author_name: ensureLocaleValue(source.author_name),
      author_description: ensureLocaleValue(source.author_description),
      author_image: imageFromApi,
      author_image_url:
        externalUrl ||
        (typeof source.author_image === 'string' &&
        !isLikelyMongoObjectId(source.author_image)
          ? source.author_image.trim()
          : ''),
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

    return {
      author_type: userIdStr ? 'admin' : '',
      author_admin: userIdStr ? { id: userIdStr, label: label || userIdStr } : null,
      author_name: ensureLocaleValue(),
      author_description: ensureLocaleValue(),
      author_image: { id: '', url: '' },
      author_image_url: '',
    };
  }

  return {
    author_type: '',
    author_admin: null,
    author_name: ensureLocaleValue(),
    author_description: ensureLocaleValue(),
    author_image: { id: '', url: '' },
    author_image_url: '',
  };
}

export function buildAuthorApiPayload(data, sanitizeLocaleObject) {
  const type = String(data?.author_type || '').toLowerCase();

  if (type === 'admin') {
    const id = data?.author_admin?.id && isLikelyMongoObjectId(String(data.author_admin.id).trim());
    if (!id) return {};
    return {
      author_type: 'admin',
      author_user_id: String(data.author_admin.id).trim(),
    };
  }

  if (type === 'external') {
    const name = sanitizeLocaleObject(data.author_name);
    const description = sanitizeLocaleObject(data.author_description);
    const hasName = Boolean(name.en || name.ar);
    if (!hasName) return {};

    const payload = {
      author_type: 'external',
      author_name: name,
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

  return {};
}

export function getAuthorDisplayName(blog, locale = 'en') {
  if (!blog) return '';
  if (blog.author_type === 'external') {
    const name = ensureLocaleValue(blog.author_name);
    return String(name[locale] || name.en || name.ar || '').trim();
  }
  if (blog.author_type === 'admin' && blog.author_admin?.label) {
    return String(blog.author_admin.label).trim();
  }
  return '';
}
