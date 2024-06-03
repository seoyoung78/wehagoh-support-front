import { CellButton, ValueType } from "realgrid";
import iconPdf from "assets/imgs/icon_pdf_red.svg";
import { calculateComp, getRfvlFullTxt, getRfvlTxt } from "pages/MSC_020000/utils/MSC_020000Utils";

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
    fieldName: "prsc_date",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rptg_dy",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_rslt_1",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_rslt_2",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rfvl_lwlm_valu",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rfvl_uplm_valu",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_rslt_unit_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_pich_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_labl_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rfvl_valu",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) =>
      getRfvlFullTxt(
        values[fields.indexOf("rfvl_lwlm_valu")],
        values[fields.indexOf("rfvl_lwlm_rang_type_cd")],
        values[fields.indexOf("rfvl_uplm_valu")],
        values[fields.indexOf("rfvl_uplm_rang_type_cd")],
        values[fields.indexOf("exmn_rslt_unit_nm")],
      ),
  },
  {
    fieldName: "pdf",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "comp_cd",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) =>
      calculateComp(
        values[fields.indexOf("exmn_rslt_1")],
        values[fields.indexOf("rfvl_lwlm_valu")],
        values[fields.indexOf("rfvl_uplm_valu")],
        values[fields.indexOf("rfvl_lwlm_rang_type_cd")],
        values[fields.indexOf("rfvl_uplm_rang_type_cd")],
      ),
  },
  {
    fieldName: "rfvl_lwlm_rang_type_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rfvl_uplm_rang_type_cd",
    dataType: ValueType.TEXT,
  },
];

export const columns = [
  {
    name: "exmn_cd",
    fieldName: "exmn_cd",
    header: "검사코드",
    width: 100,
    renderer: { type: "text", showTooltip: true },
    styleName: "rg-left-column",
  },
  {
    name: "prsc_nm", //prsc_nm
    fieldName: "prsc_nm",
    header: "검사명",
    width: 420,
    renderer: { type: "text", showTooltip: true },
    styleName: "rg-left-column",
  },
  {
    name: "prsc_date",
    fieldName: "prsc_date",
    header: "처방일자",
    width: 120,
    renderer: { type: "text", showTooltip: true },
  },
  {
    name: "rptg_dy",
    fieldName: "rptg_dy",
    header: "보고일자",
    width: 120,
    renderer: { type: "text", showTooltip: true },
  },
  {
    name: "exmn_rslt_1",
    fieldName: "exmn_rslt_1",
    header: "결과값",
    width: 100,
    button: CellButton.ACTION,
    buttonVisibleCallback: (grid, index) => grid.getValue(index.itemIndex, "exmn_rslt_2"),
    renderer: {
      type: "text",
      showTooltip: true,
    },
    styleCallback: (grid, cell) => {
      const rsltValu = grid.getValue(cell.index.itemIndex, "exmn_rslt_1");
      const compCd = grid.getValue(cell.index.itemIndex, "comp_cd");
      let style = "rg-left-column rsltvalu-col";
      if (!rsltValu || rsltValu.length < 1) style += " rsltvalu-col-txtonly";
      else if (compCd === "H") {
        style += " rsltvalu-col-high";
      } else if (compCd === "L") {
        style += " rsltvalu-col-low";
      }
      return style;
    },
  },
  {
    name: "rfvl_valu",
    fieldName: "rfvl_valu",
    header: "참고치/단위",
    width: 140,
    renderer: { type: "text", showTooltip: true },
    styleName: "rg-left-column",
  },
  {
    name: "exmn_pich_nm",
    fieldName: "exmn_pich_nm",
    header: "검사담당자",
    width: 100,
    renderer: { type: "text", showTooltip: true },
  },
  {
    name: "pdf",
    fieldName: "pdf",
    header: "pdf",
    width: 60,
    editable: false,
    renderer: {
      type: "icon",
      iconCallback: () => iconPdf,
      iconLocation: "center",
      enterKey: true,
    },
  },
];
