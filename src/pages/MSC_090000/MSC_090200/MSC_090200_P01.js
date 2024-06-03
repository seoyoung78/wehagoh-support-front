import React, { useCallback, useEffect, useRef, useState } from "react";

// util
import withPortal from "hoc/withPortal";
import PropTypes from "prop-types";
import Message from "components/Common/Message";
import { GridView, LocalDataProvider } from "realgrid";
import callApi from "services/apis";
import { lodash } from "common-util/utils";
import {
  appendOnDataLoadComplated,
  configEmptySet,
  isLastOnDataLoadComplated,
  removeOnDataLoadComplated,
} from "services/utils/grid/RealGridUtil";

// common-ui-components
import { LUXAlert, LUXButton, LUXCheckBox, LUXDialog, LUXSnackbar } from "luna-rocket";
import { popColumns, popFields } from "./MSC_090200_Grid";

// css
import "assets/style/MSC_090200.scss";

// imgs

/**
 * @name 검체코드관리 - 용기목록 팝업
 * @author 윤서영
 */
export default function MSC_090200_P01(props) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const { open, data, onClose, onSave, spcmList } = props;

  const [isUse, setIsUse] = useState(false);

  const [changeList, setChangeList] = useState([]);

  const gridRef = useRef(null); // realgrid DOM
  const dataProvider = useRef(null);
  const gridView = useRef(null);

  const [snack, setSnack] = useState({ open: false, message: "", type: "info" }); // 스낵바 상태
  const [alert, setAlert] = useState({
    open: false,
    title: "용기 사용중",
    message: Message.MSC_090200_useCtnr,
    type: "error",
  }); // 알럿창 상태

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handleFilter = useCallback(() => {
    gridView.current.activateColumnFilters("use_yn", "N", isUse);

    // const index = gridView.current.searchItem({
    //   fields: ["value"],
    //   values: [originSet.spcm_cd],
    // });

    // if (lodash.isEqual(defaultData, originSet) || index < 0) {
    //   gridView.current.clearCurrent();
    // }
  }, [isUse]);

  // 확인버튼 클릭
  const handleSave = async () => {
    const parameters = changeList.map(list => {
      list.ctnr_cd = list.value;
      list.ctnr_labl_nm = list.text;
      list.ctnr_use_yn = list.use_yn;
      return list;
    });
    await callApi("/MSC_090200/saveCtnrList", { changeList: parameters })
      .then(({ resultCode }) => {
        if (resultCode === 200) {
          setSnack({ open: true, message: Message.save, type: "success" });
          onSave();
        } else {
          setSnack({ open: true, message: Message.networkFail, type: "warning" });
        }
      })
      .catch(e => setSnack({ open: true, message: Message.networkFail, type: "warning" }));
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    const container = gridRef.current;
    const dataSource = new LocalDataProvider(true);
    const gv = new GridView(container);

    gv.setDataSource(dataSource);
    dataSource.setFields(popFields);
    gv.setColumns(popColumns);

    gv.setEditOptions({ movable: false, readOnly: true, deletable: false, editable: false });
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

    gv.setColumnFilters("use_yn", [{ name: "N", criteria: "value = 'N'" }]);

    configEmptySet(gv, container, Message.noData);
    dataSource.setRows([]);

    dataProvider.current = dataSource;
    gridView.current = gv;

    return () => {
      dataSource.clearRows();
      gv.destroy();
      dataSource.destroy();
    };
  }, []);

  useEffect(() => {
    if (open) {
      dataProvider.current.setRows(lodash.cloneDeep(data));
    }
    return () => {
      setChangeList([]);
      setIsUse(false);
    };
  }, [open]);

  useEffect(() => {
    handleFilter();
  }, [isUse]);

  useEffect(() => {
    if (!isLastOnDataLoadComplated(gridView.current)) {
      removeOnDataLoadComplated(gridView.current);
    }
    appendOnDataLoadComplated(gridView.current, () => handleFilter());
  }, [handleFilter]);

  useEffect(() => {
    gridView.current.onCellClicked = (grid, clickData) => {
      if (clickData.column === "use_yn") {
        const values = grid.getValues(clickData.itemIndex);

        if (values) {
          // 다른 검체에서 사용중인 경우
          if (spcmList.findIndex(list => list.ctnr_cd === values.value) > -1) {
            setAlert({ ...alert, open: true });
          }
          // 미사용 변경 했던 경우
          else if (changeList.length > 0 && changeList.find(list => list.value === values.value) !== undefined) {
            grid.setValue(clickData.itemIndex, "use_yn", values.use_yn === "Y" ? "N" : "Y");
            setChangeList(changeList.filter(list => list.value !== values.value));
          } else {
            let origin = lodash.cloneDeep(data).find(list => list.value === values.value);
            origin.use_yn = origin.use_yn === "Y" ? "N" : "Y";
            grid.setValue(clickData.itemIndex, "use_yn", origin.use_yn);
            setChangeList(changeList.concat(origin));
          }
        }
      }
    };
  }, [spcmList, changeList]);

  /* ================================================================================== */
  /* render() */
  return (
    <>
      {withPortal(
        <LUXDialog dialogOpen={open} handleOnEscClose={onClose} onRequestClose handleOnRequestClose={onClose}>
          <div className="dialog_content md">
            <div className="dialog_data">
              <div className="dialog_data_tit">
                <h1 className="txtcnt">용기목록</h1>
                <button type="button" className="LUX_basic_btn btn_clr" onClick={onClose}>
                  <span className="sp_lux">닫기</span>
                </button>
              </div>
              <div className="dialog_data_area noline mgt10">
                <div className="dialog_data_section">
                  <div className="basic_headtitle_wrap">
                    <div className="btnbox">
                      <LUXCheckBox
                        labelText="미사용 용기만 표시"
                        checked={isUse}
                        onCheck={(e, checked) => setIsUse(checked)}
                      />
                    </div>
                  </div>
                </div>
                <div className="dialog_data_section">
                  <div className="grid_box" ref={gridRef} style={{ height: "300px" }} />
                </div>
              </div>
            </div>
            <div className="dialog_btnbx">
              <LUXButton label="취소" useRenewalStyle type="confirm" onClick={onClose} />
              <LUXButton
                label="저장"
                useRenewalStyle
                type="confirm"
                onClick={handleSave}
                blue={changeList.length > 0}
                disabled={changeList.length === 0}
              />
            </div>
          </div>
        </LUXDialog>,
        "dialog",
      )}

      {withPortal(
        <LUXSnackbar
          open={snack.open}
          message={snack.message}
          type={snack.type}
          onRequestClose={() => setSnack({ ...snack, open: false })}
        />,
        "snackbar",
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

MSC_090200_P01.prototype = {
  open: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  spcmList: PropTypes.arrayOf(PropTypes.object),
};

MSC_090200_P01.defaultProps = {
  open: false,
  data: [],
  onClose: () => {},
  onSave: () => {},
  spcmList: [],
};
