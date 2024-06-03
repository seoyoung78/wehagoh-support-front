import React, { useEffect, useRef, useState, useReducer, useCallback } from "react";
import { useLocation } from "react-router-dom";

// common-ui-components
import { LUXButton, LUXConfirm, LUXSnackbar, LUXTab, LUXTabs, LUXAlert } from "luna-rocket";
import SearchInfo from "components/Common/SearchInfo";
import StateBtnGroup from "components/Common/StateBtnGroup";
import DoughnutChart from "components/Common/DoughnutChart";
import PatientSummaryBar from "components/Common/PatientSummaryBar";
import Message from "components/Common/Message";
import { ErrorLogInfo } from "cliniccommon-ui";

// dialog
import UnactgUncmplDialog from "components/Common/UnactgUncmplDialog";
import MSC100100P01 from "pages/MSC_100100/MSC_100100_P01";

// util
import {
  editReducer,
  dispatchInitialStates,
  dispatchUpdateStates,
  handleDataChange,
} from "pages/MSC_050000/reducers/editReducer";
import {
  basicKeys,
  resultKeys,
  cmcdCd,
  baseCheckSet,
  baseNumberSet,
  chotBassSet,
  singleCheckSet,
  obsrTimeSet,
  bbpsSet,
  smartPickerSet,
  initializeBaseState,
  codeNameColumn,
  fieldKeys,
} from "pages/MSC_050000/utils/MSC_050000_NameCodesMapping";
import {
  getSmartValue,
  cloneObservationObject,
  initializeDetail,
  mergeObsrMinutesAndSeconds,
  formatToComponentStructure,
  getMdfrClsfSqno,
} from "pages/MSC_050000/utils/MSC_050000_Utils";

import { date, lodash } from "common-util/utils";
import callApi from "services/apis";
import { getImageBadgeDataApi } from "services/apis/recordsApi";
import { signApi } from "services/apis/signApi";
import withPortal from "hoc/withPortal";
import {
  resultStatus,
  extendedPatientIdentifiers as patientIdentifiers,
  focusOnSelectedRow,
  extractProperties,
  isElementMatchingSelection,
} from "services/utils/examDataDefinitions";
import { windowOpen } from "services/utils/popupUtil";
import HistoryDialog from "components/Common/HistoryDialog";
import useLoadingStore from "services/utils/zustand/useLoadingStore";
import { initializeGrid, destroyGrid, configureGridImageCallback } from "services/utils/grid/RealGridUtil";
import { testResultColumns, testResultFields } from "services/utils/grid/realgridData";
import { ValueType } from "realgrid";
import { setLocalStorageItem } from "services/utils/localStorage";
import useAuthstore from "services/utils/zustand/useAuthStore";
import useNotiStore from "services/utils/zustand/useNotiStore";
import moment from "moment";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";

// Tab components
import MSC_050200_T01 from "pages/MSC_050000/MSC_050200/MSC_050200_T01";
import MSC_050200_T02_GSIT from "pages/MSC_050000/MSC_050200/MSC_050200_T02/MSC_050200_T02_Gsit";
import MSC_050200_T02_COLN from "pages/MSC_050000/MSC_050200/MSC_050200_T02/MSC_050200_T02_Coln";

// css
import "assets/style/MSC_050200.scss";

/**
 * @name 내시경검사 결과
 * @author 윤서영
 * * @note
 * * 2023-10-18 김령은 수정 : 코드 리팩토링, 버그 수정, 기능 추가
 * * 2023-11-23 김령은 검사결과 전면 수정(기획 변경)
 */

function MSC_050200() {
  /* ================================================================================== */
  /* 상수케이스 선언 */
  const CLSF = "CS1008";
  const EXRM_CLSF_CD = "E";
  const RESULT_STATS = ["E", "M", "N"];
  const EXAM_RESULT_CD = RESULT_STATS[0];
  const INTERIM_REPORTED = RESULT_STATS[1];
  const FINAL_REPORTED = RESULT_STATS[2];
  const PRSC_STAT_CD = "prsc_prgr_stat_cd"; // 처방분류코드 컬럼명
  const PRSC_CLSF_CD = "C3"; // 처방분류코드
  const GI_SITE_CD = "S"; // 치료부위코드:위장
  const COLON_SITE_CD = "C"; // 치료부위코드:대장
  const TYPE_READING_CANCEL = "readingCancel";
  const TYPE_FINAL = "final";
  const TYPE_FINAL_CANCEL = "finalCancel";
  const TYPE_SAVE = "save";
  const TYPE_SAVE_OUT = "saveOut";
  const TYPE_CVR = "requestNoti";
  const CONFIRM_CANCEL = "cancel";
  const CONFIRM = "confirm";
  const ALL_ITEMS_KEY = "0";

  /* 상태(state) 선언 */
  const patientRef = useRef(null);

  const selectedPatientRef = useRef({
    pid: "",
    pt_nm: "",
    prsc_date: "",
    prsc_cd: "",
    prsc_nm: "",
    prsc_sqno: "",
    mdtr_site_cd: "",
    rcpn_sqno: "",
    hope_exrm_cd: "",
    age_cd: "",
    [PRSC_STAT_CD]: "",
    exmn_hope_date: "",
    iptn_dt: "",
    iptn_prsn_nm: "",
    iptn_sign_lctn: "",
    mdcr_dr_id: "",
    cndt_dt: "",
    mdcr_date: "",
    dobr: "",
    prsc_dr_sqno: "",
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
    patient: {},
  });

  const alertRef = useRef({
    message: "",
    useIconType: "warning",
    title: "",
    open: false,
  });

  const unactgRef = useRef(null);

  const prscStatCdRef = useRef(resultStatus);

  // 파라미터 세팅 시 cmcd_nm 을 가져옴
  const basicNameLookupRef = useRef(new Map());
  const resultNameLookupRef = useRef(new Map());

  const [search, setSearch] = useState({
    date: {
      from: new Date(),
      to: new Date(),
    },
    exrmCdList: [], // 검사실 코드 리스트
    pid: "",
    isCompleted: false,
  });

  // 조회 시 필요한 데이터 가져왔는지 확인
  const [isExamStateFetched, setIsExamStateFetched] = useState(false);
  const [isDeptLoaded, setIsDeptLoaded] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(selectedPatientRef.current);

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

  const [exmnOpnnOpen, setExmnOpnnOpen] = useState(false);
  const [hsitoryOpen, setHistoryOpen] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);

  const commonRef = useRef(initializeBaseState); // 공통코드 참조: 초기화 시 사용

  const [originState, originDispatch] = useReducer(editReducer, initializeBaseState); // [원본] 검사결과 데이터
  const [currentState, currentDispatch] = useReducer(editReducer, initializeBaseState); // [현재] 검사결과 데이터

  const isEqualState = lodash.isEqual(originState, currentState);

  // 결과현황 목록 그리드
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

  const [isBindPatient, setIsBindPatient] = useState(false);

  const { openLoading, closeLoading } = useLoadingStore(state => state);
  const { getAuth } = useAuthstore(state => state);

  const [isLoading, setIsLoading] = useState(false);
  const timerIdRef = useRef(null);

  const searchInfoRef = useRef();

  const isGI = selectedPatient.mdtr_site_cd === GI_SITE_CD; // 위내시경 여부
  const selPrscStatCd = selectedPatient[PRSC_STAT_CD];
  const isEditDisabled = selPrscStatCd === FINAL_REPORTED;
  const isSaveButtonDisabled =
    isBindPatient || !(selPrscStatCd === EXAM_RESULT_CD || (selPrscStatCd === INTERIM_REPORTED && !isEqualState));
  const isButtonDisabled = isBindPatient || !selectedPatient.pid;
  const isCvrButtonDisabled = isBindPatient || (selPrscStatCd !== INTERIM_REPORTED && selPrscStatCd !== FINAL_REPORTED);

  // 응급환자 설정 알림
  const noti = useNotiStore(state => state.noti);
  const resetNoti = useNotiStore(state => state.resetNoti);
  const checkNoti = useNotiStore(state => state.checkNoti);

  const location = useLocation();

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handleChangeData = handleDataChange(currentDispatch);
  const handleUpdateStates = dispatchUpdateStates(currentDispatch);

  const calcBbpsTotalScoreIf = (id, value, updateMap) => {
    if (!bbpsSet.has(id) || updateMap.get(id) === value) {
      return;
    }
    // bbps 총점 계산
    const scoreId = resultKeys.bpreDgreStore;
    const bbpsCmcdList = currentState.resultList.get(cmcdCd[id]);
    const prevCode = updateMap.get(id);
    let bbpsScore = updateMap.get(scoreId);
    bbpsCmcdList.forEach(({ cmcd_cd, cmcd_figr_valu1 }) => {
      if (bbpsScore > 0 && cmcd_cd === prevCode) bbpsScore -= cmcd_figr_valu1;
      if (cmcd_cd === value) bbpsScore += cmcd_figr_valu1;
    });
    updateMap.set(scoreId, bbpsScore);
  };

  // Entries 변경
  const handleChangeCurrent =
    mapKey =>
    (id, value, initId = "", initValue = "") => {
      if (id) {
        const updateMap = new Map(currentState[mapKey]);
        calcBbpsTotalScoreIf(id, value, updateMap);

        if (initId) {
          updateMap.set(initId, initValue);
        }

        updateMap.set(id, value);
        handleChangeData(mapKey, updateMap);
      }
    };

  // LUXTextField 이벤트 핸들러
  const handleText = mapKey => e => {
    if (baseNumberSet.has(e.target.id) && Number.isNaN(+e.target.value)) {
      return;
    }

    const updateMap = new Map(currentState[mapKey]);
    updateMap.set(e.target.id, e.target.value);
    handleChangeData(mapKey, updateMap);
  };

  // LUXCheckBox(리스트) 이벤트 핸들러
  const handleOnChecked =
    mapKey =>
    (checked, id, checkedIndex, initId = "") => {
      const updateList = lodash.cloneDeep(currentState[mapKey]); // 기존의 배열을 복사하여 새로운 Map 생성
      const checkboxes = updateList.get(id);
      checkboxes[checkedIndex] = { ...checkboxes[checkedIndex], checked };
      if (!checked && initId) {
        updateList.set(initId, "");
      }
      updateList.set(id, checkboxes);
      handleChangeData(mapKey, updateList);
    };

  // [리스트] 체크 해제 시 텍스트 필드 내용을 초기화하는 함수
  const resetEtcOnUncheck = mapKey => id => {
    const updateMap = new Map(currentState[mapKey]);
    updateMap.set(id, "");
    handleChangeData(mapKey, updateMap);
  };

  // LUXCheckBox(단일) 이벤트 핸들러
  const handleOnCheckedSingle =
    mapKey =>
    (checked, id, initKey = "") => {
      const updateMap = new Map(currentState[mapKey]); // 기존의 배열을 복사하여 새로운 Map 생성
      let checkbox = updateMap.get(id);
      checkbox = { ...checkbox, checked };
      updateMap.set(id, checkbox);

      if (!checked && initKey) {
        updateMap.set(initKey, "");
      }

      handleChangeData(mapKey, updateMap);
    };

  // 치아상태, 전신상태 이벤트 핸들러(체크박스 + 그 외 항목 조건에 따라 disabled)
  const handleOnCheckedAndDisabled = (checked, id, checkedIndex) => {
    const updateList = lodash.cloneDeep(currentState.basicList); // 기존의 배열을 복사하여 새로운 Map 생성
    const checkboxes = updateList.get(id);
    const anotherCode = "01";

    if (checkboxes[checkedIndex].cmcd_cd === anotherCode) {
      checkboxes.forEach((el, index) => {
        checkboxes[index] = index === checkedIndex ? { ...el, checked } : { ...el, disabled: checked };
      });
    } else {
      let anotherIndex = null;
      let anotherEl = {};
      let unCheckedCount = 1;

      checkboxes.forEach((el, index) => {
        if (index === checkedIndex) {
          checkboxes[index] = { ...el, checked };
        } else if (el.cmcd_cd === anotherCode) {
          if (!checked) {
            anotherIndex = index;
            anotherEl = el;
          } else {
            checkboxes[index] = { ...el, disabled: checked };
          }
        }

        if (!checked && !el.checked) {
          unCheckedCount++;
        }
      });

      if (checkboxes.length === unCheckedCount) {
        checkboxes[anotherIndex] = { ...anotherEl, disabled: false };
      }
    }

    updateList.set(id, checkboxes);
    handleChangeData(fieldKeys.basicFieldList, updateList);
  };

  // 관찰 소견 이벤트 핸들러
  // > ResultList > LIST(관찰소견 리스트) > Object 구조
  const handleObsrChange = (parentIndex, type, paraValue, paraId = "") => {
    let id;
    let value;

    if (type === "eventObject") {
      id = paraValue.target.id;
      value = paraValue.target.value;
    } else {
      id = paraId;
      value = paraValue;
    }

    const updateKey = resultKeys.exmnObsrOpnnSqno;
    const updateLst = lodash.cloneDeep(currentState[fieldKeys.resultFieldList]); // 1. ResultList 클론
    const obsrList = updateLst.get(updateKey); // 2. 관찰소견 리스트 가져오기
    obsrList[parentIndex] = { ...obsrList[parentIndex], [id]: value }; // 3. 관찰소견 리스트에 변경한 값 적용
    updateLst.set(updateKey, obsrList); // 4. map에 업데이트 값 세팅
    handleChangeData(fieldKeys.resultFieldList, updateLst); // 5. 디스패치
  };

  // 관찰 소견 단일 체크박스 이벤트 핸들러
  const handleObsrOnCheckedSingle = (parentIndex, checked, id, initId) => {
    const updateKey = resultKeys.exmnObsrOpnnSqno;
    const updateLst = lodash.cloneDeep(currentState[fieldKeys.resultFieldList]); // 1. ResultList 클론
    const obsrList = updateLst.get(updateKey); // 2. 관찰소견 리스트 가져오기
    obsrList[parentIndex] = { ...obsrList[parentIndex], [id]: { ...obsrList[parentIndex][id], checked } }; // 3. 관찰소견 리스트에 변경한 값 적용

    // 3. 관찰소견 리스트에 변경한 값 적용
    if (!checked && initId) {
      if (initId === resultKeys.tisuExmnRslt2) {
        obsrList[parentIndex] = { ...obsrList[parentIndex], [initId]: { name: "", value: "" } };
      } else {
        obsrList[parentIndex] = { ...obsrList[parentIndex], [initId]: "" };
      }
    }

    updateLst.set(updateKey, obsrList); // 4. map에 업데이트 값 세팅
    handleChangeData(fieldKeys.resultFieldList, updateLst); // 5. 디스패치
  };

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

  const bindingMstGrid = v => {
    const buttonGroupRows = mstExamData.current.get(v);
    mstDataProvider.current.setRows(buttonGroupRows);
  };

  const handleSearchSelectedRow = useCallback(() => {
    focusOnSelectedRow(selectedPatient, mstGridView, patientIdentifiers);
  }, [selectedPatient]);

  // 상태 버튼 클릭
  const changeSelectedBtnState = (value, isClear = false, isSearch = false) => {
    if (value !== selectedBtnState) {
      setSelectedBtnState(value); // 버튼 state 변경
      mstGridView.current.activateAllColumnFilters(PRSC_STAT_CD, false); // 필터 해제
      if (value !== ALL_ITEMS_KEY) {
        // 전체 체크 아니면 필터 처리
        mstGridView.current.activateColumnFilters(PRSC_STAT_CD, value, true);
      }
    }

    try {
      bindingMstGrid(value);
    } catch (error) {
      // console.error(error);
    }

    // 포커스 해제
    if (isClear) {
      mstGridView.current?.clearCurrent();
    }

    // 포커스 행 검색
    if (isSearch) {
      handleSearchSelectedRow();
    }
  };

  const initializeBothStates = (states = lodash.cloneDeep(commonRef.current)) => {
    dispatchInitialStates(originDispatch, states);
    dispatchInitialStates(currentDispatch, states);
  };

  const createDetailStates = (detail, type, listKey, obsrOpnnList = []) => {
    const entries = commonRef.current[type];
    const list = commonRef.current[listKey];
    return initializeDetail(detail, type, entries, list, obsrOpnnList);
  };

  const handleDetailApiCall = async params => {
    try {
      const { resultCode, resultData } = await callApi("/MSC_050000/detail", params);

      if (resultCode === 200) {
        const { basicInfo, resultRecord, obsrOpnn } = resultData;

        const basicDetails = createDetailStates(basicInfo, fieldKeys.basicFieldEntry, fieldKeys.basicFieldList);
        const resultDetails = createDetailStates(
          resultRecord,
          fieldKeys.resultFieldEntry,
          fieldKeys.resultFieldList,
          obsrOpnn,
        );

        const detailStates = {
          basicEntries: basicDetails.detailEntries,
          basicList: basicDetails.detailList,
          resultEntries: resultDetails.detailEntries,
          resultList: resultDetails.detailList,
        };
        initializeBothStates(detailStates);
      } else {
        snackbar.onRequestOpen(Message.networkFail);
      }
    } catch (error) {
      console.error("Error occurred during API call:", error);
      snackbar.onRequestOpen(Message.networkFail);
    }
  };

  // 상세 내역 조회
  const handleDetail = (selected = selectedPatient) => {
    const params = {
      pid: selected.pid,
      prsc_date: selected.prsc_date,
      prsc_sqno: selected.prsc_sqno,
    };

    handleDetailApiCall(params);
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

  const updateSelectedProperties = (selected, element) => {
    selected[PRSC_STAT_CD] = element[PRSC_STAT_CD];
    selected.exmn_hope_date = element.exmn_hope_date;
    selected.prsc_nm = element.prsc_nm;
    selected.iptn_prsn_nm = element.iptn_prsn_nm;
    selected.iptn_dt = element.iptn_dt;
    selected.iptn_sign_lctn = element.iptn_sign_lctn;
  };

  const updateMasterExamData = updateData => {
    const masterExamDataMap = mstExamData.current;
    const selected = { ...selectedPatient };

    // 모든 키에 대해 빈 배열로 초기화
    masterExamDataMap.forEach((_, key) => masterExamDataMap.set(key, []));

    // 참조값 변경
    updateData.forEach(element => {
      const statusCd = element[PRSC_STAT_CD];

      if (isElementMatchingSelection(selected, element)) {
        updateSelectedProperties(selected, element); // selected 메모리 주소 전달하여 값 변경
      }

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

    return selected;
  };

  const refreshPatientState = selected => {
    handleDetail();
    const btnState = selectedBtnState;
    setSelectedPatient(prevState => ({ ...prevState, ...selected }));
    changeSelectedBtnState(btnState, false, true);
  };

  // 그리드 조회 및 검색
  const handleSearch = async (searchData = search) => {
    try {
      const param = {
        exmn_hope_from_date: date.getyyyymmdd(searchData.date.from),
        exmn_hope_to_date: date.getyyyymmdd(searchData.date.to),
        hope_exrm_cd: searchData.exrmCdList,
        prsc_clsf_cd: PRSC_CLSF_CD,
        pid: searchData.pid,
        endo_flag: "Y",
      };

      const { resultCode, resultData, resultMsg } = await callApi("/exam/selectResultList", param);

      if (resultCode === 200) {
        unactgRef.current.search();
        const hasExamData = colorExamCountList[0].count !== 0;

        if (!resultData?.length) {
          if (hasExamData) {
            mstDataProvider.current.setRows([]);
            setSelectedPatient(selectedPatientRef.current);
            mstClearAllArrays();
            initializeBothStates();
          }
          snackbar.onRequestOpen(Message.noSearch, "info");
        } else {
          if (hasExamData) mstClearAllArrays();
          const selected = updateMasterExamData(resultData);
          return { success: true, data: selected };
        }
        return { success: true, data: null };
      }
      return { success: false, message: resultMsg };
    } catch (error) {
      snackbar.onRequestOpen(Message.networkFail);
      return { success: false, message: error.message };
    }
  };

  const resetIfSelcetedPtExists = async () => {
    // 선택한 환자가 있을 경우 우측 영역, 버튼 상태, 포커스 초기화
    if (selectedPatient.pid) {
      setSelectedPatient(selectedPatientRef.current);
      initializeBothStates();
      mstGridView.current.clearCurrent(); // 포커스 해제
    }

    const searchResult = await handleSearch();
    if (searchResult.success) {
      changeSelectedBtnState(ALL_ITEMS_KEY, true);
    }
  };

  // 부서 리스트 조회된 이후 handlerSearch 함수 실행
  const handleDeptListLoaded = exrmCdList => {
    if (!isDeptLoaded) {
      setSearch(prevState => ({ ...prevState, exrmCdList }));
      setIsDeptLoaded(true);
    }
  };

  const createParams = () => {
    const params = {
      // 필수값
      pid: selectedPatient.pid,
      prsc_date: selectedPatient.prsc_date,
      prsc_sqno: selectedPatient.prsc_sqno,
    };
    return params;
  };

  const postProcessForUpdate = async successMsg => {
    const searchResult = await handleSearch();
    if (searchResult.success && searchResult.data) {
      refreshPatientState(searchResult.data);
      // 마스터 그리드 데이터 바인딩
      changeSelectedBtnState(selectedBtnState, false, true);
      snackbar.onRequestOpen(Message[successMsg], "success");
    }
  };

  // 최종보고 알림
  const callSendNoti = type => {
    const params = {
      type,
      date: moment(selectedPatient.cndt_dt).format("YYYY-MM-DD"),
      exrmClsfCd: EXRM_CLSF_CD,
      ...selectedPatient,
    };
    callApi("/exam/sendNoti", params)
      .then(response => {
        if (!response || response.resultCode !== 200) {
          console.error("noti API 호출 실패:", response || "응답 없음");
        }
      })
      .catch(error => console.error("noti API 호출 중 예외 발생:", error));
  };

  const callApiAndUpdateState = async (type, onSuccess, onFailure, customParams) => {
    const { apiType, successMsg } = prscStatCdRef.current.get(type);
    const params = customParams || createParams();
    params.type = apiType;
    let shouldCallUpdateStatusApi = false;
    const isReportStatus = type === TYPE_FINAL || type === TYPE_FINAL_CANCEL;

    if (type === TYPE_READING_CANCEL) {
      // 판독취소 시 전자서명 파라미터 추가
      try {
        const { dgsgKey } = await signApi(null);
        if (dgsgKey) {
          // 전자서명 번호 파라미터 추가
          params.dgsg_no = dgsgKey;
          shouldCallUpdateStatusApi = true;
        }
      } catch (error) {
        console.error("전자서명 api 호출 실패 : ", error);
        setIsLoading(false);
      }
    } else {
      shouldCallUpdateStatusApi = true;
    }

    if (shouldCallUpdateStatusApi) {
      try {
        const { resultCode, resultMsg } = await callApi(`/MSC_050000/result`, params);
        if (resultCode === 200) {
          if (onSuccess) {
            if (isReportStatus) {
              callSendNoti(apiType);
            }
            onSuccess(successMsg);
          }
        } else if (onFailure) {
          onFailure(resultMsg);
        } else {
          snackbar.onRequestOpen(Message.networkFail);
          console.error(resultMsg);
        }
      } catch (error) {
        snackbar.onRequestOpen(Message.networkFail);
        console.error(error);
      } finally {
        // setIsLoading(false);
      }
    } else {
      // setIsLoading(false);
    }
  };

  const handleReadingCancel = () => {
    const { apiType, successMsg } = prscStatCdRef.current.get(TYPE_READING_CANCEL);
    const params = createParams();
    params.type = apiType;

    const addPrefixedParamsToState = (prefix, keys, fieldEntry) => {
      keys.forEach(key => {
        params[`${prefix}_${key}`] = currentState[fieldEntry].get(key);
      });
    };

    const basicKeysList = [basicKeys.endsRcrdSqno, basicKeys.frstRgstDt, basicKeys.frstRgstUsid];
    const recordKeysList = [resultKeys.endsRcrdSqno, resultKeys.frstRgstDt, resultKeys.frstRgstUsid];

    addPrefixedParamsToState("basic", basicKeysList, fieldKeys.basicFieldEntry);
    addPrefixedParamsToState("record", recordKeysList, fieldKeys.resultFieldEntry);

    callApiAndUpdateState(TYPE_READING_CANCEL, postProcessForUpdate, null, params);
  };

  const getColNameAndCmcdNm = (ref, key, value) => {
    const clsf = cmcdCd[key];
    const code = value;
    const colName = codeNameColumn[key];

    if (clsf && colName) {
      const cmcdNm = ref.get(clsf)?.get(code) || "";
      return { colName, cmcdNm };
    }

    return { colName: null, cmcdNm: "" };
  };

  // [퇴실기준] 라디오 버튼 선택 여부에 따라 코드 문자열 생성
  const createRadioSelectionString = (selectionKey, radioOptions) => {
    if (!selectionKey || !radioOptions) return "";

    let codesStr = "";
    let namesStr = "";
    let radioColumnName = "";

    for (const optionName in radioOptions) {
      if (Object.hasOwnProperty.call(radioOptions, optionName)) {
        const code = radioOptions[optionName];
        if (code && chotBassSet.has(optionName)) {
          codesStr += `${codesStr ? "|" : ""}${code}`;

          const { colName, cmcdNm } = getColNameAndCmcdNm(basicNameLookupRef.current, selectionKey, code);
          if (colName) {
            namesStr += `${namesStr ? "|" : ""}${cmcdNm}`;
            radioColumnName = colName;
          }
        }
      }
    }

    return { codesStr, radioColumnName, namesStr };
  };

  // [체크박스 리스트] 체크박스 선택 여부에 따라 코드 문자열 생성
  const checkListToStr = (selectionList, ref, selectionKey) => {
    const result = { codesStr: "", checkColumnName: "", namesStr: "" };

    if (!selectionKey || !selectionList) return result;

    selectionList.forEach(({ cmcd_cd, checked }) => {
      if (checked) {
        result.codesStr += `${result.codesStr ? "|" : ""}${cmcd_cd}`;
        const { colName, cmcdNm } = getColNameAndCmcdNm(ref, selectionKey, cmcd_cd);
        if (colName) {
          result.namesStr += `${result.namesStr ? "|" : ""}${cmcdNm}`;
          result.checkColumnName = colName;
        }
      }
    });

    return result;
  };

  const getParameters = () => {
    const { apiType, successMsg } = prscStatCdRef.current.get(TYPE_SAVE);

    const params = {
      requiredFields: {
        pid: selectedPatient.pid,
        ends_rcrd_sqno: currentState[fieldKeys.basicFieldEntry].get(basicKeys.endsRcrdSqno),
        prsc_date: selectedPatient.prsc_date,
        prsc_sqno: selectedPatient.prsc_sqno,
        type: apiType,
      },
      basicInfo: {
        ends_rcrd_sqno: currentState[fieldKeys.basicFieldEntry].get(basicKeys.endsRcrdSqno),
        exmn_nm: selectedPatient.prsc_nm,
      },
      resultRecord: {
        ends_rcrd_sqno: currentState[fieldKeys.resultFieldEntry].get(resultKeys.endsRcrdSqno),
        exmn_nm: selectedPatient.prsc_nm,
        exmn_date: selectedPatient.exmn_hope_date,
      },
      obsrOpnnList: [],
    };

    const { basicInfo, resultRecord } = params;

    /* 기초정보 */
    for (const [key, value] of currentState[fieldKeys.basicFieldEntry].entries()) {
      if (key === basicKeys.chotBassCd) {
        // 퇴실기준
        if (value.checked) {
          basicInfo[key] = "01";
        } else {
          const { codesStr, radioColumnName, namesStr } = createRadioSelectionString(key, value);
          basicInfo[key] = codesStr;
          if (radioColumnName) {
            basicInfo[radioColumnName] = namesStr;
          }
        }
      } else if (baseCheckSet.has(cmcdCd[key])) {
        // 체크 박스 리스트
        const { codesStr, checkColumnName, namesStr } = checkListToStr(
          currentState.basicList.get(cmcdCd[key]),
          basicNameLookupRef.current,
          key,
        );
        basicInfo[key] = codesStr;
        if (checkColumnName) {
          basicInfo[checkColumnName] = namesStr;
        }
      } else if (smartPickerSet.has(key)) {
        basicInfo[key] = value.value;
        const { colName, cmcdNm } = getColNameAndCmcdNm(basicNameLookupRef.current, key, value.value);
        if (colName) {
          basicInfo[colName] = cmcdNm;
        }
      } else if (singleCheckSet.has(key)) {
        // 단일 체크 박스 : checked 여부에 따라 Y 또는 N으로 변환
        basicInfo[key] = value?.checked ? "Y" : "N";
      } else if (key) {
        basicInfo[key] = baseNumberSet.has(key) && !value ? null : value;
        const { colName, cmcdNm } = getColNameAndCmcdNm(basicNameLookupRef.current, key, value);
        if (colName) {
          basicInfo[colName] = cmcdNm;
        }
      }
    }

    /* 관찰 시간 */
    resultRecord[resultKeys.obsrInrtTimeMs] = mergeObsrMinutesAndSeconds(
      currentState[fieldKeys.resultFieldEntry],
      resultKeys.obsrInrtTimeMs,
    ); // 삽입 시간 분초
    resultRecord[resultKeys.obsrExmnEndTimeMs] = mergeObsrMinutesAndSeconds(
      currentState[fieldKeys.resultFieldEntry],
      resultKeys.obsrExmnEndTimeMs,
    ); // 삽입 시간 분초
    resultRecord[resultKeys.obsrReclTimeMs] = mergeObsrMinutesAndSeconds(
      currentState[fieldKeys.resultFieldEntry],
      resultKeys.obsrReclTimeMs,
    ); // 삽입 시간 분초

    /* 결과 기록 */
    for (const [key, value] of currentState[fieldKeys.resultFieldEntry].entries()) {
      if (baseCheckSet.has(cmcdCd[key])) {
        // 체크박스
        const { codesStr, checkColumnName, namesStr } = checkListToStr(
          currentState.resultList.get(cmcdCd[key]),
          resultNameLookupRef.current,
          key,
        );
        resultRecord[key] = codesStr;
        if (checkColumnName) {
          resultRecord[checkColumnName] = namesStr;
        }
      } else if (smartPickerSet.has(key)) {
        resultRecord[key] = value.value;
        const { colName, cmcdNm } = getColNameAndCmcdNm(resultNameLookupRef.current, key, value.value);
        if (colName) {
          resultRecord[colName] = cmcdNm;
        }
      } else if (key && !obsrTimeSet.has(key)) {
        resultRecord[key] = baseNumberSet.has(key) && !value ? null : value;
        const { colName, cmcdNm } = getColNameAndCmcdNm(resultNameLookupRef.current, key, value);
        if (colName) {
          resultRecord[colName] = cmcdNm;
        }
      }
    }

    /* 관찰 소견 */
    const obsrList = currentState.resultList.get(resultKeys.exmnObsrOpnnSqno);

    obsrList.forEach((value, index) => {
      const obsr = {};
      for (const key in value) {
        if (Object.hasOwnProperty.call(value, key)) {
          const element = value[key];
          if (key === resultKeys.obsrOpnnSite1) {
            const { codesStr, checkColumnName, namesStr } = checkListToStr(element, resultNameLookupRef.current, key);
            obsr[key] = codesStr;
            if (checkColumnName) {
              obsr[checkColumnName] = namesStr;
            }
          } else if (key === resultKeys.tisuExmnYn) {
            obsr[key] = element.checked ? "Y" : "N";
          } else if (
            key === resultKeys.obsrOpnn ||
            key === resultKeys.tisuExmnRslt1 ||
            key === resultKeys.tisuExmnRslt2
          ) {
            // 스마트 피커
            obsr[key] = value[key].value;
            const { colName, cmcdNm } = getColNameAndCmcdNm(resultNameLookupRef.current, key, value[key].value);
            if (colName) {
              obsr[colName] = cmcdNm;
            }
          } else if (key !== resultKeys.exmnObsrOpnnSqno || (key === resultKeys.exmnObsrOpnnSqno && element)) {
            obsr[key] = element;
            const { colName, cmcdNm } = getColNameAndCmcdNm(resultNameLookupRef.current, key, element);
            if (colName) {
              obsr[colName] = cmcdNm;
            }
          }
        }
      }
      obsr && params.obsrOpnnList.push(obsr);
    });

    return params;
  };

  const getInvalidItemName = () => {
    const basicEntry = currentState[fieldKeys.basicFieldEntry];
    const resultEntry = currentState[fieldKeys.resultFieldEntry];

    // 수면내시경 시행 체크 시 수면유도제 사용
    if (basicEntry.get(basicKeys.slpnEndYn).checked) {
      const slpnDrvtMdcnCd = basicEntry.get(basicKeys.slpnDrvtMdcnCd);
      const slpnDosg = basicEntry.get(basicKeys.slpnDosg);
      if (!slpnDrvtMdcnCd || !slpnDosg) return "수면유도제 사용";
    }

    // 퇴실기준 중 하나라도 체크되면 전체 체크됐는지 확인
    const chotBassCd = basicEntry.get(basicKeys.chotBassCd);
    if (!chotBassCd.checked) {
      let isSelected = false;
      let selectedNum = 0;
      for (const key in chotBassCd) {
        if (Object.hasOwnProperty.call(chotBassCd, key)) {
          const value = chotBassCd[key];
          if (chotBassSet.has(key) && value) {
            isSelected = true;
            selectedNum++;
          }
        }
      }
      if (isSelected && selectedNum !== chotBassSet.size) {
        return "퇴실기준";
      }
    }

    // bbps 하나라도 체크되면 전체 체크됐는지 확인
    if (!isGI) {
      const bpreDgreLC = resultEntry.get(resultKeys.bpreDgreLC);
      const bpreDgreTC = resultEntry.get(resultKeys.bpreDgreTC);
      const bpreDgreRC = resultEntry.get(resultKeys.bpreDgreRC);
      const bpreArr = [bpreDgreLC, bpreDgreTC, bpreDgreRC];
      let isSelected = false;
      let selectedNum = 0;

      bpreArr.forEach(v => {
        if (v) {
          isSelected = true;
          selectedNum++;
        }
      });

      if (isSelected && selectedNum !== bpreArr.length) return "BBPS";
    }

    return "";
  };

  const updateMasterGridData = (btn = ALL_ITEMS_KEY) => {
    const buttonGroupRows = mstExamData.current.get(btn);
    mstDataProvider.current.setRows(buttonGroupRows);
  };

  const updateMasterGridAndPatientDetails = (patient, btnState = selectedBtnState, shouldResetConfirm = false) => {
    if (selectedBtnState !== btnState) {
      setSelectedBtnState(btnState);
    }
    updateMasterGridData();

    if (patient) {
      handleDetail(patient);
      setSelectedPatient(prevState => ({ ...prevState, ...patient }));
    }
    if (shouldResetConfirm) {
      confirm.initial();
    }
  };

  const updateStateAfterSave = async successMsg => {
    const searchResult = await handleSearch();
    if (searchResult.success && searchResult.data) {
      updateMasterGridAndPatientDetails(searchResult.data);
      changeSelectedBtnState(selectedBtnState, false, true);
      snackbar.onRequestOpen(Message[successMsg], "success");
    }
  };

  const updateStateAfterSaveOut = async successMsg => {
    const searchResult = await handleSearch();
    if (searchResult.success) {
      updateMasterGridAndPatientDetails(confirm.patient, selectedBtnState, true);
      snackbar.onRequestOpen(Message[successMsg], "success");
    }
  };

  const updateFinalAfterSave = () => {
    callApiAndUpdateState(TYPE_FINAL, postProcessForUpdate);
  };

  const handleApiCallWithOptionalSign = async (params, onSuccess, successMsg) => {
    await callApi(`/MSC_050000/save`, params)
      .then(({ resultCode, resultMsg }) => {
        if (resultCode === 200) {
          if (onSuccess) {
            onSuccess(successMsg);
          }
        } else {
          snackbar.onRequestOpen(Message.networkFail);
          console.error(resultMsg);
        }
        return resultCode;
      })
      .catch(() => {
        snackbar.onRequestOpen(Message.networkFail);
      });
  };

  const handleSave = async onSuccess => {
    const invalidItemName = getInvalidItemName();
    if (invalidItemName) {
      snackbar.onRequestOpen(Message.MSC_050000_validation(invalidItemName), "error");
    } else {
      const { successMsg } = prscStatCdRef.current.get(TYPE_SAVE);
      const params = getParameters();
      // @@ 나중에 기초정보, 결과기록 저장으로 기획나오면 파라미터 및 전자서명 키 분리해야됨
      const basicHstrStatCd = params.basicInfo[basicKeys.hstrStatCd]; // 기초정보 이력 상태 코드
      const resultHstrStatCd = params.basicInfo[resultKeys.hstrStatCd]; // 결과기록 이력 상태 코드

      if (
        basicHstrStatCd === "1" ||
        resultHstrStatCd === "1" ||
        (!isEqualState && (basicHstrStatCd === "2" || resultHstrStatCd === "2"))
      ) {
        try {
          const endoParams = {
            ...params.basicInfo,
            ...params.resultRecord,
            obsrOpnnList: params.obsrOpnnList,
          };
          const { dgsgKey } = await signApi(endoParams);
          if (dgsgKey) {
            // 전자서명 번호 파라미터 추가
            params.basicInfo.dgsg_no = dgsgKey;
            params.resultRecord.dgsg_no = dgsgKey;
            await handleApiCallWithOptionalSign(params, onSuccess, successMsg);
          }
        } catch (error) {
          console.error("전자서명 api 호출 실패 : ", error);
        }
      } else {
        await handleApiCallWithOptionalSign(params, onSuccess, successMsg);
      }
    }
  };

  const handleCheck = type => {
    const { statCd, buttonName, noMsg, confirmMsg } = prscStatCdRef.current.get(type);
    const currentStatusCd = selectedPatient[PRSC_STAT_CD];

    // 상태 코드가 일치하지 않는 경우
    if (currentStatusCd !== statCd) {
      snackbar.onRequestOpen(Message[noMsg], "error");
      return;
    }

    // 확인 메시지 조건 설정
    const confirmConditions = {
      [TYPE_FINAL]: { condition: !isEqualState, message: Message.saveCheckConfirm },
      [TYPE_READING_CANCEL]: { condition: true, message: Message[confirmMsg] },
      [TYPE_FINAL_CANCEL]: { condition: true, message: Message[confirmMsg] },
    };

    const activeCondition = confirmConditions[type];

    // 조건에 따른 처리
    if (activeCondition && activeCondition.condition) {
      setConfirm(prevState => ({
        ...prevState,
        confirmMsg: activeCondition.message,
        open: true,
        title: `내시경검사 ${buttonName}`,
        reqType: type,
      }));
    } else {
      callApiAndUpdateState(type, postProcessForUpdate);
    }
  };

  const callSendCvrRequestNoti = async () => {
    const timeout = setTimeout(() => openLoading(Message.sendNoti), 300);

    try {
      const notiResult = currentState[fieldKeys.resultFieldList]
        .get(resultKeys.exmnObsrOpnnSqno)
        .map((item, index) => `관찰소견${index + 1} - ${item.obsr_opnn_cnts}`)
        .join(" | ");
      const detail = {
        prsc_nm: selectedPatient.prsc_nm,
        mdcr_dr_id: selectedPatient.mdcr_dr_id,
        result: notiResult,
        result_date: moment(selectedPatient.iptn_dt).format("YYYY-MM-DD hh:mm"),
        prsc_dr_sqno: selectedPatient.prsc_dr_sqno,
      };
      const params = {
        date: moment(selectedPatient.cndt_dt).format("YYYY-MM-DD"),
        exrmClsfCd: EXRM_CLSF_CD,
        detailsList: [detail],
        ...selectedPatient,
      };
      const response = await callApi("/exam/sendCvrRequestNoti", params);
      if (!response || response.resultCode !== 200) {
        console.error("noti API 호출 실패:", response || "응답 없음");
        return;
      }
      snackbar.onRequestOpen(Message.cvrSuccess, "success");
    } catch (error) {
      console.error("noti API 호출 중 예외 발생:", error);
    } finally {
      closeLoading();
      clearTimeout(timeout);
    }
  };

  const handleCvrButtonOnClick = () => {
    if (!isEqualState) {
      setConfirm(prevState => ({
        ...prevState,
        confirmMsg: Message.saveCheckConfirm,
        open: true,
        title: "내시경검사 CVR보고",
        reqType: TYPE_CVR,
      }));
    } else {
      callSendCvrRequestNoti();
    }
  };

  // 버튼 유효성 체크
  const checkSaveValidity = type => {
    const { statCd, noMsg } = prscStatCdRef.current.get(TYPE_SAVE);
    return selectedPatient[[PRSC_STAT_CD]] === statCd;
  };

  const displaySnackbarAndResetConfirm = (message, type) => {
    snackbar.onRequestOpen(Message[message], "error");

    if (type === TYPE_SAVE_OUT) {
      confirm.initial();
    }
  };

  const handleSaveAction = type => {
    const isInvalid = checkSaveValidity(type);

    if (isInvalid) {
      const { noMsg } = prscStatCdRef.current.get(TYPE_SAVE);
      displaySnackbarAndResetConfirm(noMsg, type);
    } else {
      const postSaveAction = type === TYPE_SAVE_OUT ? updateStateAfterSaveOut : updateStateAfterSave;
      handleSave(postSaveAction);
    }
  };

  // 리스트에서 일치하는 항목에 포커스
  const resetButtonsAndFocusOnItem = (data, properties = patientIdentifiers) => {
    if (mstExamData.current.get(ALL_ITEMS_KEY).length > 1) {
      const selected = extractProperties(data, properties);
      focusOnSelectedRow(selected, mstGridView, properties);
    } else {
      mstGridView.current.setCurrent({ itemIndex: 0, column: "column" });
    }
  };

  // 리스트에서 일치하는 항목에 포커스
  const focusOnMatchAfterSearch = async (originData, params) => {
    const searchResult = await handleSearch(params);
    if (searchResult.success) {
      updateMasterGridData();
      resetButtonsAndFocusOnItem(originData);
    }
  };

  // 미완료 환자 Row 선택 시 콜백 함수
  const handleAdjust = data => {
    if (!data) return;
    mstGridView.current.resetFilters();
    const { exmn_hope_date, pid, pt_nm, hope_exrm_cd } = data;
    const exrmCdList = [hope_exrm_cd]; // hope_exrm_cd type string
    const dateObject = new Date(exmn_hope_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")); // "yyyymmdd" 문자열을 "yyyy-mm-dd" 형식 + Date 객체로 변환
    const updateData = { date: { from: dateObject, to: dateObject }, exrmCdList, pid };

    setSelectedPatient(selectedPatientRef.current);
    mstGridView.current.clearCurrent();
    searchInfoRef.current.setKeyword(`${pid} ${pt_nm}`, data);
    searchInfoRef.current.selectDept(hope_exrm_cd);
    setSearch(prevState => ({
      ...prevState,
      ...updateData,
    }));

    // 목록 조회
    focusOnMatchAfterSearch(data, updateData);
  };

  const handleConfirmOnState = state => {
    const isSaveOut = confirm.reqType === TYPE_SAVE_OUT;

    if (state === CONFIRM) {
      if (isSaveOut) {
        handleSaveAction(confirm.reqType);
        setConfirm(prevState => ({ ...prevState, open: false }));
      } else {
        if (confirm.reqType === TYPE_CVR) {
          handleSave(() => {
            handleDetail(selectedPatient, false);
            callSendCvrRequestNoti();
          });
        } else if (confirm.reqType === TYPE_FINAL) {
          handleSave(updateFinalAfterSave);
        } else if (confirm.reqType === TYPE_READING_CANCEL) {
          handleReadingCancel();
        } else {
          callApiAndUpdateState(confirm.reqType, postProcessForUpdate);
        }
        confirm.initial();
      }
    }

    if (state === CONFIRM_CANCEL) {
      if (isSaveOut) {
        setSelectedPatient(confirm.patient);
        handleDetail(confirm.patient);
      }

      confirm.initial();
    }
  };

  const handleBeforePrint = () => {
    // 서식 분류 시퀀스 가져오기
    const mdfrClsfSqno = getMdfrClsfSqno(tabIndex, selectedPatient.mdtr_site_cd);

    const auth = getAuth(mdfrClsfSqno);

    if (!auth) {
      // 사용자 의무기록지 발급권한이 없을 경우
      let alertTitle = Message.issueAlertTitle;
      let alertMsg = Message.issueAlertMessage;

      if (mdfrClsfSqno === 168 || mdfrClsfSqno === 169) {
        // 진정기록지 alert 타이틀, 메시지 세팅
        alertTitle = Message.MSC_050000_recordIssueAlertTitle;
        alertMsg = Message.MSC_050000_recordIssueAlertMessage;
      }

      alert.onOpen(alertTitle, alertMsg);
      return;
    }

    const patient = patientRef.current.getPatientInfo();
    const item = {
      tabIndex,
      isPrintable: true,
      patient: {
        pid: selectedPatient.pid,
        pt_nm: selectedPatient.pt_nm,
        pt_dvcd: patient.pt_dvcd,
        age_cd: selectedPatient.age_cd,
        mdcr_date: selectedPatient.mdcr_date,
        rcpn_sqno: selectedPatient.rcpn_sqno,
      },
      prsc_date: selectedPatient.prsc_date,
      prsc_sqno: selectedPatient.prsc_sqno,
    };
    const key = setLocalStorageItem({ ...item });

    if (key) {
      const url = `CSMSP007`;

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

  // 체크박스
  const converValueByCheckbox = (key, value) => {
    const commonList = lodash.cloneDeep(commonRef.current.resultList); // 공통코드 리스트
    const commonKeyList = [...commonList.get(cmcdCd[key])];
    if (value && value.length) {
      value.forEach(code => {
        commonKeyList.forEach((obj, index) => {
          if (obj.cmcd_cd === code) {
            commonKeyList[index] = { ...commonKeyList[index], checked: true };
          }
        });
      });
    }
    return commonKeyList;
  };

  // 검사소견 값 -> 컴포넌트(키)에 맞는 관찰소견 값으로 변환
  const convertValueByKey = (key, value) => {
    if (baseCheckSet.has(key) || key === resultKeys.obsrOpnnSite1 || key === resultKeys.advcMatr) {
      return converValueByCheckbox(key, value);
    }
    if (smartPickerSet.has(key) || key === resultKeys.obsrOpnn) {
      const commonList = lodash.cloneDeep(commonRef.current.resultList); // 공통코드 리스트
      const cmcdList = [...commonList.get(cmcdCd[key])];
      const { name, value: obsrOpnnValue } = getSmartValue(cmcdList, value);
      return { name, value: obsrOpnnValue };
    }

    return value;
  };

  const handleCopyObsr = (updateList, element) => {
    const updateKey = resultKeys.exmnObsrOpnnSqno;
    const obsrList = updateList.get(updateKey) || [];

    element.forEach((nested, index) => {
      const prevElement = obsrList[index];
      const opnn = prevElement || cloneObservationObject();

      Object.keys(nested).forEach(key => {
        const value = nested[key];
        const updateValue = convertValueByKey(key, value);
        opnn[key] = updateValue;
      });

      if (!prevElement) {
        obsrList.push(opnn);
      } else {
        obsrList[index] = opnn;
      }
    });

    updateList.set(updateKey, obsrList);
    return obsrList;
  };

  const handleCopy = data => {
    snackbar.onRequestOpen(Message.copySuccess, "success");
    const resultEntries = new Map(currentState[fieldKeys.resultFieldEntry]);
    const resultList = lodash.cloneDeep(currentState[fieldKeys.resultFieldList]);

    Object.keys(data).forEach(key => {
      const element = data[key];
      if (key === resultKeys.obsrOpnnCnts || key === resultKeys.obsrOpnnSite2) {
        // 대장 관찰소견
        const updateKey = resultKeys.exmnObsrOpnnSqno;
        const obsrList = resultList.get(updateKey);
        obsrList[0] = { ...obsrList[0], [key]: element };
        resultList.set(updateKey, obsrList);
      } else if (key === "obsr_opnn_list") {
        // 위장 관찰소견
        const updateKey = resultKeys.exmnObsrOpnnSqno;
        const obsrList = handleCopyObsr(resultList, element);
        resultList.set(updateKey, obsrList);
      } else if (baseCheckSet.has(cmcdCd[key])) {
        const updateValue = converValueByCheckbox(key, element);
        resultList.set(cmcdCd[key], updateValue);
      } else if (resultEntries.has(key)) {
        const updateValue = convertValueByKey(key, element);
        resultEntries.set(key, updateValue);
      }
    });

    handleUpdateStates({ resultEntries, resultList });
  };

  /* 커링 함수 초기화 */
  // 공통 핸들러 세트를 생성하는 함수
  const createFixedHandlerSet = (entryKey, listKey) => ({
    handleText: handleText(entryKey),
    handleChangeData,
    handleChange: handleChangeCurrent(entryKey),
    handleOnChecked: handleOnChecked(listKey),
    handleOnCheckedSingle: handleOnCheckedSingle(entryKey),
    resetEtcOnUncheck: resetEtcOnUncheck(entryKey),
  });

  const createResultOnCheckedHandler = handleOnChecked(fieldKeys.resultFieldList);
  const createResultOnCheckedSingleHandler = handleOnCheckedSingle(fieldKeys.resultFieldEntry);
  const createResultResetEctOnUncheck = resetEtcOnUncheck(fieldKeys.resultFieldEntry);

  // 핸들러 및 데이터 그룹화
  const tabCommonProps = {
    isGI,
    selectedPatient,
    isEditDisabled,
  };

  const basicHandlers = createFixedHandlerSet(fieldKeys.basicFieldEntry, fieldKeys.basicFieldList);
  const resultHandlers = createFixedHandlerSet(fieldKeys.resultFieldEntry, fieldKeys.resultFieldList);

  const basicInfoProps = {
    basicList: currentState[fieldKeys.basicFieldList],
    basicEntries: currentState[fieldKeys.basicFieldEntry],
    ...tabCommonProps,
    ...basicHandlers,
    handleOnCheckedAndDisabled,
  };

  const resultRecordProps = {
    resultList: currentState[fieldKeys.resultFieldList],
    resultEntries: currentState[fieldKeys.resultFieldEntry],
    ...tabCommonProps,
    ...resultHandlers,
    handleObsrChange,
    handleObsrOnCheckedSingle,
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    const mstCon = mstGrid.current;
    const fields = [
      ...testResultFields,
      {
        fieldName: "mdtr_site_cd",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "iptn_dt",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "iptn_prsn_nm",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "iptn_sign_lctn",
        dataType: ValueType.TEXT,
      },
    ];

    const { dataProvider, gridView } = initializeGrid(mstCon, fields, testResultColumns, Message.noSearch);

    const transformData = dataArray => {
      const map = new Map();

      dataArray.forEach(item => {
        if (!map.has(item.cmcd_clsf_cd)) {
          map.set(item.cmcd_clsf_cd, new Map());
        }
        map.get(item.cmcd_clsf_cd).set(item.cmcd_cd, item.cmcd_nm);
      });

      return map;
    };

    const setupComponentState = resultData => {
      const { basicCodeList, resultCodeList } = resultData;

      basicNameLookupRef.current = transformData(basicCodeList);
      resultNameLookupRef.current = transformData(resultCodeList);

      const basicFormatData = formatToComponentStructure(
        basicCodeList,
        originState.basicList,
        originState.basicEntries,
      );
      const resultFormatData = formatToComponentStructure(
        resultCodeList,
        originState.resultList,
        originState.resultEntries,
      );

      commonRef.current = {
        basicList: basicFormatData.formatList,
        basicEntries: basicFormatData.formatEntries,
        resultList: resultFormatData.formatList,
        resultEntries: resultFormatData.formatEntries,
      };

      initializeBothStates();
    };

    const updateStateWithCommonCodeData = () => {
      const params = {
        clsfList: [CLSF],
        cdList: RESULT_STATS,
      };

      return Promise.all([getImageBadgeDataApi(params, EXAM_RESULT_CD), callApi("/MSC_050000/common")])
        .then(([updatedStateList, endoCommonResult]) => {
          setupComponentState(endoCommonResult.resultData);
          updatedStateList.forEach(({ code }) => mstExamData.current.set(code, []));
          const margeList = [...colorExamCountList, ...updatedStateList];
          setColorExamCountList(margeList);
          setIsExamStateFetched(true);
          return margeList;
        })
        .catch(error => {
          ErrorLogInfo();
          console.error(error);
        });
    };

    const applyFilterAndSetGridView = list => {
      const filters = list.reduce((acc, current) => {
        if (current.code === ALL_ITEMS_KEY) return acc;
        const newValue = {
          name: current.code,
          text: current.name,
          criteria: `value = '${current.code}'`,
        };
        acc.push(newValue);
        return acc;
      }, []);

      gridView.setColumnFilters(PRSC_STAT_CD, filters);
    };

    const handleGridSetup = async () => {
      let list = colorExamCountList;

      if (!isExamStateFetched) {
        list = await updateStateWithCommonCodeData();
      }

      if (list) {
        try {
          configureGridImageCallback(gridView, list);
          applyFilterAndSetGridView(list);
        } catch (error) {
          // console.error(error);
        }
      }
    };

    gridView.setColumnProperty("prsc_nm", "autoFilter", true); // 필터
    handleGridSetup();
    mstDataProvider.current = dataProvider;
    mstGridView.current = gridView;

    return () => {
      destroyGrid(dataProvider, gridView);
      mstDataProvider.current = null;
      mstGridView.current = null;
    };
  }, []);

  useEffect(() => {
    if (isExamStateFetched && isDeptLoaded) {
      (async () => {
        if (location.state) {
          // Main 에서 환자 선택 시
          const dateObject = new Date(location.state.cndt_dt);
          const updateData = { ...search, date: { from: dateObject, to: dateObject }, pid: location.state.pid };
          setSearch(prevState => ({ ...prevState, ...updateData }));
          searchInfoRef.current.setKeyword(`${location.state.pid} ${location.state.pt_nm}`, location.state);
          location.state = null;
          const searchResult = await handleSearch(updateData);
          if (searchResult.success) {
            updateMasterGridData();
          }
        } else {
          const searchResult = await handleSearch();
          if (searchResult.success) {
            updateMasterGridData();
          }
        }
      })();
    }
  }, [isExamStateFetched, isDeptLoaded]);

  useEffect(() => {
    // SmartComplete 자동완성 검색 시
    if (search.isCompleted) {
      setSearch(prevState => ({ ...prevState, isCompleted: false }));
      resetIfSelcetedPtExists();
    }
  }, [search]);

  // 결과 수정 시
  useEffect(() => {
    mstGridView.current.onSelectionChanged = (grid, selection) => {
      const prevPatient = extractProperties(selectedPatient, patientIdentifiers);
      const values = grid.getValues(selection.startRow);
      let newPatient = extractProperties(values, patientIdentifiers);

      const isEqual = lodash.isEqual(prevPatient, newPatient);

      if (isEqual) return;

      newPatient = {
        ...newPatient,
        ...values,
      };

      if (!isEqual) {
        if (!isEqualState) {
          setConfirm(prevState => ({
            ...prevState,
            confirmMsg: Message.saveCheckConfirm,
            open: true,
            title: "결과입력 나가기",
            reqType: TYPE_SAVE_OUT,
            patient: newPatient,
          }));
        } else {
          handleDetail(values);
          setSelectedPatient(prevState => ({
            ...prevState,
            ...newPatient,
          }));
        }
      }
    };
  }, [selectedPatient, isEqualState]);

  useEffect(() => {
    mstGridView.current.onFilteringChanged = grid => {
      const filters = grid.getActiveColumnFilters(PRSC_STAT_CD);

      if (!filters.length && selectedBtnState === ALL_ITEMS_KEY) {
        return;
      }

      if (filters.length > 1 && filters.length !== mstExamData.current.size - 1) {
        // 전체 체크 아닌 경우
        setSelectedBtnState(ALL_ITEMS_KEY);
        let newRows = [];
        filters.forEach(v => {
          newRows = [...newRows, ...mstExamData.current.get(v.name)];
        });
        mstDataProvider.current.setRows(newRows);
      } else {
        const filterName = filters.length === 1 ? filters[0].name : ALL_ITEMS_KEY;
        setSelectedBtnState(filterName);
        bindingMstGrid(filterName);
      }
      handleSearchSelectedRow();
    };
  }, [selectedPatient, handleSearchSelectedRow, selectedBtnState]);

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
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      closeLoading(false);
    };
  }, [isLoading]);

  // 응급환자 새로고침
  useEffect(() => {
    if (checkNoti()) {
      handleSearch().then(() => changeSelectedBtnState(selectedBtnState, false, true));
      resetNoti();
    }
  }, [noti]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="MSC_050200 dp_full">
      <div className="align_box">
        <div className={`align_top ${selectedPatient.pid ? "patient_info_wrap" : ""}`}>
          <PatientSummaryBar
            pageId="MSC_050200"
            pid={selectedPatient.pid}
            rcpn_sqno={selectedPatient.rcpn_sqno}
            prsc_clsf_cd="C3"
            hope_exrm_cd={selectedPatient.hope_exrm_cd}
            exmn_hope_date={selectedPatient.exmn_hope_date}
            ref={patientRef}
            cndt_dt={selectedPatient.cndt_dt}
            iptn_dt={selectedPatient.iptn_dt}
            handleBind={value => setIsBindPatient(value)}
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
                    <h3 className="title">내시경검사 결과 현황</h3>
                  </div>
                </div>
                <div className="right_box">
                  <UnactgUncmplDialog
                    ref={unactgRef}
                    onAdjust={handleAdjust}
                    stateList={colorExamCountList}
                    prscClsfCd={PRSC_CLSF_CD}
                    hopeExrmDeptSqnoList={search.exrmCdList}
                    uncmplYn="Y"
                    endoYn="Y"
                  />
                </div>
              </div>
              <div className="sec_content">
                <SearchInfo
                  type="result"
                  exrmClsfCd={EXRM_CLSF_CD}
                  date={search.date}
                  ref={searchInfoRef}
                  handleChange={handleChange}
                  handleSearch={resetIfSelcetedPtExists}
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
          </div>
          <div className="align_right">
            <div className="sec_wrap full_size add_footer">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">검사 소견 편집</h3>
                  </div>
                </div>
                <div className="right_box">
                  <LUXButton
                    label="검사소견"
                    onClick={() => setExmnOpnnOpen(true)}
                    type="small"
                    disabled={isButtonDisabled || isEditDisabled}
                  />
                  <LUXButton
                    label="판독취소"
                    onClick={() => handleCheck(TYPE_READING_CANCEL)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="최종보고"
                    onClick={() => handleCheck(TYPE_FINAL)} // 상태값 저장(M) -> 최종보고(N)
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="최종보고 취소"
                    onClick={() => handleCheck(TYPE_FINAL_CANCEL)} // 상태값 최종보고(N) -> 저장(M)
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="CVR보고"
                    onClick={handleCvrButtonOnClick}
                    disabled={isCvrButtonDisabled}
                    type="small"
                  />
                </div>
              </div>
              <div className="sec_content">
                <div className="test-result">
                  <LUXTabs style={{ height: "100%" }}>
                    <LUXTab label="기초정보" onActive={e => setTabIndex(e.props.tabIndex)}>
                      {!currentState.initialized || !selectedPatient.pid ? (
                        <div className="empty_box">
                          <div className="inbx">
                            <div className="empty_img type2" />
                            <div className="empty_msg">데이터가 존재하지 않습니다.</div>
                          </div>
                        </div>
                      ) : (
                        <MSC_050200_T01 {...basicInfoProps} />
                      )}
                    </LUXTab>
                    <LUXTab label="결과기록" onActive={e => setTabIndex(e.props.tabIndex)}>
                      {!currentState.initialized || !selectedPatient.pid ? (
                        <div className="empty_box">
                          <div className="inbx">
                            <div className="empty_img type2" />
                            <div className="empty_msg">데이터가 존재하지 않습니다.</div>
                          </div>
                        </div>
                      ) : !isGI ? (
                        <MSC_050200_T02_COLN {...resultRecordProps} />
                      ) : (
                        <MSC_050200_T02_GSIT
                          {...resultRecordProps}
                          handleOnChecked={createResultOnCheckedHandler}
                          handleOnCheckedSingle={createResultOnCheckedSingleHandler}
                          resetEtcOnUncheck={createResultResetEctOnUncheck}
                        />
                      )}
                    </LUXTab>
                  </LUXTabs>
                </div>
              </div>
              <div className="sec_footer">
                <div className="option_box">
                  <LUXButton label="이력관리" onClick={() => setHistoryOpen(true)} disabled={!selectedPatient.pid} />
                  <LUXButton
                    label="저장"
                    onClick={() => handleSaveAction(TYPE_SAVE)}
                    disabled={isSaveButtonDisabled}
                    blue={!isSaveButtonDisabled}
                  />
                  <LUXButton
                    label="출력"
                    onClick={handleBeforePrint}
                    disabled={!selectedPatient.pid || !isEditDisabled}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MSC100100P01
        opnnType={!isGI ? COLON_SITE_CD : GI_SITE_CD}
        dialogOpen={exmnOpnnOpen}
        onClose={() => setExmnOpnnOpen(false)}
        onCopy={handleCopy}
      />
      {/* 이력관리 */}
      <HistoryDialog
        open={hsitoryOpen}
        prscClsfCd={EXRM_CLSF_CD}
        onClose={() => setHistoryOpen(false)}
        exmnInfo={{ ...selectedPatient }}
        tabId={tabIndex === 0 ? "basic" : "record"}
        isGI={isGI}
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
          cancelButton={() => handleConfirmOnState(CONFIRM_CANCEL)}
          confirmButton={() => handleConfirmOnState(CONFIRM)}
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
    </div>
  );
}

export default WithWrapper(MSC_050200);
