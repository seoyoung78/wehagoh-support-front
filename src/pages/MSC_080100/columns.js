import { ValueType } from "realgrid";
import icEmrg from "assets/imgs/ic_emergency_small.png";

export const fields = [
  { fieldName: "pid", dataType: ValueType.NUMBER },
  { fieldName: "pt_nm", dataType: ValueType.TEXT },
  { fieldName: "age_cd", dataType: ValueType.TEXT },
  { fieldName: "dobr", dataType: ValueType.TEXT },
  { fieldName: "hope_exrm_nm", dataType: ValueType.TEXT },
  { fieldName: "prsc_cd", dataType: ValueType.TEXT },
  { fieldName: "prsc_nm", dataType: ValueType.TEXT },
  { fieldName: "mdcr_user_nm", dataType: ValueType.TEXT },
  { fieldName: "prsc_prgr_stat_cd", dataType: ValueType.TEXT },
  { fieldName: "emrg_stat", dataType: ValueType.BOOLEAN },
  { fieldName: "exrm_clsf_cd", dataType: ValueType.TEXT },
  { fieldName: "mdtr_yn", dataType: ValueType.TEXT },
  { fieldName: "rcpn_dt", dataType: ValueType.DATETIME },
  { fieldName: "cndt_dt", dataType: ValueType.DATETIME },
];

export const columns = [
  {
    name: "hope_exrm_nm",
    fieldName: "hope_exrm_nm",
    header: "검사실명",
    type: "text",
    width: 120,
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
  },
  {
    name: "rcpn_dt",
    header: "접수일자",
    fieldName: "rcpn_dt",
    width: 100,
    datetimeFormat: "yyyy-MM-dd",
  },
  {
    name: "rcpn_hm",
    header: "접수시간",
    fieldName: "rcpn_dt",
    width: 80,
    datetimeFormat: "HH:mm",
  },
  {
    name: "cndt_dt",
    fieldName: "cndt_dt",
    header: "검사일자",
    width: 100,
    datetimeFormat: "yyyy-MM-dd",
  },
  {
    name: "cndt_hm",
    header: "검사시간",
    fieldName: "cndt_dt",
    width: 80,
    datetimeFormat: "HH:mm",
  },
  {
    name: "pid",
    fieldName: "pid",
    header: "환자번호",
    type: "text",
    width: 100,
    numberFormat: "#",
  },
  {
    name: "pt_nm",
    fieldName: "pt_nm",
    header: "이름",
    type: "text",
    width: 100,
    renderer: {
      type: "icon",
      iconLocation: "left",
      iconCallback(grid, cell) {
        return grid.getValue(cell.index.itemIndex, "emrg_stat") && icEmrg;
      },
      showTooltip: true,
    },
    styleCallback(grid, cell) {
      return grid.getValue(cell.index.itemIndex, "emrg_stat") && { styleName: "rg-emergency-pt" };
    },
  },
  {
    name: "age_cd",
    fieldName: "age_cd",
    header: "성별/나이",
    type: "text",
    width: 100,
  },
  {
    name: "dobr",
    fieldName: "dobr",
    header: "생년월일",
    width: 100,
    textFormat: "([0-9]{4})([0-9]{2})([0-9]{2})$;$1-$2-$3",
  },
  {
    name: "prsc_cd",
    fieldName: "prsc_cd",
    header: "검사코드",
    styleName: "rg-left-column",
    type: "text",
    width: 100,
    renderer: { showTooltip: true },
  },
  {
    name: "prsc_nm",
    fieldName: "prsc_nm",
    header: "검사명",
    // styleCallback: (grid, cell) => ({
    //   styleName: `rg-left-column ${grid.getValue(cell.index.itemIndex, "dc_yn") === "Y" && "rg-cancel-text"}`,
    // }),
    styleName: "rg-left-column",
    type: "text",
    width: 300,
    renderer: { showTooltip: true },
  },
  {
    name: "mdcr_user_nm",
    fieldName: "mdcr_user_nm",
    header: "진료의",
    type: "text",
    width: 100,
  },
  {
    name: "prsc_prgr_stat_cd",
    fieldName: "prsc_prgr_stat_cd",
    header: "상태코드명",
    width: 80,
    renderer: { type: "shape", shape: "ellipse" },
    lookupDisplay: true,
  },
];

export const rows = [];
