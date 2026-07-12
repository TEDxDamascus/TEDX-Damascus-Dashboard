import { Controller } from 'react-hook-form';
import { TextField, Grid, Box, Typography } from '@mui/material';
import { LocaleInput, localeInputTypes } from '../../../../shared-components/locale-input';

function SocialLinksTab({ control, errors }) {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" className="mb-2 text-gray-700 font-medium">
            Social Links
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Controller
            name="social_links.0"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Website URL"
                fullWidth
                placeholder="https://example.com"
                error={!!errors.social_links?.[0]}
                helperText={errors.social_links?.[0]?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} className="mt-4">
          <Typography variant="h6" className="mb-2 text-gray-700 font-medium">
            Contact Information
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="contact_info.email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email Address"
                fullWidth
                placeholder="info@example.com"
                error={!!errors.contact_info?.email}
                helperText={errors.contact_info?.email?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="contact_info.phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Phone Number"
                fullWidth
                placeholder="+963115554433"
                error={!!errors.contact_info?.phone}
                helperText={errors.contact_info?.phone?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="contact_info.address"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Address"
                error={!!errors.contact_info?.address}
                helperText={errors.contact_info?.address?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default SocialLinksTab;