import React, { useEffect, useRef, useState } from "react";

// util
import { GridBase, GridView, LocalDataProvider, ValueType } from "realgrid";
import callApi from "services/apis";
import { columns, fields } from "pages/MSC_070100/MSC_070100_T05_Grid";

// common-ui-components
import ReactEcharts from "echarts-for-react";
import { LUXButton } from "luna-rocket";
import PropTypes from "prop-types";
import { configEmptySet } from "services/utils/grid/RealGridUtil";
import Message from "components/Common/Message";
import { calculateComp, parseNumberStrict } from "pages/MSC_020000/utils/MSC_020000Utils";

// css

// imgs

// constants
const defaultOption = {
  color: ["#4EABFA", "#50CBDE", "#AFD873", "#F7AD68", "#F5D471"],
  tooltip: {
    trigger: "axis",
  },
  legend: {
    type: "scroll",
    bottom: "0%",
  },
  grid: {
    top: "10%",
    left: "0%",
    right: "3%",
    bottom: "10%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: "",
  },
  yAxis: {
    type: "value",
    min: "0",
    max: "0",
  },
  series: "",
};

/**
 * 통합검사결과 화면 진단검사 누적결과조회 탭.
 * @author khgkjg12 강현구A
 */
export default function MSC_070100_T05({ open, cardSearchCondition, sort, setSnackbar }) {
  /* ================================================================================== */
  /* 참조(ref) 선언 */
  const realGridElemRef = useRef();
  /**
   * @type {{current:GridView}}
   */
  const gridViewRef = useRef();
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [chartOpen, setChartOpen] = useState(false);
  const [chartOption, setChartOption] = useState(defaultOption);

  /* ================================================================================== */
  /* 함수(function) 선언 */

  /* ================================================================================== */
  /* Hook(useEffect) */

  useEffect(() => {
    const dataProvider = new LocalDataProvider(true);
    dataProvider.setFields(fields);
    const gridView = new GridView(realGridElemRef.current);
    gridView.setColumns(columns);
    gridViewRef.current = gridView;
    gridView.setDataSource(dataProvider);
    gridView.setDisplayOptions({
      fitStyle: "even", // 그리드 가로 영역 채우기
      selectionStyle: "rows",
    });
    gridView.pasteOptions.enabled = false;
    gridView.setCopyOptions({ copyDisplayText: true, singleMode: true });
    configEmptySet(gridView, realGridElemRef.current, Message.noData);
    gridView.setCheckBar({
      visible: true,
      syncHeadCheck: true,
    });
    gridView.setRowIndicator({ visible: false });
    gridView.setStateBar({ visible: false });
    gridView.setFooter({ visible: false });
    gridView.setFixedOptions({ colCount: 2 });
    gridView.setEditOptions({ editable: false, readOnly: true });
    gridView.setFixedOptions({
      colBarWidth: 2,
    });
    const handleItemChecked = () => {
      const idxList = gridView.getCheckedItems();
      let errMessage = null;
      const items = [];
      for (const idx of idxList) {
        if (gridView.getValue(idx, "rslt_type_dvsn") === "T") {
          //타입이 없는 데이터는 일단 수치로 처리. 문자형 데이터 선택 무효화.
          gridView.checkItem(idx, false, false, false);
          errMessage = errMessage || Message.MSC_070100_chckNonNmvlExmn;
          continue;
        }
        let skip = false;
        for (let i = fields.length; i < dataProvider.getFieldCount(); i++) {
          if (!dataProvider.getOrgFieldName(i).includes("_comp_cd")) {
            const value = gridView.getValue(idx, i);
            const parsedValue = parseNumberStrict(value);
            if (parsedValue === undefined) {
              gridView.checkItem(idx, false, false, false); //수치가 아닌 데이터를 가진 선택 무효화.
              errMessage = errMessage || Message.MSC_070100_extcNonNmvlValu;
              skip = true;
              break;
            }
          }
        }
        if (skip) continue;
        if (items.length > 4) {
          gridView.checkItem(idx, false, false, false); //5개 넘으면 무조건 무효화.
          errMessage = errMessage || Message.MSC_070100_excsMaxChck;
          continue;
        }
        items.push(gridView.getValues(idx));
      }
      if (items.length > 0) {
        //xAxis 계산.
        const xAxisList = [];
        for (let i = fields.length; i < dataProvider.getFieldCount(); i++) {
          const fieldName = dataProvider.getOrgFieldName(i);
          if (!fieldName.includes("_comp_cd")) xAxisList.push(fieldName);
        }
        //xData 계산.
        const xData = [];
        for (const item of items) {
          const xList = [];
          for (let i = fields.length; i < dataProvider.getFieldCount(); i++) {
            const fieldName = dataProvider.getOrgFieldName(i);
            if (!fieldName.includes("_comp_cd")) {
              const value = item[fieldName];
              if (value) {
                const parsedValue = parseNumberStrict(value);
                xList.push(parsedValue);
              } else {
                xList.push(null);
              }
            }
          }
          xData.push(xList);
        }
        const linearXData = xData.reduce((acc, e) => [...acc, ...e]);
        setChartOption({
          ...defaultOption,
          xAxis: { type: "category", data: xAxisList },
          yAxis: {
            type: "value",
            max: Math.max(...linearXData),
            min: Math.min(...linearXData),
          },
          series: items.map((item, idx) => ({
            name: item.prsc_nm,
            type: "line",
            data: xData[idx],
            symbol: "circle",
            symbolSize: 7,
            connectNulls: true,
            exmn_cd: item.exmn_cd,
          })),
        });
        setChartOpen(true);
      } else {
        setChartOption({ ...defaultOption });
        setChartOpen(false);
      }
      if (errMessage) {
        setSnackbar({
          open: true,
          message: errMessage,
          type: "error",
        });
      }
    };
    gridView.onItemChecked = () => {
      handleItemChecked();
    };
    gridView.onItemAllChecked = () => {
      handleItemChecked(); //초기화.
    };
    dataProvider.clearRows();
    return () => {
      dataProvider.destroy();
      gridView.destroy();
    };
  }, []);

  useEffect(() => {
    setChartOpen(false);
    setChartOption({ ...defaultOption });
    if (!open || !cardSearchCondition.pid) return;
    callApi("/MSC_070100/rtrvAccRsltList", {
      pid: cardSearchCondition.pid,
      from: cardSearchCondition.from,
      to: cardSearchCondition.to,
      keyword: cardSearchCondition.keyword,
    })
      .then(({ resultCode, resultData }) => {
        if (resultCode !== 200) throw resultCode;
        const appendedColumns = [];
        const appendedFields = [];
        const data = [];
        if (sort === "sortOld") {
          resultData.sort((a, b) => new Date(a.cndt_dy) - new Date(b.cndt_dy));
        } else {
          resultData.sort((a, b) => new Date(b.cndt_dy) - new Date(a.cndt_dy));
        }
        resultData.forEach(res => {
          const existData = data.find(data => data.exmn_cd === res.exmn_cd);
          const rddcCnt = existData
            ? Object.keys(existData).filter(e => e.substring(0, 10) === res.cndt_dy && !e.includes("_comp_cd")).length
            : 0;
          const compCd = calculateComp(
            res.exmn_rslt_1,
            res.rfvl_lwlm_valu,
            res.rfvl_uplm_valu,
            res.rfvl_lwlm_rang_type_cd,
            res.rfvl_uplm_rang_type_cd,
          );
          const newData = {
            [res.cndt_dy + "(" + (rddcCnt + 1) + ")"]: res.exmn_rslt_1,
            [res.cndt_dy + "(" + (rddcCnt + 1) + ")_comp_cd"]: compCd,
          };
          const dataIdx = data.findIndex(row => row.exmn_cd === res.exmn_cd);
          if (dataIdx < 0) data.push({ ...res, ...newData });
          else {
            data[dataIdx] = { ...data[dataIdx], ...newData };
          }
          if (!appendedColumns.find(column => column.name === res.cndt_dy + "(" + (rddcCnt + 1) + ")")) {
            appendedColumns.push({
              name: res.cndt_dy + "(" + (rddcCnt + 1) + ")",
              fieldName: res.cndt_dy + "(" + (rddcCnt + 1) + ")",
              header: res.cndt_dy + "(" + (rddcCnt + 1) + ")",
              width: 100,
              cndt_dy: res.cndt_dy,
              renderer: {
                type: "text",
                showTooltip: true,
              },
              styleCallback: (grid, cell) => {
                const rsltValu = grid.getValue(cell.index.itemIndex, res.cndt_dy + "(" + (rddcCnt + 1) + ")");
                const compCd = grid.getValue(cell.index.itemIndex, res.cndt_dy + "(" + (rddcCnt + 1) + ")_comp_cd");
                let style = "rg-left-column rsltvalu-col";
                if (!rsltValu || rsltValu.length < 1) style += " rsltvalu-col-txtonly";
                else if (compCd === "H") {
                  style += " rsltvalu-col-high";
                } else if (compCd === "L") {
                  style += " rsltvalu-col-low";
                }
                return style;
              },
            });
            appendedFields.push({
              fieldName: res.cndt_dy + "(" + (rddcCnt + 1) + ")",
              dataType: ValueType.TEXT,
            });
            appendedFields.push({
              fieldName: res.cndt_dy + "(" + (rddcCnt + 1) + ")_comp_cd",
              dataType: ValueType.TEXT,
            });
          }
        });
        const gridView = gridViewRef.current;
        gridView.getDataSource().setFields(fields.concat(appendedFields));
        gridView.setColumns(columns.concat(appendedColumns));
        gridView.getDataSource().setRows(data);
        gridView.setColumnFilters(
          "prsc_nm",
          Object.values(
            resultData.reduce((acc, row) => {
              if (!acc[row.prsc_nm]) {
                acc[row.prsc_nm] = { name: row.prsc_nm, criteria: `value = '${row.prsc_nm}'` };
              }
              return acc;
            }, []),
          ),
        );
      })
      .catch(e => {
        setSnackbar({
          open: true,
          message: Message.networkFail,
          type: "warning",
        });
      });
  }, [open, cardSearchCondition, sort]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="msc_070100_t05">
      <div className="msc_070100_t05-grid" ref={realGridElemRef} />
      {chartOpen && (
        <div className="msc_070100_t05-graph">
          <div className="title">
            <span>• 검사결과 그래프</span>
            <LUXButton
              label="그래프 닫기"
              onClick={() => {
                setChartOpen(false);
                const checkedIdxList = gridViewRef.current?.getCheckedRows();
                if (checkedIdxList) {
                  for (let i = 0; i < checkedIdxList.length; i++) {
                    gridViewRef.current?.checkItem(checkedIdxList[i], false);
                  }
                }
              }}
            />
          </div>
          <ReactEcharts
            notMerge
            option={chartOption}
            height="100%"
            width="100%"
            style={{
              padding: "34px 100px 25px",
            }}
          />
        </div>
      )}
    </div>
  );
}
MSC_070100_T05.propTypes = {
  open: PropTypes.bool.isRequired,
  cardSearchCondition: PropTypes.shape({
    to: PropTypes.string,
    from: PropTypes.string,
    keyword: PropTypes.string,
    pid: PropTypes.string,
  }).isRequired,
  sort: PropTypes.oneOf(["sortOld", "sortRecent"]),
  setSnackbar: PropTypes.func.isRequired,
};
MSC_070100_T05.defaultProps = {
  sort: "sortOld",
};
