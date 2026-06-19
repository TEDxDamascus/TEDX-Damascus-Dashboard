import {
  Box,
  Button,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Pagination,
  Typography,
} from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../shared-components/breadcrumb';
import { useDeleteBlogMutation, useGetBlogsQuery, useUpdateBlogMutation } from '../BlogsApi';
import { useGetBlogCategoriesQuery } from '../blog-categories/BlogCategoriesApi';
import { mediaFieldToDisplayUrl } from '../../../shared-components/image-picker';
import ConfirmModal from '../../../shared-components/confirm-modal';

function extractItems(raw) {
  const candidates = [
    raw?.data?.items,
    raw?.data?.blogs,
    raw?.data?.results,
    raw?.data,
    raw?.items,
    raw?.blogs,
    raw?.results,
    raw,
  ];
  const match = candidates.find((candidate) => Array.isArray(candidate));
  return match ?? [];
}

function getLocalizedText(value, locale = 'en') {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[locale] || value.en || value.ar || '';
  return '';
}

function getBlogCategoryDisplay(blog, locale = 'en') {
  if (
    blog.category_id &&
    typeof blog.category_id === 'object' &&
    !Array.isArray(blog.category_id)
  ) {
    return (
      getLocalizedText(blog.category_id.name, locale) ||
      getLocalizedText(blog.category_id.slug, locale) ||
      ''
    );
  }
  if (blog.category_name) {
    if (typeof blog.category_name === 'string') return blog.category_name;
    return getLocalizedText(blog.category_name, locale);
  }
  if (typeof blog.category === 'string') return blog.category;
  if (blog.category && typeof blog.category === 'object') {
    return (
      getLocalizedText(blog.category.name, locale) || getLocalizedText(blog.category.slug, locale)
    );
  }
  return '';
}

function formatReadTime(readTime) {
  const minutes = Number(readTime);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return `${minutes} min read`;
}

const SORT_FIELD_OPTIONS = [
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' },
];

function BlogsList() {
  const navigate = useNavigate();
  const [locale, setLocale] = useState('en');
  const [categoryId, setCategoryId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, sortBy, categoryId, debouncedSearch, pageSize, locale]);

  const queryArgs = useMemo(
    () => ({
      page,
      limit: pageSize,
      language: locale,
      sort: sortBy,
      order: 'desc',
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(categoryId ? { category_id: categoryId } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSize, statusFilter, categoryId, debouncedSearch, locale, sortBy],
  );

  const { data, isLoading } = useGetBlogsQuery(queryArgs);
  const { data: categoriesData, isLoading: categoriesLoading } = useGetBlogCategoriesQuery();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteItem, setDeleteItem] = useState(null);

  const categoryOptions = useMemo(() => {
    const raw = categoriesData?.data?.items ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [categoriesData]);

  const total = Number(data?.data?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  useEffect(() => {
    setPage((p) => (p > totalPages ? totalPages : p));
  }, [totalPages]);

  const blogs = extractItems(data);
  const safeBlogs = Array.isArray(blogs) ? blogs : [];
  const filteredBlogs = safeBlogs.filter(
    (blog) => getLocalizedText(blog.title, locale).trim().length > 0,
  );

  const handleLocaleChange = (_, value) => {
    if (value) setLocale(value);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    await deleteBlog(deleteItem.id || deleteItem._id);
    setDeleteItem(null);
  };

  const handleTogglePublish = async (blog) => {
    const id = blog.id || blog._id;
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    await updateBlog({ id, data: { status: newStatus } });
  };

  return (
    <div className="p-6 pt-8">
      <Breadcrumb items={[{ label: 'Blog' }]} />

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-bold text-tedx-dark">Blog</h1>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleButtonGroup
              size="small"
              exclusive
              value={locale}
              onChange={handleLocaleChange}
              aria-label="blog locale toggle"
            >
              <ToggleButton value="en">EN</ToggleButton>
              <ToggleButton value="ar">AR</ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'var(--color-primary)',
                '&:hover': { bgcolor: 'var(--color-primary-dark)' },
              }}
              onClick={() => navigate('/blogs/add')}
            >
              Add New Article
            </Button>
          </div>
        </div>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'center',
            p: 2,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <TextField
            size="small"
            placeholder="Search…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ minWidth: 200 }}
            inputProps={{ 'aria-label': 'Search blogs' }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }} disabled={categoriesLoading}>
            <InputLabel id="blog-list-category-filter">Category</InputLabel>
            <Select
              labelId="blog-list-category-filter"
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <MenuItem value="">
                <em>All categories</em>
              </MenuItem>
              {categoryOptions.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {(c.name || '').trim() || c.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="blog-list-status-filter">Status</InputLabel>
            <Select
              labelId="blog-list-status-filter"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="blog-list-sort">Sort by</InputLabel>
            <Select
              labelId="blog-list-sort"
              label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_FIELD_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel id="blog-list-limit">Per page</InputLabel>
            <Select
              labelId="blog-list-limit"
              label="Per page"
              value={String(pageSize)}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="20">20</MenuItem>
              <MenuItem value="50">50</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <CircularProgress size={24} />
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-6 text-gray-600">No blogs found.</div>
        ) : (
          <div className="space-y-3">
            {filteredBlogs.map((blog) => {
              const id = blog.id || blog._id;
              const isPublished = blog.status === 'published';
              return (
                <div
                  key={id}
                  role="link"
                  tabIndex={0}
                  aria-label={`Open article: ${getLocalizedText(blog.title, locale) || id}`}
                  className="flex cursor-pointer items-start gap-4 rounded-md border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                  onClick={() => navigate(`/blogs/${id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/blogs/${id}`);
                    }
                  }}
                >
                  {/* Thumbnail — left of title */}
                  <div className="pointer-events-none flex-shrink-0">
                    {mediaFieldToDisplayUrl(blog.blog_image) ? (
                      <img
                        src={mediaFieldToDisplayUrl(blog.blog_image)}
                        alt={getLocalizedText(blog.title, locale)}
                        className="h-16 w-24 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-24 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Text content */}
                  <div className="pointer-events-none min-w-0 flex-1">
                    <div
                      className="font-medium text-gray-900"
                      dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    >
                      {getLocalizedText(blog.title, locale)}
                    </div>
                    {!!getLocalizedText(blog.description, locale) && (
                      <div
                        className="text-sm text-gray-500"
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word',
                        }}
                      >
                        {getLocalizedText(blog.description, locale)}
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <Chip
                        label={isPublished ? 'Published' : 'Draft'}
                        size="small"
                        sx={{
                          fontSize: '0.65rem',
                          height: 18,
                          bgcolor: isPublished ? '#4CAF5018' : '#9E9E9E18',
                          color: isPublished ? '#2E7D32' : '#616161',
                          fontWeight: 600,
                        }}
                      />
                      {!!getBlogCategoryDisplay(blog, locale) && (
                        <span className="text-xs text-gray-400">
                          {getBlogCategoryDisplay(blog, locale)}
                        </span>
                      )}
                      {formatReadTime(blog.read_time) && (
                        <span className="text-xs text-gray-400">
                          {formatReadTime(blog.read_time)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div
                    className="flex flex-shrink-0 flex-col gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/blogs/${id}/edit`)}
                      sx={{ minWidth: 80 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={isUpdating}
                      onClick={() => handleTogglePublish(blog)}
                      sx={{
                        minWidth: 80,
                        color: isPublished ? '#616161' : 'var(--color-primary)',
                        borderColor: isPublished ? '#9E9E9E' : 'var(--color-primary)',
                        '&:hover': {
                          borderColor: isPublished ? '#616161' : 'var(--color-primary-dark)',
                        },
                      }}
                    >
                      {isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      disabled={isDeleting}
                      onClick={() => setDeleteItem(blog)}
                      sx={{ minWidth: 80 }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!isLoading && total > 0 && totalPages > 1 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              pt: 2,
              mt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {total} articles · Page {page} of {totalPages}
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </div>

      <ConfirmModal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Article"
        description={`Are you sure you want to delete "${getLocalizedText(deleteItem?.title, locale) || 'this article'}"? This action cannot be undone.`}
      />
    </div>
  );
}

export default BlogsList;
