import { useRef } from "react";
import { LUXButton, LUXCheckBox, LUXInputField, LUXTextArea } from "luna-rocket";
import CustomStyledSmartPicker from "components/Common/CustomStyledSmartPicker";
import useMSC100100Store from "../store";
import { useValid } from "../hook/useValid";
import { initGsspOpnnDetl } from "../store/opnnSlice";

/* 위내시경(gastroscope) */
export default function () {
  let inputState = useMSC100100Store(state => state.opnn.inputState);
  const handleFormData = useMSC100100Store(state => state.opnn.handleFormData);
  const handleFormObsrOpnnList = useMSC100100Store(state => state.opnn.handleFormObsrOpnnList);
  const handleAddObsrOpnnList = useMSC100100Store(state => state.opnn.handleAddObsrOpnnList);
  const handleMinusObsrOpnnList = useMSC100100Store(state => state.opnn.handleMinusObsrOpnnList);
  const { obsr_opnn_list, obsr_opnn_site_1, advc_matr_list } = useMSC100100Store(
    state => state.opnn.selectFieldCmcd.gssp,
  );
  const maxLengthWarn = useMSC100100Store(state => state.snackbar.maxLengthWarn);

  const [titlRef, initTitl] = useValid("exmn_opnn_titl");
  // const [obsrOpnnRef, initObsrOpnn] = useValid("obsr_opnn_list");

  if (!inputState || !inputState.advc_matr || !inputState.obsr_opnn_list) {
    inputState = initGsspOpnnDetl;
  }

  const ETC = "5";
  const etcDisabled = inputState.advc_matr.findIndex(item => item === ETC) < 0 ?? true;

  const handleAdd = () => {
    handleAddObsrOpnnList();
  };

  const handleMinus = index => {
    handleMinusObsrOpnnList(index);
  };

  // const obsrOpnnNullCount = inputState.obsr_opnn_list.reduce((acc, el) => acc + (el.obsr_opnn === null), 0);
  const handleChangeTitle = (_, value) => {
    if (value.length > 100) {
      maxLengthWarn(100);
      return;
    }
    handleFormData("exmn_opnn_titl", value);
  };

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
    <div className="LUX_basic_tbl">
      <table className="tblarea2 tblarea2_v2 tblarea2_v3">
        <colgroup>
          <col width="120px" />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <th scope="row" className="nfont celcnt">
              소견 제목 <span className="sp_lux red_bullet" />
            </th>
            <td className="cellft">
              <div className="inbx">
                <LUXInputField
                  value={inputState.exmn_opnn_titl}
                  onChange={handleChangeTitle}
                  hintText="소견 제목을 입력하세요."
                  fullWidth
                  ref={initTitl}
                />
              </div>
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
                      rootStyle={{ minHeight: "80px", width: "100%" }}
                      style={{ minHeight: "80px" }}
                      resize={false}
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
                        style={{ marginRight: "8px" }}
                      />
                    );
                  })}
                  <LUXInputField
                    disabled={etcDisabled}
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
