import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// common-ui-components
import { LUXAlert, LUXButton, LUXConfirm, LUXSnackbar } from "luna-rocket";
import LUXSplitButton from "luna-rocket/LUXSplitButton";
import PatientSummaryBar from "components/Common/PatientSummaryBar";
import SearchInfo from "components/Common/SearchInfo";
import DoughnutChart from "components/Common/DoughnutChart";
import StateBtnGroup from "components/Common/StateBtnGroup";
import Message from "components/Common/Message";

// util
import { date, lodash } from "common-util/utils";
import callApi from "services/apis";
import { getImageBadgeDataApi } from "services/apis/recordsApi";
import { windowOpen } from "services/utils/popupUtil";
import withPortal from "hoc/withPortal";
import { wrcnOpen } from "services/utils/wrcnPopupUtill";
import { setLocalStorageItem } from "services/utils/localStorage";
import { receptionStatus, focusOnSelectedRow, extractProperties } from "services/utils/examDataDefinitions";
import {
  setUserGridColumnOption,
  getUserGridColumnOption,
  initializeGrid,
  destroyGrid,
  configureGridImageCallback,
} from "services/utils/grid/RealGridUtil";
import {
  groupedDataColumns,
  groupedDataFields,
  prscInfoColumns,
  prscInfoFields,
} from "services/utils/grid/realgridData";
import { ValueType } from "realgrid";
import moment from "moment";
import useNotiStore from "services/utils/zustand/useNotiStore";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";

// dialog
import UnactgUncmplDialog from "components/Common/UnactgUncmplDialog";
import PrscDcDialog from "components/Common/PrscDcDialog";
import ReqPrscDialog from "components/Common/ReqPrscDialog";
import ScheduleDateDialog from "components/Common/ScheduleDateDialog";
import { ErrorLogInfo } from "cliniccommon-ui";
import MemoDialog from "components/Common/MemoDialog";

// css
import "assets/style/MSC_050100.scss";

/**
 * @name 내시경검사 접수
 * @author 윤서영
 * * @note
 * * 2023-10-18 김령은 수정 : 코드 리팩토링, 버그 수정, 기능 추가
 */

function MSC_050100() {
  /* ================================================================================== */
  /* 상수케이스 선언 */
  const CLSF = "CS1008";
  const EXRM_CLSF_CD = "E";
  const RECEPTION_STATS = ["B", "C", "E"];
  const DEFAULT_STAT = RECEPTION_STATS[0]; // 검사대기
  const PRSC_CLSF_CD = "C3"; // 처방분류코드
  const GI_SITE_CD = "S"; // 치료부위코드:위장
  const COLON_SITE_CD = "C"; // 치료부위코드:대장

  const TYPE_RECEIPT = "Receipt";
  const TYPE_RECEIPT_CANCEL = "ReceiptCancel";
  const TYPE_CONDUCT = "Conduct";
  const TYPE_CONDUCT_CANCEL = "ConductCancel";

  const DTL_MENU_KEY = "MSC_050100_DtlGrid";
  const ALL_ITEMS_KEY = "0";

  // 팝업 코드
  const AGREEMENT_GI = "EMR_V_T0032"; // 위 내시경 동의서
  const AGREEMENT_COLON = "EMR_V_T0035"; // 대장 내시경 동의서
  const RECORD_ENDO = "CSMSP007"; // 진정기록지
  const MANUAL_GI = "CSMSP005"; // 위내시경 설명서
  const MANUAL_COLON = "CSMSP006"; // 대장내시경 설명서

  /* 상태(state) 선언 */
  const patientRef = useRef(null);

  const selectedPtRef = useRef({
    pid: "",
    pt_nm: "",
    prsc_date: "",
    rcpn_sqno: "",
    hope_exrm_cd: "",
    exmn_hope_date: "",
    age_cd: "",
    mdcr_date: "",
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
  });

  const alertRef = useRef({
    message: "",
    useIconType: "warning",
    title: "",
    open: false,
  });

  const unactgRef = useRef(null);

  const prscStatCdRef = useRef(receptionStatus);

  const [search, setSearch] = useState({
    date: new Date(), // 검사일자
    exrmCdList: [], // 검사실 코드 리스트
    pid: "",
    isCompleted: false,
  });

  // 조회 시 필요한 데이터 가져왔는지 확인
  const [isExamStateFetched, setIsExamStateFetched] = useState(false);
  const [isDeptLoaded, setIsDeptLoaded] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(selectedPtRef.current);
  const [examPrscList, setExamPrscList] = useState([]);

  // PrscDcDialog
  const [prscDcDialogState, setPrscDcDialogState] = useState({
    isOpen: false,
    dcList: [],
  });

  // ReqPrscDialog
  const [reqPrscDialogOpen, setReqPrscDialogOpen] = useState(false);

  const [memoDialog, setMemoDialog] = useState({
    isExm: false,
    open: false,
    data: "",
  });

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
    onOpen: (confirmMsg, title, reqType, paramList) =>
      setConfirm(prevState => ({ ...prevState, open: true, confirmMsg, title, reqType, paramList })),
    onClose: (e, type) => (type === "esc" || type === "request") && confirm.initial(),
  });

  // Alert
  const [alert, setAlert] = useState({
    ...alertRef.current,
    initial: () => setAlert(prevState => ({ ...prevState, ...alertRef.current })),
    onOpen: (title, message, useIconType) =>
      setAlert(prevState => ({
        ...prevState,
        open: true,
        title,
        message,
        useIconType: useIconType || prevState.useIconType,
      })),
    onClose: (e, type) => (type === "esc" || type === "request") && alert.initial(),
  });

  const [schedule, setSchdule] = useState({
    open: false,
    data: [],
    type: "",
    onOpen: (data, type) => setSchdule(prevState => ({ ...prevState, open: true, data, type })),
    onClose: () => setSchdule(prevState => ({ ...prevState, open: false, data: [], type: "" })),
  });

  // 접수현황 목록 그리드
  const mstGrid = useRef(null); // realgrid DOM
  const mstDataProvider = useRef(null);
  const mstGridView = useRef(null);
  const mstExamData = useRef(new Map([[ALL_ITEMS_KEY, []]]));

  const [selectedBtnState, setSelectedBtnState] = useState(ALL_ITEMS_KEY);

  const [colorExamCountList, setColorExamCountList] = useState([
    {
      code: ALL_ITEMS_KEY,
      name: "전체",
      color: "#FFFFFF",
      count: 0,
    },
  ]);

  const initialSplitBtnValue = useRef([
    { key: 0, value: "동의서/기록지", checked: false },
    { key: AGREEMENT_GI, value: "위내시경 동의서", disabled: true },
    { key: AGREEMENT_COLON, value: "대장내시경 동의서", disabled: true },
    { key: RECORD_ENDO, value: "진정기록지", disabled: true, mdtrSiteCd: new Set() },
    { key: MANUAL_GI, value: "위내시경 설명서", disabled: true },
    { key: MANUAL_COLON, value: "대장내시경 설명서", disabled: true },
  ]);

  const [splitBtnValue, setSplitBtnValue] = useState(initialSplitBtnValue.current);
  const [isDisabledSplit, setIsDisabledSplit] = useState(true);

  const [isBindPatient, setIsBindPatient] = useState(false);

  // 검사처방 목록 그리드
  const dtlGrid = useRef(null);
  const dtlDataProvider = useRef(null);
  const dtlGridView = useRef(null);

  const searchInfoRef = useRef();

  const isButtonDisabled = isBindPatient || examPrscList.length < 1;

  // 응급환자 설정 알림
  const noti = useNotiStore(state => state.noti);
  const resetNoti = useNotiStore(state => state.resetNoti);
  const checkNoti = useNotiStore(state => state.checkNoti);

  const location = useLocation();

  /* ================================================================================== */
  /* 함수(function) 선언 */
  // 검색 패널 변경 이벤트
  const handleChange = ({ type, value }) => {
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

  // 버튼 state 를 변경하는 함수
  // value: 선택된 버튼의 값
  // isClear: true인 경우 현재 포커스를 해제
  // isSearch: true인 경우 포커스 행 검색
  const changeSelectedBtnState = (value, isClear = false, isSearch = false) => {
    if (value !== selectedBtnState) {
      setSelectedBtnState(value);
    }

    const buttonGroupRows = mstExamData.current.get(value);
    mstDataProvider.current.setRows(buttonGroupRows);

    // 포커스 해제
    if (isClear) {
      mstGridView.current.clearCurrent();
    }

    // 포커스 행 검색
    if (isSearch) {
      focusOnSelectedRow(selectedPatient, mstGridView);
    }
  };

  const validateApiResponse = response => {
    if (!response || response.resultCode !== 200) {
      snackbar.onRequestOpen(Message.networkFail);
      const errMsg = response?.resultMsg || "API response is null or undefined.";
      console.error(errMsg);
      return false;
    }
    return true;
  };

  // 상세 내역 조회
  const handleDetail = async (selected = selectedPatient) => {
    try {
      const params = {
        pid: selected.pid,
        rcpn_sqno: selected.rcpn_sqno,
        prsc_date: selected.prsc_date,
        hope_exrm_cd: selected.hope_exrm_cd,
        prsc_clsf_cd: PRSC_CLSF_CD,
        endo_flag: "Y",
        exmn_hope_date: selected.exmn_hope_date,
      };

      const response = await callApi("/exam/selectPrscList", params);
      if (!validateApiResponse(response)) {
        return;
      }
      setExamPrscList(response.resultData);
    } catch (error) {
      snackbar.onRequestOpen(Message.networkFail);
      console.error(error);
    }
  };

  const mstClearAllArrays = () => {
    const masterExamDataMap = mstExamData.current;

    // 모든 키에 대해 빈 배열로 초기화
    masterExamDataMap.forEach((_, key) => masterExamDataMap.set(key, []));

    // count state 변경
    const updatedCountList = colorExamCountList.map(item => ({
      ...item,
      count: 0,
    }));
    setColorExamCountList(updatedCountList);
  };

  const resetPatientAndViewState = () => {
    setSelectedPatient(selectedPtRef.current);
    setExamPrscList([]);
    mstGridView.current.clearCurrent(); // 포커스 해제
  };

  const resetPatientAndViewAndBtnState = () => {
    resetPatientAndViewState();
    setSelectedBtnState(ALL_ITEMS_KEY); // 버튼 state 초기화
    changeSelectedBtnState(ALL_ITEMS_KEY); // 마스터 그리드 초기화
  };

  const resetPatientIfNotListed = list => {
    if (!selectedPatient.pid) return;
    const isSelectedPatientExists = list.some(element => element.pid === selectedPatient.pid);
    if (!isSelectedPatientExists) {
      resetPatientAndViewState();
    }
  };

  const updateMasterExamData = list => {
    const masterExamDataMap = mstExamData.current;

    // 모든 키에 대해 빈 배열로 초기화
    masterExamDataMap.forEach((_, key) => masterExamDataMap.set(key, []));

    // 리스트를 순회하며 데이터 업데이트
    list.forEach(element => {
      const statusCd = element.prsc_prgr_stat_cd;
      masterExamDataMap.get(ALL_ITEMS_KEY).push(element);

      // 상태 코드에 따른 업데이트
      if (!masterExamDataMap.has(statusCd)) {
        masterExamDataMap.set(statusCd, []);
      }
      masterExamDataMap.get(statusCd).push(element);
    });

    // count 상태 업데이트
    const updatedCountList = colorExamCountList.map(item => ({
      ...item,
      count: masterExamDataMap.get(item.code)?.length || 0,
    }));
    setColorExamCountList(updatedCountList);
  };

  const updateGridAndResetState = (isExist, resultData) => {
    if (isExist) mstClearAllArrays();
    updateMasterExamData(resultData);
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
      const response = await callApi("/exam/selectReceptionList", params);

      if (!validateApiResponse(response)) {
        return;
      }

      const { resultData } = response;

      unactgRef.current?.search(); // 미시행 팝업 조회
      const examDataExists = colorExamCountList[0].count > 0;

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

  // 그리드 조회 및 검색
  const handleSearch = (onSuccess, searchData = search) => {
    const params = {
      exmn_hope_date: date.getyyyymmdd(searchData.date),
      hope_exrm_cd: searchData.exrmCdList,
      pid: searchData.pid,
      prsc_clsf_cd: PRSC_CLSF_CD,
      endo_flag: "Y",
    };
    fetchDataAndUpdateState(params, onSuccess);
  };

  const updateDetailsAndState = () => {
    handleDetail();
    changeSelectedBtnState(selectedBtnState, false, true);
  };

  const handleUpdate = async (type, detailsList, isPartExmnSuccessMsg = false) => {
    await callApi("/MSC_050000/reception", { type, detailsList })
      .then(({ resultCode, resultData, resultMsg }) => {
        if (resultCode === 200 || resultCode === 401) {
          if (resultCode === 200 && (type === TYPE_RECEIPT || type === TYPE_CONDUCT)) {
            (async () => {
              await callApi("/exam/sendPrgrProgressNoti", {
                exrmClsfCd: EXRM_CLSF_CD,
                deptSqno: selectedPatient.hope_exrm_cd,
              });
            })();
          }

          handleSearch(updateDetailsAndState);
          const { successMsg } = prscStatCdRef.current.get(type);
          let snackMsg = isPartExmnSuccessMsg ? Message.partExmnSuccess : Message[successMsg];
          let snackType = "success";

          if (resultCode === 401) {
            snackMsg = resultData === "N" ? Message.rptgExistFail : Message.interimReportExistFail;
            snackType = "error";
          }

          snackbar.onRequestOpen(snackMsg, snackType);
        } else {
          snackbar.onRequestOpen(Message.networkFail);
          console.error(resultMsg);
        }
      })
      .catch(() => {
        snackbar.onRequestOpen(Message.networkFail);
      });
  };

  const showSnackbarIfNoSelection = checkedList => {
    if (!checkedList.length) {
      snackbar.onRequestOpen(Message.noCheck2, "info");
      return false;
    }

    return true;
  };

  const handleCheck = type => {
    const checkedRows = dtlGridView.current.getCheckedItems();
    const isSelection = showSnackbarIfNoSelection(checkedRows);

    if (!isSelection) return;

    const { statCd, title, noMsg, confirmMsg } = prscStatCdRef.current.get(type);

    let paramList = [];
    let hasDc = false;
    let hasWrtnYn = false;

    checkedRows.forEach(checkedIndex => {
      const values = dtlGridView.current.getValues(checkedIndex);
      if (statCd === values.prsc_prgr_stat_cd) paramList.push(values);
      if (values.wrcn_wrtn_yn !== "Y") hasWrtnYn = true;
      if (values.dc_rqst_yn === "Y") hasDc = true;
    });

    if (!paramList.length) {
      snackbar.onRequestOpen(Message[noMsg], "error");
    } else if (type === TYPE_RECEIPT_CANCEL || type === TYPE_CONDUCT_CANCEL || (type === TYPE_RECEIPT && hasDc)) {
      confirm.onOpen(Message[confirmMsg], title, type, paramList);
    } else if (type === TYPE_RECEIPT && hasWrtnYn) {
      alert.onOpen("내시경검사 동의 필요", Message.MSC_050000_disagree, "error");
      paramList = paramList.filter(list => list.wrcn_wrtn_yn === "Y");

      if (paramList.length) {
        handleUpdate(type, paramList, hasWrtnYn);
      }
    } else {
      handleUpdate(type, paramList);
    }
  };

  // 리스트에서 일치하는 항목에 포커스
  const resetButtonsAndFocusOnItem = (data, properties) => {
    changeSelectedBtnState(ALL_ITEMS_KEY, true);
    if (mstExamData.current.get(ALL_ITEMS_KEY).length > 1) {
      const selected = extractProperties(data, properties);
      focusOnSelectedRow(selected, mstGridView, properties);
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

    resetPatientAndViewState();
    searchInfoRef.current.setKeyword(`${pid} ${pt_nm}`, data);
    searchInfoRef.current.selectDept(hope_exrm_cd);
    setSearch(prevState => ({ ...prevState, ...updateData }));

    // 목록 조회
    handleSearch(() => resetButtonsAndFocusOnItem(data), updateData);
  };

  const handleConfirm = () => {
    if (confirm.reqType === TYPE_RECEIPT) {
      let hasWrtnYn = false;
      const updateList = [];

      confirm.paramList.forEach(value => {
        if (value.wrcn_wrtn_yn !== "Y") {
          hasWrtnYn = true;
        } else {
          updateList.push(value);
        }
      });

      if (hasWrtnYn) {
        alert.onOpen("내시경검사 동의 필요", Message.MSC_050000_disagree, "error");
      }

      if (updateList.length) {
        handleUpdate(confirm.reqType, updateList, hasWrtnYn);
      }
    } else {
      handleUpdate(confirm.reqType, confirm.paramList);
    }
    confirm.initial();
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
      alert.onOpen("내시경 검사 DC 불가", Message.noExmnDc);
      return;
    }

    if (rcpnList.length === numAlreadyDc) {
      snackbar.onRequestOpen(Message.alreadyDc, "error");
      return;
    }

    setPrscDcDialogState(prevState => ({ ...prevState, isOpen: true, dcList }));
  };

  const handleWrcn = async url => {
    if (!url) return;

    const intWidth = 1000; // 팝업 가로사이즈
    const intHeight = window.screen.height - 200; // 팝업 세로사이즈
    const features = {
      width: intWidth,
      height: window.screen.height - 200,
      left: window.screenX + window.screen.width / 2 - intWidth / 2,
      top: window.screen.height / 2 - intHeight / 2 - 40,
    };

    const patient = patientRef.current.getPatientInfo();
    const data = {
      pid: patient.pid,
      rcpn_no: selectedPatient.rcpn_sqno,
      pt_nm: patient.pt_nm,
      sex_cd: patient.sex_cd,
      pt_age: patient.ageWithUnit,
      pt_addr: patient.addr,
      dobr: patient.dobr,
      mdcr_dr_nm: patient.mdcr_dr_nm,
    };

    if (url === AGREEMENT_GI || url === AGREEMENT_COLON) {
      /* 동의서 */
      const checkedRows = dtlGridView.current.getCheckedItems();
      const isSelection = showSnackbarIfNoSelection(checkedRows);

      if (!isSelection) return;

      const paramList = [];
      const code = url === AGREEMENT_GI ? GI_SITE_CD : url === AGREEMENT_COLON ? COLON_SITE_CD : "";

      if (code) {
        for (const checkedIndex of checkedRows) {
          const { prsc_prgr_stat_cd, wrcn_wrtn_yn, mdtr_site_cd } = dtlGridView.current.getValues(checkedIndex);
          if (prsc_prgr_stat_cd === "B" && wrcn_wrtn_yn !== "Y" && mdtr_site_cd === code) {
            paramList.push(dtlGridView.current.getValues(checkedIndex));
          }
        }
      }

      if (!paramList.length) {
        snackbar.onRequestOpen(Message.noCheck2, "info");
      } else {
        wrcnOpen(url, data);

        await callApi("/exam/updatePrscStat", { type: "WrcnWrtn", detailsList: paramList })
          .then(({ resultCode }) => {
            resultCode === 200 ? handleDetail() : snackbar.onRequestOpen(Message.networkFail);
          })
          .catch(() => {
            snackbar.onRequestOpen(Message.networkFail);
          });
      }
    } else if (url === RECORD_ENDO) {
      /* 진정기록지 */
      const item = {
        isPending: true,
        isPrintable: true,
        patient: {
          pid: selectedPatient.pid,
          pt_nm: patient.pt_nm,
          pt_dvcd: patient.pt_dvcd,
          age_cd: selectedPatient.age_cd,
        },
      };
      splitBtnValue.forEach(v => {
        if (v.key === url) item.mdtrSiteList = v.mdtrSiteCd;
      });
      const key = setLocalStorageItem({ ...item });
      key ? windowOpen(url, key, features) : snackbar.onRequestOpen(Message.networkFail);
    } else {
      /* 설명서 */
      windowOpen(url, "", features);
    }
  };

  const handleClosePrscDcDialog = () => {
    setPrscDcDialogState(prevState => ({ ...prevState, isOpen: false, dcList: [] }));
    dtlGridView.current.setAllCheck(false);
  };

  // 부서 리스트 조회된 이후 handlerSearch 함수 실행
  const handleDeptListLoaded = exrmCdList => {
    if (!isDeptLoaded) {
      setSearch(prevState => ({ ...prevState, exrmCdList }));
      setIsDeptLoaded(true);
    }
  };

  const handleReqPrsc = () => setReqPrscDialogOpen(true);

  // 검사 예약일
  const handleSchedule = () => {
    handleSearch(updateDetailsAndState);
    schedule.onClose();
  };

  const handleMemoDialogClose = () => {
    setMemoDialog(prevState => ({ ...prevState, open: false }));
  };

  const handleBind = value => {
    setIsBindPatient(value);
    value ? dtlGridView.current.setCheckableCallback(() => false) : dtlGridView.current.resetCheckables(true);
    dtlGridView.current.setCheckBar({ showAll: !value });
  };

  const initializeSplitBtn = () => {
    setSplitBtnValue(initialSplitBtnValue.current);
    setIsDisabledSplit(true);
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    const mstCon = mstGrid.current;
    const dtlCon = dtlGrid.current;
    const { dataProvider: mstDp, gridView: mstGv } = initializeGrid(
      mstCon,
      groupedDataFields,
      groupedDataColumns,
      Message.noSearch,
    );

    const dtlOptions = {
      checkBar: {
        visible: true,
        syncHeadCheck: true,
      },
    };

    const dtlFields = [
      ...prscInfoFields,
      {
        fieldName: "mdtr_site_cd",
        dataType: ValueType.TEXT,
      },
    ];

    const { dataProvider: dtlDp, gridView: dtlGv } = initializeGrid(
      dtlCon,
      dtlFields,
      prscInfoColumns,
      Message.noData,
      dtlOptions,
    );

    const handleExportGrid = (grid, nameType) => {
      grid.exportGrid({
        type: "excel",
        target: "local",
        fileName: `내시경검사 ${nameType}목록` + moment().format("YYMMDDhhmmss"),
      });
    };

    const handleChangeSplitByChecked = grid => {
      const checkedRows = grid.getCheckedItems();

      // 체크된 행이 없다면, 모든 버튼을 초기화하고 함수 종료
      if (!checkedRows.length) {
        initializeSplitBtn();
        return;
      }

      setIsDisabledSplit(false);

      const activeKeys = new Set();
      const splitList = [...splitBtnValue];
      const mdtrSiteCdSet = new Set();

      activeKeys.add(RECORD_ENDO);

      checkedRows.forEach(checkedIndex => {
        const { wrcn_wrtn_yn, mdtr_site_cd } = grid.getValues(checkedIndex);
        if (mdtr_site_cd === GI_SITE_CD) {
          activeKeys.add(MANUAL_GI);
          if (wrcn_wrtn_yn !== "Y") {
            activeKeys.add(AGREEMENT_GI);
          }
        }
        if (mdtr_site_cd === COLON_SITE_CD) {
          activeKeys.add(MANUAL_COLON);
          if (wrcn_wrtn_yn !== "Y") {
            activeKeys.add(AGREEMENT_COLON);
          }
        }
        mdtrSiteCdSet.add(mdtr_site_cd);
      });

      splitList.forEach(({ key }, index) => {
        if (activeKeys.has(key)) {
          splitList[index] = {
            ...splitList[index],
            disabled: false,
            ...(splitList[index].key === RECORD_ENDO && { mdtrSiteCd: mdtrSiteCdSet }),
          };
        }
      });

      setSplitBtnValue(splitList);
    };

    const updateStateWithCommonCodeData = async () => {
      try {
        const params = {
          clsfList: [CLSF],
          cdList: RECEPTION_STATS,
        };
        const updatedStateList = await getImageBadgeDataApi(params);
        updatedStateList.forEach(({ code }) => mstExamData.current.set(code, []));
        const margeList = [...colorExamCountList, ...updatedStateList];
        setColorExamCountList(margeList);
        setIsExamStateFetched(true);
        return margeList;
      } catch (error) {
        ErrorLogInfo();
      }
    };

    const handleGridSetup = async () => {
      let list = colorExamCountList;

      if (!isExamStateFetched) {
        list = await updateStateWithCommonCodeData();
      }

      if (list) {
        try {
          configureGridImageCallback(mstGv, list, true);
          configureGridImageCallback(dtlGv, list, true);
        } catch (error) {
          // console.error(error);
        }
      }
    };

    mstGv.onContextMenuPopup = (grid, x, y, clickData) => {
      const contextList = [{ label: "엑셀" }];

      if (
        clickData.cellType !== "gridEmpty" &&
        grid.getValue(clickData.itemIndex, "prsc_prgr_stat_cd") === DEFAULT_STAT
      ) {
        contextList.push({ label: "예약" });
      }

      grid.setContextMenu(contextList);
    };

    mstGv.onContextMenuItemClicked = (grid, item) => {
      if (item.label === "엑셀") {
        handleExportGrid(grid, "접수");
      }
      if (item.label === "예약") {
        schedule.onOpen(dtlGridView.current.getJsonRows(), "mst");
      }
    };

    dtlGv.onCellClicked = (grid, clickData) => {
      if (clickData?.column === "prsc_memo") {
        const values = grid.getValue(clickData.itemIndex, clickData.column);
        if (values) {
          setMemoDialog(prevState => ({ ...prevState, open: true, data: values }));
        }
      }
    };

    // 컨텍스트 메뉴 설정
    getUserGridColumnOption(dtlGv, DTL_MENU_KEY, prscInfoColumns, "visible");

    dtlGv.onContextMenuPopup = (grid, x, y, clickData) => {
      const contextList = [{ label: "엑셀" }];
      const menuList = [];

      if (
        clickData.cellType !== "gridEmpty" &&
        grid.getValue(clickData.itemIndex, "prsc_prgr_stat_cd") === DEFAULT_STAT
      ) {
        contextList.push({ label: "예약" });
      }

      prscInfoColumns.forEach(column => {
        if (column.contextVisibility) {
          const contextCol = {
            label: column.header,
            type: "check",
            checked: grid.columnByName(column.name).visible,
            name: column.name,
          };
          menuList.push(contextCol);
        }
      });

      if (menuList.length) {
        contextList.push({ label: "컬럼", children: menuList });
      }

      grid.setContextMenu(contextList);
    };

    dtlGv.onContextMenuItemClicked = (grid, item, clickData) => {
      if (item.label === "엑셀") {
        handleExportGrid(grid, "처방");
      } else if (item.label === "예약") {
        const data = [grid.getValues(clickData.itemIndex)];
        schedule.onOpen(data, "dtl");
      } else {
        grid.columnByName(item.name).visible = item.checked;
        setUserGridColumnOption(DTL_MENU_KEY, item.name, "visible", item.checked);
      }
    };

    dtlGv.onItemChecked = (grid, itemIndex, checked) => handleChangeSplitByChecked(grid);

    dtlGv.onItemAllChecked = (grid, checked) => (!checked ? initializeSplitBtn() : handleChangeSplitByChecked(grid));

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
    // SmartComplete 자동완성 검색 시
    if (search.isCompleted) {
      setSearch(prevState => ({ ...prevState, isCompleted: false }));
      handleSearch(resetPatientAndViewAndBtnState);
    }
  }, [search]);

  useEffect(() => {
    if (isExamStateFetched && isDeptLoaded) {
      if (location.state) {
        // Main 에서 환자 선택 시
        const dateObject = new Date(location.state.exmn_hope_date);
        const updateData = { ...search, date: dateObject, pid: location.state.pid };
        setSearch(prevState => ({ ...prevState, ...updateData }));
        searchInfoRef.current.setKeyword(`${location.state.pid} ${location.state.pt_nm}`, location.state);
        location.state = null;
        handleSearch(null, updateData);
      } else {
        // 마운트 시
        handleSearch(resetPatientAndViewAndBtnState);
      }
    }
  }, [isExamStateFetched, isDeptLoaded]);

  useEffect(() => {
    dtlDataProvider.current.setRows(examPrscList);
    dtlGridView.current.setAllCheck(false);
    if (!examPrscList.length) {
      initializeSplitBtn();
    }
  }, [examPrscList]);

  useEffect(() => {
    initializeSplitBtn();

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
        handleDetail(values);
        setSelectedPatient(prevState => ({
          ...prevState,
          ...newPatient,
        }));
      }
    };
  }, [selectedPatient]);

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
    <div className="MSC_050100 dp_full">
      <div className="align_box">
        <div className={`align_top ${selectedPatient.pid ? "patient_info_wrap" : ""}`}>
          <PatientSummaryBar
            pageId="MSC_050100"
            pid={selectedPatient.pid}
            rcpn_sqno={selectedPatient.rcpn_sqno}
            prsc_clsf_cd="C3"
            hope_exrm_cd={selectedPatient.hope_exrm_cd}
            exmn_hope_date={selectedPatient.exmn_hope_date}
            ref={patientRef}
            handleBind={handleBind}
          />
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
                    <h3 className="title">내시경검사 접수 현황</h3>
                  </div>
                </div>
                <div className="right_box">
                  <UnactgUncmplDialog
                    ref={unactgRef}
                    onAdjust={handleAdjust}
                    stateList={colorExamCountList}
                    prscClsfCd={PRSC_CLSF_CD}
                    hopeExrmDeptSqnoList={search.exrmCdList}
                    endoYn="Y"
                  />
                </div>
              </div>
              <div className="sec_content">
                <SearchInfo
                  exrmClsfCd={EXRM_CLSF_CD}
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
                    <DoughnutChart arrStates={colorExamCountList} />
                  </div>
                </div>
              </div>
            </div>
            <div className="sec_wrap full_size2">
              <div className="sec_content">
                <StateBtnGroup
                  arrStates={colorExamCountList}
                  onClickStateBtnGrp={value => changeSelectedBtnState(value, true, true)}
                  strSelectedStateBtn={selectedBtnState}
                />
                <div className="grid_box" ref={mstGrid} />
              </div>
            </div>
            <ScheduleDateDialog
              open={schedule.open}
              data={schedule.data}
              ptInfo={selectedPatient}
              onClose={schedule.onClose}
              onSave={handleSchedule}
            />
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
                  <LUXSplitButton
                    value={splitBtnValue}
                    size="s"
                    onTouchTap={(e, key) => handleWrcn(key)}
                    disabled={isDisabledSplit}
                  />
                  <LUXButton
                    label="접수"
                    onClick={() => handleCheck(TYPE_RECEIPT)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="접수취소"
                    onClick={() => handleCheck(TYPE_RECEIPT_CANCEL)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="검사"
                    onClick={() => handleCheck(TYPE_CONDUCT)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="검사취소"
                    onClick={() => handleCheck(TYPE_CONDUCT_CANCEL)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton label="DC요청" onClick={handleReqDc} disabled={isButtonDisabled} type="small" />
                  <LUXButton label="처방요청" onClick={handleReqPrsc} disabled={isButtonDisabled} type="small" />
                </div>
              </div>
              <div className="sec_content">
                <div className="grid_box" ref={dtlGrid} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 처방 DC 요청 */}
      <PrscDcDialog
        open={prscDcDialogState.isOpen}
        handleClose={handleClosePrscDcDialog}
        ptInfo={selectedPatient}
        dcList={prscDcDialogState.dcList}
        handleSave={() => handleSearch(updateDetailsAndState)}
        exrmClsfCd={EXRM_CLSF_CD}
      />
      {/* 처방 요청 */}
      <ReqPrscDialog
        open={reqPrscDialogOpen}
        setOpen={setReqPrscDialogOpen}
        patient={selectedPatient}
        exrmClsfCd={EXRM_CLSF_CD}
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
          cancelButton={confirm.initial}
          confirmButton={handleConfirm}
          onClose={confirm.onClose}
          useIcon={true}
          useIconType="success"
        />,
        "dialog",
      )}
      {withPortal(
        <LUXAlert
          message={alert.message}
          useIcon={true}
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
    </div>
  );
}

export default WithWrapper(MSC_050100);
