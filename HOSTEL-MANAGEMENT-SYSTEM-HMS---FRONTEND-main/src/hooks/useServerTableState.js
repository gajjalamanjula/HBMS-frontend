import { useMemo, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

export function useServerTableState({
  initialPage = 0,
  initialSize = 10,
  initialSearch = '',
  initialFilters = {},
  searchDelay = 400,
  minSearchLength = 0,
} = {}) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState(initialFilters);

  const debouncedSearch = useDebouncedValue(search, searchDelay);
  const cleanSearch = String(debouncedSearch || '').trim();
  const canSearch = cleanSearch.length === 0 || cleanSearch.length >= minSearchLength;

  const params = useMemo(
    () => ({
      page,
      size,
      ...filters,
      search: cleanSearch || undefined,
    }),
    [page, size, filters, cleanSearch]
  );

  const updateSearch = (value) => {
    setSearch(value);
    setPage(initialPage);
  };

  const updateFilters = (value) => {
    setFilters(value);
    setPage(initialPage);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(initialPage);
  };

  const clearSearch = () => updateSearch('');
  const reset = () => {
    setPage(initialPage);
    setSize(initialSize);
    setSearch(initialSearch);
    setFilters(initialFilters);
  };

  return {
    page,
    setPage,
    size,
    setSize,
    search,
    setSearch: updateSearch,
    debouncedSearch: cleanSearch,
    filters,
    setFilters: updateFilters,
    updateFilter,
    clearSearch,
    reset,
    params,
    canSearch,
  };
}

export default useServerTableState;
