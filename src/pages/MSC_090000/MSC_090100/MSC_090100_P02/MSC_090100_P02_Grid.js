import { RowState, ValueType } from "realgrid";
import newIcon from "assets/imgs/ic_new.png";

export const fields = [
  { fieldName: "exmn_rslt_uncd", dataType: ValueType.TEXT },
  { fieldName: "unit_rmrk", dataType: ValueType.TEXT },
  { fieldName: "strt_date", dataType: ValueType.DATE },
  { fieldName: "end_date", dataType: ValueType.DATE },
  { fieldName: "unit_sqno", dataType: ValueType.INT },
  { fieldName: "origin_strt_date", dataType: ValueType.TEXT },
];

export const columns = [
  {
    header: "결과단위",
    name: "exmn_rslt_uncd",
    fieldName: "exmn_rslt_uncd",
    width: 40,
    placeHolder: "입력하세요.",
    editButtonVisibility: "always",
    lookupDisplay: true,
    styleCallback: (grid, cell) => {
      const ret = { styleName: "rg-left-column" };
      if (grid.getDataSource().getRowState(grid.getDataRow(cell.index.itemIndex)) === RowState.CREATED) {
        ret.renderer = {
          type: "icon",
          iconCallback: () => newIcon,
          iconHeight: 18,
          iconWidth: 18,
          iconLocation: "leftedge",
        };
      }
      return ret;
    },
  },
  {
    header: "비고",
    name: "unit_rmrk",
    fieldName: "unit_rmrk",
    width: 60,
    renderer: { showTooltip: true },
    placeHolder: "입력하세요.",
    styleName: "rg-left-column",
  },
  {
    header: "적용시작일",
    name: "strt_date",
    fieldName: "strt_date",
    width: 30,
    datetimeFormat: "yyyy-MM-dd",
    editButtonVisibility: "always",
    editor: {
      type: "date",
      commitOnSelect: true,
      dropDownWhenClick: true,
      minDate: new Date(),
      maxDate: new Date("2999-12-31"),
      mask: { editMask: "9999-99-99", includedFormat: true },
    },
  },
  {
    header: "적용종료일",
    name: "end_date",
    fieldName: "end_date",
    datetimeFormat: "yyyy-MM-dd",
    width: 30,
    editButtonVisibility: "always",
    editor: {
      type: "date",
      commitOnSelect: true,
      dropDownWhenClick: true,
      minDate: new Date(),
      maxDate: new Date("2999-12-31"),
      mask: { editMask: "9999-99-99", includedFormat: true },
    },
  },
];
