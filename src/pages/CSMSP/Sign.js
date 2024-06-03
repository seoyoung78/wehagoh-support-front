import moment from "moment";
import React from "react";

// util

// common-ui-components

// css

// imgs

/**
 * @name 출력지 공통 하단(발급일자, 진료의)
 * @author 담당자 이름
 */
export default function Sign(props) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const { mdcr_dr_nm = "", sign_img = "" } = props;

  /* ================================================================================== */
  /* 함수(function) 선언 */

  /* ================================================================================== */
  /* Hook(useEffect) */

  /* ================================================================================== */
  /* render() */
  return (
    <div className="print_wrap">
      <div className="print_sign">
        <div className="sign_box">
          <span>발급 일자</span>
          <span>{moment().format("YYYY-MM-DD")}</span>
        </div>
        <div className="sign_box">
          <div>진료의</div>
          <div>{mdcr_dr_nm}</div>
          {sign_img && sign_img !== "" && <img src={sign_img} width="38px" height="38px" alt="" />}
          <div className="sign_text">( 서명 또는 인 )</div>
        </div>
      </div>
    </div>
  );
}
