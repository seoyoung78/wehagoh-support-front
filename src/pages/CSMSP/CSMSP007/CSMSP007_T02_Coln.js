import React from "react";

// util
import PropTypes from "prop-types";
import moment from "moment";
import { globals } from "global";

// common-ui-components
import { LUXRadioButtonGroup, LUXRadioButton, LUXCheckBox } from "luna-rocket";

import { resultKeys, cmcdCd } from "pages/MSC_050000/utils/MSC_050000_NameCodesMapping";
import { formatSimpleText } from "pages/MSC_050000/utils/MSC_050000_Utils";

// scss

// imgs

/**
 * @name  결과기록 대장
 * @author 김령은
 */
export default function MSC_050200_T02_COLN(props) {
  const { sign, resultList, resultEntries, hspt, patient, isEditDisabled, exmnInfo } = props;

  /* ================================================================================== */
  /* 상태(state) 선언 */

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const formatKeyText = key => formatSimpleText(resultEntries.get(key));

  /* ================================================================================== */
  /* Hook(useEffect) */

  /* ================================================================================== */
  /* render() */
  return (
    <div className="print_box">
      <div className="print_info">{moment().format("YYYY-MM-DD HH:mm:ss")}</div>
      <div className="print_header">
        <div className="print_header_title">
          <h1>대장내시경 결과기록지</h1>
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
                      {exmnInfo.iptn_dt ? moment(exmnInfo.iptn_dt).format("YYYY년 MM월 DD일") : null}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="nfont celcnt">내시경 검사의</th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx">{exmnInfo.iptn_prsn_nm}</div>
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
                <col style={{ width: "60px" }} />
                <col style={{ width: "60px" }} />
                <col />
                <col style={{ width: "120px" }} />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <th scope="row" className="nfont celcnt" colSpan="2">
                    외부관찰소견
                  </th>
                  <td className="cellft">
                    <div className="inbx">{resultEntries.get(resultKeys.etnlObsrOpnn)}</div>
                  </td>
                  <th scope="row" className="nfont celcnt">
                    직장수지소견
                  </th>
                  <td className="cellft">
                    <div className="inbx">{resultEntries.get(resultKeys.dreOpnn)}</div>
                  </td>
                </tr>
                {resultList.get(resultKeys.exmnObsrOpnnSqno).map((value, index) => (
                  <React.Fragment key={`obsrOpnn${index}`}>
                    <tr>
                      <th scope="row" className="nfont celcnt" colSpan="2">
                        대장내시경 관찰소견
                      </th>
                      <td className="cellft" colSpan="3">
                        <div>
                          <LUXRadioButtonGroup
                            id={resultKeys.obsrOpnnSite2}
                            name={resultKeys.obsrOpnnSite2}
                            defaultSelected={value[resultKeys.obsrOpnnSite2]}
                          >
                            {resultList.get(cmcdCd[resultKeys.obsrOpnnSite2]).map(({ cmcd_cd, cmcd_nm }) => (
                              <LUXRadioButton
                                key={`${cmcd_cd}${cmcd_nm}`}
                                value={cmcd_cd}
                                labelText={cmcd_nm}
                                disabled={isEditDisabled}
                                className="common_radio_input"
                              />
                            ))}
                          </LUXRadioButtonGroup>
                        </div>
                        <div className="inbx con_box_margin top">
                          <div className="editalbe_box con_box_margin avoid_page_break">
                            <div className="record_comment">{value[resultKeys.obsrOpnnCnts]}</div>
                          </div>
                          <div className="tblConBox">
                            <div className="LUX_basic_switch">
                              <LUXCheckBox
                                id={resultKeys.tisuExmnYn}
                                labelText={value[resultKeys.tisuExmnYn].name}
                                checked={value[resultKeys.tisuExmnYn].checked}
                                disabled={isEditDisabled}
                                style={{ marginRight: "10px" }}
                              />
                            </div>
                            <div className="LUX_basic_select">
                              {formatSimpleText(value[resultKeys.tisuExmnRslt2].name)}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
                <tr>
                  <th scope="row" className="nfont celcnt" colSpan="2">
                    관찰소요시간
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex type_flexGroup">
                      <div className="editBox">
                        <p className="editText">삽입(도달)시간</p>
                        <div className="LUX_basic_text">{formatKeyText(resultKeys.obsrInrtMinutes)}</div>
                        <p className="editText">분</p>
                        <div className="LUX_basic_text">{formatKeyText(resultKeys.obsrInrtSeconds)}</div>
                        <p className="editText">초</p>
                      </div>
                      <div className="editBox">
                        <p className="editText">검사종료시간</p>
                        <div className="LUX_basic_text">{formatKeyText(resultKeys.obsrExmnEndMinutes)}</div>
                        <p className="editText">분</p>
                        <div className="LUX_basic_text">{formatKeyText(resultKeys.obsrExmnEndSeconds)}</div>
                        <p className="editText">초</p>
                      </div>

                      <div className="editBox">
                        <p className="editText">회수시간</p>
                        <div className="LUX_basic_text">{formatKeyText(resultKeys.obsrReclTimeMinutes)}</div>
                        <p className="editText">분</p>
                        <div className="LUX_basic_text">{formatKeyText(resultKeys.obsrReclTimeSeconds)}</div>
                        <p className="editText">초</p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt" colSpan="2">
                    관찰소요시간
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex type_flexGroup">
                      <div className="editBox">
                        <div className="LUX_basic_text">{`삽입(도달)시간 ${formatKeyText(
                          resultKeys.obsrInrtMinutes,
                        )} 분 ${formatKeyText(resultKeys.obsrInrtSeconds)} 초`}</div>
                      </div>
                      <div className="editBox">
                        <div className="LUX_basic_text">{`검사종료시간 ${formatKeyText(
                          resultKeys.obsrExmnEndMinutes,
                        )} 분 ${formatKeyText(resultKeys.obsrExmnEndSeconds)} 초`}</div>
                      </div>
                      <div className="editBox">
                        <div className="LUX_basic_text">{`회수시간 ${formatKeyText(
                          resultKeys.obsrReclTimeMinutes,
                        )} 분 ${formatKeyText(resultKeys.obsrReclTimeSeconds)} 초`}</div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="avoid_page_break">
                  <th scope="row" className="nfont celcnt" rowSpan="4">
                    BBPS
                  </th>
                  <th scope="row" className="nfont celcnt">
                    LC
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">
                      <LUXRadioButtonGroup
                        id={resultKeys.bpreDgreLC}
                        name={resultKeys.bpreDgreLC}
                        defaultSelected={resultEntries.get(resultKeys.bpreDgreLC)}
                      >
                        {resultList.get(cmcdCd[resultKeys.bpreDgreLC]).map(({ cmcd_cd, cmcd_nm }) => (
                          <LUXRadioButton
                            key={`${cmcd_cd}${cmcd_nm}`}
                            value={cmcd_cd}
                            labelText={cmcd_nm}
                            disabled={isEditDisabled}
                            className="common_radio_input"
                          />
                        ))}
                      </LUXRadioButtonGroup>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    TC
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">
                      <LUXRadioButtonGroup
                        id={resultKeys.bpreDgreTC}
                        name={resultKeys.bpreDgreTC}
                        defaultSelected={resultEntries.get(resultKeys.bpreDgreTC)}
                      >
                        {resultList.get(cmcdCd[resultKeys.bpreDgreTC]).map(({ cmcd_cd, cmcd_nm }) => (
                          <LUXRadioButton
                            key={`${cmcd_cd}${cmcd_nm}`}
                            value={cmcd_cd}
                            labelText={cmcd_nm}
                            disabled={isEditDisabled}
                            className="common_radio_input"
                          />
                        ))}
                      </LUXRadioButtonGroup>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    RC
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">
                      <LUXRadioButtonGroup
                        id={resultKeys.bpreDgreRC}
                        name={resultKeys.bpreDgreRC}
                        defaultSelected={resultEntries.get(resultKeys.bpreDgreRC)}
                      >
                        {resultList.get(cmcdCd[resultKeys.bpreDgreRC]).map(({ cmcd_cd, cmcd_nm }) => (
                          <LUXRadioButton
                            key={`${cmcd_cd}${cmcd_nm}`}
                            value={cmcd_cd}
                            labelText={cmcd_nm}
                            disabled={isEditDisabled}
                            className="common_radio_input"
                          />
                        ))}
                      </LUXRadioButtonGroup>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    BBPS총점
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx">{`${formatKeyText(resultKeys.bpreDgreStore)} 점`}</div>
                  </td>
                </tr>
                <tr className="avoid_page_break">
                  <th scope="row" className="nfont celcnt" colSpan="2">
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
                <tr>
                  <th scope="row" className="nfont celcnt" rowSpan="3">
                    진단결과
                  </th>
                  <th scope="row" className="nfont celcnt">
                    결과소견1
                  </th>
                  <td className="cellft">
                    <div className="inbx">{resultEntries.get(resultKeys.rsltOpnn1)}</div>
                  </td>
                  <th scope="row" className="nfont celcnt" rowSpan="3">
                    권고사항
                  </th>
                  <td className="cellft avoid_page_break" rowSpan="3">
                    <div className="inbx">
                      <div className="editalbe_box">
                        <div className="record_comment">{resultEntries.get(resultKeys.advcMatrCnts)}</div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    결과소견2
                  </th>
                  <td className="cellft" style={{ borderRight: "1px solid #e5e5e5" }}>
                    <div className="inbx">{resultEntries.get(resultKeys.rsltOpnn2)}</div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    결과소견3
                  </th>
                  <td className="cellft" style={{ borderRight: "1px solid #e5e5e5" }}>
                    <div className="inbx">{resultEntries.get(resultKeys.rsltOpnn3)}</div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt" colSpan="2">
                    용종 절제술 시행여부
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">
                      <LUXRadioButtonGroup
                        id={resultKeys.plypExsnPrcdActgYn}
                        name={resultKeys.plypExsnPrcdActgYn}
                        defaultSelected={resultEntries.get(resultKeys.plypExsnPrcdActgYn)}
                      >
                        <LUXRadioButton
                          value="Y"
                          labelText="용종 절제술 시행"
                          className="common_radio_input"
                          disabled={isEditDisabled}
                        />
                        <LUXRadioButton
                          value="N"
                          labelText="용종 절제술 미시행"
                          className="common_radio_input"
                          disabled={isEditDisabled}
                        />
                      </LUXRadioButtonGroup>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt" colSpan="2">
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
                          labelText="내시경관련 합병증 발생"
                          className="common_radio_input"
                          disabled={isEditDisabled}
                        />
                        <LUXRadioButton
                          value="N"
                          labelText="내시경관련 합병증 미발생"
                          className="common_radio_input"
                          disabled={isEditDisabled}
                        />
                      </LUXRadioButtonGroup>
                    </div>
                  </td>
                  <th scope="row" className="nfont celcnt">
                    합병증
                  </th>
                  <td className="cellft">
                    <div className="inbx">{formatKeyText(resultKeys.cmpcCnts)}</div>
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

MSC_050200_T02_COLN.propTypes = {
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
MSC_050200_T02_COLN.defaultProps = {
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
