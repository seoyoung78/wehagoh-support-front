import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// util
import moment from "moment";
import { getLocalStorageItem } from "services/utils/localStorage";
import callApi from "services/apis";
import { formApi, downloadApi } from "services/apis/formApi";
import Message from "components/Common/Message";
import withPortal from "hoc/withPortal";
import { globals } from "global";

// common-ui-components
import { LUXButton, LUXSnackbar } from "luna-rocket";

// css
import "assets/style/print.scss";
import Sign from "./Sign";

/**
 * @name 기능검사 결과지
 * @author 김령은
 */

export default function CSMSP002(props) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const PRINT_AREA_ID = "printArea";

  const { search } = useLocation();

  const [hspt, setHspt] = useState({
    hspt_nm: "",
    hspt_logo_lctn: "",
  });

  const [state, setState] = useState({
    pid: "",
    pt_nm: "",
    age_cd: "",
    prsc_nm: "", // 검사명
    sign_lctn: "", // 서명위치
    mdcr_date: "", // 진료일자
    rcpn_sqno: "",
    mdcr_dr_nm: "", // 진료 의사 명
    pt_dvcd: "", // 환자구분코드
    cndt_dt: "", // 검사시행일
  });
  const [page, setPage] = useState(new Map([]));
  const [sign, setSign] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "error",
    msg: Message.issueFail,
    onOpen: () => setSnackbar(prevState => ({ ...prevState, open: true })),
    onClose: () => {
      setSnackbar(prevState => ({ ...prevState, open: false }));
      window.close();
    },
  });

  const [previewOnly, setPreviewOnly] = useState(false);
  const [calcTextHeight, setCalcTextHeight] = useState(false); // 높이 계산 플래그

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handlePrint = () => {
    window.onafterprint = async () => {
      try {
        const parameters = {
          pid: state.pid,
          mdcr_date: state.mdcr_date,
          mdfr_clsf_sqno: 161,
          rcpn_no: state.rcpn_sqno,
          prsc_cd: page.size > 5 ? "PDZ110102" : "PDZ110001",
        };
        const { resultCode, resultMsg } = await formApi(document.getElementById(PRINT_AREA_ID), parameters);
        if (resultCode !== 200) {
          snackbar.onOpen();
          console.error(resultMsg);
        } else {
          const parameters = {
            pt_nm: state.pt_nm,
            mdfr_clsf_sqno: 161,
            exrmClsfCd: "F",
          };
          await callApi("/exam/sendIssueNoti", parameters);
          window.close();
        }
      } catch (error) {
        snackbar.onOpen();
        console.error(error);
      }
    };

    // 프린트 화면으로 전환
    window.print();
  };

  const getCndtDate = () => (state.cndt_dt ? moment(state.cndt_dt, "YYYYMMDDHHmmss").format("YYYY년 MM월 DD일") : "");

  /* ================================================================================== */
  /* Hook(useEffect) */
  // 병원정보가져오기
  useEffect(() => {
    (async () => {
      const { resultData } = await callApi("/common/selectHspInfo");
      if (resultData) {
        setHspt(prevState => ({
          ...prevState,
          hspt_nm: resultData.hspt_nm,
          hspt_logo_lctn: resultData.hspt_logo_lctn,
        }));
      }
    })();
  }, []);

  useEffect(() => {
    // 로컬 스토리지에서 데이터를 가져오고 바로 삭제하는 함수
    const fetchDataAndRemoveFromLocalStorage = () => {
      const queryParams = new URLSearchParams(search);
      const key = queryParams.get("key");
      return getLocalStorageItem(key);
    };

    const createdUrls = [];
    const getPtDvcdName = dvcd => (dvcd === "E" ? "응급" : dvcd === "I" ? "입원" : dvcd === "O" ? "외래" : "");
    const initializeState = (data, blobList = []) => {
      const pageMap = new Map([]);
      const initialValue = { fileList: [], iptnRslt: "" };
      let imgCount = 0;

      // if (blobList.length) {
      //   blobList.forEach((value, index) => {
      //     const mapKey = Math.ceil((+index + 1) / 2);
      //     const values = pageMap.get(mapKey) || initialValue;
      //     if (value instanceof Blob) {
      //       imgCount++;
      //       const imageUrl = URL.createObjectURL(value);
      //       pageMap.set(mapKey, { ...values, fileList: [...values.fileList, imageUrl] });
      //       createdUrls.push(imageUrl);
      //     }
      //   });

      //   if (imgCount % 2 !== 0) {
      //     // 홀수 : 이미지 + 텍스트
      //     const updateKey = pageMap.size;
      //     const updateValues = pageMap.get(updateKey);
      //     pageMap.set(updateKey, { ...updateValues, iptnRslt: data.iptn_rslt });
      //   } else {
      //     pageMap.set(pageMap.size + 1, { ...initialValue, iptnRslt: data.iptn_rslt });
      //   }
      // } else {
      pageMap.set(1, { ...initialValue, iptnRslt: data.iptn_rslt });
      // }

      setPreviewOnly(data.previewOnly);
      data.pt_dvcd = getPtDvcdName(data.pt_dvcd);
      setState(prevState => ({ ...prevState, ...data }));
      setPage(pageMap);
      setCalcTextHeight(true);
    };

    if (search) {
      // 로컬 스토리지에서 받아온 데이터를 저장
      const localStorageData = fetchDataAndRemoveFromLocalStorage();

      if (localStorageData) {
        initializeState(localStorageData);
        // @@@@@@@@@@@ [변수명 변경됨 : 사용 시 코드 수정]
        // if (data?.fileList && data.fileList.length) {
        //   // 이미지 파일 다운로드
        //   const downloadPromises = data.fileList.map(async ({ file_path_id, seq }) => {
        //     const blob = await downloadApi(file_path_id);
        //     if (blob) blob.seq = seq;
        //     return blob;
        //   });

        //   Promise.all(downloadPromises)
        //     .then(blobList => {
        //       initializeState(data, blobList);
        //     })
        //     .catch(error => {
        //       console.error("모든 다운로드 API 호출에 실패하였습니다", error);
        //       initializeState(data);
        //     });
        // } else {
        //   initializeState(data);
        // }
      }

      if (localStorageData?.mdcr_sign_lctn) {
        (async () => {
          try {
            const blob = await downloadApi(localStorageData.mdcr_sign_lctn);
            if (blob) {
              setSign(blob);
            }
          } catch (error) {
            console.error(error);
          }
        })();
      }
    }

    return () => {
      setHspt(prevState => ({ ...prevState, hspt_nm: "", hspt_logo_lctn: "" }));
      if (sign) URL.revokeObjectURL(sign);
      // 생성된 모든 URL 해제
      createdUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [search]);

  useEffect(() => {
    if (calcTextHeight) {
      const iptnRsltElement = document.getElementById("iptnRslt"); // 기능검사 판독소견

      // 판독소견
      if (iptnRsltElement) {
        // 글자 높이 계산 함수
        const measureLineHeight = line => {
          const tempElement = document.createElement("div");
          tempElement.innerText = line;
          document.body.appendChild(tempElement);
          const lineHeight = tempElement.clientHeight;
          document.body.removeChild(tempElement);
          return lineHeight;
        };

        const updatePageContent = (pageMap, pageNum, newText) => {
          const defaultContent = pageMap.get(pageNum) || { fileList: [], iptnRslt: "" };
          pageMap.set(pageNum, { ...defaultContent, iptnRslt: newText });
        };

        const parentHeight = iptnRsltElement.clientHeight; // 소견 높이
        let currentHeight = 0;
        let currentPageNum = page.size;
        let currentText = "";
        const originText = page.get(currentPageNum);
        const updateMap = new Map(page);
        const lines = originText.iptnRslt.split("\n");

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
    <div className="CSMSP002 dp_full print">
      <div id={PRINT_AREA_ID}>
        {page.size
          ? Array.from(page).map(([key, value]) => (
              <React.Fragment key={key}>
                <div className="print_box">
                  <div className="print_info">{moment().format("YYYY-MM-DD HH:mm:ss")}</div>
                  <div className="print_header">
                    <div className="print_header_title">
                      <h1>기능검사 결과 보고서</h1>
                      <p>{hspt.hspt_nm}</p>
                    </div>
                    {hspt.hspt_logo_lctn ? (
                      <div className="print_header_logo">
                        <img src={globals.wehagoh_url + hspt.hspt_logo_lctn} alt="" />
                      </div>
                    ) : null}
                  </div>
                  {key === 1 ? (
                    <div id="printTable" className="print_wrap">
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
                                <th className="nfont celcnt">외래/병실</th>
                                <td className="cellft">
                                  <div className="inbx">{state.pt_dvcd}</div>
                                </td>
                                <th className="nfont celcnt">성별/나이</th>
                                <td className="cellft">
                                  <div className="inbx">{state.age_cd}</div>
                                </td>
                              </tr>
                              <tr>
                                <th className="nfont celcnt">검사시행일</th>
                                <td className="cellft">
                                  <div className="inbx">{getCndtDate()}</div>
                                </td>
                                <th className="nfont celcnt">검사명</th>
                                <td className="cellft">
                                  <div className="inbx">{state.prsc_nm}</div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {value.fileList.length ? (
                    <>
                      {value.fileList.map((url, index) => (
                        <div key={url} className="print_wrap">
                          {index === 0 && (
                            <div className="print_title">
                              <h3>• 기능검사 결과</h3>
                            </div>
                          )}
                          <div key={url + index} className="print_content">
                            <div className="img_box full_size">
                              <img src={url} alt="Preview" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : null}
                  {key !== page.size && value.fileList.length > 1 ? null : (
                    <div className="print_wrap full_size">
                      <div className="print_title">
                        <h3>• 기능검사 판독소견</h3>
                      </div>
                      <div id="iptnRslt" className="print_content">
                        <div className="text_box">
                          <div className="text_area">{value.iptnRslt}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!previewOnly && key === page.size ? <Sign mdcr_dr_nm={state.mdcr_dr_nm} sign_img={sign} /> : null}
                  <div id="printPaging" className="print_wrap">
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
        {previewOnly ? null : <LUXButton label="출력" useRenewalStyle type="confirm" onClick={handlePrint} blue />}
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
