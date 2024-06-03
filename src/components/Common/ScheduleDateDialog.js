import React, { useEffect, useState } from "react";

// util
import withPortal from "hoc/withPortal";
import PropTypes from "prop-types";
import moment from "moment";
import callApi from "services/apis";

// common-ui-components
import { LUXButton, LUXDateTimePicker, LUXDialog, LUXSnackbar } from "luna-rocket";
import Message from "./Message";

// css

// imgs

/**
 * @name 검사희망일 예약
 * @author 윤서영
 */
export default function ScheduleDateDialog(props) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const { open, data, ptInfo, onClose, onSave, type } = props;
  const [date, setDate] = useState(new Date()); // 검사희망일
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" }); // 스낵바 상태

  /* ================================================================================== */
  /* 함수(function) 선언 */
  // 변경 당일 선택x
  const handleDate = e => {
    const compareDate = new Date(); // 현재 시간 이전 비활성화
    compareDate.setSeconds(0); // 초는 비교 대상에서 제외
    return e.getTime() < compareDate.getTime();
  };

  // 예약 저장
  const handleSave = async () => {
    const changeDate = moment(date).format("YYYYMMDD");
    const param = data
      .filter(list => list.prsc_prgr_stat_cd === "B")
      .map(list => {
        list.exmn_hope_dt = moment(date).format("YYYY-MM-DD HH:mm:ss");
        list.exmn_hope_date = changeDate;
        return list;
      });
    const url = type ? "/MSC_060000/updateMdtrHopeDate" : "/common/updateExmnHopeDate";

    await callApi(url, param).then(() => {
      setSnack({ open: true, type: "success", message: Message.appointmet });
      onSave(changeDate);
    });
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    if (open) {
      setDate(new Date());
    }
  }, [open]);

  /* ================================================================================== */
  /* render() */
  return (
    <>
      {withPortal(
        <LUXDialog dialogOpen={open} handleOnEscClose={onClose} onRequestClose handleOnRequestClose={onClose}>
          <div className="dialog_content xs">
            <div className="dialog_data">
              <div className="dialog_data_tit">
                <h1 className="txtcnt">{type ? "치료희망일 변경" : "검사희망일 예약"}</h1>
                <button type="button" className="LUX_basic_btn btn_clr" onClick={onClose}>
                  <span className="sp_lux">닫기</span>
                </button>
              </div>
              <div className="dialog_data_area noline mgt10">
                <div className="dialog_data_section">
                  <div className="LUX_basic_tbl">
                    <table className="tblarea2 tblarea2_v2">
                      <colgroup>
                        <col width="125px" />
                        <col />
                      </colgroup>
                      <tbody>
                        <tr>
                          <th scope="row" className="nfont">
                            환자명
                          </th>
                          <td className="nfont">
                            <div className="inbx">{ptInfo.pt_nm}</div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="nfont">
                            환자번호
                          </th>
                          <td className="nfont">
                            <div className="inbx">{ptInfo.pid}</div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="nfont">
                            진료일자
                          </th>
                          <td className="nfont">
                            <div className="inbx">{moment(ptInfo.prsc_date).format("YYYY-MM-DD")}</div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="nfont">
                            예약일자/시간
                          </th>
                          <td className="nfont">
                            <div className="inbx">
                              <LUXDateTimePicker
                                datePickerProps={{
                                  dateFormatSeparator: "-",
                                }}
                                value={date}
                                onChange={e => setDate(e)}
                                shouldDisableDateTime={handleDate}
                                fullWidth
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="dialog_btnbx">
              <LUXButton label="취소" useRenewalStyle type="confirm" onClick={onClose} />
              <LUXButton label="확인" useRenewalStyle type="confirm" onClick={handleSave} blue />
            </div>
          </div>
        </LUXDialog>,
        "dialog",
      )}
      {withPortal(
        <LUXSnackbar
          open={snack.open}
          type={snack.type}
          message={snack.message}
          onRequestClose={() => setSnack({ ...snack, open: false })}
        />,
        "snackbar",
      )}
    </>
  );
}

ScheduleDateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  ptInfo: PropTypes.shape({}),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  type: PropTypes.bool,
};
ScheduleDateDialog.defaultProps = {
  data: [
    {
      exmn_hope_date: "",
      exmn_hope_dt: "",
    },
  ],
  ptInfo: { pid: "", mdcr_date: "", pt_nm: "" },
  type: false,
};
