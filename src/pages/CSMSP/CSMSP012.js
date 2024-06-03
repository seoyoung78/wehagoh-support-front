import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// util
import callApi from "services/apis";
import { getLocalStorageItem } from "services/utils/localStorage";
import moment from "moment";
import { globals } from "global";

// common-ui-components
import { LUXButton } from "luna-rocket";

// css
import "assets/style/print.scss";
import "assets/style/MSC_060200.scss";

// imgs

/**
 * @name 물리치료대장 출력지
 * @author 윤서영
 */

export default function CSMSP012() {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const { search } = useLocation();

  const [hspt, setHspt] = useState({
    hspt_nm: "",
    hspt_logo_lctn: "",
    hspt_logo: "",
  });

  const [state, setState] = useState({
    initialized: false,
    patientMap: {},
    prscMap: {},
  });

  /* ================================================================================== */
  /* 함수(function) 선언 */
  // 닫기
  const handleClose = () => {
    window.close();
  };

  // 인쇄
  const handlePrint = () => {
    // 프린트 화면으로 전환
    window.print();
    handleClose();
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    // 로컬 스토리지에서 데이터 가져오기
    const fetchDataFromLocalStorage = () => {
      if (search) {
        const queryParams = new URLSearchParams(search);
        const { patientList } = getLocalStorageItem(queryParams.get("key"));
        return patientList ? { patientList } : null;
      }
      return null;
    };

    // API 호출을 위한 파라미터 설정
    const localStorageData = fetchDataFromLocalStorage();

    if (!localStorageData) {
      return;
    }

    const requests = [callApi("/common/selectHspInfo"), callApi("/MSC_060200/selectPrintMdtr", localStorageData)];

    // 두 API 호출 처리
    Promise.allSettled(requests).then(results => {
      const [hspInfoResult, printMdtrResult] = results;

      // 병원 정보 가져오기
      if (hspInfoResult.status === "fulfilled" && hspInfoResult.value.resultCode === 0) {
        const { hspt_nm, hspt_logo_lctn, hspt_logo } = hspInfoResult.value.resultData;
        setHspt(prevState => ({ ...prevState, hspt_nm, hspt_logo_lctn, hspt_logo }));
      } else {
        console.error("병원 정보 조회 실패:", hspInfoResult.reason);
      }

      // 물리치료 데이터 가져오기
      if (printMdtrResult.status === "fulfilled" && printMdtrResult.value.resultCode === 200) {
        const { patientMap, prscMap } = printMdtrResult.value.resultData;
        setState(prevState => ({
          ...prevState,
          initialized: true,
          patientMap,
          prscMap,
        }));
      } else {
        console.error("물리치료 데이터 조회 실패:", printMdtrResult.value);
      }
    });
  }, [search]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="MSC_060200">
      <div id="printArea">
        {state.initialized
          ? Object.entries(state.prscMap).map(([key, value], index) => {
              const patient = state.patientMap[key];
              return (
                <div className="print_box" key={`${key}-${index}`}>
                  <div className="print_info">{moment().format("YYYY-MM-DD HH:mm:ss")}</div>

                  <div className="print_header">
                    <div className="print_header_title">
                      <h1>물리치료대장</h1>
                      <p>{hspt.hspt_nm}</p>
                    </div>
                    {hspt.hspt_logo_lctn ? (
                      <div className="print_header_logo">
                        <img src={globals.wehagoh_url + hspt.hspt_logo_lctn} alt="" />
                      </div>
                    ) : null}
                  </div>
                  <div className="print_wrap">
                    <div className="print_title">
                      <h3>• 기본정보</h3>
                    </div>
                    <div className="print_content">
                      <div className="LUX_basic_tbl">
                        <table className="tblarea2 tblarea2_v2">
                          <colgroup>
                            <col width="120px" />
                            <col />
                            <col width="120px" />
                            <col />
                            <col width="120px" />
                            <col />
                          </colgroup>
                          <tbody>
                            <tr>
                              <th className="nfont celcnt">환자성명</th>
                              <td className="cellft">
                                <div className="inbx">{patient.pt_nm}</div>
                              </td>
                              <th className="nfont celcnt">환자번호</th>
                              <td className="cellft">
                                <div className="inbx">{patient.pid}</div>
                              </td>
                              <th className="nfont celcnt">성별/나이</th>
                              <td className="cellft">
                                <div className="inbx">{patient.age_cd}</div>
                              </td>
                            </tr>
                            <tr>
                              <th className="nfont celcnt">주소</th>
                              <td className="cellft" colSpan={5}>
                                <div className="inbx">{patient.addr}</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="print_wrap full_size">
                    <div className="print_title">
                      <h3>• 치료대장</h3>
                    </div>
                    <div className="print_content">
                      <div className="LUX_basic_tbl">
                        <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                          <colgroup>
                            <col />
                            <col />
                            <col />
                            <col />
                            <col />
                            <col width="210px" />
                          </colgroup>
                          <thead>
                            <tr>
                              <th className="nfont celcnt">치료일자</th>
                              <th className="nfont celcnt">시작시간</th>
                              <th className="nfont celcnt">종료시간</th>
                              <th className="nfont celcnt">진료의(처방)</th>
                              <th className="nfont celcnt">시행자</th>
                              <th className="nfont celcnt">처방내역</th>
                            </tr>
                          </thead>
                          <tbody>
                            {value.map((treat, treatIndex) => (
                              <React.Fragment key={`${key}-${treatIndex}-${treat.mdtr_hope_date}`}>
                                <tr>
                                  <td className="cellft">
                                    <div className="inbx">{treat.mdtr_hope_date}</div>
                                  </td>
                                  <td className="cellft">
                                    <div className="inbx">{treat.trtm_strt_dt}</div>
                                  </td>
                                  <td className="cellft">
                                    <div className="inbx">{treat.trtm_end_dt}</div>
                                  </td>
                                  <td className="cellft">
                                    <div className="inbx">{treat.prsc_dr_nm}</div>
                                  </td>
                                  <td className="cellft">
                                    <div className="inbx">{treat.rcps_nm}</div>
                                  </td>
                                  <td className="cellft">
                                    <div className="inbx">{treat.prsc_nm}</div>
                                  </td>
                                </tr>
                                <tr>
                                  <th className="nfont celcnt">물리치료 소견</th>
                                  <td colSpan={5}>
                                    <div className="inbx inbx-pre-wrap">{treat.mdtr_opnn}</div>
                                  </td>
                                </tr>
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          : null}
      </div>
      <div className="print_footer">
        <LUXButton label="닫기" useRenewalStyle type="confirm" onClick={handleClose} />
        <LUXButton label="출력" useRenewalStyle type="confirm" onClick={handlePrint} blue />
      </div>
    </div>
  );
}
