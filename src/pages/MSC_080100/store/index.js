import create from "zustand";
import { apiSlice } from "./apiSlice";
import { gridSlice } from "./gridSlice";
import { loadingSlice } from "./loadingSlice";
import { snackbarSlice } from "./snackbarSlice";

const rootSlice = (set, get) => ({
  api: apiSlice(set, get),
  grid: gridSlice(set, get),
  loading: loadingSlice(set, get),
  snackbar: snackbarSlice(set, get),
});

export default create(rootSlice);
