import React from "react";

// util
import moment from "moment";
import PropTypes from "prop-types";
import { globals } from "global";

// common-ui-components
import { LUXRadioButtonGroup, LUXRadioButton, LUXCheckBox } from "luna-rocket";

import { basicKeys } from "pages/MSC_050000/utils/MSC_050000_NameCodesMapping";
import { createFormatter } from "pages/MSC_050000/utils/MSC_050000_Utils";
import {
  createDynamicRadioButton,
  createChotBassDynamicRadioButton,
  createDynamicCheckbox,
  createSingleCheckbox,
} from "pages/MSC_050000/utils/MSC_050000_ComponentLib";

// imgs

/**
 * @name  기초정보
 * @author 김령은
 */
export default function CSMSP007_T01(props) {
  const {
    sign,
    mdtrSiteCd,
    basicList,
    basicEntries,
    hspt,
    patient,
    isEditDisabled,
    isPending,
    fndtPrsnSign,
    isPrintable,
    exmnInfo,
  } = props;

  /** 상수케이스  */
  // 조건에 따라 컴포넌트가 추가되는 공통코드
  const GI_SITE_CD = "S"; // 치료부위코드:위장
  const COLON_SITE_CD = "C"; // 치료부위코드:대장

  const MAIN_HODS_ETC = "34"; // 기타
  const MDCN_ATCL = "07"; // 약제복용력 : 항혈소판제/응고제
  const MDCN_ETC = "08"; // 약제복용력 : 기타약제
  const PT_SYMP_ETC = "04"; // 환자증상

  const EXTRA_INPUT_TEXT = "text";

  // 위장, 대장 구분
  const isGI = mdtrSiteCd === GI_SITE_CD;
  const idctCd = mdtrSiteCd === COLON_SITE_CD ? basicKeys.idct2 : basicKeys.idct1;

  // 여러번 사용된 Value
  const chotBassEntry = basicEntries.get(basicKeys.chotBassCd);

  let tableGapClassName = "";

  if (isPrintable) {
    tableGapClassName = !isGI ? "high_table_gap" : "table_gap";
  }

  // // 요소들의 높이 값을 저장할 상태 (key-value 형태)
  // const [contentHeights, setContentHeights] = useState({});
  // // 요소들의 참조를 저장할 객체
  // const contentRefs = {};

  /* ================================================================================== */
  /* 상태(state) 선언 */

  /* ================================================================================== */
  /* 함수(function) 선언 */
  // 요소에 대한 참조를 설정하는 함수
  const formatWithBasicEntries = createFormatter(basicEntries);

  /* 체크박스 */
  const createCheckBoxWithProps = createDynamicCheckbox(basicList, true);
  const createSingleCheckBoxWithProps = createSingleCheckbox(basicEntries, isEditDisabled);

  const tethStatCheckBox = createCheckBoxWithProps(basicKeys.tethStat);
  const etbdStatCheckBox = createCheckBoxWithProps(basicKeys.etbdStat);
  const orcvYnCheckBox = createSingleCheckBoxWithProps(basicKeys.orcvYn);
  const atclStopYnCheckBox = createSingleCheckBoxWithProps(basicKeys.atclStopYn);
  const slpnEndYnCheckBox = createSingleCheckBoxWithProps(basicKeys.slpnEndYn);
  const sedtRctnCdCheckBox = createCheckBoxWithProps(basicKeys.sedtRctnCd); // 전신상태
  const ptSympCdCheckBox = createCheckBoxWithProps(
    basicKeys.ptSympCd,
    null,
    true,
    PT_SYMP_ETC,
    EXTRA_INPUT_TEXT,
    null,
    true,
    null,
    formatWithBasicEntries(basicKeys.ptSympCnts),
  );
  const mainHodsCheckBox = createCheckBoxWithProps(
    basicKeys.mainHods,
    null,
    true,
    MAIN_HODS_ETC,
    EXTRA_INPUT_TEXT,
    null,
    true,
    null,
    formatWithBasicEntries(basicKeys.hodsCnts),
  );
  // 약제복용력
  const mdcnTkngCheckBox1 = createCheckBoxWithProps(
    basicKeys.mdcnTkng,
    null,
    true,
    MDCN_ATCL,
    EXTRA_INPUT_TEXT,
    null,
    true,
    ["01", "02", "03", MDCN_ATCL],
    formatWithBasicEntries(basicKeys.mdcnTkngOptn1),
  );
  const mdcnTkngCheckBox2 = createCheckBoxWithProps(
    basicKeys.mdcnTkng,
    null,
    true,
    MDCN_ETC,
    EXTRA_INPUT_TEXT,
    null,
    true,
    ["04", "05", "06", MDCN_ETC],
    formatWithBasicEntries(basicKeys.mdcnTkngCnts),
  );

  /* 라디오버튼 */
  const createRadioButtonWithProps = createDynamicRadioButton(basicEntries, basicList, true);
  const slpnEvltCdRadioButton = createRadioButtonWithProps(basicKeys.slpnEvltCd);
  const ptDvcdRadioButton = createRadioButtonWithProps(basicKeys.ptDvcd);
  const bpreCdRadioButton = createRadioButtonWithProps(basicKeys.bpreCd);
  const npoEnRadioButton = createRadioButtonWithProps(basicKeys.npoEn);
  const sedtEvltCdRadioButton = createRadioButtonWithProps(basicKeys.sedtEvltCd);

  // 퇴실기준
  const createChotBassDynamicRadioButtonWithProps = createChotBassDynamicRadioButton(
    basicKeys.chotBassCd,
    basicEntries,
    basicList,
    null,
    true,
  );
  const exerciseAbilityRadioButton = createChotBassDynamicRadioButtonWithProps(basicKeys.exerciseAbility);
  const respirationRadioButton = createChotBassDynamicRadioButtonWithProps(basicKeys.respiration);
  const circulationRadioButton = createChotBassDynamicRadioButtonWithProps(basicKeys.circulation);
  const consciousnessRadioButton = createChotBassDynamicRadioButtonWithProps(basicKeys.consciousness);
  const exerciseSpO2RadioButton = createChotBassDynamicRadioButtonWithProps(basicKeys.exerciseSpO2);
  const totalScore = `${!chotBassEntry.totalScore ? "-" : chotBassEntry.totalScore}점`;

  /* ================================================================================== */
  /* Hook(useEffect) */
  // useEffect(() => {
  //   // 각 요소의 참조를 이용하여 높이 값을 계산하고 상태를 업데이트
  //   const newHeights = {};
  //   Object.keys(contentRefs).forEach(key => {
  //     const el = contentRefs[key];
  //     if (el) {
  //       const maxHeight = key === refMatr ? 250 : 50; // 최대 높이 설정
  //       newHeights[key] = Math.min(el.scrollHeight, maxHeight);
  //       newHeights[key] = el.scrollHeight;
  //     }
  //   });
  //   setContentHeights(newHeights);
  // }, []);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="print_box">
      <div className="print_info">{moment().format("YYYY-MM-DD HH:mm:ss")}</div>
      <div className="print_header">
        <div className="print_header_title">
          <h1>{`${!isGI ? "대장" : "위"}내시경 진정기록지`}</h1>
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
                  <th className="nfont celcnt">외래/병실</th>
                  <td className="cellft">
                    {isPending ? (
                      <div className="inbx type_flex">
                        <LUXRadioButtonGroup name="LUXRadioButtonPtDvcd" defaultSelected={patient.pt_dvcd}>
                          <LUXRadioButton
                            value="외래"
                            labelText="외래"
                            style={{ marginRight: "10px" }}
                            disabled={isEditDisabled}
                          />
                          <LUXRadioButton
                            value="병실"
                            labelText="병실"
                            style={{ marginRight: "10px" }}
                            disabled={isEditDisabled}
                          />
                        </LUXRadioButtonGroup>
                      </div>
                    ) : (
                      <div className="inbx">{patient.pt_dvcd}</div>
                    )}
                  </td>
                  <th className="nfont celcnt">성별/나이</th>
                  <td className="cellft">
                    <div className="inbx">{patient.age_cd}</div>
                  </td>
                </tr>
                <tr>
                  <th className="nfont celcnt">검사시행일</th>
                  <td className="cellft">
                    <div className="inbx">
                      {exmnInfo.cndt_dt ? moment(exmnInfo.cndt_dt).format("YYYY년 MM월 DD일") : null}
                    </div>
                  </td>
                  <th className="nfont celcnt">내시경 검사의</th>
                  <td className="cellft">
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
          <h3>• 환자상태</h3>
        </div>
        <div className="print_content">
          <div className="LUX_basic_tbl">
            <table className="tblarea2 tblarea2_v2 tblarea2_v3">
              <caption>
                <span className="blind" />
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
                    환자분류
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">
                      <div className="common_radio_input">{ptDvcdRadioButton}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  {!isGI ? (
                    <>
                      <th scope="row" className="nfont celcnt">
                        장정결
                      </th>
                      <td className="cellft">
                        <div className="inbx type_flex">{bpreCdRadioButton}</div>
                      </td>
                    </>
                  ) : (
                    <>
                      <th scope="row" className="nfont celcnt">
                        치아상태
                      </th>
                      <td className="cellft">
                        <div className="inbx type_flex">{tethStatCheckBox}</div>
                      </td>
                    </>
                  )}

                  <th scope="row" className="nfont celcnt">
                    보호자 동반 유무
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">
                      <LUXRadioButtonGroup
                        id={basicKeys.ctdnAcpnYn}
                        name={basicKeys.ctdnAcpnYn}
                        defaultSelected={basicEntries.get(basicKeys.ctdnAcpnYn)}
                      >
                        <LUXRadioButton
                          value="Y"
                          labelText="예"
                          style={{ marginRight: "10px" }}
                          disabled={isEditDisabled}
                        />
                        <LUXRadioButton
                          value="N"
                          labelText="아니오"
                          style={{ marginRight: "10px" }}
                          disabled={isEditDisabled}
                        />
                      </LUXRadioButtonGroup>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    전신상태
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">{etbdStatCheckBox}</div>
                  </td>
                  <th scope="row" className="nfont celcnt">
                    금식유무
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">{npoEnRadioButton}</div>
                  </td>
                </tr>
                <tr className="avoid_page_break">
                  <th scope="row" className="nfont celcnt">
                    병력
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">{mainHodsCheckBox}</div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    알레르기 유무
                  </th>
                  <td className="cellft">
                    <div className="inbx">
                      <div className="LUX_basic_select">{basicEntries.get(basicKeys.algrEn)}</div>
                    </div>
                  </td>
                  <th scope="row" className="nfont celcnt">
                    적응증
                  </th>
                  <td className="cellft">
                    <div className="inbx">
                      <div className="LUX_basic_select">{basicEntries.get(idctCd)}</div>
                    </div>
                  </td>
                </tr>
                <tr className="avoid_page_break">
                  <th scope="row" className="nfont celcnt" rowSpan="2">
                    약제복용력
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">{mdcnTkngCheckBox1}</div>
                  </td>
                </tr>
                <tr>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">{mdcnTkngCheckBox2}</div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    전처치약제
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">
                      <div className="editBox">
                        <div className="common_radio_input">
                          <span className="label_text">{formatWithBasicEntries(basicKeys.atsmCd, "진경제사용")}</span>
                        </div>
                      </div>
                      <div className="editBox">
                        <div className="common_radio_input">
                          <span className="label_text">{formatWithBasicEntries(basicKeys.pastSdef, "과거부작용")}</span>
                        </div>
                      </div>
                      {!isGI ? null : (
                        <div className="editBox">
                          <div className="common_radio_input">{orcvYnCheckBox}</div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    항응고제중단여부
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">
                      <div className="editBox">
                        <div className="common_radio_input">{atclStopYnCheckBox}</div>
                        <div className="LUX_basic_text">
                          {formatWithBasicEntries(basicKeys.atclStopNody, "", "일전")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <th scope="row" className="nfont celcnt">
                    내시경분류
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">
                      <div className="editBox">
                        <div className="LUX_basic_text">{basicEntries.get(basicKeys.endsClsfCd)}</div>
                        <div className="common_radio_input">{slpnEndYnCheckBox}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className={tableGapClassName} />
            <table className="tblarea2 tblarea2_v2 tblarea2_v3">
              <caption>
                <span className="blind" />
              </caption>
              <colgroup>
                <col style={{ width: "120px" }} />
                <col />
                <col style={{ width: "120px" }} />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <th scope="row" className="nfont celcnt" colSpan="4">
                    진정기록지
                  </th>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    산소포화도
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">
                      <div className="editBox">
                        <p className="editText">검사중</p>
                        <div className="LUX_basic_text">{`(${basicEntries.get(
                          basicKeys.exmnO2saMnvl,
                        )}~${basicEntries.get(basicKeys.exmnO2saMxvl)}) %`}</div>
                        <p className="editText">회복중</p>
                        <div className="LUX_basic_text">{`(${basicEntries.get(
                          basicKeys.rcvrO2saMnvl,
                        )}~${basicEntries.get(basicKeys.rcvrO2saMxvl)}) %`}</div>
                      </div>
                    </div>
                  </td>
                  <th scope="row" className="nfont celcnt">
                    산소공급
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">
                      <div className="editBox">
                        <div className="LUX_basic_text">{formatWithBasicEntries(basicKeys.oxygSupl)}</div>
                        <p className="editText">liter</p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="nfont celcnt">
                    활력징후
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">
                      <div className="editBox">
                        <p className="editText">검사 전</p>
                        <p className="editText">
                          혈압
                          {`${formatWithBasicEntries(basicKeys.exmnBfSytcBp)} / ${formatWithBasicEntries(
                            basicKeys.exmnBfDatcBp,
                          )}`}
                        </p>
                        <p className="editText">맥박{formatWithBasicEntries(basicKeys.exmnBfPlst)}</p>
                        <p className="editText">호흡수{formatWithBasicEntries(basicKeys.exmnBfRsprCnt)}</p>
                      </div>
                      <div className="editBox">
                        <p className="editText">검사 후</p>
                        <p className="editText">
                          혈압
                          {`${formatWithBasicEntries(basicKeys.exmnAfSytcBp)} / ${formatWithBasicEntries(
                            basicKeys.exmnAfDatcBp,
                          )}`}
                        </p>
                        <p className="editText">맥박{formatWithBasicEntries(basicKeys.exmnAfPlst)}</p>
                        <p className="editText">호흡수{formatWithBasicEntries(basicKeys.exmnAfRsprCnt)}</p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="avoid_page_break">
                  <th scope="row" className="nfont celcnt">
                    진정평가
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">
                      {sedtEvltCdRadioButton}
                      <div className="LUX_basic_text">{formatWithBasicEntries(basicKeys.sedtEvltCnts)}</div>
                    </div>
                  </td>
                  <th scope="row" className="nfont celcnt">
                    진정반응
                  </th>
                  <td className="cellft">
                    <div className="inbx type_flex">{sedtRctnCdCheckBox}</div>
                  </td>
                </tr>
                <tr className="avoid_page_break">
                  <th scope="row" className="nfont celcnt">
                    환자증상
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">{ptSympCdCheckBox}</div>
                  </td>
                </tr>
                <tr className="avoid_page_break">
                  <th scope="row" className="nfont celcnt">
                    수면평가
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">
                      <div className="editBox">
                        {slpnEvltCdRadioButton}
                        <div className="LUX_basic_text">{formatWithBasicEntries(basicKeys.slpnEvltCnts)}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="printTable" className="print_wrap avoid_page_break">
            <div className="print_title">
              <h3>• 진정기록</h3>
            </div>
            <div className="print_content">
              <div className="LUX_basic_tbl">
                <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                  <caption>
                    <span className="blind" />
                  </caption>
                  <colgroup>
                    <col style={{ width: "60px" }} />
                    <col style={{ width: "60px" }} />
                    <col />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th scope="row" className="nfont celcnt" rowSpan="7">
                        퇴실기준
                      </th>
                      <th scope="row" className="nfont celcnt"></th>
                      <td className="cellft">
                        <div className="inbx type_flex">
                          <LUXCheckBox
                            id={basicKeys.chotBassCd}
                            labelText={chotBassEntry.name}
                            checked={chotBassEntry.checked}
                            disabled={isEditDisabled}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row" className="nfont celcnt">
                        운동능력
                      </th>
                      <td className="cellft">
                        <div className="inbx type_flex">{exerciseAbilityRadioButton}</div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row" className="nfont celcnt">
                        호흡
                      </th>
                      <td className="cellft">
                        <div className="inbx type_flex">{respirationRadioButton}</div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row" className="nfont celcnt">
                        순환
                      </th>
                      <td className="cellft">
                        <div className="inbx type_flex">{circulationRadioButton}</div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row" className="nfont celcnt">
                        의식상태
                      </th>
                      <td className="cellft">
                        <div className="inbx type_flex">{consciousnessRadioButton}</div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row" className="nfont celcnt">
                        산소포화도
                      </th>
                      <td className="cellft">
                        <div className="inbx type_flex">{exerciseSpO2RadioButton}</div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row" className="nfont celcnt">
                        총점
                      </th>
                      <td className="cellft">
                        <div className="inbx type_flex">
                          <p className="editText">{totalScore}</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div id="printTable" className="print_wrap avoid_page_break">
            <div className="print_content">
              <div className="LUX_basic_tbl">
                <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                  <caption>
                    <span className="blind" />
                  </caption>
                  <colgroup>
                    <col />
                    <col />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th scope="row" className="nfont celcnt th_narrow">
                        참고사항
                      </th>
                      <td className="cellft">
                        <div className="inbx">
                          <div className="editalbe_box">
                            <div className="record_comment">{basicEntries.get(basicKeys.refMatr)}</div>
                          </div>
                        </div>
                      </td>
                      <th scope="row" className="nfont celcnt th_narrow">
                        기록자
                      </th>
                      <td className="cellft">
                        <div className="inbx">
                          {isPrintable ? (
                            <div className="print_sign">
                              <div className="sign_box">
                                <div className="override_text_cell">{basicEntries.get(basicKeys.fndtPrsn)}</div>
                                {fndtPrsnSign ? <img src={fndtPrsnSign} width="38px" height="38px" alt="" /> : null}
                                <div className="sign_text override_text_cell">( 서명 또는 인 )</div>
                              </div>
                            </div>
                          ) : (
                            <div className="center_text">{basicEntries.get(basicKeys.fndtPrsn)}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {!isPending ? (
            <div className="print_wrap">
              {isPrintable ? (
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
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

CSMSP007_T01.propTypes = {
  basicList: PropTypes.instanceOf(Map),
  basicEntries: PropTypes.instanceOf(Map),
  hspt: PropTypes.shape({
    hspt_nm: PropTypes.string,
    hspt_logo_lctn: PropTypes.string,
  }),
  mdtrSiteCd: PropTypes.string,
  isEditDisabled: PropTypes.bool,
  patient: PropTypes.shape({
    pid: PropTypes.string,
    pt_nm: PropTypes.string,
    pt_dvcd: PropTypes.string,
    age_cd: PropTypes.string,
  }),
  sign: PropTypes.string,
  isPending: PropTypes.bool,
  fndtPrsnSign: PropTypes.string,
  isPrintable: PropTypes.bool,
  exmnInfo: PropTypes.shape({
    cndt_dt: PropTypes.string,
    iptn_prsn_nm: PropTypes.string,
  }),
};
CSMSP007_T01.defaultProps = {
  basicList: new Map([]),
  basicEntries: new Map([]),
  mdtrSiteCd: "",
  isEditDisabled: true,
  hspt: {
    hspt_nm: "",
    hspt_logo_lctn: "",
  },
  patient: {
    pid: "",
    pt_nm: "",
    pt_dvcd: "",
    age_cd: "",
  },
  sign: {},
  isPending: false,
  fndtPrsnSign: "",
  isPrintable: false,
  exmnInfo: {
    cndt_dt: "", // 검사일
    iptn_prsn_nm: "", // 판독의사 명
  },
};
