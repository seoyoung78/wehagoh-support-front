import { LUXInputField, LUXTextArea } from "luna-rocket";
import useMSC100100Store from "../store";
import { useValid } from "../hook/useValid";

/* 물리치료 */
export default function () {
  const inputState = useMSC100100Store(state => state.opnn.inputState);
  const handleFormData = useMSC100100Store(state => state.opnn.handleFormData);
  const maxLengthWarn = useMSC100100Store(state => state.snackbar.maxLengthWarn);

  /* valid refs */
  const [titlRef, initTitl] = useValid("exmn_opnn_titl");

  const handleChangeTitle = (_, value) => {
    if (value.length > 100) {
      maxLengthWarn(100);
      return;
    }
    handleFormData("exmn_opnn_titl", value);
  };

  return (
    <div className="LUX_basic_tbl">
      <table className="tblarea2 tblarea2_v2 tblarea2_v3">
        <caption>
          <span className="blind" />
        </caption>
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
                  hintText="소견 제목을 입력하세요."
                  fullWidth
                  onChange={handleChangeTitle}
                  ref={initTitl}
                />
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row" className="nfont celcnt">
              물리치료 소견
            </th>
            <td className="cellft">
              <div className="inbx">
                <div className="editalbe_box">
                  <LUXTextArea
                    defaultValue={inputState.exmn_opnn_cnts}
                    hintText="결과를 입력하세요."
                    fullWidth
                    rows={15}
                    onChange={(_, value) => handleFormData("exmn_opnn_cnts", value)}
                    // ref={initCnts}
                    rootStyle={{ minHeight: "80px", width: "100%" }}
                    style={{ minHeight: "80px" }}
                    resize={false}
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
