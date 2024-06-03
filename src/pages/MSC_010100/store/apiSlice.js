import moment from "moment";
import { ErrorLogInfo } from "cliniccommon-ui";
import callApi from "services/apis";

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
      // useLoadingProgress && get().loading.open();
      response = await request();

      if (Object.prototype.hasOwnProperty.call(codeHandlers, response.resultCode)) {
        /* codeHandlers 에 resultCode 에 맞는 핸들러가 있는 경우 */
        codeHandlers[response.resultCode](response);
      } else if (response.resultCode >= 400) {
        /* resultCode 가 400 이상이면서 codeHandlers 에 등록된 핸들러가 없는 경우 */
        throw new Error("apiSlice Error", { cause: response });
      } else {
        defaultHandler && get().grid && defaultHandler(response);
      }
    } catch (error) {
      /* default error handler */
      console.error(error);
      errorHandler && errorHandler(response);
      if (!errorHandler) {
        throw new Error("No ErrorHandler - apiSlice");
      }
    } finally {
      // useLoadingProgress && get().loading.close();
    }
    return response;
  },
  getCommonCode: () => {
    const param = {
      clsfList: [`CS1008`],
      date: moment().format("YYYY-MM-DD"),
    };
    return new Promise(resolve => {
      get().api.fetch({
        request: () => callApi(`/common/selectCommonCode`, param),
        defaultHandler: ({ resultData }) => {
          const normalized = resultData.reduce((acc, el) => {
            acc[el.cmcd_cd] = el;
            return acc;
          }, {});
          set(state => ({
            ...state,
            grid: {
              ...state.grid,
              exmnState: Object.entries(state.grid.exmnState).reduce((acc, [key, value]) => {
                acc[key] = {
                  ...value,
                  btnSet: value.btnCmcdList.map(btnCmcd => {
                    if (btnCmcd === 0 || btnCmcd === "0")
                      return {
                        name: "전체",
                        color: "#FFFFFF",
                        code: "0",
                        count: 0,
                      };
                    return {
                      name: key === "R" && normalized[btnCmcd].cmcd_cd === "M" ? "판독중" : normalized[btnCmcd].cmcd_nm,
                      color: normalized[btnCmcd].cmcd_char_valu1,
                      code: normalized[btnCmcd].cmcd_cd,
                      count: 0,
                    };
                  }),
                };
                return acc;
              }, {}),
            },
          }));

          resolve(resultData);
        },
        errorHandler: () => {
          ErrorLogInfo();
        },
      });
    });
  },
  selectPatient: param =>
    get().api.fetch({
      request: () =>
        callApi(`/MSC_010100/patient`, { ...param, prsc_date: moment(param.prsc_date).format("YYYY-MM-DD") }),
      defaultHandler: ({ resultData }) => {
        if (resultData.length === 0) {
          get().snackbar.noData();
        }
        const normalized = resultData.reduce((acc, el) => {
          if (Object.prototype.hasOwnProperty.call(acc, el.exrm_clsf_cd)) {
            acc[el.exrm_clsf_cd].push(el);
          } else {
            acc[el.exrm_clsf_cd] = [el];
          }
          return acc;
        }, {});
        Promise.resolve(
          set(state => ({
            ...state,
            grid: {
              ...state.grid,
              exmnState: Object.entries(state.grid.exmnState).reduce((acc, [key, value]) => {
                acc[key] = {
                  ...value,
                  data: normalized[key],
                  btnSet: value.btnSet.map(btn => ({
                    ...btn,
                    count:
                      btn.code === 0 || btn.code === "0"
                        ? (normalized[key] ?? []).length
                        : (normalized[key] ?? []).filter(item => item.prsc_prgr_stat_cd === btn.code).length,
                  })),
                };
                return acc;
              }, {}),
            },
          })),
        ).then(get().grid?.setRows());
      },
    }),
});
