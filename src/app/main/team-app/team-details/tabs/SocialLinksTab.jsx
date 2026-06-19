import { Controller } from 'react-hook-form';
import { TextField, Grid, Box } from '@mui/material';

function SocialLinksTab({ control, errors }) {
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
      </Grid>
    </Box>
  );
}

export default SocialLinksTab;
