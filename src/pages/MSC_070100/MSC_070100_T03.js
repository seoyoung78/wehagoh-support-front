import React, { useEffect, useRef, useState } from "react";

// util
import { GridView, LocalDataProvider } from "realgrid";
import { columns, fields } from "pages/MSC_070100/MSC_070100_T03_Grid";
import PropTypes from "prop-types";
import { setLocalStorageItem } from "services/utils/localStorage";
import { windowOpen } from "services/utils/popupUtil";

// common-ui-components
import OpnnDialog from "components/Common/OpnnDialog";
import { configEmptySet } from "services/utils/grid/RealGridUtil";
import Message from "components/Common/Message";
import callApi from "services/apis";
import moment from "moment";

// css

// imgs

/**
 * 통합검사결과 영상검사 탭
 * @author khgkjg12 강현구A
 */
export default function MSC_070100_T03({
  cardSearchCondition,
  selectedCard,
  setSnackbar,
  patientInfoRef,
  handlePacsInfo,
}) {
  /* ================================================================================== */
  /* 참조(ref) 선언 */
  const realGridElemRef = useRef(null);
  const gridViewRef = useRef(null);
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [opnnDialog, setOpnnDialog] = useState({
    open: false,
    data: "",
  });

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handleOpnnDialogClose = () => {
    setOpnnDialog({
      open: false,
      data: opnnDialog.data,
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
      fitStyle: "even",
      selectionStyle: "rows",
    });
    gridView.pasteOptions.enabled = false;
    gridView.setCopyOptions({ copyDisplayText: true, singleMode: true });
    configEmptySet(gridView, realGridElemRef.current, Message.noData);
    gridView.setCheckBar({
      visible: false,
    });
    gridView.setRowIndicator({ visible: false });
    gridView.setStateBar({ visible: false });
    gridView.setFooter({ visible: false });
    gridView.setEditOptions({ editable: false, readOnly: true });
    dataProvider.clearRows();
    return () => {
      dataProvider.destroy();
      gridView.destroy();
    };
  }, []);

  useEffect(() => {
    //pdf 셀 클릭 이벤트
    if (!selectedCard) {
      gridViewRef.current.getDataSource().clearRows();
      return;
    }
    callApi("/MSC_070100/rtrvMsrRsltList", {
      rcpn_no: selectedCard.rcpn_no,
      cndt_dy: selectedCard.cndt_dy,
      keyword: cardSearchCondition.keyword,
    }).then(({ resultCode, resultData }) => {
      if (resultCode !== 200) throw resultCode;
      gridViewRef.current.clearCurrent();
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
        if (clickData.cellType === "data")
          if (clickData.column === "pdf") {
            const data = grid.getValues(clickData.itemIndex);
            const patient = patientInfoRef.current?.getPatientInfo();
            const key = setLocalStorageItem({
              list: [
                {
                  ...data,
                  iptn_rslt: data.exmn_rslt_2,
                  cndt_dt: moment(selectedCard.cndt_dy, "YYYY-MM-DD").format("YYYY년 MM월 DD일"),
                },
              ],
              ptInfo: {
                pid: cardSearchCondition.pid,
                pt_nm_only: patient?.pt_nm_only,
                age_cd: patient?.age_cd,
                pt_dvcd: patient?.pt_dvcd,
              },
              previewOnly: true,
            });
            const url = `CSMSP003`;
            const width = 1000; // 팝업 가로사이즈
            const height = window.screen.height - 200; // 팝업 세로사이즈
            // 너비, 높이 및 스크롤바를 설정
            const features = {
              width,
              height,
              left: window.screenX + window.screen.width / 2 - width / 2,
              top: window.screen.height / 2 - height / 2 - 40,
            };
            windowOpen(url, key, features);
          } else if (clickData.column === "exmn_rslt_2") {
            setOpnnDialog({
              open: true,
              data: grid.getValue(clickData.itemIndex, "exmn_rslt_2"),
            });
          }
      };
      gridViewRef.current.onSelectionChanged = (grid, selection) => {
        const { pacs_no, pacs_co_cd } = grid.getValues(selection.startRow);
        handlePacsInfo({ pacs_no, pacs_co_cd });
      };
    });
  }, [cardSearchCondition, selectedCard, setSnackbar]);

  /* ================================================================================== */
  /* render() */
  return (
    <>
      <div className="grid" ref={realGridElemRef} />
      <OpnnDialog
        open={opnnDialog.open}
        data={opnnDialog.data}
        handleOpnnDialogClose={handleOpnnDialogClose}
        setSnackbar={setSnackbar}
        title="판독소견"
      />
    </>
  );
}
MSC_070100_T03.propTypes = {
  selectedCard: PropTypes.shape({
    rcpn_no: PropTypes.string.isRequired,
    cndt_dy: PropTypes.string.isRequired,
  }),
  cardSearchCondition: PropTypes.shape({
    keyword: PropTypes.string,
    pid: PropTypes.string,
  }).isRequired,
  setSnackbar: PropTypes.func.isRequired,
};
MSC_070100_T03.defaultProps = {
  selectedCard: undefined,
};
