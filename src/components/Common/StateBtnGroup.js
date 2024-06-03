import React, { useEffect, useState } from "react";

// util
import PropTypes from "prop-types";

// common-ui-components

// css

// imgs

/**
 * @name 버튼 공통
 * @author 윤서영
 */
export default function StateBtnGroup({
  arrStates,
  strExmPageCode,
  isDashboard,
  strSelectedStateBtn,
  onClickStateBtnGrp,
}) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [btnOnStyle, setBtnOnStyle] = useState([]);
  const [btnOffStyle, setBtnOffStyle] = useState([]);

  /* ================================================================================== */
  /* 함수(function) 선언 */

  //  버튼 On/Off일 때 스타일 지정
  const handleBtnStyle = () => {
    const btnOnStyle = [
      {
        backgroundColor: "#616973",
        border: "1px solid #616973",
        fontSize: "11px",
        color: "white",
        borderRadius: "4px",
      },
    ];
    const btnOffStyle = [
      {
        color: "#616973",
        border: "1px solid #616973",
        fontSize: "11px",
        borderRadius: "4px",
      },
    ];

    arrStates.map(stat => {
      if (stat.code !== "0") {
        btnOnStyle.push({
          backgroundColor: stat.color,
          border: "1px solid " + stat.color,
          fontSize: "11px",
          color: "white",
          borderRadius: "4px",
        });

        btnOffStyle.push({
          color: stat.color,
          border: "1px solid " + stat.color,
          fontSize: "11px",
          borderRadius: "4px",
        });
      }
    });

    setBtnOnStyle(btnOnStyle);
    setBtnOffStyle(btnOffStyle);
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    if (arrStates.length > 0) {
      handleBtnStyle();
    }
  }, [arrStates]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className={`${isDashboard ? "status_btn_group" : "medical_waiting"}`}>
      {arrStates &&
        arrStates.map((value, index) => {
          const key = isDashboard ? strExmPageCode + value.code : value.code;

          return (
            <button
              className={`${isDashboard ? "" : "btn_waiting_status"} ${value.code === strSelectedStateBtn ? "on" : ""}`}
              type="button"
              key={key}
              style={value.code === strSelectedStateBtn ? btnOnStyle[index] : btnOffStyle[index]}
              onClick={() => onClickStateBtnGrp(value.code)}
            >
              {isDashboard ? (
                <span>{value.name}</span>
              ) : (
                <>
                  <span>{value.name}</span>
                  <span>{value.count}</span>
                </>
              )}
            </button>
          );
        })}
    </div>
  );
}
StateBtnGroup.prototype = {
  arrStates: PropTypes.array,
  strExmPageCode: PropTypes.string,
  isDashboard: PropTypes.bool,
  strSelectedStateBtn: PropTypes.string,
  onClickStateBtnGrp: PropTypes.func,
};
StateBtnGroup.defaultProps = {
  arrStates: [],
  strExmPageCode: "",
  isDashboard: false,
  strSelectedStateBtn: "",
  onClickStateBtnGrp: () => {},
};
