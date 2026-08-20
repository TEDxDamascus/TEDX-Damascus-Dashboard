import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Alert,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import Breadcrumb from '../../../shared-components/breadcrumb';
import { useGetBlogQuery } from '../BlogsApi';
import { mapBlogFromApi } from './blogMapper';
import { getAuthorDisplayName } from './blogAuthorUtils';
import { mediaFormValueToPreviewSrc } from '../../../shared-components/image-picker';
import RichTextContent from '../../../shared-components/rich-text-editor/RichTextContent';
import { blogFontValueToCssFamily } from './blogFontUtils';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

function getLocalizedText(value, loc = 'en') {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[loc] || value.en || value.ar || '';
  return '';
}

/** Chip / text must never receive a raw object (shows as [object Object]). */
function asPlainLabel(value, loc) {
  if (value == null || value === '') return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') return getLocalizedText(value, loc).trim();
  return String(value).trim();
}

function BlogView() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [locale, setLocale] = useState('en');
  const { canManage } = useOwnershipScope();
  const {
    data: blogData,
    isLoading,
    isError,
    error: loadError,
  } = useGetBlogQuery(blogId, {
    skip: !blogId,
  });

  const blog = useMemo(() => {
    if (!blogData || !blogId) return null;
    return mapBlogFromApi(blogData);
  }, [blogData, blogId]);

  const rawBlog = blogData?.data ?? blogData;
  const canEdit = canManage(rawBlog);

  const handleLocaleChange = (_, value) => {
    if (value) setLocale(value);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress className="text-tedx-red" />
      </div>
    );
  }

  if (isError || !blog) {
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
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/blogs')}>
          Back to blog list
        </Button>
      </div>
    );
  }

  const title = getLocalizedText(blog.title, locale);
  const description = getLocalizedText(blog.description, locale);
  const content = getLocalizedText(blog.content, locale);
  const authorName = getAuthorDisplayName(blog, locale);
  const authorDescription = getLocalizedText(blog.author_description, locale);
  const authorImageSrc =
    mediaFormValueToPreviewSrc(blog.author_image) ||
    (typeof blog.author_image_url === 'string' ? blog.author_image_url.trim() : '');
  const contentFont = blogFontValueToCssFamily(getLocalizedText(blog.content_font, locale));
  const isPublished = blog.status === 'published';

  return (
    <div className="p-6 pt-8">
      <Breadcrumb
        items={[{ label: 'Blog', href: '/blogs' }, { label: title.trim() || 'Article' }]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Typography variant="h4" component="h1" className="font-bold text-tedx-dark">
          {title.trim() || 'Untitled'}
        </Typography>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleButtonGroup
            size="small"
            exclusive
            value={locale}
            onChange={handleLocaleChange}
            aria-label="article locale"
          >
            <ToggleButton value="en">EN</ToggleButton>
            <ToggleButton value="ar">AR</ToggleButton>
          </ToggleButtonGroup>
          <Button variant="outlined" onClick={() => navigate('/blogs')}>
            Back to list
          </Button>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate(`/blogs/${blogId}/edit`)}
              sx={{
                bgcolor: 'var(--color-primary)',
                color: '#fff',
                '&:hover': { bgcolor: 'var(--color-primary-dark)', color: '#fff' },
              }}
            >
              Edit article
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip
          label={isPublished ? 'Published' : 'Draft'}
          size="small"
          color={isPublished ? 'success' : 'default'}
          sx={{ fontWeight: 600 }}
        />
        {asPlainLabel(blog.blog_category?.label, locale) && (
          <Chip
            label={asPlainLabel(blog.blog_category.label, locale)}
            size="small"
            variant="outlined"
          />
        )}
        {authorName && (
          <Typography variant="body2" color="text.secondary">
            Author: {authorName}
          </Typography>
        )}
      </div>

      {authorName && (authorImageSrc || authorDescription) && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="overline" color="text.secondary">
            About the author
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            {authorImageSrc ? (
              <Box
                component="img"
                src={authorImageSrc}
                alt=""
                sx={{ width: 72, height: 72, borderRadius: 1, objectFit: 'cover' }}
              />
            ) : null}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {authorName}
              </Typography>
              {authorDescription && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {authorDescription}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {mediaFormValueToPreviewSrc(blog.blog_image) ? (
        <Box sx={{ mb: 3, maxWidth: 720 }}>
          <img
            src={mediaFormValueToPreviewSrc(blog.blog_image)}
            alt=""
            className="max-h-80 w-full rounded-lg object-cover"
          />
        </Box>
      ) : null}

      {!!description.trim() && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="overline" color="text.secondary">
            Description
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}
          >
            {description}
          </Typography>
        </Paper>
      )}

      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="overline" color="text.secondary">
          Content
        </Typography>
        <Box sx={{ mt: 1, lineHeight: 1.7, fontFamily: contentFont }}>
          <RichTextContent html={content} dir={locale === 'ar' ? 'rtl' : 'ltr'} />
        </Box>
      </Paper>

      {Array.isArray(blog.tags) && blog.tags.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {blog.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      )}

      {blog.canonical_url ? (
        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
          Canonical:{' '}
          <a
            href={blog.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-tedx-red underline"
          >
            {blog.canonical_url}
          </a>
        </Typography>
      ) : null}

      {(blog.createdAt || blog.updatedAt) && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {blog.createdAt && <>Created {new Date(blog.createdAt).toLocaleString()}</>}
          {blog.createdAt && blog.updatedAt && <> · </>}
          {blog.updatedAt && <>Updated {new Date(blog.updatedAt).toLocaleString()}</>}
        </Typography>
      )}
    </div>
  );
}

export default BlogView;
