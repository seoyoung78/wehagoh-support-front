import { LUXTextArea } from "luna-rocket";
import { useValid } from "../../hook/useValid";
import useMSC100100P01Store from "../store";

/* 물리치료 */
export default function () {
  const inputState = useMSC100100P01Store(state => state.opnn.inputState);
  const handleFormData = useMSC100100P01Store(state => state.opnn.handleFormData);
  const disabled = useMSC100100P01Store(state => state.opnn.selectedOpnnKey) === "P";

  /* valid refs */
  const [titlRef, initTitl] = useValid("exmn_opnn_titl");

  return (
    <div className="LUX_basic_tbl opnnTable">
      <table className="tblarea2 tblarea2_v2">
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
              소견 제목
            </th>
            <td className="cellft">
              <div className="inbx">{inputState.exmn_opnn_titl}</div>
            </td>
          </tr>
          <tr>
            <th scope="row" className="nfont celcnt">
              물리치료 소견
            </th>
            <td className="cellft">
              <div className="inbx">
                <LUXTextArea
                  defaultValue={inputState.exmn_opnn_cnts}
                  hintText="결과를 입력하세요."
                  fullWidth
                  rows={15}
                  onChange={(_, value) => handleFormData("exmn_opnn_cnts", value)}
                  disabled={disabled}
                  resize={false}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
