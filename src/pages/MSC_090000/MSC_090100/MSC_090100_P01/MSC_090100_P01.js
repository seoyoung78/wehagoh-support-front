import React, { useEffect, useRef, useState } from "react";

// util
import withPortal from "hoc/withPortal";
import { GridView, LocalDataProvider, RowState } from "realgrid";
import { columns, fields } from "./MSC_090100_P01_Grid";
import Message from "components/Common/Message";

// common-ui-components
import { LUXAlert, LUXButton, LUXConfirm, LUXDialog, LUXSnackbar } from "luna-rocket";
import { configEmptySet } from "services/utils/grid/RealGridUtil";
import callApi from "services/apis";
import moment from "moment";
import { date } from "common-util/utils";

// css

// imgs

/**
 * @name 참고치 이력 팝업
 * @author 윤서영
 */
export default function MSC_090100_P01({
  open = false,
  type = "R",
  prscCd = "",
  onClose = () => {},
  readOnly = false,
}) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [isDisabled, setIsDisabled] = useState(true);

  const [snack, setSnack] = useState(false); // 스낵바 상태
  const [confirm, setConfirm] = useState(false); // 컴펌창 상태
  const [alert, setAlert] = useState({ open: false, title: "", message: "", type: "info" }); // 알럿창 상태

  const gridRef = useRef(null); // realgrid DOM
  const dataProvider = useRef(null);
  const gridView = useRef(null);
  const title = type === "R" ? "참고치" : "CVR";

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handleLoad = async () => {
    await callApi("/common/selectCommonCode", {
      clsfList: ["CS1016", "CS1017", "CS1018", "CS1019"],
      date: date.getyyyymmdd(new Date()),
    }).then(({ resultData }) => {
      gridView.current.setColumn({
        ...gridView.current.columnByName("sex_dvsn_cd"),
        values: resultData.filter(item => item.cmcd_clsf_cd === "CS1016").map(item => item.cmcd_cd),
        labels: resultData.filter(item => item.cmcd_clsf_cd === "CS1016").map(item => item.cmcd_nm),
        editor: {
          type: "dropdown",
          textReadOnly: true,
          dropDownWhenClick: true,
        },
      });
      gridView.current.setColumn({
        ...gridView.current.columnByName("rfvl_age_clsf_cd"),
        values: resultData.filter(item => item.cmcd_clsf_cd === "CS1017").map(item => item.cmcd_cd),
        labels: resultData.filter(item => item.cmcd_clsf_cd === "CS1017").map(item => item.cmcd_nm),
        editor: {
          type: "dropdown",
          textReadOnly: true,
          dropDownWhenClick: true,
        },
      });
      gridView.current.setColumn({
        ...gridView.current.columnByName("age_lwlm_rang_type_cd"),
        values: resultData.filter(item => item.cmcd_clsf_cd === "CS1018").map(item => item.cmcd_cd),
        labels: resultData.filter(item => item.cmcd_clsf_cd === "CS1018").map(item => item.cmcd_nm),
        editor: {
          type: "dropdown",
          textReadOnly: true,
          dropDownWhenClick: true,
        },
      });
      gridView.current.setColumn({
        ...gridView.current.columnByName("age_uplm_rang_type_cd"),
        values: resultData.filter(item => item.cmcd_clsf_cd === "CS1019").map(item => item.cmcd_cd),
        labels: resultData.filter(item => item.cmcd_clsf_cd === "CS1019").map(item => item.cmcd_nm),
        editor: {
          type: "dropdown",
          textReadOnly: true,
          dropDownWhenClick: true,
        },
      });
      gridView.current.setColumn({
        ...gridView.current.columnByName("rfvl_lwlm_rang_type_cd"),
        values: resultData.filter(item => item.cmcd_clsf_cd === "CS1018").map(item => item.cmcd_cd),
        labels: resultData.filter(item => item.cmcd_clsf_cd === "CS1018").map(item => item.cmcd_nm),
        editor: {
          type: "dropdown",
          dropDownWhenClick: true,
          domainOnly: true,
        },
      });
      gridView.current.setColumn({
        ...gridView.current.columnByName("rfvl_uplm_rang_type_cd"),
        values: resultData.filter(item => item.cmcd_clsf_cd === "CS1019").map(item => item.cmcd_cd),
        labels: resultData.filter(item => item.cmcd_clsf_cd === "CS1019").map(item => item.cmcd_nm),
        editor: {
          type: "dropdown",
          dropDownWhenClick: true,
          domainOnly: true,
        },
      });
    });
  };

  const handleAdd = () => {
    dataProvider.current.insertRow(0, {
      rfvl_rmrk: "",
      rfvl_lwlm_valu: "",
      rfvl_lwlm_rang_type_cd: "",
      rfvl_uplm_valu: "",
      rfvl_uplm_rang_type_cd: "",
      strt_date: new Date(),
      end_date: new Date("2999-12-31"),
      rfvl_dvsn_cd: type,
      inpt_sqno: dataProvider.current.getRowCount() + 1,
    });
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

  // 숫자 체크
  const isNumber = value => Number.isNaN(value);

  const dateFormating = ({ rfvl_age_clsf_cd, lwlm_rang_age, uplm_rang_age }) => {
    let type = "";
    switch (rfvl_age_clsf_cd) {
      case "m":
      case "M":
        type = "M";
        break;
      default:
        type = rfvl_age_clsf_cd.toLowerCase();
        break;
    }

    const lage = moment(new Date()).add(lwlm_rang_age, type).toDate();
    const uage = moment(new Date()).add(uplm_rang_age, type).toDate();

    return { lage, uage };
  };

  // 유효성 체크
  const handleValidate = list => {
    // 상한치/하한치 체크
    const checkRef = list.some(
      item =>
        !isEmpty(item.rfvl_lwlm_valu) &&
        !isEmpty(item.rfvl_uplm_valu) &&
        !isNumber(item.rfvl_lwlm_valu) &&
        !isNumber(item.rfvl_uplm_valu) &&
        Number.parseFloat(item.rfvl_lwlm_valu) >= Number.parseFloat(item.rfvl_uplm_valu),
    );
    if (checkRef) {
      setAlert({
        open: true,
        title: title + " 상하한치 수정 필요",
        message: "하한치는 상한치보다 같거나 클 수 없습니다.",
        type: "warning",
      });
      return false;
    }

    // 적용일자 체크
    if (list.some(item => item.strt_date > item.end_date)) {
      setAlert({
        open: true,
        title: "적용시작일/종료일 수정 필요",
        message: "적용시작일이 종료일보다 클 수 없습니다.",
        type: "warning",
      });
      return false;
    }

    let checkAge = list.some(item => Number.parseFloat(item.lwlm_rang_age) >= Number.parseFloat(item.uplm_rang_age)); // 연령 체크
    if (checkAge) {
      setAlert({
        open: true,
        title: "나이 상하한치 수정 필요",
        message: "하한치는 상한치보다 같거나 클 수 없습니다.",
        type: "warning",
      });
      return false;
    }

    let checkDate = false;
    for (let i = 0; i < list.length; i++) {
      const iage = dateFormating(list[i]);
      for (let j = i + 1; j < list.length; j++) {
        const jage = dateFormating(list[j]);
        // 성별 코드가 같을 경우
        if (list[i].sex_dvsn_cd === list[j].sex_dvsn_cd) {
          checkDate =
            (list[i].strt_date >= list[j].strt_date && list[i].strt_date <= list[j].end_date) ||
            (list[i].end_date >= list[j].strt_date && list[i].end_date <= list[j].end_date);

          if (checkDate) {
            // 모두 기준치 이상, 이하
            if (
              list[i].age_lwlm_rang_type_cd === "M" &&
              list[j].age_uplm_rang_type_cd === "B" &&
              list[j].age_lwlm_rang_type_cd === "M" &&
              list[i].age_uplm_rang_type_cd === "B"
            ) {
              if (
                (iage.lage >= jage.lage && iage.lage <= jage.uage) ||
                (iage.uage >= jage.lage && iage.uage <= jage.uage)
              ) {
                checkAge = true;
                break;
              }
            }
            // i 하나라도 이상, 이하 & j 하나라도 이상, 이하
            if (
              (list[i].age_lwlm_rang_type_cd === "M" &&
                ((list[j].age_lwlm_rang_type_cd === "M" && iage.lage >= jage.lage && iage.lage < jage.uage) ||
                  (list[j].age_uplm_rang_type_cd === "B" && iage.lage > jage.lage && iage.lage <= jage.uage))) ||
              (list[i].age_uplm_rang_type_cd === "B" &&
                ((list[j].age_lwlm_rang_type_cd === "M" && iage.uage >= jage.lage && iage.uage < jage.uage) ||
                  (list[j].age_uplm_rang_type_cd === "B" && iage.uage > jage.lage && iage.uage <= jage.uage)))
            ) {
              checkAge = true;
              break;
            }
            // 모든 기준치 초과, 미만
            else if (
              (iage.lage > jage.lage && iage.lage < jage.uage) ||
              (iage.uage > jage.lage && iage.uage < jage.uage)
            ) {
              checkAge = true;
              break;
            }
          }
        }
      }
      if (checkAge) {
        setAlert({
          open: true,
          title: "나이 상하한치 수정 필요",
          message: "나이 상/하한치 범위가 중복되었습니다.",
          type: "warning",
        });
        return false;
      }
    }

    return true;
  };

  // 필수값 체크
  const handleCheck = list => {
    for (const item of list) {
      const index = Object.values(item).findIndex(value => isEmpty(value));
      if (index >= 0 && index < 6) {
        const key = Object.keys(item)[index];
        setAlert({
          open: true,
          title: "입력 내용 확인 필요",
          message:
            (index === 3 || index === 5 ? "나이 " : "") +
            columns.find(column => column.name === key).header +
            " 값이 입력되지 않아 저장할 수 없습니다.",
          type: "warning",
        });
        return false;
      }

      const dateValue = Object.values(item).slice(11, 13);
      if (dateValue.some(list => isEmpty(list))) {
        setAlert({
          open: true,
          title: "입력 내용 확인 필요",
          message:
            (dateValue.findIndex(value => !value) === 0 ? "적용시작일" : "적용종료일") +
            " 값이 입력되지 않아 저장할 수 없습니다.",
          type: "warning",
        });
        return false;
      }

      const lowValue = Object.values(item).slice(6, 8);
      const upValue = Object.values(item).slice(8, 10);
      let messsage = title;

      if (lowValue.every(value => isEmpty(value)) && upValue.every(value => isEmpty(value))) {
        setAlert({
          open: true,
          title: "입력 내용 확인 필요",
          message: messsage + " 상/하한치 값이 입력되지 않아 저장할 수 없습니다.",
          type: "warning",
        });
        return false;
      }

      if (lowValue.some(value => isEmpty(value)) && lowValue.some(value => !isEmpty(value))) {
        messsage += lowValue.findIndex(value => !isEmpty(value)) === 0 ? " 하한치 기준" : " 하한치";
      } else if (upValue.some(value => isEmpty(value)) && upValue.some(value => !isEmpty(value))) {
        messsage += upValue.findIndex(value => !isEmpty(value)) === 0 ? " 상한치 기준" : " 상한치";
      }

      if (messsage !== title) {
        setAlert({
          open: true,
          title: "입력 내용 확인 필요",
          message: messsage + " 값이 입력되지 않아 저장할 수 없습니다.",
          type: "warning",
        });
        return false;
      }
    }

    return handleValidate(list);
  };

  // 저장 버튼 클릭 이벤트
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

      await callApi("/MSC_090100/saveRefCvr", {
        refCvrList: list.filter(item => item.__rowState === RowState.CREATED || item.__rowState === RowState.UPDATED),
      }).then(({ resultCode }) => {
        if (resultCode === 200) {
          setSnack(true);
        }
        onClose();
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
      const idxList = provider.getStateRows(RowState.CREATED).concat(provider.getStateRows(RowState.UPDATED));

      if (idxList.length < 1) {
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
        await callApi("/MSC_090100/selectRefCvrList", { prsc_cd: prscCd, type }).then(({ resultData }) => {
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

  useEffect(() => {
    gridView.current.setEditOptions({ editable: !readOnly });
  }, [readOnly]);

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
          <div className="dialog_content">
            <div className="dialog_data">
              <div className="dialog_data_tit">
                <h1 className="txtcnt">
                  {title} {readOnly ? "조회" : "설정"}
                </h1>
                <button type="button" className="LUX_basic_btn btn_clr" onClick={handleClose}>
                  <span className="sp_lux">닫기</span>
                </button>
              </div>
              <div className="dialog_data_area noline mgt10">
                <div className="dialog_data_section">
                  <div className="basic_headtitle_wrap">
                    <h2>
                      {title} {readOnly ? "조회" : "설정"} 및 이력
                    </h2>
                    {!readOnly && (
                      <div className="btnbox">
                        <LUXButton label="추가" type="small" onClick={handleAdd} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="dialog_data_section">
                  <div className="grid_box" ref={gridRef} style={{ height: "300px", width: "1300px" }} />
                </div>
              </div>
            </div>
            <div className="dialog_btnbx">
              {readOnly ? (
                <LUXButton type="confirm" label="닫기" onClick={handleClose} />
              ) : (
                <>
                  <LUXButton type="confirm" useRenewalStyle label="닫기" onClick={handleClose} />
                  <LUXButton
                    label="저장"
                    useRenewalStyle
                    type="confirm"
                    onClick={handleSave}
                    blue={!isDisabled}
                    disabled={isDisabled}
                  />
                </>
              )}
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
