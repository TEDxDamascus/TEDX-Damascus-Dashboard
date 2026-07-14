import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Paper, Button, CircularProgress, Typography, Alert } from '@mui/material';
import { Save } from '@mui/icons-material';
import Breadcrumb from '../../../shared-components/breadcrumb';
import BlogContentSeoTab from './tabs/BlogContentSeoTab';
import BlogModel from './models/BlogModel';
import { ensureLocaleValue } from '../../../shared-components/locale-input';
import { useSnackbar } from 'notistack';
import {
  useCreateBlogMutation,
  useCreateBlogReferenceMutation,
  useDeleteBlogReferenceMutation,
  useGetBlogQuery,
  useGetBlogFontsQuery,
  useGetBlogAuthorOptionsQuery,
  useGetBlogReferencesByBlogQuery,
  useUpdateBlogMutation,
  useUpdateBlogReferenceMutation,
} from '../BlogsApi';
import { searchBlogOptions } from '../BlogsApi';
import { searchBlogCategoryOptions } from '../blog-categories/BlogCategoriesApi';
import { blogReferencesFromApi, mapBlogFromApi, mapBlogReferenceApiItemToForm } from './blogMapper';
import { ensureContentFont, contentFontToApiString } from './blogFontUtils';
import { buildAuthorApiPayload } from './blogAuthorUtils';
import {
  mediaFormValueToApiId,
} from '../../../shared-components/image-picker';

const localeObjectSchema = z.object({ ar: z.string(), en: z.string() });

const mediaRefSchema = z.object({ id: z.string().optional(), url: z.string().optional() });

const blogReferenceRowSchema = z.object({
  reference_id: z.string().optional(),
  name: z.string().optional(),
  desc: z.string().optional(),
  url: z.string().optional(),
});

const blogSchema = z.object({
  title: localeObjectSchema.refine((v) => v?.en?.trim() || v?.ar?.trim(), 'Title is required'),
  slug: localeObjectSchema,
  blog_image: z.union([mediaRefSchema, z.string()]).optional(),
  read_time: z.coerce.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  author_type: z.enum(['', 'admin', 'external']).optional(),
  author_admin: z.union([z.object({ id: z.string() }).passthrough(), z.null()]).optional(),
  author_name: localeObjectSchema.optional(),
  author_description: localeObjectSchema.optional(),
  author_image: z.union([mediaRefSchema, z.string()]).optional(),
  author_image_url: z.string().optional(),
  blog_category: z.union([z.object({ id: z.string() }).passthrough(), z.null()]).optional(),
  related_blogs: z.array(z.any()).optional(),
  description: localeObjectSchema,
  content: localeObjectSchema.refine((v) => v?.en?.trim() || v?.ar?.trim(), 'Content is required'),
  content_font: localeObjectSchema.optional(),
  status: z.enum(['draft', 'published']).optional(),
  meta_title: localeObjectSchema,
  meta_description: localeObjectSchema,
  meta_keywords: localeObjectSchema,
  canonical_url: z.string().optional(),
  og_image: z.union([mediaRefSchema, z.string()]).optional(),
  og_title: localeObjectSchema,
  og_description: localeObjectSchema,
  blog_references: z.array(blogReferenceRowSchema).optional(),
});

function sanitizeLocaleObject(value) {
  const localeValue = ensureLocaleValue(value);
  return {
    en: String(localeValue.en || '').trim(),
    ar: String(localeValue.ar || '').trim(),
  };
}

function buildSlug(value) {
  return value
    .toLocaleLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

function generateSlugLocaleFromTitle(titleValue) {
  const titleLocale = ensureLocaleValue(titleValue);
  return {
    en: buildSlug(titleLocale.en || ''),
    ar: buildSlug(titleLocale.ar || ''),
  };
}

/** Split free-form tags into ar/en arrays (Arabic script → ar, otherwise → en). */
function tagsFlatToLocalized(flatTags) {
  const list = (flatTags || []).map((t) => String(t || '').trim()).filter(Boolean);
  const ar = [];
  const en = [];
  const arabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  for (const s of list) {
    if (arabic.test(s)) ar.push(s);
    else en.push(s);
  }
  return { ar, en };
}

/** Form meta keywords (comma-separated per locale) → API shape { ar: string[], en: string[] }. */
function metaKeywordsToKeywordArrays(metaKw) {
  const m = ensureLocaleValue(metaKw);
  const parse = (s) =>
    String(s || '')
      .split(/[,،]/)
      .map((x) => x.trim())
      .filter(Boolean);
  return { ar: parse(m.ar), en: parse(m.en) };
}

function omitUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

/**
 * Sync form `blog_references` with TedX backend: DELETE removed, PATCH changed rows, POST new.
 * `initialReferenceIds` is the set of reference `_id`s loaded when the form was hydrated.
 */
async function syncBlogReferencesWithServer({
  blogId,
  formRefs,
  initialReferenceIds,
  createBlogReference,
  updateBlogReference,
  deleteBlogReference,
}) {
  const bid = String(blogId || '');
  if (!bid) return 0;

  const refs = formRefs || [];
  const initialSet =
    initialReferenceIds instanceof Set ? initialReferenceIds : new Set(initialReferenceIds || []);

  const currentIds = new Set(
    refs.map((r) => (r?.reference_id ? String(r.reference_id) : null)).filter(Boolean),
  );

  let failures = 0;

  for (const id of initialSet) {
    const sid = String(id);
    if (!currentIds.has(sid)) {
      try {
        await deleteBlogReference({ referenceId: sid, blogId: bid }).unwrap();
      } catch {
        failures += 1;
      }
    }
  }

  for (const r of refs) {
    if (!r?.reference_id) continue;
    const name = String(r.name || '').trim();
    const url = String(r.url || '').trim();
    if (!name || !url) continue;
    try {
      await updateBlogReference({
        referenceId: String(r.reference_id),
        blogId: bid,
        data: {
          name,
          desc: String(r.desc || '').trim(),
          url,
        },
      }).unwrap();
    } catch {
      failures += 1;
    }
  }

  for (const r of refs) {
    if (r?.reference_id) continue;
    const name = String(r?.name || '').trim();
    const url = String(r?.url || '').trim();
    if (!name || !url) continue;
    try {
      await createBlogReference({
        blog_id: bid,
        name,
        desc: String(r.desc || '').trim(),
        url,
      }).unwrap();
    } catch {
      failures += 1;
    }
  }

  return failures;
}

/** Payload shape expected by POST/PUT `/blogs` (TedX backend). */
function buildBlogApiPayload(data, defaultContentFont = 'cairo') {
  const status = data.status || 'draft';
  const title = sanitizeLocaleObject(data.title);
  const content = sanitizeLocaleObject(data.content);
  const description = sanitizeLocaleObject(data.description);

  const payload = {
    title,
    content,
    content_font: contentFontToApiString(data.content_font, defaultContentFont),
    status,
    description,
    tags: tagsFlatToLocalized(data.tags),
    meta_title: sanitizeLocaleObject(data.meta_title),
    meta_description: sanitizeLocaleObject(data.meta_description),
    meta_keywords: metaKeywordsToKeywordArrays(data.meta_keywords),
    canonical_url: data.canonical_url?.trim() || '',
    og_title: sanitizeLocaleObject(data.og_title),
    og_description: sanitizeLocaleObject(data.og_description),
    gallery: Array.isArray(data.gallery) ? data.gallery.filter(Boolean) : [],
    related_blogs_ids: (data.related_blogs || [])
      .map((item) => item?.id ?? item?.value)
      .filter(Boolean),
    ...buildAuthorApiPayload(data, sanitizeLocaleObject),
  };

  if (status === 'published') {
    payload.publishedAt = new Date().toISOString();
  }

  const rt = Number(data.read_time);
  if (Number.isFinite(rt) && rt > 0) {
    payload.read_time = rt;
  }

  if (data.blog_category?.id) {
    payload.category_id = String(data.blog_category.id);
  }

  const blogImgId = mediaFormValueToApiId(data.blog_image);
  if (blogImgId) {
    payload.blog_image = blogImgId;
  }
  const ogImgId = mediaFormValueToApiId(data.og_image);
  if (ogImgId) {
    payload.og_image = ogImgId;
  }

  return omitUndefined(payload);
}

function formatReadTime(readTime) {
  const minutes = Number(readTime);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return `${minutes} min read`;
}

function Blog() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const isNew = pathname.endsWith('/blogs/add');
  const {
    data: blogData,
    isLoading,
    isError,
    error: loadError,
  } = useGetBlogQuery(blogId, { skip: isNew });
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [createBlogReference] = useCreateBlogReferenceMutation();
  const [updateBlogReference] = useUpdateBlogReferenceMutation();
  const [deleteBlogReference] = useDeleteBlogReferenceMutation();
  const [syncingRefs, setSyncingRefs] = useState(false);

  const refQuery = useGetBlogReferencesByBlogQuery(blogId, {
    skip: isNew || !blogId,
  });

  const { data: blogFonts, isLoading: fontsLoading } = useGetBlogFontsQuery();
  const { isLoading: authorOptionsLoading } = useGetBlogAuthorOptionsQuery();
  const defaultContentFont = blogFonts?.default || 'cairo';

  const lastHydratedBlogIdRef = useRef(null);
  const initialReferenceIdsRef = useRef(new Set());

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: BlogModel(),
  });

  const isSaving = isCreating || isUpdating;
  const busySaving = isSaving || syncingRefs;
  /** RTK Query hooks here do not expose `isFetched`; use settled flags instead. */
  const refsQuerySettled = refQuery.isSuccess || refQuery.isError;
  const refsBlockingLoad = !isNew && !refsQuerySettled;
  const pageLoading = isLoading || refsBlockingLoad;

  useEffect(() => {
    lastHydratedBlogIdRef.current = null;
  }, [blogId]);

  useEffect(() => {
    if (!blogFonts) return;

    if (isNew) {
      if (lastHydratedBlogIdRef.current === 'new') return;
      reset({
        ...BlogModel(),
        content_font: ensureContentFont(null, defaultContentFont),
      });
      lastHydratedBlogIdRef.current = 'new';
      return;
    }

    if (!blogData || !blogId) return;
    if (!refsQuerySettled) return;
    if (lastHydratedBlogIdRef.current === blogId) return;

    const raw = blogData?.data ?? blogData;
    const fromGet =
      !refQuery.isError && Array.isArray(refQuery.data?.data) ? refQuery.data.data : null;
    const mapped =
      fromGet != null
        ? fromGet.map(mapBlogReferenceApiItemToForm).filter(Boolean)
        : blogReferencesFromApi(raw);

    const base = mapBlogFromApi(blogData);
    const { blog_references: _drop, ...rest } = base;
    reset({
      ...rest,
      content_font: ensureContentFont(base.content_font, defaultContentFont),
      blog_references: mapped,
    });
    initialReferenceIdsRef.current = new Set(
      mapped
        .map((r) => r.reference_id)
        .filter(Boolean)
        .map(String),
    );
    lastHydratedBlogIdRef.current = blogId;
  }, [
    isNew,
    blogId,
    blogData,
    refsQuerySettled,
    refQuery.isError,
    refQuery.data,
    blogFonts,
    defaultContentFont,
    reset,
  ]);

  const currentReadTime = useWatch({ control, name: 'read_time' });

  const handleGenerateSlug = () => {
    const generatedSlug = generateSlugLocaleFromTitle(getValues('title'));
    setValue('slug', generatedSlug, { shouldDirty: true, shouldValidate: true });
  };

  const fetchRelatedBlogsOptions = (query) => searchBlogOptions(query, { excludeId: blogId });

  const onSubmit = async (data) => {
    const payload = buildBlogApiPayload(data, defaultContentFont);

    if (import.meta.env.DEV) {
      console.log('[Blog] submit payload:', payload);
    }

    try {
      if (isNew) {
        const res = await createBlog(payload).unwrap();
        const newId = res?.data?._id ?? res?.data?.id;
        setSyncingRefs(true);
        let refFailures = 0;
        try {
          refFailures = await syncBlogReferencesWithServer({
            blogId: newId,
            formRefs: data.blog_references,
            initialReferenceIds: initialReferenceIdsRef.current,
            createBlogReference,
            updateBlogReference,
            deleteBlogReference,
          });
        } finally {
          setSyncingRefs(false);
        }
        if (refFailures > 0) {
          enqueueSnackbar(
            `Blog created, but ${refFailures} reference operation(s) failed. You can fix them by editing the article.`,
            { variant: 'warning' },
          );
        } else {
          enqueueSnackbar('Blog created successfully', { variant: 'success' });
        }
        navigate(newId ? `/blogs/${newId}` : '/blogs');
      } else {
        await updateBlog({ id: blogId, data: payload }).unwrap();
        setSyncingRefs(true);
        let refFailures = 0;
        try {
          refFailures = await syncBlogReferencesWithServer({
            blogId,
            formRefs: data.blog_references,
            initialReferenceIds: initialReferenceIdsRef.current,
            createBlogReference,
            updateBlogReference,
            deleteBlogReference,
          });
        } finally {
          setSyncingRefs(false);
        }
        if (refFailures > 0) {
          enqueueSnackbar(`Article updated, but ${refFailures} reference operation(s) failed.`, {
            variant: 'warning',
          });
        } else {
          enqueueSnackbar('Blog updated successfully', { variant: 'success' });
        }
        navigate(`/blogs/${blogId}`);
      }
    } catch {
      enqueueSnackbar(`Failed to ${isNew ? 'create' : 'update'} blog`, { variant: 'error' });
    }
  };

  if (pageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress className="text-tedx-red" />
      </div>
    );
  }

  if (!isNew && isError) {
    const message =
      typeof loadError?.data === 'string'
        ? loadError.data
        : loadError?.data?.message || loadError?.message || 'Could not load this article.';
    return (
      <div className="p-6 pt-8">
        <Breadcrumb items={[{ label: 'Blog', href: '/blogs' }, { label: 'Article' }]} />
        <Alert severity="error" sx={{ mt: 2, maxWidth: 560 }}>
          {message}
        </Alert>
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button variant="contained" onClick={() => navigate('/blogs')}>
            Back to blog list
          </Button>
          {!isNew && blogId && (
            <Button variant="outlined" onClick={() => navigate(`/blogs/${blogId}`)}>
              Open read-only view
            </Button>
          )}
        </Box>
      </div>
    );
  }

  return (
    <div className="p-6 pt-8">
      <Breadcrumb
        items={[
          { label: 'Blog', href: '/blogs' },
          ...(isNew
            ? [{ label: 'Add New Article' }]
            : [{ label: 'Article', href: `/blogs/${blogId}` }, { label: 'Edit' }]),
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">
            {isNew ? 'Add New Article' : 'Edit Article'}
          </h1>
          {formatReadTime(currentReadTime) && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {formatReadTime(currentReadTime)}
            </Typography>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => navigate(isNew ? '/blogs' : `/blogs/${blogId}`)}
            className="border-gray-300 text-gray-500"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={busySaving ? <CircularProgress size={14} color="inherit" /> : <Save />}
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || busySaving}
            className="bg-tedx-red hover:bg-tedx-red-dark"
          >
            {isSubmitting || busySaving ? 'Saving...' : 'Save Article'}
          </Button>
        </div>
      </div>

      <Paper
        elevation={0}
        sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}
      >
        <Box>
          <BlogContentSeoTab
            control={control}
            errors={errors}
            onGenerateSlug={handleGenerateSlug}
            slugPreviewBase="/blogs"
            fetchRelatedBlogsOptions={fetchRelatedBlogsOptions}
            fetchCategoryOptions={searchBlogCategoryOptions}
            blogFonts={blogFonts}
            fontsLoading={fontsLoading}
            authorOptionsLoading={authorOptionsLoading}
          />
        </Box>
      </Paper>
    </div>
  );
}

export default Blog;
