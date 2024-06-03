import { useState } from "react";
import { LUXButton, LUXSelectField } from "luna-rocket";
import { lodash as _ } from "common-util/utils";
import MSC100100P01 from "pages/MSC_100100/MSC_100100_P01";
import useMSC100100Store from "./store/index";

export default function () {
  const inputState = useMSC100100Store(state => state.opnn.inputState);
  const prevOpnn = useMSC100100Store(state => state.opnn.prevOpnn);
  const selectedOpnnKey = useMSC100100Store(state => state.opnn.selectedOpnnKey);
  const isEditMode = useMSC100100Store(state => state.opnn.isEditMode);

  const isSameInput = _.isEqual(inputState, prevOpnn);
  const clickNewButton = useMSC100100Store(state => state.opnn.clickNewButton);
  const changeSelectItem = useMSC100100Store(state => state.opnn.changeSelectItem);

  const unsavedAlert = useMSC100100Store(state => state.confirm.unsavedAlert);
  const deleteQuestion = useMSC100100Store(state => state.confirm.deleteQuestion);
  const saveQuestion = useMSC100100Store(state => state.confirm.saveQuestion);
  const cancelQuestion = useMSC100100Store(state => state.confirm.cancelQuestion);

  const deleteOpnn = useMSC100100Store(state => state.api.deleteOpnn);
  const editOpnn = useMSC100100Store(state => state.api.editOpnn);
  const saveOpnn = useMSC100100Store(state => state.api.saveOpnn);
  const selectOpnnList = useMSC100100Store(state => state.api.selectOpnnList);

  const validAll = useMSC100100Store(state => state.valid.validAll);

  /* button disabled */
  const newButtonDisabled = selectedOpnnKey === "exmnOpnn" || selectedOpnnKey === "E";
  const cancelButtonDisabled = selectedOpnnKey === "" || isSameInput;
  const deleteButtonDisabled = ["", "exmnOpnn", "L", "F", "R", "S", "C", "P"].includes(selectedOpnnKey);
  /* 선택 안 한 상태에서 신규 버튼 클릭 후 저장하려면 selectedOpnnKey === "" 조건을 제거해야 한다. */
  const saveButtonDisabled = selectedOpnnKey === "exmnOpnn" || selectedOpnnKey === "E" || isSameInput || !validAll();

  const handleNewButton = async () => {
    if (!isSameInput && (await unsavedAlert())) {
      const exmn_opnn_sqno = isEditMode ? await editOpnn() : await saveOpnn();
      selectOpnnList();
      changeSelectItem(exmn_opnn_sqno);
    }
    clickNewButton();
  };

  const handleCancel = async () => {
    if (await cancelQuestion()) {
      changeSelectItem(selectedOpnnKey);
    }
  };

  const handleDelete = async () => {
    if (await deleteQuestion()) {
      deleteOpnn();
    }
  };

  const handleSave = async () => {
    if (await saveQuestion()) {
      const exmn_opnn_sqno = isEditMode ? await editOpnn() : await saveOpnn();
      changeSelectItem(exmn_opnn_sqno);
    }
  };

  return (
    <div className="sec_footer">
      <div className="option_box">
        <LUXButton label="신규" disabled={newButtonDisabled} onClick={handleNewButton} blue={!newButtonDisabled} />
        <LUXButton label="취소" disabled={cancelButtonDisabled} onClick={handleCancel} />
        <LUXButton label="삭제" disabled={deleteButtonDisabled} onClick={handleDelete} />
        <LUXButton label="저장" disabled={saveButtonDisabled} onClick={handleSave} blue={!saveButtonDisabled} />
        {/* <PopupTest /> */}
      </div>
    </div>
  );
}

// const PopupTest = function () {
//   const selectFieldData = [
//     { text: "진단검사", value: "L" },
//     { text: "기능검사", value: "F" },
//     { text: "영상검사", value: "R" },
//     { text: "위내시경", value: "S" },
//     { text: "대장내시경", value: "C" },
//     { text: "물리치료", value: "P" },
//   ];
//   const [open, setOpen] = useState(false);
//   const [opnnType, setOpnnType] = useState("L");

//   return (
//     <div className="삭제예정" style={{ display: "flex" }}>
//       <LUXSelectField
//         checkObjectList
//         defaultData={selectFieldData.find(item => item.value === opnnType).text}
//         selectFieldData={selectFieldData}
//         handleChoiceData={value => setOpnnType(value)}
//       />
//       <MSC100100P01 opnnType={opnnType} dialogOpen={open} onCopy={console.log} onClose={() => setOpen(false)} />
//       <LUXButton label="팝업" onClick={() => setOpen(true)} />
//     </div>
//   );
// };
