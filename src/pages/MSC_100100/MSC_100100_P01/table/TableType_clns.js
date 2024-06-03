import { useRef } from "react";
import { LUXRadioButton, LUXRadioButtonGroup, LUXTextArea } from "luna-rocket";
import CustomStyledSmartPicker from "components/Common/CustomStyledSmartPicker";
import useMSC100100P01Store from "../store";

/* 대장내시경(colonoscopy) */
export default function () {
  const inputState = useMSC100100P01Store(state => state.opnn.inputState);
  const handleFormData = useMSC100100P01Store(state => state.opnn.handleFormData);
  const disabled = useMSC100100P01Store(state => state.opnn.selectedOpnnKey) === "C";
  const { etnl_obsr_opnn_list, dre_opnn_list, obsr_opnn_site_2, rslt_opnn_list } = useMSC100100P01Store(
    state => state.opnn.selectFieldCmcd.clns,
  );

  const smartPickerRef = useRef({
    etnl_obsr_opnn: "",
    dre_opnn: "",
    rslt_opnn_1: "",
    rslt_opnn_2: "",
    rslt_opnn_3: "",
  });
  const smartPickerSearchFieldRef = useRef({
    etnl_obsr_opnn: "",
    dre_opnn: "",
    rslt_opnn_1: "",
    rslt_opnn_2: "",
    rslt_opnn_3: "",
  });

  const handleChangeSmartPicker = (id, data) => {
    if (Array.isArray(data) && data.length > 0) {
      handleFormData(id, data[0].value);
    } else {
      handleFormData(id, "");
    }
    smartPickerSearchFieldRef.current[id] = "";
  };

  const handleSearchSmartPicker = (id, list) => {
    if (smartPickerSearchFieldRef.current[id] === "") {
      return Promise.resolve(list);
    }
    return Promise.resolve(list.filter(item => item.text.includes(smartPickerSearchFieldRef.current[id])));
  };

  const handleSearchFieldChange = (id, keyword) => {
    smartPickerSearchFieldRef.current[id] = keyword;
    smartPickerRef.current[id].search();
  };

  const handleRequestClose = id => {
    smartPickerSearchFieldRef.current[id] = "";
    smartPickerRef.current[id].clearPopOver();
  };

  return (
    <div className="LUX_basic_tbl opnnTable">
      <table className="tblarea2 tblarea2_v2 tblarea2_v3">
        <caption>
          <span className="blind" />
        </caption>
        <colgroup>
          <col width="60px" />
          <col width="60px" />
          <col />
          <col width="120px" />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <th scope="row" className="nfont celcnt" colSpan="2">
              소견 제목
            </th>
            <td className="cellft" colSpan="3">
              <div className="inbx">{inputState.exmn_opnn_titl}</div>
            </td>
          </tr>
          <tr>
            <th scope="row" className="nfont celcnt" colSpan="2">
              외부관찰소견
            </th>
            <td className="cellft">
              <CustomStyledSmartPicker
                ref={el => {
                  if (el) {
                    smartPickerRef.current.etnl_obsr_opnn = el;
                    smartPickerRef.current.etnl_obsr_opnn.handleCancel = () => {
                      smartPickerSearchFieldRef.current.etnl_obsr_opnn = "";
                      smartPickerRef.current.etnl_obsr_opnn.clearPopOver();
                    };
                  }
                }}
                value={etnl_obsr_opnn_list.find(item => item.value === inputState.etnl_obsr_opnn)?.text ?? ""}
                onChange={(_, data) => handleChangeSmartPicker("etnl_obsr_opnn", data)}
                onSearch={() => handleSearchSmartPicker("etnl_obsr_opnn", etnl_obsr_opnn_list)}
                onSearchFieldChange={(_, keyword) => handleSearchFieldChange("etnl_obsr_opnn", keyword)}
                onRequestClose={() => handleRequestClose("etnl_obsr_opnn")}
                dataInfo={[
                  { name: "text", width: 100, isKey: true },
                  { name: "value", width: 0 },
                ]}
                style={{ width: "100%" }}
                disabled={disabled}
              />
            </td>
            <th scope="row" className="nfont celcnt">
              직장수지소견
            </th>
            <td className="cellft">
              <CustomStyledSmartPicker
                ref={el => {
                  if (el) {
                    smartPickerRef.current.dre_opnn = el;
                    smartPickerRef.current.dre_opnn.handleCancel = () => {
                      smartPickerSearchFieldRef.current.dre_opnn = "";
                      smartPickerRef.current.dre_opnn.clearPopOver();
                    };
                  }
                }}
                value={dre_opnn_list.find(item => item.value === inputState.dre_opnn)?.text ?? ""}
                onChange={(_, data) => handleChangeSmartPicker("dre_opnn", data)}
                onSearch={() => handleSearchSmartPicker("dre_opnn", dre_opnn_list)}
                onSearchFieldChange={(_, keyword) => handleSearchFieldChange("dre_opnn", keyword)}
                onRequestClose={() => handleRequestClose("dre_opnn")}
                dataInfo={[
                  { name: "text", width: 100, isKey: true },
                  { name: "value", width: 0 },
                ]}
                style={{ width: "100%" }}
                disabled={disabled}
              />
            </td>
          </tr>
          <tr>
            <th scope="row" className="nfont celcnt" colSpan="2">
              대장내시경 관찰소견
            </th>
            <td className="cellft" colSpan="3">
              <div className="inbx">
                <div className="tblConBox clearfix">
                  <LUXRadioButtonGroup
                    defaultSelected={inputState.obsr_opnn_site_2 ?? null}
                    name="obsr_opnn"
                    onChange={(_, value) => handleFormData("obsr_opnn_site_2", value)}
                  >
                    {obsr_opnn_site_2.map(item => (
                      <LUXRadioButton
                        value={item.value}
                        labelText={item.text}
                        style={{ marginRight: "8px" }}
                        disabled={disabled}
                      />
                    ))}
                  </LUXRadioButtonGroup>
                </div>
                <div className="editalbe_box tblConBox">
                  <LUXTextArea
                    defaultValue={inputState.obsr_opnn_cnts}
                    hintText="결과를 입력하세요."
                    fullWidth
                    rows={3}
                    onChange={(_, value) => handleFormData("obsr_opnn_cnts", value)}
                    rootStyle={{ minHeight: "80px", width: "100%" }}
                    style={{ minHeight: "80px" }}
                    disabled={disabled}
                    resize={false}
                  />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row" className="nfont celcnt" colSpan="2">
              암검진 권고사항
            </th>
            <td className="cellft" colSpan="3">
              <div className="inbx">
                <div className="editalbe_box">
                  <LUXTextArea
                    defaultValue={inputState.cncr_mdex_advc_matr}
                    hintText="결과를 입력하세요."
                    fullWidth
                    rows={3}
                    onChange={(_, value) => handleFormData("cncr_mdex_advc_matr", value)}
                    disabled={disabled}
                    rootStyle={{ minHeight: "80px", width: "100%" }}
                    style={{ minHeight: "80px" }}
                    resize={false}
                  />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row" className="nfont celcnt" rowSpan="3">
              진단결과
            </th>
            <th scope="row" className="nfont celcnt">
              결과소견1
            </th>
            <td colSpan="3" className="cellft">
              <CustomStyledSmartPicker
                ref={el => {
                  if (el) {
                    smartPickerRef.current.rslt_opnn_1 = el;
                    smartPickerRef.current.rslt_opnn_1.handleCancel = () => {
                      smartPickerSearchFieldRef.current.rslt_opnn_1 = "";
                      smartPickerRef.current.rslt_opnn_1.clearPopOver();
                    };
                  }
                }}
                value={rslt_opnn_list.find(item => item.value === inputState.rslt_opnn_1)?.text ?? ""}
                onChange={(_, data) => handleChangeSmartPicker("rslt_opnn_1", data)}
                onSearch={() => handleSearchSmartPicker("rslt_opnn_1", rslt_opnn_list)}
                onSearchFieldChange={(_, keyword) => handleSearchFieldChange("rslt_opnn_1", keyword)}
                onRequestClose={() => handleRequestClose("rslt_opnn_1")}
                dataInfo={[
                  { name: "text", width: 100, isKey: true },
                  { name: "value", width: 0 },
                ]}
                style={{ width: "235px" }}
                disabled={disabled}
              />
            </td>
          </tr>
          <tr>
            <th scope="row" className="nfont celcnt">
              결과소견2
            </th>
            <td colSpan="3" className="cellft smart_picker_searchDefault">
              <CustomStyledSmartPicker
                ref={el => {
                  if (el) {
                    smartPickerRef.current.rslt_opnn_2 = el;
                    smartPickerRef.current.rslt_opnn_2.handleCancel = () => {
                      smartPickerSearchFieldRef.current.rslt_opnn_2 = "";
                      smartPickerRef.current.rslt_opnn_2.clearPopOver();
                    };
                  }
                }}
                value={rslt_opnn_list.find(item => item.value === inputState.rslt_opnn_2)?.text ?? ""}
                onChange={(_, data) => handleChangeSmartPicker("rslt_opnn_2", data)}
                onSearch={() => handleSearchSmartPicker("rslt_opnn_2", rslt_opnn_list)}
                onSearchFieldChange={(_, keyword) => handleSearchFieldChange("rslt_opnn_2", keyword)}
                onRequestClose={() => handleRequestClose("rslt_opnn_2")}
                dataInfo={[
                  { name: "text", width: 100, isKey: true },
                  { name: "value", width: 0 },
                ]}
                disabled={disabled}
                style={{ width: "235px" }}
              />
            </td>
          </tr>
          <tr>
            <th scope="row" className="nfont celcnt">
              결과소견3
            </th>
            <td colSpan="3" className="cellft smart_picker_searchDefault">
              <CustomStyledSmartPicker
                ref={el => {
                  if (el) {
                    smartPickerRef.current.rslt_opnn_3 = el;
                    smartPickerRef.current.rslt_opnn_3.handleCancel = () => {
                      smartPickerSearchFieldRef.current.rslt_opnn_3 = "";
                      smartPickerRef.current.rslt_opnn_3.clearPopOver();
                    };
                  }
                }}
                value={rslt_opnn_list.find(item => item.value === inputState.rslt_opnn_3)?.text ?? ""}
                onChange={(_, data) => handleChangeSmartPicker("rslt_opnn_3", data)}
                onSearch={() => handleSearchSmartPicker("rslt_opnn_3", rslt_opnn_list)}
                onSearchFieldChange={(_, keyword) => handleSearchFieldChange("rslt_opnn_3", keyword)}
                onRequestClose={() => handleRequestClose("rslt_opnn_3")}
                dataInfo={[
                  { name: "text", width: 100, isKey: true },
                  { name: "value", width: 0 },
                ]}
                disabled={disabled}
                style={{ width: "235px" }}
              />
            </td>
          </tr>
          <tr>
            <th scope="row" className="nfont celcnt" colSpan="2">
              권고사항
            </th>
            <td className="cellft" colSpan="3">
              <div className="inbx">
                <div className="editalbe_box tblConBox">
                  <LUXTextArea
                    defaultValue={inputState.advc_matr_cnts}
                    rows={5}
                    fullWidth
                    onChange={(_, value) => handleFormData("advc_matr_cnts", value)}
                    rootStyle={{ minHeight: "80px", width: "100%" }}
                    style={{ minHeight: "80px" }}
                    resize={false}
                    disabled={disabled}
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
