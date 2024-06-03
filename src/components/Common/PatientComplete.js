import { forwardRef, useImperativeHandle, useState } from "react";
import callApi from "services/apis";
import PropTypes from "prop-types";
import { LUXSmartComplete } from "luna-rocket";
import Search from "luna-rocket/LUXSVGIcon/Duzon/FullSize/Search";

/**
 * @param onCompleted 자동완성 항목 클릭(엔터)(해당 환자), 미완성 포커스 아웃(null), 자동완성된 상태에서 추가적인 엔터(해당 환자), 미 완성 상태에서 엔터(null) 일때 호출
 * @param useIcon  컴플리트 우측에 들어갈 아이콘 사용여부
 * @param onAbsoluteCompleted  자동완성 항목 클릭(엔터), 자동완성된 상태에서 추가적인 엔터(해당 환자), 미입력 상태에서 엔터 입력인 경우만 호출
 * @param useDobrSearch 진료지원Main 화면 생년월일 검색 조건 사용 여부
 * @param shortType 검색필드 영역이 좁은 경우 placeholder 변경
 * @param ref  current.setKeyword 를 통해 키워드와 컴플리트 세팅 가능
 * @name PatientComplete  환자조회컴플리트
 * @author 강현구A
 */
const PatientComplete = forwardRef(({ onCompleted, useIcon, onAbsoluteCompleted, useDobrSearch, shortType }, ref) => {
  const [patientValue, setPatientValue] = useState("");
  const [completed, setCompleted] = useState(null);
  const [lastPatientList, setLastPatientList] = useState(null);

  const searchData = keyword => {
    const regex = /^[0-9]{6}$/; // 숫자만 체크
    const parameters = {
      isDobr: useDobrSearch && regex.test(keyword),
      keyword,
    };
    return callApi("/common/searchPatient", parameters);
  };

  const getDataInfo = () => ({
    row: 1,
    columnWidths: ["25%", "50%", "25%"],
    itemInfo: [
      {
        key: "pid",
        column: 0,
        isKeyValue: true,
      },
      {
        key: "pt_nm",
        column: 1,
      },
      {
        key: "dobr",
        column: 2,
      },
    ],
    patientValue,
  });

  const handleSearch = async keyword => {
    const { resultData } = await searchData(keyword);
    setLastPatientList(resultData);
    return resultData;
  };

  const handleComplete = value => {
    if (value) {
      let patient;
      for (const elem of lastPatientList) {
        if (elem.pid === value) {
          patient = elem;
          break;
        }
      }
      if (!patient) return;
      setPatientValue(patient.pid + " " + patient.pt_nm);
      setCompleted(patient);
      onCompleted && onCompleted(patient);
      onAbsoluteCompleted && onAbsoluteCompleted(patient);
    } else if (completed) {
      onCompleted && onCompleted(completed);
      onAbsoluteCompleted && onAbsoluteCompleted(completed);
    } else {
      onCompleted && onCompleted(null);
      setPatientValue("");
      if (value === undefined && patientValue.length < 1) {
        //onEnterKeyDown(미완성 상태의 엔터)의 경우,특히 미입력 상태였을 경우
        onAbsoluteCompleted && onAbsoluteCompleted(null);
      }
    }
  };

  const handleChange = event => {
    if (event.type === "change") {
      setCompleted(null);
      setPatientValue(event.target.value);
    } else {
      handleComplete(event.target.value);
    }
  };

  //function end
  //useEffect start

  useImperativeHandle(
    ref,
    () => ({
      /**
       * 수동으로 completed 상태를 지정하면서 키워드도 수동으로 작성. 이벤트 발생 안함.
       * @author khgkjg12 강현구A.
       * @param {string} keyword 강제 지정할 키워드 상태.
       * @param {{pid: string; pt_nm: string;age_cd: string;}} completed 강제 지정할 키워드가 내부적으로 가지는 완성 상태, 미기입 or null일 경우 미완성 상태로 취급 된다.
       */
      setKeyword: (keyword = "", completed = null) => {
        setPatientValue(keyword);
        setCompleted(completed); //키워드 특정값으로 임의 지정시 complete된 항목은 제거
      },
      /**
       * 수동으로 completed 상태를 지정. 자동으로 해당하는 키워드가 작성된다. 이벤트 발생 안함.
       * @author khgkjg12 강현구A.
       * @param {{pid: string; pt_nm: string;age_cd: string;}} completed
       * @param {trigger} runCallback 값 설정 후 이벤트 콜백 트리거 여부.
       */
      setCompleted: (completed = null, trigger = false) => {
        if (trigger) {
          handleComplete(completed?.pid);
        } else {
          setPatientValue(completed ? completed.pid + " " + completed.pt_nm : "");
          setCompleted(completed);
        }
      },
      /**
       * @author khgkjg12 강현구A.
       * @returns {{pid: string; pt_nm: string;age_cd: string;} | null } 현 시점. 컴포넌트가 가진 completed된 환자정보.
       */
      getCompleted: () => completed,
      /**
       * @author khgkjg12 강현구A.
       * @returns {string } 현 시점. 컴포넌트가 가진 keyword.
       */
      getKeyword: () => patientValue,
    }),
    [completed, patientValue, handleComplete],
  );

  return (
    <LUXSmartComplete
      minPopOverWidth={250}
      value={patientValue}
      onChange={handleChange}
      onSearch={handleSearch}
      onEnterKeyDown={handleComplete}
      dataInfo={getDataInfo()}
      hintText={
        useDobrSearch ? "이름/환자번호/생년월일을 입력하세요." : shortType ? "환자 검색" : "이름/환자번호를 입력하세요."
      }
      toolTipFloat="right"
      iconElement={useIcon && <Search />}
      maxPopOverHeight={250}
      maxDataCount={1000}
      delayTime={200}
      style={useDobrSearch && { width: "220px" }}
    />
  );
});
PatientComplete.propTypes = {
  onCompleted: PropTypes.func,
  onAbsoluteCompleted: PropTypes.func,
  useIcon: PropTypes.bool,
  useDobrSearch: PropTypes.bool,
  shortType: PropTypes.bool,
};
PatientComplete.defaultProps = {
  useIcon: false,
  onCompleted: undefined,
  onAbsoluteCompleted: undefined,
  useDobrSearch: null,
  shortType: false,
};
export default PatientComplete;
