import create from "zustand";
import { apiSlice } from "./apiSlice";
import { snackbarSlice } from "./snackbarSlice";
import { gridSlice } from "./gridSlice";

const store = create((set, get) => ({
  snackbar: snackbarSlice(set, get),
  grid: gridSlice(set, get),
  api: apiSlice(set, get),
}));

export default store;
