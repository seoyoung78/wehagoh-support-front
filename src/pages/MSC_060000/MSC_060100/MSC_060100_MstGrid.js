import { ValueType } from "realgrid";
import icEmrg from "assets/imgs/ic_emergency_small.png";

export const mstGridFields = [
  {
    fieldName: "pid",
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
    fieldName: "hope_exrm_cd",
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
    fieldName: "mdtr_hope_date",
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
    fieldName: "basc_addr",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "dobr",
    dataType: ValueType.TEXT,
  },
  { fieldName: "mdcr_sign", dataType: ValueType.TEXT },
  { fieldName: "emrg_stat", dataType: ValueType.BOOLEAN }, // 응금환자
  { fieldName: "mdtr_rslt_rptg_yn", dataType: ValueType.TEXT }, // 치료 결과 보고 여부
];

export const mstGridColumns = [
  {
    name: "pid",
    fieldName: "pid",
    header: "환자번호",
    type: "text",
    renderer: { showTooltip: true },
    width: 50,
  },
  {
    name: "pt_nm",
    fieldName: "pt_nm",
    header: "이름",
    width: 60,
    type: "text",
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
    type: "text",
    alignment: "center",
  },
  {
    name: "rcpn_hm",
    fieldName: "rcpn_hm",
    header: "접수시간",
    width: 60,
    type: "text",
    alignment: "center",
    style: { textWrap: "ellipse" },
  },
  {
    name: "mdcr_user_nm",
    fieldName: "mdcr_user_nm",
    header: "진료의",
    width: 60,
    type: "text",
    alignment: "center",
    renderer: { showTooltip: true },
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
