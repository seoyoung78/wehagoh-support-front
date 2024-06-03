import withPortal from "hoc/withPortal";
import { LUXButton, LUXDialog, LUXTextArea } from "luna-rocket";

//utils
import PropTypes from "prop-types";

/**
 * @name 페이지 메모 팝업(조회용)
 * @author 담당자 강현구A
 */
export default function MemoDialog({ title, open, data, handleMemoDialogClose }) {
  return withPortal(
    <LUXDialog
      onRequestClose
      handleOnEscClose={handleMemoDialogClose}
      handleOnRequestClose={handleMemoDialogClose}
      dialogOpen={open}
    >
      <div className="dialog_content ssm">
        <div className="dialog_data">
          <div className="dialog_data_tit">
            <h1 className="txtcnt">{title}</h1>
            <button type="button" className="LUX_basic_btn btn_clr" onClick={handleMemoDialogClose}>
              <span className="sp_lux">닫기</span>
            </button>
          </div>
          <div className="dialog_data_area noline mgt10">
            <div className="dialog_data_section">
              <LUXTextArea defaultValue={data} disabled resize={false} fullWidth style={{ height: "290px" }} />
            </div>
          </div>
          {/* 내부 스크롤 생성 */}
        </div>
        <div className="dialog_btnbx">
          <LUXButton type="confirm" label="닫기" onClick={handleMemoDialogClose} />
        </div>
      </div>
    </LUXDialog>,
    "dialog",
  );
}
MemoDialog.propTypes = {
  title: PropTypes.string,
  open: PropTypes.bool,
  data: PropTypes.string,
  handleMemoDialogClose: PropTypes.func.isRequired,
};
MemoDialog.defaultProps = {
  title: "",
  open: false,
  data: "",
};
