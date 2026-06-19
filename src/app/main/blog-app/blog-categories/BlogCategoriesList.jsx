import { useState, useMemo } from 'react';
import {
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../shared-components/breadcrumb';
import { useSnackbar } from 'notistack';
import ConfirmModal from '../../../shared-components/confirm-modal';
import { useGetBlogCategoriesQuery, useDeleteBlogCategoryMutation } from './BlogCategoriesApi';

function getLocalizedText(value, locale = 'en') {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[locale] || value.en || value.ar || '';
  return '';
}

function BlogCategoriesList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading } = useGetBlogCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteBlogCategoryMutation();

  const items = useMemo(() => {
    const raw = data?.data?.items ?? data?.items ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const [listLocale, setListLocale] = useState('en');
  const [confirmItem, setConfirmItem] = useState(null);

  const handleListLocaleChange = (_, value) => {
    if (value) setListLocale(value);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCategory(confirmItem.id).unwrap();
      enqueueSnackbar('Category deleted', { variant: 'success' });
      setConfirmItem(null);
    } catch {
      enqueueSnackbar('Could not delete category', { variant: 'error' });
    }
  };

  const dash = (v) => (v != null && String(v).trim() !== '' ? v : '—');

  return (
    <div className="p-6 pt-8">
      <Breadcrumb items={[{ label: 'Blog', href: '/blogs' }, { label: 'Categories' }]} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-bold text-tedx-dark">Blog categories</h1>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleButtonGroup
            size="small"
            exclusive
            value={listLocale}
            onChange={handleListLocaleChange}
            aria-label="category list locale"
          >
            <ToggleButton value="en">EN</ToggleButton>
            <ToggleButton value="ar">AR</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'var(--color-primary)',
              color: '#fff',
              '&:hover': { bgcolor: 'var(--color-primary-dark)', color: '#fff' },
            }}
            onClick={() => navigate('/blogs/categories/add')}
          >
            Add category
          </Button>
        </div>
      </div>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, width: 120 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>No categories yet.</TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell dir={listLocale === 'ar' ? 'rtl' : 'ltr'}>
                      {dash(
                        getLocalizedText(
                          row.nameLocales ?? { en: row.name, ar: row.name },
                          listLocale,
                        ),
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 480 }} dir={listLocale === 'ar' ? 'rtl' : 'ltr'}>
                      {dash(
                        getLocalizedText(
                          row.descriptionLocales ?? {
                            en: row.description,
                            ar: row.description,
                          },
                          listLocale,
                        ),
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="Edit"
                        onClick={() => navigate(`/blogs/categories/${row.id}`)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Delete"
                        disabled={isDeleting}
                        onClick={() => setConfirmItem(row)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <ConfirmModal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Category"
        description={`Are you sure you want to delete "${getLocalizedText(confirmItem?.nameLocales ?? { en: confirmItem?.name }, 'en') || 'this category'}"?`}
      />
    </div>
  );
}

export default BlogCategoriesList;
