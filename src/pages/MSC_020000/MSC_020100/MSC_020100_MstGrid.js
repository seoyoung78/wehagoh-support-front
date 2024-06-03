import moment from "moment";
import { ValueType } from "realgrid";
import icEmrg from "assets/imgs/ic_emergency_small.png";

export const MSC020100MstFields = [
  {
    fieldName: "pid",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "pt_nm",
    dataType: ValueType.TEXT,
  },
  { fieldName: "nm_dscm_dvcd", dateType: ValueType.TEXT },
  {
    fieldName: "pt_dscm_nm",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) =>
      values[fields.indexOf("pt_nm")] + (values[fields.indexOf("nm_dscm_dvcd")] || ""),
  },
  {
    fieldName: "sex_age",
    dateType: ValueType.TEXT,
  },
  {
    fieldName: "rcpn_dt",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "mdcr_dr_user_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_prgr_stat_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "hope_exrm_dept_sqno",
    dataType: ValueType.UINT,
  },
  {
    fieldName: "rcpn_no",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "mdcr_dr_id",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_hope_date",
    dataType: ValueType.TEXT,
  },
  { fieldName: "dc_rqst_yn", dateType: ValueType.TEXT },
  { fieldName: "exmn_hope_dt", dateType: ValueType.TEXT }, //예약 시간, 예약인 항목만 있음.
  {
    fieldName: "exmn_hope_hm",
    dateType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) => {
      const exmnHopeDt = values[fields.indexOf("exmn_hope_dt")];
      return exmnHopeDt && moment(exmnHopeDt, "YYYY-MM-DD HH:mm:ss").format("HH:mm");
    },
  },
  {
    fieldName: "emrg_pt_yn",
    dateType: ValueType.TEXT,
  },
  {
    fieldName: "mdcr_dr_usr_sqno",
    dateType: ValueType.UINT,
  },
  {
    fieldName: "pt_use_yn",
    dataType: ValueType.TEXT,
  },
];

export const MSC020100MstColumns = [
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
    name: "exmn_hope_hm",
    fieldName: "exmn_hope_hm",
    header: "예약",
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
    fillWidth: 0,
  },
];
