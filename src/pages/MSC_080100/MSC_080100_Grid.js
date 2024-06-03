import React, { useRef, useEffect } from "react";
import shallow from "zustand/shallow";
import { LocalDataProvider, GridView, GridFitStyle } from "realgrid";
import { configEmptySet } from "services/utils/grid/RealGridUtil";
import Message from "components/Common/Message";
import getBadgeSvg from "services/utils/getBadgeSvg";
import useMSC080100Store from "./store";
import { fields, columns } from "./columns";

export default function () {
  const [setProvider, setGridView] = useMSC080100Store(
    state => [state.grid.setProvider, state.grid.setGridView],
    shallow,
  );
  const selectCommonCode = useMSC080100Store(state => state.api.selectCommonCode);

  const RealgridElement = useRef(null);

  useEffect(() => {
    const container = RealgridElement.current;
    const provider = new LocalDataProvider(true);
    const gridView = new GridView(container);

    gridView.setDataSource(provider);
    provider.setFields(fields);
    gridView.setColumns(columns);
    gridView.stateBar.visible = false;
    gridView.checkBar.visible = false;
    gridView.footer.visible = false;
    gridView.displayOptions.fitStyle = GridFitStyle.EVEN_FILL;
    gridView.displayOptions.selectionStyle = "rows";
    gridView.setEditOptions({ editable: false });
    gridView.pasteOptions.enabled = false;
    gridView.setCopyOptions({ copyDisplayText: true, singleMode: true });
    gridView.setColumnProperty("prsc_nm", "autoFilter", true);
    configEmptySet(gridView, RealgridElement.current, Message.noData);

    setProvider(provider);
    setGridView(gridView);
    selectCommonCode().then(({ resultData }) => {
      gridView.setColumn({
        ...gridView.columnByName("prsc_prgr_stat_cd"),
        values: resultData.map(item => item.cmcd_clsf_cd + item.cmcd_cd),
        labels: resultData.map(item => item.cmcd_nm),
        renderer: {
          type: "image",
          imageCallback: (grid, dataCell) => {
            const values = grid.getValues(dataCell.index.itemIndex);
            const codeObj =
              resultData.find(item => item.cmcd_clsf_cd + item.cmcd_cd === dataCell.value) ?? resultData[0];
            return getBadgeSvg(
              values.exrm_clsf_cd === "R" && values.prsc_prgr_stat_cd === "CS1008M"
                ? "판독중"
                : values.exrm_clsf_cd === "P" && values.prsc_prgr_stat_cd === "CS1015N" && values.mdtr_yn === "N"
                ? "최종완료"
                : codeObj.cmcd_nm,
              codeObj.cmcd_char_valu1,
            );
          },
        },
      });
    });

    return () => {
      provider.clearRows();
      gridView.destroy();
      provider.destroy();

      RealgridElement.current = null;
    };
  }, [selectCommonCode, setGridView, setProvider]);

  return (
    <div className="sec_wrap full_size">
      <div className="sec_header">
        <div className="left_box">
          <div className="sec_title">
            <svg viewBox="0 0 24 24" className="ico_svg">
              <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
            </svg>
            <h3 className="title">환자 목록</h3>
          </div>
        </div>
      </div>
      <div className="sec_content" ref={RealgridElement} />
    </div>
  );
}
