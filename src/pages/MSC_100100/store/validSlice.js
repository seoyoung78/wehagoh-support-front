// import { lodash as _ } from "common-util/utils";
// import { initGsspOpnnDetlObsrOpnnListItem } from "./opnnSlice";

const validTable = {
  L: {
    exmn_opnn_titl: inputState => inputState && !!inputState.exmn_opnn_titl && inputState.exmn_opnn_titl.length <= 100,
    // exmn_opnn_cnts: inputState => inputState && !!inputState.exmn_opnn_cnts,
  },
  F: {
    exmn_opnn_titl: inputState => inputState && !!inputState.exmn_opnn_titl && inputState.exmn_opnn_titl.length <= 100,
    // exmn_opnn_cnts: inputState => inputState && !!inputState.exmn_opnn_cnts,
  },
  R: {
    exmn_opnn_titl: inputState => inputState && !!inputState.exmn_opnn_titl && inputState.exmn_opnn_titl.length <= 100,
    // exmn_opnn_cnts: inputState => inputState && !!inputState.exmn_opnn_cnts,
  },
  S: {
    exmn_opnn_titl: inputState => inputState && !!inputState.exmn_opnn_titl && inputState.exmn_opnn_titl.length <= 100,
    // obsr_opnn_list: inputState =>
    // inputState && !inputState.obsr_opnn_list.every(listItem => _.isEqual(listItem, initGsspOpnnDetlObsrOpnnListItem)),
  },
  C: {
    exmn_opnn_titl: inputState => inputState && !!inputState.exmn_opnn_titl && inputState.exmn_opnn_titl.length <= 100,
    // obsr_opnn_list: inputState =>
    // inputState &&
    // ((inputState.obsr_opnn_list[0].obsr_opnn_cnts && inputState.obsr_opnn_list[0].obsr_opnn_cnts !== "") ||
    // inputState.obsr_opnn_list[0].obsr_opnn_site_2.length > 0),
  },
  P: {
    exmn_opnn_titl: inputState => inputState && !!inputState.exmn_opnn_titl && inputState.exmn_opnn_titl.length <= 100,
    // exmn_opnn_cnts: inputState => inputState && !!inputState.exmn_opnn_cnts,
  },
};

export const validSlice = (set, get) => ({
  isValid: key => {
    const { inputState, tableType } = get().opnn;
    if (
      Object.prototype.hasOwnProperty.call(validTable, tableType) &&
      Object.prototype.hasOwnProperty.call(validTable[tableType], key)
    ) {
      return validTable[tableType][key](inputState);
    }
    return false;
  },
  validAll: () => {
    const { tableType } = get().opnn;
    const { isValid } = get().valid;
    return Object.keys(validTable[tableType]).every(key => isValid(key));
  },
});
