import { useEffect, useRef, useState } from "react";
// util
import withPortal from "hoc/withPortal";
import { GridFitStyle, GridView, IconLocation, LocalDataProvider, ValueType } from "realgrid";
import getCtnrTextImg from "services/utils/getCtnrTextImg";
import { configEmptySet } from "services/utils/grid/RealGridUtil";
import Message from "components/Common/Message";
import PropTypes from "prop-types";

// common-ui-components
import { LUXButton, LUXDialog, LUXNumberField } from "luna-rocket";

// css
import "assets/style/MSC_020100_P01.scss";

// imgs
import deleteIcon from "assets/imgs/ic_trashcan_s_normal.png";
import callApi from "services/apis";
import icReferralOn from "assets/imgs/ic_referral_on.png";

export default function MSC_020100_P01({ setSnackbar, onSuccess }) {
  //useRef start
  const realGridElemRef = useRef();
  /**
   * @type { { current : GridView } }
   */
  const gridViewRef = useRef();
  //useState start
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [exmnPrgr, setExmnPrgr] = useState(false);
  const [brcd, setBrcd] = useState("");

  //function start
  const handleCancel = () => {
    setOpen(false);
  };
  const handleExmn = () => {
    if (exmnPrgr) return;
    setExmnPrgr(true);

    const dataProvider = gridViewRef.current.getDataSource();
    const targetList = dataProvider.getJsonRows().reduce((acc, e) => {
      for (const accItem of acc) {
        if (accItem === e.spcm_no) {
          return acc;
        }
      }
      acc.push(e.spcm_no);
      return acc;
    }, []);
    if (targetList.length < 1) {
      setExmnPrgr(false);
      return;
    }

    const deptList = dataProvider.getJsonRows().reduce((acc, e) => {
      acc[e.hope_exrm_dept_sqno] = e.hope_exrm_dept_sqno;
      return acc;
    }, {});

    callApi("/MSC_020100/rcpnBrcd", {
      mslcStringList: targetList,
    })
      .then(({ resultCode }) => {
        if (resultCode !== 200) {
          setSnackbar({
            type: "warning",
            open: true,
            message: Message.networkFail,
          });
          return;
        }
        dataProvider.clearRows();
        setSnackbar({
          type: "success",
          open: true,
          message: Message.receipt,
        });
        Object.values(deptList).map(dept => {
          callApi("/exam/sendPrgrProgressNoti", {
            exrmClsfCd: "L",
            deptSqno: dept,
          });
        });
        onSuccess();
      })
      .catch(() => {
        setSnackbar({
          type: "warning",
          open: true,
          message: Message.networkFail,
        });
      })
      .finally(() => setExmnPrgr(false));
  };

  const appendBrcdExmnPrscList = spcmNo => {
    callApi("/MSC_020100/rtrvBrcdExmnPrscList", { mslcString: spcmNo })
      .then(({ resultData, resultCode }) => {
        if (resultCode !== 200) throw resultCode;
        const dataProvider = gridViewRef.current.getDataSource();
        for (const row of dataProvider.getJsonRows()) {
          if (row.spcm_no === spcmNo) {
            setSnackbar({
              type: "info",
              open: true,
              message: Message.MSC_020000_addRddcBrcd,
            });
            return;
          }
        }
        dataProvider.addRows(resultData);
      })
      .catch(resultCode => {
        let message = Message.networkFail;
        let type = "warning";
        switch (resultCode) {
          case 404:
            type = "error";
            message = Message.MSC_020000_noExtcBrcd;
            break;
          case 443:
            type = "error";
            message = Message.MSC_020000_exmnExmnCmplBrcd;
            break;
          default:
        }
        setSnackbar({
          type,
          message,
          open: true,
        });
      });
  };

  //useEffect start
  useEffect(() => {
    const dataProvider = new LocalDataProvider(false);
    dataProvider.setFields([
      {
        fieldName: "spcm_no",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "prsc_cd",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "prsc_nm",
        dateType: ValueType.TEXT,
      },
      {
        fieldName: "spcm_cd",
        dateType: ValueType.TEXT,
      },
      {
        fieldName: "ctnr_labl_nm",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "ctnr_colr",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "spcm_need_vol",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "spcm_dosg_unit_nm",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "fix_vol_dvsn_nm",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "spcm_vol",
        dataType: ValueType.TEXT,
        valueCallback: (_ds, _rowId, _fieldName, fields, values) => {
          let unit = values[fields.indexOf("spcm_dosg_unit_nm")];
          if (unit == null) unit = "";
          let postText = values[fields.indexOf("fix_vol_dvsn_nm")];
          if (postText == null) postText = "";
          let vol = values[fields.indexOf("spcm_need_vol")];
          if (vol == null) vol = "";
          return vol + unit + postText;
        },
      },
      {
        fieldName: "pid",
        dateType: ValueType.TEXT,
      },
      {
        fieldName: "pt_nm",
        dateType: ValueType.TEXT,
      },
      { fieldName: "nm_dscm_dvcd", dateType: ValueType.TEXT },
      {
        fieldName: "pt_dscm_nm",
        dataType: ValueType.TEXT,
        valueCallback: (ds, rowId, fieldName, fields, values) =>
          values[fields.indexOf("pt_nm")] + (values[fields.indexOf("nm_dscm_dvcd")] || ""),
      },
      { fieldName: "entd_exmn_yn", dataType: ValueType.TEXT },
      { fieldName: "delete", dataType: ValueType.TEXT },
      { fieldName: "hope_exrm_dept_sqno", dataType: ValueType.TEXT },
    ]);
    const gridView = new GridView(realGridElemRef.current);
    gridViewRef.current = gridView;
    gridView.setDataSource(dataProvider);
    gridView.setColumns([
      {
        name: "spcm_no",
        fieldName: "spcm_no",
        width: "60",
        header: {
          text: "바코드 일련번호",
        },
        renderer: {
          type: "text",
          showTooltip: true,
        },
      },
      {
        name: "prsc_cd",
        header: "처방코드",
        fieldName: "prsc_cd",
        width: 60,
        renderer: {
          type: "icon",
          iconLocation: IconLocation.LEFT,
          iconCallback: (grid, cell) => {
            if (grid.getValue(cell.index.itemIndex, "entd_exmn_yn") === "Y") {
              return icReferralOn;
            }
          },
          showTooltip: true,
        },
        editable: false,
        styleName: "rg-left-column",
      },
      {
        name: "prsc_nm",
        fieldName: "prsc_nm",
        width: "100",
        header: {
          text: "처방명",
        },
        renderer: {
          type: "text",
          showTooltip: true,
        },
        styleName: "rg-left-column",
      },
      {
        name: "spcm_cd",
        fieldName: "spcm_cd",
        width: "40",
        header: {
          text: "검체코드",
        },
        renderer: {
          type: "text",
          showTooltip: true,
        },
        styleName: "rg-left-column",
      },
      {
        name: "ctnr_labl_nm",
        header: "용기",
        fieldName: "ctnr_labl_nm",
        width: 60,
        editable: false,
        renderer: {
          type: "image",
          imageCallback: (grid, dataCell) => {
            const color = grid.getDataSource().getValue(dataCell.index.dataRow, "ctnr_colr");
            if (dataCell.value != null && dataCell.value.length > 0) {
              return getCtnrTextImg(
                dataCell.value,
                color != null && color.length > 0 ? color : "#000000",
                dataCell.dataColumn.displayWidth,
              );
            }
            return false;
          },
        },
      },
      {
        name: "spcm_vol",
        header: "검체용량",
        fieldName: "spcm_vol",
        width: 50,
        editable: false,
        renderer: {
          type: "text",
          showTooltip: true,
        },
        styleName: "rg-left-column",
      },
      {
        name: "pid",
        header: "환자번호",
        fieldName: "pid",
        width: 50,
        editable: false,
        renderer: {
          type: "text",
          showTooltip: true,
        },
      },
      {
        name: "pt_dscm_nm",
        header: "환자명",
        fieldName: "pt_dscm_nm",
        width: 50,
        editable: false,
        renderer: {
          type: "text",
          showTooltip: true,
        },
      },
      {
        name: "delete",
        header: "삭제",
        fieldName: "delete",
        width: 20,
        editable: false,
        renderer: {
          type: "icon",
          iconCallback: () => deleteIcon,
          iconLocation: "center",
          iconHeight: 11,
        },
      },
    ]);
    configEmptySet(gridView, realGridElemRef.current, Message.noData);
    gridView.setDisplayOptions({
      fitStyle: GridFitStyle.EVEN_FILL,
    });
    gridView.footer.visible = false;
    gridView.stateBar.visible = false;
    gridView.checkBar.visible = false;
    gridView.onCellClicked = (grid, clickData) => {
      if (clickData.cellType === "data" && clickData.column === "delete") {
        const deleteSpcmNo = grid.getValue(clickData.itemIndex, "spcm_no");
        let idx = 0;
        while (idx < grid.getItemCount()) {
          if (deleteSpcmNo === grid.getValue(idx, "spcm_no")) {
            grid.getDataSource().removeRow(grid.getDataRow(idx));
          } else {
            idx++;
          }
        }
      }
    };

    dataProvider.onDataChanged = provider => {
      setDisabled(provider.getRowCount() < 1);
    };
    return () => {
      dataProvider.destroy();
      gridView.destroy();
    };
  }, []);

  useEffect(() => {
    if (open && !exmnPrgr) {
      //열릴떄 검사가 진행중이 아니라면 초기화, 진행중이면 해당 목록 유지함. => 뒤늦게 뜨는 검사 완료/실패 메시지와 싱크를 맞추기 위해.
      gridViewRef.current.getDataSource().clearRows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <LUXButton label="바코드 인식" onClick={() => setOpen(true)} type="small" />
      {withPortal(
        <LUXDialog onRequestClose handleOnReqeustClose={handleCancel} handleOnEscClose={handleCancel} dialogOpen={open}>
          <div className="dialog_content">
            <div className="dialog_data">
              <div className="dialog_data_tit">
                <h1 className="txtcnt">바코드 인식</h1>
                <button type="button" className="LUX_basic_btn btn_clr" onClick={handleCancel}>
                  <span className="sp_lux">닫기</span>
                </button>
              </div>
              <div className="dialog_data_area noline mgt10">
                <div className="dialog_data_section">
                  <div className="basic_headtitle_wrap">
                    <div className="btnbox">
                      <LUXNumberField
                        onKeyDown={e => {
                          if (e.keyCode === 13) {
                            if (e.target.value.length > 0) {
                              appendBrcdExmnPrscList(e.target.value);
                              setBrcd("");
                            }
                          } else {
                            setBrcd(e.target.value);
                          }
                        }}
                        value={brcd}
                        maxLength={11}
                        hintText="바코드를 인식 또는 일련번호를 입력해주세요."
                      />
                    </div>
                  </div>
                </div>
                <div className="dialog_data_section">
                  <div className="MSC_020100_P01-grid" ref={realGridElemRef} />
                </div>
              </div>
            </div>
            <div className="dialog_btnbx">
              <LUXButton label="취소" useRenewalStyle type="confirm" onClick={handleCancel} />
              <LUXButton
                label="확인"
                useRenewalStyle
                type="confirm"
                onClick={handleExmn}
                blue={!disabled}
                disabled={disabled}
              />
            </div>
          </div>
        </LUXDialog>,
        "dialog",
      )}
    </>
  );
}
MSC_020100_P01.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired,
};
