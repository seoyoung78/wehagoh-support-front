import { ValueType } from "realgrid";
import icEmrg from "assets/imgs/ic_emergency_small.png";
import icMemoMYellow from "assets/imgs/ic_memo_m_yellow.png";

// 그룹화 된 접수현황 그리드
export const groupedDataFields = [
  {
    fieldName: "pid",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_hope_date",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "hope_exrm_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "pt_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "age_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rcpn_hm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_date",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rcpn_sqno",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "mdcr_dr_id",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "mdcr_user_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_prgr_stat_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "dc_rqst_yn",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "mdcr_date",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_hope_hm",
    dataType: ValueType.TEXT,
  },
  { fieldName: "emrg_stat", dataType: ValueType.BOOLEAN }, // 응금환자
];

// 결과 현황 그리드
export const testResultFields = [
  ...groupedDataFields,
  {
    fieldName: "prsc_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_sqno",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_dr_sqno",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "dobr",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "cndt_dt",
    dataType: ValueType.DATETIME,
  },
];

// 처방 목록 그리드
export const prscInfoFields = [
  {
    fieldName: "prsc_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_memo",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rcpn_dt",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "pid",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_date",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_sqno",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "hope_exrm_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "wrcn_wrtn_yn",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_prgr_stat_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_hope_date",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_dr_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsn_user_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "dc_rqst_yn",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "wrcn_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "mdcr_dr_id",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_dr_sqno",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rcpn_hm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "cndt_hm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "cndt_dt",
    dataType: ValueType.DATETIME,
  },
];

// 그룹화 된 접수현황 컬럼
export const groupedDataColumns = [
  {
    name: "pid",
    fieldName: "pid",
    header: "환자번호",
    width: 50,
    renderer: { showTooltip: true },
  },
  {
    name: "pt_nm",
    fieldName: "pt_nm",
    header: "이름",
    width: 60,
    renderer: {
      showTooltip: true,
      type: "icon",
      iconLocation: "left",
      iconCallback: (grid, cell) => grid.getValue(cell.index.itemIndex, "emrg_stat") && icEmrg,
    },
    styleCallback: (grid, cell) => grid.getValue(cell.index.itemIndex, "emrg_stat") && { styleName: "rg-emergency-pt" },
  },
  {
    name: "age_cd",
    fieldName: "age_cd",
    header: "성별/나이",
    width: 60,
  },
  {
    name: "rcpn_hm",
    fieldName: "rcpn_hm",
    header: "접수시간",
    width: 60,
    visible: false,
  },
  {
    name: "exmn_hope_hm",
    fieldName: "exmn_hope_hm",
    header: "예약",
    width: 60,
  },
  {
    name: "mdcr_user_nm",
    fieldName: "mdcr_user_nm",
    header: "진료의",
    width: 60,
  },
  {
    header: "상태",
    name: "prsc_prgr_stat_cd",
    fieldName: "prsc_prgr_stat_cd",
    lookupDisplay: true,
    editable: false,
    renderer: {
      type: "image",
    },
    width: 60,
  },
];

// 결과 현황 컬럼
export const testResultColumns = [
  {
    name: "pid",
    fieldName: "pid",
    header: "환자번호",
    renderer: { showTooltip: true },
    width: 20,
  },
  {
    name: "pt_nm",
    fieldName: "pt_nm",
    header: "이름",
    width: 20,
    renderer: {
      showTooltip: true,
      type: "icon",
      iconLocation: "left",
      iconCallback: (grid, cell) => grid.getValue(cell.index.itemIndex, "emrg_stat") && icEmrg,
    },
    styleCallback: (grid, cell) => grid.getValue(cell.index.itemIndex, "emrg_stat") && { styleName: "rg-emergency-pt" },
  },
  {
    name: "age_cd",
    fieldName: "age_cd",
    header: "성별/나이",
    width: 20,
  },
  {
    name: "prsc_nm",
    fieldName: "prsc_nm",
    header: "검사명",
    width: 20,
    styleName: "rg-left-column",
    renderer: { showTooltip: true },
  },
  {
    name: "cndt_dt",
    fieldName: "cndt_dt",
    header: "검사일자",
    width: 20,
    datetimeFormat: "yyyy-MM-dd",
    renderer: { showTooltip: true },
  },

  {
    name: "mdcr_user_nm",
    fieldName: "mdcr_user_nm",
    header: "진료의",
    renderer: { showTooltip: true },
    width: 20,
  },
  {
    name: "prsc_prgr_stat_cd",
    fieldName: "prsc_prgr_stat_cd",
    header: "상태",
    lookupDisplay: true,
    editable: false,
    renderer: {
      type: "image",
    },
    width: 20,
  },
  {
    name: "prsc_date",
    fieldName: "prsc_date",
    header: "처방일자",
    visible: false,
  },
  {
    name: "prsc_sqno",
    fieldName: "prsc_sqno",
    header: "처방일련번호",
    visible: false,
  },
  {
    name: "hope_exrm_cd",
    fieldName: "hope_exrm_cd",
    header: "검사실코드",
    visible: false,
  },
  {
    name: "dobr",
    fieldName: "dobr",
    header: "생년월일",
    visible: false,
  },
  {
    name: "mdcr_date",
    fieldName: "mdcr_date",
    header: "진료일자",
    visible: false,
  },
  { fieldName: "emrg_stat", name: "emrg_stat", visible: false }, // 응금환자
];

// 처방 목록 컬럼
export const prscInfoColumns = [
  {
    name: "prsc_cd",
    fieldName: "prsc_cd",
    header: "검사코드",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 20,
  },
  {
    name: "prsc_nm",
    fieldName: "prsc_nm",
    header: "검사명",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 90,
  },
  {
    name: "prsc_memo",
    fieldName: "prsc_memo",
    header: "처방메모",
    width: 15,
    renderer: {
      type: "image",
      imageCallback: (grid, cell) => cell.value && icMemoMYellow,
    },
  },
  {
    name: "prsc_dr_nm",
    header: "진료의(처방)",
    fieldName: "prsc_dr_nm",
    width: 20,
  },
  {
    name: "prsn_user_nm",
    header: "검사담당자",
    fieldName: "prsn_user_nm",
    width: 20,
    editable: false,
  },
  {
    name: "wrcn_wrtn_yn",
    fieldName: "wrcn_wrtn_yn",
    header: "동의여부",
    width: 20,
  },
  {
    name: "rcpn_dt",
    fieldName: "rcpn_dt",
    header: "접수일자",
    width: 20,
    visible: false,
    renderer: { showTooltip: true },
    contextVisibility: true,
  },
  {
    name: "rcpn_hm",
    fieldName: "rcpn_hm",
    header: "접수시간",
    width: 20,
  },
  {
    name: "cndt_dt",
    fieldName: "cndt_dt",
    header: "검사일자",
    width: 20,
    datetimeFormat: "yyyy-MM-dd",
    visible: false,
    renderer: { showTooltip: true },
    contextVisibility: true,
  },
  {
    name: "cndt_hm",
    fieldName: "cndt_hm",
    header: "검사시간",
    width: 20,
  },
  {
    name: "prsc_prgr_stat_cd",
    fieldName: "prsc_prgr_stat_cd",
    header: "상태",
    lookupDisplay: true,
    editable: false,
    renderer: {
      type: "image",
    },
    width: 20,
  },
];
