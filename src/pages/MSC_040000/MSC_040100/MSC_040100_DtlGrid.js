import icMemoMYellow from "assets/imgs/ic_memo_m_yellow.png";
import { ValueType } from "realgrid";

export const dtlFields = [
  { fieldName: "prsc_cd", dataType: ValueType.TEXT },
  { fieldName: "prsc_nm", dataType: ValueType.TEXT },
  { fieldName: "prsc_memo", dataType: ValueType.TEXT },
  { fieldName: "prsc_dr_nm", dataType: ValueType.TEXT },
  { fieldName: "prsn_user_nm", dataType: ValueType.TEXT },
  { fieldName: "wrcn_wrtn_yn", dataType: ValueType.TEXT },
  { fieldName: "rcpn_dt", dataType: ValueType.TEXT }, // 접수일시
  { fieldName: "rcpn_hm", dataType: ValueType.TEXT },
  { fieldName: "cndt_dt", dataType: ValueType.DATETIME }, // 실시일시
  { fieldName: "cndt_hm", dataType: ValueType.TEXT },
  { fieldName: "prsc_prgr_stat_cd", dataType: ValueType.TEXT },
  { fieldName: "pid", dataType: ValueType.TEXT }, // 등록번호
  { fieldName: "prsc_sqno", dataType: ValueType.TEXT }, // 시퀀스넘버
  { fieldName: "hope_exrm_cd", dataType: ValueType.TEXT }, // 검사실
  { fieldName: "prsc_date", dataType: ValueType.TEXT }, // 처방일자
  { fieldName: "exmn_hope_date", dataType: ValueType.TEXT }, // 희망검사일자
  { fieldName: "rcpn_sqno", dataType: ValueType.TEXT }, // 접수일련번호
  { fieldName: "mdlt_dvcd", dataType: ValueType.TEXT }, // 장비유형
  { fieldName: "pacs_no", dataType: ValueType.TEXT }, // access number
  { fieldName: "pacs_cd", dataType: ValueType.TEXT }, // 접수된 pacs 업체 code
  { fieldName: "dc_rqst_yn", dataType: ValueType.TEXT }, // DC 요청 여부
  { fieldName: "prsc_dr_sqno", dataType: ValueType.TEXT },
];

export const dtlColumns = [
  {
    header: "검사코드",
    name: "prsc_cd",
    fieldName: "prsc_cd",
    width: "80",
    styleName: "rg-left-column",
    renderer: { showTooltip: true },
  },
  {
    header: "검사명",
    name: "prsc_nm",
    fieldName: "prsc_nm",
    width: "200",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    // styleCallback: (grid, cell) => ({
    //   styleName: `rg-left-column ${grid.getValue(cell.index.itemIndex, "dc_yn") === "Y" && "rg-cancel-text"}`,
    // }),
  },
  {
    header: "처방메모",
    name: "prsc_memo",
    fieldName: "prsc_memo",
    width: 40,
    renderer: {
      type: "icon",
      iconCallback: (grid, cell) => {
        if (cell.value) {
          return icMemoMYellow;
        }
      },
      iconLocation: "center",
      enterKey: true,
    },
  },
  {
    header: "진료의(처방)",
    name: "prsc_dr_nm",
    fieldName: "prsc_dr_nm",
    width: "50",
  },
  {
    header: "검사담당자",
    name: "prsn_user_nm",
    fieldName: "prsn_user_nm",
    width: "50",
  },
  {
    header: "동의여부",
    name: "wrcn_wrtn_yn",
    fieldName: "wrcn_wrtn_yn",
    width: "50",
  },
  {
    header: "접수일자",
    name: "rcpn_dt",
    fieldName: "rcpn_dt",
    width: "50",
    visible: false,
    renderer: { showTooltip: true },
    contextVisibility: true,
  },
  {
    header: "접수시간",
    name: "rcpn_hm",
    fieldName: "rcpn_hm",
    width: "50",
  },
  {
    header: "검사일자",
    name: "cndt_dt",
    fieldName: "cndt_dt",
    width: "50",
    datetimeFormat: "yyyy-MM-dd",
    visible: false,
    renderer: { showTooltip: true },
    contextVisibility: true,
  },
  {
    header: "검사시간",
    name: "cndt_hm",
    fieldName: "cndt_dt",
    width: "50",
    datetimeFormat: "HH:mm",
  },
  {
    header: "상태",
    name: "prsc_prgr_stat_cd",
    fieldName: "prsc_prgr_stat_cd",
    type: "list",
    lookupDisplay: true,
    width: "50",
    renderer: {
      type: "shape",
      shape: "ellipse",
      shapeHeight: 10,
      shapeWidth: 10,
    },
  },
];
