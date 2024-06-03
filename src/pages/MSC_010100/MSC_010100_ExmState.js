import React, { useEffect } from "react";
import DoughnutChart from "components/Common/DoughnutChart";
import StateBtnGrp from "components/Common/StateBtnGroup";
import Grid from "./MSC_010100_Grid";
import useMSC010100Store from "./store";

export default function ({ title, columnsKey }) {
  const exmnState = useMSC010100Store(state => state.grid.exmnState[columnsKey]);
  const { setBtnState, initBtnState } = useMSC010100Store(state => state.grid);

  const handleClickStateBtnGrp = value => {
    setBtnState(columnsKey, value);
  };

  const exmnStateDataAdapter = exmnState.btnCmcdList.reduce((acc, code) => {
    if (code === 0 || code === "0") {
      acc[code] = exmnState.data ?? [];
    } else {
      acc[code] = (exmnState.data ?? []).filter(item => item.prsc_prgr_stat_cd === code);
    }
    return acc;
  }, {});

  useEffect(() => {
    initBtnState();
  }, []);

  return (
    <div className="exm_state">
      <div className="title">
        <span>{title}</span>
      </div>
      <div className="chart">
        <DoughnutChart arrStates={exmnState.btnSet} />
      </div>
      <div className="icon-wrap">
        <StateBtnGrp
          arrStates={exmnState.btnSet ?? []}
          objGridMstData={exmnStateDataAdapter}
          onClickStateBtnGrp={handleClickStateBtnGrp}
          strSelectedStateBtn={exmnState.button}
          isDashboard
        />
      </div>
      <Grid columnsKey={columnsKey} />
    </div>
  );
}
