import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_PARAMS = {
  page: 1,
  pageSize: 10,
  search: '',
  sortBy: null,
  sortDir: 'asc',
};

const tableSlice = createSlice({
  name: 'table',
  initialState: { tables: {} },
  reducers: {
    setTablePage(state, { payload: { tableId, page } }) {
      if (!state.tables[tableId]) state.tables[tableId] = { ...DEFAULT_PARAMS };
      state.tables[tableId].page = page;
    },
    setTablePageSize(state, { payload: { tableId, pageSize } }) {
      if (!state.tables[tableId]) state.tables[tableId] = { ...DEFAULT_PARAMS };
      state.tables[tableId].pageSize = pageSize;
      state.tables[tableId].page = 1;
    },
    setTableSearch(state, { payload: { tableId, search } }) {
      if (!state.tables[tableId]) state.tables[tableId] = { ...DEFAULT_PARAMS };
      state.tables[tableId].search = search;
      state.tables[tableId].page = 1;
    },
    setTableSort(state, { payload: { tableId, sortBy, sortDir } }) {
      if (!state.tables[tableId]) state.tables[tableId] = { ...DEFAULT_PARAMS };
      state.tables[tableId].sortBy = sortBy;
      state.tables[tableId].sortDir = sortDir;
      state.tables[tableId].page = 1;
    },
    resetTable(state, { payload: tableId }) {
      state.tables[tableId] = { ...DEFAULT_PARAMS };
    },
  },
});

export const { setTablePage, setTablePageSize, setTableSearch, setTableSort, resetTable } =
  tableSlice.actions;

export const selectTableParams = (tableId) => (state) => ({
  ...DEFAULT_PARAMS,
  ...(state.table?.tables[tableId] ?? {}),
});

export default tableSlice.reducer;
