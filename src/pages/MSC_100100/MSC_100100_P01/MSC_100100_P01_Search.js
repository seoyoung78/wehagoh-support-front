import { useState } from "react";
import { LUXSmartComplete } from "luna-rocket";
import SearchIcon from "luna-rocket/LUXSVGIcon/Duzon/FullSize/Search";
import useMSC100100P01Store from "./store";

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
  const isEditMode = useMSC100100P01Store(state => state.opnn.isEditMode);
  const opnnMap = useMSC100100P01Store(state => state.opnn.opnnMap);
  const changeSelectItem = useMSC100100P01Store(state => state.opnn.changeSelectItem);
  const isSameInput = useMSC100100P01Store(state => state.opnn.isSameInput);
  const tableType = useMSC100100P01Store(state => state.opnn.tableType);
  const unsavedAlert = useMSC100100P01Store(state => state.confirm.unsavedAlert);

  const editOpnn = useMSC100100P01Store(state => state.api.editOpnn);
  const saveOpnn = useMSC100100P01Store(state => state.api.saveOpnn);
  const searchOpnn = useMSC100100P01Store(state => state.api.searchOpnn);
  const selectOpnnList = useMSC100100P01Store(state => state.api.selectOpnnList);

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
      const sqno = parseInt(event.target.value, 10);
      setCompleted(sqno);
      onAfterCompleteAsync(sqno);
    }
  };

  const handleSearch = async keyword => {
    const { resultData } = await searchOpnn(keyword, tableType);
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
    <LUXSmartComplete
      value={searchKeyword}
      onChange={handleChange}
      onSearch={handleSearch}
      onEnterKeyDown={forceSearch}
      dataInfo={dataInfo}
      hintText="소견 제목을 검색하세요."
      toolTipFloat="right"
      iconElement={<SearchIcon onClick={forceSearch} />}
    />
  );
}
