import { ValueType } from "realgrid";
import icEmrg from "assets/imgs/ic_emergency_small.png";

// 필드 생성
export const fields = [
  {
    fieldName: "pid", // 등록번호
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "pt_nm", // 이름
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "age_cd", // 나이/성별
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "rcpn_dt",
    dataType: ValueType.DATETIME,
  },
  {
    fieldName: "mdcr_dr_nm", // 진료의
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "prsc_prgr_stat_cd", // 상태
    dataType: ValueType.TEXT,
  },
  {
    fieldName: "emrg_stat",
    dataType: ValueType.BOOLEAN,
  },
  { fieldName: "exmn_hope_date", dateType: ValueType.TEXT },
  { fieldName: "cndt_dt", dateType: ValueType.TEXT },
];

// 컬럼 생성
export const columns = [
  {
    name: "pid",
    header: "환자번호",
    fieldName: "pid",
    width: 100,
    visible: false,
  },
  {
    name: "pt_nm",
    header: "이름",
    fieldName: "pt_nm",
    width: 100,
    renderer: {
      type: "icon",
      iconLocation: "left",
      iconCallback(grid, cell) {
        return grid.getValue(cell.index.itemIndex, "emrg_stat") && icEmrg;
      },
      showTooltip: true,
    },
    styleCallback(grid, cell) {
      return grid.getValue(cell.index.itemIndex, "emrg_stat") && { styleName: "rg-emergency-pt" };
    },
  },
  {
    name: "age_cd",
    header: "성별/나이",
    fieldName: "age_cd",
    width: 100,
  },
  {
    name: "rcpn_dt",
    header: "접수일자",
    fieldName: "rcpn_dt",
    width: 100,
    datetimeFormat: "yyyy-MM-dd",
    visible: false,
    renderer: { showTooltip: true },
    contextVisibility: true,
  },
  {
    name: "rcpn_hm",
    header: "접수시간",
    fieldName: "rcpn_dt",
    width: 100,
    datetimeFormat: "HH:mm",
  },
  {
    name: "mdcr_dr_nm",
    header: "진료의",
    fieldName: "mdcr_dr_nm",
    width: 100,
  },
  {
    name: "prsc_prgr_stat_cd",
    header: "상태",
    fieldName: "prsc_prgr_stat_cd",
    type: "list",
    lookupDisplay: true,
  },
];
