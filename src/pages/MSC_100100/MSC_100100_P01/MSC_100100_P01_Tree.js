import { useEffect } from "react";
import { OBTTreeView } from "luna-orbit";
import Search from "./MSC_100100_P01_Search";

import useMSC100100P01Store from "./store";

export default function () {
  const opnnTree = useMSC100100P01Store(state => state.opnn.opnnTree);
  const selectedOpnnKey = useMSC100100P01Store(state => state.opnn.selectedOpnnKey);
  const tableType = useMSC100100P01Store(state => state.opnn.tableType);

  // action
  const changeSelectItem = useMSC100100P01Store(state => state.opnn.changeSelectItem);
  const isSameInput = useMSC100100P01Store(state => state.opnn.isSameInput);
  const popupChangedAlert = useMSC100100P01Store(state => state.confirm.popupChangedAlert);
  const selectOpnnList = useMSC100100P01Store(state => state.api.selectOpnnList);

  const handleAfterSelectChange = async ({ item }) => {
    if (!isSameInput() && !(await popupChangedAlert())) return;
    changeSelectItem(item.key);
  };

  /* initial fetch */
  useEffect(() => {
    selectOpnnList();
  }, [selectOpnnList]);

  return (
    <div className="dialog_section">
      <p className="section_title">• 소견목록 조회</p>
      <div className="search_box">
        <Search />
      </div>
      <div className="tree_box">
        {opnnTree.filter(item => item.parentKey === tableType).length > 0 ? (
          <OBTTreeView
            selectedItem={selectedOpnnKey}
            list={opnnTree.filter(item => item.parentKey === tableType)}
            width="100%"
            height="100%"
            onAfterSelectChange={handleAfterSelectChange}
          />
        ) : (
          <div className="empty_box">
            <div className="inbx">
              <div className="empty_img type2" />
              <div className="empty_msg">데이터가 존재하지 않습니다.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
