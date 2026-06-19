/**
 * LocaleInput – two fields side by side (English | Arabic); value shape { ar, en }.
 * Use with React Hook Form via Controller.
 */
import { TextField, Box, Grid } from '@mui/material';
import { localeInputTypes, ensureLocaleValue } from './utils';
import { fieldLabels } from './translations';

export default function LocaleInput({
  value,
  onChange,
  type = localeInputTypes.textField,
  label,
  error,
  helperText,
  required,
  disabled,
  minRows,
  maxRows,
  placeholder,
  ...rest
}) {
  const localeValue = ensureLocaleValue(value);

  const handleChange = (locale) => (e) => {
    onChange?.({ ...localeValue, [locale]: e.target.value });
  };

  const isMultiline = type === localeInputTypes.textFieldMultiple;
  const isEditor = type === localeInputTypes.editor;
  const multiline = isMultiline || isEditor;
  const rows = multiline ? (minRows ?? 3) : undefined;
  const maxRowsCount = isEditor ? (maxRows ?? 12) : undefined;

  const sharedProps = {
    fullWidth: true,
    disabled,
    multiline,
    minRows: rows,
    maxRows: maxRowsCount,
    error: !!error,
    placeholder,
  };

  return (
    <Box sx={{ width: '100%' }} {...rest}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            {...sharedProps}
            label={label ? `${label} (${fieldLabels.en})` : fieldLabels.en}
            value={localeValue.en ?? ''}
            onChange={handleChange('en')}
            required={required}
            inputProps={{ 'aria-label': `${label || 'Input'} - ${fieldLabels.en}`, dir: 'ltr' }}
            sx={{ '& .MuiInputBase-input': { direction: 'ltr' } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            {...sharedProps}
            label={label ? `${label} (${fieldLabels.ar})` : fieldLabels.ar}
            value={localeValue.ar ?? ''}
            onChange={handleChange('ar')}
            inputProps={{ 'aria-label': `${label || 'Input'} - ${fieldLabels.ar}`, dir: 'rtl' }}
            sx={{ '& .MuiInputBase-input': { direction: 'rtl' } }}
          />
        </Grid>
      </Grid>
      {helperText && error && (
        <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, mx: 1.5 }}>{helperText}</Box>
      )}
    </Box>
  );
}
