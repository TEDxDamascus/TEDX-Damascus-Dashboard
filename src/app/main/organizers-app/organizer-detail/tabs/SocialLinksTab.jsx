import { useState } from 'react';
import { Controller, useController } from 'react-hook-form';
import { TextField, Grid, Box, Typography, IconButton, Button } from '@mui/material';
import { Add, DeleteOutline } from '@mui/icons-material';
import { ImagePickerDialog } from '../../../../shared-components/image-picker';

function GalleryPicker({ control, name, error, helperText }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { field } = useController({ control, name });
  const images = Array.isArray(field.value) ? field.value : [];

  const handleAdd = (ref) => {
    const url = typeof ref === 'string' ? ref.trim() : String(ref?.url || ref?.id || '').trim();
    if (url && !images.includes(url)) {
      field.onChange([...images, url]);
    }
    setDialogOpen(false);
  };

  const handleRemove = (url) => {
    field.onChange(images.filter((u) => u !== url));
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: error ? 'error.main' : 'text.secondary' }}>
        Gallery *
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
        {images.map((url, i) => (
          <Box
            key={i}
            sx={{
              position: 'relative',
              width: 120,
              height: 90,
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid #e0e0e0',
            }}
          >
            <img
              src={url}
              alt={`gallery-${i}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <IconButton
              size="small"
              onClick={() => handleRemove(url)}
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                bgcolor: 'rgba(0,0,0,0.55)',
                color: 'white',
                p: 0.4,
                '&:hover': { bgcolor: 'rgba(235,0,40,0.85)' },
              }}
            >
              <DeleteOutline sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="outlined"
          size="small"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{
            height: 90,
            width: 120,
            border: error ? '1px dashed #d32f2f' : '1px dashed #bdbdbd',
            color: error ? 'error.main' : 'text.secondary',
            flexDirection: 'column',
            gap: 0.5,
            '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' },
          }}
        >
          Add
        </Button>
      </Box>
      {error && helperText && (
        <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
      <ImagePickerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={handleAdd}
        currentValue=""
      />
    </Box>
  );
}

function MediaLinksTab({ control, errors }) {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="linkedin_url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="LinkedIn Profile"
                fullWidth
                placeholder="https://linkedin.com/in/username"
                error={!!errors.linkedin_url}
                helperText={errors.linkedin_url?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="twitter_url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Twitter / X Profile"
                fullWidth
                placeholder="https://twitter.com/username"
                error={!!errors.twitter_url}
                helperText={errors.twitter_url?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="facebook_url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Facebook Profile"
                fullWidth
                placeholder="https://facebook.com/username"
                error={!!errors.facebook_url}
                helperText={errors.facebook_url?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="website_url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Personal Website"
                fullWidth
                placeholder="https://example.com"
                error={!!errors.website_url}
                helperText={errors.website_url?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <GalleryPicker
            control={control}
            name="gallery"
            error={!!errors.gallery}
            helperText={errors.gallery?.message || errors.gallery?.root?.message}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default MediaLinksTab;