import { Controller } from 'react-hook-form';
import { TextField, Grid, Box } from '@mui/material';

function SocialLinksTab({ control, errors }) {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="website_url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Company Website"
                fullWidth
                placeholder="https://example.com"
                error={!!errors.website_url}
                helperText={errors.website_url?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="instagram_url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Instagram Profile"
                fullWidth
                placeholder="https://instagram.com/username"
                error={!!errors.instagram_url}
                helperText={errors.instagram_url?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="linkedin_url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="LinkedIn Company Page"
                fullWidth
                placeholder="https://linkedin.com/company/name"
                error={!!errors.linkedin_url}
                helperText={errors.linkedin_url?.message}
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
                label="Facebook Page"
                fullWidth
                placeholder="https://facebook.com/username"
                error={!!errors.facebook_url}
                helperText={errors.facebook_url?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default SocialLinksTab;
