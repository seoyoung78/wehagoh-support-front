import { ValueType } from "realgrid";
import icEmrg from "assets/imgs/ic_emergency_small.png";

export const MSC020300MstFields = [
  {
    fieldName: "pid",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "pt_nm",
    dataType: ValueType.TEXT,
  },
  { fieldName: "nm_dscm_dvcd", dataType: ValueType.TEXT },
  {
    fieldName: "pt_dscm_nm",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) =>
      values[fields.indexOf("pt_nm")] + (values[fields.indexOf("nm_dscm_dvcd")] || ""),
  },
  {
    fieldName: "sex_age",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "mdcr_dr_user_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rcpn_no",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_prgr_stat_cd",
    dataType: ValueType.TEXT,
  },
  { fieldName: "cndt_dy", dataType: ValueType.TEXT },
  { fieldName: "hope_exrm_dept_sqno", dataType: ValueType.UINT },
  { fieldName: "mdcr_dr_sign_lctn", dataType: ValueType.TEXT },
  { fieldName: "mdcr_date", dataType: ValueType.TEXT },
  {
    fieldName: "emrg_pt_yn",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_no_set",
    dataType: ValueType.TEXT,
  },
];
export const MSC020300MstColumns = [
  {
    name: "pid",
    fieldName: "pid",
    header: "환자번호",
    editable: false,
    width: 50,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    name: "pt_dscm_nm",
    fieldName: "pt_dscm_nm",
    header: "이름",
    editable: false,
    width: 60,
    renderer: {
      type: "icon",
      iconLocation: "left",
      iconCallback: (grid, cell) => grid.getValue(cell.index.itemIndex, "emrg_pt_yn") && icEmrg,
    },
    styleCallback: (grid, cell) => grid.getValue(cell.index.itemIndex, "emrg_pt_yn") && "rg-emergency-pt",
  },
  {
    name: "sex_age",
    fieldName: "sex_age",
    header: "성별/나이",
    width: 60,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    name: "cndt_dy",
    fieldName: "cndt_dy",
    header: "검사일자",
    width: 60,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    name: "mdcr_dr_user_nm",
    fieldName: "mdcr_dr_user_nm",
    header: "진료의",
    width: 60,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    header: "상태",
    name: "prsc_prgr_stat_cd",
    fieldName: "prsc_prgr_stat_cd",
    editable: false,
    width: 60,
  },
];
