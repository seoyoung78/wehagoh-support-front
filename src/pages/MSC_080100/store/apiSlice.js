import moment from "moment";
import { ErrorLogInfo } from "cliniccommon-ui";
import callApi from "services/apis";

export const apiSlice = (set, get) => ({
  deptCode: [],
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
    } finally {
      useLoadingProgress && get().loading.close();
    }
    return response;
  },
  selectPatient: param => {
    get().grid.provider.clearRows();
    return get().api.fetch({
      request: () => callApi(`/MSC_080100/exmPatient`, param),
      defaultHandler: ({ resultData }) => {
        if (resultData.length === 0) {
          get().snackbar.noData();
        } else {
          get().grid?.provider?.setRows(resultData);
        }
      },
    });
  },
  selectCommonCode: () =>
    new Promise(resolve => {
      get().api.fetch({
        request: () => {
          const ret = callApi(`/common/selectCommonCode`, {
            clsfList: ["CS1008", "CS1015"],
            date: moment(new Date()).format("YYYYMMDD"),
          });
          resolve(ret);
          return ret;
        },
        errorHandler: () => ErrorLogInfo(),
      });
    }),
  selectDeptCode: () =>
    new Promise(resolve => {
      get().api.fetch({
        request: () => {
          const ret = callApi(`/common/selectDeptCode`);
          resolve(ret);
          return ret;
        },
        defaultHandler: ({ resultData }) => {
          set(state => ({
            ...state,
            api: {
              ...state.api,
              deptCode: resultData,
            },
          }));
        },
        errorHandler: () => ErrorLogInfo(),
      });
    }),
});
