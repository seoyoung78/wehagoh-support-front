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
import { getSmartValue, getObsrButton, cloneObservationObject } from "pages/MSC_050000/utils/MSC_050000_Utils";
import {
  createDynamicRadioButton,
  createDynamicCheckbox,
  KeywordCustomPicker,
} from "pages/MSC_050000/utils/MSC_050000_ComponentLib";

// scss
import "assets/style/MSC_050200.scss";

// imgs

/**
 * @name  결과기록 위장
 * @author 김령은
 */
export default function MSC_050200_T02_GSIT(props) {
  const {
    resultList,
    resultEntries,
    selectedPatient,
    isEditDisabled,
    handleChangeData,
    handleChange,
    handleOnChecked,
    handleText,
    handleObsrChange,
    resetEtcOnUncheck,
    handleObsrOnCheckedSingle,
  } = props;

  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [exmnDate, setExmnDate] = useState(new Date());
  const [iptnDate, setIptnDate] = useState(new Date());

  const isIptnDate = !!selectedPatient?.iptn_dt;

  const [keywords, setKeywords] = useState({
    [resultKeys.obsrOpnn]: "",
    [resultKeys.tisuExmnRslt1]: "",
  });

  // 스마트피커 Ref
  const obsrOpnnRef = useRef([]);
  const tisuExmnRsltRef = useRef([]);

  /** 상수케이스  */
  const RESULT_FIELD_ENTRY = "resultEntries";
  const RESULT_FIELD_LIST = "resultList";
  const TYPE_EVENT_OBJECT = "eventObject";
  const EXTRA_INPUT_TEXT_FIELD = "textField";

  // 조건에 따라 컴포넌트가 추가되는 공통코드
  const TRTM_CD_ETC = "5"; // 기타
  const ADVC_MATR_ETC = "5"; // 기타

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const createResetEctOnUncheckHandler = (etcCode, cntsKey) => (checked, id, index, cmcdCd) => {
    if (cmcdCd === etcCode && !checked) {
      resetEtcOnUncheck(cntsKey);
    }
    handleOnChecked(checked, id, index);
  };

  /* 커링 함수 초기화 */
  // 라디오 버튼
  const createRadioButtonWithProps = createDynamicRadioButton(resultEntries, resultList, isEditDisabled);
  const stmcBctrExmnRsltRadioButton = createRadioButtonWithProps(resultKeys.stmcBctrExmnRslt, handleChange);
  const exsnPrcdActgMthdRadioButton = createRadioButtonWithProps(resultKeys.exsnPrcdActgMthd, handleChange);
  const cmpcTrtmMthdRadioButton = createRadioButtonWithProps(resultKeys.cmpcTrtmMthd, handleChange);
  const cmpcPrgrRadioButton = createRadioButtonWithProps(resultKeys.cmpcPrgr, handleChange);

  // 체크박스
  const createCheckBoxWithProps = createDynamicCheckbox(resultList, isEditDisabled);
  const cloCdCheckBox = createCheckBoxWithProps(resultKeys.cloCd, handleOnChecked);
  const trtmMdtrCdCheckBox = createCheckBoxWithProps(
    resultKeys.trtmMdtrCd,
    createResetEctOnUncheckHandler(TRTM_CD_ETC, resultKeys.trtmMdtrCnts),
    true,
    TRTM_CD_ETC,
    EXTRA_INPUT_TEXT_FIELD,
    {
      id: resultKeys.trtmMdtrCnts,
      defaultValue: resultEntries.get(resultKeys.trtmMdtrCnts),
      onChange: handleText,
      valueOuterControl: true,
      style: { maxWidth: "120px" },
    },
  );
  const advcMatrCheckBox = createCheckBoxWithProps(
    resultKeys.advcMatr,
    createResetEctOnUncheckHandler(ADVC_MATR_ETC, resultKeys.advcMatrCnts),
    true,
    ADVC_MATR_ETC,
    EXTRA_INPUT_TEXT_FIELD,
    {
      id: resultKeys.advcMatrCnts,
      defaultValue: resultEntries.get(resultKeys.advcMatrCnts),
      onChange: handleText,
      valueOuterControl: true,
      style: { maxWidth: "100px" },
    },
  );

  // 관찰 소견 체크박스 이벤트 핸들러
  // > ResultList > LIST(관찰소견 리스트) > Object key : Value > LIST(체크박스 리스트) 구조
  const handleObsrOnChecked = (value, id, checked, checkedIndex, parentIndex) => {
    const updateKey = resultKeys.exmnObsrOpnnSqno;
    const updateLst = lodash.cloneDeep(resultList); // 1. ResultList 클론
    const obsrList = updateLst.get(updateKey); // 2. 관찰소견 리스트 가져오기
    const updateValue = lodash.cloneDeep(value); // 3. Object 복제
    const checkboxes = updateValue[id]; // 4. 상수에 체크박스 리스트의 참조 주소값 대입
    checkboxes[checkedIndex] = { ...checkboxes[checkedIndex], checked }; // 5. 체크박스 리스트 값 변경
    obsrList[parentIndex] = updateValue; // 5. 관찰소견 리스트에 변경한 값 적용
    // 6. map에 업데이트 값 세팅
    updateLst.set(updateKey, obsrList);
    // 7. 디스패치
    handleChangeData(RESULT_FIELD_LIST, updateLst);
  };

  // 관찰소견 추가
  const handleObsrAdd = () => {
    const updateKey = resultKeys.exmnObsrOpnnSqno;
    const updateLst = lodash.cloneDeep(resultList);
    const opnn = cloneObservationObject();
    let obsrList = updateLst.get(updateKey);
    obsrList = [...obsrList, opnn];
    updateLst.set(updateKey, obsrList);
    handleChangeData(RESULT_FIELD_LIST, updateLst);
  };

  // 관찰소견 삭제
  const handleObsrDelete = index => {
    const updateKey = resultKeys.exmnObsrOpnnSqno;
    const updateLst = lodash.cloneDeep(resultList);
    const obsrList = updateLst.get(updateKey);
    const filterList = obsrList.filter((v, i) => i !== index);
    updateLst.set(updateKey, filterList);

    handleChangeData(RESULT_FIELD_LIST, updateLst);
  };

  const handleChangeCmpn = value => {
    const updateMap = new Map(resultEntries);
    updateMap.set(resultKeys.cmpcYn, value);
    if (value === "N") {
      updateMap.set(resultKeys.cmpcCnts, "");
    }
    handleChangeData(RESULT_FIELD_ENTRY, updateMap);
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
  const handleChoicePicker = (parentIndex, id, data) => {
    if (!id || !data || !data?.length) return;

    const updateKey = resultKeys.exmnObsrOpnnSqno;
    const updateLst = lodash.cloneDeep(resultList); // 1. ResultList 클론
    const obsrList = updateLst.get(updateKey); // 2. 관찰소견 리스트 가져오기

    const updateValue = data[0].cmcd_cd;
    const { name, value } = prepareAndExecuteGetSmartValue(id, updateValue);

    obsrList[parentIndex] = { ...obsrList[parentIndex], [id]: { name, value } }; // 3. 관찰소견 리스트에 변경한 값 적용
    updateLst.set(updateKey, obsrList); // 4. map에 업데이트 값 세팅

    handleChangeData(RESULT_FIELD_LIST, updateLst);
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
      const originList = resultList.get(cmcdCd[id]);
      const filterList = originList.filter(({ cmcd_nm }) => re.test(cmcd_nm));
      resolve(filterList);
    });

  /* 스마트 피커 함수 End */
  /* ================================================================================== */
  /* Hook(useEffect) */
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
                검사/판정일
              </th>
              <td className="cellft" colSpan="3">
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
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                내시경 의사명
              </th>
              <td className="cellft">
                <div className="inbx">
                  <p className="ellipsis">{resultEntries.get(resultKeys.endsDrNm)}</p>
                </div>
              </td>
              <th scope="row" className="nfont celcnt">
                기존 위암환자
              </th>
              <td className="cellft">
                <div className="inbx type_flex">
                  <LUXRadioButtonGroup
                    id={resultKeys.gscnPtYn}
                    name={resultKeys.gscnPtYn}
                    defaultSelected={resultEntries.get(resultKeys.gscnPtYn)}
                    onChange={(e, v) => handleChange(resultKeys.gscnPtYn, v)}
                  >
                    <LUXRadioButton
                      value="Y"
                      labelText="해당"
                      style={{ marginRight: "10px" }}
                      disabled={isEditDisabled}
                    />
                    <LUXRadioButton
                      value="N"
                      labelText="미해당"
                      style={{ marginRight: "10px" }}
                      disabled={isEditDisabled}
                    />
                  </LUXRadioButtonGroup>
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
                              onCheck={(event, checked, id) =>
                                handleObsrOnChecked(value, id, checked, childIndex, index)
                              }
                              disabled={isEditDisabled}
                              style={{ marginRight: "10px" }}
                            />
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="editalbe_box con_box_margin">
                        <LUXTextArea
                          className="editablediv"
                          id={resultKeys.obsrOpnnCnts}
                          defaultValue={value[resultKeys.obsrOpnnCnts]}
                          hintText=""
                          onChange={e => handleObsrChange(index, TYPE_EVENT_OBJECT, e)}
                          fullWidth
                          disabled={isEditDisabled}
                          style={{ minHight: "80px" }}
                          resize={false}
                        />
                      </div>
                      <div className="tblConBox">
                        <div className="editBox inbx_noPaddingLeft">
                          <KeywordCustomPicker
                            id={resultKeys.obsrOpnn}
                            ref={el => (obsrOpnnRef.current[index] = el)}
                            keyword={keywords[resultKeys.obsrOpnn]}
                            dataInfo={dataInfo}
                            value={value[resultKeys.obsrOpnn].name}
                            onChange={(id, data) => handleChoicePicker(index, id, data)}
                            onSearch={handleSearch}
                            onSearchFieldChange={handleSearchFieldChange}
                            initializeKeyword={handleInitializeKeyword}
                            disabled={isEditDisabled}
                          />
                        </div>
                        <div className="inbx type_flex">
                          <LUXCheckBox
                            id={resultKeys.tisuExmnYn}
                            labelText={value[resultKeys.tisuExmnYn].name}
                            checked={value[resultKeys.tisuExmnYn].checked}
                            onCheck={(event, checked, id) =>
                              handleObsrOnCheckedSingle(index, checked, id, resultKeys.tisuExmnNoit)
                            }
                            disabled={isEditDisabled}
                          />
                        </div>
                        <div className="LUX_basic_text">
                          <LUXTextField
                            id={resultKeys.tisuExmnNoit}
                            defaultValue={value[resultKeys.tisuExmnNoit]}
                            onChange={e => handleObsrChange(index, TYPE_EVENT_OBJECT, e)}
                            disabled={isEditDisabled || !value[resultKeys.tisuExmnYn].checked}
                            valueOuterControl
                            style={{ width: "100px", marginRight: "15px" }}
                            maxLength={200}
                          />
                        </div>
                        <p style={{ marginRight: "8px" }}>조직검사 결과</p>
                        <div className="editBox">
                          <KeywordCustomPicker
                            id={resultKeys.tisuExmnRslt1}
                            ref={el => (tisuExmnRsltRef.current[index] = el)}
                            keyword={keywords[resultKeys.tisuExmnRslt1]}
                            dataInfo={dataInfo}
                            value={value[resultKeys.tisuExmnRslt1].name}
                            onChange={(id, data) => handleChoicePicker(index, id, data)}
                            onSearch={handleSearch}
                            onSearchFieldChange={handleSearchFieldChange}
                            initializeKeyword={handleInitializeKeyword}
                            disabled={isEditDisabled}
                          />
                        </div>
                        {index === 0
                          ? getObsrButton(
                              "add",
                              handleObsrAdd,
                              isEditDisabled || resultList.get(resultKeys.exmnObsrOpnnSqno).length > 2,
                            )
                          : getObsrButton("delete", () => handleObsrDelete(index), isEditDisabled)}
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
                <div className="inbx type_flex">{stmcBctrExmnRsltRadioButton}</div>
              </td>
              <th scope="row" className="nfont celcnt">
                CLO
              </th>
              <td className="cellft">
                <div className="inbx type_flex">{cloCdCheckBox}</div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                처치 및 치료
              </th>
              <td className="cellft">
                <div className="inbx type_flex">{trtmMdtrCdCheckBox}</div>
              </td>
              <th scope="row" className="nfont celcnt">
                절제술 시행방법
              </th>
              <td className="cellft">
                <div className="inbx type_flex">{exsnPrcdActgMthdRadioButton}</div>
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
                    onChange={(e, v) => handleChangeCmpn(v)}
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
                <div className="inbx">
                  <div className="LUX_basic_select" style={{ flex: 1 }}>
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
            <tr>
              <th scope="row" className="nfont celcnt">
                합병증 처치방법
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx type_flex">{cmpcTrtmMthdRadioButton}</div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                합병증 경과
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx type_flex">{cmpcPrgrRadioButton}</div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                암검진 권고사항
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx">
                  <div className="editalbe_box">
                    <LUXTextArea
                      className="editablediv"
                      id={resultKeys.cncrMdexAdvcMatr}
                      defaultValue={resultEntries.get(resultKeys.cncrMdexAdvcMatr)}
                      hintText=""
                      onChange={handleText}
                      fullWidth
                      disabled={isEditDisabled}
                      style={{ height: "200px" }}
                      resize={false}
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row" className="nfont celcnt">
                권고사항
              </th>
              <td className="cellft" colSpan="3">
                <div className="inbx type_flex">{advcMatrCheckBox}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

MSC_050200_T02_GSIT.propTypes = {
  resultList: PropTypes.instanceOf(Map),
  resultEntries: PropTypes.instanceOf(Map),
  selectedPatient: PropTypes.shape({
    prsc_nm: PropTypes.string,
    iptn_prsn_nm: PropTypes.string,
    iptn_dt: PropTypes.string,
    exmn_hope_date: PropTypes.string,
  }),
  isEditDisabled: PropTypes.bool,
  handleChangeData: PropTypes.func,
  handleChange: PropTypes.func,
  handleOnChecked: PropTypes.func,
  handleText: PropTypes.func,
  handleObsrChange: PropTypes.func,
  resetEtcOnUncheck: PropTypes.func,
  handleObsrOnCheckedSingle: PropTypes.func,
};
MSC_050200_T02_GSIT.defaultProps = {
  resultList: new Map([]),
  resultEntries: new Map([]),
  isEditDisabled: false,
  selectedPatient: {
    prsc_nm: "",
    iptn_prsn_nm: "",
    iptn_dt: "",
    exmn_hope_date: "",
  },
  handleChangeData: () => {},
  handleChange: () => {},
  handleOnChecked: () => {},
  handleText: () => {},
  handleObsrChange: () => {},
  resetEtcOnUncheck: () => {},
  handleObsrOnCheckedSingle: () => {},
};
