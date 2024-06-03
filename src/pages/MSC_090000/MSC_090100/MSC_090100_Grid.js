import trashcan from "assets/imgs/ic_trashcan_s_normal@2x.png";

const prscField = [
  { fieldName: "prsc_nm", dataType: "text" },
  { fieldName: "prsc_cd", dataType: "text" },
  { fieldName: "set_yn", dataType: "text" },
];
const prscColumns = [
  {
    name: "prsc_nm",
    fieldName: "prsc_nm",
    header: "처방명",
    renderer: {
      showTooltip: true, // 데이터 툴팁
    },
    styleName: "rg-left-column",
  },
  { name: "prsc_cd", fieldName: "prsc_cd", visible: false },
  { name: "set_yn", fieldName: "set_yn", visible: false },
];

const setField = [
  { fieldName: "exmn_cd", dataType: "text" },
  { fieldName: "exmn_nm", dataType: "text" },
  { fieldName: "ref", dataType: "text" },
  { fieldName: "delete", dataType: "text" },
  { fieldName: "use_yn", dataType: "text" },
  { fieldName: "sort_seq", dataType: "number" },
  { fieldName: "exmn_set_sqno", dataType: "number" },
];
const setColumns = [
  {
    name: "exmn_cd",
    fieldName: "exmn_cd",
    header: "처방코드",
    renderer: { showTooltip: true },
    width: 100,
    styleName: "rg-left-column",
    editable: false,
  },
  {
    name: "exmn_nm",
    fieldName: "exmn_nm",
    header: "처방명",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 600,
    editable: false,
  },
  {
    name: "ref",
    fieldName: "ref",
    width: 30,
    header: "참고치",
    renderer: {
      type: "icon",
      iconCallback: () =>
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' class='ico_svg'%3E%3Cpath d='M21.767,20.571l-4.625-4.625c2.988-3.647,2.453-9.025-1.194-12.013S6.921,1.48,3.933,5.127 C0.945,8.774,1.48,14.152,5.127,17.14c3.146,2.577,7.674,2.577,10.82,0l4.624,4.623c0.335,0.323,0.869,0.314,1.192-0.021 c0.316-0.327,0.316-0.845,0-1.171L21.767,20.571z M10.638,17.386c-3.725,0-6.745-3.019-6.745-6.744s3.02-6.744,6.745-6.744 s6.745,3.019,6.745,6.744c0,3.723-3.017,6.741-6.74,6.744H10.638z M14.015,11.487h-2.529v2.529c0,0.466-0.377,0.843-0.843,0.843 c-0.466,0-0.843-0.377-0.843-0.843v-2.529H7.271c-0.466,0-0.843-0.377-0.843-0.843s0.377-0.843,0.843-0.843H9.8V7.272 c0-0.466,0.377-0.843,0.843-0.843c0.466,0,0.843,0.377,0.843,0.843v2.529h2.529c0.466,0,0.843,0.377,0.843,0.843 S14.481,11.487,14.015,11.487z'%3E%3C/path%3E%3C/svg%3E",
      iconLocation: "center",
      enterKey: true,
      iconHeight: 15,
      iconWidth: 15,
    },
  },
  {
    name: "delete",
    fieldName: "delete",
    width: 30,
    header: "삭제",
    renderer: {
      type: "icon",
      iconCallback: () => trashcan,
      iconLocation: "center",
      enterKey: true,
      iconHeight: 15,
      iconWidth: 15,
    },
  },
  { name: "use_yn", fieldName: "use_yn", visible: false },
];

export { prscField, prscColumns, setField, setColumns };
