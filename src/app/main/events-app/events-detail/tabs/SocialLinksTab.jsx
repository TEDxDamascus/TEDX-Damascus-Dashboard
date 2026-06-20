import { useState } from 'react';
import { useController, Controller } from 'react-hook-form';
import { Grid, Box, Typography, IconButton, Button, TextField, Divider } from '@mui/material';
import { Add, DeleteOutline } from '@mui/icons-material';
import { ImagePickerDialog } from '../../../../shared-components/image-picker';
import { LocaleInput, localeInputTypes } from '../../../../shared-components/locale-input';

const fieldSx = {
  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: 'var(--color-primary)' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-primary)' },
};

function GalleryPicker({ control, name }) {
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
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
        Gallery
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
            border: '1px dashed #bdbdbd',
            color: 'text.secondary',
            flexDirection: 'column',
            gap: 0.5,
            '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' },
          }}
        >
          Add
        </Button>
      </Box>
      <ImagePickerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={handleAdd}
        currentValue=""
      />
    </Box>
  );
}

function SectionTitle({ children }) {
  return (
    <Grid item xs={12}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
        {children}
      </Typography>
      <Divider />
    </Grid>
  );
}

function LinksTab({ control, errors }) {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* ── LOCATION ── */}
        <SectionTitle>Location</SectionTitle>

        <Grid item xs={12}>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Location / City"
                error={!!errors.location}
                helperText={errors.location?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="location_email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Location Email"
                type="email"
                fullWidth
                placeholder="location@example.com"
                error={!!errors.location_email}
                helperText={errors.location_email?.message}
                sx={fieldSx}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="location_phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Location Phone"
                fullWidth
                placeholder="+963980817760"
                error={!!errors.location_phone}
                helperText={errors.location_phone?.message}
                sx={fieldSx}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="location_description"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Location Description"
                minRows={2}
                error={!!errors.location_description}
                helperText={errors.location_description?.message}
              />
            )}
          />
        </Grid>

        {/* COORDINATES */}
        <Grid item xs={12} md={6}>
          <Controller
            name="coordinate_lng"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Longitude"
                type="number"
                fullWidth
                placeholder="36.2765333"
                inputProps={{ step: 'any' }}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
                error={!!errors.coordinate_lng}
                helperText={errors.coordinate_lng?.message}
                sx={fieldSx}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="coordinate_lat"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Latitude"
                type="number"
                fullWidth
                placeholder="33.5138057"
                inputProps={{ step: 'any' }}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
                error={!!errors.coordinate_lat}
                helperText={errors.coordinate_lat?.message}
                sx={fieldSx}
              />
            )}
          />
        </Grid>

        {/* ── GALLERY ── */}
        <SectionTitle>Gallery</SectionTitle>

        <Grid item xs={12}>
          <GalleryPicker control={control} name="gallery" />
        </Grid>
      </Grid>
    </Box>
  );
}

export default LinksTab;
