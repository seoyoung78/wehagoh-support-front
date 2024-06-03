const patientIdentifiers = ["pid", "hope_exrm_cd", "rcpn_sqno", "prsc_date"];
export const extendedPatientIdentifiers = [...patientIdentifiers, "prsc_sqno"];

export const isElementMatchingSelection = (selected, element) =>
  selected.pid === element.pid &&
  selected.prsc_date === element.prsc_date &&
  +selected.prsc_sqno === +element.prsc_sqno;

// 객체에서 특정 프로퍼티만 추출하는 함수
export const extractProperties = (obj, properties = patientIdentifiers) =>
  properties.reduce((acc, propertyName) => {
    acc[propertyName] = obj[propertyName];
    return acc;
  }, {});

export const focusOnSelectedRow = (selected, gridView, identifiers = patientIdentifiers) => {
  if (!selected.pid || !gridView.current) {
    // console.error("Missing required parameters or data.");
    return;
  }

  const targetRowIndex = gridView.current.searchItem({
    fields: identifiers,
    values: identifiers.map(key => selected[key]),
  });

  const currentRowIndex = gridView.current.getCurrent().itemIndex;

  // 선택된 행이 없거나 현재 행과 같지 않을 때, 포커스를 업데이트합니다.
  if (currentRowIndex !== targetRowIndex) {
    if (targetRowIndex === -1) {
      gridView.current.clearCurrent(); // 현재 포커스 해제
    } else {
      gridView.current.setCurrent({ itemIndex: targetRowIndex, column: "column" }); // 새로운 행으로 포커스 이동
    }
  }
};

export const receptionStatus = new Map([
  // [접수] B(검사대기) -> C(접수)
  [
    "Receipt",
    {
      statCd: "B",
      noMsg: "noReceipt",
      successMsg: "receipt",
      title: "D/C요청 검사 접수",
      confirmMsg: "dcRaceiptBefore",
    },
  ],
  // [접수취소] C(접수) -> B(검사대기)
  [
    "ReceiptCancel",
    {
      statCd: "C",
      noMsg: "noReceiptCancel",
      successMsg: "receiptCancel",
      title: "검사 접수 취소",
      confirmMsg: "receiptCancelConfirm",
    },
  ],
  // [검사] C(접수) -> E(검사중)
  [
    "Conduct",
    {
      statCd: "C",
      noMsg: "exmnPrgrFail",
      successMsg: "exmnPrgrSuccess",
      title: "",
      confirmMsg: "",
    },
  ],
  // [검사취소] E(검사중) -> C(접수)
  [
    "ConductCancel",
    {
      statCd: "E",
      noMsg: "cnclExmnPrgrFail",
      successMsg: "cnclExmnPrgrSuccess",
      title: "검사 진행 취소",
      confirmMsg: "cnclExmnPrgrConfirm",
    },
  ],
]);

export const resultStatus = new Map([
  // 검사중(E) → 증간보고(M) OR [결과 수정 시] 증간보고(M) -> 증간보고(M)
  [
    "save",
    {
      buttonName: "저장",
      apiType: "Save",
      noMsg: "noSave",
      confirmMsg: "",
      successMsg: "save",
    },
  ],
  // 중간보고(M) → 검사중(E)
  [
    "readingCancel",
    {
      statCd: "M",
      buttonName: "판독 취소",
      apiType: "SaveCancel",
      noMsg: "noReadingCancel",
      confirmMsg: "readingCancelConfirm",
      successMsg: "readingCancel",
    },
  ],
  // 중간보고(M) → 최종보고(N)
  [
    "final",
    {
      statCd: "M",
      buttonName: "최종보고",
      apiType: "Report",
      noMsg: "noReport",
      confirmMsg: "",
      successMsg: "report",
    },
  ],
  // 최종보고(N) → 중간보고(M)
  [
    "finalCancel",
    {
      statCd: "N",
      buttonName: "최종보고 취소",
      apiType: "ReportCancel",
      noMsg: "noReportCancel",
      confirmMsg: "reportCancelConfirm",
      successMsg: "reportCancel",
    },
  ],
]);

export const mdtrStatus = new Map([
  // [처치시작] B(치료대기) -> C(진행중)
  [
    "trtmStart",
    {
      statCd: "B",
      noMsg: "noTrtmStart",
      confirmTitle: "D/C요청 치료 처치시작",
      confirmMsg: "dcTrtmStartBefore",
      successMsg: "trtmStart",
    },
  ],
  // [처치시작 취소] C(진행중) -> B(치료대기)
  [
    "trtmStartCancel",
    {
      statCd: "C",
      noMsg: "noTrtmStartCancel",
      confirmTitle: "처치 취소",
      confirmMsg: "trtmStartCancelConfirm",
      successMsg: "trtmStartCancel",
    },
  ],
  // [처치종료] C(진행중) -> E(치료완료)
  [
    "trtmEnd",
    {
      statCd: "C",
      noMsg: "noTrtmEnd",
      confirmTitle: "",
      confirmMsg: "",
      successMsg: "trtmEnd",
    },
  ],
  // [처치종료 취소] E(치료완료) -> C(진행중)
  [
    "trtmEndCancel",
    {
      statCd: "E",
      noMsg: "noTrtmEndCancel",
      confirmTitle: "처치종료 취소",
      confirmMsg: "trtmEndCancelConfirm",
      successMsg: "trtmEndCancel",
    },
  ],
  // [완료/보고] E(치료완료) -> N(보고완료)
  [
    "completeReport",
    {
      statCd: "E",
      noMsg: "noComplete",
      confirmTitle: "",
      confirmMsg: "",
      successMsg: "complete",
      specificSuccessMsg: "completeNoti", // 검사환경설정 내 보고 옵션 체크 시 사용되는 성공 메시지
    },
  ],
  // [완료/보고 취소] N(보고완료) -> E(치료완료)
  [
    "completeReportCancel",
    {
      statCd: "N",
      noMsg: "noCompleteCancel",
      confirmTitle: "완료 보고 취소",
      confirmMsg: "trtmCompleteCancelConfirm",
      successMsg: "completeCancel",
      specificSuccessMsg: "completeNotiCancel", // 검사환경설정 내 보고 옵션 체크 시 사용되는 성공 메시지
    },
  ],
]);
