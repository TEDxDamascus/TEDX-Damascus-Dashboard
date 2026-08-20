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
                label="Organizer Name"
                required
                error={!!errors.name}
                helperText={errors.name?.en?.message || errors.name?.ar?.message}
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
                label="Organizer Photo"
                required
                error={!!errors.image}
                helperText={errors.image?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Role"
                required
                fullWidth
                error={!!errors.role}
                helperText={errors.role?.message}
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
                label="Bio"
                required
                minRows={4}
                error={!!errors.bio}
                helperText={errors.bio?.en?.message || errors.bio?.ar?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BasicInfoTab;
