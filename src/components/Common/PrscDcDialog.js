import React, { useState } from "react";
import { LUXButton, LUXDialog, LUXSelectField, LUXTextArea, LUXSnackbar } from "luna-rocket";
import callApi from "services/apis";
import withPortal from "hoc/withPortal";
import moment from "moment";
import Message from "./Message";
import useLoadingStore from "services/utils/zustand/useLoadingStore";

/**
 * @name DC 요청
 * @author 김령은
 * @history 2023.11.02 DC 상태 api 반영(윤서영)
 * @history 2023-12-27 D/C요청 알림 api 반영(윤서영)
 */

const OBJ_DTL_LIST = [
  { value: 0, text: "처방오류" },
  { value: 1, text: "환자요청" },
  { value: 2, text: "직접입력" },
];

export default function PrscDcDialog(props) {
  const { open, handleClose, ptInfo, dcList, handleSave, type, exrmClsfCd } = props;

  const isPt = type === "MSC_060100";

  const [state, setState] = useState({
    valueDdlSelect: 0,
    valueMultiText: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });
  const { openLoading, closeLoading } = useLoadingStore(state => state);

  const initialState = () => {
    setState(prevState => ({ ...prevState, valueDdlSelect: 0, valueMultiText: "" }));
  };

  const handleChoiceDataObject = (value, text) => {
    setState(prevState => ({ ...prevState, valueDdlSelect: value }));
  };

  const handleChange = e => {
    setState(prevState => ({ ...prevState, valueMultiText: e.target.value }));
  };

  const handleCancel = () => {
    initialState();
    handleClose();
  };

  const handleConfirm = async () => {
    const url = isPt ? "/MSC_060000/updateDcRqstY" : "/exam/dcPrsc";

    const timeout = setTimeout(() => openLoading(Message.sendNoti), 300);

    await callApi(url, {
      type: "DcRequest",
      detailsList: dcList,
      exrmClsfCd,
      date: moment(ptInfo.mdcr_date || new Date()).format("YYYY-MM-DD"),
      ptNm: ptInfo.pt_nm,
      dcResn:
        state.valueDdlSelect === 2
          ? state.valueMultiText
          : OBJ_DTL_LIST.find(list => list.value === state.valueDdlSelect).text,
    })
      .then(({ resultCode }) => {
        if (resultCode === 200) {
          setSnackbar({
            type: "success",
            message: Message.prscDcSuccess,
            open: true,
          });
          handleClose();
          handleSave && handleSave();
          initialState();
        } else {
          setSnackbar({
            type: "warning",
            message: Message.networkFail,
            open: true,
          });
        }
      })
      .catch(e => {
        setSnackbar({
          type: "warning",
          message: Message.networkFail,
          open: true,
        });
      })
      .finally(() => {
        closeLoading();
        clearTimeout(timeout);
      });
  };

  return (
    <>
      {withPortal(
        <LUXDialog onRequestClose handleOnEscClose={handleClose} dialogOpen={open} handleOnReqeustClose={handleClose}>
          <div className="dialog_content ssm">
            <div className="dialog_data">
              <div className="dialog_data_tit">
                <h1 className="txtcnt">D/C 요청 사유</h1>
                <button type="button" className="LUX_basic_btn btn_clr" onClick={handleCancel}>
                  <span className="sp_lux">닫기</span>
                </button>
              </div>
              <div className="dialog_data_area noline mgt10">
                <div className="dialog_data_section">
                  <LUXSelectField
                    checkObjectList
                    selectFieldData={OBJ_DTL_LIST}
                    defaultData={state.valueDdlSelect}
                    handleChoiceData={handleChoiceDataObject}
                    fullWidth
                    listAutoHeight
                  />
                </div>
                <div className="dialog_data_section">
                  <LUXTextArea
                    defaultValue={state.valueMultiText}
                    hintText="D/C 사유를 입력하세요."
                    onChange={handleChange}
                    disabled={state.valueDdlSelect !== 2}
                    fullWidth
                    style={{ height: "290px" }}
                    resize={false}
                  />
                </div>
              </div>
            </div>
            <div className="dialog_btnbx">
              <LUXButton label="취소" useRenewalStyle type="confirm" onClick={handleCancel} />
              <LUXButton label="확인" useRenewalStyle type="confirm" onClick={handleConfirm} blue />
            </div>
          </div>
        </LUXDialog>,
        "dialog",
      )}
      {withPortal(
        <LUXSnackbar
          message={snackbar.message}
          onRequestClose={() => setSnackbar({ ...snackbar, open: false })}
          open={snackbar.open}
          type={snackbar.type}
          autoHideDuration={2000}
        />,
        "snackbar",
      )}
    </>
  );
}
