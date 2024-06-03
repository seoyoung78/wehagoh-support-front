import React, { useEffect, useRef } from "react";
import { LocalDataProvider, GridView } from "realgrid";
import Message from "components/Common/Message";
import { configEmptySet, getUserGridColumnOption, setUserGridColumnOption } from "services/utils/grid/RealGridUtil";
import useMSC010100Store from "./store";
import { columns, fields } from "./columns";
import { useNavigate } from "react-router-dom";

export default function ({ columnsKey }) {
  const gridRef = useRef(null);
  // const setGridObjects = useMSC010100Store(state => state.setGridObjects);
  const initGrid = useMSC010100Store(state => state.grid.initGrid);
  const navigate = useNavigate();

  useEffect(() => {
    const container = gridRef.current;
    const provider = new LocalDataProvider(true);
    const grid = new GridView(container);

    grid.setDataSource(provider);
    provider.setFields(fields);
    grid.setColumns(columns);

    grid.checkBar.visible = false;
    grid.footer.visible = false;
    grid.stateBar.visible = false;
    grid.editOptions.editable = false;
    grid.displayOptions.showEmptyMessage = true;
    grid.displayOptions.emptyMessage = Message.noData;
    grid.displayOptions.fitStyle = "evenFill";
    grid.displayOptions.selectionStyle = "rows";
    grid.pasteOptions.enabled = false;
    grid.setCopyOptions({ copyDisplayText: true, singleMode: true });

    getUserGridColumnOption(grid, "MSC_010100_Grid" + columnsKey, columns, "visible");

    // 컨텍스트 메뉴 설정
    grid.onContextMenuPopup = grid => {
      let contextList = [];
      let menuList = [];

      columns.map(column => {
        if (column.contextVisibility) {
          menuList.push({
            label: column.header,
            type: "check",
            checked: grid.columnByName(column.name).visible,
            name: column.name,
          });
        }
      });

      if (menuList.length > 0) {
        contextList.unshift({ label: "컬럼", children: menuList });
      }
      grid.setContextMenu(contextList);
    };
    grid.onContextMenuItemClicked = (grid, item) => {
      if (item.parent.label === "컬럼") {
        grid.columnByName(item.name).visible = item.checked;
        setUserGridColumnOption("MSC_010100_Grid" + columnsKey, item.name, "visible", item.checked);
      }
    };

    grid.onCellDblClicked = (grid, clickData) => {
      if (clickData.cellType === "data") {
        let path = "/";
        switch (columnsKey) {
          case "L":
            path += "MSC_02";
            break;
          case "F":
            path += "MSC_03";
            break;
          case "R":
            path += "MSC_04";
            break;
          case "E":
            path += "MSC_05";
            break;
          default:
            break;
        }
        const values = grid.getValues(clickData.itemIndex);
        if (values.prsc_prgr_stat_cd >= "E") {
          if (columnsKey === "L") {
            path += "0300";
          } else {
            path += "0200";
          }
        } else {
          path += "0100";
        }
        navigate(path, { state: values });
      }
    };

    configEmptySet(grid, gridRef.current, Message.noData);

    // setGridObjects(columnsKey, provider, grid);
    initGrid(columnsKey, provider, grid);

    return () => {
      provider.clearRows();
      grid.destroy();
      provider.destroy();

      gridRef.current = null;
    };
  }, [columnsKey, initGrid]);

  return <div className="grid" ref={gridRef} />;
}
