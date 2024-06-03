import { IconLocation, ValueType } from "realgrid";
import getCtnrTextImg from "services/utils/getCtnrTextImg";
import icReferralOn from "assets/imgs/ic_referral_on.png";
import icMemoMYellow from "assets/imgs/ic_memo_m_yellow.png";
import icNoteMOver from "assets/imgs/ic_note_m_over.png";
import moment from "moment";

export const MSC020100DtlFields = [
  {
    fieldName: "pid",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_date",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_sqno",
    dataType: ValueType.UINT,
  },
  {
    fieldName: "prsc_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_dr_id",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_prgr_stat_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "entd_exmn_yn",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_memo",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_no",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_pich_nm",
    dataType: ValueType.TEXT,
  },
  { fieldName: "dc_rqst_yn", dateType: ValueType.TEXT },
  {
    fieldName: "rcpn_dt",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "trms_stat_dvsn",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "cndt_dt",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "exmn_hope_dt",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_nots",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_labl_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "ctnr_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_dr_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "ctnr_labl_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "ctnr_colr",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_need_vol",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "fix_vol_dvsn_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_dosg_unit_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_vol",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) => {
      let unit = values[fields.indexOf("spcm_dosg_unit_nm")];
      if (unit == null) unit = "";
      let postText = values[fields.indexOf("fix_vol_dvsn_nm")];
      if (postText == null) postText = "";
      let vol = values[fields.indexOf("spcm_need_vol")];
      if (vol == null) vol = "";
      return vol + unit + postText;
    },
  },
  {
    fieldName: "rcpn_hm_exmn_hope_hm",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) => {
      const exmnHopeDt = values[fields.indexOf("exmn_hope_dt")];
      const rcpnDt = values[fields.indexOf("rcpn_dt")];
      return rcpnDt
        ? moment(rcpnDt, "YYYY-MM-DD HH:mm:ss.SSS").format("HH:mm")
        : exmnHopeDt && moment(exmnHopeDt, "YYYY-MM-DD HH:mm:ss.SSS").format("예약 HH:mm");
    },
  },
  {
    fieldName: "rcpn_dy_exmn_hope_dy",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) => {
      const exmnHopeDt = values[fields.indexOf("exmn_hope_dt")];
      const rcpnDt = values[fields.indexOf("rcpn_dt")];
      return rcpnDt
        ? moment(rcpnDt, "YYYY-MM-DD HH:mm:ss.SSS").format("YYYY-MM-DD")
        : exmnHopeDt && moment(exmnHopeDt, "YYYY-MM-DD HH:mm:ss.SSS").format("예약 YYYY-MM-DD");
    },
  },
  {
    fieldName: "cndt_hm",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _0rowId, _fieldName, fields, values) => {
      const cndtDt = values[fields.indexOf("cndt_dt")];
      return cndtDt && moment(cndtDt, "YYYY-MM-DD HH:mm:ss.SSS").format("HH:mm");
    },
  },
  {
    fieldName: "cndt_dy",
    dataType: ValueType.TEXT,
    valueCallback: (_ds, _rowId, _fieldName, fields, values) => {
      const cndtDt = values[fields.indexOf("cndt_dt")];
      return cndtDt && moment(cndtDt, "YYYY-MM-DD HH:mm:ss.SSS").format("YYYY-MM-DD");
    },
  },
  {
    fieldName: "prsc_dr_usr_sqno",
    dataType: ValueType.TEXT,
  },
];
export const MSC020100DtlColumns = [
  {
    name: "prsc_cd",
    header: "검사코드",
    fieldName: "prsc_cd",
    width: 60,
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
    editable: false,
    styleName: "rg-left-column",
  },
  {
    name: "prsc_nm",
    header: "검사명",
    fieldName: "prsc_nm",
    width: 160,
    renderer: {
      type: "text",
      showTooltip: true,
    },
    editable: false,
    styleName: "rg-left-column",
  },
  {
    name: "prsc_memo",
    header: "처방메모",
    fieldName: "prsc_memo",
    width: 60,
    editable: false,
    renderer: {
      type: "image",
      imageCallback: (grid, cell) => {
        if (cell.value) {
          return icMemoMYellow;
        }
      },
    },
  },
  {
    name: "prsc_nots",
    header: "검사메모",
    fieldName: "prsc_nots",
    width: 60,
    renderer: {
      type: "image",
      imageCallback: (grid, cell) => {
        if (cell.value) {
          return icNoteMOver;
        }
      },
    },
    editable: false,
  },
  {
    name: "spcm_cd",
    header: "검체코드",
    fieldName: "spcm_cd",
    width: 60,
    renderer: {
      type: "text",
      showTooltip: true,
    },
    editable: false,
    styleName: "rg-left-column",
  },
  {
    name: "spcm_labl_nm",
    header: "검체명",
    fieldName: "spcm_labl_nm",
    width: 70,
    renderer: {
      type: "text",
      showTooltip: true,
    },
    editable: false,
    styleName: "rg-left-column",
  },
  {
    name: "ctnr_labl_nm",
    header: "용기",
    fieldName: "ctnr_labl_nm",
    width: 80,
    editable: false,
    renderer: {
      type: "image",
      imageCallback: (grid, dataCell) => {
        const color = grid.getDataSource().getValue(dataCell.index.dataRow, "ctnr_colr");
        if (dataCell.value != null && dataCell.value.length > 0) {
          return getCtnrTextImg(
            dataCell.value,
            color != null && color.length > 0 ? color : "#000000",
            dataCell.dataColumn.displayWidth,
          );
        }
        return false;
      },
    },
  },
  {
    name: "spcm_vol",
    header: "검체용량",
    fieldName: "spcm_vol",
    width: 60,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
    styleName: "rg-left-column",
  },
  {
    name: "prsc_dr_nm",
    header: "진료의(처방)",
    fieldName: "prsc_dr_nm",
    width: 80,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    name: "exmn_pich_nm",
    header: "검사담당자",
    fieldName: "exmn_pich_nm",
    width: 70,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    name: "rcpn_dy_exmn_hope_dy",
    header: "접수일자",
    fieldName: "rcpn_dy_exmn_hope_dy",
    editable: false,
    visible: false,
    width: 60,
    fillWidth: 0,
  },
  {
    name: "rcpn_hm_exmn_hope_hm",
    header: "접수시간",
    fieldName: "rcpn_hm_exmn_hope_hm",
    editable: false,
    width: 60,
    fillWidth: 0,
  },
  {
    name: "cndt_dy",
    header: "검사일자",
    fieldName: "cndt_dy",
    editable: false,
    visible: false,
    width: 60,
    fillWidth: 0,
  },
  {
    name: "cndt_hm",
    header: "검사시간",
    fieldName: "cndt_hm",
    editable: false,
    width: 60,
    fillWidth: 0,
  },
  {
    name: "prsc_prgr_stat_cd",
    header: "상태",
    fieldName: "prsc_prgr_stat_cd",
    editable: false,
    width: 60,
    fillWidth: 0,
  },
];
