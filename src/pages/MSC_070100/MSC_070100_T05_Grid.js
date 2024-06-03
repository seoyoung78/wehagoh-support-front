import { getRfvlFullTxt } from "pages/MSC_020000/utils/MSC_020000Utils";
import { ValueType } from "realgrid";

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
    fieldName: "rslt_type_dvsn",
    dataType: ValueType.TEXT,
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
    width: 78,
    styleName: "rg-left-column",
  },
  {
    name: "prsc_nm",
    fieldName: "prsc_nm",
    header: "검사명",
    width: 260,
    renderer: {
      type: "text",
      renderer: { type: "text", showTooltip: true },
    },
    styleName: "rg-left-column",
  },
  {
    name: "rfvl_valu",
    fieldName: "rfvl_valu",
    header: "참고치 / 단위",
    width: 120,
    renderer: { type: "text", showTooltip: true },
    styleName: "rg-left-column",
  },
];
