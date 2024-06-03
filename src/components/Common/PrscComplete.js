import { forwardRef, useImperativeHandle, useState } from "react";
import callApi from "services/apis";
import PropTypes from "prop-types";
import { LUXSmartComplete } from "luna-rocket";
import moment from "moment";

/**
 * 기본적으로 LUXSmartComplete는 우측 아이콘만을 지원하게 설계되었습니다.
 * @param onCompleleted - 항목이 선택 되었을 때 호출
 * @param icon - 컴플리트 우측에 들어갈 아이콘 Nullable
 * @param ref - current.setKeyword 를 통해 키워드 세팅 가능
 * @author 강현구A
 */
const PrscComplete = forwardRef(({ onCompleted, icon }, ref) => {
  const [prscValue, setPrscValue] = useState("");
  const [lastPrscList, setLastPrscList] = useState(null);

  const searchData = keyword =>
    callApi("/elastic/searchPrsc", { keyword, date: moment(new Date()).format("YYYY-MM-DD") });

  const getDataInfo = () => ({
    row: 1,
    columnWidths: ["20%", "40%", "40%"],
    itemInfo: [
      {
        key: "prsc_cd",
        column: 0,
        isKeyValue: true,
      },
      {
        key: "prsc_nm",
        column: 1,
      },
      {
        key: "suga_enm",
        column: 2,
      },
    ],
  });

  const handleSearch = async keyword => {
    const { resultData } = await searchData(keyword);
    setLastPrscList(resultData);
    return resultData;
  };

  const handleComplete = value => {
    if (value) {
      let prsc;
      for (const elem of lastPrscList) {
        if (elem.prsc_cd === value) {
          prsc = elem;
          break;
        }
      }
      setPrscValue("");
      onCompleted(prsc);
    } else {
      onCompleted(null);
    }
  };
  const handleChange = event => {
    if (event.type === "change") {
      setPrscValue(event.target.value);
    } else {
      handleComplete(event.target.value);
    }
  };

  //function end
  //useEffect start

  useImperativeHandle(
    ref,
    () => ({
      setKeyword: keyword => {
        setPrscValue(keyword);
      },
    }),
    [],
  );

  return (
    <LUXSmartComplete
      value={prscValue}
      onChange={handleChange}
      onSearch={handleSearch}
      // onEnterKeyDown={handleComplete}
      dataInfo={getDataInfo()}
      hintText="처방코드, 처방명으로 검색하세요."
      toolTipFloat="right"
      iconElement={icon}
      maxPopOverHeight={250}
      maxDataCount={1000}
      delayTime={200}
    />
  );
});
PrscComplete.propTypes = {
  onCompleted: PropTypes.func.isRequired,
  icon: PropTypes.node,
};
PrscComplete.defaultProps = {
  icon: undefined,
};
export default PrscComplete;
