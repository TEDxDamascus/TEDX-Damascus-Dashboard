import { Controller } from 'react-hook-form';
import { TextField, Grid, Box } from '@mui/material';
import { LocaleInput, localeInputTypes } from '../../../../shared-components/locale-input';
import { ImagePickerField } from '../../../../shared-components/image-picker';

function BasicInfoTab({ control, errors }) {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Partner Name"
                required
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Slug"
                error={!!errors.slug}
                helperText={errors.slug?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ImagePickerField
                value={field.value}
                onChange={field.onChange}
                label="Partner Logo / Image"
                required
                error={!!errors.image}
                helperText={errors.image?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="partnership_type"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Partnership Type (e.g. Gold, Silver)"
                fullWidth
                required
                error={!!errors.partnership_type}
                helperText={errors.partnership_type?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="short_description"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Short Description"
                minRows={2}
                error={!!errors.short_description}
                helperText={errors.short_description?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="long_description"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Long Description"
                minRows={4}
                error={!!errors.long_description}
                helperText={errors.long_description?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BasicInfoTab;