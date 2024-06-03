import { ValueType } from "realgrid";

export const MSC020200Fields = [
  {
    fieldName: "pid",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "pt_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "age_labl",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "sex_labl",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "sex_age",
    dateType: ValueType.TEXT,
  },
  {
    fieldName: "cndt_dy",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "mdcr_user_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_nm",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_no",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "ents_exmn_inst_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "trms_dy",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rply_dy",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "spcm_ents_prgr_stat_cd",
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rslt_sqno",
    dataType: ValueType.UINT,
  },
  {
    fieldName: "exmn_cd",
    dataType: ValueType.TEXT,
  },
];

export const MSC020200Columns = [
  {
    name: "pid",
    fieldName: "pid",
    header: "환자번호",
    width: 70,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    name: "pt_nm",
    fieldName: "pt_nm",
    header: "이름",
    width: 70,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
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
    width: 80,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    name: "mdcr_user_nm",
    fieldName: "mdcr_user_nm",
    header: "진료의",
    type: "text",
    width: 50,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    name: "prsc_nm",
    fieldName: "prsc_nm",
    header: "검사명",
    type: "text",
    width: 240,
    editable: false,
    styleName: "rg-left-column",
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    name: "spcm_nm",
    fieldName: "spcm_nm",
    header: "검체명",
    width: 80,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
    styleName: "rg-left-column",
  },
  {
    name: "spcm_no",
    fieldName: "spcm_no",
    header: "바코드 번호",
    width: 80,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    name: "ents_exmn_inst_cd",
    fieldName: "ents_exmn_inst_cd",
    header: "위탁기관",
    width: 120,
    lookupDisplay: true,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    name: "spcm_ents_prgr_stat_cd",
    fieldName: "spcm_ents_prgr_stat_cd",
    header: "상태",
    width: 70,
    lookupDisplay: true,
    editable: false,
  },
  {
    name: "trms_dy",
    fieldName: "trms_dy",
    header: "전송일자",
    width: 60,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
  {
    name: "rply_dy",
    fieldName: "rply_dy",
    header: "회신일자",
    width: 60,
    editable: false,
    renderer: {
      type: "text",
      showTooltip: true,
    },
  },
];
