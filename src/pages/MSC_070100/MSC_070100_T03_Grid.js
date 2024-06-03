import { ValueType } from "realgrid";
import iconPdf from "assets/imgs/icon_pdf_red.svg";

export const fields = [
  {
    fieldName: "exmn_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_rslt_2",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_date",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rptg_dy",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_pich_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "pdf",
    dataType: ValueType.TEXT,
  },
  { fieldName: "pacs_no", dataType: "text" },
  { fieldName: "pacs_co_cd", dataType: "text" },
];

export const columns = [
  {
    name: "exmn_cd",
    fieldName: "exmn_cd",
    header: "검사코드",
    width: 20,
    styleName: "rg-left-column",
  },
  {
    name: "prsc_nm",
    fieldName: "prsc_nm",
    header: "검사명",
    width: 50,
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
  },
  {
    name: "exmn_rslt_2",
    fieldName: "exmn_rslt_2",
    header: "판독소견",
    width: 75,
    styleName: "rg-left-column",
  },
  {
    name: "prsc_date",
    fieldName: "prsc_date",
    header: "처방일자",
    width: 15,
    renderer: { showTooltip: true },
  },
  {
    name: "rptg_dy",
    fieldName: "rptg_dy",
    header: "보고일자",
    width: 15,
    renderer: { showTooltip: true },
  },
  {
    name: "exmn_pich_nm",
    fieldName: "exmn_pich_nm",
    header: "검사담당자",
    width: 15,
    renderer: { showTooltip: true },
  },
  {
    name: "pdf",
    fieldName: "pdf",
    header: "pdf",
    width: 10,
    editable: false,
    onlyIcon: false,
    renderer: {
      type: "icon",
      iconCallback: () => iconPdf,
      iconLocation: "center",
      enterKey: true,
    },
  },
  { name: "pacs_no", fieldName: "pacs_no", visible: false },
  { name: "pacs_co_cd", fieldName: "pacs_co_cd", visible: false },
];
