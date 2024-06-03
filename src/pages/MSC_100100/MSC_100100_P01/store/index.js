import create from "zustand";
import { rootSlice } from "pages/MSC_100100/store";
import { initTableState } from "pages/MSC_100100/store/opnnSlice";

const popupSlice = (set, get) => ({
  initialize: ({ opnnType }) => {
    set(state => ({
      ...state,
      popup: {
        ...state.popup,
      },
      opnn: {
        ...state.opnn,
        selectedOpnnKey: opnnType,
        prevOpnn: initTableState[opnnType],
        inputState: initTableState[opnnType],
        tableType: opnnType,
      },
    }));
  },
});

const useMSC100100P01Store = create((set, get) => ({
  ...rootSlice(set, get),
  popup: popupSlice(set, get),
}));

export default useMSC100100P01Store;
