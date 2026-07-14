import { Controller, useWatch } from 'react-hook-form';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { LocaleInput, localeInputTypes } from '../../../../shared-components/locale-input';
import { CustomAutocomplete } from '../../../../shared-components/custom-autocomplete';
import { ImagePickerField } from '../../../../shared-components/image-picker';
import { searchBlogAuthorOptions } from '../../BlogsApi';

const AUTHOR_TYPE_OPTIONS = [
  { value: '', label: 'No author' },
  { value: 'admin', label: 'Existing author' },
  { value: 'external', label: 'External guest' },
];

function AuthorSection({ control, errors, authorOptionsLoading }) {
  const authorType = useWatch({ control, name: 'author_type' }) || '';

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
        Author
      </Typography>

      <Controller
        name="author_type"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Author type</InputLabel>
            <Select {...field} label="Author type" value={field.value ?? ''}>
              {AUTHOR_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value || 'none'} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      {authorType === 'admin' && (
        <Box>
          {authorOptionsLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Loading authors...
              </Typography>
            </Box>
          )}
          <Controller
            name="author_admin"
            control={control}
            render={({ field }) => (
              <CustomAutocomplete
                {...field}
                value={field.value ?? null}
                scope="blog-author-options"
                fetchOptions={searchBlogAuthorOptions}
                label="Select author"
                placeholder="Search existing authors..."
                helperText="Choose from authors returned by /blogs/author-options."
                error={errors.author_admin}
              />
            )}
          />
        </Box>
      )}

      {authorType === 'external' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Controller
            name="author_name"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Author name"
                required
                error={!!errors.author_name}
                helperText={errors.author_name?.message || 'Name in English and/or Arabic.'}
              />
            )}
          />
          <Controller
            name="author_description"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Author description"
                minRows={2}
                error={!!errors.author_description}
                helperText={errors.author_description?.message}
              />
            )}
          />
          <Controller
            name="author_image"
            control={control}
            render={({ field }) => (
              <ImagePickerField
                value={field.value}
                onChange={field.onChange}
                label="Author photo (media library)"
                helperText="Upload or pick from storage. Used when no external URL is set."
              />
            )}
          />
          <Controller
            name="author_image_url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="Author photo URL (external)"
                fullWidth
                placeholder="https://cdn.example.com/author.jpg"
                helperText="Optional external image link. Ignored if a media library image is selected."
                error={!!errors.author_image_url}
              />
            )}
          />
        </Box>
      )}
    </Box>
  );
}

export default AuthorSection;
