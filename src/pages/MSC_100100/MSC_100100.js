import React, { useEffect } from "react";
import Tree from "./MSC_100100_Tree";
import Editor from "./MSC_100100_Editor";
import Feedback from "./MSC_100100_Feedback";
import ButtonGroup from "./MSC_100100_ButtonGroup";
import "assets/style/MSC_100100.scss";
import useMSC100100Store from "./store";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";

/**
 * @name 페이지 검사소견관리
 * @author 담당자 이름 김진한A
 */
function MSC_100100() {
  const getSelectFieldCmcd = useMSC100100Store(state => state.api.getSelectFieldCmcd);

  useEffect(() => {
    getSelectFieldCmcd({ initialFetch: true });
  }, [getSelectFieldCmcd]);

  return (
    <div className="MSC_100100 dp_full">
      <div className="align_box">
        <div className="align_top">
          <div className="left_box">
            <h2 className="menu_title">검사 소견관리</h2>
          </div>
          <div className="right_box"></div>
        </div>
        <div className="align_split">
          <div className="align_left">
            <Tree />
          </div>
          <div className="align_right">
            <div className="sec_wrap full_size add_footer">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">검사 소견 편집</h3>
                  </div>
                </div>
              </div>
              <Editor />
              <ButtonGroup />
            </div>
          </div>
        </div>
      </div>
      <Feedback />
    </div>
  );
}

export default WithWrapper(MSC_100100);
