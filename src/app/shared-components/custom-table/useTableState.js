import { useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import {
  selectTableParams,
  setTablePage,
  setTablePageSize,
  setTableSearch,
  setTableSort,
  resetTable,
} from './tableSlice';

export function useTableState(tableId) {
  const dispatch = useDispatch();
  const params = useSelector(selectTableParams(tableId), shallowEqual);

  const setPage = useCallback(
    (page) => dispatch(setTablePage({ tableId, page })),
    [dispatch, tableId],
  );

  const setPageSize = useCallback(
    (pageSize) => dispatch(setTablePageSize({ tableId, pageSize })),
    [dispatch, tableId],
  );

  const setSearch = useCallback(
    (search) => dispatch(setTableSearch({ tableId, search })),
    [dispatch, tableId],
  );

  const setSort = useCallback(
    (sortBy, sortDir) => dispatch(setTableSort({ tableId, sortBy, sortDir })),
    [dispatch, tableId],
  );

  const reset = useCallback(() => dispatch(resetTable(tableId)), [dispatch, tableId]);

  return { params, setPage, setPageSize, setSearch, setSort, reset };
}
