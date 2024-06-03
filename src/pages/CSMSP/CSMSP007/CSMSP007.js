import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// common-ui-components
import { LUXButton, LUXSnackbar } from "luna-rocket";

// util
import callApi from "services/apis";
import { downloadApi, dynamicImageFormData, signitureApi, issueApi } from "services/apis/formApi";
import Message from "components/Common/Message";
import withPortal from "hoc/withPortal";
import { createDynamicBasicPage, createDynamicResultPage } from "pages/CSMSP/CSMSP007/CSMAP007_ComponentLib";
import { getLocalStorageItem } from "services/utils/localStorage";
import {
  initializeBaseState,
  fieldKeys,
  basicKeys,
  smartPickerSet,
} from "pages/MSC_050000/utils/MSC_050000_NameCodesMapping";
import { initializeDetail, formatToComponentStructure, getMdfrClsfSqno } from "pages/MSC_050000/utils/MSC_050000_Utils";

// css
import "assets/style/CSMSP007.scss";
import "assets/style/print.scss";

/**
 * @name 진정기록지
 * @author 윤서영
 */

export default function CSMSP007(props) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const { search } = useLocation();

  const [hspt, setHspt] = useState({
    hspt_nm: "",
    hspt_logo_lctn: "",
  });

  const [exmnInfo, setExmnInfo] = useState({
    cndt_dt: "", // 검사일
    iptn_prsn_nm: "", // 판독의사 명
    iptn_sign_lctn: "", // 판독의사 서명
    iptn_dt: "", // 판정일
    mdtr_site_cd: "", // 치료부위코드
  });

  const [state, setState] = useState({
    isPending: false, // 작성 대기 여부
    tabIndex: -1, // 진정 기록지/결과 기록지 구분
    isPrintable: false,
    // 환자 관련 정보
    patient: {
      pid: "",
      pt_nm: "",
      pt_dvcd: "",
      age_cd: "",
      mdcr_date: "",
      rcpn_sqno: "",
    },
    // 치료부위 배열
    mdtrSiteList: [], // 미작성 진정 기록지에서 사용
  });

  const [currentState, setCurrentState] = useState(initializeBaseState);
  const [commonState, setCommonState] = useState(initializeBaseState);

  const [sign, setSign] = useState("");
  const [fndtPrsnSign, setFndtPrsnSign] = useState("");

  const snackbarRef = useRef({
    message: Message.networkFail,
    open: false,
    type: "warning",
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    ...snackbarRef.current,
    onRequestOpen: (message, type) =>
      setSnackbar(prevState => ({ ...prevState, open: true, message, type: type || prevState.type })),
    onRequestClose: () => setSnackbar(prevState => ({ ...prevState, ...snackbarRef.current })),
  });

  const createBasicPageWithProps = createDynamicBasicPage(
    exmnInfo,
    currentState[fieldKeys.basicFieldEntry],
    currentState[fieldKeys.basicFieldList],
    hspt,
    state.patient,
    sign,
    state.isPending,
    fndtPrsnSign,
    state.isPrintable,
  );

  const createResultPageWithProps = createDynamicResultPage(
    exmnInfo,
    currentState[fieldKeys.resultFieldEntry],
    currentState[fieldKeys.resultFieldList],
    hspt,
    state.patient,
    sign,
    state.isPending,
    fndtPrsnSign,
    state.isPrintable,
  );

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handleClose = () => window.close();

  const notifyAndCloseOnError = (errMsg, delay = 2000) => {
    snackbar.onRequestOpen(Message.issueFail, "error");
    console.error(errMsg);
    setTimeout(() => {
      window.close();
    }, delay);
  };

  const notifyOnError = (errMsg = "") => {
    snackbar.onRequestOpen(Message.networkFail);
    errMsg && console.error(errMsg);
  };

  const handlePrint = () => {
    window.onafterprint = async function () {
      if (!state.isPending) {
        try {
          const { totalPages, rawData } = await dynamicImageFormData(document.getElementById("printArea"));
          const parameters = {
            pid: state.patient.pid,
            mdcr_date: state.patient.mdcr_date,
            mdfr_clsf_sqno: getMdfrClsfSqno(state.tabIndex, exmnInfo.mdtr_site_cd),
            rcpn_no: state.patient.rcpn_sqno,
            prsc_cd: totalPages > 5 ? "PDZ110102" : "PDZ110001",
          };
          const filekey = await signitureApi(rawData);
          const { resultCode, resultMsg } = await issueApi(parameters, filekey);
          if (resultCode !== 200) {
            notifyAndCloseOnError(resultMsg);
          } else {
            const parameters = {
              pt_nm: state.patient.pt_nm,
              mdfr_clsf_sqno: getMdfrClsfSqno(state.tabIndex, exmnInfo.mdtr_site_cd),
              exrmClsfCd: "E",
            };
            await callApi("/exam/sendIssueNoti", parameters);
            handleClose();
          }
        } catch (e) {
          notifyAndCloseOnError(e);
        }
      }
    };

    // 프린트 화면으로 전환
    window.print();

    if (state.isPending) handleClose();
  };

  const renderPages = () => {
    if (!currentState.initialized) return null;

    if (state.isPending) {
      return state.mdtrSiteList.map((code, index) => createBasicPageWithProps(code, index));
    }

    switch (state.tabIndex) {
      case 0:
        return createBasicPageWithProps();
      case 1:
        return createResultPageWithProps();
      default:
        return (
          <>
            {createBasicPageWithProps()}
            {createResultPageWithProps()}
          </>
        );
    }
  };

  const printFooter = (
    <div className="print_footer">
      {state.isPrintable ? (
        <>
          <LUXButton label="닫기" useRenewalStyle type="confirm" onClick={handleClose} />
          <LUXButton label="출력" useRenewalStyle type="confirm" onClick={handlePrint} blue />
        </>
      ) : (
        <LUXButton label="닫기" onClick={handleClose} type="confirm" />
      )}
    </div>
  );

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    // 내시경 공통코드 조회
    const fetchCommonCodes = async () => {
      try {
        const { resultCode, resultData, resultMsg } = await callApi("/MSC_050000/common");
        if (resultCode !== 200) {
          notifyOnError(resultMsg);
          return;
        }

        const { basicCodeList, resultCodeList } = resultData;

        // 기초정보
        const initialBasicEntries = currentState[fieldKeys.basicFieldEntry];
        const initialBasicList = currentState[fieldKeys.basicFieldList];
        const basicFormatData = formatToComponentStructure(basicCodeList, initialBasicList, initialBasicEntries);
        // 결과기록
        const initialresultEntries = currentState[fieldKeys.resultFieldEntry];
        const initialresultList = currentState[fieldKeys.resultFieldList];
        const resultFormatData = formatToComponentStructure(resultCodeList, initialresultList, initialresultEntries);

        setCommonState(prevState => ({
          ...prevState,
          initialized: true,
          basicEntries: basicFormatData.formatEntries,
          basicList: basicFormatData.formatList,
          resultEntries: resultFormatData.formatEntries,
          resultList: resultFormatData.formatList,
        }));
      } catch (err) {
        notifyOnError(err);
      }
    };

    // 병원정보가져오기
    const fetchHspInfo = async () => {
      const { resultData } = await callApi("/common/selectHspInfo");
      if (resultData) {
        setHspt(prevState => ({
          ...prevState,
          hspt_nm: resultData.hspt_nm,
          hspt_logo_lctn: resultData.hspt_logo_lctn,
        }));
      }
    };

    fetchHspInfo();
    fetchCommonCodes();
  }, []);

  useEffect(() => {
    if (!commonState.initialized) return;

    const getPtDvcdName = dvcd => (dvcd === "E" ? "응급" : dvcd === "I" ? "입원" : dvcd === "O" ? "외래" : "");

    const handleDownloadApiCall = async (uuid, updateState) => {
      if (!uuid) {
        return;
      }
      try {
        const blob = await downloadApi(uuid);
        if (blob) {
          updateState(blob);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const formatToSmartPickerStructure = () => {
      const updatedMap = new Map(commonState[fieldKeys.basicFieldEntry]);
      smartPickerSet.forEach(item => {
        if (commonState[fieldKeys.basicFieldEntry].get(item)) {
          updatedMap.set(item, "");
        }
      });
      setCurrentState(prevState => ({ ...prevState, ...commonState, [fieldKeys.basicFieldEntry]: updatedMap }));
    };

    const createDetailStates = (detail, type, listKey, obsrOpnnList = []) => {
      const entries = commonState[type];
      const list = commonState[listKey];
      return initializeDetail(detail, type, entries, list, obsrOpnnList, true);
    };

    const createBasicDetailStates = detail => {
      if (detail[basicKeys.fndtPrsnSign]) {
        handleDownloadApiCall(detail[basicKeys.fndtPrsnSign], setFndtPrsnSign);
      }
      const type = fieldKeys.basicFieldEntry;
      const listKey = fieldKeys.basicFieldList;
      const detailEntry = createDetailStates(detail, type, listKey);
      return { type, listKey, detailEntry };
    };

    const createResultDetailStates = (detail, obsrList) => {
      const type = fieldKeys.resultFieldEntry;
      const listKey = fieldKeys.resultFieldList;
      const detailEntry = createDetailStates(detail, type, listKey, obsrList);
      return { type, listKey, detailEntry };
    };

    const updateCurrentState = (entryKey, listKey, detail) => {
      if (!entryKey || !listKey || !detail) return;
      setCurrentState(prevState => ({
        ...prevState,
        initialized: true,
        [entryKey]: detail.detailEntries,
        [listKey]: detail.detailList,
      }));
    };

    const handleDetailApiCall = async data => {
      try {
        const params = {
          pid: data.patient.pid,
          prsc_date: data.prsc_date,
          prsc_sqno: data.prsc_sqno,
          tabIndex: data.tabIndex,
        };

        const { resultCode, resultData, resultMsg } = await callApi("/MSC_050000/detailFetcher", params);
        if (resultCode === 200) {
          const { basicInfo, resultRecord, obsrOpnn, exmnInfo } = resultData;
          setExmnInfo(prevState => ({ ...prevState, ...exmnInfo }));
          handleDownloadApiCall(exmnInfo.iptn_sign_lctn, setSign);

          if (data.tabIndex !== 0 && data.tabIndex !== 1) {
            // 진정/결과 기록지 둘다 출력하는 경우
            const { type, listKey, detailEntry } = createResultDetailStates(resultRecord, obsrOpnn);
            const { type: rType, listKey: rListKey, detailEntry: rEntry } = createBasicDetailStates(basicInfo);
            setCurrentState(prevState => ({
              ...prevState,
              initialized: true,
              [type]: detailEntry.detailEntries,
              [listKey]: detailEntry.detailList,
              [rType]: rEntry.detailEntries,
              [rListKey]: rEntry.detailList,
            }));
            return;
          }

          if (data.tabIndex === 1) {
            // 결과기록지
            const { type, listKey, detailEntry } = createResultDetailStates(resultRecord, obsrOpnn);
            updateCurrentState(type, listKey, detailEntry);
          } else {
            // 진정기록지
            const { type, listKey, detailEntry } = createBasicDetailStates(basicInfo);
            updateCurrentState(type, listKey, detailEntry);
          }
        } else {
          notifyOnError(resultMsg);
        }
      } catch (error) {
        notifyOnError(error);
      }
    };

    if (search) {
      const queryParams = new URLSearchParams(search);
      const key = queryParams.get("key");
      const localItem = getLocalStorageItem(key);

      if (localItem) {
        setState(prevState => ({
          ...prevState,
          ...localItem,
          patient: {
            ...prevState.patient,
            ...(localItem.patient || {}),
            pt_dvcd: localItem.patient ? getPtDvcdName(localItem.patient.pt_dvcd) : "",
          },
        }));

        if (!localItem?.isPending) {
          // 작성된 기록지: 세부 사항 조회
          handleDetailApiCall(localItem);
        } else {
          // 미작성 기록지: 스마트 피커 초기화
          formatToSmartPickerStructure();
        }
      }
    }
  }, [search, commonState]);

  useEffect(
    () => () => {
      if (sign) {
        URL.revokeObjectURL(sign);
      }
    },
    [sign],
  );

  useEffect(
    () => () => {
      if (fndtPrsnSign) {
        URL.revokeObjectURL(fndtPrsnSign);
      }
    },
    [fndtPrsnSign],
  );

  /* ================================================================================== */
  /* render() */
  return (
    <div className="MSC_050200">
      <div id="printArea">
        <div className="CSMSP007">{renderPages()}</div>
      </div>
      {printFooter}
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
    </div>
  );
}
