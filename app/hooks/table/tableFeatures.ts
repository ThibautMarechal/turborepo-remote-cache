import { tableFeatures, rowSortingFeature } from '@tanstack/react-table';

// Sorting is always resolved server-side (see usePaginateSortingTable), so we
// only register rowSortingFeature for its column/header sort-state APIs -
// no sortedRowModel, the row model tanstack computes is just the core one.
export const appTableFeatures = tableFeatures({
  rowSortingFeature,
});

export type AppTableFeatures = typeof appTableFeatures;
