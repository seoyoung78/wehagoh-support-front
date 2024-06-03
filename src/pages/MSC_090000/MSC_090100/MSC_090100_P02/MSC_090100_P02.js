import React, { useEffect, useRef, useState } from "react";

// util
import withPortal from "hoc/withPortal";
import { GridView, LocalDataProvider, RowState } from "realgrid";
import { columns, fields } from "./MSC_090100_P02_Grid";
import Message from "components/Common/Message";
import moment from "moment";
import callApi from "services/apis";
import { date } from "common-util/utils";

// common-ui-components
import { LUXAlert, LUXButton, LUXConfirm, LUXDialog, LUXSnackbar } from "luna-rocket";
import { configEmptySet } from "services/utils/grid/RealGridUtil";

// css

// imgs

/**
 * @name 단위설정 팝업
 * @author 윤서영
 */
export default function MSC_090100_P02({ open = false, prscCd = "", onClose = () => {}, onSave = () => {} }) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [isDisabled, setIsDisabled] = useState(true);

  const [snack, setSnack] = useState(false); // 스낵바 상태
  const [confirm, setConfirm] = useState(false); // 컴펌창 상태
  const [alert, setAlert] = useState({ open: false, title: "", message: "", type: "info" }); // 알럿창 상태

  const gridRef = useRef(null); // realgrid DOM
  const dataProvider = useRef(null);
  const gridView = useRef(null);

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handleLoad = async () => {
    await callApi("/common/selectCommonCode", { clsfList: ["CS1003"], date: date.getyyyymmdd(new Date()) }).then(
      ({ resultData }) => {
        gridView.current.setColumn({
          ...gridView.current.columnByName("exmn_rslt_uncd"),
          values: resultData.map(item => item.cmcd_cd),
          labels: resultData.map(item => item.cmcd_nm),
          editor: {
            type: "dropdown",
            textReadOnly: true,
            dropDownWhenClick: true,
          },
        });
      },
    );
  };

  // 추가 버튼 클릭 이벤트
  const handleAdd = () => {
    dataProvider.current.insertRow(0, { strt_date: new Date(), end_date: new Date("2999-12-31"), unit_rmrk: "" });
  };

  const handleClose = () => {
    if (isDisabled) {
      onClose();
    } else {
      setConfirm(true);
    }
  };

  //  Null, undefined 체크
  const isNullish = function (value) {
    return (value ?? true) === true;
  };

  // 문자열 빈값 체크
  const isEmpty = function (value) {
    return isNullish(value) ? true : value === "";
  };

  const handleCheck = list => {
    if (list.some(item => isEmpty(item.exmn_rslt_uncd) || isEmpty(item.strt_date) || isEmpty(item.end_date))) {
      setAlert({
        open: true,
        title: "입력 내용 확인 필요",
        message:
          (list.some(item => isEmpty(item.exmn_rslt_uncd))
            ? "단위"
            : list.some(item => isEmpty(item.strt_date))
            ? "적용시작일"
            : "적용종료일") + " 값이 입력되지 않아 저장할 수 없습니다.",
        type: "warning",
      });
      return false;
    }

    let checkDate = list.some(item => item.strt_date > item.end_date);
    if (checkDate) {
      setAlert({
        open: true,
        title: "적용시작일/종료일 수정 필요",
        message: "적용시작일이 종료일보다 클 수 없습니다.",
        type: "warning",
      });
      return false;
    }

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (
          (list[i].strt_date >= list[j].strt_date && list[i].strt_date <= list[j].end_date) ||
          (list[i].end_date >= list[j].strt_date && list[i].end_date <= list[j].end_date)
        ) {
          checkDate = true;
          break;
        }
      }
      if (checkDate) {
        setAlert({
          open: true,
          title: "적용 시작일/종료일 수정 필요",
          message: "적용일이 중복되었습니다.",
          type: "warning",
        });
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    const list = dataProvider.current.getJsonRows(0, -1, true);

    if (handleCheck(list)) {
      list.map(item => {
        item.prsc_cd = prscCd;
        item.strt_date = moment(item.strt_date).format("YYYY-MM-DD");
        item.end_date = moment(item.end_date).format("YYYY-MM-DD");
        if (item.__rowState === RowState.CREATED) {
          item.origin_strt_date = item.strt_date;
        }
        return item;
      });
      const uncd =
        list.find(
          item =>
            item.strt_date <= moment(new Date()).format("YYYY-MM-DD") &&
            item.end_date >= moment(new Date()).format("YYYY-MM-DD"),
        )?.exmn_rslt_uncd || "";

      await callApi("/MSC_090100/saveUnit", {
        unitList: list.filter(item => item.__rowState === RowState.CREATED || item.__rowState === RowState.UPDATED),
      }).then(({ resultCode }) => {
        if (resultCode === 200) {
          setSnack(true);
        }
        onSave(uncd);
      });
    }
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    const container = gridRef.current;
    const dataSource = new LocalDataProvider(true);
    const gv = new GridView(container);

    gv.setDataSource(dataSource);
    dataSource.setFields(fields);
    gv.setColumns(columns);

    gv.setDisplayOptions({
      showEmptyMessage: true,
      emptyMessage: Message.noData,
      fitStyle: "evenFill",
      columnMovable: false,
      selectionStyle: "singleRow",
    });
    gv.setFilteringOptions({ enabled: false });
    gv.checkBar.visible = false; // 체크박스 X
    gv.footer.visible = false; // 푸터 X
    gv.stateBar.visible = false; // 상태바 X
    gv.sortingOptions.enabled = false; // 정렬 x
    gv.pasteOptions.enabled = false;
    gv.setCopyOptions({ copyDisplayText: true, singleMode: true });
    gv.setRowIndicator({ displayValue: "reverse" });
    gv.editOptions.commitByCell = true;
    gv.editOptions.commitWhenLeave = true;

    configEmptySet(gv, container, Message.noData);
    dataSource.setRows([]);

    dataSource.onDataChanged = provider => {
      const createdIdxs = provider.getStateRows(RowState.CREATED); // 신규 생성
      const updatedIdx = provider.getStateRows(RowState.UPDATED); // 수정
      if (createdIdxs.length < 1 && updatedIdx.length < 1) {
        setIsDisabled(true);
      } else {
        setIsDisabled(false);
      }
    };

    dataProvider.current = dataSource;
    gridView.current = gv;

    handleLoad();
    return () => {
      dataSource.clearRows();
      gv.destroy();
      dataSource.destroy();
    };
  }, []);

  useEffect(() => {
    if (open) {
      (async () => {
        await callApi("/MSC_090100/selectUnitList", { prsc_cd: prscCd }).then(({ resultData }) => {
          if (resultData) {
            dataProvider.current.setRows(resultData);
          } else {
            dataProvider.current.clearRows();
          }
        });
      })();
    } else {
      dataProvider.current.clearRows();
      setIsDisabled(true);
    }
  }, [open]);

  /* ================================================================================== */
  /* render() */
  return (
    <>
      {withPortal(
        <LUXDialog
          dialogOpen={open}
          handleOnEscClose={handleClose}
          onRequestClose={isDisabled}
          handleOnRequestClose={handleClose}
        >
          <div className="dialog_content md">
            <div className="dialog_data">
              <div className="dialog_data_tit">
                <h1 className="txtcnt">단위 설정</h1>
                <button type="button" className="LUX_basic_btn btn_clr" onClick={handleClose}>
                  <span className="sp_lux">닫기</span>
                </button>
              </div>
            </div>
            <div className="dialog_data_area noline mgt10">
              <div className="dialog_data_section">
                <div className="basic_headtitle_wrap">
                  <h2>단위 설정 및 이력</h2>
                  <div className="btnbox">
                    <LUXButton label="추가" type="small" onClick={handleAdd} />
                  </div>
                </div>
              </div>
              <div className="dialog_data_section">
                <div className="grid_box" ref={gridRef} style={{ height: "300px" }} />
              </div>
            </div>
            <div className="dialog_btnbx">
              <LUXButton label="닫기" useRenewalStyle type="confirm" onClick={handleClose} />
              <LUXButton
                label="저장"
                useRenewalStyle
                type="confirm"
                onClick={handleSave}
                blue={!isDisabled}
                disabled={isDisabled}
              />
            </div>
          </div>
        </LUXDialog>,
        "dialog",
      )}

      {withPortal(
        <LUXSnackbar open={snack} message={Message.save} type="success" onRequestClose={() => setSnack(false)} />,
        "snackbar",
      )}

      {withPortal(
        <LUXConfirm
          open={confirm}
          title={Message.MSC_090100_unSaveTitle}
          message={Message.MSC_090100_unSaveMessage}
          useIcon
          useIconType="question"
          confirmButton={() => {
            setConfirm(false);
            handleSave();
          }}
          cancelButton={() => {
            setConfirm(false);
            onClose();
          }}
          onClose={() => setConfirm(false)}
        />,
        "dialog",
      )}

      {withPortal(
        <LUXAlert
          open={alert.open}
          title={alert.title}
          message={alert.message}
          useIcon
          useIconType={alert.type}
          confirmButton={() => setAlert({ ...alert, open: false })}
          onClose={() => setAlert({ ...alert, open: false })}
        />,
        "dialog",
      )}
    </>
  );
}
