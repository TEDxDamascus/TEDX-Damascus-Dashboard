import { createSlice } from '@reduxjs/toolkit';

const LOCALE_STORAGE_KEY = 'tedx_locale';

const getStoredLocale = () => {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {
    /* storage unavailable */
  }
  return 'en';
};

const initialState = {
  locale: getStoredLocale(),
};

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLocale: (state, action) => {
      const locale = action.payload;
      if (locale !== 'ar' && locale !== 'en') return;
      state.locale = locale;
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      } catch {
        /* storage unavailable */
      }
    },
  },
});

export const { setLocale } = localeSlice.actions;
export const selectLocale = (state) => state.locale.locale;
export default localeSlice.reducer;
