import React, { useEffect } from "react";
import { LUXButton, LUXDialog } from "luna-rocket";
import "assets/style/MSC_100100_P01.scss";
import withPortal from "hoc/withPortal";
import Editor from "./MSC_100100_P01_Editor";
import useMSC100100P01Store from "./store";
import Tree from "./MSC_100100_P01_Tree";
import Confirm from "./MSC_100100_P01_Confirm";
import Snackbar from "./MSC_100100_P01_Snackbar";

/**
 * @name 검사소견팝업
 */
export default React.memo(
  ({ opnnType = "L", dialogOpen = false, onClose = () => {}, onCopy = () => {}, ...rest }) => {
    const initialize = useMSC100100P01Store(state => state.popup.initialize);
    const getSelectFieldCmcd = useMSC100100P01Store(state => state.api.getSelectFieldCmcd);
    const inputState = useMSC100100P01Store(state => state.opnn.inputState);

    const handleCopy = () => {
      if (inputState.exmn_opnn_sqno) {
        onCopy && onCopy(inputState);
        onClose();
      }
    };

    const handleClose = () => {
      onClose();
    };

    useEffect(() => {
      if (dialogOpen) {
        initialize({ opnnType });
        getSelectFieldCmcd();
      }
    }, [dialogOpen, getSelectFieldCmcd, initialize, opnnType]);

    return (
      dialogOpen && (
        <>
          {withPortal(
            <LUXDialog
              title="검사소견"
              dialogOpen={dialogOpen}
              handleOnButtonClose={onClose}
              handleOnRequestClose={onClose}
              handleOnEscClose={onClose}
              {...rest}
              onRequestClose
            >
              <div className="dialog_content xg MSC_100100 MSC_100100_P01">
                <div className="dialog_data">
                  <div className="dialog_data_tit">
                    <h1 className="txtcnt">검사소견</h1>
                    <button type="button" className="LUX_basic_btn btn_clr" onClick={onClose}>
                      <span className="sp_lux">닫기</span>
                    </button>
                  </div>
                  <div className="dialog_data_area noline">
                    <div className="binder">
                      <Tree />
                    </div>
                    <div className="binder">
                      <Editor />
                    </div>
                  </div>
                </div>
                <div className="dialog_btnbx">
                  <LUXButton label="취소" useRenewalStyle type="confirm" onClick={handleClose} />
                  <LUXButton
                    label="복사"
                    useRenewalStyle
                    type="confirm"
                    onClick={handleCopy}
                    blue={inputState.exmn_opnn_sqno}
                    disabled={!inputState.exmn_opnn_sqno}
                  />
                </div>
              </div>
              <Snackbar />
            </LUXDialog>,
            "dialog",
          )}
          <Confirm />
        </>
      )
    );
  },
  ({ oldDialogOpen }, { newDialogOpen }) => oldDialogOpen !== newDialogOpen,
);
