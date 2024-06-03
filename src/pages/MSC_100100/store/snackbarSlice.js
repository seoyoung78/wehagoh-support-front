import Message from "components/Common/Message";

export const snackbarSlice = set => ({
  open: false,
  type: "success", // | "warning" | "error"
  message: "",
  cancelSuccess: () => {
    set(state => ({
      ...state,
      snackbar: {
        ...state.snackbar,
        open: true,
        type: "success",
        message: Message.cancelSuccess,
      },
    }));
  },
  saveSuccess: () => {
    set(state => ({
      ...state,
      snackbar: {
        ...state.snackbar,
        open: true,
        type: "success",
        message: Message.save,
      },
    }));
  },
  deleteSuccess: () => {
    set(state => ({
      ...state,
      snackbar: {
        ...state.snackbar,
        open: true,
        type: "success",
        message: Message.deleteSuccess,
      },
    }));
  },
  editSuccess: () => {
    set(state => ({
      ...state,
      snackbar: {
        ...state.snackbar,
        open: true,
        type: "success",
        message: Message.save,
      },
    }));
  },
  networkFail: () => {
    set(state => ({
      ...state,
      snackbar: {
        ...state.snackbar,
        open: true,
        type: "warning",
        message: Message.networkFail,
      },
    }));
  },
  close: () => {
    set(state => ({
      ...state,
      snackbar: {
        ...state.snackbar,
        open: false,
      },
    }));
  },
  copySuccess: () => {
    set(state => ({
      ...state,
      snackbar: {
        ...state.snackbar,
        open: true,
        type: "success",
        message: Message.copySuccess,
      },
    }));
  },
  maxLengthWarn: lim => {
    set(state => ({
      ...state,
      snackbar: {
        ...state.snackbar,
        open: true,
        type: "error",
        message: Message.MSC_100100_maxLengthError(lim),
      },
    }));
  },
  noTitle: () => {
    set(state => ({
      ...state,
      snackbar: {
        ...state.snackbar,
        open: true,
        type: "error",
        message: Message.MSC_100100_noTitle,
      },
    }));
  },
});
