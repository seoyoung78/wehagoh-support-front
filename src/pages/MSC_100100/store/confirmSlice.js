import Message from "components/Common/Message";

export const confirmSlice = (set, get) => ({
  open: false,
  title: "",
  message: "",
  useIconType: "question", // "warning" | "error" | "question" | "info"
  cancelEventHandler: () => {
    get().confirm.close();
  },
  confirmEventHandler: () => {
    get().confirm.close();
  },
  closeEventHandler: () => {
    get().confirm.close();
  },
  close: () => {
    set(state => ({
      ...state,
      confirm: {
        ...state.confirm,
        open: false,
      },
    }));
  },
  unsavedAlert: () =>
    new Promise(resolve => {
      set(state => ({
        ...state,
        confirm: {
          ...state.confirm,
          open: true,
          title: Message.MSC_100100_unsavedTitle,
          message: Message.MSC_100100_unsavedAlert,
          confirmEventHandler: () => {
            resolve(true);
            get().confirm.close();
          },
          cancelEventHandler: () => {
            resolve(false);
            get().confirm.close();
          },
        },
      }));
    }),
  /* TODO: 기획문의, 팝업에서 값 수정 후 닫기/다른소견 선택 할 시 confirm */
  popupChangedAlert: () =>
    new Promise(resolve => {
      set(state => ({
        ...state,
        confirm: {
          ...state.confirm,
          open: true,
          title: "소견 수정 중",
          message: "수정 중입니다. 이동하시겠습니까?",
          confirmEventHandler: () => {
            resolve(true);
            get().confirm.close();
          },
          cancelEventHandler: () => {
            resolve(false);
            get().confirm.close();
          },
        },
      }));
    }),
  saveQuestion: () =>
    new Promise(resolve => {
      set(state => ({
        ...state,
        confirm: {
          ...state.confirm,
          open: true,
          title: Message.MSC_100100_saveTitle,
          message: Message.saveConfirm,
          useIconType: "question",
          confirmEventHandler: () => {
            get().confirm.close();
            resolve(true);
          },
        },
      }));
    }),
  deleteQuestion: () =>
    new Promise(resolve => {
      set(state => ({
        ...state,
        confirm: {
          ...state.confirm,
          open: true,
          title: Message.MSC_100100_deleteTitle,
          message: Message.MSC_100100_deleteQuestion,
          useIconType: "question",
          confirmEventHandler: () => {
            resolve(true);
            get().confirm.close();
          },
        },
      }));
    }),
  cancelQuestion: () =>
    new Promise(resolve => {
      set(state => ({
        ...state,
        confirm: {
          ...state.confirm,
          open: true,
          title: Message.MSC_100100_cancelTitle,
          message: Message.cancelConfirm,
          useIconType: "question",
          confirmEventHandler: () => {
            resolve(true);
            get().snackbar.cancelSuccess();
            get().confirm.close();
          },
        },
      }));
    }),
});
