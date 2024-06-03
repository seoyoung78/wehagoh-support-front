import { lodash as _ } from "common-util/utils";

const initDgnsOpnnDetl = { exmn_opnn_titl: "", exmn_opnn_cnts: "", exmn_dvcd: "L" };
const initFnctOpnnDetl = { exmn_opnn_titl: "", exmn_opnn_cnts: "", exmn_dvcd: "F" };
const initImgnOpnnDetl = { exmn_opnn_titl: "", exmn_opnn_cnts: "", exmn_dvcd: "R" };
export const initGsspOpnnDetlObsrOpnnListItem = {
  exmn_opnn_detl_sqno: -1,
  obsr_opnn: null,
  obsr_opnn_site_1: [],
  obsr_opnn_cnts: "",
};
export const initGsspOpnnDetl = {
  // 검사소견마스터 테이블
  exmn_opnn_sqno: 0,
  exmn_opnn_titl: "",
  exmn_dvcd: "E",
  ends_exmn_dvcd: "S",

  // 내시경 상세 테이블
  obsr_opnn_list: [initGsspOpnnDetlObsrOpnnListItem],
  advc_matr: [],
  advc_matr_cnts: "",
  cncr_mdex_advc_matr: "",
};

export const initClnsOpnnDetl = {
  // 검사소견마스터 테이블
  exmn_opnn_sqno: 0,
  exmn_opnn_titl: "",
  exmn_dvcd: "E",
  ends_exmn_dvcd: "C",

  // 내시경 상세 테이블
  exmn_opnn_detl_sqno: -1,
  etnl_obsr_opnn: null,
  dre_opnn: null,
  obsr_opnn_cnts: "",
  obsr_opnn_site_2: "",
  rslt_opnn_1: null,
  rslt_opnn_2: null,
  rslt_opnn_3: null,
  advc_matr_cnts: "",
  cncr_mdex_advc_matr: "",
};
const initRhbtOpnnDetl = { exmn_opnn_titl: "", exmn_opnn_cnts: "", exmn_dvcd: "P" };

export const initTableState = {
  L: initDgnsOpnnDetl,
  F: initFnctOpnnDetl,
  R: initImgnOpnnDetl,
  S: initGsspOpnnDetl,
  C: initClnsOpnnDetl,
  P: initRhbtOpnnDetl,
};

export const opnnSlice = (set, get) => ({
  exmnDvcd: [],
  opnnMap: {},
  prevOpnn: initDgnsOpnnDetl,
  inputState: initDgnsOpnnDetl,
  selectedOpnnKey: "",
  opnnTree: [],
  isEditMode: false,
  tableType: "L",
  selectFieldCmcd: {
    gssp: {
      obsr_opnn_list: [], // { value: string | null, text: string }[]
      tisu_exmn_rslt_list: [],
      obsr_opnn_site_1: [],
      advc_matr_list: [],
    },
    clns: {
      etnl_obsr_opnn_list: [],
      dre_opnn_list: [],
      obsr_opnn_site_2: [],
      rslt_opnn_list: [],
    },
  },
  changeSelectItem: async key => {
    const { containsKeyOpnnMap, containsKeyTableState } = get().opnn;
    if (containsKeyOpnnMap(key)) {
      /* 소견 선택(카테고리X) */
      const { resultData } = await get().api.selectOpnn(key);
      const tableType = resultData.ends_exmn_dvcd ? resultData.ends_exmn_dvcd : resultData.exmn_dvcd;

      let inputState = resultData;
      if (tableType === "S") {
        inputState = {
          exmn_opnn_sqno: resultData.exmn_opnn_sqno,
          exmn_opnn_titl: resultData.exmn_opnn_titl,
          exmn_dvcd: resultData.exmn_dvcd,
          ends_exmn_dvcd: resultData.ends_exmn_dvcd,
          obsr_opnn_list: resultData.ends_detl_list.map(
            ({ exmn_opnn_detl_sqno, obsr_opnn, obsr_opnn_site_1, obsr_opnn_cnts }) => ({
              exmn_opnn_detl_sqno,
              obsr_opnn,
              obsr_opnn_site_1,
              obsr_opnn_cnts,
            }),
          ),
          advc_matr: resultData.ends_detl_list[0].advc_matr,
          advc_matr_cnts: resultData.ends_detl_list[0].advc_matr_cnts,
          cncr_mdex_advc_matr: resultData.ends_detl_list[0].cncr_mdex_advc_matr,
        };
      } else if (tableType === "C") {
        inputState = {
          exmn_opnn_sqno: resultData.exmn_opnn_sqno,
          exmn_opnn_titl: resultData.exmn_opnn_titl,
          exmn_dvcd: resultData.exmn_dvcd,
          ends_exmn_dvcd: resultData.ends_exmn_dvcd,

          // 내시경 상세 테이블
          exmn_opnn_detl_sqno: resultData.ends_detl_list[0].exmn_opnn_detl_sqno,
          etnl_obsr_opnn: resultData.ends_detl_list[0].etnl_obsr_opnn,
          dre_opnn: resultData.ends_detl_list[0].dre_opnn,
          obsr_opnn_cnts: resultData.ends_detl_list[0].obsr_opnn_cnts,
          obsr_opnn_site_2: resultData.ends_detl_list[0].obsr_opnn_site_2,
          rslt_opnn_1: resultData.ends_detl_list[0].rslt_opnn_1,
          rslt_opnn_2: resultData.ends_detl_list[0].rslt_opnn_2,
          rslt_opnn_3: resultData.ends_detl_list[0].rslt_opnn_3,
          advc_matr_cnts: resultData.ends_detl_list[0].advc_matr_cnts,
          cncr_mdex_advc_matr: resultData.ends_detl_list[0].cncr_mdex_advc_matr,
        };
      }

      if (resultData !== null) {
        /* 서버에러 시 resultData === null */
        set(state => ({
          ...state,
          opnn: {
            ...state.opnn,
            tableType,
            selectedOpnnKey: key,
            prevOpnn: inputState,
            inputState,
            isEditMode: true,
          },
        }));
      }
    } else if (containsKeyTableState(key)) {
      /* Category 선택하는 경우 */
      const init = initTableState[key];
      set(state => ({
        ...state,
        opnn: {
          ...state.opnn,
          selectedOpnnKey: key,
          prevOpnn: init,
          inputState: init,
          isEditMode: false,
          tableType: key,
        },
      }));
    }
  },
  isSameInput: () => {
    const { prevOpnn, inputState } = get().opnn;
    return _.isEqual(prevOpnn, inputState);
  },
  handleFormData: (key, value) => {
    set(state => ({
      ...state,
      opnn: {
        ...state.opnn,
        inputState: {
          ...state.opnn.inputState,
          [key]: value,
        },
      },
    }));
  },
  handleFormObsrOpnnList: (index, key, value) => {
    set(state => {
      const copyArr = [...state.opnn.inputState.obsr_opnn_list];
      const nextStateArr = copyArr.map((item, loopIndex) => {
        if (loopIndex === index) {
          return {
            ...item,
            [key]: value,
          };
        }
        return item;
      });
      return {
        ...state,
        opnn: {
          ...state.opnn,
          inputState: {
            ...state.opnn.inputState,
            obsr_opnn_list: nextStateArr,
          },
        },
      };
    });
  },
  handleAddObsrOpnnList: () => {
    const { inputState, handleFormData } = get().opnn;
    if (inputState.obsr_opnn_list.length >= 3) return;
    const nextObsrOpnnList = [...inputState.obsr_opnn_list, _.cloneDeep(initGsspOpnnDetlObsrOpnnListItem)];
    handleFormData("obsr_opnn_list", nextObsrOpnnList);
  },
  handleMinusObsrOpnnList: clickIndex => {
    const { inputState, handleFormData } = get().opnn;
    const nextObsrOpnnList = inputState.obsr_opnn_list.filter((_, filterIdx) => filterIdx !== clickIndex);
    handleFormData("obsr_opnn_list", nextObsrOpnnList);
  },
  clickNewButton: () => {
    const { tableType } = get().opnn;
    const init = initTableState[tableType];
    set(state => ({
      ...state,
      opnn: {
        ...state.opnn,
        prevOpnn: init,
        inputState: init,
        isEditMode: false,
      },
    }));
  },
  containsKeyTableState: key => Object.prototype.hasOwnProperty.call(initTableState, key),
  containsKeyOpnnMap: key => {
    const { opnnMap } = get().opnn;
    return Object.prototype.hasOwnProperty.call(opnnMap, key);
  },
  isEnds: () => {
    const { tableType } = get().opnn;
    return tableType === "S" || tableType === "C";
  },
  getInitTableState: () => {
    const { tableType } = get().opnn;
    return initTableState[tableType];
  },
  initialize: () => {
    set(state => ({
      ...state,
      opnn: {
        ...state.opnn,
        opnnTree: [],
      },
    }));
  },
});
