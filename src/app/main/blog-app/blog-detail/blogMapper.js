import BlogModel from './models/BlogModel';
import { ensureLocaleValue } from '../../../shared-components/locale-input';
import {
  normalizeMediaFormValue,
} from '../../../shared-components/image-picker';
import { ensureContentFont } from './blogFontUtils';
import { mapAuthorFromApi } from './blogAuthorUtils';

function hasLocaleText(value) {
  const v = ensureLocaleValue(value);
  return Boolean(String(v.en || '').trim() || String(v.ar || '').trim());
}

/** Prefer root API field; if empty, use nested `seo.*` (single-blog response shape). */
function pickLocaleField(primary, seoFallback) {
  if (hasLocaleText(primary)) return ensureLocaleValue(primary);
  if (seoFallback != null && hasLocaleText(seoFallback)) return ensureLocaleValue(seoFallback);
  return ensureLocaleValue(primary);
}

function pickLocalizedCategoryName(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') return String(value.en ?? value.ar ?? '').trim();
  return '';
}

function mapBlogCategoryFromApi(source) {
  const cidRaw = source.category_id;

  if (
    cidRaw &&
    typeof cidRaw === 'object' &&
    !Array.isArray(cidRaw) &&
    (cidRaw._id != null || cidRaw.id != null)
  ) {
    const cid = cidRaw._id ?? cidRaw.id;
    return {
      id: String(cid),
      label:
        pickLocalizedCategoryName(cidRaw.name) ||
        pickLocalizedCategoryName(cidRaw.slug) ||
        String(cid),
    };
  }

  if (
    cidRaw != null &&
    cidRaw !== '' &&
    (typeof cidRaw === 'string' || typeof cidRaw === 'number')
  ) {
    const nameFromRoot =
      typeof source.category_name === 'string'
        ? source.category_name.trim()
        : pickLocalizedCategoryName(source.category_name);
    const flatName = nameFromRoot || '';
    return {
      id: String(cidRaw),
      label: flatName || pickLocalizedCategoryName(source.category?.name) || String(cidRaw),
    };
  }

  const populated = source.category;
  if (populated && typeof populated === 'object') {
    const cid = populated._id ?? populated.id;
    if (cid) {
      return {
        id: String(cid),
        label:
          pickLocalizedCategoryName(populated.name) ||
          pickLocalizedCategoryName(populated.slug) ||
          String(cid),
      };
    }
  }
  if (typeof source.category === 'string' && source.category.trim()) {
    return { id: source.category, label: source.category.trim() };
  }
  return null;
}

function tagsFromApiToFlat(tags) {
  if (tags && typeof tags === 'object' && !Array.isArray(tags)) {
    const ar = Array.isArray(tags.ar) ? tags.ar : [];
    const en = Array.isArray(tags.en) ? tags.en : [];
    return [...en, ...ar].map((t) => String(t || '').trim()).filter(Boolean);
  }
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag || '').trim()).filter(Boolean);
  }
  return [];
}

function metaKeywordsFromApi(meta) {
  if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
    const ar = Array.isArray(meta.ar) ? meta.ar : [];
    const en = Array.isArray(meta.en) ? meta.en : [];
    if (ar.length || en.length) {
      return {
        ar: ar
          .map((s) => String(s || '').trim())
          .filter(Boolean)
          .join(', '),
        en: en
          .map((s) => String(s || '').trim())
          .filter(Boolean)
          .join(', '),
      };
    }
  }
  return ensureLocaleValue(meta);
}

function pickMetaKeywords(primary, seoFallback) {
  const fromPrimary = metaKeywordsFromApi(primary);
  if (String(fromPrimary.en || '').trim() || String(fromPrimary.ar || '').trim())
    return fromPrimary;
  if (seoFallback != null) return metaKeywordsFromApi(seoFallback);
  return fromPrimary;
}

function normalizeIdRef(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'object' && !Array.isArray(raw) && (raw._id != null || raw.id != null)) {
    return String(raw._id ?? raw.id);
  }
  if (typeof raw === 'string' || typeof raw === 'number') return String(raw);
  return null;
}

export function mapBlogReferenceApiItemToForm(item) {
  if (!item || typeof item !== 'object') return null;
  const reference_id =
    item._id != null ? String(item._id) : item.id != null ? String(item.id) : undefined;
  const name = String(item.name ?? '').trim();
  const desc = String(item.desc ?? item.description ?? '').trim();
  const url = String(item.url ?? '').trim();
  if (!reference_id && !name && !url && !desc) return null;
  return { reference_id, name, desc, url };
}

export function blogReferencesFromApi(raw) {
  let list = [];
  if (Array.isArray(raw)) list = raw;
  else if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.blog_references)) list = raw.blog_references;
    else if (Array.isArray(raw.references)) list = raw.references;
    else if (Array.isArray(raw.refs)) list = raw.refs;
  }
  return list.map(mapBlogReferenceApiItemToForm).filter(Boolean);
}

/** API may send `published`, `draft`, or legacy variants. */
function normalizeBlogStatus(raw) {
  const s = String(raw ?? '')
    .toLowerCase()
    .trim();
  if (s === 'published' || s === 'publish') return 'published';
  return 'draft';
}

function relatedBlogsFromApi(ids) {
  if (!Array.isArray(ids)) return [];
  return ids
    .map((ref) => {
      if (ref == null) return null;
      if (typeof ref === 'object' && (ref._id != null || ref.id != null)) {
        const rid = String(ref._id ?? ref.id);
        return {
          id: rid,
          label: pickLocalizedCategoryName(ref.title) || rid,
        };
      }
      const sid = String(ref);
      return { id: sid, label: sid };
    })
    .filter(Boolean);
}

export function mapBlogFromApi(raw) {
  const source = raw?.data ?? raw ?? {};
  const seo = source.seo && typeof source.seo === 'object' ? source.seo : null;
  const authorFields = mapAuthorFromApi(source);
  return BlogModel({
    ...source,
    id: source._id != null ? String(source._id) : source.id,
    status: normalizeBlogStatus(source.status),
    title: ensureLocaleValue(source.title),
    slug: ensureLocaleValue(source.slug),
    blog_image: normalizeMediaFormValue(source.blog_image),
    tags: tagsFromApiToFlat(source.tags),
    ...authorFields,
    blog_category: mapBlogCategoryFromApi(source),
    related_blogs: relatedBlogsFromApi(
      Array.isArray(source.related_blogs_ids)
        ? source.related_blogs_ids
        : Array.isArray(source.related_blogs)
          ? source.related_blogs
          : Array.isArray(source.related_blog_ids)
            ? source.related_blog_ids
            : [],
    ),
    blog_references: blogReferencesFromApi(source),
    description: ensureLocaleValue(source.description),
    content: ensureLocaleValue(source.content),
    content_font: ensureContentFont(source.content_font ?? source.font ?? source.contentFont),
    meta_title: pickLocaleField(source.meta_title, seo?.meta_title),
    meta_description: pickLocaleField(source.meta_description, seo?.meta_description),
    meta_keywords: pickMetaKeywords(source.meta_keywords, seo?.meta_keywords),
    canonical_url: String(source.canonical_url || seo?.canonical_url || '').trim(),
    og_image: normalizeMediaFormValue(source.og_image ?? seo?.og_image),
    og_title: pickLocaleField(source.og_title, seo?.og_title),
    og_description: pickLocaleField(source.og_description, seo?.og_description),
  });
}
