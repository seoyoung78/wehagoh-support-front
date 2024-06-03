import React, { useEffect, useRef, useState } from "react";

// util
import PropTypes from "prop-types";
import { lodash } from "common-util/utils";

// common-ui-components
import {
  LUXDatePicker,
  LUXRadioButtonGroup,
  LUXRadioButton,
  LUXCheckBox,
  LUXTextField,
  LUXTextArea,
  LUXSelectField,
} from "luna-rocket";

import { resultKeys, cmcdCd } from "pages/MSC_050000/utils/MSC_050000_NameCodesMapping";
import { getSmartValue } from "pages/MSC_050000/utils/MSC_050000_Utils";
import { createDynamicRadioButton, KeywordCustomPicker } from "pages/MSC_050000/utils/MSC_050000_ComponentLib";

// scss

// imgs

/**
 * @name  결과기록 대장
 * @author 김령은
 */
export default function MSC_050200_T02_COLN(props) {
  const {
    resultList,
    resultEntries,
    selectedPatient,
    isEditDisabled,
    handleChange,
    handleChangeData,
    handleText,
    handleObsrChange,
    handleObsrOnCheckedSingle,
  } = props;

  /** 상수케이스  */
  const TYPE_RAW_VALUE = "rawValue";
  const TYPE_EVENT_OBJECT = "eventObject";
  const RESULT_FIELD_ENTRY = "resultEntries";
  const TYPE_SECONDS = "obsrSeconds";
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [exmnDate, setExmnDate] = useState(new Date());
  const [iptnDate, setIptnDate] = useState(new Date());

  const isIptnDate = !!selectedPatient.iptn_dt;

  const [keywords, setKeywords] = useState({
    [resultKeys.tisuExmnRslt2]: "",
    [resultKeys.etnlObsrOpnn]: "",
    [resultKeys.dreOpnn]: "",
    [resultKeys.rsltOpnn1]: "",
    [resultKeys.rsltOpnn2]: "",
    [resultKeys.rsltOpnn3]: "",
  });

  // 스마트피커 Ref
  const smartPickerRefs = useRef({});

  /* ================================================================================== */
  /* 함수(function) 선언 */
  /* 커링 함수 초기화 */
  // 라디오 버튼
  const createRadioButtonWithProps = createDynamicRadioButton(resultEntries, resultList, isEditDisabled);
  const bpreDgreLCRadioButton = createRadioButtonWithProps(resultKeys.bpreDgreLC, handleChange, true);
  const bpreDgreTCRadioButton = createRadioButtonWithProps(resultKeys.bpreDgreTC, handleChange, true);
  const bpreDgreRCRadioButton = createRadioButtonWithProps(resultKeys.bpreDgreRC, handleChange, true);
  const totalBbptScore = `( ${resultEntries.get(resultKeys.bpreDgreStore)} ) 점`;

  // 관찰소요시간 함수
  const handleChangeTime = (e, type = "") => {
    const numberValue = +e.target.value;
    if (Number.isNaN(numberValue) || (type === TYPE_SECONDS && numberValue > 59)) return;
    handleChange(e.target.id, e.target.value, RESULT_FIELD_ENTRY);
  };

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
    const list = resultList.get(cmcdCd[key]);
    const { name, value } = getSmartValue(list, code);
    return { name, value };
  };

  // 값 선택 시 해당 값 디스패치
  const handleChoicePicker = (id, data) => {
    setKeywords(prevState => ({ ...prevState, [id]: "" }));
    if (!id || !data || !data?.length) return;
    const updateMap = new Map(resultEntries); // 기존의 배열을 복사하여 새로운 Map 생성
    const updateValue = data[0].cmcd_cd;
    const { name, value } = prepareAndExecuteGetSmartValue(id, updateValue);
    updateMap.set(id, { name, value });
    handleChangeData(RESULT_FIELD_ENTRY, updateMap);
  };

  const handleSearchFieldChange = (id, keyword) => {
    setKeywords(prevState => ({ ...prevState, [id]: keyword }));
  };

  // 검색어에 해당하는 목록 필터 처리
  const handleSearch = id =>
    new Promise(resolve => {
      const escapedKeyword = keywords[id].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(escapedKeyword, "i"); // 대소문자 구분 없음
      const originList = resultList.get(cmcdCd[id]);
      const filterList = originList.filter(({ cmcd_nm }) => re.test(cmcd_nm));
      resolve(filterList);
    });

  const handleObsrChoicePicker = (parentIndex, id, data) => {
    if (!id || !data || !data?.length) return;
    const updateKey = resultKeys.exmnObsrOpnnSqno;
    const updateLst = lodash.cloneDeep(resultList); // 1. ResultList 클론
    const obsrList = updateLst.get(updateKey); // 2. 관찰소견 리스트 가져오기

    const updateValue = data[0].cmcd_cd;
    const { name, value } = prepareAndExecuteGetSmartValue(id, updateValue);

    obsrList[parentIndex] = { ...obsrList[parentIndex], [id]: { name, value } }; // 3. 관찰소견 리스트에 변경한 값 적용
    updateLst.set(updateKey, obsrList); // 4. map에 업데이트 값 세팅

    handleChangeData("resultList", updateLst);
    setKeywords(prevState => ({ ...prevState, [id]: "" }));
  };
  /* 스마트 피커 함수 End */

  /* ================================================================================== */
  /* Hook(useEffect) */
  // 검사/판정일 new Date() 형식 변환
  // 검사일, 판정일 date 형식 변환
  useEffect(() => {
    const parseDateString = dateString => {
      // 기본값으로 현재 날짜 설정
      if (!dateString) return new Date();

      // YYYY-MM-DD 형식인 경우 자정 시간 추가
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return new Date(`${dateString}T00:00:00.000Z`);
      }
      // 기타 경우 그대로 변환
      return new Date(dateString);
    };

    setExmnDate(parseDateString(selectedPatient.exmn_hope_date));
    setIptnDate(parseDateString(resultEntries.get(resultKeys.dtrmDate)));
  }, [selectedPatient, resultEntries]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="result_box">
      <div className="LUX_basic_tbl">
        <table className="tblarea2 tblarea2_v2 tblarea2_v3">
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
                검사명
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx">
                  <p className="ellipsis">{selectedPatient.prsc_nm}</p>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt" colSpan="2">
                검사/판정일
              </th>
              <td className="cellft">
                <div className="inbx type_flex">
                  <div className="editBox">
                    <p className="editText">검사일</p>
                    <div className="LUX_basic_date_gap LUX_renewal" style={{ width: "120px" }}>
                      <div className="date_gap">
                        <div className="LUX_basic_date">
                          <div className="datebx" style={{ width: "100%" }}>
                            <LUXDatePicker dateFormatSeparator="-" value={exmnDate} disabled />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="editBox">
                    <p className="editText">판정일</p>
                    <div className="LUX_basic_date_gap LUX_renewal" style={{ width: "120px" }}>
                      <div className="date_gap">
                        <div className="LUX_basic_date">
                          <div className="datebx" style={{ width: "100%" }}>
                            {isIptnDate ? <LUXDatePicker dateFormatSeparator="-" value={iptnDate} disabled /> : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <th scope="row" className="nfont celcnt">
                내시경 의사명
              </th>
              <td className="cellft">
                <div className="inbx">
                  <p className="ellipsis">{resultEntries.get(resultKeys.endsDrNm)}</p>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt" colSpan="2">
                외부관찰소견
              </th>
              <td className="cellft">
                <KeywordCustomPicker
                  id={resultKeys.etnlObsrOpnn}
                  ref={el => (smartPickerRefs.current[resultKeys.etnlObsrOpnn] = el)}
                  keyword={keywords[resultKeys.etnlObsrOpnn]}
                  dataInfo={dataInfo}
                  value={resultEntries.get(resultKeys.etnlObsrOpnn).name}
                  onChange={handleChoicePicker}
                  onSearch={handleSearch}
                  onSearchFieldChange={handleSearchFieldChange}
                  initializeKeyword={handleInitializeKeyword}
                  disabled={isEditDisabled}
                />
              </td>
              <th scope="row" className="nfont celcnt">
                직장수지소견
              </th>
              <td className="cellft">
                <KeywordCustomPicker
                  id={resultKeys.dreOpnn}
                  ref={el => (smartPickerRefs.current[resultKeys.dreOpnn] = el)}
                  keyword={keywords[resultKeys.dreOpnn]}
                  dataInfo={dataInfo}
                  value={resultEntries.get(resultKeys.dreOpnn).name}
                  onChange={handleChoicePicker}
                  onSearch={handleSearch}
                  onSearchFieldChange={handleSearchFieldChange}
                  initializeKeyword={handleInitializeKeyword}
                  disabled={isEditDisabled}
                />
              </td>
            </tr>
            {resultList.get(resultKeys.exmnObsrOpnnSqno).map((value, index) => (
              <React.Fragment key={`obsrOpnn${index}`}>
                <tr>
                  <th scope="row" className="nfont celcnt" colSpan="2">
                    대장내시경 관찰소견
                  </th>
                  <td className="cellft" colSpan="3">
                    <div className="inbx type_flex">
                      <LUXRadioButtonGroup
                        id={resultKeys.obsrOpnnSite2}
                        name={resultKeys.obsrOpnnSite2}
                        defaultSelected={value[resultKeys.obsrOpnnSite2]}
                        onChange={(e, v) => handleObsrChange(index, TYPE_RAW_VALUE, v, resultKeys.obsrOpnnSite2)}
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
                      <div className="editalbe_box con_box_margin">
                        <LUXTextArea
                          className="editablediv"
                          id={resultKeys.obsrOpnnCnts}
                          defaultValue={value[resultKeys.obsrOpnnCnts]}
                          hintText=""
                          onChange={e => {
                            handleObsrChange(index, TYPE_EVENT_OBJECT, e);
                          }}
                          fullWidth
                          disabled={isEditDisabled}
                          style={{ minHight: "80px" }}
                          resize={false}
                        />
                      </div>
                      <div className="tblConBox">
                        <div className="LUX_basic_switch">
                          <LUXCheckBox
                            id={resultKeys.tisuExmnYn}
                            labelText={value[resultKeys.tisuExmnYn].name}
                            checked={value[resultKeys.tisuExmnYn].checked}
                            onCheck={(event, checked, id) =>
                              handleObsrOnCheckedSingle(index, checked, id, resultKeys.tisuExmnRslt2)
                            }
                            disabled={isEditDisabled}
                            style={{ marginRight: "10px" }}
                          />
                        </div>
                        <KeywordCustomPicker
                          id={resultKeys.tisuExmnRslt2}
                          ref={el => (smartPickerRefs.current[resultKeys.tisuExmnRslt2] = el)}
                          keyword={keywords[resultKeys.tisuExmnRslt2]}
                          dataInfo={dataInfo}
                          value={value[resultKeys.tisuExmnRslt2].name}
                          onChange={(id, data) => handleObsrChoicePicker(index, id, data)}
                          onSearch={handleSearch}
                          onSearchFieldChange={handleSearchFieldChange}
                          initializeKeyword={handleInitializeKeyword}
                          disabled={isEditDisabled}
                        />
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
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={resultKeys.obsrInrtMinutes}
                        defaultValue={resultEntries.get(resultKeys.obsrInrtMinutes)}
                        onChange={handleChangeTime}
                        disabled={isEditDisabled}
                        valueOuterControl
                        maxLength={2}
                        style={{ width: "100px" }}
                      />
                    </div>
                    <p className="editText">분</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={resultKeys.obsrInrtSeconds}
                        defaultValue={resultEntries.get(resultKeys.obsrInrtSeconds)}
                        onChange={e => handleChangeTime(e, TYPE_SECONDS)}
                        disabled={isEditDisabled}
                        valueOuterControl
                        maxLength={2}
                        style={{ width: "100px" }}
                      />
                    </div>
                    <p className="editText">초</p>
                  </div>
                  <div className="editBox">
                    <p className="editText">검사종료시간</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={resultKeys.obsrExmnEndMinutes}
                        defaultValue={resultEntries.get(resultKeys.obsrExmnEndMinutes)}
                        onChange={handleChangeTime}
                        disabled={isEditDisabled}
                        valueOuterControl
                        maxLength={2}
                        style={{ width: "100px" }}
                      />
                    </div>
                    <p className="editText">분</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={resultKeys.obsrExmnEndSeconds}
                        defaultValue={resultEntries.get(resultKeys.obsrExmnEndSeconds)}
                        onChange={e => handleChangeTime(e, TYPE_SECONDS)}
                        disabled={isEditDisabled}
                        valueOuterControl
                        maxLength={2}
                        style={{ width: "100px" }}
                      />
                    </div>
                    <p className="editText">초</p>
                  </div>

                  <div className="editBox">
                    <p className="editText">회수시간</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={resultKeys.obsrReclTimeMinutes}
                        defaultValue={resultEntries.get(resultKeys.obsrReclTimeMinutes)}
                        onChange={handleChangeTime}
                        disabled={isEditDisabled}
                        valueOuterControl
                        maxLength={2}
                        style={{ width: "100px" }}
                      />
                    </div>
                    <p className="editText">분</p>
                    <div className="LUX_basic_text">
                      <LUXTextField
                        id={resultKeys.obsrReclTimeSeconds}
                        defaultValue={resultEntries.get(resultKeys.obsrReclTimeSeconds)}
                        onChange={e => handleChangeTime(e, TYPE_SECONDS)}
                        disabled={isEditDisabled}
                        valueOuterControl
                        maxLength={2}
                        style={{ width: "100px" }}
                      />
                    </div>
                    <p className="editText">초</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt" rowSpan="4">
                BBPS
                {resultEntries.get(resultKeys.bpreDgreLC) ||
                resultEntries.get(resultKeys.bpreDgreTC) ||
                resultEntries.get(resultKeys.bpreDgreRC) ? (
                  <span style={{ color: "red" }}>*</span>
                ) : null}
              </th>
              <th scope="row" className="nfont celcnt">
                LC
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx type_flex">{bpreDgreLCRadioButton}</div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                TC
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx type_flex">{bpreDgreTCRadioButton}</div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                RC
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx type_flex">{bpreDgreRCRadioButton}</div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                BBPS총점
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx">{totalBbptScore}</div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt" colSpan="2">
                암검진 권고사항
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx">
                  <div className="editalbe_box">
                    <LUXTextArea
                      id={resultKeys.cncrMdexAdvcMatr}
                      defaultValue={resultEntries.get(resultKeys.cncrMdexAdvcMatr)}
                      hintText=""
                      onChange={handleText}
                      fullWidth
                      disabled={isEditDisabled}
                      style={{ height: "100px" }}
                      resize={false}
                    />
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
                <KeywordCustomPicker
                  id={resultKeys.rsltOpnn1}
                  ref={el => (smartPickerRefs.current[resultKeys.rsltOpnn1] = el)}
                  keyword={keywords[resultKeys.rsltOpnn1]}
                  dataInfo={dataInfo}
                  value={resultEntries.get(resultKeys.rsltOpnn1).name}
                  onChange={handleChoicePicker}
                  onSearch={handleSearch}
                  onSearchFieldChange={handleSearchFieldChange}
                  initializeKeyword={handleInitializeKeyword}
                  disabled={isEditDisabled}
                />
              </td>
              <th scope="row" className="nfont celcnt" rowSpan="3">
                권고사항
              </th>
              <td className="cellft" rowSpan="3">
                <div className="inbx">
                  <div className="editalbe_box">
                    <LUXTextArea
                      id={resultKeys.advcMatrCnts}
                      defaultValue={resultEntries.get(resultKeys.advcMatrCnts)}
                      hintText=""
                      onChange={handleText}
                      fullWidth
                      disabled={isEditDisabled}
                      style={{ height: "100px" }}
                      resize={false}
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                결과소견2
              </th>
              <td className="cellft" style={{ borderRight: "1px solid #e5e5e5" }}>
                <KeywordCustomPicker
                  id={resultKeys.rsltOpnn2}
                  ref={el => (smartPickerRefs.current[resultKeys.rsltOpnn2] = el)}
                  keyword={keywords[resultKeys.rsltOpnn2]}
                  dataInfo={dataInfo}
                  value={resultEntries.get(resultKeys.rsltOpnn2).name}
                  onChange={handleChoicePicker}
                  onSearch={handleSearch}
                  onSearchFieldChange={handleSearchFieldChange}
                  initializeKeyword={handleInitializeKeyword}
                  disabled={isEditDisabled}
                />
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                결과소견3
              </th>
              <td className="cellft" style={{ borderRight: "1px solid #e5e5e5" }}>
                <KeywordCustomPicker
                  id={resultKeys.rsltOpnn3}
                  ref={el => (smartPickerRefs.current[resultKeys.rsltOpnn3] = el)}
                  keyword={keywords[resultKeys.rsltOpnn3]}
                  dataInfo={dataInfo}
                  value={resultEntries.get(resultKeys.rsltOpnn3).name}
                  onChange={handleChoicePicker}
                  onSearch={handleSearch}
                  onSearchFieldChange={handleSearchFieldChange}
                  initializeKeyword={handleInitializeKeyword}
                  disabled={isEditDisabled}
                />
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
                    onChange={(e, v) => handleChange(resultKeys.plypExsnPrcdActgYn, v)}
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
                    onChange={(e, v) =>
                      v !== "Y"
                        ? handleChange(resultKeys.cmpcYn, v, resultKeys.cmpcCnts)
                        : handleChange(resultKeys.cmpcYn, v)
                    }
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
                <div className="inbx">
                  <div className="LUX_basic_select">
                    <LUXSelectField
                      id={resultKeys.cmpcCnts}
                      checkObjectList
                      selectFieldData={resultList.get(cmcdCd[resultKeys.cmpcCnts])}
                      defaultData={resultEntries.get(resultKeys.cmpcCnts)}
                      handleChoiceData={value => handleChange(resultKeys.cmpcCnts, value)}
                      disabled={isEditDisabled || resultEntries.get(resultKeys.cmpcYn) !== "Y"}
                      fullWidth
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

MSC_050200_T02_COLN.propTypes = {
  resultList: PropTypes.instanceOf(Map),
  resultEntries: PropTypes.instanceOf(Map),
  selectedPatient: PropTypes.shape({
    prsc_nm: PropTypes.string,
    iptn_prsn_nm: PropTypes.string,
    iptn_dt: PropTypes.string,
    exmn_hope_date: PropTypes.string,
  }),
  isEditDisabled: PropTypes.bool,
  handleText: PropTypes.func,
  handleChange: PropTypes.func,
  handleChangeData: PropTypes.func,
  handleObsrChange: PropTypes.func,
  handleObsrOnCheckedSingle: PropTypes.func,
};
MSC_050200_T02_COLN.defaultProps = {
  resultList: new Map([]),
  resultEntries: new Map([]),
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
  handleObsrChange: () => {},
  handleObsrOnCheckedSingle: () => {},
};
