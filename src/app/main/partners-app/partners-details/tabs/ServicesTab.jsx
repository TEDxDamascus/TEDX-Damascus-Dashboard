import { useFieldArray, Controller } from 'react-hook-form';
import { Grid, Box, Button, IconButton, Typography, Paper } from '@mui/material';
import { DeleteOutline, Add } from '@mui/icons-material';
import {
  LocaleInput,
  localeInputTypes,
  defaultLocaleValue,
} from '../../../../shared-components/locale-input';

function ServicesTab({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box className="mb-4 flex items-center justify-between">
        <Typography variant="h6" className="font-medium text-gray-700">
          Provided Services ({fields.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => append({ title: defaultLocaleValue(), description: defaultLocaleValue() })}
          sx={{
            borderColor: 'var(--color-primary)',
            color: 'var(--color-primary)',
            '&:hover': { borderColor: 'var(--color-primary-dark)' },
          }}
        >
          Add Service
        </Button>
      </Box>

      {errors.services?.message && (
        <Typography variant="body2" className="mb-3 text-red-500">
          {errors.services.message}
        </Typography>
      )}

      {fields.length === 0 ? (
        <Box className="rounded-lg border-2 border-dashed border-red-200 p-8 text-center text-gray-400">
          At least one service is required. Click "Add Service" to add one.
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
                    <Controller
                      name={`services.${index}.title`}
                      control={control}
                      render={({ field: inputField }) => (
                        <LocaleInput
                          {...inputField}
                          type={localeInputTypes.textField}
                          label={`Service #${index + 1} Title`}
                          error={!!errors.services?.[index]?.title}
                          helperText={
                            errors.services?.[index]?.title?.en?.message ||
                            errors.services?.[index]?.title?.ar?.message
                          }
                        />
                      )}
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
                          helperText={
                            errors.services?.[index]?.description?.en?.message ||
                            errors.services?.[index]?.description?.ar?.message
                          }
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
