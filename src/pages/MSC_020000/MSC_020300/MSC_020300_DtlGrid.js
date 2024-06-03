import { CellButton, IconLocation, ValueType } from "realgrid";
import icReferralOn from "assets/imgs/ic_referral_on.png";
import icArrowUpRed from "assets/imgs/ic_arrow_up_red.png";
import icArrowDownBlue from "assets/imgs/ic_arrow_down_blue.png";
import { calculateComp, getRfvlTxt } from "../utils/MSC_020000Utils";
import moment from "moment";

export const MSC020300DtlFields = [
  {
    fieldName: "prsc_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rslt_type_dvsn",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_labl_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "comp_cd",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) => {
      if (values[fields.indexOf("rslt_prgr_stat_cd")] <= "G") return null;
      return calculateComp(
        values[fields.indexOf("exmn_rslt_valu")],
        values[fields.indexOf("rfvl_lwlm_valu")],
        values[fields.indexOf("rfvl_uplm_valu")],
        values[fields.indexOf("rfvl_lwlm_rang_type_cd")],
        values[fields.indexOf("rfvl_uplm_rang_type_cd")],
      );
    },
  },
  {
    fieldName: "spcm_no",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "pid",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_date",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_rslt_valu",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "txt_rslt_valu",
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
    fieldName: "rslt_unit_dvsn",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_ents_prgr_stat_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "entd_exmn_yn",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prgr_stat_cmcd",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) => {
      const rsltPrgrCd = values[fields.indexOf("rslt_prgr_stat_cd")];
      const entsPrgrCd = values[fields.indexOf("spcm_ents_prgr_stat_cd")];
      switch (entsPrgrCd) {
        case "F":
        case "G":
        case "H":
          return rsltPrgrCd === "N" ? rsltPrgrCd : entsPrgrCd;
        default:
          return rsltPrgrCd;
      }
    },
  },
  {
    fieldName: "cmcd_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rptg_dy",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rslt_prgr_stat_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_pich_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rslt_rgst_dt",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rslt_rgst_dy",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) => {
      const rsltRgstDt = values[fields.indexOf("rslt_rgst_dt")];
      return values[fields.indexOf("rslt_prgr_stat_cd")] >= "H" && rsltRgstDt
        ? moment(rsltRgstDt, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD")
        : null;
    },
  },
  {
    fieldName: "inpr_nodg",
    dataType: ValueType.NUMBER,
  },
  {
    fieldName: "dcpr_nodg",
    dataType: ValueType.NUMBER,
  },
  {
    fieldName: "nodg",
    dataType: ValueType.NUMBER,
  },
  {
    fieldName: "rfvl_lwlm_rang_type_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rfvl_uplm_rang_type_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rfvl_uplm_valu_nm",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) =>
      getRfvlTxt(values[fields.indexOf("rfvl_uplm_valu")], values[fields.indexOf("rfvl_uplm_rang_type_cd")]),
  },
  {
    fieldName: "rfvl_lwlm_valu_nm",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) =>
      getRfvlTxt(values[fields.indexOf("rfvl_lwlm_valu")], values[fields.indexOf("rfvl_lwlm_rang_type_cd")]),
  },
  {
    fieldName: "exmn_item_rmrk_cnts",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "ents_rmrk_cnts",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) =>
      values[fields.indexOf("spcm_ents_prgr_stat_cd")] == null ? null : values[fields.indexOf("exmn_item_rmrk_cnts")],
  },
];
export const MSC020300DtlColumns = [
  {
    name: "exmn_cd",
    fieldName: "exmn_cd",
    header: "검사코드",
    width: 70,
    editable: false,
    renderer: {
      type: "icon",
      iconLocation: IconLocation.LEFT,
      iconCallback: (grid, cell) => {
        if (grid.getValue(cell.index.itemIndex, "entd_exmn_yn") === "Y") {
          return icReferralOn;
        }
      },
      showTooltip: true,
    },
    styleName: "rg-left-column",
  },
  {
    name: "prsc_nm",
    fieldName: "prsc_nm",
    header: "검사명",
    width: 140,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
    styleName: "rg-left-column",
  },
  {
    name: "spcm_labl_nm",
    fieldName: "spcm_labl_nm",
    header: "검체명",
    width: 70,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
    styleName: "rg-left-column",
  },
  {
    name: "comp_cd",
    fieldName: "comp_cd",
    header: "판정",
    width: 50,
    editable: false,
    renderer: {
      type: "image",
      imageMap: {
        L: icArrowDownBlue,
        H: icArrowUpRed,
      },
    },
  },
  {
    name: "exmn_rslt_valu",
    fieldName: "exmn_rslt_valu",
    header: "결과",
    width: 140,
    button: CellButton.ACTION,
    buttonVisibleCallback: (grid, index) => grid.getValue(index.itemIndex, "txt_rslt_valu"),
    renderer: {
      type: "text",
      showTooltip: true,
    },
    styleCallback: (grid, cell) => {
      const stateCd = grid.getValue(cell.index.itemIndex, "prgr_stat_cmcd");
      const rsltValu = grid.getValue(cell.index.itemIndex, "exmn_rslt_valu");
      return {
        editable: stateCd !== "F" && stateCd !== "G" && stateCd !== "N",
        styleName:
          rsltValu && rsltValu.length > 0
            ? "rg-left-column rsltvalu-col"
            : "rg-left-column rsltvalu-col rsltvalu-col-txtonly",
      };
    },
  },
  {
    name: "exmn_item_rmrk_cnts",
    fieldName: "exmn_item_rmrk_cnts",
    header: "비고",
    width: 140,
    button: CellButton.ACTION,
    buttonVisibleCallback: (grid, index) => grid.getValue(index.itemIndex, "ents_rmrk_cnts")?.length > 0,
    renderer: {
      type: "text",
      showTooltip: true,
    },
    styleCallback: (grid, cell) => {
      const stateCd = grid.getValue(cell.index.itemIndex, "prgr_stat_cmcd");
      return {
        editable: stateCd === "M" || stateCd === "E",
        styleName:
          grid.getValue(cell.index.itemIndex, "spcm_ents_prgr_stat_cd") == null
            ? "rg-left-column rsltvalu-col"
            : "rg-left-column rsltvalu-col rsltvalu-col-txtonly",
      };
    },
    displayCallback: (grid, index, value) =>
      grid.getValue(index.itemIndex, "spcm_ents_prgr_stat_cd") == null ? value : null,
  },
  {
    name: "rfvl_lwlm_valu_nm",
    fieldName: "rfvl_lwlm_valu_nm",
    header: "하한값",
    width: 60,
    renderer: {
      type: "text",
      showTooltip: true,
    },
    editable: false,
    styleName: "rg-left-column",
  },
  {
    name: "rfvl_uplm_valu_nm",
    fieldName: "rfvl_uplm_valu_nm",
    header: "상한값",
    width: 60,
    renderer: {
      type: "text",
      showTooltip: true,
    },
    editable: false,
    styleName: "rg-left-column",
  },
  {
    name: "rslt_unit_dvsn",
    fieldName: "rslt_unit_dvsn",
    header: "단위",
    width: 60,
    renderer: {
      type: "text",
      showTooltip: true,
    },
    editable: false,
    styleName: "rg-left-column",
  },
  {
    name: "rslt_rgst_dy",
    fieldName: "rslt_rgst_dy",
    header: "판독일자",
    width: 80,
    editable: false,
  },
  {
    name: "prgr_stat_cmcd",
    fieldName: "prgr_stat_cmcd",
    header: "상태",
    width: 70,
    editable: false,
  },
];
