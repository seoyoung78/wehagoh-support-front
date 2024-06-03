import { lodash } from "common-util/utils";
import {
  fieldKeys,
  basicKeys,
  bbpsSet,
  resultKeys,
  cmcdCd,
  baseSelectSet,
  smartPickerSet,
  baseCheckSet,
  singleCheckSet,
  obsrTimeSet,
  historyTabKeys,
  o2saKeyGroup,
  exmnBfVitalSignGroup,
  exmnAfVitalSignGroup,
  valuesToProcess,
  basicHistoryColumns,
  resultColonHistoryColumns,
  resultGIHistoryColumns,
  codeNameColumn,
} from "pages/MSC_050000/utils/MSC_050000_NameCodesMapping";

export const getObsrButton = (type, onClick, disabled) => {
  let iconStyle = { width: "11px", height: "11px", backgroundPosition: "-95px -204px" };
  if (type === "delete") {
    iconStyle = { ...iconStyle, height: "1px", backgroundPosition: "-95px -209px" };
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`LUX_basic_btn Image basic${disabled ? " disable" : ""}`}
      style={{ float: "left", width: "27px", marginLeft: "auto" }}
    >
      <span className="sp_icon" style={iconStyle} />
    </button>
  );
};

const formatConditionalText = (entityMap, mapKey, prefixText, suffixText) => {
  const entry = entityMap.get(mapKey) || "-";
  return `${prefixText ? `${prefixText} ` : ""}(${entry})${suffixText ? ` ${suffixText}` : ""}`;
};

export const createFormatter =
  entityMap =>
  (mapKey, prefixText = "", suffixText = "") =>
    formatConditionalText(entityMap, mapKey, prefixText, suffixText);

export const formatSimpleText = (value = "-") => `(${value})`;

// 내시경 서식 분류 시퀸스 반환 함수
export const getMdfrClsfSqno = (tabIndex, mdtrSiteCd) => {
  const isColonSite = mdtrSiteCd === "C";

  if (tabIndex) {
    // 결과기록지
    return isColonSite ? 171 : 163;
  }
  // 진정기록지
  return isColonSite ? 169 : 168;
};

// 초를 분과 초로 나누기
export const convertSecondsToMunitesAndSeconds = ms => {
  if (!ms) return { minutes: "", seconds: "" };
  const minutes = Math.floor(ms / 60);
  const seconds = ms % 60;
  return { minutes, seconds };
};

const getTimeKeys = timeKey => {
  let minKey = "";
  let secKey = "";
  switch (timeKey) {
    case resultKeys.obsrInrtTimeMs:
      minKey = resultKeys.obsrInrtMinutes;
      secKey = resultKeys.obsrInrtSeconds;
      break;
    case resultKeys.obsrExmnEndTimeMs:
      minKey = resultKeys.obsrExmnEndMinutes;
      secKey = resultKeys.obsrExmnEndSeconds;
      break;
    case resultKeys.obsrReclTimeMs:
      minKey = resultKeys.obsrReclTimeMinutes;
      secKey = resultKeys.obsrReclTimeSeconds;
      break;
    default:
      break;
  }
  return { minKey, secKey };
};

// string > num
const resultFieldValueToNum = (state, key) => +state.get(key);

// 분을 초로 변환한 뒤 초와 더하기
export const mergeObsrMinutesAndSeconds = (state, key) => {
  const { minKey, secKey } = getTimeKeys(key);
  let ms = 0;
  ms = resultFieldValueToNum(state, secKey);
  ms += resultFieldValueToNum(state, minKey) * 60;
  return ms;
};

// 선택한 코드에 맞는 공통코드 name 을 찾는 함수
export const getSmartValue = (list, code) => {
  let name = "";
  let value = "";
  if (!list?.length || !code) return { name, value };

  list.forEach(({ cmcd_cd, cmcd_nm }) => {
    if (cmcd_cd === code) {
      name = cmcd_nm;
      value = cmcd_cd;
    }
  });
  return { name, value };
};

const createNewObject = data => {
  const { cmcd_cd, cmcd_nm, cmcd_figr_valu1, cmcd_expl } = data;
  const newObj = { cmcd_cd, cmcd_nm, cmcd_figr_valu1 };

  if (baseCheckSet.has(data.cmcd_clsf_cd)) {
    newObj.checked = false;
    newObj.disabled = false;
  }

  return newObj;
};

const calculateExitCriteriaScores = (entry, selectedCodes, criteriaList) => {
  // 초기 퇴실 기준 엔트리 상태 설정
  const updatedEntry = {
    ...entry,
    checked: selectedCodes.has("01"), // "01" 코드가 선택된 경우 체크 표시
    totalScore: 0, // 총점은 0
  };

  criteriaList.forEach(({ cmcd_cd, cmcd_figr_valu1, cmcd_expl }) => {
    if (cmcd_cd !== "01" && selectedCodes.has(cmcd_cd)) {
      const score = cmcd_figr_valu1; // 현재 기준의 점수
      updatedEntry.totalScore += score; // 총점 업데이트
      // 현재 기준에 대한 상세 점수와 코드 업데이트
      updatedEntry[cmcd_expl] = cmcd_cd;
      updatedEntry[`${cmcd_expl}Score`] = score;
    }
  });

  return updatedEntry;
};

// 관찰소견 default 값
const obsrOpnnSiteDefault = {
  [resultKeys.exmnObsrOpnnSqno]: null, // 검사 관찰 소견 일련번호
  [resultKeys.obsrOpnn]: { name: "", value: "" }, // 관찰 소견
  [resultKeys.obsrOpnnCnts]: "", // 관찰 소견 내용
  [resultKeys.obsrOpnnSite1]: [], // 관찰 소견 부위 1(위장)
  [resultKeys.obsrOpnnSite2]: "", // 관찰 소견 부위 2(대장)
  [resultKeys.tisuExmnNoit]: "", // 조직 검사 개수
  [resultKeys.tisuExmnRslt1]: { name: "", value: "" }, // 조직 검사 결과 1
  [resultKeys.tisuExmnRslt2]: { name: "", value: "" }, // 조직 검사 결과 2
  [resultKeys.tisuExmnYn]: { name: "조직검사 시행", checked: false }, // 조직 검사 여부
};

export const formatToComponentStructure = (originList, initialList, initialEntries) => {
  const formatList = new Map(initialList);
  const formatEntries = new Map(initialEntries);

  if (!originList.length) return { formatList, formatEntries };

  originList.forEach(data => {
    const newObj = createNewObject(data);
    const mapList = formatList.get(data.cmcd_clsf_cd) || [];

    // 퇴실기준
    if (data.cmcd_clsf_cd === cmcdCd[basicKeys.chotBassCd]) {
      const key = basicKeys.chotBassCd;
      let values = { ...formatEntries.get(key), ...newObj };

      newObj.cmcd_figr_valu1 = data.cmcd_figr_valu1;
      newObj.cmcd_expl = data.cmcd_expl;

      if (data.cmcd_cd === "01") {
        values = { ...values, name: data.cmcd_nm, cmcd_cd: data.cmcd_cd };
      }
      if (data.cmcd_expl) {
        values = { ...values, ...newObj, [data.cmcd_expl]: "", [`${data.cmcd_expl}Score`]: 0 };
      }

      formatEntries.set(key, values);
    }

    let updateList;
    if (
      baseSelectSet.has(data.cmcd_clsf_cd) ||
      (data.cmcd_clsf_cd === cmcdCd[basicKeys.chotBassCd] && data.cmcd_cd !== "05")
    ) {
      newObj.value = data.cmcd_cd;
      newObj.text = data.cmcd_nm;
      updateList = mapList.length ? [...mapList, newObj] : [{ value: "", text: "선택하세요." }, newObj];
    } else {
      updateList = mapList.length ? [...mapList, newObj] : [newObj];
    }

    // 관찰 소견 부위 초기화 값 세팅
    if (data.cmcd_clsf_cd === cmcdCd[resultKeys.obsrOpnnSite1]) {
      obsrOpnnSiteDefault[resultKeys.obsrOpnnSite1] = updateList;
    }

    formatList.set(data.cmcd_clsf_cd, updateList);
  });

  return { formatList, formatEntries };
};

export const cloneObservationObject = () => lodash.cloneDeep(obsrOpnnSiteDefault);

// 관찰소견 스마트 피커 값 추출 로직 추상화
const extractSmartPickerValue = (detailList, key, value) => {
  const cmcdList = [...detailList.get(cmcdCd[key])];
  return getSmartValue(cmcdList, value);
};

// 체크박스 리스트 생성 로직
const createCheckboxList = (list, checkedValues, isDisableConditionKey = false) => {
  if (!list?.length) return;
  const checkedSet = new Set(checkedValues.split("|"));
  return list.map(item => {
    const checked = checkedSet.has(item.cmcd_cd);
    const disabled = isDisableConditionKey ? !checked : false;
    return {
      ...item,
      checked,
      disabled,
    };
  });
};

// 조회한 관찰소견 형식 변환
const getFormatObsrOpnnList = (obsrOpnnList, detailList) => {
  const { tisuExmnYn, obsrOpnnSite1, obsrOpnn, tisuExmnRslt1, tisuExmnRslt2 } = resultKeys;

  return obsrOpnnList.map(value => {
    const siteValue = value[obsrOpnnSite1];
    const tisuExmnYnValue = value[tisuExmnYn] === "Y";

    // 스마트 피커 값 추출
    const obsrOpnnValue = extractSmartPickerValue(detailList, obsrOpnn, value[obsrOpnn]);
    const tisuExmnRslt1Value = extractSmartPickerValue(detailList, tisuExmnRslt1, value[tisuExmnRslt1]);
    const tisuExmnRslt2Value = extractSmartPickerValue(detailList, tisuExmnRslt2, value[tisuExmnRslt2]);

    // 체크박스 리스트 생성
    let obsrOpnnSiteList = [...detailList.get(cmcdCd[obsrOpnnSite1])];
    if (siteValue) {
      obsrOpnnSiteList = createCheckboxList(obsrOpnnSiteList, siteValue);
    }

    return {
      ...value,
      [tisuExmnYn]: { name: "조직검사 시행", checked: tisuExmnYnValue },
      [obsrOpnnSite1]: obsrOpnnSiteList,
      [obsrOpnn]: obsrOpnnValue,
      [tisuExmnRslt1]: tisuExmnRslt1Value,
      [tisuExmnRslt2]: tisuExmnRslt2Value,
    };
  });
};

// 관찰소견 데이터를 처리하는 별도의 함수
const processObsrOpnnData = (obsrOpnnList, detailList) => {
  if (!obsrOpnnList.length || !obsrOpnnList[0]) {
    // 관찰소견 데이터가 없거나 첫 번째 항목이 비어 있는 경우, 기본 관찰소견 항목 생성
    return [cloneObservationObject()];
  }
  // 관찰소견 데이터가 존재하는 경우, 포맷 변환 처리
  return getFormatObsrOpnnList(obsrOpnnList, detailList);
};

/**
 * BBPS 총점을 계산하고 업데이트하는 함수.
 *
 * @param {Map} detailEntries - 상세 항목들이 저장된 Map 객체.
 * @param {Map} detailList - 각 항목에 해당하는 코드 리스트가 저장된 Map 객체.
 * @param {Object} resultKeys - 결과 키들이 저장된 객체.
 * @param {string} key - 현재 처리 중인 항목의 키.
 * @param {any} values - 현재 처리 중인 항목의 값.
 */
const calculateAndUpdateBbpsTotalScore = (detailEntries, detailList, resultKeys, key, values) => {
  // bbps 총점 계산 로직
  detailEntries.set(key, values || "");

  const scoreId = resultKeys.bpreDgreStore; // 총점을 저장할 항목의 키.
  const list = detailList.get(cmcdCd[key]); // 현재 항목의 코드 리스트.
  const findCmcd = list.find(v => v.cmcd_cd === values); // 선택된 항목 찾기.

  if (findCmcd) {
    const prevTotal = detailEntries.get(scoreId) || 0; // 이전 총점. 없으면 0으로 시작.
    const currentTotal = prevTotal + findCmcd.cmcd_figr_valu1; // 현재 총점 업데이트.
    if (prevTotal !== currentTotal) {
      detailEntries.set(scoreId, currentTotal); // 변경된 총점 저장.
    }
  }
};

const updateEntryForReadOnly = (detailEntries, detailList, key, value) => {
  const cmcdList = detailList.get(cmcdCd[key]);
  const { name } = getSmartValue(cmcdList, value);
  detailEntries.set(key, name);
};

const updateEntryForSmartPicker = (detailEntries, detailList, cmcdCd, key, values) => {
  const cmcdList = detailList.get(cmcdCd[key]);
  const { name, value } = getSmartValue(cmcdList, values);

  if (name && value) {
    detailEntries.set(key, { name, value });
  }
};

export const initializeDetail = (detail, type, entries, list, obsrOpnnList = [], isReadOnly = false) => {
  const detailEntries = lodash.cloneDeep(entries);
  const detailList = lodash.cloneDeep(list);

  // 결과기록 - 관찰소견 조건문을 별도의 함수로 분리하여 처리
  if (type === fieldKeys.resultFieldEntry) {
    const formattedObsrOpnnList = processObsrOpnnData(obsrOpnnList, detailList);
    detailList.set(resultKeys.exmnObsrOpnnSqno, formattedObsrOpnnList);
  }

  for (const key in detail) {
    if (Object.hasOwnProperty.call(detail, key)) {
      const values = detail[key];
      if (bbpsSet.has(key)) {
        // bbps 총점 계산 로직
        calculateAndUpdateBbpsTotalScore(detailEntries, detailList, resultKeys, key, values);
      } else if (isReadOnly && (smartPickerSet.has(key) || baseSelectSet.has(cmcdCd[key]))) {
        updateEntryForReadOnly(detailEntries, detailList, key, values);
      } else if (smartPickerSet.has(key)) {
        // 스마트 피커
        updateEntryForSmartPicker(detailEntries, detailList, cmcdCd, key, values);
      } else if (values && key) {
        if (baseCheckSet.has(cmcdCd[key])) {
          const updatedCmcdList = createCheckboxList(
            detailList.get(cmcdCd[key]),
            values,
            key === basicKeys.tethStat || key === basicKeys.etbdStat, // 이 키들에 대해서만 disabled 처리
          );
          detailList.set(cmcdCd[key], updatedCmcdList);
        } else if (key === basicKeys.chotBassCd) {
          // 퇴실기준
          const selectedCodes = new Set(values.split("|"));
          const criteriaList = detailList.get(cmcdCd[key]);
          const entry = detailEntries.get(key);
          const updateEntry = calculateExitCriteriaScores(entry, selectedCodes, criteriaList);
          detailEntries.set(key, updateEntry);
        } else if (singleCheckSet.has(key)) {
          // 싱글 체크박스
          detailEntries.set(key, { ...detailEntries.get(key), checked: values === "Y" });
        } else if (obsrTimeSet.has(key) && detail[key]) {
          // 관찰소요시간 설정
          const { minutes, seconds } = convertSecondsToMunitesAndSeconds(detail[key]);
          const { minKey, secKey } = getTimeKeys(key);
          if (minKey && secKey) {
            detailEntries.set(minKey, minutes);
            detailEntries.set(secKey, seconds);
          }
        } else {
          detailEntries.set(key, values);
        }
      }
    }
  }

  return { detailList, detailEntries };
};

/* [이력관리 팝업 함수 Start] ================================================================================== */
//  tabId 에 맞는 컬럼 가져오는 함수
const getColumnsForTab = (tabId, isGI) => {
  let columns = [...basicHistoryColumns];

  if (tabId === historyTabKeys.basicKey) {
    columns = [...basicHistoryColumns];

    if (isGI) {
      columns.splice(3, 0, basicKeys.tethStat);
      columns.splice(9, 0, basicKeys.idct1);
    } else {
      columns.splice(3, 0, basicKeys.bpreCd);
      columns.splice(9, 0, basicKeys.idct2);
    }
  } else if (tabId === historyTabKeys.recordKey) {
    if (isGI) {
      columns = [...resultGIHistoryColumns];
    } else {
      columns = [...resultColonHistoryColumns];
    }
  }

  return columns;
};

const getSearchParameters = id => {
  switch (id) {
    case "basic":
      return { searchProperty: basicKeys.endsFndtInfoSqno, resultInfo: "| 기초정보 |" };
    case "record":
      return { searchProperty: resultKeys.endsRsltRcrdSqno, resultInfo: "| 결과기록 |" };
    default:
      return { searchProperty: "", resultInfo: "" };
  }
};

const processFunctionMapping = (find, findObsrList, isGI, key, mapping) => {
  let args = [];

  if (valuesToProcess.has(key)) {
    args = key === resultKeys.exmnObsrOpnnSqno ? [find, findObsrList, isGI] : [find];
  } else if (key === resultKeys.advcMatrCnts) {
    args = [find[key], isGI];
  } else if (key === basicKeys.chotBassCd) {
    args = [find[codeNameColumn[key]]];
  } else {
    args = [find[key]];
  }

  return mapping(...args);
};

const addSeparatorToString = inputString => (!inputString ? "" : inputString.split("|").join(", "));

/* [이력관리 팝업 함수 : Format 함수 Start] ================================================================================== */
const formatO2saValues = find =>
  `\n산소포화도 검사중 ${find[o2saKeyGroup[0]] || ""}~${find[o2saKeyGroup[1]] || ""}% 회복중 ${
    find[o2saKeyGroup[2]] || ""
  }~${find[o2saKeyGroup[3]] || ""}%`;

//  활력징후 문자열 형식 변환 함수
const formatVitalSign = (find, keys, type) =>
  `\n활력징후 ${type === "after" ? "검사 후" : "검사 전"} 혈압 ${find[keys[0]] || ""}/${find[keys[1]] || ""} 맥박 ${
    find[keys[2]] || ""
  } 호흡수${find[keys[3]] || ""}`;

const formatBpreValues = find =>
  `\n\n[BBPS]\nLC ${find[codeNameColumn[[resultKeys.bpreDgreLC]]] || ""}\nTC ${
    find[codeNameColumn[[resultKeys.bpreDgreTC]]] || ""
  }\nRC ${find[codeNameColumn[[resultKeys.bpreDgreRC]]] || ""}\n`;

const formatRsltOpnn = find =>
  `\n\n[진단결과]\n결과소견1 ${find[codeNameColumn[[resultKeys.rsltOpnn1]]] || ""}\n결과소견2 ${
    find[codeNameColumn[[resultKeys.rsltOpnn2]]] || ""
  }\n결과소견3 ${find[codeNameColumn[[resultKeys.rsltOpnn3]]] || ""}\n`;

// 밀리초를 분과 초로 변환
const convertMillisecondsToMinutesAndSeconds = ms => {
  if (!ms) return { minutes: "", seconds: "" };
  const minutes = Math.floor(ms / 60);
  const seconds = ms % 60;
  return { minutes, seconds };
};

const formatObsrInrtMinutes = find => {
  const { minutes: inrtMin, seconds: inrtSeconds } = convertMillisecondsToMinutesAndSeconds(
    find[resultKeys.obsrInrtTimeMs],
  );
  const { minutes: exmnMin, seconds: exmnSeconds } = convertMillisecondsToMinutesAndSeconds(
    find[resultKeys.obsrExmnEndTimeMs],
  );
  const { minutes: reclMin, seconds: reclSeconds } = convertMillisecondsToMinutesAndSeconds(
    find[resultKeys.obsrReclTimeMs],
  );

  return `\n관찰소요시간 삽입(도달)시간 ${inrtMin || ""}분 ${inrtSeconds || ""}초 검사종료시간 ${exmnMin || ""}분 ${
    exmnSeconds || ""
  }초 회수시간 ${reclMin || ""}분 ${reclSeconds || ""}초`;
};

const formatDateValues = find =>
  `\n검사/판정일 검사일 ${find[resultKeys.exmnDate] || ""} 판정일 ${find[resultKeys.dtrmDate] || ""}`;

const formatObsrOpnnValues = (find, list, isGI) => {
  const obsrTitle = "\n\n[관찰소견]";
  if (!find) return `${obsrTitle}\n`;

  const getResultForObsr = obsr => {
    const siteKey = isGI ? resultKeys.obsrOpnnSiteNm1 : resultKeys.obsrOpnnSiteNm2;
    const rsltKey = isGI ? resultKeys.tisuExmnRsltNm1 : resultKeys.tisuExmnRsltNm2;

    const siteNm = isGI ? addSeparatorToString(obsr[siteKey]) : obsr[siteKey] || "";
    const obsrCnts = obsr[resultKeys.obsrOpnnCnts] || "";
    const obsrOpnnNm = isGI ? `\n결과: ${obsr[resultKeys.obsrOpnnNm] || ""}` : "";
    const tisuExmnYn = obsr[resultKeys.tisuExmnYn] === "Y" ? "O" : "X";
    const tisuExmnNoit = obsr[resultKeys.tisuExmnNoit] || "-";
    const tisuExmnRsltNm = obsr[rsltKey] || "";

    return `\n부위: ${siteNm}\n소견: ${obsrCnts}${obsrOpnnNm}\n조직검사: 조직검사 시행 ${tisuExmnYn} (${tisuExmnNoit})\n조직검사 결과: ${tisuExmnRsltNm}\n`;
  };

  const resultStr = list.map(getResultForObsr).join("");

  return resultStr ? `${obsrTitle}${resultStr}` : `${obsrTitle}\n`;
};
/* [이력관리 팝업 함수 : Format 함수 End] ================================================================================== */

const processStringMapping = (find, key, mapping) => {
  let result = "";

  if (singleCheckSet.has(key)) {
    const value = find[key] === "Y" ? "O" : "X";
    let valueCnts = "";

    result += `\n${mapping} ${value}`;

    if (key === basicKeys.atclStopYn) {
      valueCnts = find[basicKeys.atclStopNody] || "-";
      result += ` 중단 (${valueCnts})일전`;
    }
  } else {
    const selectedCmcdCd = cmcdCd[key];
    let value = "";

    if (selectedCmcdCd) {
      value = find[codeNameColumn[key]] || "";
      if (baseCheckSet.has(selectedCmcdCd)) {
        value = addSeparatorToString(value);
      }
    } else {
      if (key === basicKeys.refMatr) {
        value = "\n";
      }
      value += find[key] || "";
    }

    result += `\n${mapping} ${value}`;
  }

  return result;
};

//  기초정보 테이블 제목 매핑
const historyBasicKeyMappings = {
  [basicKeys.exmnNm]: "검사명",
  [basicKeys.ptDvcd]: "환자분류",
  [basicKeys.fndtPrsn]: "기록자",
  [basicKeys.tethStat]: "치아상태",
  [basicKeys.bpreCd]: "장정결",
  [basicKeys.ctdnAcpnYn]: "보호자 동반 유무",
  [basicKeys.etbdStat]: "전신상태",
  [basicKeys.npoEn]: "금식유무",
  [basicKeys.mainHods]: "주요병력",
  [basicKeys.hodsCnts]: "주요병력 기타",
  [basicKeys.algrEn]: "알레르기 유무",
  [basicKeys.idct1]: "적응증",
  [basicKeys.idct2]: "적응증",
  [basicKeys.mdcnTkng]: "약제복용력",
  [basicKeys.mdcnTkngCnts]: "약제복용력 기타",
  [basicKeys.atsmCd]: "진경제사용",
  [basicKeys.pastSdef]: "과거부작용",
  [basicKeys.orcvYn]: "국소구강마취제(리도카인스프레이/베노카인등) 사용",
  [basicKeys.atclStopYn]: "항응고제중단여부",
  [basicKeys.endsClsfCd]: "내시경분류",
  [basicKeys.slpnEndYn]: "수면내시경 시행",
  [basicKeys.slpnDrvtMdcnCd]: "수면유도제 사용",
  [basicKeys.slpnDosg]: value => ` (${value || "-"})ml`,
  [basicKeys.exmnO2saMnvl]: find => formatO2saValues(find),
  [basicKeys.oxygSupl]: value => `\n산소공급 ${value || "-"} liter`,
  [basicKeys.exmnBfSytcBp]: find => formatVitalSign(find, exmnBfVitalSignGroup, "before"),
  [basicKeys.exmnAfSytcBp]: find => formatVitalSign(find, exmnAfVitalSignGroup, "after"),
  [basicKeys.sedtEvltCd]: "진정평가",
  [basicKeys.sedtEvltCnts]: "진정평가 기타",
  [basicKeys.sedtRctnCd]: "진정반응",
  [basicKeys.ptSympCd]: "환자증상",
  [basicKeys.ptSympCnts]: "환자증상 기타",
  [basicKeys.slpnEvltCd]: "수면평가",
  [basicKeys.slpnEvltCnts]: "수면평가 기타",
  [basicKeys.chotBassCd]: value => `\n\n[퇴실기준]${value ? "\n" + value.split("|").join("\n") : ""}\n`,
  [basicKeys.refMatr]: "참고사항",
};

//  결과기록 테이블 제목 매핑
const historyResultKeyMappings = {
  [resultKeys.exmnNm]: "검사명",
  [resultKeys.plypExsnPrcdActgYn]: value => `\n용종 절제술 시행여부 ${value === "Y" ? "O" : "X"}`,
  [resultKeys.cmpcYn]: value => `\n합병증 여부 ${value === "Y" ? "O" : "X"}`,
  [resultKeys.cmpcCnts]: "합병증",
  [resultKeys.endsDrNm]: "내시경 의사명",
  [resultKeys.etnlObsrOpnn]: "외부관찰소견",
  [resultKeys.dreOpnn]: "직장수지소견",
  [resultKeys.gscnPtYn]: "기존 위암환자",
  [resultKeys.stmcBctrExmnRslt]: "헬리코박터균 검사결과",
  [resultKeys.cloCd]: "CLO",
  [resultKeys.trtmMdtrCd]: "처치 및 치료",
  [resultKeys.exsnPrcdActgMthd]: "절제술 시행방법",
  [resultKeys.cmpcCnts]: "합병증",
  [resultKeys.cmpcTrtmMthd]: "합병증 처치방법",
  [resultKeys.cmpcPrgr]: "합병증 경과",
  [resultKeys.cncrMdexAdvcMatr]: "암검진 권고사항",
  [resultKeys.advcMatr]: "권고사항",
  [resultKeys.advcMatrCnts]: (value, isGI) => (isGI ? `\n권고사항 기타 ${value || ""}` : `\n권고사항\n${value || ""}`),
  [resultKeys.endsRsltRcrdSqno]: "관찰소견",

  /* 문자열 변환 함수 */
  // 검사/판정일
  [resultKeys.exmnDate]: find => formatDateValues(find),
  // 관찰소견
  [resultKeys.exmnObsrOpnnSqno]: (find, list, isGI) => formatObsrOpnnValues(find, list, isGI),
  // 관찰소요시간
  [resultKeys.obsrInrtTimeMs]: find => formatObsrInrtMinutes(find),
  // BBPS
  [resultKeys.bpreDgreLC]: find => formatBpreValues(find),
  // 진단결과 결과소견
  [resultKeys.rsltOpnn1]: find => formatRsltOpnn(find),
};

export const findEndoElementAndGetInfo = (values, tabId, isGI = false, endoList = [], obsrOpnnList = []) => {
  const { searchProperty, resultInfo } = getSearchParameters(tabId);

  const find = endoList.find(
    el =>
      el[basicKeys.endsRcrdSqno] === +values[basicKeys.endsRcrdSqno] && el[searchProperty] === +values[searchProperty],
  );

  const findObsrList =
    tabId === "record"
      ? obsrOpnnList.filter(
          el => el[resultKeys.endsRsltRcrdSqno] === find[resultKeys.endsRsltRcrdSqno] && el.pid === find.pid,
        )
      : [];
  let resultString = resultInfo;

  if (!find) return resultString;

  const displayColumns = getColumnsForTab(tabId, isGI);

  displayColumns.forEach(key => {
    const mapping = tabId === "record" ? historyResultKeyMappings[key] : historyBasicKeyMappings[key];

    if (typeof mapping === "function") {
      resultString += processFunctionMapping(find, findObsrList, isGI, key, mapping);
    } else if (typeof mapping === "string") {
      resultString += processStringMapping(find, key, mapping);
    }
  });

  return resultString;
};

/* [이력관리 팝업 함수 End] ================================================================================================ */
