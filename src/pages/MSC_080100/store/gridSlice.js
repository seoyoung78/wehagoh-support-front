export const gridSlice = (set, get) => ({
  provider: null,
  gridView: null,
  setProvider: provider => {
    set(state => ({ ...state, grid: { ...state.grid, provider } }));
  },
  setGridView: gridView => {
    set(state => ({ ...state, grid: { ...state.grid, gridView } }));
  },
  clearRows: () => {
    get().grid.provider.clearRows();
  },
});
