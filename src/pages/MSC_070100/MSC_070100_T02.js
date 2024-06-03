import React, { useCallback, useEffect, useRef, useState } from "react";

// util
import PropTypes from "prop-types";
import { windowOpen } from "services/utils/popupUtil";
import { setLocalStorageItem } from "services/utils/localStorage";
import { columns, fields } from "pages/MSC_070100/MSC_070100_T02_Grid";

// common-ui-components
import { GridView, LocalDataProvider } from "realgrid";
import OpnnDialog from "components/Common/OpnnDialog";
import { configEmptySet } from "services/utils/grid/RealGridUtil";
import Message from "components/Common/Message";
import callApi from "services/apis";
import moment from "moment";
import { LUXCircularProgress } from "luna-rocket";

// css

// imgs

/**
 * 통합검사결과 화면 기능검사 탭
 * @author 강현구A
 */
export default function MSC_070100_T02({ cardSearchCondition, selectedCard, setSnackbar, patientInfoRef }) {
  /* ================================================================================== */
  /* 참조(ref) 선언 */
  const realGridElemRef = useRef();
  const gridViewRef = useRef();
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [opnnDialog, setOpnnDialog] = useState({
    open: false,
    data: "",
    imgs: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handleOpnnDialogClose = () => {
    setOpnnDialog({
      open: false,
      data: opnnDialog.data,
    });
  };

  /**
   * 대상 검사처방의 판독소견 정보를 로드하는 Promise
   * @author khgkjg12 강현구A
   * @param { string } pid
   * @param { string } prscDate
   * @param { string | number } prscSqno
   * @returns { Promise<[]> } Promise 성공시 이미지 리스트가 전달됨.
   */
  const loadOpnnImgs = useCallback(
    (pid, prscDate, prscSqno) =>
      callApi("/MSC_030000/detail", {
        pid,
        prsc_date: prscDate,
        prsc_sqno: prscSqno,
      }).then(({ resultCode, resultData }) => {
        if (resultCode !== 200) throw resultCode;
        const { fileList } = resultData;
        return fileList;
      }),
    [],
  );

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
    gridView.setCheckBar({ visible: false });
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
    callApi("/MSC_070100/rtrvMsfRsltList", {
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
          if (clickData.cellType === "data") {
            if (clickData.column === "pdf") {
              const item = grid.getValues(clickData.itemIndex);
              const width = 1000;
              const height = window.screen.height - 200;
              setIsLoading(true);
              const patient = patientInfoRef.current?.getPatientInfo();
              loadOpnnImgs(cardSearchCondition.pid, item.prsc_date, item.prsc_sqno)
                .then(resultList => {
                  windowOpen(
                    "CSMSP002",
                    setLocalStorageItem({
                      previewOnly: true,
                      pid: cardSearchCondition.pid,
                      pt_nm: patient?.pt_nm_only,
                      age_cd: patient?.age_cd,
                      prsc_nm: item.prsc_nm,
                      mdcr_dr_nm: patient.mdcr_dr_nm,
                      cndt_dt: selectedCard.cndt_dy,
                      iptn_rslt: item.exmn_rslt_2,
                      pt_dvcd: "O", // @ 입원있으면 변경
                    }),
                    {
                      width,
                      height,
                      left: window.screenX + window.screen.width / 2 - width / 2,
                      top: window.screen.height / 2 - height / 2 - 40,
                    },
                  );
                })
                .catch(e => {
                  setSnackbar({
                    open: true,
                    message: Message.networkFail,
                    type: "warning",
                  });
                })
                .finally(() => {
                  setIsLoading(false);
                });
            } else if (clickData.column === "exmn_rslt_2") {
              const item = grid.getValues(clickData.itemIndex);
              setIsLoading(true);
              loadOpnnImgs(cardSearchCondition.pid, item.prsc_date, item.prsc_sqno)
                .then(fileList => {
                  setOpnnDialog({
                    open: true,
                    data: grid.getValue(clickData.itemIndex, "exmn_rslt_2"),
                    imgs: fileList,
                  });
                })
                .catch(() => {
                  setSnackbar({
                    open: true,
                    message: Message.networkFail,
                    type: "warning",
                  });
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }
          }
        };
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
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: Message.networkFail,
          type: "warning",
        });
      });
  }, [cardSearchCondition, selectedCard, setSnackbar, loadOpnnImgs]);

  /* ================================================================================== */
  /* render() */
  return (
    <>
      <div className="grid" ref={realGridElemRef}>
        {isLoading && (
          <LUXCircularProgress
            type="big"
            innerText="Loading..."
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              zIndex: 9999,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </div>
      <OpnnDialog
        open={opnnDialog.open}
        data={opnnDialog.data}
        imgs={opnnDialog.imgs}
        handleOpnnDialogClose={handleOpnnDialogClose}
        setSnackbar={setSnackbar}
        title="판독소견"
      />
    </>
  );
}
MSC_070100_T02.propTypes = {
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
MSC_070100_T02.defaultProps = {
  selectedCard: undefined,
};
