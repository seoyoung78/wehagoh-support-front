import create from "zustand";
import { snackbarSlice } from "./snackbarSlice";
import { loadingSlice } from "./loadingSlice";
import { confirmSlice } from "./confirmSlice";
import { apiSlice } from "./apiSlice";
import { opnnSlice } from "./opnnSlice";
import { validSlice } from "./validSlice";

export const rootSlice = (set, get) => ({
  snackbar: snackbarSlice(set, get),
  loading: loadingSlice(set, get),
  confirm: confirmSlice(set, get),
  api: apiSlice(set, get),
  opnn: opnnSlice(set, get),
  valid: validSlice(set, get),
});

const useMSC100100Store = create(rootSlice);

export default useMSC100100Store;
