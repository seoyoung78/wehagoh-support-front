import React, { useEffect, useState, useRef, useCallback } from "react";

// util
import moment from "moment";
import { GridFitStyle, GridView, LocalDataProvider, SelectionStyle } from "realgrid";
import callApi from "services/apis";
import getBadgeSvg from "services/utils/getBadgeSvg";
import Message from "components/Common/Message";
import withPortal from "hoc/withPortal";
import { MSC020100DtlColumns, MSC020100DtlFields } from "pages/MSC_020000/MSC_020100/MSC_020100_DtlGrid";
import { MSC020100MstColumns, MSC020100MstFields } from "pages/MSC_020000/MSC_020100/MSC_020100_MstGrid";
import { configEmptySet, getUserGridColumnOption, setUserGridColumnOption } from "services/utils/grid/RealGridUtil";
import { cursorWaitStyle } from "services/utils/styleUtil";
import {
  compareExmnRcpn,
  getMinStr,
  getTempSpcmKey,
  getTempSpcmList,
  sCopyObj,
  useManagedPromise,
} from "../utils/MSC_020000Utils";

// common-ui-components
import DoughnutChart from "components/Common/DoughnutChart";
import StateBtnGroup from "components/Common/StateBtnGroup";
import LUXSnackbar from "luna-rocket/LUXSnackbar";
import LUXConfirm from "luna-rocket/LUXDialog/LUXConfirm";
import { LUXAlert } from "luna-rocket/LUXDialog";
import LUXButton from "luna-rocket/LUXButton";
import UnactgUncmplDialog from "components/Common/UnactgUncmplDialog";
import SearchInfo from "components/Common/SearchInfo";
import ReqPrscDialog from "components/Common/ReqPrscDialog";
import PrscDcDialog from "components/Common/PrscDcDialog";
import ScheduleDateDialog from "components/Common/ScheduleDateDialog";
import MemoDialog from "components/Common/MemoDialog";
import { ErrorLogInfo, MedicalRecord } from "cliniccommon-ui";
import MSC_020100_P01 from "pages/MSC_020000/MSC_020100/MSC_020100_P01";
import MSC_020100_P02 from "pages/MSC_020000/MSC_020100/MSC_020100_P02";
import useNotiStore from "services/utils/zustand/useNotiStore";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";
import PatientSummaryBar from "components/Common/PatientSummaryBar";

// css
import "assets/style/MSC_020100.scss";
import { useLocation } from "react-router-dom";
// imgs

/**
 * @name 페이지 MSC_020100 진단검사 접수
 * @author 담당자 강현구A
 *
 * @typedef {"aborted"|"success"|"failed"} Response
 */
function MSC_020100() {
  //상수 동적선언부
  const initSchedule = {
    open: false,
    data: undefined, //dtl 목록
    ptInfo: undefined, //환자정보
  };
  //
  const mstRealgridElement = useRef(null);
  const dtlRealgridElement = useRef(null);
  const unactgUncmplDialogRef = useRef();
  const [btnStatusValue, setBtnStatusValue] = useState("0");
  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "info",
    message: "",
  });
  const [confirm, setConfirm] = useState({
    open: false,
    titleMessage: "",
    contentsMessage: "",
    afterConfirmFunction: () => {},
    afterCancelFunction: () => {},
    afterCloseFunction: () => {},
  });
  const [reqPrscDialogOpen, setReqPrscDialogOpen] = useState(false);
  const [prscDcDialogState, setPrscDcDialogState] = useState(false);
  const [alert, setAlert] = useState({
    type: "info",
    open: false,
    title: "",
    message: "",
  });
  const [schedule, setSchedule] = useState(initSchedule); // 검사예약 상태
  const [memoDialog, setMemoDialog] = useState({
    isExm: true, //prsc_nots, prsc_memo
    open: false,
    data: "",
  });
  /**
   * @type { { current : GridView } }
   */
  const mstGridViewRef = useRef();
  /**
   * @type { { current : GridView } }
   */
  const dtlGridViewRef = useRef();
  const searchInfoRef = useRef();
  const patientInfoRef = useRef();
  const [medRecordOpen, setMedRecordOpen] = useState(false);
  const patient = patientInfoRef.current?.getPatientInfo();
  const [bindPt, setBindPt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState({
    deptData: [
      {
        text: "전체",
        value: "",
        exrm_clsf_cd: "",
      },
    ],
    useBrcd: false,
    stateList: [
      {
        code: "0",
        name: "전체",
        color: "#FFFFFF",
        count: 0,
      },
    ],
    deptList: [],
    patientCompleted: null,
    date: new Date(),
    lastSearchParam: null,
    selectedMst: null,
  });
  const noti = useNotiStore(state => state.noti);
  const resetNoti = useNotiStore(state => state.resetNoti);
  const checkNoti = useNotiStore(state => state.checkNoti);
  const [isSearchSuccess, setSearchSuccess] = useState(false);
  const location = useLocation();
  //state, ref end

  //function start
  /**
   * 페이지 기본 데이터 로드 비동기 함수
   * @author khgkjg12 강현구A
   * @since 2024-02-08
   */
  const [loadPageMp] = useManagedPromise(
    async onFinished => {
      try {
        const [resultCommon, resultDept, resultBrcd] = await Promise.all([
          callApi("/common/selectCommonCode", {
            clsfList: ["CS1008"],
            date: moment(new Date()).format("YYYYMMDD"),
          }),
          callApi("/common/selectDeptCode"),
          callApi("/MSC_020100/rtrvBrcdUseYn"),
        ]);
        if (resultDept.resultMsg !== "SUCCESS" || resultBrcd.resultCode !== 200) throw new Error();
        return [true, resultCommon, resultDept, resultBrcd, onFinished];
      } catch {
        return [false, null, null, null, onFinished];
      }
    },
    ([isSuccess, resultCommon, resultDept, resultBrcd, onFinished]) => {
      if (!isSuccess) {
        ErrorLogInfo();
        onFinished(null);
        return;
      }
      //바코드 사용 여부 세팅
      const mstGridView = mstGridViewRef.current;
      if (resultBrcd.resultData) {
        mstGridView.setCheckBar({
          visible: true,
          syncHeadCheck: true,
          checkableExpression: "values['pt_use_yn'] <> 'N'",
        });
      } else {
        mstGridView.checkBar.visible = false;
      }
      //검사실 정보 세팅.
      const nextDeptData = [
        state.deptData[0],
        ...resultDept.resultData.filter(element => element.exrm_clsf_cd === "L"),
      ];
      //상태코드 세팅.
      const nextStateList = [state.stateList[0]];
      for (const resultRow of resultCommon.resultData) {
        switch (resultRow.cmcd_cd) {
          case "B":
          case "C":
          case "E":
            nextStateList.push({
              code: resultRow.cmcd_cd,
              name: resultRow.cmcd_nm,
              color: resultRow.cmcd_char_valu1,
              count: 0,
            });
            break;

          default:
        }
      }
      dtlGridViewRef.current.setColumn({
        ...dtlGridViewRef.current.columnByName("prsc_prgr_stat_cd"),
        values: nextStateList.map(item => item.code),
        labels: nextStateList.map(item => item.name),
        renderer: {
          type: "image",
          imageCallback: (grid, dataCell) => {
            let value = dataCell.value;
            switch (value) {
              case "F":
              case "G":
              case "H":
                value = "E";
                break;
              default:
            }
            for (const item of nextStateList) {
              if (value === item.code) {
                return getBadgeSvg(
                  grid.getValue(dataCell.index.itemIndex, "dc_rqst_yn") === "Y" ? "DC요청" : item.name,
                  item.color,
                );
              }
            }
          },
        },
      });
      mstGridViewRef.current.setColumn({
        ...mstGridViewRef.current.columnByName("prsc_prgr_stat_cd"),
        values: nextStateList.map(item => item.code),
        labels: nextStateList.map(item => item.name),
        renderer: {
          type: "image",
          imageCallback: (grid, dataCell) => {
            for (const item of nextStateList) {
              if (dataCell.value === item.code) {
                return getBadgeSvg(
                  grid.getValue(dataCell.index.itemIndex, "dc_rqst_yn") === "Y" ? "DC요청" : item.name,
                  item.color,
                );
              }
            }
          },
        },
      });
      mstGridViewRef.current.setColumnFilters(
        "prsc_prgr_stat_cd",
        nextStateList
          .filter(data => data.code !== "0")
          .map(state => ({ name: state.code, text: state.name, criteria: `value = '${state.code}'` })),
      );
      const nextDeptList = Array.from(nextDeptData, list => list.value).filter(list => list !== "");
      onFinished([resultBrcd.resultData, nextStateList, nextDeptData, nextDeptList]);
    },
  );

  const updateFilterAndSelection = nextFilters => {
    const mstGridView = mstGridViewRef.current;
    mstGridView.activateAllColumnFilters("prsc_prgr_stat_cd", false);
    if (nextFilters) {
      mstGridView.activateColumnFilters("prsc_prgr_stat_cd", nextFilters, true);
    }
  };

  const onClickStateBtnGrp = value => {
    updateFilterAndSelection([value]);
  };

  /**
   * MST선택 비동기 함수.(직접 클릭 or searchItem으로 트리거)
   * @author khgkjg12 강현구A
   * @since 2024-02-06
   * @typedef {( param : {
   * rcpn_no: string;
   * exmn_hope_date: string;
   * hope_exrm_dept_sqno: long;
   * }, onFinished: (any)=>void)=>void } loadDtlMp MST선택 비동기 함수.
   * @type {[loadDtlMp]}
   */
  const [loadDtlMp] = useManagedPromise(
    async (param, onFinished) => {
      try {
        const { resultCode, resultData } = await callApi("/MSC_020100/rtrvExmnPrscList", param);
        if (resultCode !== 200) throw new Error();
        return [true, param, resultData, onFinished];
      } catch (e) {
        return [false, param, null, onFinished];
      }
    },
    ([isSuccess, param, resultData, onFinished]) => {
      const mstGridView = mstGridViewRef.current;
      const dtlGridView = dtlGridViewRef.current;
      if (!isSuccess) {
        setSnackbar({
          open: true,
          message: Message.networkFail,
          type: "warning",
        });
        onFinished(false);
        return;
      }
      const rowIdx = mstGridView
        .getDataSource()
        .getJsonRows()
        .findIndex(row => compareExmnRcpn(row, param));
      if (rowIdx < 0) {
        setSnackbar({
          open: true,
          message: Message.networkFail,
          type: "warning",
        });
        onFinished(true);
        return;
      }

      //dtl에 맞춰 mst 갱신해주기.
      mstGridView
        .getDataSource()
        .setValue(rowIdx, "prsc_prgr_stat_cd", getMinStr(resultData.map(e => e.prsc_prgr_stat_cd)));
      const itemIdx = mstGridView.getItemIndex(rowIdx);
      if (itemIdx > -1) {
        mstGridView.setSelection({
          style: SelectionStyle.ROWS,
          startItem: itemIdx,
          endItem: itemIdx,
        });
      }
      dtlGridView.commit(true);
      dtlGridView.getDataSource().setRows(resultData);
      onFinished(true);
    },
  );

  /**
   * MST 비동기 검색.
   * @author khgkjg12 강현구A
   * @since 2024-02-06
   * @typedef {(
   *   param : {
   *    patientCompleted: {
   *    pid : string;
   *    pt_nm: string;
   *    age_cd : string;
   *    } | null;
   *    exmn_hope_date : string;
   *    hope_exrm_dept_sqno_list : number[];
   *   },
   *   onFinished : (any)=>void
   *  )=>void} loadMstMp 비동기 검색 함수. 성공/실패 상태에 따라 콜백 제공.
   * @type {[loadMstMp]}
   */
  const [loadMstMp] = useManagedPromise(
    async (param, onFinished) => {
      try {
        const { resultCode, resultData } = await callApi("/MSC_020100/rtrvRcpnSttsList", {
          pid: param.patientCompleted?.pid,
          exmn_hope_date: param.exmn_hope_date,
          hope_exrm_dept_sqno_list: param.hope_exrm_dept_sqno_list,
        });
        if (resultCode !== 200) throw new Error();
        return [true, resultData, onFinished];
      } catch (e) {
        return [false, e, onFinished];
      }
    },
    ([isSuccess, data, onFinished]) => {
      if (isSuccess) {
        const dtlGridView = dtlGridViewRef.current;
        const mstGridView = mstGridViewRef.current;
        const mstDataSource = mstGridViewRef.current.getDataSource();
        if (data.length < 1) {
          setSnackbar(prev => ({
            ...prev,
            open: true,
            type: "info",
            message: Message.noSearch,
          }));
        }
        mstDataSource.setRows(data);
        const nextCount = {
          B: 0,
          C: 0,
          E: 0,
          0: 0,
        };
        for (const row of data) {
          switch (row.prsc_prgr_stat_cd) {
            case "B":
              nextCount.B++;
              break;
            case "C":
              nextCount.C++;
              break;
            case "E":
              nextCount.E++;
              break;
            default:
          }
        }
        nextCount["0"] = nextCount.B + nextCount.C + nextCount.E;
        dtlGridView.getDataSource().clearRows();
        mstGridView.clearCurrent();
        onFinished(nextCount);
      } else {
        setSnackbar({
          open: true,
          message: Message.networkFail,
          type: "warning",
        });
        onFinished(null);
      }
    },
  );

  /**
   * MST, DTL 그리드 로드 비동기 함수.
   * @param { "search" | "select" | "search_select" | "refresh" | "initial" } mode
   * @param {{
   *   patientCompleted: {
   *    pid : string;
   *    pt_nm: string;
   *    age_cd : string;
   *   } | null;
   *   exmn_hope_date: string;
   *   hope_exrm_dept_sqno_list: int[];
   * }} searchParam
   * @param { {
   *   rcpn_no: string;
   *   exmn_hope_date: string;
   *   hope_exrm_dept_sqno: number;
   * }} selectParam
   * @param {()=>Promise<Response>} onPreLoadAsync 비동기 함수 , true, false 로 계속 진행할지 여부를 반환.
   * @author khgkjg12 강현구A
   * @since 2024-02-06
   */
  const loadAsync = useCallback(
    /**
     *
     * @param { "search" | "select" | "search_select" | "refresh" | "initial" } mode
     * @param {{
     *   patientCompleted: {
     *    pid : string;
     *    pt_nm: string;
     *    age_cd : string;
     *   } | null;
     *   exmn_hope_date: string;
     *   hope_exrm_dept_sqno_list: int[];
     * }} searchParam
     * @param { {
     *   rcpn_no: string;
     *   exmn_hope_date: string;
     *   hope_exrm_dept_sqno: number;
     * }} selectParam
     * @param {()=>Promise<Response>} onPreLoadAsync 비동기 함수 , true, false 로 계속 진행할지 여부를 반환.
     * @returns
     */
    async (prevState, mode, searchParam, selectParam, onPreLoadAsync) => {
      if (isLoading) return;
      setIsLoading(true);
      if (onPreLoadAsync) {
        if ((await onPreLoadAsync()) === "aborted") {
          setIsLoading(false);
          return;
        }
      }
      const onFinal = (nextState, isSearchSuccess) => {
        setState(nextState);
        if (!isSearchSuccess) {
          setIsLoading(false);
          return;
        }
        setSearchSuccess(isSearchSuccess);
      };
      let lMode = mode;
      let lSearchParam = searchParam;
      let lSelectParam = lMode === "refresh" ? state.selectedMst : selectParam;
      const nextState = { ...prevState };
      if (lMode === "initial") {
        const loadPageResult = await new Promise(resolve => {
          loadPageMp(result => resolve(result));
        });
        if (!loadPageResult) {
          setIsLoading(false);
          return;
        }
        const [nextUseBrcd, nextStateList, nextDeptData, nextDeptList] = loadPageResult;
        lMode = "search";
        lSearchParam = {
          patientCompleted:
            location.state?.pid && location.state?.pt_nm && location.state?.age_cd
              ? { pid: location.state.pid, pt_nm: location.state.pt_nm, age_cd: location.state.age_cd }
              : null,
          exmn_hope_date: location.state?.exmn_hope_date
            ? location.state.exmn_hope_date
            : moment(new Date()).format("YYYY-MM-DD"),
          hope_exrm_dept_sqno_list: nextDeptList,
        };
        nextState.date = moment(lSearchParam.exmn_hope_date, "YYYY-MM-DD").toDate();
        nextState.patientCompleted = lSearchParam.patientCompleted;
        nextState.deptData = nextDeptData;
        nextState.deptList = nextDeptList;
        nextState.useBrcd = nextUseBrcd;
        nextState.stateList = nextStateList;
      }
      if (lMode == "refresh") {
        lSearchParam = state.lastSearchParam;
      }
      if (lMode === "search" || lMode === "search_select" || lMode === "refresh") {
        if (lSearchParam.hope_exrm_dept_sqno_list.length < 1) {
          //부서일련이 없는 경우
          setSnackbar({
            open: true,
            message: Message.noSearch,
            type: "info",
          });
          onFinal(nextState, false);
          return;
        }
        const nextCount = await new Promise(resolve => loadMstMp(lSearchParam, resolve));
        if (nextCount) {
          nextState.lastSearchParam = { ...lSearchParam, mode: lMode };
          nextState.stateList = nextState.stateList.map(e => ({ ...e, count: nextCount[e.code] }));
          nextState.selectedMst = null;
        } else {
          onFinal(nextState, false);
          return;
        }
      }

      if (lMode === "select" || lMode === "search_select" || (lMode === "refresh" && lSelectParam != null)) {
        //현재 MST에 선택 환자가 존재하는지 검사. 없으면 DTL로드 안하고 성공 처리.
        if (
          mstGridViewRef.current
            .getDataSource()
            .getJsonRows()
            .findIndex(
              row =>
                row.rcpn_no === lSelectParam?.rcpn_no &&
                row.exmn_hope_date === lSelectParam?.exmn_hope_date &&
                row.hope_exrm_dept_sqno === lSelectParam?.hope_exrm_dept_sqno,
            ) < 0
        ) {
          onFinal(nextState, lMode === "search_select" || lMode === "refresh");
          return;
        }
        if (!(await new Promise(resolve => loadDtlMp(lSelectParam, data => resolve(data))))) {
          onFinal(nextState, lMode === "search_select" || lMode === "refresh");
          return;
        }
        nextState.selectedMst = {
          ...lSelectParam,
        };
      }
      onFinal(nextState, lMode === "search_select" || lMode === "refresh" || lMode === "search");
    },
    [isLoading],
  );

  const handleSearchInfoChange = ({ type, value, completed }) => {
    switch (type) {
      case "date":
        setState(prev => ({
          ...prev,
          date: value,
        }));
        break;
      case "select":
        setState(prev => ({
          ...prev,
          deptList: value.map(e => Number(e)),
        }));
        break;
      case "complete": {
        setState(prev => ({
          ...prev,
          patientCompleted: sCopyObj(completed),
        }));
        loadAsync(state, "search", {
          patientCompleted: completed,
          exmn_hope_date: moment(state.date).format("YYYY-MM-DD"),
          hope_exrm_dept_sqno_list: state.deptList,
        });
        break;
      }
      default:
    }
  };

  const handleAdjust = data => {
    const nextState = {
      ...state,
      date: moment(data.exmn_hope_date, "YYYY-MM-DD").toDate(),
      patientCompleted: { pid: data.pid, pt_nm: data.pt_dscm_nm, age_cd: data.sex_age },
      deptList: [Number(data.hope_exrm_cd)],
    };
    loadAsync(
      nextState,
      "search_select",
      {
        patientCompleted: nextState.patientCompleted,
        exmn_hope_date: data.exmn_hope_date,
        hope_exrm_dept_sqno_list: nextState.deptList,
      },
      {
        rcpn_no: data.rcpn_sqno.toString(),
        exmn_hope_date: data.exmn_hope_date,
        hope_exrm_dept_sqno: nextState.deptList[0],
      },
    );
  };

  /**
   * 접수 비동기 함수
   * validatedItemMap, onFinished 필수.
   * @author khgkjg12 강현구A
   * @since 2024-02-07
   * @type {[(bMap:{
   * [key: string]: {
   *   pid: string;
   *   prsc_date: string;
   *   prsc_sqno: string;
   *   rcpn_no: string;
   *   hope_exrm_dept_sqno: number;
   *   exmn_hope_date: string;
   *   entd_exmn_yn: string;
   * }}, eList: string[], hasDc:boolean, onFinished:(response:Response)=>void )=>void]} rcpnMp bMap은 바코드 미 출력 eList는 출력된 처방들, onFinished 필수.
   */
  const [rcpnMp] = useManagedPromise(
    /**
     * @param {{[key: string]:{
     *   pid: string;
     *   prsc_date: string;
     *   prsc_sqno: string;
     *   rcpn_no: string;
     *   hope_exrm_dept_sqno: number;
     *   exmn_hope_date: string;
     *   entd_exmn_yn: string;
     * }}} bMap
     * @param {string[]} eList
     * @param {boolean} hasDc
     * @param {(response:Response)=>void} onFinished
     * @returns
     */
    (bMap, eList, hasDc, onFinished, deptSqno) =>
      new Promise(
        /**
         * @param {(result:[boolean, Response, (Response) =>void])=>void} resolve
         */
        resolve => {
          const doRcpn = async () => {
            const callList = [
              ...Object.values(bMap).map(prscList => callApi("/MSC_020100/issuBrcdAndRcpn", { mslcMapList: prscList })),
            ];
            eList.length > 0 && callList.push(callApi("/MSC_020100/rcpnBrcd", { mslcStringList: eList }));
            let resultList = null;
            resultList = await Promise.allSettled(callList);
            let isSuccess = false;
            let errorCode = null;
            resultList.forEach(each => {
              if (each.value?.resultCode === 200) isSuccess = true;
              else {
                errorCode = each.value?.resultCode;
              }
            });
            if (isSuccess) {
              resolve([true, "success", onFinished, null, deptSqno]);
            } else {
              resolve([true, "failed", onFinished, errorCode]);
            }
          };
          if (hasDc) {
            setConfirm({
              contentsMessage: Message.dcRaceiptBefore,
              open: true,
              titleMessage: "D/C요청 검사 접수",
              type: "success",
              afterConfirmFunction: () => doRcpn(),
              afterCancelFunction: () => resolve([false, "success", onFinished]),
              afterCloseFunction: () => resolve([false, "success", onFinished]),
            });
          } else {
            doRcpn();
          }
        },
      ),
    /**
     * @param {[boolean, Response, (response : Response) => void]}
     */
    ([isCalled, response, onFinished, errorCode, deptSqno]) => {
      if (!isCalled) {
        onFinished(response);
        return;
      }
      if (response === "success") {
        setSnackbar(prev => ({
          ...prev,
          open: true,
          type: "success",
          message: Message.receipt,
        }));
        callApi("/exam/sendPrgrProgressNoti", {
          exrmClsfCd: "L",
          deptSqno,
        });
      } else {
        if (errorCode === 472) {
          setSnackbar({ open: true, type: "error", message: Message.MSC_020000_alreadyIssued });
        } else if (errorCode === 470) {
          setSnackbar({ open: true, type: "error", message: Message.MSC_020000_rddcPrscIssu });
        } else {
          setSnackbar({
            type: "warning",
            message: Message.networkFail,
            open: true,
          });
        }
      }
      onFinished(response);
    },
  );

  const handleRcpnClick = () => {
    loadAsync(state, "refresh", null, null, () => {
      const dtlGridView = dtlGridViewRef.current;
      const checkedIdxList = dtlGridView.getCheckedItems();
      if (checkedIdxList.length < 1) {
        setSnackbar(prev => ({ ...prev, open: true, type: "info", message: Message.noCheck2 }));
        return Promise.resolve("aborted");
      }

      const bList = [];
      const eList = [];
      let hasDc = false;
      for (const idx of checkedIdxList) {
        const item = dtlGridView.getValues(idx);
        if (item.prsc_prgr_stat_cd === "B") {
          if (item.dc_rqst_yn === "Y") {
            hasDc = true;
          }
          if (!item.spcm_no) {
            bList.push(item);
          } else if (!eList.includes(item.spcm_no)) {
            eList.push(item.spcm_no);
          }
        }
      }
      const bMap = getTempSpcmList(bList);
      if (bList.length + eList.length < 1) {
        setSnackbar(prev => ({
          ...prev,
          open: true,
          type: "error",
          message: Message.noReceipt,
        }));
        return Promise.resolve("aborted");
      }
      return new Promise(resolve => {
        rcpnMp(bMap, eList, hasDc, resolve, state.selectedMst?.hope_exrm_dept_sqno);
      });
    });
  };

  /**
   * 접수 취소 비동기 함수.
   * @authro khgkjg12 강현구A
   * @since 2024-02-07
   * @type {[cnclRcpnMP:(validatedItemMap:any, onFinished:(response:Response)=>void )=>void]}
   */
  const [cnclRcpnMP] = useManagedPromise(
    /**
     *
     * @param {*} validatedItemMap
     * @param {(response: Response)=>void} onFinished
     */
    (validatedItemMap, onFinished) =>
      new Promise(
        /**
         * @param {(result:[boolean, Response, (response:Response) =>void, any])=>void} resolve
         */
        resolve => {
          setConfirm({
            open: true,
            titleMessage: "검사 접수 취소",
            contentsMessage: Message.receiptCancelConfirm,
            afterConfirmFunction: () => {
              callApi("/MSC_020100/cnclRcpnBrcd", { mslcStringList: Object.values(validatedItemMap) })
                .then(({ resultCode }) => {
                  if (resultCode !== 200) throw resultCode;
                  resolve([true, "success", onFinished]);
                })
                .catch(resultCode => {
                  resolve([true, "failed", onFinished, resultCode]);
                });
            },
            afterCancelFunction: () => resolve([false, "success", onFinished]),
            afterCloseFunction: () => resolve([false, "success", onFinished]),
          });
        },
      ),
    /**
     * @param {[boolean, Response, (response:Response) => void]}
     */
    ([isCalled, response, onFinished]) => {
      if (!isCalled) {
        onFinished(response);
        return;
      }
      if (response === "success") {
        setSnackbar({
          open: true,
          type: "success",
          message: Message.receiptCancel,
        });
      } else {
        setSnackbar({
          type: "warning",
          message: Message.networkFail,
          open: true,
        });
      }
      onFinished(response);
    },
  );

  /** 접수 취소 버틑 클릭 이벤트
   * @author khgkjg12 강현구A
   */
  const handleCnclRcpnClick = () => {
    loadAsync(state, "refresh", null, null, () => {
      const dtlGridView = dtlGridViewRef.current;
      const checkedIdxList = dtlGridView.getCheckedItems();
      if (checkedIdxList.length < 1) {
        setSnackbar({ open: true, type: "info", message: Message.noCheck2 });
        return Promise.resolve("aborted");
      }
      const validatedItemMap = {};
      for (const idx of checkedIdxList) {
        const item = dtlGridView.getValues(idx);
        if (item.prsc_prgr_stat_cd === "C") {
          if (!validatedItemMap[item.spcm_no]) {
            validatedItemMap[item.spcm_no] = item.spcm_no;
          }
        }
      }
      if (Object.keys(validatedItemMap).length < 1) {
        setSnackbar({
          open: true,
          type: "error",
          message: Message.noReceiptCancel,
        });
        return Promise.resolve("aborted");
      }
      return new Promise(resolve =>
        cnclRcpnMP(validatedItemMap, response => {
          resolve(response);
        }),
      );
    });
  };

  /**
   * 검사 비동기 함수.
   * @author khgkjg12 강현구A
   * @since 2024-02-07
   * @type {[(validatedItemMap:any, onFinished:(response:Response)=>void)=>void]}
   */
  const [exmnMp] = useManagedPromise(
    /**
     * 검사 비동기 함수.
     * @author khgkjg12 강현구A
     * @param {*} validatedItemMap
     * @param {(response:Response)=>void} onFinished
     * @returns {[Response,(response:Response)=>void]}
     */
    async (validatedItemMap, onFinished, deptSqno) => {
      try {
        const { resultCode } = await callApi("/MSC_020100/exmnBrcd", {
          mslcStringList: Object.values(validatedItemMap),
        });
        if (resultCode !== 200) return ["failed", onFinished, deptSqno];
        return ["success", onFinished, deptSqno];
      } catch (e) {
        return ["failed", onFinished, deptSqno];
      }
    },
    /**
     *
     * @param {[Response,(response:Response)=>void]} param0
     */
    ([response, onFinished, deptSqno]) => {
      if (response === "success") {
        setSnackbar(prev => ({
          ...prev,
          open: true,
          type: "success",
          message: Message.exmnPrgrSuccess,
        }));
        callApi("/exam/sendPrgrProgressNoti", {
          exrmClsfCd: "L",
          deptSqno,
        });
      } else {
        setSnackbar({
          type: "warning",
          message: Message.networkFail,
          open: true,
        });
      }
      onFinished(response);
    },
  );
  /**
   * 검사 버튼 헨들러
   * @author khgkjg12 강현구A
   */
  const handleExmnClick = () => {
    loadAsync(state, "refresh", null, null, () => {
      const dtlGridView = dtlGridViewRef.current;
      const checkedIdxList = dtlGridView.getCheckedItems();
      if (checkedIdxList.length < 1) {
        setSnackbar({ open: true, type: "info", message: Message.noCheck2 });
        return Promise.resolve("aborted");
      }
      const validatedItemMap = {};
      for (const idx of checkedIdxList) {
        const item = dtlGridView.getValues(idx);
        if (item.prsc_prgr_stat_cd === "C") {
          if (!validatedItemMap[item.spcm_no]) {
            validatedItemMap[item.spcm_no] = item.spcm_no;
          }
        }
      }
      if (Object.keys(validatedItemMap).length < 1) {
        setSnackbar({
          open: true,
          type: "error",
          message: Message.exmnPrgrFail,
        });
        return Promise.resolve("aborted");
      }
      return new Promise(resolve => {
        exmnMp(validatedItemMap, response => resolve(response), state.selectedMst?.hope_exrm_dept_sqno);
      });
    });
  };

  /**
   * 검사취소 비동기 함수.
   * @author khgkjg12 강현구A
   * @since 2024-02-07
   * @type {[(validatedItemMap:any, onFinished:(response:Response)=>void)=>void]}
   */
  const [cnclExmnMp] = useManagedPromise(
    (validatedItemMap, onFinished) =>
      new Promise(
        /**
         * @param {(result:[Response, (Response) =>void, any])=>void} resolve
         */
        resolve => {
          setConfirm({
            open: true,
            titleMessage: "검사 진행 취소",
            contentsMessage: Message.completeCancelConfirm,
            afterConfirmFunction: () => {
              callApi("/MSC_020100/cnclExmnBrcd", {
                mslcStringList: Object.values(validatedItemMap),
              })
                .then(({ resultCode, resultData }) => {
                  if (resultCode !== 200) resolve([true, "failed", onFinished, resultData, resultCode]);
                  resolve([true, "success", onFinished]);
                })
                .catch(() => {
                  resolve([true, "failed", onFinished]);
                });
            },
            afterCancelFunction: () => resolve([false, "success", onFinished]),
            afterCloseFunction: () => resolve([false, "success", onFinished]),
          });
        },
      ),
    /**
     * @param {[boolean, Response, (Response) =>void, any]}
     */
    ([isCalled, response, onFinished, data, code]) => {
      if (!isCalled) {
        onFinished(response);
        return;
      }
      if (response === "success") {
        setSnackbar({ open: true, type: "success", message: Message.cnclExmnPrgrSuccess });
      } else {
        let message = Message.networkFail;
        let type = "warning";
        if (code === 446) {
          switch (Object.values(data)[0]) {
            case "M":
              type = "error";
              message = Message.iptnExistFail;
              break;
            case "N":
              type = "error";
              message = Message.rptgExistFail;
              break;
            case "G":
              type = "error";
              message = Message.MSC_020000_trmsExistFail;
              break;
            default:
          }
        }
        setSnackbar({ open: true, type, message });
      }
      onFinished(response);
    },
  );

  /**
   * 검사 취소 버튼 헨들러
   * @author khgkjg12 강현구A
   */
  const handleExmnCnclClick = () => {
    loadAsync(state, "refresh", null, null, () => {
      const gridView = dtlGridViewRef.current;
      const checkedItemIdxList = gridView.getCheckedItems();
      if (checkedItemIdxList.length < 1) {
        setSnackbar(prev => ({ ...prev, open: true, type: "info", message: Message.noCheck2 }));
        return Promise.resolve("aborted");
      }
      const validatedItemMap = {};
      for (const idx of checkedItemIdxList) {
        const item = gridView.getValues(idx);
        if (item.prsc_prgr_stat_cd === "E" && !validatedItemMap[item.spcm_no]) {
          validatedItemMap[item.spcm_no] = item.spcm_no;
        }
      }
      if (Object.keys(validatedItemMap).length < 1) {
        setSnackbar(prev => ({
          ...prev,
          open: true,
          type: "error",
          message: Message.cnclExmnPrgrFail,
        }));
        return Promise.resolve("aborted");
      }
      return new Promise(resolve => {
        cnclExmnMp(validatedItemMap, response => {
          resolve(response);
        });
      });
    });
  };

  /**
   * @returns
   */
  const handleReqDc = () => {
    const dtlGridView = dtlGridViewRef.current;
    const dtlDataProvider = dtlGridView.getDataSource();
    const checkedRows = dtlGridView.getCheckedRows();

    if (checkedRows.length > 0) {
      const validatedRows = [];
      for (let i = 0; i < checkedRows.length; i++) {
        const item = dtlDataProvider.getJsonRow(checkedRows[i]);
        if (item.prsc_prgr_stat_cd === "B") {
          validatedRows.push({
            pid: item.pid,
            prsc_date: item.prsc_date,
            prsc_sqno: item.prsc_sqno,
            prsc_cd: item.prsc_cd,
            prsc_nm: item.prsc_nm,
            dc_rqst_yn: item.dc_rqst_yn,
            prsc_dr_sqno: item.prsc_dr_usr_sqno,
          });
        }
      }
      if (validatedRows.length === 0) {
        setAlert({
          open: true,
          type: "warning",
          message: Message.noReceptionDc,
          title: "진단검사 DC 불가",
        });
        return;
      }
      if (validatedRows.every(list => list.dc_rqst_yn === "Y")) {
        setSnackbar({
          open: true,
          type: "error",
          message: Message.alreadyDc,
        });
        return;
      }
      setPrscDcDialogState({ isOpen: true, dcList: validatedRows.filter(list => list.dc_rqst_yn === "N") });
    } else {
      setSnackbar({
        open: true,
        type: "info",
        message: Message.noCheck2,
      });
    }
  };

  const handleClosePrscDcDialog = () => {
    setPrscDcDialogState({ isOpen: false, dcList: [] });
    dtlGridViewRef.current?.checkAll(false, false, false, false);
  };

  const handleMemoDialogClose = () => {
    setMemoDialog({ ...memoDialog, open: false });
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  // 검사 예약일
  const handleSchedule = () => {
    setSchedule(initSchedule);
    loadAsync(state, "refresh");
  };

  //function end
  useEffect(() => {
    //마스터 그리드 설정
    const mstDataProvider = new LocalDataProvider(true);
    mstDataProvider.setFields(MSC020100MstFields);
    const mstGridView = new GridView(mstRealgridElement.current);
    mstGridViewRef.current = mstGridView;
    mstGridView.setDataSource(mstDataProvider);
    mstGridView.setColumns(MSC020100MstColumns);
    configEmptySet(mstGridView, mstRealgridElement.current, Message.noSearch);
    mstGridView.setDisplayOptions({
      selectionStyle: SelectionStyle.SINGLE_ROW,
      fitStyle: GridFitStyle.EVEN,
    });
    mstGridView.pasteOptions.enabled = false;
    mstGridView.setCopyOptions({ copyDisplayText: true, singleMode: true });
    mstGridView.footer.visible = false;
    mstGridView.checkBar.visible = false;
    mstGridView.stateBar.visible = false;
    mstGridView.rowIndicator.visible = false;
    mstGridView.setFilteringOptions({ enabled: false });
    // 컨텍스트 메뉴 설정
    mstGridView.onContextMenuPopup = (grid, x, y, clickData) => {
      if (clickData.cellType !== "gridEmpty" && grid.getValue(clickData.itemIndex, "prsc_prgr_stat_cd") === "B") {
        grid.setContextMenu([{ label: "엑셀" }, { label: "예약" }]);
      } else {
        grid.setContextMenu([{ label: "엑셀" }]);
      }
    };

    //디테일 그리드 설정
    const dtlDataProvider = new LocalDataProvider(true);
    dtlDataProvider.setFields(MSC020100DtlFields);
    const dtlGridView = new GridView(dtlRealgridElement.current);
    dtlGridViewRef.current = dtlGridView;
    dtlGridView.setDataSource(dtlDataProvider);
    dtlGridView.setColumns(MSC020100DtlColumns);
    configEmptySet(dtlGridView, dtlRealgridElement.current, Message.noData);
    dtlGridView.setDisplayOptions({
      selectionStyle: SelectionStyle.SINGLE_ROW,
      fitStyle: GridFitStyle.EVEN,
    });
    dtlGridView.pasteOptions.enabled = false;
    dtlGridView.setCheckBar({
      visible: true,
      syncHeadCheck: true,
    });
    dtlGridView.setCopyOptions({ copyDisplayText: true, singleMode: true });
    dtlGridView.rowIndicator.visible = false;
    dtlGridView.footer.visible = false;
    dtlGridView.stateBar.visible = false;

    getUserGridColumnOption(dtlGridView, "MSC_020100_DtlGrid", MSC020100DtlColumns, "visible");
    mstGridView.onContextMenuItemClicked = (grid, item) => {
      if (item.label === "엑셀") {
        grid.exportGrid({
          type: "excel",
          target: "local",
          fileName: "진단검사 접수목록 " + moment().format("YYYYMMDD HHmmss"),
        });
      } else if (item.label === "예약") {
        setSchedule({
          open: true,
          data: dtlGridView.getJsonRows(),
          ptInfo: patientInfoRef.current.getPatientInfo(),
        });
      }
    };
    dtlGridView.onContextMenuPopup = (grid, x, y, clickData) => {
      const defaultMenu = [
        { label: "엑셀" },
        {
          label: "컬럼",
          children: [
            {
              label: "접수일자",
              type: "check",
              checked: grid.columnByName("rcpn_dy_exmn_hope_dy").visible,
              name: "rcpn_dy_exmn_hope_dy",
            },
            {
              label: "검사일자",
              type: "check",
              checked: grid.columnByName("cndt_dy").visible,
              name: "cndt_dy",
            },
          ],
        },
      ];
      if (clickData.cellType !== "gridEmpty" && grid.getValue(clickData.itemIndex, "prsc_prgr_stat_cd") === "B") {
        defaultMenu.splice(1, 0, { label: "예약" });
        grid.setContextMenu(defaultMenu);
      } else {
        grid.setContextMenu(defaultMenu);
      }
    };
    dtlGridView.onContextMenuItemClicked = (grid, item, clickData) => {
      if (item.label === "엑셀") {
        grid.exportGrid({
          type: "excel",
          target: "local",
          fileName: "진단검사 처방목록 " + moment().format("YYYYMMDD HHmmss"),
        });
      } else if (item.label === "예약") {
        setSchedule({
          open: true,
          data: [grid.getValues(clickData.itemIndex)],
          ptInfo: patientInfoRef.current.getPatientInfo(),
        });
      } else {
        grid.columnByName(item.name).visible = item.checked;
        setUserGridColumnOption("MSC_020100_DtlGrid", item.name, "visible", item.checked);
      }
    };
    dtlGridView.onCellClicked = (grid, clickData) => {
      switch (clickData.column) {
        case "prsc_nots":
        case "prsc_memo":
          {
            const value = grid.getValue(clickData.itemIndex, clickData.column);
            if (value) {
              setMemoDialog({
                open: true,
                isExm: clickData.column === "prsc_nots",
                data: value,
              });
            }
          }
          break;
        default:
      }
    };

    dtlGridView.onItemChecked = (grid, itemIndex, checked) => {
      const item = grid.getValues(itemIndex);
      if (item.spcm_no) {
        //바코드 발행된 처방이면
        for (let index = 0; index < grid.getItemCount(); index++) {
          const target = grid.getValues(index);
          if (target.spcm_no === item.spcm_no) {
            grid.checkItem(index, checked, false, false);
          }
        }
        return;
      }
      if (checked) {
        //검사 전이고 체크활성화 이벤트일떄.
        for (let index = 0; index < grid.getItemCount(); index++) {
          const target = grid.getValues(index);
          if (!target.spcm_no && getTempSpcmKey(target) === getTempSpcmKey(item)) {
            //타겟 검체번호가 없고, 검체코드, 접수번호, 검사실, 검사일자가 일치.
            grid.checkItem(index, true, false, false);
          }
        }
      }
    };
    mstDataProvider.clearRows();
    dtlDataProvider.clearRows();
    loadAsync(state, "initial");
    return () => {
      mstDataProvider.destroy();
      mstGridView.destroy();
      dtlDataProvider.destroy();
      dtlGridView.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!dtlGridViewRef.current) return;
    dtlGridViewRef.current.setCheckableExpression(bindPt ? "1=0" : "1=1");
    dtlGridViewRef.current.setCheckBar({ showAll: !bindPt });
  }, [bindPt]);

  useEffect(() => {
    if (state.lastSearchParam) unactgUncmplDialogRef.current.search();
  }, [state.lastSearchParam]);

  useEffect(() => {
    mstGridViewRef.current.onSelectionChanged = (grid, selection) => {
      const nextPatient = grid.getValues(selection.startItem);
      if (!compareExmnRcpn(state.selectedMst, nextPatient)) {
        mstGridViewRef.current.onSelectionChanged = null; //일회용. 로드가끝나면 자동으로 달림.
        loadAsync(state, "select", null, { ...nextPatient });
      }
    };
  }, [state, loadAsync]);

  useEffect(() => {
    const mstGridView = mstGridViewRef.current;
    mstGridView.onFilteringChanged = grid => {
      const filters = grid.getActiveColumnFilters("prsc_prgr_stat_cd");
      if (filters.length === 1) {
        setBtnStatusValue(filters[0].name);
      } else {
        setBtnStatusValue("0"); //필터가 없거나 여러개면 전체 버튼 활성화
      }
      if (
        !state.selectedMst ||
        mstGridView.searchItem({
          //있으면 selection(current를 포함하는 개념)됨 없으면 암것도 안함.
          fields: ["rcpn_no", "exmn_hope_date", "hope_exrm_dept_sqno"],
          values: [state.selectedMst.rcpn_no, state.selectedMst.exmn_hope_date, state.selectedMst.hope_exrm_dept_sqno],
        }) < 0
      ) {
        mstGridView.clearCurrent(); //선택된 rcpn 이 없거나, 찾을 수 없으면 초기화.
      }
      grid.onDataLoadComplated(grid); //데이터 로드 콜백 강제 트리거로 엠티셋 활성화.
    };
  }, [state.selectedMst]);

  useEffect(() => {
    //"search" "search_select" "refresh"
    if (state.lastSearchParam?.mode !== "refresh") {
      updateFilterAndSelection();
    }
  }, [state.lastSearchParam]);

  useEffect(() => {
    if (noti && checkNoti()) {
      loadAsync(state, "refresh", null, null);
      resetNoti();
    }
  }, [noti]);

  useEffect(() => {
    if (isSearchSuccess) {
      if (state.deptData.length > 2) {
        //2개 이상의 검사실이 있는 경우.
        searchInfoRef.current.selectDept(
          state.lastSearchParam.hope_exrm_dept_sqno_list.length > 1
            ? ""
            : state.lastSearchParam.hope_exrm_dept_sqno_list[0].toString(),
        );
      }
      searchInfoRef.current.setCompleted(sCopyObj(state.lastSearchParam.patientCompleted));
      state.patientCompleted = sCopyObj(state.lastSearchParam.patientCompleted);
      setSearchSuccess(false);
      setIsLoading(false);
    }
  }, [isSearchSuccess]);

  return (
    <div className="MSC_020100 dp_full">
      {withPortal(
        <LUXSnackbar
          message={snackbar.message}
          onRequestClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          open={snackbar.open}
          type={snackbar.type}
        />,
        "snackbar",
      )}
      {withPortal(
        <LUXAlert
          useIcon
          useIconType={alert.type}
          open={alert.open}
          title={alert.title}
          message={alert.message}
          onClose={handleCloseAlert}
          confirmButton={handleCloseAlert}
        />,
        "dialog",
      )}
      {withPortal(
        <LUXConfirm
          useIcon
          useIconType="success"
          title={confirm.titleMessage}
          message={confirm.contentsMessage}
          open={confirm.open}
          cancelButton={() => {
            confirm.afterCancelFunction && confirm.afterCancelFunction();
            setConfirm({ ...confirm, open: false });
          }}
          confirmButton={() => {
            confirm.afterConfirmFunction && confirm.afterConfirmFunction();
            setConfirm({ ...confirm, open: false });
          }}
          onClose={() => {
            confirm.afterCloseFunction && confirm.afterCloseFunction();
            setConfirm({ ...confirm, open: false });
          }}
        />,
        "dialog",
      )}
      {withPortal(
        <ReqPrscDialog
          exrmClsfCd="L"
          open={reqPrscDialogOpen}
          setOpen={setReqPrscDialogOpen}
          patient={{
            pt_nm: patient?.pt_nm,
            mdcr_date: patient?.mdcr_date,
            rcpn_sqno: state.selectedMst?.rcpn_no,
            mdcr_user_nm: patient?.mdcr_dr_nm,
          }}
        />,
        "dialog",
      )}
      {withPortal(
        <PrscDcDialog
          exrmClsfCd="L"
          open={prscDcDialogState.isOpen}
          handleClose={handleClosePrscDcDialog}
          ptInfo={{ ...state.selectedMst, pt_nm: patient?.pt_nm, mdcr_date: patient?.mdcr_date }}
          dcList={prscDcDialogState.dcList}
          handleSave={() => {
            loadAsync(state, "refresh");
          }}
        />,
        "dialog",
      )}
      {withPortal(
        <ScheduleDateDialog
          open={schedule.open}
          data={schedule.data}
          ptInfo={schedule.ptInfo}
          onClose={() => setSchedule(initSchedule)}
          onSave={handleSchedule}
        />,
        "dialog",
      )}
      <MemoDialog
        title={memoDialog.isExm ? "검사메모" : "처방메모"}
        handleMemoDialogClose={handleMemoDialogClose}
        open={memoDialog.open}
        data={memoDialog.data}
      />
      {medRecordOpen &&
        withPortal(
          <MedicalRecord open={medRecordOpen} close={() => setMedRecordOpen(false)} pid={patient?.pid} />,
          "dialog",
        )}
      <div className="align_box">
        <div className={`align_top ${state.selectedMst ? "patient_info_wrap" : ""}`}>
          <PatientSummaryBar
            pageId="MSC_020100"
            rcpn_sqno={state.selectedMst?.rcpn_no}
            prsc_clsf_cd="C1"
            hope_exrm_cd={state.selectedMst?.hope_exrm_dept_sqno?.toString()}
            ref={patientInfoRef}
            exmn_hope_date={state.selectedMst?.exmn_hope_date}
            handleBind={bind => setBindPt(bind)}
          />
          <div className="right_box">
            <LUXButton
              label="진료기록조회"
              type="small"
              onClick={() => setMedRecordOpen(true)}
              disabled={!state.selectedMst?.rcpn_no}
            />
          </div>
        </div>
        <div className="align_split">
          <div className="align_left">
            <div className="sec_wrap">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">진단검사 접수 현황</h3>
                  </div>
                </div>
                <div className="right_box">
                  <UnactgUncmplDialog
                    onAdjust={handleAdjust}
                    prscClsfCd="C1"
                    hopeExrmDeptSqnoList={state.lastSearchParam?.hope_exrm_dept_sqno_list}
                    stateList={state.stateList}
                    ref={unactgUncmplDialogRef}
                    style={isLoading ? cursorWaitStyle : undefined}
                  />
                </div>
              </div>
              <div className="sec_content">
                <SearchInfo
                  exrmClsfCd="L"
                  date={state.date}
                  ref={searchInfoRef}
                  handleChange={handleSearchInfoChange}
                  handleSearch={() => {
                    loadAsync(state, "search", {
                      patientCompleted: state.patientCompleted,
                      exmn_hope_date: moment(state.date).format("YYYY-MM-DD"),
                      hope_exrm_dept_sqno_list: state.deptList,
                    });
                  }}
                  initDeptData={state.deptData}
                  btnStyle={isLoading ? cursorWaitStyle : undefined}
                />
              </div>
            </div>
            <div className="sec_wrap full_size">
              <div className="sec_content">
                <div className="donut_box">
                  <div className="chart_box">
                    {/* // 차트 */}
                    <DoughnutChart arrStates={state.stateList} />
                  </div>
                </div>
              </div>
            </div>
            <div className="sec_wrap full_size2">
              <div className="sec_content">
                <div className="stat_btn_wrap">
                  <StateBtnGroup
                    arrStates={state.stateList}
                    onClickStateBtnGrp={onClickStateBtnGrp}
                    strSelectedStateBtn={btnStatusValue}
                  />
                  {state.useBrcd && (
                    <MSC_020100_P02
                      stateList={state.stateList}
                      setSnackbar={setSnackbar}
                      rcpnSttsGridView={mstGridViewRef.current}
                    />
                  )}
                </div>
                <div className={`grid_box${isLoading ? " gridwait" : ""}`} ref={mstRealgridElement} />
              </div>
            </div>
          </div>
          <div className="align_right">
            <div className="sec_wrap full_size">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">검사 처방 목록</h3>
                  </div>
                </div>
                <div className="right_box">
                  {state.useBrcd ? (
                    <MSC_020100_P01
                      setSnackbar={setSnackbar}
                      onSuccess={() => loadAsync(state, "refresh")}
                      disabled={!state.selectedMst}
                      style={isLoading ? cursorWaitStyle : undefined}
                    />
                  ) : (
                    <LUXButton
                      label="접수"
                      onClick={handleRcpnClick}
                      disabled={!state.selectedMst || bindPt}
                      type="small"
                      style={isLoading ? cursorWaitStyle : undefined}
                    />
                  )}
                  <LUXButton
                    label="접수취소"
                    onClick={handleCnclRcpnClick}
                    disabled={!state.selectedMst || bindPt}
                    type="small"
                    style={isLoading ? cursorWaitStyle : undefined}
                  />
                  <LUXButton
                    label="검사"
                    onClick={handleExmnClick}
                    disabled={!state.selectedMst || bindPt}
                    type="small"
                    style={isLoading ? cursorWaitStyle : undefined}
                  />
                  <LUXButton
                    label="검사취소"
                    onClick={handleExmnCnclClick}
                    disabled={!state.selectedMst || bindPt}
                    type="small"
                    style={isLoading ? cursorWaitStyle : undefined}
                  />
                  <LUXButton
                    label="DC요청"
                    onClick={handleReqDc}
                    disabled={!state.selectedMst || bindPt}
                    type="small"
                  />
                  <LUXButton
                    label="처방요청"
                    onClick={() => setReqPrscDialogOpen(true)}
                    disabled={!state.selectedMst || bindPt}
                    type="small"
                  />
                </div>
              </div>
              <div className="sec_content">
                <div className={`grid_box${isLoading ? " gridwait" : ""}`} ref={dtlRealgridElement} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WithWrapper(MSC_020100);
