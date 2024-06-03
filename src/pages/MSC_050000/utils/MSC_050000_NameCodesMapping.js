/** [중요] 테이블 컬럼명 변경 시 아래의 값도 변경 */

/** 기초정보 */
export const basicKeys = {
  // pk
  endsRcrdSqno: "ends_rcrd_sqno",
  endsFndtInfoSqno: "ends_fndt_info_sqno",

  // 이력상태코드
  hstrStatCd: "hstr_stat_cd",
  frstRgstDt: "frst_rgst_dt",
  frstRgstUsid: "frst_rgst_usid",

  // 공통분류코드
  idct1: "idct_1", // 적응증 1(위)
  idct2: "idct_2", // 적응증 2(대장)
  algrEn: "alrg_en", // 알러지 유무
  atsmCd: "atsm_cd", // 진경제 코드
  pastSdef: "past_sdef", // 과거 부작용
  mdcnTkngOptn1: "mdcn_tkng_optn_1", // 약제 복용 옵션 1
  mainHods: "main_hods", // 주요 병력
  mdcnTkng: "mdcn_tkng", // 약제 복용
  ptDvcd: "pt_clsf", // 환자 분류
  bpreCd: "bpre_cd", // 장정결 코드
  etbdStat: "etbd_stat", // 전신 상태
  npoEn: "npo_en", // 금식 유무
  endsClsfCd: "ends_clsf_cd", // 내시경 분류 코드
  slpnDrvtMdcnCd: "slpn_drvt_mdcn_cd", // 수면 유도 약제 코드
  sedtEvltCd: "sedt_evlt_cd", // 진정 평가 코드
  sedtRctnCd: "sedt_rctn_cd", // 진정 반응 코드
  ptSympCd: "pt_symp_cd", // 환자 증상 코드
  slpnEvltCd: "slpn_evlt_cd", // 수면 평가 코드
  chotBassCd: "chot_bass_cd", // 퇴실 기준 코드
  tethStat: "teth_stat", // 치아 상태

  ptClsfNm: "pt_clsf_nm", // 환자 분류 명칭
  tethStatNm: "teth_stat_nm", // 치아 상태 명칭
  bpreCdNm: "bpre_cd_nm", // 장정결 코드 명칭
  etbdStatNm: "etbd_stat_nm", // 전신 상태 명칭
  npoEnNm: "npo_en_nm", // 금식 유무 명칭
  mainHodsNm: "main_hods_nm", // 주요 병력 명칭
  alrgEnNm: "alrg_en_nm", // 알러지 유무 명칭
  idctNm1: "idct_nm_1", // 적응증 명칭 1
  idctNm2: "idct_nm_2", // 적응증 명칭 2
  mdcnTkngNm: "mdcn_tkng_nm", // 약제 복용 명칭
  mdcnTkngOptnNm1: "mdcn_tkng_optn_nm_1", // 약제 복용 옵션 명칭 1
  atsmCdNm: "atsm_cd_nm", // 진경제 코드 명칭
  pastSdefNm: "past_sdef_nm", // 과거 부작용 명칭
  endsClsfCdNm: "ends_clsf_cd_nm", // 내시경 분류 코드 명칭
  slpnDrvtMdcnCdNm: "slpn_drvt_mdcn_cd_nm", // 수면 유도 약제 코드 명칭
  sedtEvltCdNm: "sedt_evlt_cd_nm", // 진정 평가 코드 명칭
  sedtRctnCdNm: "sedt_rctn_cd_nm", // 진정 반응 코드 명칭
  ptSympCdNm: "pt_symp_cd_nm", // 환자 증상 코드 명칭
  slpnEvltCdNm: "slpn_evlt_cd_nm", // 수면 평가 코드 명칭
  chotBassCdNm: "chot_bass_cd_nm", // 퇴실 기준 코드 명칭

  // 단일 키값 정의
  exmnNm: "exmn_nm",
  fndtPrsn: "fndt_info_rcrd_usid",
  fndtPrsnSign: "fndt_info_rcrd_sign_lctn",
  hodsCnts: "main_hods_cnts",
  mdcnTkngCnts: "mdcn_tkng_cnts",
  atclStopYn: "atcl_tkng_stop_yn",
  atclStopNody: "atcl_tkng_stop_nody",
  exmnO2saMnvl: "exmn_o2sa_mnvl",
  exmnO2saMxvl: "exmn_o2sa_mxvl",
  rcvrO2saMnvl: "rcvr_o2sa_mnvl",
  rcvrO2saMxvl: "rcvr_o2sa_mxvl",
  oxygSupl: "oxyg_supl",
  exmnBfSytcBp: "exmn_bf_sytc_bp",
  exmnBfDatcBp: "exmn_bf_datc_bp",
  exmnBfPlst: "exmn_bf_plst",
  exmnBfRsprCnt: "exmn_bf_rspr_cnt",
  exmnAfSytcBp: "exmn_af_sytc_bp",
  exmnAfDatcBp: "exmn_af_datc_bp",
  exmnAfPlst: "exmn_af_plst",
  exmnAfRsprCnt: "exmn_af_rspr_cnt",
  sedtEvltCnts: "sedt_evlt_cnts",
  ptSympCnts: "pt_symp_cnts",
  slpnEvltCnts: "slpn_evlt_cnts",
  refMatr: "ref_matr",
  ctdnAcpnYn: "ctdn_acpn_yn",
  orcvYn: "loca_orcv_anst_use_yn",
  slpnEndYn: "slpn_ends_yn",
  slpnDosg: "slpn_drvt_mdcn_dosg",
  slpnCnts: "slpn_drvt_mdcn_cnts",
  // 퇴실 기준 코드 설명
  exerciseAbility: "운동능력",
  respiration: "호흡",
  circulation: "순환",
  exerciseSpO2: "산소포화도",
  consciousness: "의식상태",
};

/** 결과기록 */
export const resultKeys = {
  // pk
  endsRcrdSqno: "ends_rcrd_sqno",
  endsRsltRcrdSqno: "ends_rslt_rcrd_sqno",

  // 이력상태코드
  hstrStatCd: "hstr_stat_cd",
  frstRgstDt: "frst_rgst_dt",
  frstRgstUsid: "frst_rgst_usid",

  // 공통분류코드
  stmcBctrExmnRslt: "stmc_bctr_exmn_rslt",
  cloCd: "clo_cd",
  trtmMdtrCd: "trtm_mdtr_cd",
  exsnPrcdActgMthd: "exsn_prcd_actg_mthd",
  cmpcTrtmMthd: "cmpc_trtm_mthd",
  cmpcPrgr: "cmpc_prgr",
  advcMatr: "advc_matr",
  bpreDgreLC: "bpre_dgre_LC",
  bpreDgreTC: "bpre_dgre_TC",
  bpreDgreRC: "bpre_dgre_RC",
  etnlObsrOpnn: "etnl_obsr_opnn",
  dreOpnn: "dre_opnn",
  rsltOpnn1: "rslt_opnn_1",
  rsltOpnn2: "rslt_opnn_2",
  rsltOpnn3: "rslt_opnn_3",

  // 관찰소견
  exmnObsrOpnnSqno: "ends_obsr_opnn_sqno", // pk
  obsrOpnn: "obsr_opnn",
  obsrOpnnCnts: "obsr_opnn_cnts",
  obsrOpnnSite1: "obsr_opnn_site_1",
  obsrOpnnSite2: "obsr_opnn_site_2",
  tisuExmnYn: "tisu_exmn_yn",
  tisuExmnNoit: "tisu_exmn_noit",
  tisuExmnRslt1: "tisu_exmn_rslt_1",
  tisuExmnRslt2: "tisu_exmn_rslt_2",

  // 단일 키값 정의
  obsrInrtTimeMs: "obsr_inrt_time_ms",
  obsrExmnEndTimeMs: "obsr_exmn_end_time_ms",
  obsrReclTimeMs: "obsr_recl_time_ms",
  exmnNm: "exmn_nm",
  exmnDate: "exmn_date",
  dtrmDate: "dtrm_date",
  endsDrNm: "ends_dr_nm",
  gscnPtYn: "gscn_pt_yn",
  trtmMdtrCnts: "trtm_mdtr_cnts",
  cmpcYn: "cmpc_yn",
  cmpcCnts: "cmpc_cnts",
  cncrMdexAdvcMatr: "cncr_mdex_advc_matr",
  advcMatrCnts: "advc_matr_cnts",
  plypExsnPrcdActgYn: "plyp_exsn_prcd_actg_yn",

  // 공통코드 명칭 컬럼
  stmcBctrExmnRsltNm: "stmc_bctr_exmn_rslt_nm",
  cloCdNm: "clo_cd_nm",
  trtmMdtrCdNm: "trtm_mdtr_cd_nm",
  exsnPrcdActgMthdNm: "exsn_prcd_actg_mthd_nm",
  cmpcCntsNm: "cmpc_cnts_nm",
  cmpcTrtmMthdNm: "cmpc_trtm_mthd_nm",
  cmpcPrgrNm: "cmpc_prgr_nm",
  advcMatrNm: "advc_matr_nm",
  etnlObsrOpnnNm: "etnl_obsr_opnn_nm",
  dreOpnnNm: "dre_opnn_nm",
  bpreDgreLcNm: "bpre_dgre_lc_nm",
  bpreDgreTcNm: "bpre_dgre_tc_nm",
  bpreDgreRcNm: "bpre_dgre_rc_nm",
  rsltOpnnNm1: "rslt_opnn_nm_1",
  rsltOpnnNm2: "rslt_opnn_nm_2",
  rsltOpnnNm3: "rslt_opnn_nm_3",

  // 관찰소견 공통코드 명칭 컬럼
  obsrOpnnSiteNm1: "obsr_opnn_site_nm_1",
  obsrOpnnSiteNm2: "obsr_opnn_site_nm_2",
  obsrOpnnNm: "obsr_opnn_nm",
  tisuExmnRsltNm1: "tisu_exmn_rslt_nm_1",
  tisuExmnRsltNm2: "tisu_exmn_rslt_nm_2",

  // [테이블에 없는 Key] 프론트 단만 사용
  bpreDgreStore: "bpreDgreStore", // BBPS 총점 계산
  obsrInrtMinutes: "obsrInrtMinutes", // 관찰 삽입 시간 분
  obsrInrtSeconds: "obsrInrtSeconds", // 관찰 삽입 시간 초
  obsrExmnEndMinutes: "obsrExmnEndMinutes", // 관찰 검사 종료 시간 분
  obsrExmnEndSeconds: "obsrExmnEndSeconds", // 관찰 검사 종료 시간 초
  obsrReclTimeMinutes: "obsrReclTimeMinutes", // 관찰 회수 시간 분
  obsrReclTimeSeconds: "obsrReclTimeSeconds", // 관찰 회수 시간 초
};

export const codeNameColumn = {
  [basicKeys.ptDvcd]: basicKeys.ptClsfNm,
  [basicKeys.tethStat]: basicKeys.tethStatNm,
  [basicKeys.bpreCd]: basicKeys.bpreCdNm,
  [basicKeys.etbdStat]: basicKeys.etbdStatNm,
  [basicKeys.npoEn]: basicKeys.npoEnNm,
  [basicKeys.mainHods]: basicKeys.mainHodsNm,
  [basicKeys.algrEn]: basicKeys.alrgEnNm,
  [basicKeys.idct1]: basicKeys.idctNm1,
  [basicKeys.idct2]: basicKeys.idctNm2,
  [basicKeys.mdcnTkng]: basicKeys.mdcnTkngNm,
  [basicKeys.mdcnTkngOptn1]: basicKeys.mdcnTkngOptnNm1,
  [basicKeys.atsmCd]: basicKeys.atsmCdNm,
  [basicKeys.pastSdef]: basicKeys.pastSdefNm,
  [basicKeys.endsClsfCd]: basicKeys.endsClsfCdNm,
  [basicKeys.slpnDrvtMdcnCd]: basicKeys.slpnDrvtMdcnCdNm,
  [basicKeys.sedtEvltCd]: basicKeys.sedtEvltCdNm,
  [basicKeys.sedtRctnCd]: basicKeys.sedtRctnCdNm,
  [basicKeys.ptSympCd]: basicKeys.ptSympCdNm,
  [basicKeys.slpnDrvtMdcnCd]: basicKeys.slpnEvltCdNm,
  [basicKeys.chotBassCd]: basicKeys.chotBassCdNm,
  [resultKeys.stmcBctrExmnRslt]: resultKeys.stmcBctrExmnRsltNm,
  [resultKeys.cloCd]: resultKeys.cloCdNm,
  [resultKeys.trtmMdtrCd]: resultKeys.trtmMdtrCdNm,
  [resultKeys.exsnPrcdActgMthd]: resultKeys.exsnPrcdActgMthdNm,
  [resultKeys.cmpcCnts]: resultKeys.cmpcCntsNm,
  [resultKeys.cmpcTrtmMthd]: resultKeys.cmpcTrtmMthdNm,
  [resultKeys.cmpcPrgr]: resultKeys.cmpcPrgrNm,
  [resultKeys.advcMatr]: resultKeys.advcMatrNm,
  [resultKeys.etnlObsrOpnn]: resultKeys.etnlObsrOpnnNm,
  [resultKeys.dreOpnn]: resultKeys.dreOpnnNm,
  [resultKeys.bpreDgreLC]: resultKeys.bpreDgreLcNm,
  [resultKeys.bpreDgreTC]: resultKeys.bpreDgreTcNm,
  [resultKeys.bpreDgreRC]: resultKeys.bpreDgreRcNm,
  [resultKeys.rsltOpnn1]: resultKeys.rsltOpnnNm1,
  [resultKeys.rsltOpnn2]: resultKeys.rsltOpnnNm2,
  [resultKeys.rsltOpnn3]: resultKeys.rsltOpnnNm3,
  [resultKeys.obsrOpnnSite1]: resultKeys.obsrOpnnSiteNm1,
  [resultKeys.obsrOpnnSite2]: resultKeys.obsrOpnnSiteNm2,
  [resultKeys.obsrOpnn]: resultKeys.obsrOpnnNm,
  [resultKeys.tisuExmnRslt1]: resultKeys.tisuExmnRsltNm1,
  [resultKeys.tisuExmnRslt2]: resultKeys.tisuExmnRsltNm2,
};

export const cmcdCd = {
  // basicKeys
  [basicKeys.tethStat]: "CS5020",
  [basicKeys.etbdStat]: "CS5011",
  [basicKeys.mainHods]: "CS5007",
  [basicKeys.mdcnTkng]: "CS5008",
  [basicKeys.sedtRctnCd]: "CS5016",
  [basicKeys.ptSympCd]: "CS5017",
  [basicKeys.algrEn]: "CS5003",
  [basicKeys.idct1]: "CS5001",
  [basicKeys.idct2]: "CS5002",
  [basicKeys.mdcnTkngOptn1]: "CS5006",
  [basicKeys.atsmCd]: "CS5004",
  [basicKeys.pastSdef]: "CS5005",
  [basicKeys.endsClsfCd]: "CS5013",
  [basicKeys.slpnDrvtMdcnCd]: "CS5014",
  [basicKeys.ptDvcd]: "CS5009",
  [basicKeys.bpreCd]: "CS5010",
  [basicKeys.npoEn]: "CS5012",
  [basicKeys.sedtEvltCd]: "CS5015",
  [basicKeys.slpnEvltCd]: "CS5018",
  [basicKeys.chotBassCd]: "CS5019",
  // resultKeys
  [resultKeys.stmcBctrExmnRslt]: "CS7004",
  [resultKeys.cloCd]: "CS7018",
  [resultKeys.trtmMdtrCd]: "CS7005",
  [resultKeys.exsnPrcdActgMthd]: "CS7006",
  [resultKeys.cmpcTrtmMthd]: "CS7008",
  [resultKeys.cmpcPrgr]: "CS7009",
  [resultKeys.advcMatr]: "CS7010",
  [resultKeys.etnlObsrOpnn]: "CS7011",
  [resultKeys.dreOpnn]: "CS7012",
  [resultKeys.bpreDgreLC]: "CS7014",
  [resultKeys.bpreDgreTC]: "CS7014",
  [resultKeys.bpreDgreRC]: "CS7014",
  [resultKeys.rsltOpnn1]: "CS7015",
  [resultKeys.rsltOpnn2]: "CS7015",
  [resultKeys.rsltOpnn3]: "CS7015",
  [resultKeys.cmpcCnts]: "CS7017",
  // 관찰소견
  [resultKeys.obsrOpnnSite1]: "CS7002", // 위
  [resultKeys.obsrOpnnSite2]: "CS7013", // 대장
  [resultKeys.obsrOpnn]: "CS7019",
  [resultKeys.tisuExmnRslt1]: "CS7020",
  [resultKeys.tisuExmnRslt2]: "CS7016",
};

export const baseCheckSet = new Set([
  // basic
  cmcdCd[basicKeys.tethStat],
  cmcdCd[basicKeys.etbdStat],
  cmcdCd[basicKeys.mainHods],
  cmcdCd[basicKeys.mdcnTkng],
  cmcdCd[basicKeys.sedtRctnCd],
  cmcdCd[basicKeys.ptSympCd],
  // result
  cmcdCd[resultKeys.obsrOpnnSite1],
  cmcdCd[resultKeys.cloCd],
  cmcdCd[resultKeys.trtmMdtrCd],
  cmcdCd[resultKeys.advcMatr],
]);

// 스마트피커
export const smartPickerSet = new Set([
  // basic
  basicKeys.pastSdef,
  basicKeys.idct1,
  basicKeys.idct2,
  // result
  resultKeys.tisuExmnRslt2,
  resultKeys.etnlObsrOpnn,
  resultKeys.dreOpnn,
  resultKeys.rsltOpnn1,
  resultKeys.rsltOpnn2,
  resultKeys.rsltOpnn3,
  resultKeys.etnlObsrOpnn,
  resultKeys.dreOpnn,
  // 관찰소견
  // resultKeys.obsrOpnn,
  // resultKeys.tisuExmnRslt1,
  // resultKeys.tisuExmnRslt2,
]);

export const baseSelectSet = new Set([
  // basic
  cmcdCd[basicKeys.algrEn],
  cmcdCd[basicKeys.idct1],
  cmcdCd[basicKeys.idct2],
  cmcdCd[basicKeys.mdcnTkngOptn1],
  cmcdCd[basicKeys.atsmCd],
  cmcdCd[basicKeys.endsClsfCd],
  cmcdCd[basicKeys.slpnDrvtMdcnCd],
  // result
  cmcdCd[resultKeys.cmpcCnts],
]);

export const baseNumberSet = new Set([
  // basic
  basicKeys.exmnO2saMnvl,
  basicKeys.exmnO2saMxvl,
  basicKeys.rcvrO2saMnvl,
  basicKeys.rcvrO2saMxvl,
  basicKeys.oxygSupl,
  basicKeys.exmnBfSytcBp,
  basicKeys.exmnBfDatcBp,
  basicKeys.exmnBfPlst,
  basicKeys.exmnBfRsprCnt,
  basicKeys.exmnAfSytcBp,
  basicKeys.exmnAfDatcBp,
  basicKeys.exmnAfPlst,
  basicKeys.exmnAfRsprCnt,
  basicKeys.atclStopNody,
  basicKeys.slpnDosg,
  // result
  resultKeys.exmnObsrOpnnSqno,
]);

// 기초정보 퇴실기준
export const chotBassSet = new Set([
  basicKeys.exerciseAbility,
  basicKeys.respiration,
  basicKeys.circulation,
  basicKeys.exerciseSpO2,
  basicKeys.consciousness,
]);

// 결과기록 관찰시간
export const obsrTimeSet = new Set([
  resultKeys.obsrInrtTimeMs,
  resultKeys.obsrExmnEndTimeMs,
  resultKeys.obsrReclTimeMs,
  resultKeys.obsrInrtMinutes,
  resultKeys.obsrInrtSeconds,
  resultKeys.obsrExmnEndMinutes,
  resultKeys.obsrExmnEndSeconds,
  resultKeys.obsrReclTimeMinutes,
  resultKeys.obsrReclTimeSeconds,
]);

// BBPS
export const bbpsSet = new Set([resultKeys.bpreDgreLC, resultKeys.bpreDgreTC, resultKeys.bpreDgreRC]);

// 단일 체크박스
export const singleCheckSet = new Set([
  basicKeys.atclStopYn,
  basicKeys.orcvYn,
  basicKeys.chotBassCd,
  basicKeys.slpnEndYn,
]);

// 체크박스 기타 항목들
export const checkOtherItemSet = new Set([
  basicKeys.hodsCnts,
  basicKeys.mdcnTkngCnts,
  basicKeys.sedtEvltCnts,
  basicKeys.ptSympCnts,
  basicKeys.slpnEvltCnts,
  basicKeys.advcMatrCnts,
]);

// 출력지 높이 계산이 필요한 키
export const heightCalculationKeys = new Set([
  basicKeys.hodsCnts,
  basicKeys.mdcnTkngCnts,
  basicKeys.sedtEvltCnts,
  basicKeys.ptSympCnts,
  basicKeys.slpnEvltCnts,
  basicKeys.refMatr,
  resultKeys.obsrOpnnCnts,
  resultKeys.cncrMdexAdvcMatr,
  resultKeys.advcMatrCnts,
  resultKeys.tisuExmnNoit,
  resultKeys.trtmMdtrCnts,
]);

// 자료구조 Key
export const fieldKeys = {
  basicFieldEntry: "basicEntries",
  basicFieldList: "basicList",
  resultFieldEntry: "resultEntries",
  resultFieldList: "resultList",
};

export const initializeBaseState = {
  initialized: false,
  /** 기초정보 state */
  [fieldKeys.basicFieldEntry]: new Map([
    ["pid", ""],
    [basicKeys.endsRcrdSqno, ""],
    [basicKeys.hstrStatCd, ""],
    [basicKeys.frstRgstDt, ""],
    [basicKeys.frstRgstUsid, ""],
    [basicKeys.fndtPrsn, ""],
    [basicKeys.fndtPrsnSign, ""],
    [basicKeys.hodsCnts, ""],
    [basicKeys.algrEn, ""],
    [basicKeys.atsmCd, ""],
    [basicKeys.mdcnTkngOptn1, ""],
    [basicKeys.mainHods, ""],
    [basicKeys.mdcnTkng, ""],
    [basicKeys.ptDvcd, ""],
    [basicKeys.bpreCd, ""],
    [basicKeys.etbdStat, ""],
    [basicKeys.npoEn, ""],
    [basicKeys.endsClsfCd, ""],
    [basicKeys.slpnDrvtMdcnCd, ""],
    [basicKeys.slpnDosg, ""],
    [basicKeys.sedtEvltCd, ""],
    [basicKeys.sedtRctnCd, ""],
    [basicKeys.ptSympCd, ""],
    [basicKeys.slpnEvltCd, ""],
    [basicKeys.tethStat, ""],
    [basicKeys.atclStopNody, ""], // 항응고제 복용 중지 일수
    [basicKeys.exmnO2saMnvl, ""], // 검사 산소포화도 최소값
    [basicKeys.exmnO2saMxvl, ""], // 검사 산소포화도 최대값
    [basicKeys.rcvrO2saMnvl, ""], // 회복 산소포화도 최소값
    [basicKeys.rcvrO2saMxvl, ""], // 회복 산소포화도 최대값
    [basicKeys.oxygSupl, ""], // 산소 공급
    [basicKeys.exmnBfSytcBp, ""], // 검사 전 수축기 혈압
    [basicKeys.exmnBfDatcBp, ""], // 검사 전 이완기 혈압
    [basicKeys.exmnBfPlst, ""], // 검사 전 맥박
    [basicKeys.exmnBfRsprCnt, ""], // 검사 전 호흡 수
    [basicKeys.exmnAfSytcBp, ""], // 검사 후 수축기 혈압
    [basicKeys.exmnAfDatcBp, ""], // 검사 후 이완기 혈압
    [basicKeys.exmnAfPlst, ""], // 검사 후 맥박
    [basicKeys.exmnAfRsprCnt, ""], // 검사 후 호흡 수
    [basicKeys.sedtEvltCnts, ""], // 진정 평가 내용
    [basicKeys.ptSympCnts, ""], // 환자 증상 내용
    [basicKeys.slpnEvltCnts, ""], // 수면 평가 내용
    [basicKeys.refMatr, ""], // 참고 사항
    [basicKeys.ctdnAcpnYn, ""], // 보호자 동반 여부
    [basicKeys.mdcnTkngOptn1, ""], // 약제 복용 옵션 1
    [basicKeys.mdcnTkngCnts, ""], // 약제 복용 내용
    /* 중첩 객체  */
    [basicKeys.orcvYn, { name: "국소구강마취제(리도카인스프레이/베노카인등) 사용", checked: false }], // 국소 구강 마취 사용 여부
    [basicKeys.atclStopYn, { name: "중단", checked: false }], // 항응고제중단
    [basicKeys.slpnEndYn, { name: "수면내시경 시행", checked: false }],
    [basicKeys.chotBassCd, { name: "", cmcd_cd: "", checked: false, totalScore: 0, isTouched: false }],
    // 스마트 피커
    [basicKeys.pastSdef, { name: "", value: "" }],
    [basicKeys.idct1, { name: "", value: "" }],
    [basicKeys.idct2, { name: "", value: "" }],
  ]),
  [fieldKeys.basicFieldList]: new Map([]),

  /** 결과기록 state */
  [fieldKeys.resultFieldEntry]: new Map([
    ["pid", ""],
    [resultKeys.endsRcrdSqno, ""],
    [resultKeys.hstrStatCd, ""],
    [resultKeys.frstRgstDt, ""],
    [resultKeys.frstRgstUsid, ""],
    [resultKeys.stmcBctrExmnRslt, ""],
    [resultKeys.cloCd, ""],
    [resultKeys.trtmMdtrCd, ""],
    [resultKeys.exsnPrcdActgMthd, ""],
    [resultKeys.cmpcTrtmMthd, ""],
    [resultKeys.cmpcPrgr, ""],
    [resultKeys.advcMatr, ""],
    [resultKeys.etnlObsrOpnn, ""],
    [resultKeys.dreOpnn, ""],
    [resultKeys.bpreDgreLC, ""],
    [resultKeys.bpreDgreTC, ""],
    [resultKeys.bpreDgreRC, ""],
    [resultKeys.rsltOpnn1, ""],
    [resultKeys.rsltOpnn2, ""],
    [resultKeys.rsltOpnn3, ""],
    [resultKeys.obsrInrtTimeMs, ""],
    [resultKeys.obsrInrtMinutes, ""],
    [resultKeys.obsrInrtSeconds, ""],
    [resultKeys.obsrExmnEndTimeMs, ""],
    [resultKeys.obsrExmnEndMinutes, ""],
    [resultKeys.obsrExmnEndSeconds, ""],
    [resultKeys.obsrReclTimeMs, ""],
    [resultKeys.obsrReclTimeMinutes, ""],
    [resultKeys.obsrReclTimeSeconds, ""],
    [resultKeys.dtrmDate, ""],
    [resultKeys.endsDrNm, ""],
    [resultKeys.gscnPtYn, ""],
    [resultKeys.trtmMdtrCnts, ""],
    [resultKeys.cmpcYn, ""],
    [resultKeys.cmpcCnts, ""],
    [resultKeys.cncrMdexAdvcMatr, ""],
    [resultKeys.advcMatrCnts, ""],
    [resultKeys.plypExsnPrcdActgYn, ""],
    [resultKeys.dtrmDate, ""],
    [resultKeys.endsDrNm, ""],
    [resultKeys.exmnNm, ""],
    [resultKeys.bpreDgreStore, 0],
    // 스마트 피커
    [resultKeys.etnlObsrOpnn, { name: "", value: "" }],
    [resultKeys.dreOpnn, { name: "", value: "" }],
    [resultKeys.rsltOpnn1, { name: "", value: "" }],
    [resultKeys.rsltOpnn2, { name: "", value: "" }],
    [resultKeys.rsltOpnn3, { name: "", value: "" }],
  ]),
  [fieldKeys.resultFieldList]: new Map([[resultKeys.exmnObsrOpnnSqno, []]]),
};

/* [이력관리 팝업 Start] ================================================================================== */
// 이력관리 Key
export const historyTabKeys = {
  basicKey: "basic",
  recordKey: "record",
};

// 산소포화도
export const o2saKeyGroup = [
  basicKeys.exmnO2saMnvl,
  basicKeys.exmnO2saMxvl,
  basicKeys.rcvrO2saMnvl,
  basicKeys.rcvrO2saMxvl,
];

// 검사 전 활력징후
export const exmnBfVitalSignGroup = [
  basicKeys.exmnBfSytcBp,
  basicKeys.exmnBfDatcBp,
  basicKeys.exmnBfPlst,
  basicKeys.exmnBfRsprCnt,
];

//  검사 후 활력징후
export const exmnAfVitalSignGroup = [
  basicKeys.exmnAfSytcBp,
  basicKeys.exmnAfDatcBp,
  basicKeys.exmnAfPlst,
  basicKeys.exmnAfRsprCnt,
];

// 리스트에 들어있는 값들을 가공하는 집합
export const valuesToProcess = new Set([
  basicKeys.exmnO2saMnvl,
  basicKeys.exmnBfSytcBp,
  basicKeys.exmnAfSytcBp,
  resultKeys.exmnDate,
  resultKeys.exmnObsrOpnnSqno,
  resultKeys.obsrInrtTimeMs,
  resultKeys.bpreDgreLC,
  resultKeys.rsltOpnn1,
]);

//  Columns
export const basicHistoryColumns = [
  basicKeys.exmnNm,
  basicKeys.ptDvcd,
  basicKeys.fndtPrsn,
  basicKeys.ctdnAcpnYn,
  basicKeys.etbdStat,
  basicKeys.npoEn,
  basicKeys.mainHods,
  basicKeys.hodsCnts,
  basicKeys.algrEn,
  basicKeys.mdcnTkng,
  basicKeys.mdcnTkngCnts,
  basicKeys.atsmCd,
  basicKeys.pastSdef,
  basicKeys.orcvYn,
  basicKeys.atclStopYn,
  basicKeys.atclStopNody,
  basicKeys.endsClsfCd,
  basicKeys.slpnEndYn,
  basicKeys.slpnDrvtMdcnCd,
  basicKeys.slpnDosg,
  basicKeys.exmnO2saMnvl,
  basicKeys.exmnO2saMxvl,
  basicKeys.rcvrO2saMnvl,
  basicKeys.rcvrO2saMxvl,
  basicKeys.oxygSupl,
  basicKeys.exmnBfSytcBp,
  basicKeys.exmnBfDatcBp,
  basicKeys.exmnBfPlst,
  basicKeys.exmnBfRsprCnt,
  basicKeys.exmnAfSytcBp,
  basicKeys.exmnAfDatcBp,
  basicKeys.exmnAfPlst,
  basicKeys.exmnAfRsprCnt,
  basicKeys.sedtEvltCd,
  basicKeys.sedtEvltCnts,
  basicKeys.sedtRctnCd,
  basicKeys.ptSympCd,
  basicKeys.ptSympCnts,
  basicKeys.slpnEvltCd,
  basicKeys.slpnEvltCnts,
  basicKeys.chotBassCd,
  basicKeys.refMatr,
];

export const resultColonHistoryColumns = [
  resultKeys.exmnNm,
  resultKeys.exmnDate,
  resultKeys.endsDrNm,
  resultKeys.etnlObsrOpnn,
  resultKeys.dreOpnn,
  resultKeys.exmnObsrOpnnSqno,
  resultKeys.obsrInrtTimeMs,
  resultKeys.bpreDgreLC,
  resultKeys.cncrMdexAdvcMatr,
  resultKeys.rsltOpnn1,
  resultKeys.advcMatrCnts,
  resultKeys.plypExsnPrcdActgYn,
  resultKeys.cmpcYn,
  resultKeys.cmpcCnts,
];
export const resultGIHistoryColumns = [
  resultKeys.exmnNm,
  resultKeys.exmnDate,
  resultKeys.endsDrNm,
  resultKeys.gscnPtYn,
  resultKeys.exmnObsrOpnnSqno,
  resultKeys.stmcBctrExmnRslt,
  resultKeys.cloCd,
  resultKeys.trtmMdtrCd,
  resultKeys.exsnPrcdActgMthd,
  resultKeys.cmpcYn,
  resultKeys.cmpcCnts,
  resultKeys.cmpcTrtmMthd,
  resultKeys.cmpcPrgr,
  resultKeys.cncrMdexAdvcMatr,
  resultKeys.advcMatr,
  resultKeys.advcMatrCnts,
];
/* [이력관리 팝업 End] ================================================================================== */
