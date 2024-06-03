import React, { useEffect, useRef } from "react";

// util
import PropTypes from "prop-types";
import { GridView, LocalDataProvider } from "realgrid";
import { columns, fields } from "pages/MSC_070100/MSC_070100_T04_Grid";
import { windowOpen } from "services/utils/popupUtil";

// common-ui-components
import { configEmptySet } from "services/utils/grid/RealGridUtil";
import Message from "components/Common/Message";
import callApi from "services/apis";
import { setLocalStorageItem } from "services/utils/localStorage";

// css

// imgs

/**
 * 통합검사결과 화면 내시경검사 탭.
 * @author 강현구A
 */
export default function MSC_070100_T04({ cardSearchCondition, selectedCard, setSnackbar, patientInfoRef }) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const realGridElemRef = useRef(null); // realgrid DOM
  const gridViewRef = useRef(null);

  /* ================================================================================== */
  /* 함수(function) 선언 */
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
      fitStyle: "even", // 그리드 가로 영역 채우기
      selectionStyle: "rows",
    });
    configEmptySet(gridView, realGridElemRef.current, Message.noData);
    gridView.setCheckBar({
      visible: false,
    });
    gridView.pasteOptions.enabled = false;
    gridView.setCopyOptions({ copyDisplayText: true, singleMode: true });
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
    callApi("/MSC_070100/rtrvMseRsltList", {
      rcpn_no: selectedCard.rcpn_no,
      cndt_dy: selectedCard.cndt_dy,
      keyword: cardSearchCondition.keyword,
    }).then(({ resultCode, resultData }) => {
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
        if (clickData.cellType === "data")
          if (clickData.column === "pdf") {
            const patient = patientInfoRef.current?.getPatientInfo();
            const item = grid.getValues(clickData.itemIndex);
            const param = {
              patient: {
                pid: patient.pid,
                pt_nm: patient.pt_nm_only,
                pt_dvcd: "O", // @ 입원있으면 변경
                age_cd: patient.age_cd,
              },
              prsc_date: item.prsc_date,
              prsc_sqno: item.prsc_sqno,
            };
            const key = setLocalStorageItem({ ...param });

            if (key) {
              const url = `CSMSP007`;

              const intWidth = 1000; // 팝업 가로사이즈
              const intHeight = window.screen.height - 200; // 팝업 세로사이즈

              // 너비, 높이 및 스크롤바를 설정
              const features = {
                width: intWidth,
                height: window.screen.height - 200,
                left: window.screenX + window.screen.width / 2 - intWidth / 2,
                top: window.screen.height / 2 - intHeight / 2 - 40,
              };

              windowOpen(url, key, features);
            }
          }
      };
    });
  }, [cardSearchCondition, selectedCard, setSnackbar]);

  /* ================================================================================== */
  /* render() */
  return <div className="grid" ref={realGridElemRef} />;
}
MSC_070100_T04.propTypes = {
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
MSC_070100_T04.defaultProps = {
  selectedCard: undefined,
};
