//utils
import withPortal from "hoc/withPortal";

// common-ui-components
import { LUXButton, LUXDialog, LUXTextArea } from "luna-rocket";

// css

// imgs

/**
 * @name 결과(장문) 다이얼로그
 * @author 강현구A
 */
export default function TxtRsltDialog({
  title = "",
  open = false,
  data = "",
  handleTxtRsltDialogClose = () => undefined,
}) {
  return withPortal(
    <LUXDialog
      onRequestClose
      handleOnEscClose={handleTxtRsltDialogClose}
      handleOnRequestClose={handleTxtRsltDialogClose}
      dialogOpen={open}
    >
      <div className="dialog_content ssm">
        <div className="dialog_data">
          <div className="dialog_data_tit">
            <h1 className="txtcnt">{title}</h1>
            <button type="button" className="LUX_basic_btn btn_clr" onClick={handleTxtRsltDialogClose}>
              <span className="sp_lux">닫기</span>
            </button>
          </div>
          <div className="dialog_data_area noline mgt10">
            <div className="dialog_data_section">
              <LUXTextArea disabled defaultValue={data} resize={false} fullWidth style={{ height: "290px" }} />
            </div>
          </div>
        </div>
        <div className="dialog_btnbx">
          <LUXButton type="confirm" label="닫기" onClick={handleTxtRsltDialogClose} />
        </div>
      </div>
    </LUXDialog>,
    "dialog",
  );
}
