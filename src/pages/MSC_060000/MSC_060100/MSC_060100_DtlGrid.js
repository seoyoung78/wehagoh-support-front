import { ValueType, RowState } from "realgrid";
import icMemoMYellow from "assets/imgs/ic_memo_m_yellow.png";

export const dtlGridFields = [
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
    fieldName: "dc_rqst_yn",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "trtm_strt_dt",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "trtm_end_dt",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rcps_id",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rcps_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rcps_sign",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "mdtr_opnn",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "mdtr_memo",
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
    fieldName: "exmn_rslt_rptg_yn",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "mdtr_rslt_rptg_yn",
    dataType: ValueType.TEXT,
  },
];

const formatDateTimeStringToTime = dateTimeString => {
  if (!dateTimeString) return "";

  const dateTime = new Date(dateTimeString);
  const hours = dateTime.getHours().toString().padStart(2, "0");
  const minutes = dateTime.getMinutes().toString().padStart(2, "0");
  const seconds = dateTime.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export const dtlGridColumns = [
  {
    name: "prsc_cd",
    header: "처방코드",
    type: "text",
    alignment: "center",
    fieldName: "prsc_cd",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 20,
    editable: false,
  },
  {
    name: "prsc_nm",
    header: "처방명",
    type: "text",
    fieldName: "prsc_nm",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 100,
    editable: false,
  },
  {
    name: "prsc_memo",
    header: "처방메모",
    fieldName: "prsc_memo",
    width: 20,
    editable: false,
    renderer: {
      type: "image",
      imageCallback: (grid, cell) => cell.value && icMemoMYellow,
    },
  },
  {
    name: "trtm_strt_dt",
    header: "처치시작시간",
    type: "text",
    fieldName: "trtm_strt_dt",
    width: 30,
    editable: false,
    displayCallback: (grid, index, value) => formatDateTimeStringToTime(value),
  },
  {
    name: "trtm_end_dt",
    header: "처치종료시간",
    type: "text",
    fieldName: "trtm_end_dt",
    width: 30,
    editable: false,
    displayCallback: (grid, index, value) => formatDateTimeStringToTime(value),
  },
  {
    name: "prsc_dr_nm",
    header: "진료의(처방)",
    fieldName: "prsc_dr_nm",
    width: 30,
    editable: false,
  },
  {
    name: "rcps_nm",
    header: "시행자",
    fieldName: "rcps_nm",
    width: 30,
    editable: false,
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
    width: 20,
  },
];
