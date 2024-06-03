//utils
import withPortal from "hoc/withPortal";

// common-ui-components
import { LUXButton, LUXDialog, LUXTextArea } from "luna-rocket";
import { useEffect, useState } from "react";
import { downloadApi } from "services/apis/formApi";
import Message from "./Message";

// css

// imgs

/**
 * @name 결과(소견) 다이얼로그
 * @author 강현구A
 */
export default function OpnnDialog({
  title = "",
  open = false,
  data = "",
  handleOpnnDialogClose = () => undefined,
  imgs = [],
  setSnackbar,
}) {
  const [imgList, setImgList] = useState([]);

  const releaseImg = () => {
    for (const img of imgList) {
      //기존 이미지 해제.
      URL.revokeObjectURL(img);
    }
  };

  useEffect(() => {
    if (open) {
      const promList = [];
      for (const file of imgs) {
        promList.push(downloadApi(file.file_path_id));
      }
      Promise.all(promList)
        .then(resultList => {
          releaseImg(); //등록전 기존 이미지 해제.
          setImgList(resultList);
        })
        .catch(() => {
          setSnackbar({
            open: true,
            message: Message.networkFail,
            type: "warning",
          });
        });
    } else {
      releaseImg(); //닫을때 해제.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => releaseImg(), []); //종료시 해제

  return withPortal(
    <LUXDialog
      onRequestClose
      handleOnEscClose={handleOpnnDialogClose}
      handleOnRequestClose={handleOpnnDialogClose}
      dialogOpen={open}
    >
      <div className="dialog_content md opnndialog">
        <div className="dialog_data">
          <div className="dialog_data_tit">
            <h1 className="txtcnt">{title}</h1>
            <button type="button" className="LUX_basic_btn btn_clr" onClick={handleOpnnDialogClose}>
              <span className="sp_lux">닫기</span>
            </button>
          </div>
          <div className="dialog_data_area noline mgt10">
            <div className="dialog_data_section opnndialog-content">
              <div className="opnndialog-content-imgswrapper">
                {imgList.length > 0 && (
                  <div className="opnndialog-content-imgswrapper-imgs">
                    {imgList.map((file, idx) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <img key={idx} src={file} alt="img" />
                    ))}
                  </div>
                )}
              </div>
              <LUXTextArea disabled defaultValue={data} resize={false} fullWidth style={{ height: "100%" }} />
            </div>
          </div>
        </div>
        <div className="dialog_btnbx">
          <LUXButton type="confirm" label="닫기" onClick={handleOpnnDialogClose} />
        </div>
      </div>
    </LUXDialog>,
    "dialog",
  );
}
