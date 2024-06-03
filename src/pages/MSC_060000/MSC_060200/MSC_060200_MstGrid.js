export const mstFields = [
  { fieldName: "pid", dataType: "text" },
  { fieldName: "pt_nm", dataType: "text" },
  { fieldName: "age_cd", dataType: "text" },
  { fieldName: "mdtr_hope_date", dataType: "text" },
  { fieldName: "rcps_nm", dataType: "text" },
];

export const mstColumns = [
  { name: "pid", fieldName: "pid", header: "환자번호", width: 60 },
  { name: "pt_nm", fieldName: "pt_nm", header: "이름", width: 40 },
  { name: "age_cd", fieldName: "age_cd", header: "성별/나이", width: 40 },
  { name: "mdtr_hope_date", fieldName: "mdtr_hope_date", header: "최근 치료일자", width: 60 },
  { name: "rcps_nm", fieldName: "rcps_nm", header: "시행자", width: 60 },
];
