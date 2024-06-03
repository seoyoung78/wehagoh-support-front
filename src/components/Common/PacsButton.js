import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

// util
import callApi from "services/apis";
import axios from "axios";
import { globals } from "global";
import withPortal from "hoc/withPortal";
import moment from "moment";
import { getCookie } from "services/utils";
import Message from "./Message";

// common-ui-components
import { LUXAlert, LUXButton, LUXSnackbar } from "luna-rocket";
import LUXSplitButton from "luna-rocket/LUXSplitButton";
import { ErrorLogInfo } from "cliniccommon-ui";

// css

// imgs

/**
 * @name PACS버튼
 * @author 윤서영
 */
function PacsButton({ pid = "", pacsNo = "", visible = true, pacsCoCd = "" }, ref) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [pacsList, setPacsList] = useState([]); // PACS 목록
  const [hsptInfo, setHsptInfo] = useState({}); // 병원정보

  // PACS 설정
  const [pacs, setPacs] = useState({
    // IRM
    isIrm: false,
    strIrmToken: "",
    acc: "",
  });

  const [snack, setSnack] = useState(false); // 스낵바 상태
  const [alert, setAlert] = useState({ open: false, title: "", message: "", type: "info" }); // alert창 상태

  const buttonRef = useRef(null);

  /* ================================================================================== */
  /* 함수(function) 선언 */
  // PACS 이벤트
  const handlePacsIrm = () => {
    let irmList = ""; // 선택한 검사
    if (pid !== "" && pacsNo !== "") {
      irmList = pacsNo;
    }

    const cno = document.getElementById("h_selected_company_no").value || getCookie("h_selected_company_no");
    const organization_id = cno === "70173" ? "99999998" : cno === "6062771" ? "99999999" : hsptInfo.rcpr_inst_rgno; // 개발기:70173, 운영기:6062771

    // 토큰 발급
    axios
      .get(
        `${globals.irm_url}/token?user_id=${
          document.getElementById("h_selected_employee_no").value
        }&organization_id=${organization_id}`,
        {
          headers: {
            "X-API-TXID": organization_id + moment().format(),
            Accept: "application/json; charset=UTF-8",
          },
        },
      )
      .then(({ data }) => {
        // 발급 후
        setPacs({ ...pacs, isIrm: false, strIrmToken: data.access_token, acc: irmList });
      })
      .catch(() => {
        setAlert({
          open: true,
          title: "",
          message: (
            <>
              '병원정보설정 - 연동정보설정 - 외부연동'에서
              <br />
              계정 연동이 필요합니다.
            </>
          ),
          type: "error",
        });
      });
  };

  // PACS버튼 클릭 시
  const handlePacs = pacs => {
    if (pacs === "irm") {
      handlePacsIrm();
    } else {
      setSnack(true);
    }
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    (async () => {
      await Promise.all([callApi("/common/selectPacsList"), callApi("/common/selectHspInfo")])
        .then(result => {
          if (result[0].resultData) {
            result[0].resultData.map(list => {
              list.key = list.pacs_cd;
              list.value = list.pacs_co_nm;
            });
            setPacsList(result[0].resultData);
          }
          setHsptInfo(result[1].resultData || {});
        })
        .catch(_e => ErrorLogInfo());
    })();
    return () => setPacsList([]);
  }, []);

  // PACS 버튼 클릭 후 토큰 변경 시 창 오픈
  useEffect(() => {
    if (pacs.strIrmToken !== "") {
      const irmPacForm = document.getElementById("irm_pacs");
      irmPacForm.submit();
    }
  }, [pacs.strIrmToken]);

  useImperativeHandle(
    ref,
    () => ({
      getPacsList: () => pacsList && [...pacsList],
    }),
    [pacsList],
  );

  /* ================================================================================== */
  /* render() */
  return (
    <>
      {visible &&
        (pacsList.length > 1 && pacsCoCd === "" ? (
          <LUXSplitButton
            size="s"
            value={[{ key: 0, value: "PACS" }].concat(pacsList)}
            onTouchTap={(_e, key) => {
              if (key !== 0) {
                handlePacs(key);
              } else {
                buttonRef.current.handleTouchTapMore();
              }
            }}
            disabled={pacsNo === null || pacsCoCd === null}
            ref={buttonRef}
          />
        ) : (
          <LUXButton
            label="PACS"
            onClick={() => handlePacs(pacsCoCd === "" ? pacsList[0].pacs_cd : pacsCoCd)}
            disabled={pacsList.length === 0 || pacsNo === null || pacsCoCd === null}
            type="small"
          />
        ))}

      {/* IRM */}
      <form id="irm_pacs" action={globals.irm_viewer} method="POST" acceptCharset="utf-8" target="_blank">
        <input type="hidden" name="token" value={pacs.strIrmToken} />
        <input type="hidden" name="acc" value={pacs.acc} />
        <input type="hidden" name="patientid" value={pid} />
        <input
          type="hidden"
          name="vgroupid"
          value={pacsList.length > 0 ? pacsList.find(list => list.pacs_cd === "irm")?.v_grp_id : ""}
        />
        <input type="hidden" name="index" value="1" />
        <input type="hidden" name="quiet" value="1" />
      </form>

      {withPortal(
        <LUXSnackbar
          autoHideDuration={2000}
          message={Message.noAction}
          onRequestClose={() => setSnack(false)}
          open={snack}
          type="info"
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

export default forwardRef(PacsButton);
