import { Controller, useWatch } from 'react-hook-form';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { LocaleInput, localeInputTypes } from '../../../../shared-components/locale-input';
import { ImagePickerField } from '../../../../shared-components/image-picker';

const AUTHOR_TYPE_OPTIONS = [
  { value: 'no_author', label: 'No author' },
  { value: 'external', label: 'External guest' },
];

function AuthorPhotoFields({ control, errors }) {
  return (
    <>
      <Controller
        name="author_image"
        control={control}
        render={({ field }) => (
          <ImagePickerField
            value={field.value}
            onChange={field.onChange}
            valueMode="mediaRef"
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
    </>
  );
}

function AuthorSection({ control, errors }) {
  const rawAuthorType = useWatch({ control, name: 'author_type' }) || 'no_author';
  const authorType = rawAuthorType === 'admin' ? 'external' : rawAuthorType;
  const status = useWatch({ control, name: 'status' }) || 'draft';
  const descriptionRequired = status === 'published' && authorType === 'external';

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
            <Select
              {...field}
              label="Author type"
              value={field.value === 'admin' ? 'external' : field.value || 'no_author'}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {AUTHOR_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

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
                required={descriptionRequired}
                error={!!errors.author_description}
                helperText={
                  errors.author_description?.message ||
                  'Required when publishing. Saved on this article.'
                }
              />
            )}
          />
          <AuthorPhotoFields control={control} errors={errors} />
        </Box>
      )}
    </Box>
  );
}

export default AuthorSection;
