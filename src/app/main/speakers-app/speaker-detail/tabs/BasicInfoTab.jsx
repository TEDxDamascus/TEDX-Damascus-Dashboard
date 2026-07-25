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
                label="Full Name"
                required
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="speaker_image"
            control={control}
            render={({ field }) => (
              <ImagePickerField
                value={field.value}
                onChange={field.onChange}
                label="Speaker Photo"
                required
                error={!!errors.speaker_image}
                helperText={errors.speaker_image?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Phone"
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Short Bio"
                minRows={3}
                error={!!errors.bio}
                helperText={errors.bio?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="experience"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Experience"
                minRows={3}
                error={!!errors.experience}
                helperText={errors.experience?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="brief"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Brief"
                minRows={3}
                error={!!errors.brief}
                helperText={errors.brief?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Full Description"
                minRows={4}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BasicInfoTab;
