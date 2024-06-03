import { useRef } from "react";
import { LUXButton, LUXCheckBox, LUXInputField, LUXTextArea } from "luna-rocket";
import useMSC100100P01Store from "../store";
import CustomStyledSmartPicker from "components/Common/CustomStyledSmartPicker";

/* 위내시경(gastroscope) */
export default function () {
  const inputState = useMSC100100P01Store(state => state.opnn.inputState);
  const handleFormData = useMSC100100P01Store(state => state.opnn.handleFormData);
  const handleFormObsrOpnnList = useMSC100100P01Store(state => state.opnn.handleFormObsrOpnnList);
  const handleAddObsrOpnnList = useMSC100100P01Store(state => state.opnn.handleAddObsrOpnnList);
  const handleMinusObsrOpnnList = useMSC100100P01Store(state => state.opnn.handleMinusObsrOpnnList);
  const disabled = useMSC100100P01Store(state => state.opnn.selectedOpnnKey) === "S";

  const ETC = "5";
  const etcDisabled = inputState?.advc_matr.findIndex(item => item === ETC) < 0 ?? true;

  const handleAdd = () => {
    handleAddObsrOpnnList();
  };

  const handleMinus = index => {
    handleMinusObsrOpnnList(index);
  };

  const { obsr_opnn_list, obsr_opnn_site_1, advc_matr_list } = useMSC100100P01Store(
    state => state.opnn.selectFieldCmcd.gssp,
  );

  const smartPickerRef = useRef({
    obsr_opnn: [],
  });
  const smartPickerSearchFieldRef = useRef({
    obsr_opnn: [],
  });

  const handleChangeSmartPicker = (index, id, data) => {
    if (Array.isArray(data) && data.length > 0) {
      handleFormObsrOpnnList(index, id, data[0].value);
    } else {
      handleFormObsrOpnnList(index, id, "");
    }
    smartPickerSearchFieldRef.current[id][index] = "";
  };

  const handleSearchSmartPicker = (index, id, list) => {
    if (!smartPickerSearchFieldRef.current[id][index]) {
      return Promise.resolve(list);
    }
    return Promise.resolve(list.filter(item => item.text.includes(smartPickerSearchFieldRef.current[id][index])));
  };

  const handleSearchFieldChange = (index, id, keyword) => {
    smartPickerSearchFieldRef.current[id][index] = keyword;
    smartPickerRef.current[id][index].search();
  };

  const handleRequestClose = (index, id) => {
    smartPickerSearchFieldRef.current[id][index] = "";
    smartPickerRef.current[id][index].clearPopOver();
  };

  return (
    <div className="LUX_basic_tbl opnnTable gssp">
      <table className="tblarea2 tblarea2_v2 tblarea2_v3">
        <colgroup>
          <col width="120px" />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <th scope="row" className="nfont celcnt">
              소견 제목
            </th>
            <td>
              <div className="inbx">{inputState.exmn_opnn_titl}</div>
            </td>
          </tr>
          {inputState.obsr_opnn_list.map((opnnListItem, index) => (
            <tr>
              {index === 0 && (
                <th scope="row" className="nfont celcnt" rowSpan={inputState.obsr_opnn_list.length}>
                  관찰소견
                </th>
              )}
              <td className="cellft">
                <div className="inbx">
                  <div className="tblConBox clearfix">
                    {obsr_opnn_site_1.map(site => (
                      <LUXCheckBox
                        checked={opnnListItem.obsr_opnn_site_1.some(
                          opnnListItemSite => site.value === opnnListItemSite,
                        )}
                        labelText={site.text}
                        onCheck={(_, value) => {
                          let nextSiteList = [];
                          if (value) {
                            nextSiteList = [...opnnListItem.obsr_opnn_site_1, site.value];
                          } else {
                            nextSiteList = [
                              ...opnnListItem.obsr_opnn_site_1.filter(
                                opnnListItemSite => opnnListItemSite !== site.value,
                              ),
                            ];
                          }
                          handleFormObsrOpnnList(index, "obsr_opnn_site_1", nextSiteList);
                        }}
                        disabled={disabled}
                        style={{ marginRight: "8px" }}
                      />
                    ))}
                  </div>
                  <div className="editalbe_box tblConBox">
                    <LUXTextArea
                      defaultValue={opnnListItem.obsr_opnn_cnts}
                      hintText="결과를 입력하세요."
                      onChange={(_, value) => handleFormObsrOpnnList(index, "obsr_opnn_cnts", value)}
                      fullWidth
                      rows={3}
                      disabled={disabled}
                      resize={false}
                      rootStyle={{ minHeight: "80px", width: "100%" }}
                      style={{ minHeight: "80px" }}
                    />
                  </div>
                  <div className="tblConBox tblConBox--between smart_picker_searchDefault inbx_noPaddingLeft inbx_fullWidth">
                    <CustomStyledSmartPicker
                      ref={el => {
                        if (el) {
                          smartPickerRef.current.obsr_opnn[index] = el;
                          smartPickerRef.current.obsr_opnn[index].handleCancel = () => {
                            smartPickerSearchFieldRef.current.obsr_opnn[index] = "";
                            smartPickerRef.current.obsr_opnn[index].clearPopOver();
                          };
                        }
                      }}
                      value={obsr_opnn_list.find(item => item.value === opnnListItem.obsr_opnn)?.text ?? ""}
                      onChange={(_, data) => handleChangeSmartPicker(index, "obsr_opnn", data)}
                      onSearch={() => handleSearchSmartPicker(index, "obsr_opnn", obsr_opnn_list)}
                      onSearchFieldChange={(_, keyword) => handleSearchFieldChange(index, "obsr_opnn", keyword)}
                      onRequestClose={() => handleRequestClose(index, "obsr_opnn")}
                      dataInfo={[
                        { name: "text", width: 100, isKey: true },
                        { name: "value", width: 0 },
                      ]}
                      style={{ width: "520px" }}
                      disabled={disabled}
                    />
                    {index === 0 ? (
                      <LUXButton
                        className="LUX_basic_btn Image basic"
                        tpye="icon"
                        icon={
                          <span
                            className="sp_dialogimg"
                            style={{ width: "14px", height: "14px", backgroundPosition: "-125px -493px" }}
                          >
                            추가
                          </span>
                        }
                        onClick={handleAdd}
                        style={{ padding: "0" }}
                        disabled={disabled}
                      />
                    ) : (
                      <LUXButton
                        className="LUX_basic_btn Image basic"
                        tpye="icon"
                        icon={
                          <span
                            className="sp_dialogimg"
                            style={{ width: "14px", height: "14px", backgroundPosition: "-144px -493px" }}
                          >
                            추가
                          </span>
                        }
                        onClick={() => handleMinus(index)}
                        style={{ padding: "0" }}
                        disabled={disabled}
                      />
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
          <tr>
            <th scope="row" className="nfont celcnt">
              암검진 권고사항
            </th>
            <td className="cellft">
              <div className="inbx">
                <div className="editalbe_box">
                  <LUXTextArea
                    defaultValue={inputState.cncr_mdex_advc_matr}
                    hintText="결과를 입력하세요."
                    onChange={(_, value) => handleFormData("cncr_mdex_advc_matr", value)}
                    fullWidth
                    rows={3}
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
            <th scope="row" className="nfont celcnt">
              권고사항
            </th>
            <td className="cellft">
              <div className="inbx">
                <div className="tblConBox clearfix">
                  {advc_matr_list.map(item => {
                    if (item.value !== ETC) {
                      return (
                        <LUXCheckBox
                          checked={inputState.advc_matr.some(el => el === item.value)}
                          labelText={item.text}
                          onCheck={(_, value) => {
                            let newAdvcMatr = [];
                            if (value) {
                              newAdvcMatr = [...inputState.advc_matr, item.value];
                            } else {
                              newAdvcMatr = inputState.advc_matr.filter(advcMatrItem => advcMatrItem !== item.value);
                            }
                            handleFormData("advc_matr", newAdvcMatr);
                          }}
                          disabled={disabled}
                          style={{ marginRight: "8px" }}
                        />
                      );
                    }
                    /* 기타 */
                    return (
                      <LUXCheckBox
                        checked={inputState.advc_matr.some(el => el === item.value)}
                        labelText={item.text}
                        onCheck={(_, value) => {
                          let newAdvcMatr = [];
                          if (value) {
                            newAdvcMatr = [...inputState.advc_matr, item.value];
                          } else {
                            newAdvcMatr = inputState.advc_matr.filter(advcMatrItem => advcMatrItem !== item.value);
                          }
                          handleFormData("advc_matr", newAdvcMatr);
                          if (!value) {
                            handleFormData("advc_matr_cnts", "");
                          }
                        }}
                        disabled={disabled}
                        style={{ marginRight: "8px" }}
                      />
                    );
                  })}
                  <LUXInputField
                    disabled={etcDisabled || disabled}
                    value={inputState.advc_matr_cnts}
                    onChange={(_, value) => handleFormData("advc_matr_cnts", value)}
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
