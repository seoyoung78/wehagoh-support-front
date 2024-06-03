import { useEffect, useRef, useState } from "react";
// common-ui-components
import { LUXButton, LUXConfirm, LUXDialog, LUXSnackbar } from "luna-rocket";
import PrscComplete from "components/Common/PrscComplete";
// util
import PropTypes from "prop-types";
import {
  DropDownValueLabel,
  GridFitStyle,
  GridView,
  LocalDataProvider,
  RowState,
  SelectionStyle,
  ValueType,
} from "realgrid";
import callApi from "services/apis";
import moment from "moment";
import Message from "components/Common/Message";
import withPortal from "hoc/withPortal";
// css
//imgs
import icNew from "assets/imgs/ic_new.png";
import deleteIcon from "assets/imgs/ic_trashcan_s_normal.png";
import useLoadingStore from "services/utils/zustand/useLoadingStore";

/**
 * 처방 요청 팝업.
 * @author 강현구A
 * @history 2023-11-01 처방요청그리드 컬럼 수정(윤서영)
 * @history 2023-12-26 처방요청 알림 api 반영(윤서영)
 */
export default function ReqPrscDialog({ open, setOpen, patient, exrmClsfCd }) {
  const [confirm, setConfirm] = useState({
    open: false,
    onConfirm: () => undefined,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });
  const realGridElemRef = useRef();
  const gridViewRef = useRef();
  const prscCompleteRef = useRef();
  const [reqPsbl, setReqPsbl] = useState();
  const { openLoading, closeLoading } = useLoadingStore(state => state);

  const handleRequest = async () => {
    const gridView = gridViewRef.current;
    const detailsList = gridView
      .getDataSource()
      .getStateRows(RowState.CREATED)
      .map(index => gridView.getValues(index))
      .map(list => {
        list.mdcr_dr_id = list.user_nm;
        return list;
      });

    const timeout = setTimeout(() => openLoading(Message.sendNoti), 300);
    await callApi("/exam/requestPrsc", {
      detailsList,
      exrmClsfCd,
      date: moment(patient.mdcr_date || new Date()).format("YYYY-MM-DD"),
      ptNm: patient.pt_nm,
    })
      .then(({ resultCode }) => {
        if (resultCode === 200) {
          setSnackbar({
            type: "success",
            message: Message.prscReqSuccess,
            open: true,
          });
          setOpen(false);
        } else {
          setSnackbar({
            type: "warning",
            message: Message.networkFail,
            open: true,
          });
        }
      })
      .catch(() =>
        setSnackbar({
          type: "warning",
          message: Message.networkFail,
          open: true,
        }),
      )
      .finally(() => {
        closeLoading();
        clearTimeout(timeout);
      });
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const addPrsc = prsc => {
    setConfirm({ open: false });
    const gridView = gridViewRef.current;
    gridView.commit();
    const insertIdx = gridView.getDataSource().getRowStateCount([RowState.CREATED]);
    gridView.getDataSource().insertRow(insertIdx, prsc);
    gridView.setSelection({
      style: SelectionStyle.BLOCK,
      startItem: insertIdx,
      endItem: insertIdx,
      startColumn: "prsc_date",
      endColumn: "delete",
    });
  };

  const handleCompleted = completedData => {
    if (completedData) {
      // 처방 중복체크
      const duplCheck = gridViewRef.current
        .getDataSource()
        .getJsonRows()
        .find(item => item.prsc_cd === completedData.prsc_cd);
      if (duplCheck) {
        setConfirm({
          open: true,
          onConfirm: () => addPrsc(completedData),
        });
      } else {
        addPrsc(completedData);
      }
    }
  };

  //useEffect start

  useEffect(() => {
    const dataSource = new LocalDataProvider(false);
    const gridView = new GridView(realGridElemRef.current);
    gridView.setDataSource(dataSource);
    dataSource.setFields([
      {
        fieldName: "prsc_date",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "rcpt_stat_cd",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "prsc_cd",
        dateType: ValueType.TEXT,
      },
      {
        fieldName: "prsc_nm",
        dateType: ValueType.TEXT,
      },
      {
        fieldName: "prsc_pay_dvcd",
        dateType: ValueType.TEXT,
      },
      {
        fieldName: "user_nm",
        dateType: ValueType.TEXT,
      },
      { fieldName: "delete", dataType: ValueType.TEXT },
    ]);
    dataSource.onDataChanged = provider => {
      const createdIdxs = provider.getStateRows(RowState.CREATED);
      if (createdIdxs.length < 1) {
        setReqPsbl(false);
        return;
      }
      let nextReqPsbl = true;
      for (const idx of createdIdxs) {
        const row = provider.getJsonRow(idx);
        if (!row.user_nm) {
          nextReqPsbl = false;
          break;
        }
      }
      setReqPsbl(nextReqPsbl);
    };
    gridView.setColumns([
      {
        name: "prsc_date",
        fieldName: "prsc_date",
        header: "처방일자",
        type: "text",
        width: 12,
        editable: false,
      },
      {
        name: "rcpt_stat_cd",
        fieldName: "rcpt_stat_cd",
        header: "수납",
        type: "text",
        width: 6,
        editable: false,
      },
      {
        name: "prsc_cd",
        fieldName: "prsc_cd",
        header: "처방코드",
        type: "text",
        width: 10,
        editable: false,
        styleName: "rg-left-column",
      },
      {
        name: "prsc_nm",
        fieldName: "prsc_nm",
        header: "처방명",
        width: 30,
        editable: false,
        renderer: {
          type: "icon",
          iconCallback: (grid, cell) => {
            if (grid.getDataSource().getRowState(grid.getDataRow(cell.index.itemIndex)) === RowState.CREATED) {
              return icNew;
            }
          },
        },
        styleName: "rg-left-column",
      },
      {
        name: "prsc_pay_dvcd",
        fieldName: "prsc_pay_dvcd",
        header: "급여",
        width: 10,
        editable: false,
      },
      {
        name: "user_nm",
        fieldName: "user_nm",
        header: "처방입력자",
        width: 10,
        styleCallback: (grid, cell) => ({
          editable: grid.getDataSource().getRowState(grid.getDataRow(cell.index.itemIndex)) === RowState.CREATED,
        }),
        lookupDisplay: true,
      },
      {
        name: "delete",
        header: "삭제",
        fieldName: "delete",
        width: 5,
        editable: false,
        renderer: {
          type: "icon",
          iconCallback: (grid, cell) => {
            if (grid.getDataSource().getRowState(grid.getDataRow(cell.index.itemIndex)) === RowState.CREATED) {
              return deleteIcon;
            }
          },
          iconLocation: "center",
          iconHeight: 11,
        },
      },
    ]);
    gridView.setDisplayOptions({
      showEmptyMessage: true,
      emptyMessage: "검색 결과가 없습니다.",
      fitStyle: GridFitStyle.EVEN,
    });
    gridView.pasteOptions.enabled = false;
    gridView.setCopyOptions({ copyDisplayText: true, singleMode: true });
    gridView.footer.visible = false;
    gridView.stateBar.visible = false;
    gridView.checkBar.visible = false;
    gridView.onCellClicked = (grid, clickData) => {
      if (
        clickData.cellType === "data" &&
        clickData.column === "delete" &&
        grid.getDataSource().getRowState(grid.getDataRow(clickData.itemIndex)) === RowState.CREATED
      ) {
        grid.commit();
        grid.getDataSource().removeRow(grid.getDataRow(clickData.itemIndex));
      }
    };
    gridView.onCellEdited = grid => {
      grid.commit();
    };
    gridViewRef.current = gridView;
    return () => {
      dataSource.destroy();
      gridView.destroy();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      gridViewRef.current?.clearCurrent();
      gridViewRef.current?.commit();
      return;
    }
    if (!patient.rcpn_sqno) {
      //patient 데이터는 항상 오브젝트로 관리되어진다.
      setSnackbar({
        type: "info",
        message: "선택된 환자가 없습니다.",
        open: true,
      });
      setOpen(false);
      return;
    }
    setReqPsbl(false);
    const gridView = gridViewRef.current;
    Promise.all([
      callApi("/common/getPrscList", {
        rcpn_no: patient.rcpn_sqno,
      }),
      callApi("/common/rtrvDrList"),
    ])
      .then(([{ resultData: prscList }, { resultCode: rtrvDrListResultCode, resultData: rtrvDrListResultData }]) => {
        if (rtrvDrListResultCode !== 200) throw Error();
        gridView.commit();
        gridView.setColumn({
          ...gridView.columnByName("user_nm"),
          values: rtrvDrListResultData.map(e => e.usr_sqno),
          labels: rtrvDrListResultData.map(e => e.user_nm),
          editor: {
            type: "list",
            values: rtrvDrListResultData.map(e => e.usr_sqno),
            labels: rtrvDrListResultData.map(e => e.user_nm + "(" + e.dept_hnm + ")"),
            displayLabels: DropDownValueLabel.LABEL,
            textReadOnly: true,
            showButtons: true,
          },
        });
        gridView.getDataSource().setRows(prscList);
        prscCompleteRef.current.setKeyword("");
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: Message.networkFail,
          type: "warning",
        });
      });
  }, [open, patient.rcpn_sqno, setOpen]);

  return (
    <>
      {withPortal(
        <LUXDialog onRequestClose handleOnReqeustClose={handleCancel} handleOnEscClose={handleCancel} dialogOpen={open}>
          <div className="dialog_content md">
            <div className="dialog_data">
              <div className="dialog_data_tit">
                <h1 className="txtcnt">처방요청</h1>
                <button type="button" className="LUX_basic_btn btn_clr" onClick={handleCancel}>
                  <span className="sp_lux">닫기</span>
                </button>
              </div>
              <div className="dialog_data_area noline mgt10">
                <div className="reqprscdialog-title">
                  <span>• 처방내역</span>
                </div>
                <div className="reqprscdialog-grid" ref={realGridElemRef} />
                <PrscComplete onCompleted={handleCompleted} ref={prscCompleteRef} />
              </div>
            </div>
            <div className="dialog_btnbx">
              <LUXButton label="취소" useRenewalStyle type="confirm" onClick={handleCancel} />
              <LUXButton
                label="확인"
                useRenewalStyle
                type="confirm"
                onClick={handleRequest}
                blue={reqPsbl}
                disabled={!reqPsbl}
              />
            </div>
          </div>
        </LUXDialog>,
        "dialog",
      )}
      {withPortal(
        <LUXSnackbar
          autoHideDuration={3000}
          message={snackbar.message}
          onRequestClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          open={snackbar.open}
          type={snackbar.type}
        />,
        "snackbar",
      )}
      {withPortal(
        <LUXConfirm
          message="추가하시겠습니까?"
          useIcon
          useIconType="question"
          title="중복된 사항이 있습니다."
          open={confirm.open}
          cancelButton={() => {
            setConfirm({ open: false });
          }}
          confirmButton={confirm.onConfirm}
          onClose={() => {
            setConfirm({ open: false });
          }}
        />,
        "dialog",
      )}
    </>
  );
}
ReqPrscDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  patient: PropTypes.shape({
    rcpn_sqno: PropTypes.string,
    mdcr_user_nm: PropTypes.string,
    mdcr_date: PropTypes.string,
    pt_nm: PropTypes.string,
  }),
  exrmClsfCd: PropTypes.oneOf(["L", "F", "E", "R", "P"]), // 검사 구분 (L: 검체(진단), F: 기능, E: 내시경, R: 방사선(영상), P: 물리치료)
};
ReqPrscDialog.defaultProps = {
  patient: {},
  exrmClsfCd: "",
};
