import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// dialog
import UnactgUncmplDialog from "components/Common/UnactgUncmplDialog";
import MSC100100P01 from "pages/MSC_100100/MSC_100100_P01";

// util
import { date, lodash } from "common-util/utils";
import callApi from "services/apis";
import { signitureApi, downloadApi, deleteFileApi } from "services/apis/formApi";
import { signApi } from "services/apis/signApi";
import { getImageBadgeDataApi } from "services/apis/recordsApi";
import withPortal from "hoc/withPortal";
import { ErrorLogInfo } from "cliniccommon-ui";
import useLoadingStore from "services/utils/zustand/useLoadingStore";
import { initializeGrid, destroyGrid, configureGridImageCallback } from "services/utils/grid/RealGridUtil";
import useAuthstore from "services/utils/zustand/useAuthStore";
import useNotiStore from "services/utils/zustand/useNotiStore";
import moment from "moment";

// imgs
import clip from "assets/imgs/ic_attach_m_normal@2x.png";
import trashcan from "assets/imgs/ic_trashcan_m_normal@2x.png";

// common-ui-components
import { LUXButton, LUXSnackbar, LUXConfirm, LUXTextArea, LUXCircularProgress, LUXAlert } from "luna-rocket";
import PatientSummaryBar from "components/Common/PatientSummaryBar";
import SearchInfo from "components/Common/SearchInfo";
import DoughnutChart from "components/Common/DoughnutChart";
import StateBtnGroup from "components/Common/StateBtnGroup";
import Message from "components/Common/Message";
import {
  resultStatus,
  extendedPatientIdentifiers as patientIdentifiers,
  focusOnSelectedRow,
  extractProperties,
  isElementMatchingSelection,
} from "services/utils/examDataDefinitions";
import { windowOpen } from "services/utils/popupUtil";
import { setLocalStorageItem } from "services/utils/localStorage";
import HistoryDialog from "components/Common/HistoryDialog";
import { testResultFields, testResultColumns } from "services/utils/grid/realgridData";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";

// css
import "assets/style/MSC_030200.scss";

/**
 * @name 기능검사 결과
 * @author 김령은
 */

function MSC_030200() {
  /* ================================================================================== */
  /* 상수케이스 선언 */
  const CLSF = "CS1008";
  const EXRM_CLSF_CD = "F";
  const RECEPTION_STATS = ["E", "M", "N"];
  const EXMN_IN_PRGR = RECEPTION_STATS[0];
  const INTERIM_REPORTED = RECEPTION_STATS[1];
  const FINAL_REPORTED = RECEPTION_STATS[2];
  const PRSC_STAT_CD = "prsc_prgr_stat_cd"; // 처방분류코드 컬럼명
  const PRSC_CLSF_CD = "C3"; // 처방분류코드
  const TYPE_READING_CANCEL = "readingCancel";
  const TYPE_SAVE = "save";
  const TYPE_SAVE_OUT = "saveOut";
  const TYPE_FINAL = "final";
  const TYPE_FINAL_CANCEL = "finalCancel";
  const CONFIRM_CANCEL = "cancel";
  const CONFIRM = "confirm";
  const TYPE_FILE_DEL = "fileDelete";
  const TYPE_CVR = "requestNoti";
  const ALL_ITEMS_KEY = "0";

  /* 상태(state) 선언 */
  const patientRef = useRef(null);

  const selectedPtRef = useRef({
    pid: "",
    pt_nm: "",
    prsc_date: "",
    prsc_sqno: "",
    rcpn_sqno: "",
    hope_exrm_cd: "",
    dobr: "",
    age_cd: "",
    exmn_hope_date: "",
    prsc_cd: "",
    prsc_nm: "",
    mdcr_dr_id: "",
    cndt_dt: "",
    mdcr_date: "",
    prsc_dr_sqno: "",
    prsc_prgr_stat_cd: "",
    mdcr_user_nm: "",
  });

  const resultRef = useRef({
    iptn_rslt: "", // 판독결과
    iptn_dt: "", // 판독일시
    iptn_dr_nm: "", // 판독의 성명
    mdcr_sign_lctn: "", // 진료의 서명
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
  const isResetRef = useRef(false);

  const [search, setSearch] = useState({
    // 검사일자
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
  const [selectedPatient, setSelectedPatient] = useState(selectedPtRef.current);
  const [result, setResult] = useState({
    origin: resultRef.current,
    current: resultRef.current,
  });

  const [fileList, setFileList] = useState({
    origin: [],
    current: [],
  });

  const [objectUrlMap, setObjectUrlMap] = useState(new Map());

  const isInitializedFile = useRef(false);

  const [deleteList, setDeleteList] = useState([]);

  const [isDownloading, setIsDownloading] = useState(false);

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
    onOpen: (title, confirmMsg, reqType, patient) =>
      setConfirm(prevState => ({
        ...prevState,
        open: true,
        title,
        confirmMsg,
        reqType,
        ...(patient && { patient }),
      })),
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

  const selPrscStatCd = selectedPatient[PRSC_STAT_CD];
  const isEqualResult = lodash.isEqual(result.origin, result.current);
  const isEqualFileList = lodash.isEqual(fileList.origin, fileList.current);
  const isEqualDeleteList = !deleteList.length;
  const isEqualAll = isEqualResult && isEqualFileList && isEqualDeleteList;
  const isSaveButtonDisabled =
    isBindPatient || !(selPrscStatCd === EXMN_IN_PRGR || (selPrscStatCd === INTERIM_REPORTED && !isEqualAll));
  const isButtonDisabled = isBindPatient || !selectedPatient.pid;
  const isCvrButtonDisabled = isBindPatient || (selPrscStatCd !== INTERIM_REPORTED && selPrscStatCd !== FINAL_REPORTED);

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

  const handleTextChange = e => {
    setResult(prevState => ({
      ...prevState,
      current: { ...prevState.current, iptn_rslt: e.target.value },
    }));
  };

  // 검사소견 선택
  const handleCopy = data => {
    snackbar.onRequestOpen(Message.copySuccess, "success");
    setResult(prevState => ({
      ...prevState,
      current: { ...prevState.current, iptn_rslt: data.exmn_opnn_cnts },
    }));
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
      // 버튼 state 변경
      setSelectedBtnState(value);
      // 필터 해제
      mstGridView.current.activateAllColumnFilters(PRSC_STAT_CD, false);
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

  // 인자 없이 호출 시 초기화
  const changeResultStates = (changeValue = resultRef.current) => {
    setResult(prevState => ({
      ...prevState,
      origin: changeValue,
      current: changeValue,
    }));
  };

  const initialFileList = () => {
    setFileList(prevState => ({
      ...prevState,
      origin: [],
      current: [],
    }));
  };

  const callDetailApi = async (selected = selectedPatient) => {
    try {
      const params = {
        pid: selected.pid,
        prsc_date: selected.prsc_date,
        prsc_sqno: selected.prsc_sqno,
      };
      return await callApi("/MSC_030000/detail", params);
    } catch (error) {
      // 필요한 경우 여기서 추가적인 에러 처리를 수행합니다.
      console.error("Detail API 호출 중 에러 발생:", error);
      snackbar.onRequestOpen(Message.networkFail);
      throw error; // 에러를 다시 throw하여 호출하는 측에서 처리할 수 있도록 함
    }
  };

  const downloadFiles = fileList => {
    setIsDownloading(true);
    const downloadPromises = fileList.map(async file => {
      try {
        const blob = await downloadApi(file.file_path_id, false);
        if (blob) {
          blob.seq = file.file_srl_no;
          blob.file_path_id = file.file_path_id;
        }
        return blob;
      } catch (err) {
        return Promise.reject(err);
      }
    });

    return Promise.all(downloadPromises)
      .then(blobList => blobList)
      .catch(error => {
        // 하나라도 실패 시
        console.error(error);
        snackbar.onRequestOpen(Message.MSC_030000_noImage);
        return [];
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

  const processDetailResponse = async (resultData, callDownloadApi) => {
    const updateResult = resultData?.examResult || resultRef.current;
    changeResultStates(updateResult);
    setDeleteList([]);

    if (!resultData.fileList.length) {
      initialFileList();
    } else if (callDownloadApi) {
      const blobList = await downloadFiles(resultData.fileList);
      if (isInitializedFile.current) {
        isInitializedFile.current = false;
      } else {
        setFileList(prevState => ({
          ...prevState,
          origin: blobList,
          current: blobList,
        }));
      }
    }
  };

  const handleDetail = useCallback(
    async (selected = selectedPatient, callDownloadApi = true) => {
      try {
        const { resultCode, resultData, resultMsg } = await callDetailApi(selected);
        if (resultCode === 200) {
          await processDetailResponse(resultData, callDownloadApi);
        } else {
          console.error(resultMsg);
          snackbar.onRequestOpen(Message.networkFail);
        }
      } catch (error) {
        console.error("Detail API 호출에 실패하였습니다:", error);
        snackbar.onRequestOpen(Message.networkFail);
      }
    },
    [selectedPatient],
  );

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

  const updateMasterExamData = updateData => {
    const masterExamDataMap = mstExamData.current;

    // 모든 키에 대해 빈 배열로 초기화
    masterExamDataMap.forEach((_, key) => masterExamDataMap.set(key, []));

    // 리스트를 순회하며 데이터 업데이트
    updateData.forEach(element => {
      const statusCd = element[PRSC_STAT_CD];
      masterExamDataMap.get(ALL_ITEMS_KEY).push(element);

      if (!isResetRef.current && isElementMatchingSelection(selectedPatient, element)) {
        setSelectedPatient(prevState => ({ ...prevState, prsc_prgr_stat_cd: statusCd }));
        isResetRef.current = false;
      }

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

  const updatePatientAndStatus = newPatient => {
    setSelectedPatient(prevState => ({
      ...prevState,
      ...newPatient,
    }));
  };

  const handleSearch = async (searchData = search) => {
    const {
      date: { from, to },
      exrmCdList,
      pid,
    } = searchData;

    const param = {
      exmn_hope_from_date: date.getyyyymmdd(from),
      exmn_hope_to_date: date.getyyyymmdd(to),
      hope_exrm_cd: exrmCdList,
      prsc_clsf_cd: PRSC_CLSF_CD,
      pid,
    };

    // console.log("@@@@@@@@@@@@ 기능검사 결과 현황 조회 @@@@@@@@@@@@ = ", param);

    await callApi("/exam/selectResultList", param)
      .then(({ resultCode, resultData, resultMsg }) => {
        if (resultCode === 200) {
          unactgRef.current.search();

          const hasExamData = colorExamCountList[0].count !== 0;

          if (!resultData?.length) {
            if (hasExamData) {
              mstDataProvider.current.setRows([]);
              updatePatientAndStatus(selectedPtRef.current);
              mstClearAllArrays();
              changeResultStates();
            }
            snackbar.onRequestOpen(Message.noSearch, "info");
          } else {
            if (hasExamData) mstClearAllArrays();
            updateMasterExamData(resultData); // 마스터 그리드 데이터 업데이트
          }
        } else {
          snackbar.onRequestOpen(Message.networkFail);
          console.error(resultMsg);
        }
      })
      .catch(() => {
        snackbar.onRequestOpen(Message.networkFail);
      });
  };

  // 리스트에서 일치하는 항목에 포커스
  const resetButtonsAndFocusOnItem = (data, properties = patientIdentifiers) => {
    changeSelectedBtnState(ALL_ITEMS_KEY, true);
    if (mstExamData.current.get(ALL_ITEMS_KEY).length > 1) {
      const selected = extractProperties(data, properties);
      focusOnSelectedRow(selected, mstGridView, properties);
    } else {
      mstGridView.current.setCurrent({ itemIndex: 0, column: "column" });
    }
  };

  // 미완료 팝업에서 환자 Row 선택 시 콜백 함수
  const handleAdjust = data => {
    if (!data) return;
    mstGridView.current.resetFilters();
    const { exmn_hope_date, pid, pt_nm, hope_exrm_cd } = data;
    const exrmCdList = [hope_exrm_cd]; // hope_exrm_cd type string
    const dateObject = new Date(exmn_hope_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")); // "yyyymmdd" 문자열을 "yyyy-mm-dd" 형식 + Date 객체로 변환
    const updateData = { date: { from: dateObject, to: dateObject }, exrmCdList, pid };

    updatePatientAndStatus(selectedPtRef.current);
    mstGridView.current.clearCurrent();
    searchInfoRef.current.setKeyword(`${pid} ${pt_nm}`, data);
    searchInfoRef.current.selectDept(hope_exrm_cd);
    setSearch(prevState => ({
      ...prevState,
      ...updateData,
    }));

    // 목록 조회
    handleSearch(updateData).then(() => {
      resetButtonsAndFocusOnItem(data);
    });
  };

  // 선택한 환자가 있을 경우 초기화
  const resetIfSelcetedPtExists = () => {
    if (selectedPatient.pid) {
      updatePatientAndStatus(selectedPtRef.current);
      changeResultStates();
      initialFileList();
      setDeleteList([]);
      mstGridView.current.clearCurrent(); // 포커스 해제
      setIsLoading(false);
      if (isDownloading) {
        setIsDownloading(false);
        isInitializedFile.current = true;
      }
      isResetRef.current = true;
    }

    handleSearch().then(() => {
      changeSelectedBtnState(ALL_ITEMS_KEY, true);
    });
  };

  // 부서 리스트 조회된 이후 handlerSearch 함수 실행
  const handleDeptListLoaded = exrmCdList => {
    if (!isDeptLoaded) {
      setSearch(prevState => ({ ...prevState, exrmCdList }));
      setIsDeptLoaded(true);
    }
  };

  const handleDeleteUploadedFiles = uploadedList => {
    const successfulNewUploadIds = uploadedList
      .filter(upload => upload?.file_path_id)
      .map(upload => upload.file_path_id);
    successfulNewUploadIds.forEach(uuid => deleteFileApi(uuid));
  };

  // 일반화된 저장 성공 후 처리 함수
  const handlePostSaveSuccess = async (successMsg, extraActions = null, shouldSearch = true) => {
    if (shouldSearch) {
      await handleSearch();
    }

    if (extraActions) {
      extraActions();
    }

    snackbar.onRequestOpen(Message[successMsg], "success");
  };

  const handlePostSave = async (successMsg, additionalActions) => {
    await handlePostSaveSuccess(
      successMsg,
      () => {
        if (additionalActions) {
          additionalActions();
        }
        changeSelectedBtnState(selectedBtnState, false, true);
      },
      true,
    );
  };

  // 저장, 판독취소, 최종보고 api 호출 실패 이후
  const handleUpdateFailureAfterSave = (uploadList = [], errorMsg = "") => {
    snackbar.onRequestOpen(Message.networkFail);
    errorMsg && console.error(errorMsg);
    if (uploadList.length) {
      // Rollback : 업로드 된 파일 삭제
      handleDeleteUploadedFiles(uploadList);
    }
  };

  // 저장, 판독취소, 최종보고 api 호출 성공 이후
  const updateStateAfterSave = async successMsg => {
    await handlePostSave(successMsg, () => handleDetail(selectedPatient, false));
  };

  // 최종보고 취소 api 성공 이후
  const updateFinalCancelAfterSave = async successMsg => {
    await handlePostSave(successMsg);
  };

  // 저장 외부 API 성공 후 추가 처리
  const handleExtraActionsAfterSaveOut = async successMsg => {
    await handlePostSaveSuccess(
      successMsg,
      () => {
        updatePatientAndStatus(confirm.patient);
        bindingMstGrid(selectedBtnState);
        handleDetail(confirm.patient);
        confirm.initial();
      },
      true,
    );
  };

  // 업로드 및 저장이 성공한 이후 후속 처리
  const updateFileStateAfterSave = uploadList => {
    const changeFileList = [...fileList.current];

    uploadList.forEach(value => {
      changeFileList[value.index].file_path_id = value.file_path_id;
    });

    setFileList(prevState => ({
      ...prevState,
      origin: changeFileList,
      current: changeFileList,
    }));
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

  const updateStatusResponse = async (type, onSuccess, uploadList = []) => {
    const { apiType, successMsg } = prscStatCdRef.current.get(type);
    const params = {
      // 필수값
      pid: selectedPatient.pid,
      prsc_date: selectedPatient.prsc_date,
      prsc_sqno: selectedPatient.prsc_sqno,
      type: apiType,
      // 판독소견
      iptn_rslt: result.current.iptn_rslt,
      // 이력 상태 코드
      hstr_stat_cd: null,
      // 파일
      uploadList: [],
      deleteList: [],
    };
    const isReportStatus = type === TYPE_FINAL || type === TYPE_FINAL_CANCEL;

    if (type === TYPE_SAVE || type === TYPE_FINAL) {
      params.hstr_stat_cd = selPrscStatCd === EXMN_IN_PRGR ? "1" : !isEqualResult ? "2" : null;
      params.deleteList = deleteList;

      if (uploadList.length) {
        params.uploadList = uploadList;
      }
    } else if (type === TYPE_READING_CANCEL) {
      params.deleteList = fileList.origin.map(file => file.file_path_id);
      params.hstr_stat_cd = "3";
    } else if (type === TYPE_FINAL_CANCEL) {
      params.iptn_rslt = "";
    }

    let shouldCallUpdateStatusApi = false;

    // 판독소견이 추가, 수정, 삭제되었을 때 전자서명 호출
    if (params.hstr_stat_cd === "1" || params.hstr_stat_cd === "2" || params.hstr_stat_cd === "3") {
      try {
        const iptnParam = type === TYPE_READING_CANCEL ? null : { iptn_rslt: result.current.iptn_rslt };
        const { dgsgKey } = await signApi(iptnParam);
        if (dgsgKey) {
          // 전자서명 번호 파라미터 추가
          params.dgsg_no = dgsgKey;
          shouldCallUpdateStatusApi = true;
        }
      } catch (error) {
        setIsLoading(false);
        console.error("전자서명 api 호출 실패 : ", error);
      }
    } else {
      shouldCallUpdateStatusApi = true;
    }

    // 상태 및 판독 소견 update
    if (!shouldCallUpdateStatusApi) {
      setIsLoading(false);
      if (uploadList.length) {
        // Rollback : 업로드 된 파일 삭제
        handleDeleteUploadedFiles(uploadList);
      }
      return;
    }

    try {
      const { resultCode, resultData, resultMsg } = await callApi("/MSC_030000/updateStatusAndDetails", params);
      if (resultCode === 200) {
        if (isReportStatus) {
          callSendNoti(apiType);
        }
        if (onSuccess) {
          onSuccess(successMsg);
        }
        if (uploadList.length) {
          updateFileStateAfterSave(uploadList);
        }
        if (params.deleteList.length) {
          params.deleteList.forEach(uuid => deleteFileApi(uuid));
        }
      } else {
        handleUpdateFailureAfterSave(uploadList, resultMsg);
      }
    } catch (error) {
      handleUpdateFailureAfterSave(uploadList, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (type, onSuccess) => {
    const statInfo = prscStatCdRef.current.get(type);
    if (!statInfo) return;

    if (isEqualFileList && isEqualDeleteList) {
      // 파일 관련 데이터가 없는 경우 : 상태 및 판독소견만 업데이트
      updateStatusResponse(type, onSuccess);
    } else {
      setIsLoading(true);
      const uploadPromises = fileList.current.map((file, index) => {
        if (!Object.hasOwnProperty.call(file, "file_path_id")) {
          // 새롭게 업로드 시도
          /** 파일도 전자서명 태울 경우에만 주석 해제 */
          // return (
          //   signitureApi(file)
          //     .then(fileId =>
          //       handleSign(file).then(dgsgKey => ({
          //         success: true,
          //         file_path_id: fileId,
          //         file_nm: file.name,
          //         file_extn_nm: file.type,
          //         alreadyUploaded: false,
          //         index,
          //         dgsg_no: dgsgKey,
          //       })),
          //     )
          return signitureApi(file)
            .then(fileId =>
              Promise.resolve({
                success: true,
                file_path_id: fileId,
                file_nm: file.name,
                file_extn_nm: file.type,
                alreadyUploaded: false,
                index,
              }),
            )
            .catch(() => Promise.reject());
          // );
        }
        // 이미 업로드된 파일
        return Promise.resolve({
          success: true,
          file_path_id: file.file_path_id,
          alreadyUploaded: true,
          index,
        });
      });

      const uploadResults = await Promise.allSettled(uploadPromises);
      const newUploadResults = []; // 저장 버튼 클릭 이후 업로드 된 파일
      const alreadyUploadedFiles = []; // 저장 버튼 클릭 이전 업로드 된 파일
      const failedNewUploads = []; // 업로드 실패한 파일

      uploadResults.forEach(result => {
        if (result.status !== "fulfilled" || !result.value.file_path_id) {
          // if (result.status !== "fulfilled" || !result.value.file_path_id || !result.value.dgsg_no) {
          failedNewUploads.push(result.value);
          return; // 이후 로직은 실행하지 않음
        }

        // 성공한 경우
        if (result.value.alreadyUploaded) {
          alreadyUploadedFiles.push(result.value);
        } else {
          newUploadResults.push(result.value);
        }
      });

      if (failedNewUploads.length) {
        // 새롭게 업로드된 파일 중 실패한 경우가 있으면, 성공한 새 파일들을 삭제
        handleDeleteUploadedFiles([...newUploadResults, ...failedNewUploads]);
        snackbar.onRequestOpen(Message.networkFail);
        setIsLoading(false); // 업로드 종료
      } else if (newUploadResults.length) {
        // 파일 업로드 여부에 따라 후속 처리가 달라져야 한다
        updateStatusResponse(type, onSuccess, newUploadResults);
      } else {
        updateStatusResponse(type, onSuccess);
      }
    }
  };

  // 버튼 유효성 체크
  const handleCheck = type => {
    const { statCd, buttonName, noMsg, confirmMsg } = prscStatCdRef.current.get(type);

    if (selPrscStatCd !== statCd) {
      snackbar.onRequestOpen(Message[noMsg], "error");
    } else if (type === TYPE_FINAL) {
      if (!isEqualAll) {
        confirm.onOpen(`기능검사 ${buttonName}`, Message.saveCheckConfirm, type);
      } else {
        updateStatusResponse(type, updateStateAfterSave);
      }
    } else {
      confirm.onOpen(`기능검사 ${buttonName}`, Message[confirmMsg], type);
    }
  };

  const callSendCvrRequestNoti = async () => {
    const timeout = setTimeout(() => openLoading(Message.sendNoti), 300);
    try {
      const detail = {
        prsc_nm: selectedPatient.prsc_nm,
        mdcr_dr_id: selectedPatient.mdcr_dr_id,
        result: result.current.iptn_rslt,
        result_date: moment(result.current.iptn_dt).format("YYYY-MM-DD hh:mm"),
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
    if (!isEqualAll) {
      confirm.onOpen(`기능검사 CVR보고`, Message.saveCheckConfirm, TYPE_CVR);
    } else {
      callSendCvrRequestNoti();
    }
  };

  const handleConfirmOnState = state => {
    if (confirm.reqType === TYPE_SAVE_OUT) {
      if (state === CONFIRM) {
        handleSave(TYPE_SAVE, handleExtraActionsAfterSaveOut);
        setConfirm(prevState => ({ ...prevState, open: false }));
      } else {
        changeResultStates();
        updatePatientAndStatus(confirm.patient);
        handleDetail(confirm.patient);
        confirm.initial();
      }
    } else {
      if (state === CONFIRM) {
        if (confirm.reqType === TYPE_CVR) {
          handleSave(TYPE_SAVE, () => {
            handleDetail(selectedPatient, false);
            callSendCvrRequestNoti();
          });
        } else if (confirm.reqType === TYPE_FILE_DEL) {
          const deleteList = fileList.origin.map(file => file.file_path_id);
          setDeleteList(deleteList);
          setFileList(prevState => ({ ...prevState, current: [] }));
        } else if (confirm.reqType === TYPE_FINAL) {
          handleSave(confirm.reqType, updateStateAfterSave);
        } else if (confirm.reqType === TYPE_FINAL_CANCEL) {
          handleSave(confirm.reqType, updateFinalCancelAfterSave);
        } else {
          updateStatusResponse(confirm.reqType, updateStateAfterSave);
        }
      }
      confirm.initial();
    }
  };

  const handlePrint = () => {
    const auth = getAuth(161);

    if (!auth) {
      // 사용자 의무기록지 발급권한이 없을 경우
      alert.onOpen(Message.issueAlertTitle, Message.issueAlertMessage);
      return;
    }

    const patient = patientRef.current.getPatientInfo();

    const item = {
      pid: selectedPatient.pid,
      pt_nm: selectedPatient.pt_nm,
      age_cd: selectedPatient.age_cd,
      prsc_nm: selectedPatient.prsc_nm,
      mdcr_sign_lctn: result.current.mdcr_sign_lctn,
      mdcr_date: selectedPatient.mdcr_date,
      rcpn_sqno: selectedPatient.rcpn_sqno,
      mdcr_dr_nm: patient.mdcr_dr_nm,
      pt_dvcd: patient.pt_dvcd,
      cndt_dt: selectedPatient.cndt_dt,
      iptn_rslt: result.current.iptn_rslt,
    };

    const key = setLocalStorageItem({ ...item });

    if (key) {
      const url = `CSMSP002`;
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

  const handleFileDeleteConfirm = () => {
    confirm.onOpen("업로드 파일 삭제", Message.MSC_030000_fileDeleteConfirm, TYPE_FILE_DEL);
  };

  const handleFileChange = e => {
    const { files } = e.target;

    if (files.length) {
      const updateList = [...fileList.current];

      for (const key in files) {
        if (Object.hasOwnProperty.call(files, key)) {
          const file = files[key];
          updateList.push(file);
        }
      }

      if (updateList.length) {
        setFileList(prevState => ({ ...prevState, current: updateList }));
      }

      // 파일 처리가 끝난 후 입력 필드를 리셋
      e.target.value = null;
    }
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    const mstCon = mstGrid.current;
    const { dataProvider, gridView } = initializeGrid(mstCon, testResultFields, testResultColumns, Message.noSearch);

    const updateStateWithCommonCodeData = async () => {
      try {
        const params = {
          clsfList: [CLSF],
          cdList: RECEPTION_STATS,
        };
        const updatedStateList = await getImageBadgeDataApi(params, EXMN_IN_PRGR);
        updatedStateList.forEach(({ code }) => mstExamData.current.set(code, []));
        const margeList = [...colorExamCountList, ...updatedStateList];
        setColorExamCountList(margeList);
        setIsExamStateFetched(true);
        return margeList;
      } catch (error) {
        ErrorLogInfo();
      }
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
      let searchData = search;
      if (location.state) {
        // Main 에서 환자 선택 시
        const dateObject = new Date(location.state.cndt_dt);
        const updateData = { ...search, date: { from: dateObject, to: dateObject }, pid: location.state.pid };
        setSearch(prevState => ({ ...prevState, ...updateData }));
        searchInfoRef.current.setKeyword(`${location.state.pid} ${location.state.pt_nm}`, location.state);
        searchData = updateData;
        location.state = null;
      }
      handleSearch(searchData).then(() => changeSelectedBtnState(ALL_ITEMS_KEY));
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

      setIsDownloading(prev => {
        if (prev) {
          isInitializedFile.current = true;
          return false;
        }
        return prev;
      });

      if (!isEqualAll) {
        confirm.onOpen("결과입력 나가기", Message.saveCheckConfirm, TYPE_SAVE_OUT, newPatient);
      } else {
        updatePatientAndStatus(newPatient);
        handleDetail(values);
      }
    };
  }, [selectedPatient, isEqualAll, isDownloading, confirm, handleDetail]);

  useEffect(() => {
    mstGridView.current.onFilteringChanged = grid => {
      const filters = grid.getActiveColumnFilters(PRSC_STAT_CD);

      // 전체 체크 해제 O
      if (!filters.length && selectedBtnState === ALL_ITEMS_KEY) {
        return;
      }

      // 전체 체크 해제 X
      if (filters.length > 1 && filters.length !== mstExamData.current.size - 1) {
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
  }, [selectedPatient, selectedBtnState, handleSearchSelectedRow]);

  useEffect(() => {
    const updateMap = new Map();

    fileList.current.forEach(blob => {
      if (blob instanceof Blob) {
        if (objectUrlMap.has(blob)) {
          updateMap.set(blob, objectUrlMap.get(blob));
        } else {
          updateMap.set(blob, {
            // Blob 객체에 대한 URL 생성
            url: URL.createObjectURL(blob),
            type: blob.type,
          });
        }
      }
    });

    // 상태 업데이트
    setObjectUrlMap(updateMap);

    // 불필요한 URL 해제
    return () => {
      for (const object of objectUrlMap.values()) {
        object && URL.revokeObjectURL(object.url);
      }
    };
  }, [fileList]);

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
    <div className="MSC_030200 dp_full">
      <div className="align_box">
        <div className={`align_top ${selectedPatient.pid ? "patient_info_wrap" : ""}`}>
          <PatientSummaryBar
            pid={selectedPatient.pid}
            rcpn_sqno={selectedPatient.rcpn_sqno}
            prsc_clsf_cd={PRSC_CLSF_CD}
            hope_exrm_cd={selectedPatient.hope_exrm_cd}
            exmn_hope_date={selectedPatient.exmn_hope_date}
            ref={patientRef}
            pageId="MSC_030200"
            cndt_dt={selectedPatient.cndt_dt}
            iptn_dt={result.current.iptn_dt}
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
                    <h3 className="title">기능검사 결과 현황</h3>
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
            <div className="sec_wrap full_size">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">검사 결과</h3>
                  </div>
                </div>
                <div className="right_box">
                  <LUXButton
                    label="판독취소"
                    onClick={() => handleCheck(TYPE_READING_CANCEL)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="최종보고"
                    onClick={() => handleCheck(TYPE_FINAL)}
                    disabled={isButtonDisabled}
                    type="small"
                  />
                  <LUXButton
                    label="최종보고 취소"
                    onClick={() => handleCheck(TYPE_FINAL_CANCEL)}
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
                <div className="chart_box">
                  <div className="image-container">
                    <div className="img_box">
                      {isBindPatient || !selectedPatient.pid || selPrscStatCd === FINAL_REPORTED ? null : (
                        <div className="img_btn_box">
                          <label htmlFor="input-image">
                            <img src={clip} className="ic_attach_m_normal" alt="img" />
                          </label>
                          <input
                            accept=".pdf,.png,.jpeg,.jpg"
                            id="input-image"
                            type="file"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                            multiple
                          />
                          {fileList.current.length ? (
                            <img
                              src={trashcan}
                              className="ic_attach_m_normal"
                              onClick={handleFileDeleteConfirm}
                              alt="img"
                            />
                          ) : null}
                        </div>
                      )}
                    </div>
                    <div className="img_preview_container">
                      <div id="imgPreview" className="img_preview">
                        {isDownloading ? (
                          <div className="progress">
                            <LUXCircularProgress innerText="Loading" size={150} />
                          </div>
                        ) : (
                          Array.from(objectUrlMap).map(([, value]) =>
                            value ? (
                              value.type === "application/pdf" ? (
                                <iframe
                                  key={value.url}
                                  title="PDF Preview"
                                  src={value.url}
                                  width="65%"
                                  height="500px"
                                />
                              ) : (
                                <div key={value.url} className="img_element">
                                  <img src={value.url} alt="Preview" height="65%" width="65%" />
                                </div>
                              )
                            ) : null,
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="sec_wrap full_size add_footer">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">판독소견</h3>
                  </div>
                </div>
                <div className="right_box">
                  <LUXButton
                    label="검사소견"
                    onClick={() => setExmnOpnnOpen(true)}
                    type="small"
                    disabled={isButtonDisabled || selPrscStatCd === FINAL_REPORTED}
                  />
                </div>
              </div>
              <div className="sec_content">
                <div className="chart_box">
                  <LUXTextArea
                    id="iptnRslt"
                    defaultValue={result.current.iptn_rslt}
                    hintText="작성된 판독소견이 없습니다."
                    onChange={handleTextChange}
                    fullWidth
                    disabled={isButtonDisabled || selPrscStatCd === FINAL_REPORTED}
                    style={{ height: "100%" }}
                    rootStyle={{ height: "100%" }}
                    textAreaBoxStyle={{ height: "100%" }}
                    resize={false}
                  />
                </div>
              </div>
              <div className="sec_footer">
                <div className="option_box">
                  <LUXButton label="이력관리" onClick={() => setHistoryOpen(true)} disabled={!selectedPatient.pid} />
                  <LUXButton
                    label="저장"
                    onClick={() => handleSave(TYPE_SAVE, updateStateAfterSave)}
                    disabled={isSaveButtonDisabled}
                    blue={!isSaveButtonDisabled}
                  />
                  <LUXButton
                    label="출력"
                    onClick={handlePrint}
                    disabled={!selectedPatient.pid || selPrscStatCd !== FINAL_REPORTED}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MSC100100P01
        opnnType={EXRM_CLSF_CD}
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

export default WithWrapper(MSC_030200);
