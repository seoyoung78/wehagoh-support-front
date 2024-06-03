import React, { useEffect, useRef, useState } from "react";

// util
import moment from "moment";
import callApi from "services/apis";
import { lodash } from "common-util/utils";
import { getLocalStorageItem } from "services/utils/localStorage";
import runOnExceedPage from "services/utils/runOnExceedPage";
import { formApi } from "services/apis/formApi";
import Sign from "pages/CSMSP//Sign";
import { globals } from "global";

// common-ui-components
import { LUXButton, LUXSnackbar } from "luna-rocket";

// css
import "assets/style/print.scss";
import withPortal from "hoc/withPortal";
import Message from "components/Common/Message";
import { downloadApi } from "services/apis/formApi";

//imgs
import icArrowUpRed from "assets/imgs/ic_arrow_up_red.png";
import icArrowDownBlue from "assets/imgs/ic_arrow_down_blue.png";
import { getConcatRslt, getRfvlFullTxt } from "pages/MSC_020000/utils/MSC_020000Utils";

/**
 * 진단검사 결과 출력지.
 *
 * 파라미터 명세.
 *
 * {
 *    info : {
 *      pid: string,
 *      pt_nm: string,
 *      dobr: string,
 *      sex_age: string,
 *      cndt_dy: string,
 *      mdcr_date: string,  -- previewOnly에서는 불필요.
 *      rcpn_no: string, -- previewOnly에서는 불필요.
 *      mdcr_dr_sign_lctn: string,  -- previewOnly에서는 불필요.
 *      mdcr_dr_nm: string  -- previewOnly에서는 불필요.
 *    },
 *    data : Object[],
 *    previewOnly : bool -- 필수아님. 미리보기 전용인지 여부.
 * }
 *
 * @author khgkjg12 강현구A
 */
export default function CSMSP001() {
  //useRef start
  const prntElemRef = useRef();
  //useState start
  const [hsptInfo, setHsptInfo] = useState({
    hspt_logo_lctn: undefined,
    hspt_nm: undefined,
    hspt_logo: undefined,
  });
  const [info, setInfo] = useState({
    pid: undefined,
    pt_nm: undefined,
    dobr: undefined,
    sex_age: undefined,
    cndt_dy: undefined,
    mdcr_date: undefined,
    rcpn_no: undefined, // 접수일련번호
    mdcr_dr_sign_lctn: undefined,
    mdcr_dr_nm: undefined,
  });
  const [resultTableList, setResultTableList] = useState([]);
  const [spcmLablSet, setSpcmLablSet] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "error",
  });
  const [signImg, setSignImg] = useState();
  const [previewOnly, setPreviewOnly] = useState(true);
  const [longRslt, setLongRslt] = useState(false);

  useEffect(() => {
    const { hash } = window.location;
    const match = hash.match(/\?(.*)/);
    if (!match) {
      window.close();
    }
    const queryParams = new URLSearchParams(match[1]);
    const localData = getLocalStorageItem(queryParams.get("key"));
    if (!localData) {
      window.close();
    }
    setInfo({ ...localData.info });
    setPreviewOnly(localData.previewOnly);
    const rows = localData.data;
    if (rows.find(e => e.txt_rslt_valu)) setLongRslt(true);
    setResultTableList([rows]);
    setSpcmLablSet(new Set(rows.map(e => e.spcm_labl_nm)));
    const callList = [];
    callList.push(
      callApi("/common/selectHspInfo").then(({ resultData }) => {
        setHsptInfo(resultData);
      }),
    );
    if (!localData.previewOnly) {
      callList.push(
        //미리보기전용 모드가아닐때
        downloadApi(localData.info.mdcr_dr_sign_lctn).then(blob => setSignImg(blob)),
      );
    }
    Promise.allSettled(callList).catch(() =>
      setSnackbar({
        open: true,
        message: Message.networkFail,
        type: "warning",
      }),
    );
  }, []);

  //#region handleClose : 취소
  const closePopUp = () => {
    window.close();
  };
  //#endregion

  //#region handlePrint : 인쇄
  const handleIssueDocument = () => {
    window.onafterprint = function () {
      if (!previewOnly) {
        const paramenters = {
          pid: info.pid, // 환자등록번호
          mdcr_date: info.mdcr_date, // 내원일
          mdfr_clsf_sqno: 160, // 서식분류일련번호
          rcpn_no: info.rcpn_no, // 접수일련번호
          prsc_cd: resultTableList.length > 5 ? "PDZ110102" : "PDZ110001", // 5매 이하(PDZ110001), 5매 초과(PDZ110102)
        };
        formApi(document.getElementById("printArea"), paramenters)
          .then(async ({ resultCode }) => {
            if (resultCode !== 200) throw resultCode;
            const parameters = {
              pt_nm: info.pt_nm,
              mdfr_clsf_sqno: 160,
              exrmClsfCd: "L",
            };
            await callApi("/exam/sendIssueNoti", parameters);
            window.close();
          })
          .catch(() => {
            setSnackbar({
              open: true,
              message: Message.issueFail,
              type: "error",
            });
            setTimeout(() => {
              window.close();
            }, 2000);
          });
      } else {
        setTimeout(() => {
          window.close();
        }, 2000);
      }
    };

    window.print();
  };
  useEffect(() => {
    if (resultTableList.length > 0) {
      runOnExceedPage(prntElemRef.current, 60, i => {
        const nextResultTableList = lodash.cloneDeep(resultTableList);
        if (nextResultTableList.length < i + 2) {
          //마지막 테이블일경우.
          nextResultTableList.push([]);
        }
        nextResultTableList[i + 1].push(nextResultTableList[i].pop());
        setResultTableList(nextResultTableList);
      });
    }
  }, [resultTableList]);

  return (
    <div className="CSMSP001 dp_full print">
      <div id="printArea" ref={prntElemRef}>
        {resultTableList &&
          resultTableList.length > 0 &&
          resultTableList?.map((resultTable, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className="print_box" key={idx}>
              <div className="print_info">{moment().format("YYYY-MM-DD HH:mm:ss")}</div>
              <div className="print_header">
                <div className="print_header_title">
                  <h1>진단검사 결과보고서</h1>
                  <p>{hsptInfo.hspt_nm}</p>
                </div>
                {hsptInfo.hspt_logo_lctn && hsptInfo.hspt_logo_lctn !== "" && (
                  <div className="print_header_logo">
                    <img src={globals.wehagoh_url + hsptInfo.hspt_logo_lctn} alt="" />
                  </div>
                )}
              </div>
              {idx === 0 && (
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
                              <div className="inbx">{info?.pt_nm}</div>
                            </td>
                            <th className="nfont celcnt">환자번호</th>
                            <td className="cellft">
                              <div className="inbx">{info?.pid}</div>
                            </td>
                          </tr>
                          <tr>
                            <th className="nfont celcnt">성별/나이</th>
                            <td className="cellft">
                              <div className="inbx">{info?.sex_age}</div>
                            </td>
                            <th className="nfont celcnt">생년월일</th>
                            <td className="cellft">
                              <div className="inbx">
                                {info?.dobr
                                  ? info.dobr.substring(0, 4) +
                                    "-" +
                                    info.dobr.substring(4, 6) +
                                    "-" +
                                    info.dobr.substring(6, 8)
                                  : ""}
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <th className="nfont celcnt">검사시행일</th>
                            <td className="cellft">
                              <div className="inbx">
                                {info?.cndt_dy && moment(info.cndt_dy, "YYYY-MM-DD").format("YYYY년 MM월 DD일")}
                              </div>
                            </td>
                            <th className="nfont celcnt">검체명</th>
                            <td className="cellft">
                              <div className="inbx">{Array.from(spcmLablSet).join(", ")}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              <div className="print_wrap">
                <div className="print_title">
                  <h3>• 검사 결과 목록</h3>
                </div>
                <div className="print_content">
                  <div className="LUX_basic_tbl">
                    <table className="tblarea2 tblarea2_v2 tblarea2_v3 h_limited_tbl">
                      <colgroup>
                        <col width={longRslt ? "200px" : "310px"} />
                        <col width={longRslt ? "220px" : "110px"} />
                        <col />
                        <col />
                        <col />
                      </colgroup>
                      <thead>
                        <tr onChildFocus={() => null} onChildBlur={() => null}>
                          <th className="nfont celcnt">검사명</th>
                          <th className="nfont celcnt">결과치</th>
                          <th className="nfont celcnt">참고치</th>
                          <th className="nfont celcnt">검사담당자</th>
                          <th className="nfont celcnt">보고일자</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultTable?.map((item, rowIdx) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <tr key={rowIdx}>
                            <td className="cellft">
                              <div className="inbx">{item.prsc_nm}</div>
                            </td>
                            <td className={item.txt_rslt_valu ? "cellft" : "celcnt"} style={{ position: "relative" }}>
                              <div className="inbx">
                                {getConcatRslt(item.exmn_rslt_valu, item.txt_rslt_valu)}
                                {(() => {
                                  switch (item.comp_cd) {
                                    case "L":
                                      return (
                                        <img
                                          style={{
                                            position: "absolute",
                                            right: 3,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                          }}
                                          width={16}
                                          src={icArrowDownBlue}
                                          alt="v"
                                        />
                                      );
                                    case "H":
                                      return (
                                        <img
                                          style={{
                                            position: "absolute",
                                            right: 3,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                          }}
                                          width={16}
                                          src={icArrowUpRed}
                                          alt="^"
                                        />
                                      );
                                    default:
                                      return undefined;
                                  }
                                })()}
                              </div>
                            </td>
                            <td className="celcnt">
                              <div className="inbx">
                                {getRfvlFullTxt(
                                  item.rfvl_lwlm_valu,
                                  item.rfvl_lwlm_rang_type_cd,
                                  item.rfvl_uplm_valu,
                                  item.rfvl_uplm_rang_type_cd,
                                  item.rslt_unit_dvsn,
                                )}
                              </div>
                            </td>
                            <td className="celcnt">
                              <div className="inbx">{item.exmn_pich_nm}</div>
                            </td>
                            <td className="celcnt">
                              <div className="inbx">{item.rptg_dy}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="align_bottom">
                {resultTableList.length - 1 === idx && !previewOnly && (
                  <Sign mdcr_dr_nm={info.mdcr_dr_nm} sign_img={signImg} />
                )}
                <div className="print_wrap">
                  <div className="print_paging">
                    {idx + 1}/{resultTableList.length}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="print_footer">
        {previewOnly ? (
          <LUXButton label="닫기" onClick={closePopUp} type="confirm" />
        ) : (
          <>
            <LUXButton label="닫기" useRenewalStyle type="confirm" onClick={closePopUp} />
            <LUXButton label="출력" useRenewalStyle type="confirm" onClick={handleIssueDocument} blue />
          </>
        )}
      </div>
      {withPortal(
        <LUXSnackbar
          message={snackbar.message}
          onRequestClose={() =>
            setSnackbar({
              ...snackbar,
              open: false,
            })
          }
          open={snackbar.open}
          type="error"
        />,
        "snackbar",
      )}
    </div>
  );
}
