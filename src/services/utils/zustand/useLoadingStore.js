import create from "zustand";

const useLoadingStore = create(set => ({
  loading: false,
  message: "",
  openLoading: msg => set(() => ({ loading: true, message: msg || "" })),
  closeLoading: () => set(() => ({ loading: false, message: "" })),
}));

export default useLoadingStore;
