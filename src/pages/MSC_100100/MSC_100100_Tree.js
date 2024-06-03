import { useEffect } from "react";
import { OBTTreeView } from "luna-orbit";
import Search from "./MSC_100100_Search";

import useMSC100100Store from "./store";

export default function () {
  const opnnTree = useMSC100100Store(state => state.opnn.opnnTree);
  const selectedOpnnKey = useMSC100100Store(state => state.opnn.selectedOpnnKey);
  const isEditMode = useMSC100100Store(state => state.opnn.isEditMode);
  const changeSelectItem = useMSC100100Store(state => state.opnn.changeSelectItem);
  const isSameInput = useMSC100100Store(state => state.opnn.isSameInput);
  const unsavedAlert = useMSC100100Store(state => state.confirm.unsavedAlert);
  const selectOpnnList = useMSC100100Store(state => state.api.selectOpnnList);
  const editOpnn = useMSC100100Store(state => state.api.editOpnn);
  const saveOpnn = useMSC100100Store(state => state.api.saveOpnn);
  const validAll = useMSC100100Store(state => state.valid.validAll);
  const noTitl = useMSC100100Store(state => state.snackbar.noTitle);

  const handleAfterSelectChange = async ({ item }) => {
    if (!isSameInput()) {
      if (await unsavedAlert()) {
        if (validAll()) {
          isEditMode ? await editOpnn() : await saveOpnn();
          selectOpnnList();
        } else {
          noTitl();
          return;
        }
      }
    }
    changeSelectItem(item.key);
  };

  /* initial fetch */
  useEffect(() => {
    selectOpnnList({ initialFetch: true });
  }, [selectOpnnList]);

  return (
    <>
      <div className="sec_wrap">
        <div className="sec_header">
          <div className="left_box">
            <div className="sec_title">
              <svg viewBox="0 0 24 24" className="ico_svg">
                <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
              </svg>
              <h3 className="title">소견목록 조회</h3>
            </div>
          </div>
        </div>
        <div className="sec_content">
          <Search />
        </div>
      </div>
      <div className="sec_wrap full_size">
        <div className="sec_content" style={{ height: "643px" }}>
          <OBTTreeView
            selectedItem={selectedOpnnKey}
            list={opnnTree}
            width="100%"
            height="100%"
            onAfterSelectChange={handleAfterSelectChange}
          />
        </div>
      </div>
    </>
  );
}
