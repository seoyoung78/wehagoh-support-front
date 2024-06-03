import React, { useEffect, useRef, useState, useCallback } from "react";

// common-ui-components
import { LUXButton, LUXSnackbar, LUXConfirm, LUXAlert, LUXTextArea } from "luna-rocket";
import PatientSummaryBar from "components/Common/PatientSummaryBar";
import SearchInfo from "components/Common/SearchInfo";
import DoughnutChart from "components/Common/DoughnutChart";
import StateBtnGroup from "components/Common/StateBtnGroup";
import Message from "components/Common/Message";
import { ErrorLogInfo } from "cliniccommon-ui";

// css
import "assets/style/MSC_060100.scss";

// imgs
// import chartImg from "assets/imgs/img_chart.png";

// dialog
import UnactgUncmplDialog from "components/Common/UnactgUncmplDialog";
import PrscDcDialog from "components/Common/PrscDcDialog";
import ReqPrscDialog from "components/Common/ReqPrscDialog";
import ScheduleDateDialog from "components/Common/ScheduleDateDialog";
import MemoDialog from "components/Common/MemoDialog";
import MSC100100P01 from "pages/MSC_100100/MSC_100100_P01";
import HistoryDialog from "components/Common/HistoryDialog";

// util
import { date, lodash } from "common-util/utils";
import callApi from "services/apis";
import { signApi } from "services/apis/signApi";
import withPortal from "hoc/withPortal";
import {
  mdtrStatus,
  focusOnSelectedRow,
  extractProperties,
  isElementMatchingSelection,
} from "services/utils/examDataDefinitions";
import moment from "moment";
import useLoadingStore from "services/utils/zustand/useLoadingStore";
import { initializeGrid, destroyGrid, configureGridImageCallback } from "services/utils/grid/RealGridUtil";
import { mstGridColumns, mstGridFields } from "pages/MSC_060000/MSC_060100/MSC_060100_MstGrid";
import { dtlGridColumns, dtlGridFields } from "pages/MSC_060000/MSC_060100/MSC_060100_DtlGrid";
import { setLocalStorageItem } from "services/utils/localStorage";
import { windowOpen } from "services/utils/popupUtil";
import useAuthstore from "services/utils/zustand/useAuthStore";
import useNotiStore from "services/utils/zustand/useNotiStore";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";

// dialog
import MSC_060100_P01 from "pages/MSC_060000/MSC_060100/MSC_060100_P01";
import MSC_060100_P02 from "pages/MSC_060000/MSC_060100/MSC_060100_P02";

/**
 * @name 물리치료 현황
 * @author 김령은
 * @history (2024-01-23) 물리치료 이력관리 로직 추가
 */

function MSC_060100() {
  /* ================================================================================== */
  /* 상수케이스 선언 */
  const PAGE_ID = "MSC_060100";
  const MDTR_CLSF_CD = "P";
  const RECEPTION_STATS = ["B", "C", "E", "N"];
  const START_STAT = RECEPTION_STATS[0]; // 치료대기
  // const END_STAT = RECEPTION_STATS[1]; // 진행중
  const COMPLETED_CD = RECEPTION_STATS[2]; //치료완료
  const RPTG_CD = RECEPTION_STATS[3]; //보고완료
  const PRSC_CLSF_CD = "F1"; // 처방분류코드
  const ALL_ITEMS_KEY = "0";

  const TYPE_TRTM_START = "trtmStart"; // 처치시작
  const TYPE_TRTM_START_CANCEL = "trtmStartCancel"; // 처치시작 취소
  const TYPE_TRTM_END = "trtmEnd"; // 처치종료
  const TYPE_TRTM_END_CANCEL = "trtmEndCancel"; // 처치종료 취소
  const TYPE_COMPLETE_REPORT = "completeReport"; // 완료보고
  const TYPE_COMPLETE_REPORT_CALCEL = "completeReportCancel"; // 완료보고 취소
  const TYPE_SAVE_OUT = "saveOut";
  const TYPE_SAVE_OUT_DTL = "saveOutDtl";

  const MSG_ROUTE = "MSC_060000_";

  /* 상태(state) 선언 */
  const patientRef = useRef(null);
  const unactgRef = useRef(null);

  const selectedPtRef = useRef({
    pid: "",
    pt_nm: "",
    prsc_date: "",
    rcpn_sqno: "",
    hope_exrm_cd: "",
    insn_tycd: "",
    age_cd: "",
    basc_addr: "",
    dgns_nm: "",
    mdtr_hope_date: "",
    mdcr_user_nm: "",
    mdcr_date: "",
    mdcr_sign: "",
    prsc_dr_sqno: "",
  });

  const resultRef = useRef({
    pid: "",
    prsc_nm: "",
    prsc_date: "",
    prsc_sqno: "",
    prsc_prgr_stat_cd: "",
    mdtr_opnn: "",
    mdtr_memo: "",
    startRow: -1,
    rcps_id: "",
    exmn_rslt_rptg_yn: "",
  });

  const snackbarRef = useRef({
    message: "",
    open: false,
    type: "warning",
  });

  const confirmRef = useRef({
    open: false,
    title: "",
    confirmMsg: "",
    reqType: "",
    paramList: [],
    patient: {},
    startRow: -1,
    rsltRptgList: [],
  });

  const alertRef = useRef({
    message: "",
    useIconType: "warning",
    title: "",
    open: false,
  });

  const timePopRef = useRef({
    pid: "",
    prsc_date: "",
    prsc_sqno: "",
    prsc_nm: "",
    trtm_strt_dt: "",
    trtm_end_dt: "",
    prsc_prgr_stat_cd: "",
    open: false,
  });

  const mstIdentifiers = useRef(["pid", "prsc_date", "hope_exrm_cd", "rcpn_sqno"]);

  const prscStatCdRef = useRef(mdtrStatus);

  const cancelSet = new Set([TYPE_TRTM_START_CANCEL, TYPE_TRTM_END_CANCEL, TYPE_COMPLETE_REPORT_CALCEL]);

  // 조회 시 필요한 데이터 가져왔는지 확인
  const [isStateFetched, setIsStateFetched] = useState(false);
  const [isDeptLoaded, setIsDeptLoaded] = useState(false);

  // 저장 시 로딩중인지 확인
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  // 메신저 알림톡 로딩창
  const { openLoading, closeLoading } = useLoadingStore(state => state);
  const { getAuth } = useAuthstore(state => state);

  const timerIdRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState({
    date: new Date(), // 검사일자
    exrmCdList: [], // 검사실 코드 리스트
    pid: "",
    isCompleted: false,
  });

  const [selectedPatient, setSelectedPatient] = useState(selectedPtRef.current);

  const [prscList, setPrscList] = useState([]);
  const [result, setResult] = useState({
    origin: resultRef.current,
    current: resultRef.current,
  });

  // PrscDcDialog
  const [prscDcDialogState, setPrscDcDialogState] = useState({
    isOpen: false,
    dcList: [],
  });

  // ReqPrscDialog
  const [reqPrscDialogOpen, setReqPrscDialogOpen] = useState(false);

  // memoDialog
  const [memoDialog, setMemoDialog] = useState({
    open: false,
    data: "",
  });

  // historyDialog
  const [hsitoryOpen, setHistoryOpen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    ...snackbarRef.current,
    onRequestOpen: (message, type) =>
      setSnackbar(prevState => ({ ...prevState, open: true, message, type: type || prevState.type })),
    onRequestClose: () => setSnackbar(prevState => ({ ...prevState, ...snackbarRef.current })),
  });

  // Confirm
  const [confirm, setConfirm] = useState({
    ...confirmRef.current,
    initial: () => setConfirm(prevState => ({ ...prevState, ...confirmRef.current })),
    onClose: (e, type) => (type === "esc" || type === "request") && confirm.initial(),
  });

  // Alert
  const [alert, setAlert] = useState({
    ...alertRef.current,
    initial: () => setAlert(prevState => ({ ...prevState, ...alertRef.current })),
    onOpen: (title, message) => setAlert(prevState => ({ ...prevState, open: true, title, message })),
    onClose: (e, type) => (type === "esc" || type === "request") && alert.initial(),
  });

  const [schedule, setSchdule] = useState({
    open: false,
    type: "",
    onOpen: () => setSchdule(prevState => ({ ...prevState, open: true })),
    onClose: () => setSchdule(prevState => ({ ...prevState, open: false })),
  });

  const [exmnOpnnOpen, setExmnOpnnOpen] = useState(false);

  // 접수현황 목록 그리드
  const mstGrid = useRef(null); // realgrid DOM
  const mstDataProvider = useRef(null);
  const mstGridView = useRef(null);
  const mstMdtrData = useRef(new Map([[ALL_ITEMS_KEY, []]]));

  const [selectedBtnState, setSelectedBtnState] = useState(ALL_ITEMS_KEY);

  const [colorCountList, setColorCountList] = useState([
    {
      code: ALL_ITEMS_KEY,
      name: "전체",
      color: "#FFFFFF",
      count: 0,
    },
  ]);

  const [timePop, setTimePop] = useState(timePopRef.current);
  const [isPrgrPop, setIsPrgrPop] = useState(false);
  const [isBindPatient, setIsBindPatient] = useState(false);

  // 검사처방 목록 그리드
  const dtlGrid = useRef(null);
  const dtlDataProvider = useRef(null);
  const dtlGridView = useRef(null);

  const searchInfoRef = useRef();

  const isButtonDisabled = isBindPatient || prscList.length < 1;
  const isSelectedPatient = selectedPatient.pid;
  const isSelectedCompletedCd = result.current.prsc_prgr_stat_cd === COMPLETED_CD;
  const isEqualResult = lodash.isEqual(result.origin, result.current);

  // 응급환자 설정 알림
  const noti = useNotiStore(state => state.noti);
  const resetNoti = useNotiStore(state => state.resetNoti);
  const checkNoti = useNotiStore(state => state.checkNoti);

  /* ================================================================================== */
  /* 함수(function) 선언 */
  // 검색 패널 변경 이벤트
  const handleChange = ({ type, value, completed }) => {
    const getKey = type => {
      switch (type) {
        case "complete":
          return "pid";
        case "date":
          return "date";
        case "select":
          return "exrmCdList";
        default:
          return "";
      }
    };

    const key = getKey(type);
    if (key) {
      setSearch(prevState => ({
        ...prevState,
        [key]: value,
        ...(type === "complete" && { isCompleted: true }),
      }));
    }
  };

  const handleSearchSelectedRow = gridType => {
    const getGridConfigByType = () => {
      switch (gridType) {
        case "dtl":
          return {
            selected: result.current,
            gridView: dtlGridView,
            identifiers: ["pid", "prsc_date", "prsc_sqno"],
          };
        default:
          return {
            selected: selectedPatient,
            gridView: mstGridView,
            identifiers: mstIdentifiers.current,
          };
      }
    };

    const { selected, gridView, identifiers } = getGridConfigByType(gridType);
    focusOnSelectedRow(selected, gridView, identifiers);
  };

  // 상태 버튼 클릭
  const changeSelectedBtnState = (value = ALL_ITEMS_KEY) => {
    if (value !== selectedBtnState) {
      setSelectedBtnState(value);
    }
    const buttonGroupRows = mstMdtrData.current.get(value);
    mstDataProvider.current.setRows(buttonGroupRows);
  };

  const resetPatientAndViewState = () => {
    setSelectedPatient(selectedPtRef.current);
    setPrscList([]);
    mstGridView.current?.clearCurrent(); // 포커스 해제
  };

  const handleTextChange = (e, type) => {
    setResult(prevState => ({
      ...prevState,
      current: { ...prevState.current, [type]: e.target.value },
    }));
  };

  const bindMstDataAndFocus = (btnState = selectedBtnState) => {
    changeSelectedBtnState(btnState);
    mstGridView.current.clearCurrent();
    handleSearchSelectedRow("mst");
  };

  const updateResultStates = (update = resultRef.current) => {
    setResult(prevState => ({
      ...prevState,
      origin: update,
      current: update,
    }));
  };

  const handleDetail = (selected = selectedPatient) => {
    const params = {
      pid: selected.pid,
      rcpn_sqno: selected.rcpn_sqno,
      prsc_date: selected.prsc_date,
      hope_exrm_cd: selected.hope_exrm_cd,
      prsc_clsf_cd: PRSC_CLSF_CD,
      mdtr_hope_date: selected.mdtr_hope_date,
    };

    (async () => {
      await callApi("/MSC_060000/selectPrscList", params)
        .then(({ resultCode, resultData, resultMsg }) => {
          if (resultCode === 200) {
            setPrscList(resultData);
          } else {
            snackbar.onRequestOpen(Message.networkFail);
          }
        })
        .catch(() => {
          snackbar.onRequestOpen(Message.networkFail);
        });
    })();
  };

  const mstClearAllArrays = () => {
    const masterExamDataMap = mstMdtrData.current;

    // 모든 키에 대해 빈 배열로 초기화
    masterExamDataMap.forEach((_, key) => masterExamDataMap.set(key, []));

    // count state 변경
    const updatedCountList = colorCountList.map(item => ({
      ...item,
      count: 0,
    }));
    setColorCountList(updatedCountList);
  };

  const resetPatientIfNotListed = list => {
    if (!selectedPatient.pid) return;
    const isSelectedPatientExists = list.some(element => element.pid === selectedPatient.pid);
    if (!isSelectedPatientExists) {
      resetPatientAndViewState();
    }
  };

  const updateMasterData = list => {
    const masterDataMap = mstMdtrData.current;

    // 모든 키에 대해 빈 배열로 초기화
    masterDataMap.forEach((_, key) => masterDataMap.set(key, []));

    // 참조값 변경
    list.forEach(element => {
      const statusCd = element.prsc_prgr_stat_cd;
      masterDataMap.get(ALL_ITEMS_KEY).push(element);

      // 상태 코드에 따른 업데이트
      if (!masterDataMap.has(statusCd)) {
        masterDataMap.set(statusCd, []);
      }
      masterDataMap.get(statusCd).push(element);
    });

    // count state 변경
    const updatedCountList = colorCountList.map(item => ({
      ...item,
      count: masterDataMap.get(item.code)?.length || 0,
    }));

    setColorCountList(updatedCountList);
  };

  const updateGridAndResetState = (isExist, resultData) => {
    if (isExist) mstClearAllArrays();
    updateMasterData(resultData);
    changeSelectedBtnState(selectedBtnState);
  };

  const handleNoDataFound = isExist => {
    if (isExist) {
      mstDataProvider.current.setRows([]);
      mstClearAllArrays();
      resetPatientAndViewState();
    }
    snackbar.onRequestOpen(Message.noSearch, "info");
  };

  const fetchDataAndUpdateState = async (params, onSuccess) => {
    try {
      const response = await callApi("/MSC_060000/selectReceptionList", params);

      if (!response || response.resultCode !== 200) {
        snackbar.onRequestOpen(Message.networkFail);
        const errMsg = response?.resultMsg || "API response is null or undefined.";
        console.error(errMsg);
        return;
      }

      const { resultData } = response;

      unactgRef.current?.search(); // 미시행 팝업 조회
      const examDataExists = colorCountList[0].count > 0;

      if (!resultData?.length) {
        handleNoDataFound(examDataExists);
      } else {
        updateGridAndResetState(examDataExists, resultData);
        resetPatientIfNotListed(resultData);
        onSuccess?.();
      }
    } catch (error) {
      snackbar.onRequestOpen(Message.networkFail);
      console.error(error);
    }
  };

  // 물리치료 현황 조회
  const handleSearch = (onSuccess, searchData = search) => {
    const params = {
      mdtr_hope_date: date.getyyyymmdd(searchData.date),
      hope_trrm_dept_sqno: searchData.exrmCdList,
      pid: searchData.pid,
      prsc_clsf_cd: PRSC_CLSF_CD,
    };

    fetchDataAndUpdateState(params, onSuccess);
  };

  // 스낵바 메시지 표시 함수
  const displaySnackbarMessage = (resultCode, statValues, hasRsltRptg) => {
    let messageType = "success";
    let messageKey = statValues[hasRsltRptg ? "specificSuccessMsg" : "successMsg"];

    if (resultCode === 401) {
      messageType = "error";
      messageKey = statValues.noMsg;
    }

    const message = Message[`${MSG_ROUTE}${messageKey}`];
    snackbar.onRequestOpen(message, messageType);
  };

  // 전자서명
  const handleSign = async item => {
    try {
      const signParams = {
        trtm_strt_dt: item.trtm_strt_dt, // 처치시작시간
        trtm_end_dt: item.trtm_end_dt, // 처치종료시간
        mdtr_opnn: item.mdtr_opnn, // 물리치료소견,
      };

      const { dgsgKey } = await signApi(signParams);
      return dgsgKey;
    } catch (error) {
      console.error("API 호출 중 오류 발생:", item, " : ", error);
      throw error;
    }
  };

  // 전자서명
  const handleSignList = async (list, isReport = false) => {
    // 처치종료 취소 시
    const updatedItems = await Promise.all(
      list.map(async item => {
        const dgsgKey = await handleSign(item);
        const updateItem = { ...item, dgsg_no: dgsgKey };
        if (isReport && isElementMatchingSelection(result.current, item)) {
          // 추가 정보 업데이트
          updateItem.mdtr_memo = result.current.mdtr_memo;
          updateItem.mdtr_opnn = result.current.mdtr_opnn;
        }
        return updateItem;
      }),
    );
    return updatedItems;
  };

  const updatePrscList = () => {
    const updateList = [...prscList];

    updateList.forEach((prsc, index) => {
      if (index === result.current.startRow) {
        updateList[index] = {
          ...prsc,
          mdtr_opnn: result.current.mdtr_opnn,
          mdtr_memo: result.current.mdtr_memo,
        };
      }
    });

    if (!lodash.isEqual(prscList, updateList)) {
      setPrscList(updateList);
    }
  };

  const handleChangeResult = useCallback(selectionRow => {
    if (typeof selectionRow !== "number") return;

    const values = dtlGridView.current.getValues(selectionRow);

    const updateStates = {
      startRow: selectionRow, // prscList index
      pid: values.pid,
      prsc_nm: values.prsc_nm,
      prsc_date: values.prsc_date,
      prsc_sqno: values.prsc_sqno,
      prsc_prgr_stat_cd: values.prsc_prgr_stat_cd,
      mdtr_opnn: values.mdtr_opnn,
      mdtr_memo: values.mdtr_memo,
      rcps_id: values.rcps_id,
      rcps_nm: values.rcps_nm,
      rcps_sign: values.rcps_sign,
      trtm_strt_dt: values.trtm_strt_dt,
      trtm_end_dt: values.trtm_end_dt,
      exmn_rslt_rptg_yn: values.exmn_rslt_rptg_yn,
    };

    updateResultStates(updateStates);
  }, []);

  const handleSelection = newPatient => {
    handleDetail(newPatient);
    setSelectedPatient(prevState => ({
      ...prevState,
      ...newPatient,
    }));
    dtlGridView.current.clearCurrent(); // 디테일 포커스 클리어
  };

  const callSaveApi = async (type, dgsgKey = null) => {
    if (!dgsgKey) {
      setIsSaveLoading(false);
      return;
    }

    const params = {
      pid: result.current.pid,
      prsc_date: result.current.prsc_date,
      prsc_sqno: result.current.prsc_sqno,
      mdtr_opnn: result.current.mdtr_opnn,
      mdtr_memo: result.current.mdtr_memo,
      dgsg_no: dgsgKey,
      ...(result.current.prsc_prgr_stat_cd === COMPLETED_CD && { hstr_stat_cd: "1" }),
    };

    try {
      const { resultCode, resultData, resultMsg } = await callApi("/MSC_060000/save", params);

      if (resultCode !== 200) {
        snackbar.onRequestOpen(Message.networkFail);
        console.error(resultMsg);
        return;
      }

      // result State 변경
      setResult(prevState => ({
        ...prevState,
        origin: prevState.current,
      }));

      // 처방 목록 State 변경
      updatePrscList();
      snackbar.onRequestOpen(Message.save, "success");

      if (type?.includes("save")) {
        if (type === TYPE_SAVE_OUT_DTL) {
          handleChangeResult(confirm.startRow);
          handleDetail();
        } else {
          handleSelection(confirm.patient);
        }
        confirm.initial();
      }
    } catch (error) {
      snackbar.onRequestOpen(Message.networkFail);
      console.error(error);
    } finally {
      setIsSaveLoading(false);
    }
  };

  // 보고완료 알림
  const callSendNotiList = (type, detailsList) => {
    const params = {
      type,
      date: moment(selectedPatient.mdtr_hope_date).format("YYYY-MM-DD"),
      exrmClsfCd: MDTR_CLSF_CD,
      detailsList,
      ...selectedPatient,
    };
    callApi("/exam/sendNotiList", params)
      .then(response => {
        if (!response || response.resultCode !== 200) {
          console.error("noti API 호출 실패:", response || "응답 없음");
        }
      })
      .catch(error => console.error("noti API 호출 중 예외 발생:", error));
  };

  /**
   * API 호출을 통해 상태를 업데이트하고, 조건에 따라 알림톡 전송
   *
   * @param {string} type - 처리 유형을 나타내는 문자열
   * @param {Array} detailsList - 상태를 변경할 대상 목록
   * @param {Array} rsltRptgList - (선택적) 알림톡 전송 대상이 되는 보고 목록
   *                               이 목록에 포함된 요소는 detailsList의 부분 집합
   */
  const callUpdateApi = async (type, detailsList, rsltRptgList = []) => {
    const statValues = prscStatCdRef.current.get(type);
    const isReportStatus = type === TYPE_COMPLETE_REPORT || type === TYPE_COMPLETE_REPORT_CALCEL;
    const hasRsltRptg = rsltRptgList.length > 0;

    const params = {
      type,
      detailsList,
    };

    try {
      const { resultCode, resultData, resultMsg } = await callApi("/MSC_060000/reception", params);
      if (resultCode === 200 || resultCode === 401) {
        if (resultCode === 200) {
          if (isReportStatus && hasRsltRptg) {
            callSendNotiList(type, rsltRptgList);
          }
          if (type === TYPE_TRTM_START) {
            (async () => {
              await callApi("/exam/sendPrgrProgressNoti", {
                exrmClsfCd: MDTR_CLSF_CD,
                deptSqno: selectedPatient.hope_exrm_cd,
              });
            })();
          }
        }

        handleSearch(bindMstDataAndFocus);
        handleDetail();
        displaySnackbarMessage(resultCode, statValues, hasRsltRptg);
      } else {
        snackbar.onRequestOpen(Message.networkFail);
        console.error(resultMsg);
      }
    } catch (error) {
      snackbar.onRequestOpen(Message.networkFail);
      console.error(error);
    }
  };

  const updateDetailsAndState = () => {
    handleDetail();
    changeSelectedBtnState(selectedBtnState);
  };

  const handleUpdate = (type, detailsList, rsltRptgList = []) => {
    const updateList = [...detailsList];
    const isReport = type === TYPE_COMPLETE_REPORT;

    // 전자 서명
    if (type === TYPE_TRTM_END_CANCEL || isReport) {
      (async () => {
        try {
          const signList = await handleSignList(updateList, isReport);
          callUpdateApi(type, signList, rsltRptgList);
        } catch (error) {
          console.error("handleSignList에서 오류 발생:", error);
        }
      })();
      return;
    }

    callUpdateApi(type, updateList, rsltRptgList);
  };

  const handleSave = async type => {
    if (isSaveLoading) return;
    setIsSaveLoading(true);

    // 전자서명 프로퍼티 추가
    try {
      const signResult = { ...result.current };
      const dgsgKey = await handleSign(signResult);
      callSaveApi(type, dgsgKey);
    } catch (error) {
      setIsSaveLoading(false);
      console.error("전자서명 호출 중 오류 발생 : ", error);
    }
  };

  const showSnackbarIfNoSelection = checkedList => {
    if (!checkedList.length) {
      snackbar.onRequestOpen(Message[`${MSG_ROUTE}noCheck2`], "info");
      return false;
    }

    return true;
  };

  const handleCheckTrtmStart = () => {
    const checkedRows = dtlGridView.current.getCheckedItems();
    const isSelection = showSnackbarIfNoSelection(checkedRows);

    if (!isSelection) return;

    const { statCd, confirmTitle, noMsg, confirmMsg } = prscStatCdRef.current.get(TYPE_TRTM_START);

    const paramList = [];
    let hasDc = false;

    checkedRows.forEach(checkedIndex => {
      const values = dtlGridView.current.getValues(checkedIndex);

      if (statCd === values.prsc_prgr_stat_cd) {
        if (values.dc_rqst_yn === "Y" && !hasDc) hasDc = true;

        paramList.push(values);
      }
    });

    if (!paramList.length) {
      snackbar.onRequestOpen(Message[`${MSG_ROUTE}${noMsg}`], "error");
    } else if (hasDc) {
      setConfirm(prevState => ({
        ...prevState,
        confirmMsg: Message[`${MSG_ROUTE}${confirmMsg}`],
        open: true,
        title: confirmTitle,
        reqType: TYPE_TRTM_START,
        paramList,
      }));
    } else {
      handleUpdate(TYPE_TRTM_START, paramList);
    }
  };

  const openCancelConfirmByType = (type, paramList, rsltRptgList = []) => {
    const { confirmTitle, confirmMsg } = prscStatCdRef.current.get(type);

    const confirm = {
      confirmMsg: "",
      title: "",
      open: true,
      reqType: type,
      paramList,
    };

    confirm.confirmMsg = Message[`${MSG_ROUTE}${confirmMsg}`];

    if (type === TYPE_TRTM_END_CANCEL) {
      confirm.title = "물리치료 처치종료 취소";
    } else {
      confirm.title = confirmTitle;

      if (type === TYPE_COMPLETE_REPORT_CALCEL) {
        confirm.rsltRptgList = rsltRptgList;
      }
    }

    setConfirm(prevState => ({
      ...prevState,
      ...confirm,
    }));
  };

  const handleCheck = type => {
    const checkedRows = dtlGridView.current.getCheckedItems();
    const isSelection = showSnackbarIfNoSelection(checkedRows);

    if (!isSelection) return;

    const { statCd, noMsg } = prscStatCdRef.current.get(type);

    const paramList = [];
    const rsltRptgList = [];

    checkedRows.forEach(checkedIndex => {
      const values = dtlGridView.current.getValues(checkedIndex);

      // 요청하는 상태 코드와 일치하는 경우 paramList에 추가
      if (statCd === values.prsc_prgr_stat_cd) {
        paramList.push(values);
        // 검사 결과 보고 여부가 'Y'인 경우 rsltRptgList에 추가
        if (values.exmn_rslt_rptg_yn === "Y") {
          rsltRptgList.push(values);
        }
      }
    });

    if (!paramList.length) {
      snackbar.onRequestOpen(Message[`${MSG_ROUTE}${noMsg}`], "error");
    } else if (type === TYPE_COMPLETE_REPORT) {
      if (!isEqualResult) {
        setConfirm(prevState => ({
          ...prevState,
          confirmMsg: Message.saveCheckConfirm,
          open: true,
          title: "물리치료 완료보고",
          reqType: type,
          paramList,
          rsltRptgList,
        }));
      } else {
        handleUpdate(type, paramList, rsltRptgList);
      }
    } else if (!cancelSet.has(type)) {
      handleUpdate(type, paramList);
    } else {
      openCancelConfirmByType(type, paramList, rsltRptgList);
    }
  };

  const handleCancel = () => {
    if (confirm.reqType === TYPE_SAVE_OUT) {
      handleSelection(confirm.patient);
    }
    if (confirm.reqType === TYPE_SAVE_OUT_DTL) {
      handleChangeResult(confirm.startRow);
    }
    confirm.initial();
  };

  const handleConfirm = () => {
    if (confirm.reqType.includes("save")) {
      setConfirm(prevState => ({ ...prevState, open: false }));
      handleSave(confirm.reqType);
    } else {
      handleUpdate(confirm.reqType, confirm.paramList, confirm.rsltRptgList);
      confirm.initial();
    }
  };

  const handleReqDc = () => {
    const checkedRows = dtlGridView.current.getCheckedItems();
    const isSelection = showSnackbarIfNoSelection(checkedRows);

    if (!isSelection) return;

    const { dcList, rcpnList, numAlreadyDc } = checkedRows.reduce(
      (acc, rowIndex) => {
        const row = dtlGridView.current.getValues(rowIndex);
        if (row.prsc_prgr_stat_cd !== "B") return acc; // DC 가능한 상태가 아니면 건너뛰기

        acc.rcpnList.push(row); // DC 가능한 전체 목록에 추가
        if (row.dc_rqst_yn === "Y") {
          acc.numAlreadyDc++; // 이미 DC 요청된 항목 수 증가
        } else {
          acc.dcList.push(row); // DC 요청 가능한 목록에 추가
        }
        return acc;
      },
      { dcList: [], rcpnList: [], numAlreadyDc: 0 },
    );

    if (!rcpnList.length) {
      alert.onOpen("물리치료 DC 불가", Message[`${MSG_ROUTE}noTrtmStartDc`]);
      return;
    }

    if (rcpnList.length === numAlreadyDc) {
      snackbar.onRequestOpen(Message.alreadyDc, "error");
      return;
    }

    setPrscDcDialogState(prevState => ({ ...prevState, isOpen: true, dcList }));
  };

  // 리스트에서 일치하는 항목에 포커스
  const resetButtonsAndFocusOnItem = data => {
    changeSelectedBtnState(ALL_ITEMS_KEY, true);
    if (mstMdtrData.current.get(ALL_ITEMS_KEY).length > 1) {
      const selected = extractProperties(data, mstIdentifiers.current);
      focusOnSelectedRow(selected, mstGridView, mstIdentifiers.current);
    } else {
      mstGridView.current.setCurrent({ itemIndex: 0, column: "column" });
    }
  };

  // 환자 Row 선택 시 콜백 함수
  const handleAdjust = data => {
    if (!data) return;
    const { exmn_hope_date, pid, pt_nm, hope_exrm_cd } = data;
    const exrmCdList = [hope_exrm_cd]; // hope_exrm_cd type string
    const dateObject = new Date(exmn_hope_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")); // "yyyymmdd" 문자열을 "yyyy-mm-dd" 형식 + Date 객체로 변환
    const updateData = { date: dateObject, exrmCdList, pid };

    setSelectedPatient(selectedPtRef.current);
    mstGridView.current?.clearCurrent();
    searchInfoRef.current.setKeyword(`${pid} ${pt_nm}`, data);
    searchInfoRef.current.selectDept(hope_exrm_cd);
    setSearch(prevState => ({ ...prevState, ...updateData }));

    handleSearch(() => resetButtonsAndFocusOnItem(data), updateData);
  };

  const handleClosePrscDcDialog = () => {
    setPrscDcDialogState(prevState => ({ ...prevState, isOpen: false, dcList: [] }));
    dtlGridView.current.setAllCheck(false);
  };

  // 선택한 환자가 있을 경우 초기화
  const resetPatientAndViewAndBtnState = () => {
    resetPatientAndViewState();
    setSelectedBtnState(ALL_ITEMS_KEY); // 버튼 state 초기화
    changeSelectedBtnState(ALL_ITEMS_KEY); // 마스터 그리드 초기화
  };

  // 부서 리스트 조회된 이후 handlerSearch 함수 실행
  const handleDeptListLoaded = exrmCdList => {
    if (!isDeptLoaded) {
      setSearch(prevState => ({ ...prevState, exrmCdList }));
      setIsDeptLoaded(true);
    }
  };

  const handleCloseTime = () => setTimePop(timePopRef.current);

  const handleSaveTime = () => {
    handleDetail();
    handleCloseTime();
  };

  // 검사 예약일
  const handleSchedule = () => {
    handleSearch(updateDetailsAndState);
    schedule.onClose();
  };

  const handleMemoDialogClose = () => {
    setMemoDialog(prevState => ({ ...prevState, open: false }));
  };

  // 치료시간
  const formatDateTimeStringToTime = dateTimeString => {
    if (!dateTimeString) return "";

    const dateTime = new Date(dateTimeString);
    const hours = dateTime.getHours().toString().padStart(2, "0");
    const minutes = dateTime.getMinutes().toString().padStart(2, "0");
    const seconds = dateTime.getSeconds().toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDateString = dateString => {
    // 날짜 객체로 변환
    const date = new Date(dateString);

    // 날짜를 원하는 형식으로 포맷팅
    const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

    return formattedDate;
  };

  const handlePrint = () => {
    const auth = getAuth(166);

    if (!auth) {
      // 사용자 의무기록지 발급권한이 없을 경우
      alert.onOpen(Message.issueAlertTitle, Message.issueAlertMessage);
      return;
    }

    const item = { ...selectedPatient, ...result.current };
    item.trtm_strt_dt = formatDateTimeStringToTime(item.trtm_strt_dt);
    item.trtm_end_dt = formatDateTimeStringToTime(item.trtm_end_dt);
    item.mdtr_hope_date = formatDateString(item.mdtr_hope_date);

    const key = setLocalStorageItem({ ...item });

    if (key) {
      const url = `CSMSP010`;
      const intWidth = 1000; // 팝업 가로사이즈
      const intHeight = window.screen.height - 200; // 팝업 세로사이즈

      // 너비, 높이 및 스크롤바를 설정
      const features = {
        width: intWidth,
        height: window.screen.height - 200,
        left: window.screenX + window.screen.width / 2 - intWidth / 2,
        top: window.screen.height / 2 - intHeight / 2 - 40,
      };

      windowOpen(url, key, features);
    } else {
      snackbar.onRequestOpen(Message.networkFail);
    }
  };

  const patientCallback = pt => {
    if (pt) {
      const { dgns_nm, insn_tycd, exmn_hope_date, mdcr_date, mdcr_sign } = pt;
      setSelectedPatient(prevState => ({
        ...prevState,
        dgns_nm,
        insn_tycd,
        mdtr_hope_date: exmn_hope_date,
        mdcr_date,
        mdcr_sign,
      }));
    }
  };

  // 검사소견 선택
  const handleCopy = data => {
    snackbar.onRequestOpen(Message.copySuccess, "success");
    setResult(prevState => ({
      ...prevState,
      current: { ...prevState.current, mdtr_opnn: data.exmn_opnn_cnts },
    }));
  };

  const handleBind = value => {
    setIsBindPatient(value);
    value ? dtlGridView.current.setCheckableCallback(() => false) : dtlGridView.current.resetCheckables(true);
    dtlGridView.current.setCheckBar({ showAll: !value });
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    const mstCon = mstGrid.current;
    const dtlCon = dtlGrid.current;
    const { dataProvider: mstDp, gridView: mstGv } = initializeGrid(
      mstCon,
      mstGridFields,
      mstGridColumns,
      Message.noSearch,
    );

    const dtlOptions = {
      checkBar: {
        visible: true,
        syncHeadCheck: true,
      },
    };

    const { dataProvider: dtlDp, gridView: dtlGv } = initializeGrid(
      dtlCon,
      dtlGridFields,
      dtlGridColumns,
      Message.noData,
      dtlOptions,
    );

    const updateStateWithCommonCodeData = async () => {
      try {
        const { resultData } = await callApi("/MSC_060000/selectDefault");
        const updatedStateList = resultData.map(({ cmcd_cd, cmcd_nm, cmcd_char_valu1 }) => {
          mstMdtrData.current.set(cmcd_cd, []); // 먼저 맵에 키와 빈 배열을 설정
          return { code: cmcd_cd, name: cmcd_nm, color: cmcd_char_valu1, count: 0 }; // 새로운 요소 생성 후 반환
        });
        const margeList = [...colorCountList, ...updatedStateList];
        setColorCountList(margeList);
        setIsStateFetched(true);
        return margeList;
      } catch (error) {
        ErrorLogInfo();
        console.error(error);
      }
    };

    const handleGridSetup = async () => {
      let list = colorCountList;

      if (!isStateFetched) {
        list = await updateStateWithCommonCodeData();
      }

      if (list) {
        try {
          configureGridImageCallback(mstGv, list, true, true);
          configureGridImageCallback(dtlGv, list, true, true);
        } catch (error) {
          // console.error(error);
        }
      }
    };

    const handleContextMenu = (grid, clickData, validCode) => {
      const contextList = [{ label: "엑셀" }];
      const shouldAddMenu =
        clickData.cellType !== "gridEmpty" && grid.getValue(clickData.itemIndex, "prsc_prgr_stat_cd") === validCode;
      if (shouldAddMenu) {
        const label = validCode === COMPLETED_CD ? "치료 시간 수정" : validCode === START_STAT ? "치료희망일 변경" : "";
        contextList.push({ label });
      }
      grid.setContextMenu(contextList);
    };

    const handleExportGrid = (grid, subName) => {
      grid.exportGrid({
        type: "excel",
        target: "local",
        fileName: `물리치료 ${subName}` + new Date().toString(),
      });
    };

    const handleTimeModification = (grid, clickData) => {
      const clickItem = grid.getValues(clickData.itemIndex);
      setTimePop(prevState => ({
        ...prevState,
        pid: clickItem.pid,
        prsc_date: clickItem.prsc_date,
        prsc_sqno: clickItem.prsc_sqno,
        prsc_nm: clickItem.prsc_nm,
        trtm_strt_dt: clickItem.trtm_strt_dt,
        trtm_end_dt: clickItem.trtm_end_dt,
        prsc_prgr_stat_cd: clickItem.prsc_prgr_stat_cd,
        open: true,
      }));
    };

    const handleContextMenuItem = (grid, item, excelFileName = "", clickData = null) => {
      switch (item.label) {
        case "엑셀":
          handleExportGrid(grid, excelFileName);
          break;
        case "치료희망일 변경":
          schedule.onOpen();
          break;
        case "치료 시간 수정":
          handleTimeModification(grid, clickData);
          break;
        default:
          break;
      }
    };

    mstGv.onContextMenuPopup = (grid, x, y, clickData) => handleContextMenu(grid, clickData, START_STAT);

    mstGv.onContextMenuItemClicked = (grid, item) => handleContextMenuItem(grid, item, "접수 현황");

    dtlGv.onCellClicked = (grid, clickData) => {
      if (clickData?.column === "prsc_memo") {
        const values = grid.getValue(clickData.itemIndex, clickData.column);
        if (values) {
          setMemoDialog(prevState => ({ ...prevState, open: true, data: values }));
        }
      }
    };

    dtlGv.onContextMenuPopup = (grid, x, y, clickData) => handleContextMenu(grid, clickData, COMPLETED_CD);

    dtlGv.onContextMenuItemClicked = (grid, item, clickData) =>
      handleContextMenuItem(grid, item, "처방 목록", clickData);

    handleGridSetup();
    mstDataProvider.current = mstDp;
    mstGridView.current = mstGv;
    dtlDataProvider.current = dtlDp;
    dtlGridView.current = dtlGv;

    return () => {
      destroyGrid(mstDp, mstGv);
      destroyGrid(dtlDp, dtlGv);
      mstDataProvider.current = null;
      mstGridView.current = null;
      dtlDataProvider.current = null;
      dtlGridView.current = null;
    };
  }, []);

  useEffect(() => {
    if (isStateFetched && isDeptLoaded) handleSearch(changeSelectedBtnState);
  }, [isStateFetched, isDeptLoaded]);

  useEffect(() => {
    // SmartComplete 자동완성 검색 시
    if (search.isCompleted) {
      setSearch(prevState => ({ ...prevState, isCompleted: false }));
      handleSearch(resetPatientAndViewAndBtnState);
    }
  }, [search]);

  useEffect(() => {
    dtlDataProvider.current.setRows(prscList);
    dtlGridView.current.setAllCheck(false);

    const currentIndex = dtlGridView.current.getCurrent().itemIndex;

    if (currentIndex !== -1) {
      // 처방 목록이 변경됨에 따라 result State 변경
      handleChangeResult(currentIndex);
    }
  }, [prscList, START_STAT, handleChangeResult]);

  useEffect(() => {
    if (prscList.length && result.current.pid && selectedPatient.pid !== result.current.pid) {
      updateResultStates();
    }
  }, [selectedPatient.pid, result, prscList]);

  useEffect(() => {
    dtlGridView.current.onSelectionChanged = (grid, selection) => {
      const { startRow } = selection;
      if (result.origin.startRow !== startRow && !isEqualResult) {
        setConfirm(prevState => ({
          ...prevState,
          confirmMsg: Message.saveCheckConfirm,
          open: true,
          title: "결과입력 나가기",
          reqType: TYPE_SAVE_OUT_DTL,
          startRow,
        }));
      } else {
        handleChangeResult(startRow);
      }
    };
  }, [result, isEqualResult, handleChangeResult]);

  useEffect(() => {
    if (!selectedPatient.pid) {
      setPrscList([]);
    }

    mstGridView.current.onSelectionChanged = (grid, selection) => {
      const prevPatient = extractProperties(selectedPatient);
      const values = grid.getValues(selection.startRow);
      let newPatient = extractProperties(values);

      const isEqual = lodash.isEqual(prevPatient, newPatient);

      if (isEqual) return;

      newPatient = {
        ...newPatient,
        ...values,
      };

      if (!isEqual) {
        if (!isEqualResult) {
          setConfirm(prevState => ({
            ...prevState,
            confirmMsg: Message.saveCheckConfirm,
            open: true,
            title: "결과입력 나가기",
            reqType: TYPE_SAVE_OUT,
            patient: newPatient,
          }));
        } else {
          handleSelection(newPatient);
        }
      }
    };
  }, [selectedPatient, isEqualResult]);

  useEffect(() => {
    // 초기 timerId 참조
    const initialTimerId = timerIdRef.current;

    if (isLoading) {
      // 로딩이 true 일 때, 새로운 타이머 설정
      timerIdRef.current = setTimeout(() => openLoading(), 300);
    } else if (initialTimerId) {
      // 로딩이 false이고 타이머가 설정되어 있을 때, 타이머 정리
      closeLoading(false);
      clearTimeout(initialTimerId);
      timerIdRef.current = null;
    }

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (initialTimerId) {
        clearTimeout(initialTimerId);
      }
      closeLoading(false);
    };
  }, [isLoading]);

  // 응급환자 새로고침
  useEffect(() => {
    if (checkNoti()) {
      handleSearch();
      resetNoti();
    }
  }, [noti]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="MSC_060100 dp_full">
      <div className="align_box">
        <div className={`align_top ${selectedPatient.pid ? "patient_info_wrap" : ""}`}>
          <PatientSummaryBar
            pageId={PAGE_ID}
            pid={selectedPatient.pid}
            rcpn_sqno={selectedPatient.rcpn_sqno}
            prsc_clsf_cd={PRSC_CLSF_CD}
            hope_exrm_cd={selectedPatient.hope_exrm_cd}
            insn_tycd={selectedPatient.insn_tycd}
            patientCallback={patientCallback}
            exmn_hope_date={selectedPatient.mdtr_hope_date}
            ref={patientRef}
            handleBind={handleBind}
          />
          <div className="right_box">
            <LUXButton
              label="물리치료 경과기록 조회"
              onClick={() => setIsPrgrPop(true)}
              disabled={!isSelectedPatient}
              type="small"
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
                    <h3 className="title">물리치료실 접수 현황</h3>
                  </div>
                </div>
                <div className="right_box">
                  <UnactgUncmplDialog
                    ref={unactgRef}
                    onAdjust={handleAdjust}
                    stateList={colorCountList}
                    prscClsfCd="F1"
                    hopeExrmDeptSqnoList={search.exrmCdList}
                  />
                </div>
              </div>
              <div className="sec_content">
                <SearchInfo
                  exrmClsfCd={MDTR_CLSF_CD}
                  date={search.date}
                  ref={searchInfoRef}
                  handleChange={handleChange}
                  handleSearch={() => handleSearch(resetPatientAndViewAndBtnState)}
                  onDeptListLoaded={handleDeptListLoaded}
                />
              </div>
            </div>
            <div className="sec_wrap full_size">
              <div className="sec_content">
                <div className="donut_box">
                  <div className="chart_box">
                    <DoughnutChart arrStates={colorCountList} />
                  </div>
                </div>
              </div>
            </div>
            <div className="sec_wrap full_size2">
              <div className="sec_content">
                <StateBtnGroup
                  arrStates={colorCountList}
                  onClickStateBtnGrp={value => bindMstDataAndFocus(value)}
                  strSelectedStateBtn={selectedBtnState}
                />
                <div className="grid_box" ref={mstGrid} />
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
                    <h3 className="title">물리치료 처방 목록</h3>
                  </div>
                </div>
                <div className="right_box">
                  <LUXButton
                    label="처치시작"
                    onClick={() => handleCheckTrtmStart()}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="처치취소"
                    onClick={() => handleCheck(TYPE_TRTM_START_CANCEL)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="처치종료"
                    onClick={() => handleCheck(TYPE_TRTM_END)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="처치종료 취소"
                    onClick={() => handleCheck(TYPE_TRTM_END_CANCEL)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="완료/보고"
                    onClick={() => handleCheck(TYPE_COMPLETE_REPORT)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="완료/보고 취소"
                    onClick={() => handleCheck(TYPE_COMPLETE_REPORT_CALCEL)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton label="DC요청" onClick={handleReqDc} disabled={isButtonDisabled} type="small" />
                  <LUXButton
                    label="처방요청"
                    onClick={() => setReqPrscDialogOpen(true)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                </div>
              </div>
              <div className="sec_content" ref={dtlGrid} />
            </div>

            <div className="sec_wrap type_counted_patient full_size">
              <div className="binder">
                <div className="sec_header">
                  <div className="left_box">
                    <div className="sec_title">
                      <div className="title">물리치료 소견</div>
                    </div>
                  </div>
                  <div className="right_box">
                    <LUXButton
                      label="치료소견"
                      onClick={() => setExmnOpnnOpen(true)}
                      type="small"
                      disabled={!isSelectedCompletedCd}
                    />
                  </div>
                </div>
                <div className="sec_content">
                  <LUXTextArea
                    defaultValue={result.current.mdtr_opnn}
                    hintText="작성된 치료소견이 없습니다."
                    onChange={e => handleTextChange(e, "mdtr_opnn")}
                    fullWidth
                    disabled={!isSelectedCompletedCd}
                    style={{ height: "100%" }}
                    rootStyle={{ height: "100%" }}
                    textAreaBoxStyle={{ height: "100%" }}
                    resize={false}
                  />
                </div>
              </div>
              <div className="binder">
                <div className="sec_header">
                  <div className="left_box">
                    <div className="sec_title">
                      <div className="title">물리치료실 MEMO</div>
                    </div>
                  </div>
                </div>
                <div className="sec_content">
                  <LUXTextArea
                    defaultValue={result.current.mdtr_memo}
                    hintText="작성된 메모가 없습니다."
                    onChange={e => handleTextChange(e, "mdtr_memo")}
                    fullWidth
                    disabled={!isSelectedCompletedCd}
                    style={{ height: "100%" }}
                    rootStyle={{ height: "100%" }}
                    textAreaBoxStyle={{ height: "100%" }}
                    resize={false}
                  />
                </div>
              </div>
            </div>
            <div className="sec_footer">
              <div className="option_box">
                <LUXButton label="이력관리" disabled={!result.current.pid} onClick={() => setHistoryOpen(true)} />
                <LUXButton
                  label="저장"
                  blue={isSelectedCompletedCd}
                  disabled={!isSelectedCompletedCd}
                  onClick={() => handleSave()}
                />
                <LUXButton label="출력" onClick={handlePrint} disabled={result.current.prsc_prgr_stat_cd !== RPTG_CD} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 이력관리 */}
      <HistoryDialog
        open={hsitoryOpen}
        prscClsfCd={MDTR_CLSF_CD}
        onClose={() => setHistoryOpen(false)}
        exmnInfo={{ ...selectedPatient, ...result.current }}
      />
      <MSC100100P01
        opnnType={MDTR_CLSF_CD}
        dialogOpen={exmnOpnnOpen}
        onClose={() => setExmnOpnnOpen(false)}
        onCopy={handleCopy}
      />
      <PrscDcDialog
        open={prscDcDialogState.isOpen}
        handleClose={handleClosePrscDcDialog}
        ptInfo={selectedPatient}
        dcList={prscDcDialogState.dcList}
        handleSave={() => handleSearch(updateDetailsAndState)}
        type={PAGE_ID}
        exrmClsfCd={MDTR_CLSF_CD}
      />
      <ReqPrscDialog
        open={reqPrscDialogOpen}
        setOpen={setReqPrscDialogOpen}
        patient={selectedPatient}
        exrmClsfCd={MDTR_CLSF_CD}
      />
      {snackbar.open
        ? withPortal(
            <LUXSnackbar
              message={snackbar.message}
              onRequestClose={snackbar.onRequestClose}
              open={snackbar.open}
              type={snackbar.type}
            />,
            "snackbar",
          )
        : null}
      {withPortal(
        <LUXConfirm
          message={confirm.confirmMsg}
          title={confirm.title}
          open={confirm.open}
          cancelButton={handleCancel}
          confirmButton={handleConfirm}
          onClose={confirm.onClose}
          useIcon
          useIconType="success"
        />,
        "dialog",
      )}
      {withPortal(
        <LUXAlert
          message={alert.message}
          useIcon
          useIconType={alert.useIconType}
          title={alert.title}
          open={alert.open}
          confirmButton={alert.initial}
          onClose={alert.onClose}
        />,
        "dialog",
      )}
      {withPortal(
        <MemoDialog
          title="처방메모"
          handleMemoDialogClose={handleMemoDialogClose}
          open={memoDialog.open}
          data={memoDialog.data}
        />,
        "dialog",
      )}
      {withPortal(
        <ScheduleDateDialog
          open={schedule.open}
          data={prscList}
          ptInfo={selectedPatient}
          onClose={schedule.onClose}
          onSave={handleSchedule}
          type={true}
        />,
        "dialog",
      )}
      {withPortal(
        <MSC_060100_P01 open={timePop.open} onClose={handleCloseTime} onSave={handleSaveTime} timePop={timePop} />,
        "dialog",
      )}
      {withPortal(
        <MSC_060100_P02 open={isPrgrPop} onClose={() => setIsPrgrPop(false)} pid={selectedPatient.pid} />,
        "dialog",
      )}
    </div>
  );
}

export default WithWrapper(MSC_060100);
