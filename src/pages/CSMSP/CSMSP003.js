import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// util
import moment from "moment";
import { getLocalStorageItem } from "services/utils/localStorage";
import callApi from "services/apis";
import { downloadApi, formApi } from "services/apis/formApi";
import withPortal from "hoc/withPortal";
import Message from "components/Common/Message";
import { lodash } from "common-util/utils";
import { globals } from "global";

// common-ui-components
import { LUXButton, LUXSnackbar } from "luna-rocket";

// css
import "assets/style/print.scss";

// imgs

import Sign from "./Sign";

/**
 * @name 윤서영
 * @author 영상검사결과지
 */

export default function CSMSP003() {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const { search } = useLocation();

  const [state, setState] = useState({
    hspt_nm: "",
    hspt_logo_lctn: "",
  });

  const [data, setData] = useState([]);

  const [ptInfo, setPtInfo] = useState({
    pid: "",
    pt_nm: "",
    age_cd: "",
    pt_dvcd: "",
  });

  const [snack, setSnack] = useState({ open: false, type: "error", msg: Message.issueFail }); // 스낵바 상태

  const printRef = useRef();

  const [result, setResult] = useState({});

  const [total, setTotal] = useState(0);
  const [previewOnly, setPreviewOnly] = useState(false);

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handleDownload = list => {
    const rsltList = {};
    Promise.all(
      list.map(item =>
        (async () => {
          rsltList[item.pid + item.prsc_nm + item.prsc_sqno] = [item.iptn_rslt];
          if (item.sign_lctn && item.sign_lctn !== "") {
            try {
              await downloadApi(item.sign_lctn).then(blob => {
                if (blob) {
                  item.sign_img = blob;
                } else {
                  item.sign_img = null;
                }
              });
            } catch (e) {
              item.sign_img = null;
            }
          } else {
            item.sign_img = null;
          }
          return item;
        })(),
      ),
    ).then(newData => {
      setResult(rsltList);
      setData(newData);
    });
  };

  // 취소
  const handleClose = () => {
    window.close();
  };

  // 인쇄
  const handlePrint = () => {
    window.onafterprint = function () {
      const parameters = {
        pid: ptInfo.pid,
        mdcr_date: ptInfo.mdcr_date,
        mdfr_clsf_sqno: 162,
        rcpn_no: data[0].rcpn_no,
        prsc_cd: total > 5 ? "PDZ110102" : "PDZ110001",
      };
      formApi(document.getElementById("printArea"), parameters)
        .then(async ({ resultCode }) => {
          if (resultCode !== 200) {
            setSnack({ ...snack, open: true });
          } else {
            const parameters = {
              pt_nm: ptInfo.pt_nm,
              mdfr_clsf_sqno: 162,
              exrmClsfCd: "R",
            };
            await callApi("/exam/sendIssueNoti", parameters);
            window.close();
          }
        })
        .catch(e => setSnack({ ...snack, open: true }));
    };

    // 프린트 화면으로 전환
    window.print();
  };

  // 글자 높이 계산
  const measureLineHeight = line => {
    const tempElement = document.createElement("div");
    tempElement.innerText = line;
    document.body.appendChild(tempElement);
    const lineHeight = tempElement.clientHeight;
    document.body.removeChild(tempElement);
    return lineHeight;
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  // 병원정보가져오기
  useEffect(() => {
    (async () => {
      await callApi("/common/selectHspInfo").then(({ resultData }) => {
        setState(prev => ({ ...prev, ...resultData }));
      });
    })();
  }, []);

  useEffect(() => {
    // 로컬스토리지 사용
    if (search) {
      const queryParams = new URLSearchParams(search);
      const data = getLocalStorageItem(queryParams.get("key"));
      handleDownload(data.list);
      setPtInfo(data.ptInfo);
      setPreviewOnly(data.previewOnly);
    }
  }, [search]);

  useEffect(() => {
    if (data.length > 0) {
      const newResult = lodash.cloneDeep(result);

      data.map(data => {
        const key = data.pid + data.prsc_nm + data.prsc_sqno;
        result[key].map((res, idx) => {
          const parent = document.getElementById(key + idx).getElementsByClassName("text_box")[0];
          const child = parent.getElementsByClassName("text_area")[0];
          const parentHeight = parent.clientHeight - 20;
          let currentHeight = 0;
          let currentText = "";

          if (parentHeight < child.clientHeight) {
            newResult[key] = [];
            const lines = res.split("\n");
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i] + "\n";
              const lineHeight = measureLineHeight(line);

              if (currentHeight + lineHeight > parentHeight) {
                newResult[key].push(currentText);
                currentText = line;
                currentHeight = lineHeight;
              } else {
                currentText += line;
                currentHeight += lineHeight;
              }
            }
          }

          if (currentText) {
            newResult[key].push(currentText);
          }
        });
      });
      setResult(newResult);
      setTotal(
        Object.keys(newResult)
          .map(key => newResult[key].length)
          .reduce((acc, cur) => acc + cur, 0),
      );
    }
    return () => {
      data.map(list => list.sign_img && URL.revokeObjectURL(list.sign_img));
    };
  }, [data]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="CSMSP003 dp_full print">
      <div id="printArea" ref={printRef}>
        {data &&
          data.length > 0 &&
          data.map((list, index) => (
            <div>
              {Object.keys(result).length > 0 &&
                result[list.pid + list.prsc_nm + list.prsc_sqno]?.map((res, idx) => (
                  <div
                    className="print_box"
                    key={list.pid + list.prsc_nm + list.prsc_sqno + idx}
                    id={list.pid + list.prsc_nm + list.prsc_sqno + idx}
                  >
                    <div className="print_info">{moment().format("YYYY-MM-DD HH:mm:ss")}</div>
                    <div className="print_header">
                      <div className="print_header_title">
                        <h1>영상검사 결과 보고서</h1>
                        <p>{state.hspt_nm}</p>
                      </div>
                      {state.hspt_logo_lctn && state.hspt_logo_lctn !== "" && (
                        <div className="print_header_logo">
                          <img src={globals.wehagoh_url + state.hspt_logo_lctn} alt="" />
                        </div>
                      )}
                    </div>
                    {index === 0 && idx === 0 && (
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
                                    <div className="inbx">{ptInfo.pt_nm_only}</div>
                                  </td>
                                  <th className="nfont celcnt">환자번호</th>
                                  <td className="cellft">
                                    <div className="inbx">{ptInfo.pid}</div>
                                  </td>
                                </tr>
                                <tr>
                                  <th className="nfont celcnt">성별/나이</th>
                                  <td className="cellft">
                                    <div className="inbx">{ptInfo.age_cd}</div>
                                  </td>
                                  <th className="nfont celcnt">생년월일</th>
                                  <td className="cellft">
                                    <div className="inbx flex">{moment(ptInfo.dobr).format("YYYY-MM-DD")}</div>
                                  </td>
                                </tr>
                                <tr>
                                  <th className="nfont celcnt">검사시행일</th>
                                  <td className="cellft">
                                    <div className="inbx">{list.cndt_dt}</div>
                                  </td>
                                  <th className="nfont celcnt">검사명</th>
                                  <td className="cellft">
                                    <div className="inbx">{list.prsc_nm}</div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="print_wrap full_size">
                      <div className="print_title">
                        <h3>• 영상검사 판독소견</h3>
                      </div>
                      <div className="print_content">
                        <div className="text_box">
                          <div className="text_area">{res}</div>
                        </div>
                      </div>
                    </div>
                    {!previewOnly && result[list.pid + list.prsc_nm + list.prsc_sqno]?.length - 1 === idx && (
                      <Sign mdcr_dr_nm={ptInfo.mdcr_dr_nm} sign_img={list.sign_img} />
                    )}
                    <div className="print_wrap">
                      <div className="print_paging">
                        {(index === 0
                          ? 0
                          : Object.keys(result)
                              .map(key => result[key].length)
                              .slice(0, index)
                              .reduce((acc, crr) => acc + crr, 0)) +
                          idx +
                          1}
                        /{total}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))}
      </div>
      <div className="print_footer">
        {previewOnly ? (
          <LUXButton label="닫기" onClick={handleClose} type="confirm" />
        ) : (
          <>
            <LUXButton label="닫기" useRenewalStyle type="confirm" onClick={handleClose} />
            <LUXButton label="출력" useRenewalStyle type="confirm" onClick={handlePrint} blue />
          </>
        )}
      </div>
      {withPortal(
        <LUXSnackbar
          autoHideDuration={2000}
          message={snack.msg}
          onRequestClose={() => {
            setSnack({ ...snack, open: false });
            window.close();
          }}
          open={snack.open}
          type={snack.type}
        />,
        "snackbar",
      )}
    </div>
  );
}
