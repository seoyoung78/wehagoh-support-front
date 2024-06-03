export const dtlFields = [
  { fieldName: "mdtr_hope_date", dataType: "text" },
  { fieldName: "prsc_cd", dataType: "text" },
  { fieldName: "prsc_nm", dataType: "text" },
  { fieldName: "trtm_dt", dataType: "text" },
  { fieldName: "prsc_dr_nm", dataType: "text" },
  { fieldName: "rcps_nm", dataType: "text" },
  { fieldName: "mdtr_opnn", dataType: "text" },
];

export const dtlColumns = [
  { name: "mdtr_hope_date", fieldName: "mdtr_hope_date", header: "치료일자", width: 40 },
  {
    name: "prsc_cd",
    fieldName: "prsc_cd",
    header: "처방코드",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 30,
  },
  {
    name: "prsc_nm",
    fieldName: "prsc_nm",
    header: "처방명",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 50,
  },
  { name: "trtm_dt", fieldName: "trtm_dt", header: "치료시간", width: 60 },
  { name: "prsc_dr_nm", fieldName: "prsc_dr_nm", header: "진료의(처방)", width: 30 },
  { name: "rcps_nm", fieldName: "rcps_nm", header: "시행자", width: 30 },
  {
    name: "mdtr_opnn",
    fieldName: "mdtr_opnn",
    header: "물리치료 소견",
    styleName: "rg-left-column",
    width: 100,
  },
];
