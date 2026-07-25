import { useState } from 'react';
import { Controller, useController } from 'react-hook-form';
import {
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
} from '@mui/material';
import { Add, DeleteOutline, YouTube } from '@mui/icons-material';
import { ImagePickerDialog } from '../../../../shared-components/image-picker';

/* ─────────────────────────────────────────────
   Gallery Picker
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Video Links Picker (multiple URLs)
───────────────────────────────────────────── */
function VideoLinksPicker({ control, name }) {
  const { field } = useController({ control, name });
  const links = Array.isArray(field.value) ? field.value : [];

  const handleAdd = () => {
    field.onChange([...links, '']);
  };

  const handleChange = (index, value) => {
    const updated = links.map((v, i) => (i === index ? value : v));
    field.onChange(updated);
  };

  const handleRemove = (index) => {
    field.onChange(links.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <YouTube sx={{ color: '#FF0000', fontSize: 22 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Video Links
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<Add />}
          onClick={handleAdd}
          sx={{
            color: 'var(--color-primary)',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: 'rgba(235,0,40,0.06)' },
          }}
        >
          Add Video Link
        </Button>
      </Box>

      {links.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            textAlign: 'center',
            borderStyle: 'dashed',
            borderColor: '#bdbdbd',
            borderRadius: 2,
            color: 'text.secondary',
            fontSize: 13,
          }}
        >
          No video links added yet. Click "Add Video Link" to add one.
        </Paper>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {links.map((link, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              value={link}
              onChange={(e) => handleChange(index, e.target.value)}
              label={`Video Link ${index + 1}`}
              placeholder="https://www.youtube.com/watch?v=..."
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <YouTube sx={{ color: '#FF0000', fontSize: 18, mr: 0.5 }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: 'var(--color-primary)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--color-primary)' },
                },
              }}
            />
            <IconButton
              size="small"
              onClick={() => handleRemove(index)}
              sx={{
                color: '#bdbdbd',
                '&:hover': { color: 'var(--color-primary)', bgcolor: 'rgba(235,0,40,0.06)' },
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ─────────────────────────────────────────────
   Media & Links Tab
───────────────────────────────────────────── */
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

        {/* Video Links – multiple */}
        <Grid item xs={12}>
          <VideoLinksPicker control={control} name="video_link" />
        </Grid>

        {/* Gallery */}
        <Grid item xs={12}>
          <GalleryPicker control={control} name="gallery" />
        </Grid>
      </Grid>
    </Box>
  );
}

export default MediaLinksTab;
