import React from "react";
import SearchBar from "./MSC_080100_SearchBar";
import Grid from "./MSC_080100_Grid";
import Dialog from "./MSC_080100_Dialog";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";

/**
 * @name 검사실별환자조회
 * @author 김진한A
 */
function MSC_080100() {
  return (
    <div className="MSC_080100 dp_full">
      <div className="align_box">
        <div className="align_top">
          <div className="left_box">
            <h2 className="menu_title">검사실별 환자조회</h2>
          </div>
        </div>
        <div className="align_split">
          <div className="align_right">
            <SearchBar />
            <Grid />
          </div>
        </div>
      </div>
      <Dialog />
    </div>
  );
}

export default WithWrapper(MSC_080100);
