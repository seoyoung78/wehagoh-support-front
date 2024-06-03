import { useState } from "react";
import { LUXButton, LUXSmartComplete } from "luna-rocket";
import SearchIcon from "luna-rocket/LUXSVGIcon/Duzon/BlankSize/Search";
import useMSC100100Store from "./store";

const dataInfo = {
  row: 1,
  columnWidths: ["100%"],
  itemInfo: [
    { key: "exmn_opnn_titl", column: 0 },
    { key: "exmn_opnn_sqno", column: 1, isKeyValue: true },
  ],
};
/**
 * 서치바 컴포넌트.
 * @author 강현구A(2024-01-31~), 김진한A(원 소스)
 */
export default function () {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [completed, setCompleted] = useState(null);
  const isEditMode = useMSC100100Store(state => state.opnn.isEditMode);
  const opnnMap = useMSC100100Store(state => state.opnn.opnnMap);
  const changeSelectItem = useMSC100100Store(state => state.opnn.changeSelectItem);
  const isSameInput = useMSC100100Store(state => state.opnn.isSameInput);
  const unsavedAlert = useMSC100100Store(state => state.confirm.unsavedAlert);

  const editOpnn = useMSC100100Store(state => state.api.editOpnn);
  const saveOpnn = useMSC100100Store(state => state.api.saveOpnn);
  const searchOpnn = useMSC100100Store(state => state.api.searchOpnn);
  const selectOpnnList = useMSC100100Store(state => state.api.selectOpnnList);

  const changeKeyword = keyword => {
    setSearchKeyword(keyword);
    setCompleted(null);
  };

  const onAfterCompleteAsync = async sqno => {
    if (!isSameInput()) {
      if (await unsavedAlert()) {
        isEditMode ? await editOpnn() : await saveOpnn();
        selectOpnnList();
      }
    }
    setCompleted(sqno);
    setSearchKeyword(opnnMap[sqno].exmn_opnn_titl);
    selectOpnnList().then(() => {
      changeSelectItem(sqno);
    });
  };

  const handleChange = event => {
    if (event.type === "change") {
      /* 검색어 타이핑 이벤트 */
      changeKeyword(event.target.value);
    } else if (event.type === undefined) {
      /* completee 선택 이벤트 */
      const exmn_opnn_sqno = parseInt(event.target.value, 10);
      setCompleted(exmn_opnn_sqno);
      onAfterCompleteAsync(exmn_opnn_sqno);
    }
  };

  const handleSearch = async keyword => {
    const { resultData } = await searchOpnn(keyword);
    return resultData;
  };

  const forceSearch = () => {
    if (completed) {
      onAfterCompleteAsync(completed);
    } else {
      changeKeyword("");
    }
  };

  return (
    <div className="search_box">
      <LUXSmartComplete
        value={searchKeyword}
        onChange={handleChange}
        onSearch={handleSearch}
        onEnterKeyDown={forceSearch}
        dataInfo={dataInfo}
        hintText="소견 제목을 검색하세요."
        toolTipFloat="right"
      />
      <LUXButton
        className="LUX_basic_btn Image basic"
        type="icon"
        icon={
          <SearchIcon
            style={{
              width: "18px",
              height: "18px",
            }}
          />
        }
        onClick={forceSearch}
        style={{ width: "27px", height: "27px" }}
      />
    </div>
  );
}
