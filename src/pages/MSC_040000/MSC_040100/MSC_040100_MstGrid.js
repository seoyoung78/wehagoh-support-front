import { ValueType } from "realgrid";
import icEmrg from "assets/imgs/ic_emergency_small.png";

// #region mstFields
export const mstFields = [
  { fieldName: "pid", dataType: ValueType.TEXT },
  { fieldName: "pt_nm", dataType: ValueType.TEXT },
  { fieldName: "age_cd", dataType: ValueType.TEXT },
  { fieldName: "exmn_hope_hm", dataType: ValueType.TEXT },
  { fieldName: "mdcr_user_nm", dataType: ValueType.TEXT },
  { fieldName: "prsc_prgr_stat_cd", dataType: ValueType.TEXT },
  { fieldName: "mdcr_date", dataType: ValueType.TEXT }, // 내원일자
  { fieldName: "prsc_date", dataType: ValueType.TEXT }, // 처방일자
  { fieldName: "exmn_hope_date", dataType: ValueType.TEXT }, // 희망검사일자
  { fieldName: "hope_exrm_cd", dataType: ValueType.TEXT }, // 검사실
  { fieldName: "rcpn_sqno", dataType: ValueType.TEXT }, // 처방요청에 필요
  { fieldName: "dc_rqst_yn", dataType: ValueType.TEXT }, // dc/처방 요청으로 필요
  { fieldName: "emrg_stat", dataType: ValueType.BOOLEAN }, // 응금환자
];
// #endregion

// #region
export const mstColumns = [
  {
    header: "환자번호",
    name: "pid",
    fieldName: "pid",
    width: 50,
    renderer: { showTooltip: true },
  },
  {
    header: "이름",
    name: "pt_nm",
    fieldName: "pt_nm",
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
    header: "성별/나이",
    name: "age_cd",
    fieldName: "age_cd",
    width: 60,
  },
  {
    header: "예약",
    name: "exmn_hope_hm",
    fieldName: "exmn_hope_hm",
    width: 60,
  },
  {
    header: "진료의",
    name: "mdcr_user_nm",
    fieldName: "mdcr_user_nm",
    width: 60,
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
    width: 60,
    renderer: {
      type: "shape",
      shape: "ellipse",
      shapeHeight: 10,
      shapeWidth: 10,
    },
  },
];
