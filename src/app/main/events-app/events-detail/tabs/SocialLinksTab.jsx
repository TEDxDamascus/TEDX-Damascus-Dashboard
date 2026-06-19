import { useState } from 'react';
import { useController } from 'react-hook-form';
import { Grid, Box, Typography, IconButton, Button } from '@mui/material';
import { Add, DeleteOutline } from '@mui/icons-material';
import { ImagePickerDialog } from '../../../../shared-components/image-picker';

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

function LinksTab({ control, errors: _errors }) {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <GalleryPicker control={control} name="gallery" />
        </Grid>
      </Grid>
    </Box>
  );
}

export default LinksTab;
