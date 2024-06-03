import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

// util
import moment from "moment/moment";
import callApi from "services/apis";
import { downloadApi } from "services/apis/formApi";
import withPortal from "hoc/withPortal";

// common-ui-components
import { LUXSnackbar, LUXTooltip } from "luna-rocket";
import { PatientInfoCollectionComponent } from "cliniccommon-ui";
import Message from "./Message";

// css

// imgs
import memoOff from "assets/imgs/ic_memo_off.png";
import memoOn from "assets/imgs/ic_memo_on.png";
import vipOff from "assets/imgs/ic_vip_off.png";
import vipOn from "assets/imgs/ic_vip_on.png";
import warningOff from "assets/imgs/ic_warning_off.png";
import warningOn from "assets/imgs/ic_warning_on.png";

import BindPatientAlert from "./BindPatientAlert";

/**
 * @name 공통_환자정보
 * @author 윤서영
 */
function PatientInfo(props, ref) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const {
    pageId = "",
    pid = "",
    rcpn_sqno = "",
    prsc_clsf_cd = "",
    hope_exrm_cd = "",
    exmn_hope_date = new Date(),
    patientCallback,
    cndt_dt = "",
    iptn_dt = "",
    handleBind,
  } = props;

  const [patient, setPatient] = useState(null);

  const [state, setState] = useState({
    isPatientProfilePopupOpen: false,
    patientImg: null,
  });

  const [snack, setSnack] = useState({ open: false, type: "warning", msg: Message.networkFail }); // 스낵바 상태

  const [bind, setBind] = useState(false); // 통합환자 알럿 상태

  // 결과 페이지
  const isCndt =
    pageId === "MSC_020300" || pageId === "MSC_030200" || pageId === "MSC_040200" || pageId === "MSC_050200";
  const isIptn = pageId === "MSC_030200" || pageId === "MSC_040200" || pageId === "MSC_050200";

  // 재활
  const isMsh = pageId === "MSC_060100";
  const isMshView = pageId === "MSC_060200";

  // 통합검사결과
  const isIntg = pageId === "MSC_070100";

  /* ================================================================================== */
  /* 함수(function) 선언 */

  /**
   * @description 환자 패널 내의 진료일자, 검사일자, 진료의, 주상병의 디자인을 그려 리턴하는 함수
   */
  const setDraw = (title, strDgnsNm) => (
    <div className={`item ${title === "주상병" ? "full" : ""}`}>
      <dt>{title}</dt>
      {isIntg ? <dd style={{ fontSize: "12px" }}>{strDgnsNm}</dd> : <dd>{strDgnsNm}</dd>}
    </div>
  );

  // 물리치료 대장 조건부 서브 텍스트
  const getSubTextBasedOnCondition = key => {
    if (!isMshView || !patient[key]) return null;

    switch (key) {
      case "dobr":
        return <p className="sub_text">{moment(patient.dobr, "YYYY-MM-DD").format("YYYY-MM-DD")}</p>;
      case "clph_no":
        return (
          <p className="sub_text">
            {patient.clph_no.replace(/^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?([0-9]{3,4})-?([0-9]{4})$/, "$1-$2-$3")}
          </p>
        );
      default:
        return null;
    }
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    // 환자정보 조회
    if (rcpn_sqno) {
      (async () => {
        const path = isMsh ? "MSC_060000" : "common";
        await callApi(`/${path}/selectPatientInfo`, { rcpn_sqno, prsc_clsf_cd, hope_exrm_cd, exmn_hope_date }).then(
          ({ resultCode, resultData }) => {
            if (resultCode === 200 && resultData) {
              if (resultData?.pt_pctr_lctn) {
                (async () => {
                  await downloadApi(resultData.pt_pctr_lctn)
                    .then(blob => setState({ patientImg: blob || null, isPatientProfilePopupOpen: false }))
                    .catch(e => setState({ patientImg: null, isPatientProfilePopupOpen: false }));
                })();
              } else {
                setState({ patientImg: null, isPatientProfilePopupOpen: false });
              }
              setPatient({ ...resultData, exmn_hope_date });
              resultData.use_yn === "N" && setBind(true);
              handleBind && handleBind(resultData.use_yn === "N");
              window.localStorage.setItem("pid", resultData.pid);
              if (isMsh) patientCallback(resultData);
            } else {
              handleBind && handleBind(false);
              setSnack({ ...snack, open: true });
            }
          },
        );
      })();
    }
    // 물리치료 대장 용 환자 정보 조회
    else if (pid) {
      (async () => {
        await callApi("/common/selectOnlyPatient", { pid: [pid] }).then(({ resultData }) => {
          if (resultData[0].pt_pctr_lctn && resultData[0].pt_pctr_lctn !== "") {
            (async () => {
              await downloadApi(resultData[0].pt_pctr_lctn).then(blob => {
                if (blob) {
                  setState({ patientImg: blob, isPatientProfilePopupOpen: false });
                } else {
                  setState({ patientImg: null, isPatientProfilePopupOpen: false });
                }
              });
            })();
          } else {
            setState({ patientImg: null, isPatientProfilePopupOpen: false });
          }
          setPatient(resultData[0]);
          window.localStorage.setItem("pid", pid);
        });
      })();
    } else {
      //통합검사결과도 이제는 환자정보 날려야함.
      setPatient(null);
      setState({ isPatientProfilePopupOpen: false, patientImg: null });
      isIntg || window.localStorage.removeItem("pid");
    }

    return () => {
      if (state.patientImg) {
        URL.revokeObjectURL(state.patientImg);
      }
      setState({ isPatientProfilePopupOpen: false, patientImg: null });
    };
  }, [pid, rcpn_sqno]);

  useImperativeHandle(
    ref,
    () => ({
      getPatientInfo: () =>
        patient && {
          ...patient,
        },
    }),
    [patient],
  );

  /* ================================================================================== */
  /* render() */
  return (
    <div className="user_info_box">
      {patient === null ? (
        <>
          <div className="user_info">
            <div className="img_box">
              <img src="" alt="" />
            </div>
            <div className="text_box">
              <p className="default">환자를 선택하세요.</p>
            </div>
          </div>
          {!isMshView && !isIntg && (
            <dl className="user_status">
              {setDraw("진료일자", "-")}
              {setDraw(isMsh ? "시행예정일자" : isCndt ? "검사일자" : "검사예정일자", "-")}
              {isIptn && setDraw("판독일자", "-")}
              {setDraw("진료의", "-")}

              {pageId === "MSC_050000" ? (
                <>
                  {setDraw("검진구분", "-")}
                  {setDraw("수납여부", "-")}
                </>
              ) : (
                <>
                  {isMsh ? <>{setDraw("보험구분", "-")}</> : null}
                  {setDraw("주상병", "-")}
                </>
              )}
            </dl>
          )}
          {isIntg && (
            <dl className="user_status">
              {setDraw("환자번호", "-")}
              {setDraw("성별/나이", "-")}
              {setDraw("생년월일", "-")}
              {setDraw("전화번호", "-")}
            </dl>
          )}
        </>
      ) : (
        <>
          <div className="user_info">
            <div className="img_box">
              {patient.pt_pctr_lctn && state.patientImg ? (
                <div className="profile_img_set">
                  <div
                    className={`WEH_bubble is_popover b_border ${state.isPatientProfilePopupOpen ? "open" : ""}`}
                    onClick={() =>
                      setState(prev => ({ ...prev, isPatientProfilePopupOpen: !prev.isPatientProfilePopupOpen }))
                    }
                  >
                    <div className="WEH_anchor">
                      <button type="button" className="btn_pop_profile">
                        <div className="LS_profile_image profile_img profile_img">
                          <div className="image_box" style={{ backgroundImage: `url(${state.patientImg})` }} />
                        </div>
                      </button>
                    </div>
                    <div className="WEH_result_content">
                      <div className={`WEH_bubble_result bottom${isIntg ? "_left" : ""} text_center`}>
                        <div className="enlarged_image">
                          <img src={state.patientImg} className="img_org" alt="프로필 이미지 확대" />
                        </div>
                        <div className="tail" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <img src="" alt="" />
              )}
            </div>
            <div className="text_box">
              {!isIntg ? (
                <>
                  <p className="main_text">{patient.pt_nm}</p>
                  <p className="sub_text">{patient.pid}</p>
                  {getSubTextBasedOnCondition("dobr")}
                  <p className="sub_text">{patient.age_cd}</p>
                  {patient.abo_rh_cd !== "" && <p className="sub_text">{patient.abo_rh_cd}</p>}
                  {getSubTextBasedOnCondition("clph_no")}
                  {/* <span>
                  {patient.dobr !== null && patient.dobr !== ""
                    ? moment(patient.dobr, "YYYY-MM-DD").format("YYYY-MM-DD")
                    : ""}
                </span> */}

                  <p className="sub_text">
                    {patient.priv_pt_yn === "Y" ? (
                      <LUXTooltip label="사생활보호 환자 입니다.">
                        <img src={warningOn} alt="사생활주의환자" />
                      </LUXTooltip>
                    ) : (
                      <img src={warningOff} alt="사생활주의환자" />
                    )}

                    {patient.vip_pt_yn === "Y" ? (
                      <LUXTooltip label="VIP 환자 입니다.">
                        <img src={vipOn} alt="VIP" />
                      </LUXTooltip>
                    ) : (
                      <img src={vipOff} alt="VIP" />
                    )}

                    {patient.memo_cnts === "" ? (
                      <img src={memoOff} alt="메모" />
                    ) : (
                      <LUXTooltip label={patient.memo_cnts}>
                        <img src={memoOn} alt="메모" />
                      </LUXTooltip>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <p className="main_text">{patient.pt_nm}</p>
                  <div className="sub_text">
                    {patient.priv_pt_yn === "Y" ? (
                      <LUXTooltip label="사생활보호 환자 입니다.">
                        <img src={warningOn} alt="사생활주의환자" />
                      </LUXTooltip>
                    ) : (
                      <img src={warningOff} alt="사생활주의환자" />
                    )}

                    {patient.vip_pt_yn === "Y" ? (
                      <LUXTooltip label="VIP 환자 입니다.">
                        <img src={vipOn} alt="VIP" />
                      </LUXTooltip>
                    ) : (
                      <img src={vipOff} alt="VIP" />
                    )}

                    {patient.memo_cnts === "" ? (
                      <img src={memoOff} alt="메모" />
                    ) : (
                      <LUXTooltip label={patient.memo_cnts}>
                        <img src={memoOn} alt="메모" />
                      </LUXTooltip>
                    )}
                  </div>
                </>
              )}
              <div className="badge_box">
                <PatientInfoCollectionComponent.PatientIntegrationCautionInfo
                  pid={patient.pid} // hooptbaim.pid
                  module="msc" // readOnly 처리를 위한 모듈코드('med', 'nur' 등)
                />
              </div>
            </div>
          </div>
          <>
            {!isMshView && !isIntg && (
              <dl className="user_status">
                {setDraw(
                  "진료일자",
                  patient.mdcr_date ? moment(patient.mdcr_date, "YYYY-MM-DD").format("YYYY-MM-DD") : "-",
                )}
                {!isCndt &&
                  setDraw(
                    isMsh ? "시행예정일자" : "검사예정일자",
                    exmn_hope_date ? moment(exmn_hope_date, "YYYY-MM-DD").format("YYYY-MM-DD") : "-",
                  )}
                {isCndt && setDraw("검사일자", cndt_dt ? moment(cndt_dt).format("YYYY-MM-DD") : "-")}
                {isIptn && setDraw("판독일자", iptn_dt ? moment(iptn_dt).format("YYYY-MM-DD") : "-")}
                {setDraw("진료의", patient.mdcr_dr_nm === "" ? "-" : patient.mdcr_dr_nm)}

                {pageId === "MSC_050000" ? (
                  <>
                    {setDraw("검진구분", patient.cmhs_prps_nm)}
                    {setDraw("수납여부", patient.rcpt_stat_nm)}
                  </>
                ) : (
                  <>
                    {isMsh ? <>{setDraw("보험구분", patient.insn_tycd)}</> : null}
                    {setDraw("주상병", patient.dgns_nm)}
                  </>
                )}
              </dl>
            )}

            {isIntg && (
              <dl className="user_status">
                {setDraw("환자번호", patient.pid)}
                {setDraw("성별/나이", patient.age_cd)}
                {setDraw(
                  "생년월일",
                  patient.dobr !== null && patient.dobr !== ""
                    ? moment(patient.dobr, "YYYY-MM-DD").format("YYYY-MM-DD")
                    : "-",
                )}
                {setDraw(
                  "전화번호",
                  patient.clph_no.replace(
                    /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?([0-9]{3,4})-?([0-9]{4})$/,
                    "$1-$2-$3",
                  ),
                )}
              </dl>
            )}
          </>
        </>
      )}

      {withPortal(
        <LUXSnackbar
          autoHideDuration={2000}
          message={snack.msg}
          onRequestClose={() => setSnack({ ...snack, open: false })}
          open={snack.open}
          type={snack.type}
        />,
        "snackbar",
      )}

      {/* 통합환자등록번호 알럿 */}
      {patient && !isMshView && !isIntg && patient.use_yn === "N" && (
        <BindPatientAlert
          open={bind}
          bindPid={patient.bind_pid}
          ptNm={patient.bind_pt_nm}
          onClose={() => setBind(false)}
        />
      )}
    </div>
  );
}
export default forwardRef(PatientInfo);
