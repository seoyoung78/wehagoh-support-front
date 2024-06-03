import Message from "components/Common/Message";

export const loadingSlice = set => ({
  visible: false,
  innerText: Message.loading,
  open: (message = Message.loading) => {
    set(state => ({ ...state, loading: { ...state.loading, visible: true, innerText: message } }));
  },
  close: () => {
    set(state => ({ ...state, loading: { ...state.loading, visible: false } }));
  },
});
