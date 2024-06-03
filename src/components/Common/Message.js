export default {
  // 공통 스택바
  receipt: "검사접수 완료되었습니다.",
  partExmnSuccess: "일부 검사접수 완료되었습니다.",
  receiptCancel: "검사접수 취소되었습니다.",
  exmnPrgrSuccess: "검사진행 되었습니다.",
  cnclExmnPrgrSuccess: "검사진행 취소되었습니다.",
  readingCancel: "판독취소 완료되었습니다.",
  save: "저장되었습니다.",
  report: "최종보고 완료되었습니다.",
  reportCancel: "최종보고 취소 완료되었습니다.",
  interprete: "최종판독 완료되었습니다.",
  interpreteCancel: "최종판독 취소 완료되었습니다.",
  copySuccess: "복사되었습니다.",
  deleteSuccess: "삭제되었습니다.",
  cancelSuccess: "취소되었습니다.",
  prscReqSuccess: "처방요청이 완료되었습니다.",
  prscDcSuccess: "DC요청이 완료되었습니다.",
  appointmet: "예약이 완료되었습니다.",

  iptnExistFail: "판독중인 검사는 검사취소가 불가합니다.",
  noReceipt: "검사대기 상태에서만 검사접수가 가능합니다.",
  noReceiptCancel: "접수 상태에서만 접수취소가 가능합니다.",
  exmnPrgrFail: "접수 상태에서만 검사진행이 가능합니다.",
  cnclExmnPrgrFail: "검사중 상태에서만 검사취소가 가능합니다.",
  noReportCancel: "최종보고 상태에서만 최종보고 취소가 가능합니다.",
  noReport: "중간보고 상태만 최종보고가 가능합니다.",
  noReadingCancel: "중간보고 상태만 판독취소가 가능합니다.",
  noConditionSave: "보고완료 상태는 저장이 불가능합니다.",
  alreadyDc: "이미 D/C요청된 검사입니다.",
  rptgExistFail: "보고완료된 검사는 취소 불가합니다.",
  interimReportExistFail: "중간보고된 검사는 취소 불가합니다.",

  noComplete: "진행중 상태에서만 검사완료가 가능합니다.",
  noCompleteCancel: "검사완료 상태에서만 검사취소가 가능합니다.",

  noSearch: "조회된 데이터가 없습니다.",
  noCheck2: "선택된 검사가 없습니다.",
  noData: "데이터가 존재하지 않습니다.",
  networkFail: "네트워크 상태를 확인해 주세요.",
  noChangeData: "수정된 내용이 없습니다.",
  noAction: "현재 개발 진행 중 입니다.",
  nowLoading: "데이터를 불러오는 중입니다.",
  loading: "Loading",
  duplicate: "중복된 코드 입니다.",
  saveFail: "자료 저장 중 오류가 발생하였습니다.",
  deleteFail: "자료 삭제 중 오류가 발생하였습니다.",
  issueFail: "작성된 서식 내 등록 오류가 발생하였습니다.",

  dcPrsc: "진료에서 D/C처리된 검사가 있습니다.",
  cancelPrsc: "진료에서 진료취소된 검사입니다.",
  sendNoti: "알림을 발송중입니다.",
  noAuth: "권한이 없습니다.",
  cvrSuccess: "CVR보고 완료되었습니다.",

  // 공통 컨펌창/알럿창 내용
  receiptCancelConfirm: "선택한 검사접수를 취소하시겠습니까?",
  completeCancelConfirm: "선택한 검사진행을 취소하시겠습니까?",
  noReceptionDc: (
    <span>
      진행중인 검사는 접수취소를 해야
      <br />
      DC 처리가 가능합니다.
    </span>
  ),
  noExmnDc: (
    <span>
      진행중인 검사는 검사취소를 해야
      <br />
      DC 처리가 가능합니다.
    </span>
  ),
  dcRaceiptBefore: (
    <span>
      D/C요청된 검사입니다.
      <br />
      검사 접수하시겠습니까?
    </span>
  ),
  saveCheckConfirm: (
    <span>
      변경사항이 저장되지 않았습니다.
      <br />
      저장하시겠습니까?
    </span>
  ),
  saveConfirm: "저장하시겠습니까?",
  changeConfirm: "입력된 값이 있습니다. 저장 후 이동하시겠습니까?",
  cancelConfirm: "입력된 값이 있습니다. 취소하시겠습니까?",

  readingCancelConfirm: "선택한 검사의 판독을 취소하시겠습니까?",
  reportCancelConfirm: "선택한 검사의 최종보고를 취소하시겠습니까?",
  interpreteCancelConfirm: "선택한 검사의 최종판독를 취소하시겠습니까?",
  noSave: "저장할 대상이 없습니다.",
  cnclExmnPrgrConfirm: "선택한 검사진행을 취소하시겠습니까?",
  bindPatient: (bindPid, ptNm) => (
    <span>
      해당 환자번호는 환자번호 {bindPid} {ptNm} 님으로 통합되었습니다.
      <br />
      통합 전 환자번호는 조회만 가능하며 수정 및 삭제 불가합니다.
    </span>
  ),
  issueAlertTitle: "결과지 발급 불가",
  issueAlertMessage: (
    <span>
      결과지 발급 권한이 없어
      <br />
      발급 불가합니다.
    </span>
  ),

  // MSC_020000 : 진단검사
  MSC_020000_noReply: "회신 받은 데이터가 없습니다.",
  MSC_020000_confirmLongPeriodSearch: "30일 이상 조회 하시겠습니까?",
  MSC_020000_noPrintBrcd: "바코드 출력할 대상이 없습니다.",
  MSC_020000_printerConnectionFailed: "출력 프로그램 설치 정보를 확인하시기 바랍니다.",
  MSC_020000_noPrinter: "출력 프로그램 연결이 잘되었는지 확인하시기 바랍니다.",
  MSC_020000_printerError: "바코드 출력기를 확인하시기 바랍니다.",
  MSC_020000_entsIptnCnclImpb: "위탁검사는 판독취소 불가합니다.",
  MSC_020000_exmnRsltUnRply: "검사결과가 회신되지 않았습니다.",
  MSC_020000_entsWtngTrmsPsbl: "위탁대기 상태만 전송이 가능합니다.",
  MSC_020000_entsTrmsCnclPsbl: "위탁전송 상태만 취소 가능합니다.",
  MSC_020000_rptgCmplSaveImpb: "보고완료 상태는 저장이 불가합니다.",
  MSC_020000_entsWtngSavePsbl: "위탁대기 상태는 저장이 불가합니다.",
  MSC_020000_entsTrmsSavePsbl: "위탁전송 상태는 저장이 불가합니다.",
  MSC_020000_NmvlRsltFrmtErr: "결과 유효숫자 자릿수가 초과하였습니다.",
  MSC_020000_NmvlExdErr: "결과 입력 최대 길이를 초과하였습니다.",
  MSC_020000_entsConnFail: "위탁 업체와의 연결에 실패했습니다.",
  MSC_020000_entsTrmsFail: "위탁 전송이 거부되었습니다.",
  MSC_020000_entsCnclTrmsFail: "위탁 전송 취소가 거부되었습니다.",
  MSC_020000_entsRplyFail: "위탁 결과 회신이 거부되었습니다.",
  MSC_020000_noExtcBrcd: "해당 바코드가 존재하지 않습니다.",
  MSC_020000_exmnExmnCmplBrcd: "이미 검사 완료된 바코드 입니다.",
  MSC_020000_brcdPrntSucc: "바코드가 출력되었습니다.",
  MSC_020000_addRddcBrcd: "이미 추가된 바코드입니다.",
  MSC_020000_invalidTrmsInst: "검사의뢰를 전송할 수 없는 위탁기관입니다",
  MSC_020000_invalidCnclTrmsInst: "검사의뢰를 전송취소할 수 없는 위탁기관입니다",
  MSC_020000_trmsExistFail: "위탁전송 상태에서는 검사취소 불가합니다.",
  MSC_020000_entsTrmsIng: "전송중입니다.",
  MSC_020000_entsCnclTrmsIng: "취소중입니다.",
  MSC_020000_entsRplyIng: "회신중입니다.",
  MSC_020000_entsNotUse: "검사의뢰를 전송할 수 없는 위탁기관입니다.",
  MSC_020000_alreadyIssued: "이미 출력된 검사처방입니다.",
  MSC_020000_rddcPrscIssu: "중복처방은 각각 접수 부탁드립니다.",
  MSC_020000_nonNvmlValu: "비 수치형 데이터를 입력 할 수 없습니다.",

  // MSC_030000 : 기능검사
  MSC_030000_noPrint: "보고 완료된 검사 항목을 선택하세요.",
  MSC_030000_fileDeleteConfirm: "업로드 한 파일을 삭제하시겠습니까?",
  MSC_030000_noWrcn: "기능검사 동의가 필요합니다.",
  MSC_030000_noImage: "이미지 호출 도중 문제가 발생하였습니다.",

  // MSC_040000 : 영상검사
  MSC_040100_pacsFail: "PACS 전송 중 오류가 발생하였습니다.",

  MSC_040100_noWrcn: "영상검사 조영제 사용 동의가 필요합니다.",
  MSC_040100_sendPacs: "검사정보를 전송중입니다.",
  MSC_040200_noInterpret: "판독중인 상태만 최종판독이 가능합니다.",
  MSC_040200_noSaveCancel: "판독중 상태만 판독취소가 가능합니다.",
  MSC_040200_noInterpretCancel: "최종판독 상태에서만 최종판독 취소가 가능합니다.",
  MSC_040200_noSave: "최종판독 상태는 저장이 불가합니다.",

  // MSC_050000 : 내시경검사
  MSC_050000_disagree: "내시경검사 동의가 필요합니다.",
  MSC_050000_validation: col => `${col}이 입력되지 않았습니다.`,
  MSC_050000_recordIssueAlertTitle: "기록지 발급 불가",
  MSC_050000_recordIssueAlertMessage: (
    <span>
      기록지 발급 권한이 없어
      <br />
      발급 불가합니다.
    </span>
  ),

  // MSC_060000 : 물리치료
  MSC_060000_noCheck2: "선택된 치료가 없습니다.",
  MSC_060000_trtmStart: "치료 시작시간이 기록되었습니다.",
  MSC_060000_trtmStartCancel: "처치가 취소되었습니다.",
  MSC_060000_trtmEnd: "치료 종료시간이 기록되었습니다.",
  MSC_060000_trtmEndCancel: "처치종료가 취소되었습니다.",
  MSC_060000_completeNoti: "치료 완료 보고되었습니다.",
  MSC_060000_complete: "치료 완료되었습니다.",
  MSC_060000_completeCancel: "치료 완료 취소되었습니다.",
  MSC_060000_completeNotiCancel: "치료 완료 보고가 취소되었습니다.",
  MSC_060000_noTrtmStart: "치료대기 상태에서만 처치시작이 가능합니다.",
  MSC_060000_noTrtmStartCancel: "진행중 상태에서만 처치취소가 가능합니다.",
  MSC_060000_noTrtmEnd: "진행중 상태에서만 처치종료가 가능합니다.",
  MSC_060000_noTrtmEndCancel: "치료완료 상태에서만 처치종료취소가 가능합니다.",
  MSC_060000_noComplete: "치료완료 상태에서만 완료보고가 가능합니다.",
  MSC_060000_noCompleteCancel: "보고완료 상태에서만 보고취소가 가능합니다.",
  MSC_060000_trtmStartCancelConfirm: "선택한 처치를 취소하시겠습니까?",
  MSC_060000_trtmEndCancelConfirm: "선택한 처치종료를 취소하시겠습니까?",
  MSC_060000_trtmCompleteCancelConfirm: "선택한 보고를 취소하시겠습니까?",
  MSC_060000_nonePt: "물리치료사가 선택되지 않았습니다. 물리치료사를 선택해주세요.",
  MSC_060000_updateTrtmDt: "치료 시간이 수정되었습니다.",
  MSC_060000_noTrtmStartDc: (
    <span>
      진행중인 처치는 처치취소를 해야
      <br />
      DC 처리가 가능합니다.
    </span>
  ),
  MSC_060000_dcTrtmStartBefore: (
    <span>
      D/C요청된 치료입니다.
      <br />
      처치시작 하시겠습니까?
    </span>
  ),
  MSC_060000_trtmEndSaveCheckConfirm: (
    <span>
      입력된 값이 있습니다.
      <br />
      그래도 취소하시겠습니까?
    </span>
  ),

  // MSC_070100
  MSC_070100_noRequiredError: "필수값을 입력해 주세요.",
  MSC_070100_chckNonNmvlExmn: "수치형 검사만 그래프 조회가 가능합니다.",
  MSC_070100_extcNonNmvlValu: "비 수치형 데이터가 포함되어 그래프 조회가 불가합니다.",
  MSC_070100_excsMaxChck: "그래프 조회는 최대 5개까지 가능합니다.",

  // MSC_090100 : 검사환경설정
  MSC_090100_emptyData: "입력되지 않았습니다.",
  MSC_090100_noSelect: "설정되지 않았습니다.",
  MSC_090100_noRef: "상/하한치는 최소 한 개 이상 설정되어야 합니다.",
  MSC_090100_worngRef: "상/하한치 범위가 잘못되었습니다.",
  MSC_090100_duplPrsc: "이미 등록된 처방코드입니다.",
  MSC_090100_delete: "저장된 검사설정이 있습니다. 삭제하시겠습니까?",
  MSC_090100_unSaveTitle: "입력중인 내용 존재",
  MSC_090100_unSaveMessage: "입력된 값이 있습니다. 저장 후 닫으시겠습니까?",

  // MSC_090200 : 검체코드관리
  MSC_090200_duplSpcmCd: (
    <span>
      검체코드가 중복되었습니다.
      <br />
      확인해주세요.
    </span>
  ),
  MSC_090200_duplCtnrCd: (
    <span>
      용기코드가 중복되었습니다.
      <br />
      확인해주세요.
    </span>
  ),
  MSC_090200_duplCtnrLabl: (
    <span>
      용기 라벨명이 중복되었습니다.
      <br />
      확인해주세요.
    </span>
  ),
  MSC_090200_useCtnr: (
    <span>
      다른 검체에서 사용중인 용기입니다.
      <br />
      확인해주세요.
    </span>
  ),

  // MSC_100100: 검사소견
  MSC_100100_unsavedTitle: "소견 미저장",
  MSC_100100_unsavedAlert: "입력된 값이 있습니다. 저장 후 이동하시겠습니까?",
  MSC_100100_saveTitle: "소견 저장",
  MSC_100100_deleteTitle: "소견 삭제",
  MSC_100100_deleteQuestion: "저장된 소견이 있습니다. 삭제하시겠습니까?",
  MSC_100100_cancelTitle: "취소",
  MSC_100100_noTitle: "필수값(제목)이 입력되지 않았습니다.",
  MSC_100100_maxLengthError: lim => `최대길이는 ${lim} 글자입니다.`,

  // 전자서명
  noSign: (
    <span>
      등록된 전자인증서가 없습니다.
      <br />
      의료업무 업무를 위해 전자인증서를 등록해주세요.
    </span>
  ),
  expireSign: (
    <span>
      등록된 전자인증서가 만료되었습니다.
      <br />
      갱신된 인증서를 등록해주세요.
    </span>
  ),
  signError: (
    <span>
      전자인증 서버와 통신이 원활하지 않습니다.
      <br />
      잠시 후 다시 시도해주세요.
    </span>
  ),
};
