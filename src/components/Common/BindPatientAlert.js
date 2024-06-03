import React from "react";

// util
import withPortal from "hoc/withPortal";

// common-ui-components
import { LUXAlert } from "luna-rocket";
import Message from "./Message";

// css

// imgs

/**
 * @name 윤서영
 * @author 통합환자번호 알럿
 * @param open 알럿 오픈 여부
 * @param bindPid 통합환자번호
 * @param ptNm 환자 이름
 * @param onClose 알럿 닫힘 이벤트
 */
export default function BindPatientAlert({ open = false, bindPid = "", ptNm = "", onClose = () => {} }) {
  /* ================================================================================== */
  /* 상태(state) 선언 */

  /* ================================================================================== */
  /* 함수(function) 선언 */

  /* ================================================================================== */
  /* Hook(useEffect) */

  /* ================================================================================== */
  /* render() */
  return withPortal(
    <LUXAlert
      open={open}
      message={Message.bindPatient(bindPid, ptNm)}
      useIcon
      useIconType="warning"
      confirmButton={onClose}
      onClose={onClose}
    />,
    "dialog",
  );
}
