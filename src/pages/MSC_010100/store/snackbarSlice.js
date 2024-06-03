import Message from "components/Common/Message";

export const snackbarSlice = set => ({
  message: "",
  isOpen: false,
  type: "warning",
  close: () => {
    set(state => ({
      ...state,
      snackbar: {
        ...state.snackbar,
        isOpen: false,
      },
    }));
  },
  noData: () => {
    set(state => ({
      ...state,
      snackbar: {
        ...state.snackbar,
        isOpen: true,
        message: Message.noSearch,
        type: "info",
      },
    }));
  },
  networkFail: () => {
    set(state => ({
      ...state,
      snackbar: {
        ...state.snackbar,
        isOpen: true,
        message: Message.networkFail,
        type: "error",
      },
    }));
  },
});
