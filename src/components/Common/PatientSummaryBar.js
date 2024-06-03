import React, { forwardRef, useEffect, useImperativeHandle, useState, useRef } from "react";

// util
import moment from "moment/moment";
import callApi from "services/apis";
import withPortal from "hoc/withPortal";
import PropTypes from "prop-types";
import BindPatientAlert from "components/Common/BindPatientAlert";

// common-ui-components
import { LUXSnackbar } from "luna-rocket";
import { PatientInfoCollectionComponent } from "cliniccommon-ui";
import Message from "components/Common/Message";

// imgs

const PatientSummaryBar = forwardRef(
  (
    {
      pid,
      rcpn_sqno,
      prsc_clsf_cd,
      hope_exrm_cd,
      exmn_hope_date,
      handleBind,
      pageId,
      cndt_dt,
      iptn_dt,
      patientCallback,
    },
    ref,
  ) => {
    /* ================================================================================== */
    /* 상태(state) 선언 */
    const patientRef = useRef({
      initialized: false,
      pid: "",
      pt_nm: "",
      pt_pctr_lctn: "",
      sex_cd: "",
      sex_nm: "",
      age: "",
      dobr: "",
      abo_type_cd: "",
      rh_type_cd: "",
      undn_yn: "",
      priv_pt_yn: "",
      bind_pid: "",
      bind_pt_nm: "",
      use_yn: "",
      prgn_yn: "",
      frnr_yn: "",
      dsbl_yn: "",
      vip_pt_yn: "",
      pt_dvcd: "",
    });

    const [patient, setPatient] = useState({
      ...patientRef.current,
    });

    const [snack, setSnack] = useState({ open: false, type: "warning", msg: Message.networkFail }); // 스낵바 상태
    const [bind, setBind] = useState(false); // 통합환자 알럿 상태

    // 결과 페이지
    const isCndt =
      pageId === "MSC_020300" || pageId === "MSC_030200" || pageId === "MSC_040200" || pageId === "MSC_050200";
    const isIptn = pageId === "MSC_030200" || pageId === "MSC_040200" || pageId === "MSC_050200";

    // 재활
    const isMsh = pageId === "MSC_060100";
    const isMshView = pageId === "MSC_060200"; // 물리치료대장

    // 통합검사결과
    const isIntg = pageId === "MSC_070100"; // 통합검사결과

    // 내시경검사
    const isRcpnEndo = pageId === "MSC_050100"; // 내시경 접수

    // 환자통합주의정보 hide 여부
    const shouldHidePatIntegCaution = isMsh || isMshView || isIntg;
    // 진료관련정보 대신 휴대전화번호 출력 여부
    const shouldPhoneOnly = isIntg || isMshView;

    /* ================================================================================== */
    /* 함수(function) 선언 */
    const formatDate = date => (date ? moment(date).format("YYYY-MM-DD") : "-");

    const formatPhoneNumber = phoneNumber => {
      if (!phoneNumber) {
        return "";
      }
      const regex = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?([0-9]{3,4})-?([0-9]{4})$/;
      return phoneNumber.replace(regex, "$1-$2-$3");
    };

    const getConditionDate = () => {
      let date = exmn_hope_date;
      let dateTitle = "검사예정일자";

      if (isMsh) {
        dateTitle = "시행예정일자";
      } else if (isCndt) {
        dateTitle = "검사일자";
        date = formatDate(cndt_dt);
      }

      return (
        <>
          <span>{dateTitle}</span>
          <span>{date}</span>
        </>
      );
    };

    const getEmptyByPageId = () => {
      const getTitle = () => {
        switch (pageId) {
          case "MSC_020100":
            return "진단검사 접수";
          case "MSC_020300":
            return "진단검사 결과";
          case "MSC_030100":
            return "기능검사 접수";
          case "MSC_030200":
            return "기능검사 결과";
          case "MSC_050100":
            return "내시경검사 접수";
          case "MSC_050200":
            return "내시경검사 결과";
          case "MSC_040100":
            return "영상검사 접수";
          case "MSC_040200":
            return "영상검사 판독";
          case "MSC_060100":
            return "물리치료 현황";
          case "MSC_060200":
            return "물리치료 대장";
          case "MSC_070100":
            return "통합검사결과";
          default:
            return "";
        }
      };

      return (
        <div className="left_box">
          <h2 className="menu_title">{getTitle()}</h2>
        </div>
      );
    };

    const getPatIntegInfoBtn = (
      <PatientInfoCollectionComponent.PatientIntegrationInformationButton
        patientInfo={{
          prgn_yn: patient.prgn_yn,
          frnr_yn: patient.frnr_yn,
          dsbl_yn: patient.dsbl_yn,
          vip_pt_yn: patient.vip_pt_yn,
        }}
        disables={{
          agree: false,
          special_case: false,
          chronic_disease: false,
          well_check: false,
          receivables: false,
        }}
      />
    );

    /* ================================================================================== */
    /* Hook(useEffect) */
    useEffect(() => {
      const handleError = errMsg => {
        console.error(errMsg);
        handleBind && handleBind(false);
        setSnack(prevState => ({ ...prevState, open: true }));
      };

      // 접수번호 있을 경우
      const fetchPatientInfo = async () => {
        try {
          const params = {
            rcpn_sqno,
            prsc_clsf_cd,
            hope_exrm_cd,
            exmn_hope_date,
          };
          const path = isMsh ? "MSC_060000" : "common";
          const { resultData, resultCode, resultMsg } = await callApi(`/${path}/selectPatientInfo`, params);
          if (resultCode !== 200) {
            const errMsg = resultMsg || "";
            handleError(errMsg);
            return;
          }
          setPatient(prevState => ({ ...prevState, ...resultData, initialized: true }));
          resultData.use_yn === "N" && setBind(true);
          handleBind && handleBind(resultData.use_yn === "N");
          window.localStorage.setItem("pid", resultData.pid);
          if (isMsh && patientCallback) {
            patientCallback(resultData);
          }
        } catch (error) {
          handleError(error);
        }
      };

      // 환자등록번호만 있을 경우
      const fetchOnlyPatient = async () => {
        try {
          const { resultData } = await callApi("/common/selectOnlyPatient", { pid: [pid] });
          if (resultData.length) {
            setPatient(prevState => ({ ...prevState, ...resultData[0], initialized: true }));
            window.localStorage.setItem("pid", pid);
          }
        } catch (error) {
          handleError(error);
        }
      };

      if (!pid && !rcpn_sqno) {
        setPatient(patientRef.current);
        //통합검사결과도 이제는 환자정보 날려야함.
        isIntg || window.localStorage.removeItem("pid");
        return;
      }

      if (rcpn_sqno) {
        fetchPatientInfo();
      } else {
        fetchOnlyPatient();
      }
    }, [pid, rcpn_sqno, exmn_hope_date, hope_exrm_cd, pageId, prsc_clsf_cd, isIntg, isMsh]);

    useImperativeHandle(
      ref,
      () => ({
        getPatientInfo: () =>
          patient.initialized && {
            ...patient,
          },
      }),
      [patient],
    );

    /* ================================================================================== */
    /* render() */
    return (
      <div>
        {!patient.initialized ? (
          getEmptyByPageId()
        ) : (
          <div className="left_box">
            {/* [START] 환자이미지 & 환자이름 & 관심환자 툴팁 */}
            <div className="binder">
              <PatientInfoCollectionComponent.PatientImgNName
                pid={patient.pid} // hooptbaim.pid
                pt_nm={patient.pt_nm} // hooptbaim.pt_nm
                pt_pctr_lctn={patient.pt_pctr_lctn} // hooptbaim.pt_pctr_lctn (이미지 조회 API를 태우지 않을 경우 props추가하여 진행)
              />
              {/* [END] 환자이미지 & 환자이름 & 관심환자 툴팁 */}

              {/* [START] 환자기본정보 */}
              <PatientInfoCollectionComponent.PatientBasicInfo
                pid={patient.pid} // hooptbaim.pid
                sex_cd={patient.sex_cd}
                sex_nm={patient.sex_nm} // hooptbaim.sex 공통코드 요약명
                age={patient.ageWithUnit} // hooptbaim.age
                dobr={patient.dobr} // hooptbaim.dobr
                abo_type_cd={patient.abo_type_cd}
                rh_type_cd={patient.rh_type_cd}
                undn_yn={patient.undn_yn}
              />
            </div>
            {/* [END] 환자기본정보 */}

            <div className="binder">
              {/* [START] 사생활보호 버튼 */}
              <PatientInfoCollectionComponent.PrivacyButton
                priv_pt_yn={patient.priv_pt_yn} // hooptbaim.priv_pt_yn
              />
              {/* [END] 사생활보호 버튼 */}

              {shouldHidePatIntegCaution ? (
                getPatIntegInfoBtn
              ) : (
                <>
                  {/* [START] 환자통합주의정보(감염, ITS, 알러지) */}
                  <div className="badge_box">
                    <PatientInfoCollectionComponent.PatientIntegrationCautionInfo
                      pid={patient.pid} // hooptbaim.pid
                      module="msc" // readOnly 처리를 위한 모듈코드('med', 'nur' 등)
                    />
                  </div>
                  {/* [END] 환자통합주의정보(감염, ITS, 알러지) */}
                  {/* [START] 임산부, 외국인, 장애인, VIP */}
                  <div>{getPatIntegInfoBtn}</div>
                  {/* [END] 임산부, 외국인, 장애인, VIP */}
                </>
              )}
            </div>

            {shouldPhoneOnly ? (
              <div className="binder">
                <div className="patient_basic_info">
                  <span>휴대전화번호</span>
                  <span>{formatPhoneNumber(patient?.clph_no)}</span>
                </div>
              </div>
            ) : (
              <>
                {/* [START] 진료 관련 정보 */}
                <div className="binder">
                  <div className="patient_basic_info">
                    <span>진료일자</span>
                    <span>{patient.mdcr_date}</span>
                  </div>
                </div>
                <div className="binder">
                  <div className="patient_basic_info">{getConditionDate()}</div>
                </div>
                {isIptn ? (
                  <div className="binder">
                    <div className="patient_basic_info">
                      <span>판독일자</span>
                      <span>{formatDate(iptn_dt)}</span>
                    </div>
                  </div>
                ) : null}
                <div className="binder">
                  <div className="patient_basic_info">
                    <span>진료의</span>
                    <span>{patient.mdcr_dr_nm}</span>
                  </div>
                </div>
                {isRcpnEndo ? (
                  <>
                    <div className="binder">
                      <div className="patient_basic_info">
                        <span>검진구분</span>
                        <span>{patient.cmhs_prps_nm}</span>
                      </div>
                    </div>
                    <div className="binder">
                      <div className="patient_basic_info">
                        <span>수납여부</span>
                        <span>{patient.rcpt_stat_nm}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {isMsh ? (
                      <div className="binder">
                        <div className="patient_basic_info">
                          <span>보험구분</span>
                          <span>{patient.insn_tycd}</span>
                        </div>
                      </div>
                    ) : null}
                    <div className="binder">
                      <div className="patient_basic_info">
                        <span>주상병</span>
                        <span>{patient.dgns_nm}</span>
                      </div>
                    </div>
                  </>
                )}
                {/* [END] 진료 관련 정보 */}
              </>
            )}
          </div>
        )}
        {withPortal(
          <LUXSnackbar
            autoHideDuration={2000}
            message={snack.msg}
            onRequestClose={() => setSnack(prevState => ({ ...prevState, open: false }))}
            open={snack.open}
            type={snack.type}
          />,
          "snackbar",
        )}
        {/* 통합환자등록번호 알럿 */}
        {patient.initialized && !isMshView && !isIntg && patient.use_yn === "N" && (
          <BindPatientAlert
            open={bind}
            bindPid={patient.bind_pid}
            ptNm={patient.bind_pt_nm}
            onClose={() => setBind(false)}
          />
        )}
      </div>
    );
  },
);

PatientSummaryBar.propTypes = {
  pid: PropTypes.string,
  rcpn_sqno: PropTypes.string,
  prsc_clsf_cd: PropTypes.string,
  hope_exrm_cd: PropTypes.string,
  exmn_hope_date: PropTypes.string,
  handleBind: PropTypes.func,
  patientCallback: PropTypes.func,
  pageId: PropTypes.string,
  cndt_dt: PropTypes.string,
  iptn_dt: PropTypes.string,
};

PatientSummaryBar.defaultProps = {
  pid: "",
  rcpn_sqno: "",
  prsc_clsf_cd: "",
  hope_exrm_cd: "",
  exmn_hope_date: "",
  handleBind: null,
  patientCallback: null,
  pageId: "",
  cndt_dt: "",
  iptn_dt: "",
};

export default PatientSummaryBar;
