import React from "react";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";
import SearchBar from "./MSC_010100_SearchBar";
import ExmState from "./MSC_010100_ExmState";
import Dialog from "./MSC_010100_Dialog";
import "assets/style/MSC_010100.scss";

/**
 * @name 진료지원Main
 * @author 김진한A
 */
function MSC_010100() {
  return (
    <div className="MSC_010100 dp_full">
      <div className="align_box">
        <div className="align_top patient_info_wrap">
          <div className="left_box">
            <div className="menu_title">진료지원 Main</div>
          </div>
          <div className="right_box">
            <SearchBar />
          </div>
        </div>
        <div className="align_split">
          <div className="align_right">
            <ExmState title="•  진단검사 접수 현황" columnsKey="L" />
            <ExmState title="•  기능검사 접수 현황" columnsKey="F" />
            <ExmState title="•  영상검사 접수 현황" columnsKey="R" />
            <ExmState title="•  내시경검사 접수 현황" columnsKey="E" />
          </div>
        </div>
      </div>
      <Dialog />
    </div>
  );
}

export default WithWrapper(MSC_010100);
