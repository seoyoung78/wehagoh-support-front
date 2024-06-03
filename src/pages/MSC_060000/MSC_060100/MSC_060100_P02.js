import React, { useEffect, useState } from "react";

// util
import PropTypes from "prop-types";
import withPortal from "hoc/withPortal";
import callApi from "services/apis";

// common-ui-components
import { LUXButton, LUXDialog } from "luna-rocket";

// css
import "assets/style/MSC_060100_P02.scss";

// imgs

/**
 * @name 물리치료 경과기록 팝업
 * @author 김령은
 */
export default function MSC_060100_P02(props) {
  const { open, pid, onClose } = props;

  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [recordList, setRecordList] = useState([]);
  const [openIndex, setOpenIndex] = useState(0);

  /* ================================================================================== */
  /* 함수(function) 선언 */

  const handleTouchTap = (open, index) => {
    if (open) {
      setOpenIndex(index);
    } else if (openIndex === index) {
      setOpenIndex(-1);
    }
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    if (open && pid) {
      (async () => {
        await callApi("/MSC_060000/selectRecord", { pid }).then(
          ({ resultCode, resultData, resultMsg }) => resultCode === 200 && setRecordList(resultData),
        );
      })();

      return () => {
        setRecordList([]);
        setOpenIndex(0);
      };
    }
  }, [open, pid]);

  /* ================================================================================== */
  /* render() */
  return (
    <>
      {withPortal(
        <LUXDialog dialogOpen={open} handleOnEscClose={onClose} onRequestClose handleOnRequestClose={onClose}>
          <div className="MSC_060100_P02">
            <div className="dialog_content md roundstyle">
              <div className="dialog_data">
                <div className="dialog_data_tit">
                  <h1 className="txtcnt">물리치료 경과기록</h1>
                  <button type="button" className="LUX_basic_btn btn_clr" onClick={onClose}>
                    <span className="sp_lux">닫기</span>
                  </button>
                </div>
                <div className="dialog_data_area noline mgt10">
                  {recordList.length ? (
                    <div className="dialog_data_section">
                      <div className="type_records">
                        <div className="binder test_result">
                          <div className="sec_content">
                            <div className="medical_history">
                              <ul className="record_list">
                                {recordList.map(({ prsc_date, mdtr_hope_date, mdtr_opnn }, index) => (
                                  <li className={openIndex === index ? "open" : ""} key={prsc_date + mdtr_opnn + index}>
                                    <div className="list_subject">
                                      <div className="left_box">
                                        <div className="writer">
                                          {`처방일 : ${prsc_date} [시행일 : ${mdtr_hope_date}]`}
                                        </div>
                                      </div>
                                      <div className="right_box">
                                        <button
                                          type="button"
                                          className="LUX_basic_btn Image Small basic btn_flip"
                                          onClick={() => handleTouchTap(openIndex !== index, index)}
                                        >
                                          <span className="blind">펼치기/접기</span>
                                          <svg viewBox="0 0 24 24" className="ico_svg">
                                            <path d="M4.635,7.663c0.169,0,0.332,0.067,0.452,0.187l6.967,6.969c1.18-1.14,4.627-4.629,6.852-6.895 c0.247-0.251,0.65-0.255,0.901-0.008c0.251,0.247,0.255,0.65,0.008,0.901l0,0c-7.379,7.517-7.424,7.517-7.777,7.52 c-0.17,0-0.333-0.068-0.453-0.188L4.189,8.752C3.94,8.503,3.94,8.1,4.189,7.851c0.12-0.12,0.282-0.187,0.451-0.187L4.635,7.663z" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                    <div className="list_content">
                                      <div className="record_comment">{mdtr_opnn}</div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-container">
                      <div className="empty_box">
                        <div className="inbx">
                          <div className="empty_img type2" />
                          <div className="empty_msg">데이터가 존재하지 않습니다.</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="dialog_btnbx">
                <LUXButton label="닫기" type="confirm" onClick={onClose} />
              </div>
            </div>
          </div>
        </LUXDialog>,
        "dialog",
      )}
    </>
  );
}

MSC_060100_P02.propTypes = {
  open: PropTypes.bool.isRequired,
  pid: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
