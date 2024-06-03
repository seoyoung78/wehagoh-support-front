import React, { useEffect, useState, useRef } from "react";

// util
import PropTypes from "prop-types";
import withPortal from "hoc/withPortal";
import callApi from "services/apis";
import moment from "moment";

// common-ui-components
import { LUXTimePicker, LUXDialog, LUXSnackbar, LUXButton } from "luna-rocket";
import Message from "components/Common/Message";

// css

// imgs

/**
 * @name 치료시간 수정
 * @author 김령은
 */
export default function MSC_060100_P01(props) {
  const {
    open,
    timePop: { pid, prsc_date, prsc_sqno, prsc_nm, trtm_strt_dt, trtm_end_dt, prsc_prgr_stat_cd },
    onClose,
    onSave,
  } = props;

  /* ================================================================================== */
  /* 상태(state) 선언 */
  const startOrigin = useRef("");
  const endOrigin = useRef("");
  const snackbarRef = useRef({
    message: "",
    open: false,
    type: "warning",
  });

  const [startTime, setStartTime] = useState(""); // 처치시작시간
  const [endTime, setEndTime] = useState(""); // 처치종료시간

  const [snackbar, setSnackbar] = useState({
    ...snackbarRef.current,
    onRequestOpen: (message, type) =>
      setSnackbar(prevState => ({ ...prevState, open: true, message, type: type || prevState.type })),
    onRequestClose: () => setSnackbar(prevState => ({ ...prevState, ...snackbarRef.current })),
  });

  const isEqualStart = startOrigin.current === startTime;
  const isEqualEnd = endOrigin.current === endTime;

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handleStrtChange = e => setStartTime(e);
  const handleEndChange = e => setEndTime(e);

  const combineDateTime = (dateString, timeString) => {
    // 주어진 날짜 문자열을 기반으로 Date 객체 생성
    const dateTime = new Date(dateString);

    // 주어진 시간 문자열을 파싱하여 시간 및 분 추출
    const hours = parseInt(timeString.slice(0, 2), 10);
    const minutes = parseInt(timeString.slice(2), 10);

    // Date 객체의 시간 및 분을 설정
    dateTime.setHours(hours);
    dateTime.setMinutes(minutes);
    dateTime.setSeconds(0);
    dateTime.setMilliseconds(0);

    return moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
  };

  // 예약 저장
  const handleSave = async () => {
    const params = {
      pid,
      prsc_date,
      prsc_sqno,
    };

    if (!isEqualStart) {
      const trtmStrtDt = combineDateTime(trtm_strt_dt, startTime);
      if (trtmStrtDt) params["trtm_strt_dt"] = trtmStrtDt;
    }

    if (!isEqualEnd) {
      const trtmEndDt = combineDateTime(trtm_end_dt, endTime);
      if (trtmEndDt) params["trtm_end_dt"] = trtmEndDt;
    }

    await callApi("/MSC_060000/updateTrtmDt", params)
      .then(result => {
        if (result.resultCode === 200) {
          snackbar.onRequestOpen(Message.MSC_060000_updateTrtmDt, "success");
          onSave();
        } else {
          snackbar.onRequestOpen(Message.networkFail);
        }
      })
      .catch(() => {
        snackbar.onRequestOpen(Message.networkFail);
      });
  };

  /* ================================================================================== */
  /* Hook(useEffect) */

  useEffect(() => {
    if (open) {
      // LUXTimePicker 에서 정의된 형식으로 변환('HHmm')
      const getFormattedTime = dateTimeString => {
        if (!dateTimeString) return "";

        // Date 객체 생성
        const dateTime = new Date(dateTimeString);

        // 각 부분에서 시와 분을 추출
        const hours = dateTime.getHours().toString().padStart(2, "0");
        const minutes = dateTime.getMinutes().toString().padStart(2, "0");

        // 결과 문자열 생성
        const formattedTime = `${hours}${minutes}`;

        return formattedTime;
      };

      const formattedStrt = getFormattedTime(trtm_strt_dt);
      const formattedEnd = getFormattedTime(trtm_end_dt);

      setStartTime(formattedStrt);
      setEndTime(formattedEnd);
      startOrigin.current = formattedStrt;
      endOrigin.current = formattedEnd;

      return () => {
        setStartTime("");
        setEndTime("");
        startOrigin.current = "";
        endOrigin.current = "";
      };
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
                <h1 className="txtcnt">치료시간 수정</h1>
                <button type="button" className="LUX_basic_btn btn_clr" onClick={onClose}>
                  <span className="sp_lux">닫기</span>
                </button>
              </div>
              <div className="dialog_data_area noline mgt10">
                <div className="dialog_data_section">
                  <div className="LUX_basic_tbl">
                    <table className="tblarea2 tblarea2_v2">
                      <colgroup>
                        <col width="140px" />
                        <col />
                      </colgroup>
                      <tbody>
                        <tr>
                          <th scope="row" className="nfont">
                            검사명
                          </th>
                          <td className="nfont">
                            <div className="inbx">{prsc_nm}</div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="nfont">
                            치료시작시간 수정
                          </th>
                          <td className="nfont">
                            <div className="inbx">
                              {startTime ? (
                                <LUXTimePicker time={startTime} onChange={handleStrtChange} fullWidth />
                              ) : (
                                "-"
                              )}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="nfont">
                            치료종료시간 수정
                          </th>
                          <td className="nfont">
                            <div className="inbx">
                              {endTime ? <LUXTimePicker time={endTime} onChange={handleEndChange} fullWidth /> : "-"}
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
              <LUXButton label="닫기" useRenewalStyle type="confirm" onClick={onClose} />
              <LUXButton
                label="확인"
                useRenewalStyle
                type="confirm"
                onClick={handleSave}
                blue={!isEqualStart || !isEqualEnd}
                disabled={!(!isEqualStart || !isEqualEnd)}
              />
            </div>
          </div>
        </LUXDialog>,
        "dialog",
      )}
      {snackbar.open
        ? withPortal(
            <LUXSnackbar
              message={snackbar.message}
              onRequestClose={snackbar.onRequestClose}
              open={snackbar.open}
              type={snackbar.type}
            />,
            "snackbar",
          )
        : null}
    </>
  );
}

MSC_060100_P01.propTypes = {
  open: PropTypes.bool.isRequired,
  timePop: PropTypes.shape({
    pid: PropTypes.string,
    prsc_date: PropTypes.string,
    prsc_sqno: PropTypes.string,
    prsc_nm: PropTypes.string,
    trtm_strt_dt: PropTypes.string,
    trtm_end_dt: PropTypes.string,
    prsc_prgr_stat_cd: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
MSC_060100_P01.defaultProps = {
  timePop: {
    pid: "",
    prsc_date: "",
    prsc_sqno: "",
    prsc_nm: "",
    trtm_strt_dt: "",
    trtm_end_dt: "",
    prsc_prgr_stat_cd: "",
  },
};
