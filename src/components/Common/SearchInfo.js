import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

// util
import callApi from "services/apis";
import PropTypes from "prop-types";
import { isDate } from "util";

// common-ui-components
import { LUXButton, LUXComplexPeriodDatePicker, LUXDatePicker, LUXSelectField } from "luna-rocket";

// css
import SearchIcon from "luna-rocket/LUXSVGIcon/Duzon/BlankSize/Search";

// imgs
import PatientComplete from "./PatientComplete";

/**
 * @name 검색 패널
 * @author 윤서영 / 수정 :강현구A
 * 비고 :
 *  2023-09-05 강현구A propTypes 추가
 *  2023-09-25 강현구A PatientComplete적용.
 */

const SearchInfo = forwardRef((props, ref) => {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const {
    type, // 접수, 결과(result) 메뉴 구분
    exrmClsfCd, // 검사 구분 (L: 검체(진단), F: 기능, E: 내시경, R: 방사선(영상))
    date, // 조회날짜
    handleChange, // 값 변경 함수
    handleSearch, // 돋보기 버튼 클릭 시 이벤트
    onDeptListLoaded, //deptList 데이터 로드에 대한 콜백
    onDeptListLoadFailed, //deptList 데이터 로드 실패에 대한 콜백.
    initDeptData, //deptList를 직접 초기화 해줄경우 사용.
    btnStyle, //버튼 스타일
  } = props;

  const [deptList, setDeptList] = useState([{ value: "", text: "전체", exrm_clsf_cd: "" }]);

  const patientCompleteRef = useRef();
  const deptSelectFieldRef = useRef();

  /* ================================================================================== */
  /* 함수(function) 선언 */

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    if (initDeptData) return;
    (async () => {
      try {
        const response = await callApi("/common/selectDeptCode");
        const { resultData, resultMsg } = response;
        if (resultMsg === "SUCCESS") {
          const nextDeptList =
            exrmClsfCd === "All"
              ? deptList.concat(resultData)
              : deptList.concat(resultData.filter(element => element.exrm_clsf_cd === exrmClsfCd));

          setDeptList(nextDeptList);
          onDeptListLoaded &&
            onDeptListLoaded(Array.from(nextDeptList, list => list.value).filter(list => list !== ""));
        } else {
          throw response;
        }
      } catch (e) {
        onDeptListLoadFailed && onDeptListLoadFailed(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initDeptData) {
      setDeptList(initDeptData);
      onDeptListLoaded && onDeptListLoaded(Array.from(initDeptData, list => list.value).filter(list => list !== ""));
    }
  }, [initDeptData, onDeptListLoaded]);

  useImperativeHandle(
    ref,
    () => ({
      setKeyword: (keyword, patient) => {
        patientCompleteRef.current.setKeyword(keyword, patient);
      },
      selectDept: deptCd => {
        deptSelectFieldRef.current.handleChoiceData(
          deptCd !== "" ? Number(deptCd) : deptCd,
          deptList.find(e => e.value.toString() === deptCd.toString()).text,
          false,
        );
      },
      /**
       * 수동으로 completed 상태를 지정. 자동으로 해당하는 키워드가 작성된다. 이벤트 발생 안함.
       * @author khgkjg12 강현구A.
       * @param {{pid: string; pt_nm: string;age_cd: string;}|null} completed
       */
      setCompleted: completed => patientCompleteRef.current.setCompleted(completed),
      /**
       * 환자컴플리트에서 완성된 환자 객체를 반환.
       * @author khgkjg12 강현구.
       * @returns {{pid: string; pt_nm: string;age_cd: string;} | null } 현 시점. 컴포넌트가 가진 completed된 환자정보.
       */
      getCompleted: () => patientCompleteRef.current.getCompleted(),
      /**
       * 환자컴플리트에서 완성된 환자 객체를 반환.
       * @author khgkjg12 강현구.
       * @returns {string} 현 시점. 컴포넌트가 가진 keyword.
       */
      getKeyword: () => patientCompleteRef.current.getKeyword(),
    }),
    [deptList],
  );

  /* ================================================================================== */
  /* render() */
  return (
    <div className="search_box">
      {type === "result" ? (
        <LUXComplexPeriodDatePicker
          datePickerProps={{
            dateFormatSeparator: "-",
          }}
          valueFrom={date.from}
          valueTo={date.to}
          onChange={(from, to) => handleChange({ type: "date", value: { from, to } })}
        />
      ) : (
        <LUXDatePicker
          dateFormatSeparator="-"
          value={date}
          onChange={date => handleChange({ type: "date", value: date })}
        />
      )}

      <LUXSelectField
        className="LUX_basic_select"
        ref={deptSelectFieldRef}
        checkObjectList
        selectFieldData={deptList}
        defaultData={deptList[0].value}
        handleChoiceData={e => {
          handleChange({
            type: "select",
            value: e === "" ? Array.from(deptList, list => list.value).filter(list => list !== "") : [e],
          });
        }}
        listAutoHeight
        style={{ width: "78px" }}
        selectFieldInputBoxStyle={{ width: "46px" }}
      />
      <div style={{ flex: 1 }}>
        <PatientComplete
          ref={patientCompleteRef}
          onCompleted={patient => {
            handleChange({
              type: "complete",
              value: patient ? patient.pid : "",
              completed: patient,
            });
          }}
          onAbsoluteCompleted={patient => {
            handleChange({
              type: "absolute-complete",
              value: patient ? patient.pid : "",
              completed: patient,
            });
          }}
          shortType={type === "result"}
        />
      </div>

      <LUXButton
        className="LUX_basic_btn Image basic"
        type="icon"
        onClick={() => {
          if (!patientCompleteRef.current?.getCompleted()) patientCompleteRef.current?.setCompleted(null, true);
          else handleSearch();
        }}
        icon={
          <SearchIcon
            style={{
              width: "18px",
              height: "18px",
            }}
          />
        }
        style={btnStyle}
      />
    </div>
  );
});
SearchInfo.propTypes = {
  type: PropTypes.oneOf(["result", "receipt"]),
  exrmClsfCd: PropTypes.oneOf(["L", "F", "E", "R", "ALL", "P"]), // 검사 구분 (L: 검체(진단), F: 기능, E: 내시경, R: 방사선(영상), P: 물리치료)
  date: PropTypes.objectOf(isDate), // 조회날짜
  handleChange: PropTypes.func.isRequired, // 값 변경 함수
  handleSearch: PropTypes.func.isRequired, // 돋보기 버튼 클릭 시 이벤트
  onDeptListLoaded: PropTypes.func,
  onDeptListLoadFailed: PropTypes.func,
  initDeptData: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string.isRequired,
      exrm_clsf_cd: PropTypes.string.isRequired,
    }),
  ),
  btnStyle: PropTypes.shape({}),
};
SearchInfo.defaultProps = {
  type: "receipt", // 접수, 결과(result) 메뉴 구분
  exrmClsfCd: "ALL", // 검사 구분 (L: 검체(진단), F: 기능, E: 내시경, R: 방사선(영상))
  date: new Date(), // 조회날짜
  onDeptListLoaded: undefined,
  onDeptListLoadFailed: undefined,
  initDeptData: undefined,
  btnStyle: undefined,
};
export default SearchInfo;
