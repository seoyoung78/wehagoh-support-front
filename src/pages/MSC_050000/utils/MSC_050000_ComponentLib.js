import React, { forwardRef, useImperativeHandle, useEffect, useRef } from "react";

import { LUXRadioButtonGroup, LUXRadioButton, LUXCheckBox, LUXTextField, LUXSelectField } from "luna-rocket";
import { cmcdCd } from "pages/MSC_050000/utils/MSC_050000_NameCodesMapping";
import PropTypes from "prop-types";
import CustomStyledSmartPicker from "components/Common/CustomStyledSmartPicker";

export const KeywordCustomPicker = forwardRef((props, ref) => {
  const { id, keyword, dataInfo, value, onChange, onSearch, onSearchFieldChange, initializeKeyword, disabled } = props;
  const smartPickerRef = useRef(null);
  useImperativeHandle(ref, () => smartPickerRef.current, []);

  useEffect(() => {
    if (smartPickerRef.current.state.isPopoverOpen) {
      smartPickerRef.current.search();
    }
    smartPickerRef.current.handleCancel = () => {
      initializeKeyword(id);
      smartPickerRef.current.clearPopOver();
    };
  }, [keyword, id, initializeKeyword]);

  return (
    <CustomStyledSmartPicker
      ref={smartPickerRef}
      dataInfo={dataInfo}
      value={value}
      onChange={(e, data) => {
        onChange(id, data);
        initializeKeyword(id);
      }}
      onSearch={() => onSearch(id)}
      onSearchFieldChange={(e, keyword) => onSearchFieldChange(id, keyword)}
      onRequestClose={() => {
        smartPickerRef.current.clearPopOver();
        initializeKeyword(id);
      }}
      disabled={disabled}
    />
  );
});

/**
 * 필수 입력 필드를 나타내는 인디케이터 컴포넌트
 * * @param {boolean} isRequired
 * * @returns {JSX.Element | null}
 */
export function RequiredIndicator({ isRequired }) {
  return isRequired ? <span style={{ color: "red" }}>*</span> : null;
}

/**
 * 동적 라디오 버튼 그룹을 렌더링하는 컴포넌트
 *
 * 이 컴포넌트는 주어진 매개변수를 바탕으로 라디오 버튼 그룹을 생성한다.
 * listMap에서 cmcdClsfCd에 해당하는 라디오 버튼 목록을 가져와서
 * 각 라디오 버튼을 렌더링한다.
 *
 * @param {string} mapKey - 라디오 버튼 그룹의 고유 식별자
 *                          이 값은 라디오 버튼 그룹의 id와 name 속성에 사용
 * @param {Map} listMap - cmcdClsfCd를 키로 사용하는 라디오 버튼 목록을 보유하는 Map 객체
 * @param {string} cmcdClsfCd - listMap에서 라디오 버튼 목록을 조회하는 데 사용되는 키 값
 * @param {Function} onChange - 라디오 버튼 선택이 변경될 때 호출되는 콜백 함수
 *                              이 함수는 선택된 라디오 버튼의 value를 인자로 받는다.
 * @param {boolean} disabled - 라디오 버튼 그룹의 활성/비활성 상태를 결정한다.
 * @param {string} defaultSelected - 초기에 선택되어야 하는 라디오 버튼의 value
 * @param {boolean} conditionalGap - 체크박스 사이의 조건부 간격 적용 여부.
 *
 * @returns {JSX.Element} 라디오 버튼 그룹을 렌더링하는 JSX를 반환
 *
 */
function DynamicRadioButton({ mapKey, listMap, cmcdClsfCd, onChange, disabled, defaultSelected, conditionalGap }) {
  return (
    <LUXRadioButtonGroup id={mapKey} name={mapKey} defaultSelected={defaultSelected} onChange={onChange}>
      {listMap.get(cmcdClsfCd).map(({ cmcd_cd, cmcd_nm }) => (
        <LUXRadioButton
          key={`${cmcd_cd}${cmcd_nm}`}
          value={cmcd_cd}
          labelText={cmcd_nm}
          style={{ marginRight: "10px" }}
          disabled={disabled}
          className={conditionalGap ? "common_radio_input" : ""}
        />
      ))}
    </LUXRadioButtonGroup>
  );
}

/**
 * 동적 라디오 버튼 반환
 *
 * @param {Map} entityMap - 선택된 라디오 버튼의 값을 보유하는 Map 객체
 * @param {Map} listMap - 라디오 버튼 목록을 보유하는 Map 객체
 * @param {boolean} disabled - 모든 라디오 버튼의 활성/비활성 상태를 결정
 * @returns {Function} 라디오 버튼을 동적으로 생성하는 함수
 *                      이 함수는 mapKey (라디오 버튼 그룹을 식별하는 키)와
 *                      onChange (라디오 버튼 선택 변경 시 호출될 이벤트 핸들러)를 인자로 받는다.
 */
export const createDynamicRadioButton = (entityMap, listMap, disabled) =>
  function (mapKey, onChange, conditionalGap) {
    return (
      <DynamicRadioButton
        mapKey={mapKey}
        listMap={listMap}
        cmcdClsfCd={cmcdCd[mapKey]}
        onChange={(e, v) => onChange(mapKey, v)}
        disabled={disabled}
        defaultSelected={entityMap.get(mapKey)}
        conditionalGap={conditionalGap}
      />
    );
  };

// 추가 입력 필드 분기처리
function ExtraInputField({ inputType, inputProps, inputText }) {
  switch (inputType) {
    case "select":
      // eslint-disable-next-line react/jsx-props-no-spreading
      return <LUXSelectField {...inputProps} />;
    case "textField":
      // eslint-disable-next-line react/jsx-props-no-spreading
      return <LUXTextField {...inputProps} />;
    case "text":
      return inputText;
    default:
      return null;
  }
}

// key를 받아서 특정 단일 체크박스 구성 요소를 생성하는 함수 반환
export const createSingleCheckbox = (entityMap, disabled) =>
  function (mapKey, onCheck, initialKey = "") {
    const entry = entityMap.get(mapKey);

    return (
      <LUXCheckBox
        id={mapKey}
        labelText={entry.name}
        checked={entry.checked}
        onCheck={(event, checked, id) => onCheck(checked, id, initialKey)}
        disabled={disabled}
      />
    );
  };

/**
 * 동적 체크박스 컴포넌트를 렌더링한다. 조건에 따라 추가 입력 필드를 포함할 수 있다.
 * @param {Map} listMap - 체크박스 목록 데이터를 포함하는 Map 객체.
 * @param {string} cmcdClsfCd - 체크박스 그룹을 식별하는 코드.
 * @param {Function} onCheck - 체크박스 변경 시 호출되는 콜백 함수.
 * @param {boolean} isDisabled - 체크박스 활성화/비활성화 여부.
 * @param {boolean} isExtraField - 추가 입력 필드의 표시 여부.
 * @param {string} extraFieldCode - 추가 입력 필드를 표시할 조건 코드.
 * @param {string} inputType - 추가 입력 필드의 타입 (예: 'text', 'select').
 * @param {Object} inputProps - 추가 입력 필드에 전달될 props 객체.
 * @param {boolean} conditionalGap - 체크박스 사이의 조건부 간격 적용 여부.
 * @param {Array} conditionArray - 특정 공통코드만 렌더링할 때 사용.
 * @param {string} inputText - 추가 입력 필드에 전달될 텍스트.
 * @param {Object} refs - 추가 입력 필드의 DOM 요소를 참조: 출력지 높이 계산에 사용.
 * @returns 체크박스 목록과 선택적으로 추가 입력 필드를 포함한 React 요소 리스트.
 */
function DynamicCheckBox({
  mapKey,
  listMap,
  cmcdClsfCd,
  onCheck,
  isDisabled,
  isExtraField,
  extraFieldCode,
  inputType,
  inputProps,
  conditionalGap,
  conditionArray,
  inputText,
  refs,
}) {
  return listMap.get(cmcdClsfCd).map(({ cmcd_cd, cmcd_nm, checked, disabled }, index) => {
    const isRenderExtraField = isExtraField && cmcd_cd === extraFieldCode;
    const isExcluded = conditionArray?.length && !conditionArray.includes(cmcd_cd);
    const className = conditionalGap && !isRenderExtraField ? "common_radio_input" : "";
    const componentKey = cmcd_cd + cmcd_nm;
    const checkbox = (
      <LUXCheckBox
        id={cmcdClsfCd}
        labelText={cmcd_nm}
        checked={checked}
        onCheck={(event, checked, id) => onCheck(checked, id, index, cmcd_cd)}
        disabled={isDisabled || disabled}
        style={{ marginRight: "10px" }}
        ref={el => {
          if (isRenderExtraField && el) {
            refs[mapKey] = el;
          }
        }}
      />
    );
    const extraInputField = isRenderExtraField ? (
      <ExtraInputField
        inputType={inputType}
        inputProps={{ ...inputProps, disabled: isDisabled || !checked }}
        inputText={inputText}
      />
    ) : null;

    return isExcluded ? null : (
      <React.Fragment key={componentKey}>
        <div className={className}>{checkbox}</div>
        <div>{extraInputField}</div>
      </React.Fragment>
    );
  });
}

/**
 * 동적 체크박스 컴포넌트를 생성하는 고차 함수. 조건부로 추가 입력 필드와 간격을 적용할 수 있다.
 * @param {Map} listMap - 체크박스 항목 데이터를 포함하는 Map 객체.
 * @param {boolean} disabled - 모든 체크박스의 비활성화 여부.
 * @returns {Function} - 특정 mapKey에 따라 동적 체크박스 컴포넌트를 생성하는 함수.
 *
 * 생성된 함수는 다음 파라미터를 받는다:
 * @param {string} mapKey - 체크박스 그룹을 식별하는 키.
 * @param {Function} onCheck - 체크박스가 체크될 때 실행할 콜백 함수.
 * @param {boolean} isExtraField - 추가 입력 필드의 표시 여부.
 * @param {string} extraFieldCode - 추가 입력 필드를 표시할 조건 코드.
 * @param {string} inputType - 추가 입력 필드의 타입 ('text', 'select' 등).
 * @param {Object} inputProps - 추가 입력 필드에 전달할 props.
 * @param {boolean} conditionalGap - 체크박스 사이에 조건부 간격을 적용할지 여부.
 * @param {Array.<string>} conditionArray - 조건부 간격 적용 시 참조할 조건 코드 배열.
 */
export const createDynamicCheckbox = (listMap, disabled, refs) =>
  function (
    mapKey,
    onCheck,
    isExtraField,
    extraFieldCode,
    inputType,
    inputProps,
    conditionalGap,
    conditionArray,
    inputText,
  ) {
    return (
      <DynamicCheckBox
        mapKey={mapKey}
        listMap={listMap}
        cmcdClsfCd={cmcdCd[mapKey]}
        onCheck={onCheck}
        isDisabled={disabled}
        isExtraField={isExtraField}
        extraFieldCode={extraFieldCode}
        inputType={inputType}
        inputProps={inputProps}
        inputText={inputText}
        conditionalGap={conditionalGap}
        conditionArray={conditionArray}
        refs={refs}
      />
    );
  };

// 퇴실기준 동적 라디오 버튼 컴포넌트
function DynamicChotBassRadioButton({
  mapKey,
  listMap,
  cmcdClsfCd,
  requiredExpl,
  onChange,
  disabled,
  defaultSelected,
}) {
  return listMap.get(cmcdClsfCd).map(({ cmcd_cd, cmcd_nm, cmcd_expl }, index) =>
    cmcd_expl === requiredExpl ? (
      <LUXRadioButtonGroup
        key={`${index}${cmcd_cd}${cmcd_nm}`}
        id={mapKey}
        name={mapKey}
        defaultSelected={defaultSelected}
        onChange={onChange}
      >
        <LUXRadioButton value={cmcd_cd} labelText={cmcd_nm} disabled={disabled} style={{ marginRight: "10px" }} />
      </LUXRadioButtonGroup>
    ) : null,
  );
}

// 퇴실기준 동적 라디오 버튼 반환
export const createChotBassDynamicRadioButton = (mapKey, entityMap, listMap, handleChangeData, disabled) =>
  function (requiredExpl) {
    const chotBassEntry = entityMap.get(mapKey);
    const defaultSelected = chotBassEntry[requiredExpl];

    const handleChange = (type, code) => {
      const updateMap = new Map(entityMap);
      let values = updateMap.get(mapKey);

      let { totalScore } = values;
      const { cmcd_figr_valu1: currentScore } = listMap.get(cmcdCd[mapKey]).find(v => v.cmcd_cd === code); // default 점수
      const prevScore = values[`${type}Score`];

      if (prevScore) totalScore -= prevScore;
      totalScore += currentScore;

      values = { ...values, totalScore, isTouched: true, [type]: code, [`${type}Score`]: currentScore };
      updateMap.set(mapKey, values);

      handleChangeData("basicEntries", updateMap);
    };

    return (
      <DynamicChotBassRadioButton
        mapKey={mapKey}
        listMap={listMap}
        cmcdClsfCd={cmcdCd[mapKey]}
        onChange={(e, v) => handleChange(requiredExpl, v)}
        disabled={disabled || chotBassEntry.checked}
        defaultSelected={defaultSelected}
        requiredExpl={requiredExpl}
      />
    );
  };

KeywordCustomPicker.propTypes = {
  id: PropTypes.string.isRequired,
  keyword: PropTypes.string,
  dataInfo: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, width: PropTypes.number })).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onSearchFieldChange: PropTypes.func,
  initializeKeyword: PropTypes.func,
  disabled: PropTypes.bool,
};

KeywordCustomPicker.defaultProps = {
  keyword: "",
  onSearchFieldChange: () => {},
  initializeKeyword: () => {},
  disabled: false,
};

RequiredIndicator.propTypes = {
  isRequired: PropTypes.bool,
};
RequiredIndicator.defaultProps = {
  isRequired: false,
};

DynamicRadioButton.propTypes = {
  mapKey: PropTypes.string.isRequired,
  listMap: PropTypes.instanceOf(Map).isRequired,
  cmcdClsfCd: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  defaultSelected: PropTypes.string,
  conditionalGap: PropTypes.bool,
};

DynamicRadioButton.defaultProps = {
  onChange: (e, v) => console.log(e, v),
  disabled: false,
  defaultSelected: "",
  conditionalGap: false,
};
DynamicChotBassRadioButton.propTypes = {
  mapKey: PropTypes.string.isRequired,
  listMap: PropTypes.instanceOf(Map).isRequired,
  cmcdClsfCd: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  requiredExpl: PropTypes.string,
  defaultSelected: PropTypes.string,
};

DynamicChotBassRadioButton.defaultProps = {
  onChange: (e, v) => console.log(e, v),
  disabled: false,
  requiredExpl: "",
  defaultSelected: "",
};

DynamicCheckBox.propTypes = {
  mapKey: PropTypes.string,
  listMap: PropTypes.instanceOf(Map).isRequired,
  cmcdClsfCd: PropTypes.string.isRequired,
  onCheck: PropTypes.func,
  isDisabled: PropTypes.bool,
  isExtraField: PropTypes.bool,
  extraFieldCode: PropTypes.string,
  inputType: PropTypes.string,
  inputProps: PropTypes.object, // extraInput 을 {...props} 로 전달받아 프로퍼티 정의 불가능
  conditionalGap: PropTypes.bool,
  conditionArray: PropTypes.arrayOf(PropTypes.string),
  refs: PropTypes.object,
};

DynamicCheckBox.defaultProps = {
  mapKey: "",
  onCheck: (event, checked, id) => console.log(checked, id),
  isDisabled: false,
  isExtraField: false,
  extraFieldCode: "",
  inputType: "",
  inputProps: {},
  conditionalGap: false,
  conditionArray: null,
  refs: {},
};

ExtraInputField.propTypes = {
  inputType: PropTypes.string,
  inputProps: PropTypes.object,
  inputText: PropTypes.string,
};

ExtraInputField.defaultProps = {
  inputType: "",
  inputProps: {},
  inputText: "",
};
