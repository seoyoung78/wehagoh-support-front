import { ValueType } from "realgrid";
import icEmrg from "assets/imgs/ic_emergency_small.png";

// #region mstFields
export const fields = [
  { fieldName: "pid", dataType: ValueType.TEXT },
  { fieldName: "pt_nm", dataType: ValueType.TEXT },
  { fieldName: "age_cd", dataType: ValueType.TEXT },
  { fieldName: "prsc_nm", dataType: ValueType.TEXT },
  { fieldName: "cndt_dt", dataType: ValueType.DATETIME },
  { fieldName: "mdcr_user_nm", dataType: ValueType.TEXT },
  { fieldName: "prsc_prgr_stat_cd", dataType: ValueType.TEXT },
  { fieldName: "mdcr_date", dataType: ValueType.TEXT }, // 내원일자
  { fieldName: "prsc_date", dataType: ValueType.TEXT }, // 처방일자
  { fieldName: "hope_exrm_cd", dataType: ValueType.TEXT }, // 검사실
  { fieldName: "rcpn_sqno", dataType: ValueType.TEXT }, // 처방요청에 필요
  { fieldName: "mdcr_dr_id", dataType: ValueType.TEXT }, // dc/처방 요청으로 필요
  { fieldName: "prsc_sqno", dataType: ValueType.TEXT },
  { fieldName: "prsc_cd", dataType: ValueType.TEXT },
  { fieldName: "emrg_stat", dataType: ValueType.BOOLEAN }, // 응금환자
  { fieldName: "exmn_hope_date", dataType: ValueType.TEXT },
  { fieldName: "iptn_dt", dataType: ValueType.DATETIME },
  { fieldName: "dobr", dataType: ValueType.TEXT },
  { fieldName: "prsc_dr_sqno", dataType: ValueType.TEXT },
];
// #endregion

// #region
export const columns = [
  {
    header: "환자번호",
    name: "pid",
    fieldName: "pid",
    width: 20,
    renderer: { showTooltip: true },
  },
  {
    header: "이름",
    name: "pt_nm",
    fieldName: "pt_nm",
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
    header: "성별/나이",
    name: "age_cd",
    fieldName: "age_cd",
    width: 20,
  },
  {
    header: "검사명",
    name: "prsc_nm",
    fieldName: "prsc_nm",
    width: 20,
    styleName: "rg-left-column",
    renderer: { showTooltip: true },
  },
  {
    header: "검사일자",
    name: "cndt_dt",
    fieldName: "cndt_dt",
    width: 20,
    renderer: { showTooltip: true },
    datetimeFormat: "yyyy-MM-dd",
  },
  {
    header: "진료의",
    name: "mdcr_user_nm",
    fieldName: "mdcr_user_nm",
    width: 20,
    renderer: { showTooltip: true },
  },
  {
    header: "상태",
    name: "prsc_prgr_stat_cd",
    fieldName: "prsc_prgr_stat_cd",
    lookupDisplay: true,
    styles: {
      textAlignment: "center",
    },
    width: 20,
    renderer: {
      type: "shape",
      shape: "ellipse",
      shapeHeight: 10,
      shapeWidth: 10,
    },
  },
];
