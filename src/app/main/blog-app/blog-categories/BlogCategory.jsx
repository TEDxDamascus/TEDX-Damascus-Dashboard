import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Breadcrumb from '../../../shared-components/breadcrumb';
import {
  LocaleInput,
  localeInputTypes,
  defaultLocaleValue,
  ensureLocaleValue,
} from '../../../shared-components/locale-input';
import {
  useGetBlogCategoriesQuery,
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
} from './BlogCategoriesApi';

function BlogCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isNew = !categoryId || categoryId === 'add';

  const { data, isLoading } = useGetBlogCategoriesQuery(undefined, { skip: isNew });

  const [createCategory, { isLoading: isCreating }] = useCreateBlogCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateBlogCategoryMutation();
  const isSaving = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: defaultLocaleValue(),
      description: defaultLocaleValue(),
    },
  });

  useEffect(() => {
    if (!isNew && data) {
      const items = data?.data?.items ?? [];
      const category = items.find((c) => c.id === categoryId);
      if (category) {
        reset({
          name: ensureLocaleValue(category.nameLocales ?? { en: category.name, ar: category.name }),
          description: ensureLocaleValue(
            category.descriptionLocales ?? { en: category.description, ar: category.description },
          ),
        });
      }
    }
  }, [data, isNew, categoryId, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isNew) {
        await createCategory({ name: formData.name, description: formData.description }).unwrap();
        enqueueSnackbar('Category created', { variant: 'success' });
      } else {
        await updateCategory({
          id: categoryId,
          name: formData.name,
          description: formData.description,
        }).unwrap();
        enqueueSnackbar('Category updated', { variant: 'success' });
      }
      navigate('/blogs/categories');
    } catch (error) {
      enqueueSnackbar(error?.data?.message ?? error?.message ?? 'Could not save category', { variant: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 pt-8">
      <Breadcrumb
        items={[
          { label: 'Blog', href: '/blogs' },
          { label: 'Categories', href: '/blogs/categories' },
          { label: isNew ? 'Add Category' : 'Edit Category' },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tedx-dark">
          {isNew ? 'Add Category' : 'Edit Category'}
        </h1>

        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => navigate('/blogs/categories')}
            className="border-gray-300 text-gray-500"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <Save />}
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            sx={{
              bgcolor: 'var(--color-primary)',
              '&:hover': { bgcolor: 'var(--color-primary-dark)' },
            }}
          >
            {isSaving ? 'Saving...' : 'Save Category'}
          </Button>
        </div>
      </div>

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 720 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Name"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Description"
                minRows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
        </Box>
      </Paper>
    </div>
  );
}

export default BlogCategory;
