import React, { useEffect, useRef, useState } from "react";

// util
import { GridFitStyle, GridView, LocalDataProvider, SelectionStyle } from "realgrid";
import { setLocalStorageItem } from "services/utils/localStorage";
import { windowOpen } from "services/utils/popupUtil";
import { columns, fields } from "pages/MSC_070100/MSC_070100_T01_Grid";
import callApi from "services/apis";

// common-ui-components
import TxtRsltDialog from "components/Common/TxtRsltDialog";
import { configEmptySet } from "services/utils/grid/RealGridUtil";
import Message from "components/Common/Message";

// css

// imgs
/**
 * 통합검사결과 진단검사 탭
 * @author 강현구A
 * @param {{
 * selectedCard: {
 * rcpn_no: string;
 * cndt_dy: string;
 * };
 * cardSearchCondition:{
 * keyword: string;
 * pid: string;
 * };
 * setSnackbar: (any)=>void;
 * patientInfoRef:import("react").MutableRefObject }}
 *
 */
export default function MSC_070100_T01({
  selectedCard = null,
  cardSearchCondition,
  setSnackbar,
  patientInfoRef = null,
}) {
  /* ================================================================================== */
  /* 참조(ref) 선언 */
  const realGridElemRef = useRef();
  const gridViewRef = useRef();
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [txtRsltDialog, setTxtRsltDialog] = useState({
    open: false,
    data: "",
  });

  /* ================================================================================== */
  /* 함수(function) 선언 */

  const handleTxtRsltDialogClose = () => {
    setTxtRsltDialog({
      open: false,
      data: txtRsltDialog.data,
    });
  };
  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    const dataProvider = new LocalDataProvider(true);
    dataProvider.setFields(fields);
    const gridView = new GridView(realGridElemRef.current);
    gridViewRef.current = gridView;
    gridView.setDataSource(dataProvider);
    gridView.setColumns(columns);
    gridView.setDisplayOptions({
      fitStyle: GridFitStyle.EVEN_FILL,
      selectionStyle: SelectionStyle.ROWS,
    });
    gridView.pasteOptions.enabled = false;
    gridView.setCopyOptions({ copyDisplayText: true, singleMode: true });
    configEmptySet(gridView, realGridElemRef.current, Message.noData);
    gridView.setCheckBar({ visible: false });
    gridView.setRowIndicator({ visible: false });
    gridView.setStateBar({ visible: false });
    gridView.setFooter({ visible: false });
    gridView.setEditOptions({ editable: false, readOnly: true });
    gridView.onCellButtonClicked = (grid, index) => {
      if (index.column === "exmn_rslt_1") {
        setTxtRsltDialog({
          open: true,
          data: grid.getValue(index.itemIndex, "exmn_rslt_2"),
        });
      }
    };
    dataProvider.clearRows();
    return () => {
      dataProvider.destroy();
      gridView.destroy();
    };
  }, []);

  useEffect(() => {
    if (!selectedCard) {
      gridViewRef.current.getDataSource().clearRows();
      return;
    }
    callApi("/MSC_070100/rtrvMslRsltList", {
      rcpn_no: selectedCard.rcpn_no,
      cndt_dy: selectedCard.cndt_dy,
      keyword: cardSearchCondition.keyword,
    })
      .then(({ resultCode, resultData }) => {
        if (resultCode !== 200) throw resultCode;
        gridViewRef.current.getDataSource().setRows(resultData);
        gridViewRef.current.setColumnFilters(
          "prsc_nm",
          Object.values(
            resultData.reduce((acc, row) => {
              if (!acc[row.prsc_nm]) {
                acc[row.prsc_nm] = { name: row.prsc_nm, criteria: `value = '${row.prsc_nm}'` };
              }
              return acc;
            }, []),
          ),
        );
        gridViewRef.current.onCellClicked = (grid, clickData) => {
          const item = grid.getValues(clickData.itemIndex);
          if (clickData.column === "pdf" && clickData.cellType === "data") {
            const intWidth = 1000; // 팝업 가로사이즈
            const intHeight = window.screen.height - 200; // 팝업 세로사이즈
            const patient = patientInfoRef.current?.getPatientInfo();
            windowOpen(
              "CSMSP001",
              setLocalStorageItem({
                info: {
                  pid: cardSearchCondition.pid,
                  cndt_dy: selectedCard.cndt_dy,
                  sex_age: patient.age_cd,
                  dobr: patient.dobr,
                  pt_nm: patient.pt_nm_only,
                },
                data: [{ ...item, exmn_rslt_valu: item.exmn_rslt_1, rslt_unit_dvsn: item.exmn_rslt_unit_nm }],
                previewOnly: true,
              }),
              {
                width: intWidth,
                height: window.screen.height - 200,
                left: window.screenX + window.screen.width / 2 - intWidth / 2,
                top: window.screen.height / 2 - intHeight / 2 - 40,
              },
            );
          }
        };
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: Message.networkFail,
          type: "warning",
        });
      });
  }, [cardSearchCondition, selectedCard, setSnackbar]);

  /* ================================================================================== */
  /* render() */
  return (
    <>
      <div className="grid" ref={realGridElemRef} />
      <TxtRsltDialog
        data={txtRsltDialog.data}
        handleTxtRsltDialogClose={handleTxtRsltDialogClose}
        open={txtRsltDialog.open}
        title="위탁의뢰 결과치"
      />
    </>
  );
}
