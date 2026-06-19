import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import { selectAutocompleteScope, setInputValue, createDebouncedFetch } from './autocompleteSlice';
import { getOptionLabel, isOptionEqualToValue } from './autocompleteUtils';

function CustomAutocomplete({
  scope,
  fetchOptions,
  multiple = false,
  label,
  placeholder,
  helperText,
  error: externalError,
  value,
  onChange,
  getOptionLabel: customGetOptionLabel,
  isOptionEqualToValue: customIsOptionEqualToValue,
  disabled,
  required,
  ...rest
}) {
  const dispatch = useDispatch();
  const {
    inputValue,
    options,
    loading,
    error: scopeError,
  } = useSelector(selectAutocompleteScope(scope));
  const debouncedFetchRef = useRef(null);

  if (!debouncedFetchRef.current) {
    debouncedFetchRef.current = createDebouncedFetch(dispatch);
  }
  const debouncedFetch = debouncedFetchRef.current;

  useEffect(() => {
    if (inputValue !== undefined && inputValue !== null && fetchOptions) {
      debouncedFetch({ scope, query: inputValue, fetchOptionsFn: fetchOptions });
    }
  }, [inputValue, scope, fetchOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (event, newInputValue) => {
    dispatch(setInputValue({ scope, value: newInputValue }));
  };

  const getLabel = customGetOptionLabel ?? getOptionLabel;
  const isEqual = customIsOptionEqualToValue ?? isOptionEqualToValue;
  const hasError = !!externalError || !!scopeError;

  const valueArr = multiple && Array.isArray(value) ? value : value ? [value] : [];
  const valueIds = new Set(valueArr.map((v) => v?.id ?? v?.value).filter(Boolean));
  const optionsWithValue = [
    ...valueArr.filter(Boolean),
    ...options.filter((o) => !valueIds.has(o?.id ?? o?.value)),
  ];

  // Prefer label from loaded options so pre-selected IDs display as names
  const enrichedValue = multiple
    ? valueArr.map((v) => (v ? (options.find((o) => isEqual(o, v)) ?? v) : v))
    : value
      ? (options.find((o) => isEqual(o, value)) ?? value)
      : null;

  const errorMessage =
    scopeError ||
    (externalError?.message ?? (typeof externalError === 'string' ? externalError : null));
  const displayHelperText = errorMessage || helperText;

  return (
    <Box>
      <Autocomplete
        multiple={multiple}
        value={enrichedValue ?? (multiple ? [] : null)}
        onChange={(event, newValue) => onChange?.(newValue)}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        options={optionsWithValue}
        loading={loading}
        getOptionLabel={getLabel}
        isOptionEqualToValue={isEqual}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required={required}
            error={hasError}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        noOptionsText={loading ? 'Loading...' : 'No results'}
        {...rest}
      />
      {displayHelperText && (
        <FormHelperText error={hasError} sx={{ mt: 0.5, mx: 1.75 }}>
          {displayHelperText}
        </FormHelperText>
      )}
    </Box>
  );
}

export default CustomAutocomplete;
