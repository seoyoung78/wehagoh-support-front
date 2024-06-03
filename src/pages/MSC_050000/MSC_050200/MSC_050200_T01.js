import React, { useRef, useState } from "react";

// util
import PropTypes from "prop-types";

// common-ui-components
import { LUXSelectField, LUXRadioButtonGroup, LUXRadioButton, LUXTextField, LUXTextArea } from "luna-rocket";
import { basicKeys, cmcdCd } from "pages/MSC_050000/utils/MSC_050000_NameCodesMapping";
import { getSmartValue } from "pages/MSC_050000/utils/MSC_050000_Utils";
import {
  createDynamicRadioButton,
  createChotBassDynamicRadioButton,
  RequiredIndicator,
  createDynamicCheckbox,
  createSingleCheckbox,
  KeywordCustomPicker,
} from "pages/MSC_050000/utils/MSC_050000_ComponentLib";

// scss

// imgs

/**
 * @name  기초정보
 * @author 김령은
 */
export default function MSC_050200_T01(props) {
  const {
    selectedPatient,
    handleText,
    handleChange,
    handleChangeData,
    handleOnChecked,
    handleOnCheckedSingle,
    handleOnCheckedAndDisabled,
    basicList,
    basicEntries,
    isGI,
    isEditDisabled,
    resetEtcOnUncheck,
  } = props;

  /** 상수케이스  */
  const FIELD_ENTRY = "basicEntries";
  const EXTRA_INPUT_SELECT = "select";
  const EXTRA_INPUT_TEXT_FIELD = "textField";

  // 조건에 따라 컴포넌트가 추가되는 공통코드
  const MAIN_HODS_ETC = "34"; // 기타
  const MDCN_ATCL = "07"; // 약제복용력 : 항혈소판제/응고제
  const MDCN_ETC = "08"; // 약제복용력 : 기타약제
  const SLPN_TEST_ETC = "08"; // 수면평가
  const SEDT_ETC = "04"; //  진정평가
  const PT_SYMP_ETC = "04"; // 환자증상

  // 위장, 대장 구분
  const idctCd = !isGI ? basicKeys.idct2 : basicKeys.idct1;

  // 여러번 사용된 Value
  const slpnEntry = basicEntries.get(basicKeys.slpnEndYn);
  const atclEntry = basicEntries.get(basicKeys.atclStopYn);
  const chotBassEntry = basicEntries.get(basicKeys.chotBassCd);

  // 전처치약제 과거부작용 disabled 여부
  const choiceAtsmCd = basicEntries.get(basicKeys.atsmCd);
  const isDisabledPastSdef = isEditDisabled || !choiceAtsmCd || choiceAtsmCd === "00";

  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [keywords, setKeywords] = useState({
    [basicKeys.pastSdef]: "",
    [idctCd]: "",
  });

  // 스마트피커 Ref
  const smartPickerRefs = useRef({});

  /* ================================================================================== */
  /* 함수(function) 선언 */
  // 수면내시경 체크 해제 -> 수면 유도제 모든 항목 초기화
  const resetSlpnOnUncheck = () => {
    const updateMap = new Map(basicEntries);
    let mainValues = updateMap.get(basicKeys.slpnEndYn);

    // 초기화 값 세팅
    mainValues = { ...mainValues, checked: false };

    updateMap.set(basicKeys.slpnEndYn, mainValues);
    updateMap.set(basicKeys.slpnDosg, "");
    updateMap.set(basicKeys.slpnDrvtMdcnCd, "");

    handleChangeData(FIELD_ENTRY, updateMap);
  };

  const handleInitChotBass = checked => {
    const key = basicKeys.chotBassCd;
    const updateMap = new Map(basicEntries);
    let values = updateMap.get(key);

    // 라디오 버튼 초기화
    for (const key in values) {
      if (Object.hasOwnProperty.call(values, key)) {
        if (key === "isTouched" && checked) {
          values = { ...values, [key]: false };
        } else if (key !== "name" && key !== "cmcd_cd" && key !== "checked") {
          const initialValue = typeof values[key] === "string" ? "" : 0;
          values = { ...values, [key]: initialValue };
        }
      }
    }
    values = { ...values, checked };

    updateMap.set(key, values);
    handleChangeData(FIELD_ENTRY, updateMap);
  };

  // 라디오 버튼 기타 -> 다른 항목 선택 시 초기화
  const clearEtcOnSelectChange = (value, etcCode, etcId, selectId) => {
    if (value !== etcCode && basicEntries.get(selectId) === etcCode) {
      const updateMap = new Map(basicEntries);
      updateMap.set(etcId, "");
      updateMap.set(selectId, value);
      handleChangeData(FIELD_ENTRY, updateMap);
    } else {
      handleChange(selectId, value);
    }
  };

  const createOnChangeHandler = (etcCode, cntsKey) => (key, value) => {
    clearEtcOnSelectChange(value, etcCode, cntsKey, key);
  };

  const createResetEctOnUncheckHandler = (etcCode, cntsKey) => (checked, id, index, cmcdCd) => {
    if (cmcdCd === etcCode && !checked) {
      resetEtcOnUncheck(cntsKey);
    }
    handleOnChecked(checked, id, index);
  };

  const handleCheckboxChange = (checked, id) => {
    if (!checked) {
      resetSlpnOnUncheck();
    } else {
      handleOnCheckedSingle(checked, id);
    }
  };

  /* 커링 함수 초기화 */
  // 라디오 버튼
  const createRadioButtonWithProps = createDynamicRadioButton(basicEntries, basicList, isEditDisabled);
  // 퇴실기준 라디오 버튼
  const createChotBassDynamicRadioButtonWithProps = createChotBassDynamicRadioButton(
    basicKeys.chotBassCd,
    basicEntries,
    basicList,
    handleChangeData,
    isEditDisabled,
  );
  // 라디오 버튼 매개변수와 함께 호출
  // 환자분류
  const ptDvcdRadioButton = createRadioButtonWithProps(basicKeys.ptDvcd, handleChange);
  // 장정결
  const bpreCdRadioButton = createRadioButtonWithProps(basicKeys.bpreCd, handleChange);
  // 금식유무
  const npoEnRadioButton = createRadioButtonWithProps(basicKeys.npoEn, handleChange);
  // 진정평가
  const sedtEvltCdRadioButton = createRadioButtonWithProps(
    basicKeys.sedtEvltCd,
    createOnChangeHandler(SEDT_ETC, basicKeys.sedtEvltCnts),
  );
  // 수면평가
  const slpnEvltCdRadioButton = createRadioButtonWithProps(
    basicKeys.slpnEvltCd,
    createOnChangeHandler(SLPN_TEST_ETC, basicKeys.slpnEvltCnts),
  );
  // 퇴실기준
  const exerciseAbilityRadioButton = createChotBassDynamicRadioButtonWithProps(basicKeys.exerciseAbility);
  const respirationRadioButton = createChotBassDynamicRadioButtonWithProps(basicKeys.respiration);
  const circulationRadioButton = createChotBassDynamicRadioButtonWithProps(basicKeys.circulation);
  const consciousnessRadioButton = createChotBassDynamicRadioButtonWithProps(basicKeys.consciousness);
  const exerciseSpO2RadioButton = createChotBassDynamicRadioButtonWithProps(basicKeys.exerciseSpO2);
  const totalScore = `${!chotBassEntry.totalScore ? "-" : chotBassEntry.totalScore}점`;

  // 체크박스
  const createCheckBoxWithProps = createDynamicCheckbox(basicList, isEditDisabled);
  const createSingleCheckBoxWithProps = createSingleCheckbox(basicEntries, isEditDisabled);

  // 체크박스 매개변수와 함께 호출
  const tethStatCheckBox = createCheckBoxWithProps(basicKeys.tethStat, handleOnCheckedAndDisabled); // 치아상태
  const etbdStatCheckBox = createCheckBoxWithProps(basicKeys.etbdStat, handleOnCheckedAndDisabled); // 전신상태
  const sedtRctnCdCheckBox = createCheckBoxWithProps(basicKeys.sedtRctnCd, handleOnChecked); // 전신상태
  const chotBassCdCheckBox = createSingleCheckBoxWithProps(basicKeys.chotBassCd, handleInitChotBass);
  const orcvYnCheckBox = createSingleCheckBoxWithProps(basicKeys.orcvYn, handleOnCheckedSingle);
  const slpnEndYnCheckBox = createSingleCheckBoxWithProps(basicKeys.slpnEndYn, handleCheckboxChange);
  const atclStopYnCheckBox = createSingleCheckBoxWithProps(
    basicKeys.atclStopYn,
    handleOnCheckedSingle,
    basicKeys.atclStopNody,
  );

  // 환자증상
  const ptSympCdCheckBox = createCheckBoxWithProps(
    basicKeys.ptSympCd,
    createResetEctOnUncheckHandler(PT_SYMP_ETC, basicKeys.ptSympCnts),
    true,
    PT_SYMP_ETC,
    EXTRA_INPUT_TEXT_FIELD,
    {
      id: basicKeys.ptSympCnts,
      defaultValue: basicEntries.get(basicKeys.ptSympCnts),
      onChange: handleText,
      valueOuterControl: true,
      maxLength: 1000,
      style: { maxWidth: "180px" },
    },
  );
  // 주요병력
  const mainHodsCheckBox = createCheckBoxWithProps(
    basicKeys.mainHods,
    createResetEctOnUncheckHandler(MAIN_HODS_ETC, basicKeys.hodsCnts),
    true,
    MAIN_HODS_ETC,
    EXTRA_INPUT_TEXT_FIELD,
    {
      id: basicKeys.hodsCnts,
      defaultValue: basicEntries.get(basicKeys.hodsCnts),
      onChange: handleText,
      valueOuterControl: true,
      maxLength: 1000,
    },
    true,
  );

  // 약제복용력
  const mdcnTkngCheckBox1 = createCheckBoxWithProps(
    basicKeys.mdcnTkng,
    createResetEctOnUncheckHandler(MDCN_ATCL, basicKeys.mdcnTkngOptn1),
    true,
    MDCN_ATCL,
    EXTRA_INPUT_SELECT,
    {
      id: basicKeys.mdcnTkngOptn1,
      checkObjectList: true,
      selectFieldData: basicList.get(cmcdCd[basicKeys.mdcnTkngOptn1]),
      defaultData: basicEntries.get(basicKeys.mdcnTkngOptn1),
      handleChoiceData: value => handleChange(basicKeys.mdcnTkngOptn1, value),
      style: { maxWidth: "240px" },
    },
    true,
    ["01", "02", "03", MDCN_ATCL],
  );
  const mdcnTkngCheckBox2 = createCheckBoxWithProps(
    basicKeys.mdcnTkng,
    createResetEctOnUncheckHandler(MDCN_ETC, basicKeys.mdcnTkngCnts),
    true,
    MDCN_ETC,
    EXTRA_INPUT_TEXT_FIELD,
    {
      id: basicKeys.mdcnTkngCnts,
      defaultValue: basicEntries.get(basicKeys.mdcnTkngCnts),
      onChange: handleText,
      valueOuterControl: true,
      maxLength: 1000,
    },
    true,
    ["04", "05", "06", MDCN_ETC],
  );

  /* ================================================================================== */
  /* 스마트 피커 함수 Start */
  const dataInfo = [
    { name: "cmcd_nm", width: 100, isKey: true },
    { name: "cmcd_cd", width: 0 },
  ];

  const handleInitializeKeyword = id => {
    setKeywords(prevState => ({ ...prevState, [id]: "" }));
  };

  const prepareAndExecuteGetSmartValue = (key, code) => {
    const list = basicList.get(cmcdCd[key]);
    const { name, value } = getSmartValue(list, code);
    return { name, value };
  };

  // 값 선택 시 해당 값 디스패치
  const handleChoicePicker = (id, data) => {
    if (!id || !data || !data?.length) return;
    const updateMap = new Map(basicEntries); // 기존의 배열을 복사하여 새로운 Map 생성
    const updateValue = data[0].cmcd_cd;
    const { name, value } = prepareAndExecuteGetSmartValue(id, updateValue);
    updateMap.set(id, { name, value });
    handleChangeData(FIELD_ENTRY, updateMap);
    setKeywords(prevState => ({ ...prevState, [id]: "" }));
  };

  const handleSearchFieldChange = (id, keyword) => {
    setKeywords(prevState => ({ ...prevState, [id]: keyword }));
  };

  // 검색어에 해당하는 목록 필터 처리
  const handleSearch = id =>
    new Promise(resolve => {
      const escapedKeyword = keywords[id].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(escapedKeyword, "i"); // 대소문자 구분 없음
      const originList = basicList.get(cmcdCd[id]);
      const filterList = originList.filter(({ cmcd_nm }) => re.test(cmcd_nm));
      resolve(filterList);
    });

  /* 스마트 피커 함수 End */
  /* ================================================================================== */
  /* Hook(useEffect) */

  /* ================================================================================== */
  /* render() */
  return (
    <div className="result_box">
      <div className="LUX_basic_tbl">
        <table className="tblarea2 tblarea2_v2 tblarea2_v3">
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
                  <p className="ellipsis">{selectedPatient.prsc_nm}</p>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                환자분류
              </th>
              <td className="cellft">
                <div className="inbx type_flex">{ptDvcdRadioButton}</div>
              </td>
              <th scope="row" className="nfont celcnt">
                기록자
              </th>
              <td className="cellft">
                <div className="inbx">
                  <div className="LUX_basic_text" style={{ maxWidth: "240px" }}>
                    {basicEntries.get(basicKeys.fndtPrsn) || "-"}
                  </div>
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
                    onChange={(e, v) => handleChange(basicKeys.ctdnAcpnYn, v)}
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
            <tr>
              <th scope="row" className="nfont celcnt">
                주요병력
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
                  <div className="LUX_basic_select">
                    <LUXSelectField
                      id={basicKeys.algrEn}
                      checkObjectList
                      selectFieldData={basicList.get(cmcdCd[basicKeys.algrEn])}
                      defaultData={basicEntries.get(basicKeys.algrEn)}
                      handleChoiceData={value => handleChange(basicKeys.algrEn, value)}
                      disabled={isEditDisabled}
                      fullWidth
                    />
                  </div>
                </div>
              </td>
              <th scope="row" className="nfont celcnt">
                적응증
              </th>
              <td className="cellft">
                <KeywordCustomPicker
                  id={idctCd}
                  ref={el => (smartPickerRefs.current[idctCd] = el)}
                  keyword={keywords[idctCd]}
                  dataInfo={dataInfo}
                  value={basicEntries.get(idctCd).name}
                  onChange={handleChoicePicker}
                  onSearch={handleSearch}
                  onSearchFieldChange={handleSearchFieldChange}
                  initializeKeyword={handleInitializeKeyword}
                  disabled={isEditDisabled}
                />
              </td>
            </tr>
            <tr>
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
                      <span className="label_text">진경제사용</span>
                    </div>
                    <LUXSelectField
                      id={basicKeys.atsmCd}
                      checkObjectList
                      selectFieldData={basicList.get(cmcdCd[basicKeys.atsmCd])}
                      defaultData={basicEntries.get(basicKeys.atsmCd)}
                      handleChoiceData={value =>
                        !value || value === "00"
                          ? handleChange(basicKeys.atsmCd, value, basicKeys.pastSdef, { name: "", value: "" })
                          : handleChange(basicKeys.atsmCd, value)
                      }
                      listAutoHeight
                      disabled={isEditDisabled}
                    />
                  </div>
                  <div className="editBox">
                    <div className="common_radio_input">
                      <span className="label_text">과거부작용</span>
                    </div>
                    <KeywordCustomPicker
                      id={basicKeys.pastSdef}
                      ref={el => (smartPickerRefs.current[basicKeys.pastSdef] = el)}
                      keyword={keywords[basicKeys.pastSdef]}
                      dataInfo={dataInfo}
                      value={basicEntries.get(basicKeys.pastSdef).name}
                      onChange={handleChoicePicker}
                      onSearch={handleSearch}
                      onSearchFieldChange={handleSearchFieldChange}
                      initializeKeyword={handleInitializeKeyword}
                      disabled={isDisabledPastSdef}
                    />
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
                      <LUXTextField
                        id={basicKeys.atclStopNody}
                        defaultValue={basicEntries.get(basicKeys.atclStopNody)}
                        onChange={handleText}
                        disabled={isEditDisabled || !atclEntry.checked}
                        valueOuterControl
                        style={{ maxWidth: "100px" }}
                        maxLength={5}
                      />
                    </div>
                    <p className="editText">일전</p>
                  </div>
                </div>
              </td>
              <th scope="row" className="nfont celcnt">
                내시경분류
              </th>
              <td className="cellft">
                <div className="inbx type_flex">
                  <div className="editBox">
                    <div className="LUX_basic_text">
                      <LUXSelectField
                        id={basicKeys.endsClsfCd}
                        checkObjectList
                        selectFieldData={basicList.get(cmcdCd[basicKeys.endsClsfCd])}
                        defaultData={basicEntries.get(basicKeys.endsClsfCd)}
                        handleChoiceData={value => handleChange(basicKeys.endsClsfCd, value)}
                        listAutoHeight
                        disabled={isEditDisabled}
                        style={{ maxWidth: "240px" }}
                      />
                    </div>
                    <div className="common_radio_input">{slpnEndYnCheckBox}</div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                수면유도제 사용
                <RequiredIndicator isRequired={slpnEntry.checked} />
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx type_flex">
                  <div className="editBox">
                    <div className="common_radio_input">
                      <LUXSelectField
                        id={basicKeys.slpnDrvtMdcnCd}
                        checkObjectList
                        selectFieldData={basicList.get(cmcdCd[basicKeys.slpnDrvtMdcnCd])}
                        defaultData={basicEntries.get(basicKeys.slpnDrvtMdcnCd)}
                        handleChoiceData={value =>
                          !value
                            ? handleChange(basicKeys.slpnDrvtMdcnCd, value, basicKeys.slpnDosg)
                            : handleChange(basicKeys.slpnDrvtMdcnCd, value)
                        }
                        disabled={isEditDisabled || !slpnEntry.checked}
                        style={{ maxWidth: "240px" }}
                      />
                    </div>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.slpnDosg}
                        defaultValue={basicEntries.get(basicKeys.slpnDosg)}
                        onChange={handleText}
                        disabled={isEditDisabled || !slpnEntry.checked || !basicEntries.get(basicKeys.slpnDrvtMdcnCd)}
                        valueOuterControl
                        style={{ maxWidth: "100px" }}
                        maxLength={5}
                      />
                    </div>
                    <p className="editText">ml</p>
                  </div>
                </div>
              </td>
            </tr>
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
                    <div className="LUX_basic_text" style={{ maxWidth: "240px" }}>
                      <LUXTextField
                        id={basicKeys.exmnO2saMnvl}
                        defaultValue={basicEntries.get(basicKeys.exmnO2saMnvl)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "50px" }}
                        maxLength={3}
                      />
                    </div>
                    <p className="editText">~</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.exmnO2saMxvl}
                        defaultValue={basicEntries.get(basicKeys.exmnO2saMxvl)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "50px" }}
                        maxLength={3}
                      />
                    </div>
                    <p className="editText" style={{ marginRight: "20px" }}>
                      %
                    </p>
                    <p className="editText">회복중</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.rcvrO2saMnvl}
                        defaultValue={basicEntries.get(basicKeys.rcvrO2saMnvl)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "50px" }}
                        maxLength={3}
                      />
                    </div>
                    <p className="editText">~</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.rcvrO2saMxvl}
                        defaultValue={basicEntries.get(basicKeys.rcvrO2saMxvl)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "50px" }}
                        maxLength={3}
                      />
                    </div>
                    <p className="editText">%</p>
                  </div>
                </div>
              </td>
              <th scope="row" className="nfont celcnt">
                산소공급
              </th>
              <td className="cellft">
                <div className="inbx type_flex">
                  <div className="editBox">
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.oxygSupl}
                        defaultValue={basicEntries.get(basicKeys.oxygSupl)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "50px" }}
                        maxLength={5}
                      />
                    </div>
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
                    <p className="editText">혈압</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.exmnBfSytcBp}
                        defaultValue={basicEntries.get(basicKeys.exmnBfSytcBp)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "100px" }}
                        maxLength={3}
                      />
                    </div>
                    <p className="editText">/</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.exmnBfDatcBp}
                        defaultValue={basicEntries.get(basicKeys.exmnBfDatcBp)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "100px" }}
                        maxLength={3}
                      />
                    </div>
                    <p className="editText">맥박</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.exmnBfPlst}
                        defaultValue={basicEntries.get(basicKeys.exmnBfPlst)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "100px" }}
                        maxLength={3}
                      />
                    </div>
                    <p className="editText">호흡수</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.exmnBfRsprCnt}
                        defaultValue={basicEntries.get(basicKeys.exmnBfRsprCnt)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "100px" }}
                        maxLength={3}
                      />
                    </div>
                  </div>
                  <div className="editBox">
                    <p className="editText">검사 후</p>
                    <p className="editText">혈압</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.exmnAfSytcBp}
                        defaultValue={basicEntries.get(basicKeys.exmnAfSytcBp)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "100px" }}
                        maxLength={3}
                      />
                    </div>
                    <p className="editText">/</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.exmnAfDatcBp}
                        defaultValue={basicEntries.get(basicKeys.exmnAfDatcBp)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "100px" }}
                        maxLength={3}
                      />
                    </div>
                    <p className="editText">맥박</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.exmnAfPlst}
                        defaultValue={basicEntries.get(basicKeys.exmnAfPlst)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "100px" }}
                        maxLength={3}
                      />
                    </div>
                    <p className="editText">호흡수</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.exmnAfRsprCnt}
                        defaultValue={basicEntries.get(basicKeys.exmnAfRsprCnt)}
                        onChange={handleText}
                        valueOuterControl
                        disabled={isEditDisabled}
                        style={{ maxWidth: "100px" }}
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                진정평가
              </th>
              <td className="cellft">
                <div className="inbx type_flex">
                  {sedtEvltCdRadioButton}
                  <div className="editBox">
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.sedtEvltCnts}
                        defaultValue={basicEntries.get(basicKeys.sedtEvltCnts)}
                        onChange={handleText}
                        disabled={isEditDisabled || basicEntries.get(basicKeys.sedtEvltCd) !== SEDT_ETC}
                        valueOuterControl
                        style={{ maxWidth: "180px" }}
                        maxLength={1000}
                      />
                    </div>
                  </div>
                </div>
              </td>
              <th scope="row" className="nfont celcnt">
                진정반응
              </th>
              <td className="cellft">
                <div className="inbx type_flex">{sedtRctnCdCheckBox}</div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                환자증상
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx type_flex">{ptSympCdCheckBox}</div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                수면평가
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx type_flex">
                  <div className="editBox">
                    <div className="common_radio_input">{slpnEvltCdRadioButton}</div>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={basicKeys.slpnEvltCnts}
                        defaultValue={basicEntries.get(basicKeys.slpnEvltCnts)}
                        onChange={handleText}
                        disabled={isEditDisabled || basicEntries.get(basicKeys.slpnEvltCd) !== SLPN_TEST_ETC}
                        valueOuterControl
                        style={{ maxWidth: "180px" }}
                        maxLength={1000}
                      />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="LUX_basic_tbl">
        <table className="tblarea2 tblarea2_v2 tblarea2_v3">
          <colgroup>
            <col style={{ width: "60px" }} />
            <col style={{ width: "60px" }} />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <th scope="row" className="nfont celcnt" rowSpan="7">
                퇴실기준
                <RequiredIndicator isRequired={chotBassEntry.isTouched} />
              </th>
              <th scope="row" className="nfont celcnt" />
              <td className="cellft">
                <div className="inbx type_flex">{chotBassCdCheckBox}</div>
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
        <div className="LUX_basic_tbl">
          <table className="tblarea2 tblarea2_v2 tblarea2_v3">
            <caption>
              <span className="blind" />
            </caption>
            <colgroup>
              <col style={{ width: "120px" }} />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <th scope="row" className="nfont celcnt">
                  참고사항
                </th>
                <td className="cellft">
                  <div className="inbx">
                    <div className="editalbe_box">
                      <LUXTextArea
                        id={basicKeys.refMatr}
                        defaultValue={basicEntries.get(basicKeys.refMatr)}
                        onChange={handleText}
                        fullWidth
                        disabled={isEditDisabled}
                        maxLength={1000}
                        resize={false}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

MSC_050200_T01.propTypes = {
  basicList: PropTypes.instanceOf(Map),
  basicEntries: PropTypes.instanceOf(Map),
  selectedPatient: PropTypes.shape({}),
  isGI: PropTypes.bool,
  isEditDisabled: PropTypes.bool,
  handleText: PropTypes.func,
  handleChange: PropTypes.func,
  handleChangeData: PropTypes.func,
  handleOnChecked: PropTypes.func,
  handleOnCheckedSingle: PropTypes.func,
  handleOnCheckedAndDisabled: PropTypes.func,
  resetEtcOnUncheck: PropTypes.func,
};
MSC_050200_T01.defaultProps = {
  basicList: new Map([]),
  basicEntries: new Map([]),
  isGI: false,
  isEditDisabled: false,
  selectedPatient: {
    prsc_nm: "",
    iptn_prsn_nm: "",
    iptn_dt: "",
    exmn_hope_date: "",
  },
  handleText: () => {},
  handleChange: () => {},
  handleChangeData: () => {},
  handleOnChecked: () => {},
  handleOnCheckedSingle: () => {},
  handleOnCheckedAndDisabled: () => {},
  resetEtcOnUncheck: () => {},
};
