import { useEffect, useRef, useState } from "react";
// util
import withPortal from "hoc/withPortal";
import { GridFitStyle, GridView, IconLocation, LocalDataProvider, ValueType } from "realgrid";
import getCtnrTextImg from "services/utils/getCtnrTextImg";
import { configEmptySet } from "services/utils/grid/RealGridUtil";
import Message from "components/Common/Message";
import PropTypes from "prop-types";
import callApi from "services/apis";
import {
  setLabelId,
  clearBuffer,
  drawTrueTypeFont,
  draw1DBarcode,
  getLabelData,
  printBuffer,
} from "pages/MSC_020000/MSC_020100/printers/bxllabel";
import { requestPrint, setConnectionMode } from "pages/MSC_020000/MSC_020100/printers/bxlcommon";

// common-ui-components
import { LUXButton, LUXDialog } from "luna-rocket";

// css
import "assets/style/MSC_020100_P02.scss";

// imgs
import getBadgeSvg from "services/utils/getBadgeSvg";
import icReferralOn from "assets/imgs/ic_referral_on.png";
import moment from "moment/moment";
import { getTempSpcmKey, getTempSpcmList, runCascade } from "../utils/MSC_020000Utils";

export default function MSC_020100_P02({ setSnackbar, stateList, rcpnSttsGridView }) {
  //constant start.
  const PRINTER_NAME = "WH_Printer_1"; // 라벨 프린터 이름(@주의: SDK 프로그램과 프린터 이름이 같아야함)
  //useRef start
  const realGridElemRef = useRef();
  /**
   * @type {{current: GridView}}
   */
  const gridViewRef = useRef();
  //useState start
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [issuPrgr, setIssuPrgr] = useState(false);

  //function start
  const handleCancel = () => {
    setOpen(false);
  };

  /**
   * @description BIXOLON 라벨 프린터와 실제 통신하여, 바코드를 출력하기 위한 함수
   */
  const setAndPrintOfRealBarCodeDevice = spcmNo =>
    new Promise((resolve, reject) => {
      callApi("/MSC_020100/rtrvBrcd", { mslcString: spcmNo })
        .then(({ resultCode, resultData }) => {
          if (resultCode !== 200) throw new Error();
          setConnectionMode("http:");
          // setConnectionMode("ws:")
          // setWidth(300); // 적용 안되는듯?
          // setLength(300, 0, 'C', 0); // 연속 용지일경우 반드시 사용 o, Gap 용지 사용 필요 x
          let issueID = 1;
          // 인쇄를 요청하는 Id 값 (사용자가 지정)
          setLabelId(issueID);
          // 프린터 버퍼 초기화
          clearBuffer();
          // 문자열을 입력하는 빅슬론 외부 API
          // drawTrueTypeFont(텍스트, x축좌표, y축좌표, 폰트이름, 글꼴크기, 회전, 기울임체, 밑줄, 굵은글씨, 이미지압축)
          drawTrueTypeFont(
            (resultData.nm_dscm_dvcd ? resultData.pt_nm + resultData.nm_dscm_dvcd : resultData.pt_nm) +
              " | " +
              resultData.pid +
              " | " +
              resultData.sex_age,
            235,
            12,
            "Arial",
            18,
            0,
            false,
            false,
            false,
            true,
          );
          draw1DBarcode(resultData.spcm_no, 247, 52, 1, 3, 4, 65, 0, 0); //symbol 1 = code128,
          drawTrueTypeFont(resultData.spcm_no, 235, 138, "Arial", 16, 0, false, false, false, true);
          drawTrueTypeFont(
            moment(resultData.brcd_issu_dt, "YYYY-MM-DD HH:mm:ss.SSS").format("YYYY/MM/DD HH:mm"),
            420,
            138,
            "Arial",
            16,
            0,
            false,
            false,
            false,
            true,
          );
          drawTrueTypeFont(
            "검체라벨명 : " + resultData.spcm_labl_nm,
            235,
            186,
            "Arial",
            18,
            0,
            false,
            false,
            false,
            true,
          );
          // 프린터 버퍼에 있는 데이터 출력
          printBuffer();
          issueID++;
          // 생성된 json data를 가져온다.
          const strSubmit = getLabelData();
          requestPrint(PRINTER_NAME, strSubmit, result => {
            if (result.split(":", 2)[1] !== "success") {
              //[reqId]:success
              reject(result);
            } else {
              resolve();
            }
          });
        })
        .catch(e => {
          reject(e);
        });
    });

  const handlePrint = () => {
    if (issuPrgr) return;
    setIssuPrgr(true);
    const gridView = gridViewRef.current;
    const checkedIdxList = gridView.getCheckedItems();
    if (checkedIdxList.length < 1) {
      setSnackbar({ open: true, type: "info", message: Message.noCheck2 });
      setIssuPrgr(false);
      return;
    }
    const bList = [];
    const eList = [];
    for (const idx of checkedIdxList) {
      const item = gridView.getValues(idx);
      item.idx = idx;
      if (!item.spcm_no) {
        bList.push(item);
      } else if (!eList.includes(item.spcm_no)) {
        eList.push(item.spcm_no);
      }
    }
    const bMap = getTempSpcmList(bList);
    // 바코드 기계랑 통신에 성공하면 실제 바코드 출력 프로세스 진행
    const onFinal = resultData => {
      // 백엔드에서 가져온 바코드 정보와 검체명들을 가지고 바코드 출력시작
      runCascade(resultData.concat(eList).map(e => () => setAndPrintOfRealBarCodeDevice(e)))
        .then(() => {
          setSnackbar(prev => ({
            ...prev,
            open: true,
            type: "success",
            message: Message.MSC_020000_brcdPrntSucc,
          }));
        })
        .catch(e => {
          setSnackbar({
            open: true,
            type: "error",
            message: Message.MSC_020000_printerError,
          });
        })
        .finally(() => setIssuPrgr(false));
    };
    if (Object.values(bMap).length < 1) {
      onFinal([]);
      return;
    }
    const runnableList = [];
    const paramList = [];
    for (const value of Object.values(bMap)) {
      paramList.push(value);
      runnableList.push(callApi("/MSC_020100/issuBrcd", { mslcMapList: value }));
    }
    Promise.allSettled(runnableList)
      .then(resultList => {
        const successList = [];
        let resultCode = null;
        let resultData = null;
        for (let i = 0; i < resultList.length; i++) {
          const result = resultList[i];
          if (result.value?.resultCode === 200) {
            successList.push(result.value.resultData);
            paramList[i].forEach(element => {
              gridView.setValue(element.idx, "spcm_no", result.value.resultData);
            });
          } else {
            resultCode = result.value?.resultCode;
            resultData = result.value?.resultData;
          }
        }
        if (successList.length < 1) {
          if (resultCode === 472) {
            setSnackbar({ open: true, type: "error", message: Message.MSC_020000_alreadyIssued });
          } else if (resultCode === 470) {
            setSnackbar({ open: true, type: "error", message: Message.MSC_020000_rddcPrscIssu });
          } else {
            setSnackbar({
              type: "warning",
              message: Message.networkFail,
              open: true,
            });
          }
          setIssuPrgr(false);
          return;
        }
        onFinal(successList);
      })
      .catch(() => {
        setSnackbar(prev => ({ ...prev, open: true, type: "warning", message: Message.networkFail }));
        setIssuPrgr(false);
      });
  };

  //useEffect start
  useEffect(() => {
    const dataProvider = new LocalDataProvider(false);
    dataProvider.setFields([
      {
        fieldName: "pid",
        dateType: ValueType.TEXT,
      },
      {
        fieldName: "prsc_date", //출력 요청용.
        dateType: ValueType.TEXT,
      },
      {
        fieldName: "prsc_sqno", //출력 요청용.
        dataType: ValueType.UINT,
      },
      {
        fieldName: "pt_nm",
        dateType: ValueType.TEXT,
      },
      { fieldName: "nm_dscm_dvcd", dateType: ValueType.TEXT },
      {
        fieldName: "pt_dscm_nm",
        dataType: ValueType.TEXT,
        valueCallback: (_ds, _rowId, _fieldName, fields, values) =>
          values[fields.indexOf("pt_nm")] + (values[fields.indexOf("nm_dscm_dvcd")] || ""),
      },
      {
        fieldName: "sex_age",
        dateType: ValueType.TEXT,
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
        fieldName: "spcm_no", //재 출력용.
        dateType: ValueType.TEXT,
      },
      {
        fieldName: "spcm_cd",
        dateType: ValueType.TEXT,
      },
      {
        fieldName: "spcm_labl_nm",
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
        fieldName: "prsc_prgr_stat_cd",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "entd_exmn_yn",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "rcpn_no",
        dataType: ValueType.TEXT,
      },
      {
        fieldName: "hope_exrm_dept_sqno",
        dataType: ValueType.UINT,
      },
      {
        fieldName: "exmn_hope_date",
        dataType: ValueType.TEXT,
      },
    ]);
    const gridView = new GridView(realGridElemRef.current);
    gridViewRef.current = gridView;
    gridView.setDataSource(dataProvider);
    gridView.setColumns([
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
        name: "sex_age",
        header: "성별/나이",
        fieldName: "sex_age",
        width: 50,
        editable: false,
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
        name: "spcm_labl_nm",
        fieldName: "spcm_labl_nm",
        width: "40",
        header: "검체명",
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
        header: "상태",
        name: "prsc_prgr_stat_cd",
        fieldName: "prsc_prgr_stat_cd",
        editable: false,
        width: 50,
        fillWidth: 0,
      },
    ]);
    configEmptySet(gridView, realGridElemRef.current, Message.noData);
    gridView.setDisplayOptions({
      fitStyle: GridFitStyle.EVEN_FILL,
    });
    gridView.footer.visible = false;
    gridView.stateBar.visible = false;
    gridView.rowIndicator.visible = false;
    gridView.setCheckBar({
      visible: true,
      syncHeadCheck: true,
    });
    gridView.onItemChecked = (grid, itemIndex, checked) => {
      const item = grid.getValues(itemIndex);
      //검사 후 이면.
      if (item.spcm_no) {
        for (let index = 0; index < grid.getItemCount(); index++) {
          const target = grid.getValues(index);
          if (target.spcm_no === item.spcm_no) {
            grid.checkItem(index, checked, false, false);
          }
        }
        return;
      }
      if (checked) {
        //검사 전이고 체크활성화 이벤트일떄.
        for (let index = 0; index < grid.getItemCount(); index++) {
          const target = grid.getValues(index);
          if (!target.spcm_no && getTempSpcmKey(target) === getTempSpcmKey(item)) {
            //타겟 검체번호가 없고, 검체코드, 접수번호, 검사실, 검사일자가 일치.
            grid.checkItem(index, true, false, false);
          }
        }
      }
    };
    return () => {
      dataProvider.destroy();
      gridView.destroy();
    };
  }, []);

  useEffect(() => {
    gridViewRef.current.setColumn({
      ...gridViewRef.current.columnByName("prsc_prgr_stat_cd"),
      values: stateList.map(item => item.code),
      labels: stateList.map(item => item.name),
      renderer: {
        type: "image",
        imageCallback: (grid, dataCell) => {
          for (const item of stateList) {
            if (dataCell.value === item.code) {
              return getBadgeSvg(item.name, item.color);
            }
          }
        },
      },
    });
  }, [stateList]);

  useEffect(() => {
    if (!open) return;
    setDisabled(true);
    setIssuPrgr(false);
    const dataProvider = gridViewRef.current.getDataSource();
    dataProvider.clearRows(); //먼저 초기화 한후 시작.

    const callRtrvExmnPrscList = [];
    const rcpnSttsList = [];
    for (const idx of rcpnSttsGridView.getCheckedItems()) {
      const item = rcpnSttsGridView.getValues(idx);
      callRtrvExmnPrscList.push(
        callApi("/MSC_020100/rtrvExmnPrscList", {
          rcpn_no: item.rcpn_no,
          exmn_hope_date: item.exmn_hope_date,
          hope_exrm_dept_sqno: item.hope_exrm_dept_sqno,
        }),
      );
      rcpnSttsList.push(item);
    }
    Promise.all(callRtrvExmnPrscList)
      .then(result => {
        for (let i = 0; i < result.length; i++) {
          const { resultData, resultCode } = result[i];
          if (resultCode !== 200) throw resultCode;
          dataProvider.addRows(resultData.map(row => ({ ...rcpnSttsList[i], ...row })));
        }
      })
      .catch(() => {
        dataProvider.clearRows();
        setSnackbar({
          open: true,
          type: "warning",
          message: Message.networkFail,
        });
      })
      .finally(() => {
        const disabled = dataProvider.getRowCount() < 1;
        setDisabled(disabled);
        if (!disabled) gridViewRef.current.checkAll(true, false, true, false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <LUXButton label="바코드 출력" onClick={() => setOpen(true)} />
      {withPortal(
        <LUXDialog onRequestClose handleOnReqeustClose={handleCancel} handleOnEscClose={handleCancel} dialogOpen={open}>
          <div className="dialog_content">
            <div className="dialog_data">
              <div className="dialog_data_tit">
                <h1 className="txtcnt">바코드 출력</h1>
                <button type="button" className="LUX_basic_btn btn_clr" onClick={handleCancel}>
                  <span className="sp_lux">닫기</span>
                </button>
              </div>
              <div className="dialog_data_area noline mgt10">
                <div className="MSC_020100_P02-grid" ref={realGridElemRef} />
              </div>
            </div>
            <div className="dialog_btnbx">
              <LUXButton label="취소" useRenewalStyle type="confirm" onClick={handleCancel} />
              <LUXButton
                label="출력"
                useRenewalStyle
                type="confirm"
                onClick={handlePrint}
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
MSC_020100_P02.propTypes = {
  stateList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setSnackbar: PropTypes.func.isRequired,
  rcpnSttsGridView: PropTypes.instanceOf(GridView).isRequired,
};
