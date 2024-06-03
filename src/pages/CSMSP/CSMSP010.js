import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

// util
import moment from "moment";
import { getLocalStorageItem } from "services/utils/localStorage";
import callApi from "services/apis";
import { formApi, downloadApi } from "services/apis/formApi";
import withPortal from "hoc/withPortal";
import Message from "components/Common/Message";
import { globals } from "global";

// common-ui-components
import { LUXButton, LUXCheckBox, LUXSnackbar } from "luna-rocket";

// css
import "assets/style/print.scss";

// imgs
import chartImg from "assets/imgs/img_chart.png";

/**
 * @name 물리치료 일일 기록지 출력물
 * @author 김령은
 */
export default function CSMSP010() {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const { search } = useLocation();

  const initialRef = useRef({
    pid: "",
    pt_nm: "",
    mdtr_hope_date: "",
    age_cd: "",
    basc_addr: "",
    dgns_nm: "",
    mdcr_user_nm: "",
    rcps_nm: "",
    insn_tycd: "",
    prsc_nm: "",
    graphicCheckboxes: new Map([]),
    trtm_strt_dt: "",
    trtm_end_dt: "",
    mdcr_date: "",
    rcpn_sqno: "",
  });

  const [state, setState] = useState(initialRef.current);
  const [page, setPage] = useState(new Map([]));

  const [mdcrSign, setMdcrSign] = useState("");
  const [rcpsSign, setRcpsSign] = useState("");

  const [hspt, setHspt] = useState({
    hspt_nm: "",
    hspt_logo_lctn: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "error",
    msg: Message.issueFail,
    onOpen: () => setSnackbar(prevState => ({ ...prevState, open: true })),
    onClose: () => {
      setSnackbar(prevState => ({ ...prevState, open: false }));
      window.close();
    },
  }); // 스낵바 상태
  const [calcTextHeight, setCalcTextHeight] = useState(false); // 높이 계산 플래그

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handlePrint = () => {
    window.onafterprint = async () => {
      try {
        const parameters = {
          pid: state.pid,
          mdcr_date: state.mdcr_date,
          mdfr_clsf_sqno: 166,
          rcpn_no: state.rcpn_sqno,
          prsc_cd: page.size > 5 ? "PDZ110102" : "PDZ110001",
        };
        const { resultCode, resultMsg } = await formApi(document.getElementById("printArea"), parameters);
        if (resultCode !== 200) {
          snackbar.onOpen();
          console.error(resultMsg);
        } else {
          const parameters = {
            pt_nm: state.pt_nm,
            mdfr_clsf_sqno: 166,
            exrmClsfCd: "P",
          };
          await callApi("/exam/sendIssueNoti", parameters);
          window.close();
        }
      } catch (error) {
        snackbar.onOpen();
        console.error(error);
      }
    };

    window.print();
  };

  const basicInfoComponent = () => (
    <>
      <div className="print_wrap">
        <div className="print_title">
          <h3>• 기본정보</h3>
        </div>
        <div className="print_content">
          <div className="LUX_basic_tbl">
            <table className="tblarea2 tblarea2_v2 tblarea2_v3">
              <colgroup>
                <col width="120px" />
                <col />
                <col width="120px" />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <th className="nfont celcnt">환자성명</th>
                  <td className="cellft">
                    <div className="inbx">{state.pt_nm}</div>
                  </td>
                  <th className="nfont celcnt">환자번호</th>
                  <td className="cellft">
                    <div className="inbx">{state.pid}</div>
                  </td>
                </tr>
                <tr>
                  <th className="nfont celcnt">치료시행일</th>
                  <td className="cellft">
                    <div className="inbx">{state.mdtr_hope_date}</div>
                  </td>
                  <th className="nfont celcnt">성별/나이</th>
                  <td className="cellft">
                    <div className="inbx">{state.age_cd}</div>
                  </td>
                </tr>
                <tr>
                  <th className="nfont celcnt">주소</th>
                  <td className="cellft" colSpan={3}>
                    <div className="inbx">{state.basc_addr}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="print_wrap">
        <div className="print_title">
          <h3>• 치료정보</h3>
        </div>
        <div className="print_content">
          <div className="LUX_basic_tbl">
            <table className="tblarea2 tblarea2_v2 tblarea2_v3">
              <colgroup>
                <col width="120px" />
                <col />
                <col width="120px" />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <th className="nfont celcnt">주상병</th>
                  <td className="cellft">
                    <div className="inbx">{state.dgns_nm}</div>
                  </td>
                  <th className="nfont celcnt">진료의</th>
                  <td className="cellft">
                    <div className="inbx">{state.mdcr_user_nm}</div>
                  </td>
                </tr>
                <tr>
                  <th className="nfont celcnt">시행자</th>
                  <td className="cellft">
                    <div className="inbx">{state.rcps_nm}</div>
                  </td>
                  <th className="nfont celcnt">보험구분</th>
                  <td className="cellft">
                    <div className="inbx">{state.insn_tycd}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );

  const treatInfoComponent = () => (
    <tr>
      <th className="nfont celcnt">치료명</th>
      <td className="cellft">
        <div className="inbx">{state.prsc_nm}</div>
      </td>
      <th className="nfont celcnt">치료시간</th>
      <td className="cellft">
        <div className="inbx">{`${state.trtm_strt_dt} ~ ${state.trtm_end_dt}`}</div>
      </td>
    </tr>
  );

  const treatTitleCompoent = () => (
    <div className="print_title">
      <h3>• 치료결과</h3>
    </div>
  );

  const renderConditionally = (key, Component) => (key === 1 ? <Component /> : null);

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    // 로컬 스토리지에서 데이터를 가져오고 바로 삭제하는 함수
    const fetchDataAndRemoveFromLocalStorage = () => {
      const queryParams = new URLSearchParams(search);
      const key = queryParams.get("key");
      return getLocalStorageItem(key);
    };

    const addDownloadPromise = (type, key, downloadPromises) => {
      if (key) {
        // key가 존재하며 빈 문자열이나 null이 아닌 경우에만 API 호출
        downloadPromises.push(downloadApi(key).then(blob => ({ type, blob })));
      }
    };

    // 서명을 가져오는 프로미스 생성 함수
    const createDownloadPromises = localStorageData => {
      const downloadPromises = [];
      if (localStorageData) {
        // mdcr_sign과 rcps_sign에 대해 유효성 검사 후, 유효하면 프로미스 추가
        if (localStorageData.mdcr_sign) addDownloadPromise("mdcr_sign", localStorageData.mdcr_sign, downloadPromises);
        if (localStorageData.rcps_sign) addDownloadPromise("rcps_sign", localStorageData.rcps_sign, downloadPromises);
      }
      return Promise.allSettled(downloadPromises);
    };

    // 로컬 스토리지에서 받아온 데이터를 저장
    const localStorageData = search ? fetchDataAndRemoveFromLocalStorage() : null;
    const fetchHospitalInfo = callApi("/common/selectHspInfo");
    const fetchSignatures = createDownloadPromises(localStorageData);

    if (localStorageData) {
      setState(localStorageData);
      setPage(new Map([[1, localStorageData.mdtr_opnn]]));
      setCalcTextHeight(true);
    }

    Promise.allSettled([fetchHospitalInfo, fetchSignatures]).then(([hospitalResult, signaturesResult]) => {
      if (hospitalResult.status === "fulfilled" && hospitalResult.value.resultData) {
        const { hspt_nm, hspt_logo_lctn } = hospitalResult.value.resultData;
        setHspt(prevState => ({ ...prevState, hspt_nm, hspt_logo_lctn }));
      }

      if (signaturesResult.status === "fulfilled") {
        signaturesResult.value.forEach(result => {
          if (result.status === "fulfilled") {
            const updateState = result.value.type === "mdcr_sign" ? setMdcrSign : setRcpsSign;
            updateState(result.value.blob);
          }
        });
      }
    });

    // Cleanup 함수
    return () => {
      setHspt(prevState => ({ ...prevState, hspt_nm: "", hspt_logo_lctn: "" }));
      if (mdcrSign) URL.revokeObjectURL(mdcrSign);
      if (rcpsSign) URL.revokeObjectURL(rcpsSign);
    };
  }, [search]);

  // 소견 높이 계산 로직 수행
  useEffect(() => {
    if (calcTextHeight) {
      const mdtrOpnnElement = document.getElementById("mdtrOpnn");
      // 치료소견
      if (mdtrOpnnElement) {
        // 글자 높이 계산 함수
        const measureLineHeight = line => {
          const tempElement = document.createElement("div");
          tempElement.innerText = line;
          document.body.appendChild(tempElement);
          const lineHeight = tempElement.clientHeight;
          document.body.removeChild(tempElement);
          return lineHeight;
        };

        const parentHeight = mdtrOpnnElement.clientHeight; // 소견 높이
        let currentHeight = 0;
        let currentPageNum = page.size;
        let currentText = "";
        const originText = page.get(currentPageNum);
        const updateMap = new Map(page);
        const lines = originText.split("\n");

        const updatePageContent = (pageMap, pageNum, newText) => {
          pageMap.set(pageNum, newText);
        };

        lines.forEach(value => {
          const line = value + "\n";
          const lineHeight = measureLineHeight(line);

          if (currentHeight + lineHeight > parentHeight) {
            updatePageContent(updateMap, currentPageNum, currentText);
            currentPageNum++;
            currentText = line;
            currentHeight = lineHeight;
          } else {
            currentText += line;
            currentHeight += lineHeight;
          }
        });

        if (currentText) {
          updatePageContent(updateMap, currentPageNum, currentText);
        }

        setPage(updateMap);
      }

      setCalcTextHeight(false);
    }
  }, [calcTextHeight, page]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="CSMSP010 dp_full print">
      <div id="printArea">
        {page.size
          ? Array.from(page).map(([key, value]) => (
              <React.Fragment key={key}>
                <div className="print_box">
                  <div className="print_info">{moment().format("YYYY-MM-DD HH:mm:ss")}</div>
                  <div className="print_header">
                    <div className="print_header_title">
                      <h1>물리치료 일일 기록지</h1>
                      <p>{hspt.hspt_nm}</p>
                    </div>
                    {hspt.hspt_logo_lctn ? (
                      <div className="print_header_logo">
                        <img src={globals.wehagoh_url + hspt.hspt_logo_lctn} alt="img" />
                      </div>
                    ) : null}
                  </div>
                  {renderConditionally(key, basicInfoComponent)}
                  <div className="print_wrap full_size">
                    {renderConditionally(key, treatTitleCompoent)}
                    <div className="print_content">
                      <div className="LUX_basic_tbl">
                        <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                          <colgroup>
                            <col width="120px" />
                            <col />
                            <col width="120px" />
                            <col />
                          </colgroup>
                          <tbody>
                            {renderConditionally(key, treatInfoComponent)}
                            <tr>
                              <th className="nfont celcnt">치료소견</th>
                              <td id="mdtrOpnn" className="cellft" colSpan={3}>
                                <div className="inbx treatment_box">{value}</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  {key === page.size ? (
                    <>
                      <div className="print_wrap">
                        <div className="print_sign">
                          <div className="sign_box">
                            <div>진료의</div>
                            <div>{state.mdcr_user_nm}</div>
                            {mdcrSign && <img src={mdcrSign} alt="" height="38px" width="38px" />}
                            <div className="sign_text">( 서명 또는 인 )</div>
                          </div>
                        </div>
                      </div>
                      <div className="print_wrap">
                        <div className="print_sign">
                          <div className="sign_box">
                            <div>시행자</div>
                            <div>{state.rcps_nm}</div>
                            {rcpsSign && <img src={rcpsSign} alt="" height="38px" width="38px" />}
                            <div className="sign_text">( 서명 또는 인 )</div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                  <div className="print_wrap">
                    <div className="print_paging">
                      {key}/{page.size}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))
          : null}
      </div>
      <div className="print_footer">
        <LUXButton label="닫기" useRenewalStyle type="confirm" onClick={() => window.close()} />
        <LUXButton label="출력" useRenewalStyle type="confirm" onClick={handlePrint} blue />
      </div>
      {withPortal(
        <LUXSnackbar
          autoHideDuration={2000}
          message={snackbar.msg}
          onRequestClose={snackbar.onClose}
          open={snackbar.open}
          type={snackbar.type}
        />,
        "snackbar",
      )}
    </div>
  );
}
