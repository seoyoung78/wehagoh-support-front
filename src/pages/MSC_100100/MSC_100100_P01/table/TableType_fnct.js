import { LUXTextArea } from "luna-rocket";
import useMSC100100P01Store from "../store";

/* 기능검사, 영상검사 */
export default function () {
  const inputState = useMSC100100P01Store(state => state.opnn.inputState);
  const handleFormData = useMSC100100P01Store(state => state.opnn.handleFormData);
  const selectedOpnnKey = useMSC100100P01Store(state => state.opnn.selectedOpnnKey);
  const disabled = selectedOpnnKey === "F" || selectedOpnnKey === "R";

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
              판독소견
            </th>
            <td className="cellft">
              <div className="inbx">
                <LUXTextArea
                  defaultValue={inputState.exmn_opnn_cnts}
                  onChange={(_, value) => handleFormData("exmn_opnn_cnts", value)}
                  hintText="결과를 입력하세요."
                  fullWidth
                  rows={15}
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
