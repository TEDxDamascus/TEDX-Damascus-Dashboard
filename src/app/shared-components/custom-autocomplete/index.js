export { default as CustomAutocomplete } from './CustomAutocomplete';
export {
  debounce,
  getOptionLabel,
  isOptionEqualToValue,
  normalizeOption,
} from './autocompleteUtils';
export {
  selectAutocompleteScope,
  setInputValue,
  setOptions,
  setLoading,
  setError,
  resetScope,
  fetchOptionsThunk,
  createDebouncedFetch,
} from './autocompleteSlice';
