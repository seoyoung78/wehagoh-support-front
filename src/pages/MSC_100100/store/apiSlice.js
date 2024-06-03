import callApi from "services/apis";
import { ErrorLogInfo } from "cliniccommon-ui";
import IconFolderClose from "assets/imgs/ic_folder_close.png";
import IconFolderOpen from "assets/imgs/ic_folder_open.png";
import IconNote from "assets/imgs/ic_note_m_over.png";
import moment from "moment";
import { lodash as _ } from "common-util/utils";
import { initGsspOpnnDetlObsrOpnnListItem } from "./opnnSlice";

export const apiSlice = (set, get) => ({
  fetch: async ({
    request,
    errorHandler = () => get().snackbar.networkFail(),
    defaultHandler,
    codeHandlers = {},
    useLoadingProgress = false,
  }) => {
    let response = { resultData: null, resultCode: 0, resultMsg: "" };
    try {
      useLoadingProgress && get().loading.open();
      response = await request();

      if (Object.prototype.hasOwnProperty.call(codeHandlers, response.resultCode)) {
        /* codeHandlers 에 resultCode 에 맞는 핸들러가 있는 경우 */
        codeHandlers[response.resultCode](response);
      } else if (response.resultCode >= 400) {
        /* resultCode 가 400 이상이면서 codeHandlers 에 등록된 핸들러가 없는 경우 */
        throw new Error("apiSlice Error", { cause: response });
      } else {
        defaultHandler && defaultHandler(response);
      }
    } catch (error) {
      /* default error handler */
      console.error(error);
      errorHandler && errorHandler(response);
      if (!errorHandler) {
        throw new Error("No Error Handler - apiSlice");
      }
    } finally {
      useLoadingProgress && get().loading.close();
    }
    return response;
  },
  searchOpnn: (keyword, opnnType = null) =>
    get().api.fetch({
      request: () => callApi(`/MSC_100100/searchOpnn`, { keyword, opnnType }),
    }),
  selectOpnnList: ({ initialFetch = false } = {}) =>
    get().api.fetch({
      /* 검사구분코드와 소견 데이터 목록을 가져온다. */
      request: () => Promise.all([callApi("/MSC_100100/exmnDvcd"), callApi("/MSC_100100/opnnList")]),
      defaultHandler: ([{ resultData: exmnDvcd }, { resultData: opnnList }]) => {
        const opnnMap = opnnList.reduce((acc, el) => {
          acc[el.exmn_opnn_sqno] = el;
          return acc;
        }, {});

        const root = {
          key: "exmnOpnn",
          labelText: "검사소견",
          collapsed: false,
          icon: {
            normal: {
              open: <img className="icon" src={IconFolderOpen} alt="open" />,
              close: <img className="icon" src={IconFolderClose} alt="close" />,
            },
          },
        };

        const exmnDvcdTreeList = exmnDvcd.map(item => ({
          key: item.cmcd_cd,
          labelText: item.parent === "E" ? `${item.cmcd_nm} 내시경` : item.cmcd_nm,
          parentKey: item.parent ?? root.key,
          collapsed: false,
          icon: {
            normal: {
              open: <img className="icon" src={IconFolderOpen} alt="open" />,
              close: <img className="icon" src={IconFolderClose} alt="close" />,
            },
          },
        }));

        const opnnTreeList = Object.values(opnnMap).map(item => ({
          key: item.exmn_opnn_sqno,
          labelText: item.exmn_opnn_titl,
          parentKey: item.exmn_dvcd === "E" ? item.ends_exmn_dvcd : item.exmn_dvcd,
          collapsed: false,
          icon: {
            normal: {
              open: <img className="icon" src={IconNote} alt="open" />,
              close: <img className="icon" src={IconNote} alt="close" />,
            },
          },
        }));
        set(state => ({
          ...state,
          opnn: {
            ...state.opnn,
            exmnDvcd,
            opnnMap,
            opnnTree: [root, ...exmnDvcdTreeList, ...opnnTreeList],
          },
        }));
      },
      errorHandler: () => {
        initialFetch ? ErrorLogInfo() : get().snackbar.networkFail();
      },
    }),
  selectOpnn: selectedOpnnKey => {
    const { opnnMap, containsKeyOpnnMap } = get().opnn;
    if (containsKeyOpnnMap(selectedOpnnKey)) {
      const exmnDvcd = opnnMap[selectedOpnnKey].exmn_dvcd;
      return get().api.fetch({
        request:
          exmnDvcd === "E"
            ? () => callApi(`/MSC_100100/ends/${selectedOpnnKey}`)
            : () => callApi(`/MSC_100100/opnn/${selectedOpnnKey}`),
      });
    }
  },
  saveOpnn: () => {
    const { inputState, tableType } = get().opnn;
    let param = inputState;
    if (tableType === "S") {
      param = {
        ...inputState,
        obsr_opnn_list: inputState.obsr_opnn_list.filter(item => !_.isEqual(item, initGsspOpnnDetlObsrOpnnListItem)),
      };
    }

    let url = "/MSC_100100/saveExmnOpnn";
    if (tableType === "S") {
      url = "/MSC_100100/saveGsspOpnn";
    } else if (tableType === "C") {
      url = "/MSC_100100/saveClnsOpnn";
    }

    return new Promise(resolve => {
      get().api.fetch({
        request: () => callApi(url, param),
        defaultHandler: async ({ resultData }) => {
          const nextSqno = resultData;
          await get().api.selectOpnnList();
          get().snackbar.saveSuccess();
          resolve(nextSqno);
        },
      });
    });
  },

  deleteOpnn: () => {
    const { selectedOpnnKey, getInitTableState, isEnds } = get().opnn;
    const initInputState = getInitTableState();
    return get().api.fetch({
      request: () =>
        isEnds()
          ? callApi(`/MSC_100100/deleteEndsOpnn/${selectedOpnnKey}`)
          : callApi(`/MSC_100100/deleteExmnOpnn/${selectedOpnnKey}`),
      defaultHandler: async () => {
        get().snackbar.deleteSuccess();
        await get().api.selectOpnnList();
        const categorySelectedOpnnKey = initInputState.ends_exmn_dvcd ?? initInputState.exmn_dvcd;
        set(state => ({
          ...state,
          opnn: {
            ...state.opnn,
            selectedOpnnKey: categorySelectedOpnnKey,
            prevOpnn: initInputState,
            inputState: initInputState,
            isEditMode: false,
          },
        }));
      },
    });
  },
  editOpnn: () => {
    const { inputState, tableType } = get().opnn;
    const selectedOpnnKey = inputState.exmn_opnn_sqno;

    let param = inputState;
    if (tableType === "S") {
      param = {
        ...inputState,
        obsr_opnn_list: inputState.obsr_opnn_list.filter(item => !_.isEqual(item, initGsspOpnnDetlObsrOpnnListItem)),
      };
    }

    let url = `/MSC_100100/editExmnOpnn/${selectedOpnnKey}`;
    if (tableType === "S") {
      url = `/MSC_100100/editGsspOpnn/${selectedOpnnKey}`;
    } else if (tableType === "C") {
      url = `/MSC_100100/editClnsOpnn/${selectedOpnnKey}`;
    }

    return new Promise(resolve => {
      get().api.fetch({
        request: () => callApi(url, param),
        defaultHandler: () => {
          get().snackbar.editSuccess();
          get().api.selectOpnnList();
          resolve(selectedOpnnKey);
        },
      });
    });
  },
  getSelectFieldCmcd: ({ initialFetch = false } = {}) => {
    const codeResponseHandler = {
      CS7002: {
        name: "obsr_opnn_site_1",
        category: "gssp",
        handler: el => ({ value: el.cmcd_cd, text: el.cmcd_nm }),
      },
      CS7010: {
        name: "advc_matr_list",
        category: "gssp",
        handler: el => ({ value: el.cmcd_cd, text: el.cmcd_nm }),
      },
      CS7019: {
        name: "obsr_opnn_list",
        category: "gssp",
        handler: el => ({ value: el.cmcd_cd, text: el.cmcd_nm }),
      },
      CS7011: {
        name: "etnl_obsr_opnn_list",
        category: "clns",
        handler: el => ({ value: el.cmcd_cd, text: el.cmcd_nm }),
      },
      CS7012: {
        name: "dre_opnn_list",
        category: "clns",
        handler: el => ({ value: el.cmcd_cd, text: el.cmcd_nm }),
      },
      CS7013: {
        name: "obsr_opnn_site_2",
        category: "clns",
        handler: el => ({ value: el.cmcd_cd, text: el.cmcd_nm }),
      },
      CS7015: {
        name: "rslt_opnn_list",
        category: "clns",
        handler: el => ({ value: el.cmcd_cd, text: el.cmcd_nm }),
      },
    };
    const param = {
      clsfList: Object.keys(codeResponseHandler),
      date: moment().format("YYYY-MM-DD"),
    };
    return get().api.fetch({
      request: () => callApi(`/common/selectCommonCode`, param),
      defaultHandler: ({ resultData }) => {
        const selectFieldCmcd = resultData.reduce((acc, el) => {
          if (!Object.prototype.hasOwnProperty.call(codeResponseHandler, el.cmcd_clsf_cd)) {
            console.error("공통코드 요청/응답 에러", codeResponseHandler, el);
            return acc;
          }
          const { category, name, handler } = codeResponseHandler[el.cmcd_clsf_cd];
          if (!Object.prototype.hasOwnProperty.call(acc, category)) {
            acc[category] = {};
          }
          if (Object.prototype.hasOwnProperty.call(acc[category], name)) {
            acc[category][name].push(handler(el));
          } else {
            acc[category][name] = [handler(el)];
          }
          return acc;
        }, {}); // sorted response
        set(state => ({
          ...state,
          opnn: {
            ...state.opnn,
            selectFieldCmcd,
          },
        }));
      },
      errorHandler: () => {
        initialFetch ? ErrorLogInfo() : get().snackbar.networkFail();
      },
    });
  },
});
