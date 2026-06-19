import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { debounce } from './autocompleteUtils';

const initialState = {
  byScope: {},
};

function ensureScope(state, scope) {
  if (!state.byScope[scope]) {
    state.byScope[scope] = {
      inputValue: '',
      options: [],
      loading: false,
      error: null,
    };
  }
}

const autocompleteSlice = createSlice({
  name: 'autocomplete',
  initialState,
  reducers: {
    setInputValue(state, { payload: { scope, value } }) {
      ensureScope(state, scope);
      state.byScope[scope].inputValue = value;
    },
    setOptions(state, { payload: { scope, options } }) {
      ensureScope(state, scope);
      state.byScope[scope].options = options ?? [];
      state.byScope[scope].loading = false;
      state.byScope[scope].error = null;
    },
    setLoading(state, { payload: { scope, loading } }) {
      ensureScope(state, scope);
      state.byScope[scope].loading = loading;
    },
    setError(state, { payload: { scope, error } }) {
      ensureScope(state, scope);
      state.byScope[scope].error = error;
      state.byScope[scope].loading = false;
    },
    resetScope(state, { payload: scope }) {
      if (state.byScope[scope]) {
        state.byScope[scope] = {
          inputValue: '',
          options: [],
          loading: false,
          error: null,
        };
      }
    },
  },
});

export const { setInputValue, setOptions, setLoading, setError, resetScope } =
  autocompleteSlice.actions;

export const fetchOptionsThunk = createAsyncThunk(
  'autocomplete/fetchOptions',
  async ({ scope, query, fetchOptionsFn }, { dispatch }) => {
    dispatch(setLoading({ scope, loading: true }));
    dispatch(setError({ scope, error: null }));
    try {
      const options = await fetchOptionsFn(query);
      dispatch(setOptions({ scope, options }));
    } catch (err) {
      const message = err?.message || err?.data?.message || 'Failed to load options';
      dispatch(setError({ scope, error: message }));
    }
  },
);

export function createDebouncedFetch(dispatch) {
  return debounce(({ scope, query, fetchOptionsFn }) => {
    dispatch(fetchOptionsThunk({ scope, query: query?.trim() ?? '', fetchOptionsFn }));
  }, 300);
}

export const selectAutocompleteScope = (scope) => (state) =>
  state.autocomplete?.byScope?.[scope] ?? {
    inputValue: '',
    options: [],
    loading: false,
    error: null,
  };

export default autocompleteSlice.reducer;
