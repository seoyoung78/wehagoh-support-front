import React from "react";

// util
import PropTypes from "prop-types";
import moment from "moment";
import { globals } from "global";

// common-ui-components
import { LUXRadioButtonGroup, LUXRadioButton, LUXCheckBox } from "luna-rocket";

import { resultKeys, cmcdCd } from "pages/MSC_050000/utils/MSC_050000_NameCodesMapping";
import { createFormatter, formatSimpleText } from "pages/MSC_050000/utils/MSC_050000_Utils";

// imgs

/**
 * @name  결과기록 위장
 * @author 김령은
 */
export default function MSC_050200_T02_GSIT(props) {
  const { sign, resultList, resultEntries, hspt, patient, isEditDisabled, exmnInfo } = props;

  /* ================================================================================== */
  /* 상태(state) 선언 */
  // 조건에 따라 컴포넌트가 추가되는 공통코드
  const TRTM_CD_ETC = "5"; // 기타
  const ADVC_MATR_ETC = "5"; // 기타

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const formatWithResultEntries = createFormatter(resultEntries);

  /* ================================================================================== */
  /* Hook(useEffect) */

  /* ================================================================================== */
  /* render() */
  return (
    <div className="print_box">
      <div className="print_info">{moment().format("YYYY-MM-DD HH:mm:ss")}</div>
      <div className="print_header">
        <div className="print_header_title">
          <h1>위내시경 결과기록지</h1>
          <p>{hspt.hspt_nm}</p>
        </div>
        {hspt.hspt_logo_lctn ? (
          <div className="print_header_logo">
            <img src={globals.wehagoh_url + hspt.hspt_logo_lctn} alt="" />
          </div>
        ) : null}
      </div>
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
                    <div className="inbx">{patient.pt_nm}</div>
                  </td>
                  <th className="nfont celcnt">환자번호</th>
                  <td className="cellft">
                    <div className="inbx">{patient.pid}</div>
                  </td>
                </tr>
                <tr>
                  <th className="nfont celcnt">검사시행일</th>
                  <td className="cellft">
                    <div className="inbx">
                      {exmnInfo.cndt_dt ? moment(exmnInfo.cndt_dt).format("YYYY년 MM월 DD일") : null}
                    </div>
                  </td>
                  <th className="nfont celcnt">판정일</th>
                  <td className="cellft">
                    <div className="inbx">
                      {exmnInfo.iptn_dt ? moment(exmnInfo.iptn_dt, "YYYYMMDDHHmmss").format("YYYY년 MM월 DD일") : null}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="nfont celcnt">내시경 검사의</th>
                  <td className="cellft">
                    <div className="inbx">{exmnInfo.iptn_prsn_nm}</div>
                  </td>
                  <th className="nfont celcnt">기존 위암환자</th>
                  <td className="cellft">
                    <div className="inbx">
                      {resultEntries.get(resultKeys.gscnPtYn) === "Y"
                        ? "해당"
                        : resultEntries.get(resultKeys.gscnPtYn) === "N"
                        ? "미해당"
                        : ""}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div id="printTable" className="print_wrap">
        <div className="print_title">
          <h3>• 관찰소견</h3>
        </div>
        <div className="print_content">
          <div className="LUX_basic_tbl">
            <table className="tblarea2 tblarea2_v2 tblarea2_v3">
              <caption>
                <span className="blind"></span>
              </caption>
              <colgroup>
                <col style={{ width: "120px" }} />
                <col />
                <col style={{ width: "120px" }} />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    검사명
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx">
                      <p className="ellipsis">{resultEntries.get(resultKeys.exmnNm)}</p>
                    </div>
                  </td>
                </tr>
                {resultList.get(resultKeys.exmnObsrOpnnSqno).map((value, index) => (
                  <React.Fragment key={`obsrOpnn${index}`}>
                    <tr>
                      <th scope="row" className="nfont celcnt">
                        관찰소견
                      </th>
                      <td className="cellft" colSpan="3">
                        <div className="inbx">
                          <div className="tblConBox clearfix">
                            {value[resultKeys.obsrOpnnSite1].map(({ cmcd_cd, cmcd_nm, checked }, childIndex) => (
                              <React.Fragment key={`${index}${cmcd_cd}${cmcd_nm}`}>
                                <LUXCheckBox
                                  id={resultKeys.obsrOpnnSite1}
                                  labelText={cmcd_nm}
                                  checked={checked}
                                  disabled={isEditDisabled}
                                  style={{ marginRight: "10px" }}
                                />
                              </React.Fragment>
                            ))}
                          </div>
                          <div className="editalbe_box con_box_margin avoid_page_break">
                            <div className="record_comment">{value[resultKeys.obsrOpnnCnts]}</div>
                          </div>
                          <div className="tblConBox">
                            <div className="LUX_basic_select">{value[resultKeys.obsrOpnn].name}</div>
                            <div className="inbx type_flex">
                              <LUXCheckBox
                                id={resultKeys.tisuExmnYn}
                                labelText={value[resultKeys.tisuExmnYn].name}
                                checked={value[resultKeys.tisuExmnYn].checked}
                                disabled={isEditDisabled}
                              />
                              {value[resultKeys.tisuExmnNoit]
                                ? formatWithResultEntries(resultKeys.tisuExmnNoit, "", "개")
                                : null}
                            </div>
                            <p>조직검사 결과</p>
                            <div className="LUX_basic_select">{`( ${
                              value[resultKeys.tisuExmnRslt1].name || "-"
                            } )`}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
                <tr>
                  <th scope="row" className="nfont celcnt" style={{ fontSize: "11px" }}>
                    헬리코박터균 검사결과
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">
                      <LUXRadioButtonGroup
                        id={resultKeys.stmcBctrExmnRslt}
                        name={resultKeys.stmcBctrExmnRslt}
                        defaultSelected={resultEntries.get(resultKeys.stmcBctrExmnRslt)}
                      >
                        {resultList.get(cmcdCd[resultKeys.stmcBctrExmnRslt]).map(({ cmcd_cd, cmcd_nm }) => (
                          <LUXRadioButton
                            key={`${cmcd_cd}${cmcd_nm}`}
                            value={cmcd_cd}
                            labelText={cmcd_nm}
                            disabled={isEditDisabled}
                            style={{ marginRight: "10px" }}
                          />
                        ))}
                      </LUXRadioButtonGroup>
                    </div>
                  </td>
                  <th scope="row" className="nfont celcnt">
                    CLO
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">
                      {resultList.get(cmcdCd[resultKeys.cloCd]).map(({ cmcd_cd, cmcd_nm, checked }, index) => (
                        <LUXCheckBox
                          key={`${cmcd_cd}${cmcd_nm}`}
                          id={cmcdCd[resultKeys.cloCd]}
                          labelText={cmcd_nm}
                          checked={checked}
                          disabled={isEditDisabled}
                          style={{ marginRight: "10px" }}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
                <tr className="avoid_page_break">
                  <th scope="row" className="nfont celcnt">
                    처치 및 치료
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">
                      {resultList.get(cmcdCd[resultKeys.trtmMdtrCd]).map(({ cmcd_cd, cmcd_nm, checked }, index) => (
                        <React.Fragment key={`${cmcd_cd}${cmcd_nm}`}>
                          <LUXCheckBox
                            id={cmcdCd[resultKeys.trtmMdtrCd]}
                            labelText={cmcd_nm}
                            checked={checked}
                            disabled={isEditDisabled}
                          />
                          {cmcd_cd === TRTM_CD_ETC ? formatWithResultEntries(resultKeys.trtmMdtrCnts) : null}
                        </React.Fragment>
                      ))}
                    </div>
                  </td>
                  <th scope="row" className="nfont celcnt">
                    절제술 시행방법
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">
                      <LUXRadioButtonGroup
                        id={resultKeys.exsnPrcdActgMthd}
                        name={resultKeys.exsnPrcdActgMthd}
                        defaultSelected={resultEntries.get(resultKeys.exsnPrcdActgMthd)}
                      >
                        {resultList.get(cmcdCd[resultKeys.exsnPrcdActgMthd]).map(({ cmcd_cd, cmcd_nm }) => (
                          <LUXRadioButton
                            key={`${cmcd_cd}${cmcd_nm}`}
                            value={cmcd_cd}
                            labelText={cmcd_nm}
                            style={{ marginRight: "8px" }}
                            disabled={isEditDisabled}
                          />
                        ))}
                      </LUXRadioButtonGroup>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    합병증 여부
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">
                      <LUXRadioButtonGroup
                        id={resultKeys.cmpcYn}
                        name={resultKeys.cmpcYn}
                        defaultSelected={resultEntries.get(resultKeys.cmpcYn)}
                      >
                        <LUXRadioButton
                          value="Y"
                          labelText="합병증 발생"
                          style={{ marginRight: "10px" }}
                          disabled={isEditDisabled}
                        />
                        <LUXRadioButton
                          value="N"
                          labelText="합병증 미발생"
                          style={{ marginRight: "10px" }}
                          disabled={isEditDisabled}
                        />
                      </LUXRadioButtonGroup>
                    </div>
                  </td>
                  <th scope="row" className="nfont celcnt">
                    합병증
                  </th>
                  <td className="cellft">
                    <div className="inbx">{formatSimpleText(resultEntries.get(resultKeys.cmpcCnts))}</div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    합병증 처치방법
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx">
                      <LUXRadioButtonGroup
                        id={resultKeys.cmpcTrtmMthd}
                        name={resultKeys.cmpcTrtmMthd}
                        defaultSelected={resultEntries.get(resultKeys.cmpcTrtmMthd)}
                      >
                        {resultList.get(cmcdCd[resultKeys.cmpcTrtmMthd]).map(({ cmcd_cd, cmcd_nm }) => (
                          <LUXRadioButton
                            key={`${cmcd_cd}${cmcd_nm}`}
                            value={cmcd_cd}
                            labelText={cmcd_nm}
                            disabled={isEditDisabled}
                            style={{ marginRight: "10px" }}
                          />
                        ))}
                      </LUXRadioButtonGroup>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    합병증 경과
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">
                      <LUXRadioButtonGroup
                        id={resultKeys.cmpcPrgr}
                        name={resultKeys.cmpcPrgr}
                        defaultSelected={resultEntries.get(resultKeys.cmpcPrgr)}
                      >
                        {resultList.get(cmcdCd[resultKeys.cmpcPrgr]).map(({ cmcd_cd, cmcd_nm }) => (
                          <LUXRadioButton
                            key={`${cmcd_cd}${cmcd_nm}`}
                            value={cmcd_cd}
                            labelText={cmcd_nm}
                            disabled={isEditDisabled}
                            style={{ marginRight: "10px" }}
                          />
                        ))}
                      </LUXRadioButtonGroup>
                    </div>
                  </td>
                </tr>
                <tr className="avoid_page_break">
                  <th scope="row" className="nfont celcnt">
                    암검진 권고사항
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx">
                      <div className="editalbe_box">
                        <div className="record_comment">{resultEntries.get(resultKeys.cncrMdexAdvcMatr)}</div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="avoid_page_break">
                  <th scope="row" className="nfont celcnt">
                    권고사항
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">
                      {resultList.get(cmcdCd[resultKeys.advcMatr]).map(({ cmcd_cd, cmcd_nm, checked }, index) => (
                        <React.Fragment key={`${cmcd_cd}${cmcd_nm}`}>
                          <LUXCheckBox
                            id={cmcdCd[resultKeys.advcMatr]}
                            labelText={cmcd_nm}
                            checked={checked}
                            disabled={isEditDisabled}
                          />
                          {cmcd_cd === ADVC_MATR_ETC ? formatWithResultEntries(resultKeys.advcMatrCnts) : null}
                        </React.Fragment>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="print_wrap">
        <div className="print_sign">
          <div className="sign_box">
            <span>발급 일자</span>
            <span>{moment().format("YYYY-MM-DD")}</span>
          </div>
          <div className="sign_box">
            <div>검사의</div>
            <div>{exmnInfo.iptn_prsn_nm}</div>
            {sign ? <img src={sign} width="38px" height="38px" alt="" /> : null}
            <div className="sign_text">( 서명 또는 인 )</div>
          </div>
        </div>
      </div>
    </div>
  );
}

MSC_050200_T02_GSIT.propTypes = {
  resultList: PropTypes.instanceOf(Map),
  resultEntries: PropTypes.instanceOf(Map),
  patient: PropTypes.shape({
    pt_nm: PropTypes.string,
    pid: PropTypes.string,
  }),
  isEditDisabled: PropTypes.bool,
  hspt: PropTypes.shape({
    hspt_nm: PropTypes.string,
    hspt_logo_lctn: PropTypes.string,
  }),
  sign: PropTypes.string,
  exmnInfo: PropTypes.shape({
    cndt_dt: PropTypes.string,
    iptn_dt: PropTypes.string,
    iptn_prsn_nm: PropTypes.string,
  }),
};
MSC_050200_T02_GSIT.defaultProps = {
  resultList: new Map([]),
  resultEntries: new Map([]),
  isEditDisabled: true,
  patient: {
    pt_nm: "",
    pid: "",
  },
  hspt: {
    hspt_nm: "",
    hspt_logo_lctn: "",
  },
  sign: "",
  exmnInfo: {
    cndt_dt: "", // 검사일
    iptn_dt: "", // 판정일
    iptn_prsn_nm: "", // 판독의사 명
  },
};
