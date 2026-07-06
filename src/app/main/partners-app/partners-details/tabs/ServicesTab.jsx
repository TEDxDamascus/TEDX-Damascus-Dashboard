import { useFieldArray, Controller } from 'react-hook-form';
import { TextField, Grid, Box, Button, IconButton, Typography, Paper } from '@mui/material';
import { DeleteOutline, Add } from '@mui/icons-material';
import { LocaleInput, localeInputTypes, defaultLocaleValue } from '../../../../shared-components/locale-input';

function ServicesTab({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box className="mb-4 flex items-center justify-between">
        <Typography variant="h6" className="text-gray-700 font-medium">
          Provided Services ({fields.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => append({ title: '', description: defaultLocaleValue() })}
          sx={{
            borderColor: 'var(--color-primary)',
            color: 'var(--color-primary)',
            '&:hover': { borderColor: 'var(--color-primary-dark)' },
          }}
        >
          Add Service
        </Button>
      </Box>

      {fields.length === 0 ? (
        <Box className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
          No services added yet. Click "Add Service" to add partner services.
        </Box>
      ) : (
        <Grid container spacing={3}>
          {fields.map((field, index) => (
            <Grid item xs={12} key={field.id}>
              <Paper variant="outlined" sx={{ p: 3, position: 'relative', bgcolor: '#fafafa' }}>
                <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                  <IconButton color="error" onClick={() => remove(index)}>
                    <DeleteOutline />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      {...register(`services.${index}.title`)}
                      label={`Service #${index + 1} Title`}
                      fullWidth
                      error={!!errors.services?.[index]?.title}
                      helperText={errors.services?.[index]?.title?.message}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name={`services.${index}.description`}
                      control={control}
                      render={({ field: inputField }) => (
                        <LocaleInput
                          {...inputField}
                          type={localeInputTypes.textFieldMultiple}
                          label="Service Description"
                          minRows={2}
                          error={!!errors.services?.[index]?.description}
                          helperText={errors.services?.[index]?.description?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default ServicesTab;