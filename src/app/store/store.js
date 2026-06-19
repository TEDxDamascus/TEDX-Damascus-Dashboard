import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import apiService from './apiService';
import userReducer from '../auth/store/userSlice';
import localeReducer from './localeSlice';
import autocompleteReducer from '../shared-components/custom-autocomplete/autocompleteSlice';
import tableReducer from '../shared-components/custom-table/tableSlice';

export const store = configureStore({
  reducer: {
    [apiService.reducerPath]: apiService.reducer,
    user: userReducer,
    locale: localeReducer,
    autocomplete: autocompleteReducer,
    table: tableReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiService.middleware),
});

setupListeners(store.dispatch);
export default store;
