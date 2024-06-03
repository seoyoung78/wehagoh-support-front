import { useEffect, useRef, useState } from "react";

// common-ui-components
import { GridFitStyle, GridView, LocalDataProvider } from "realgrid";
import PatientComplete from "components/Common/PatientComplete";
import {
  LUXAlert,
  LUXButton,
  LUXCircularProgress,
  LUXComplexPeriodDatePicker,
  LUXConfirm,
  LUXSelectField,
  LUXSnackbar,
  LUXTab,
  LUXTabs,
} from "luna-rocket";

// util
import getBadgeSvg from "services/utils/getBadgeSvg";
import callApi from "services/apis";
import withPortal from "hoc/withPortal";
import Message from "components/Common/Message";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";

// css
import "assets/style/MSC_020200.scss";
import moment from "moment";
import { MSC020200Columns, MSC020200Fields } from "pages/MSC_020000/MSC_020200/MSC_020200_Grid";
import { appendOnDataLoadComplated, configEmptySet } from "services/utils/grid/RealGridUtil";
import SearchIcon from "luna-rocket/LUXSVGIcon/Duzon/BlankSize/Search";
import { ErrorLogInfo } from "cliniccommon-ui";

// imgs

/**
 * @name MSC_020200  진료지원-진단검사 위탁의뢰
 * @authors 강현구A
 */
function MSC_020200() {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const gridElemRef = useRef();
  const gridViewRef = useRef();
  const patientComplete = useRef();
  const [searchCondition, setSearchCondition] = useState({
    pid: "",
    entsExmnInstCd: "",
    fromDy: new Date(),
    toDy: new Date(),
    searchDyCd: "A",
  });
  const [entsSelectList, setEntsSelectList] = useState([{ value: "", text: "전체" }]);
  const [progress, setProgress] = useState({
    open: false,
    message: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "info",
    message: "",
  });
  const [filter, setFilter] = useState("F");
  const [tabCount, setTabCount] = useState({
    F: 0,
    G: 0,
    H: 0,
  });
  const searchDyCdList = [
    { value: "A", text: "검사일자" },
    { value: "B", text: "전송일자" },
    { value: "C", text: "회신일자" },
  ];
  const [confirm, setConfirm] = useState({
    open: false,
    type: "success",
    titleMessage: "",
    contentsMessage: "",
    confirmButtonLabel: undefined,
    afterConfirmFunction: undefined,
    afterCancelFunction: undefined,
  });
  const [alert, setAlert] = useState({
    type: "info",
    open: false,
    title: "",
    message: "",
  });
  const [isEmpty, setIsEmpty] = useState(true);
  //useState end
  //function start
  /* ================================================================================== */
  /* 함수(function) 선언 */

  const search = ({ pid, entsExmnInstCd, fromDy, toDy, searchDyCd }) => {
    gridViewRef.current.commit();
    callApi("/MSC_020200/rtrvEntsExmnPrscList", {
      pid,
      ents_exmn_inst_cd: entsExmnInstCd,
      from_dy: moment(fromDy).format("YYYY-MM-DD"),
      to_dy: moment(toDy).format("YYYY-MM-DD"),
      search_dy_cd: searchDyCd,
    })
      .then(({ resultData, resultCode }) => {
        if (resultCode !== 200) throw new Error();
        const nextTabCount = {};
        for (const key of Object.keys(tabCount)) {
          nextTabCount[key] = resultData.filter(row => row.spcm_ents_prgr_stat_cd === key).length;
        }
        setTabCount(nextTabCount);
        gridViewRef.current.getDataSource().setRows(resultData);
        if (resultData.length < 1) {
          setSnackbar({ open: true, message: Message.noSearch, type: "info" });
        }
      })
      .catch(() => {
        setSnackbar({ open: true, message: Message.networkFail, type: "warning" });
      });
  };

  const handlePatientCompleted = value => {
    setSearchCondition(prev => ({ ...prev, pid: value ? value.pid : "" }));
    search({ ...searchCondition, pid: value ? value.pid : "" });
  };

  const handleSendClick = () => {
    gridViewRef.current.commit();
    const checkedIdxList = gridViewRef.current.getCheckedItems();
    if (checkedIdxList.length < 1) {
      setSnackbar({
        type: "info",
        message: Message.noCheck2,
        open: true,
      });
      return;
    }
    const param = [];
    for (const idx of checkedIdxList) {
      const item = gridViewRef.current.getValues(idx);
      if (item.ents_exmn_inst_cd === "41349890") {
        param.push(item);
      }
    }
    if (param.length !== checkedIdxList.length) {
      setSnackbar({
        type: "error",
        message: Message.MSC_020000_invalidTrmsInst,
        open: true,
      });
      if (param.length < 1) {
        return;
      }
    }
    setProgress({
      open: true,
      message: Message.MSC_020000_entsTrmsIng,
    });
    callApi("/MSC_020200/trmsEntsExmnPrsc", { mslcMapList: param })
      .then(({ resultCode, resultData }) => {
        if (resultCode !== 200) {
          let type = "warning";
          let message = Message.networkFail;
          if (resultCode === 451) {
            type = "error";
            message = Message.MSC_020000_entsConnFail;
          } else if (resultCode === 452) {
            type = "error";
            message = Message.MSC_020000_entsTrmsFail;
          } else if (resultCode === 407 && resultData === "INVALID_INST") {
            type = "error";
            message = Message.MSC_020000_invalidTrmsInst;
          } else if (resultCode === 453) {
            type = "error";
            message = Message.MSC_020000_entsNotUse;
          }
          setSnackbar({ type, message, open: true });
          return;
        }
        search({ ...searchCondition });
      })
      .catch(() => {
        setSnackbar({ type: "warning", message: Message.networkFail, open: true });
      })
      .finally(() => {
        setProgress({
          open: false,
          message: Message.MSC_020000_entsTrmsIng,
        });
        gridViewRef.current?.checkAll(false, false, false, false);
      });
  };

  const handleCancelClick = () => {
    gridViewRef.current.commit();
    const checkedItems = gridViewRef.current.getCheckedItems().map(idx => gridViewRef.current.getValues(idx));
    if (checkedItems.length < 1) {
      setSnackbar({
        open: true,
        type: "info",
        message: Message.noCheck2,
      });
      return;
    }
    const param = [];
    for (const item of checkedItems) {
      if (item.ents_exmn_inst_cd === "41349890") {
        param.push(item);
      }
    }
    if (param.length !== checkedItems.length) {
      setSnackbar({
        type: "error",
        message: Message.MSC_020000_invalidTrmsInst,
        open: true,
      });
      if (param.length < 1) {
        return;
      }
    }
    if (filter === "G") {
      //전송취소
      setConfirm({
        open: true,
        type: "success",
        titleMessage: "위탁전송 취소",
        contentsMessage: "선택한 검사의 전송을 취소하시겠습니까?",
        afterConfirmFunction: () => {
          setProgress({
            open: true,
            message: Message.MSC_020000_entsCnclTrmsIng,
          });
          callApi("/MSC_020200/cnclTrmsEntsExmnPrsc", { mslcMapList: param })
            .then(({ resultCode, resultData }) => {
              if (resultCode !== 200) {
                let type = "warning";
                let message = Message.networkFail;
                if (resultCode === 451) {
                  type = "error";
                  message = Message.MSC_020000_entsConnFail;
                } else if (resultCode === 452) {
                  type = "error";
                  message = Message.MSC_020000_entsCnclTrmsFail;
                } else if (resultCode === 407 && resultData === "INVALID_INST") {
                  type = "error";
                  message = Message.MSC_020000_invalidCnclTrmsInst;
                } else if (resultCode === 453) {
                  type = "error";
                  message = Message.MSC_020000_entsNotUse;
                }
                setSnackbar({ type, message, open: true });
                return;
              }
              search({ ...searchCondition });
            })
            .catch(() => {
              setSnackbar({ type: "warning", message: Message.networkFail, open: true });
            })
            .finally(() => {
              setProgress({
                open: false,
                message: Message.MSC_020000_entsCnclTrmsIng,
              });
              gridViewRef.current?.checkAll(false, false, false, false);
            });
        },
      });
    } else {
      setSnackbar({
        open: true,
        type: "warning",
        message: Message.MSC_020000_entsTrmsCnclPsbl,
      });
    }
  };

  const handleReplyClick = () => {
    gridViewRef.current.commit();
    setProgress({
      open: true,
      message: Message.MSC_020000_entsRplyIng,
    });
    callApi("/MSC_020200/rplyEntsExmnPrsc")
      .then(({ resultData, resultCode }) => {
        if (resultCode !== 200) {
          let type = "warning";
          let message = Message.networkFail;
          if (resultCode === 451) {
            type = "error";
            message = Message.MSC_020000_entsConnFail;
          } else if (resultCode === 452) {
            type = "error";
            message = Message.MSC_020000_entsRplyFail;
          } else if (resultCode === 453) {
            type = "error";
            message = Message.MSC_020000_entsNotUse;
          }
          setSnackbar({ type, message, open: true });
          return;
        }
        // 최근일자
        let latestDate = null;
        if (resultData.length < 1) {
          setSnackbar({
            open: true,
            type: "info",
            message: Message.MSC_020000_noReply,
          });
          return;
        }
        for (let i = 0; i < resultData.length; i++) {
          const currentDate = resultData[i].spcm_ents_rply_dt;
          if (!latestDate || currentDate > latestDate) {
            latestDate = currentDate;
          }
        }
        setAlert({
          type: "success",
          title: "최근 회신 데이터 확인",
          message: (
            <>
              <div>일자 : {latestDate}</div>
              <div style={{ marginLeft: "-55px" }}>건수 : {resultData.length}건</div>
            </>
          ),
          open: true,
        });
      })
      .catch(resultCode => {
        let type = "warning";
        let message = Message.networkFail;
        if (resultCode === 451) {
          type = "error";
          message = Message.MSC_020000_entsConnFail;
        } else if (resultCode === 452) {
          type = "error";
          message = Message.MSC_020000_entsRplyFail;
        }
        setSnackbar({ type, message, open: true });
      })
      .finally(() => {
        setProgress({
          open: false,
          message: Message.MSC_020000_entsRplyIng,
        });
      });
  };

  const handleCloseAlert = () => {
    search(searchCondition);
    setAlert(prev => ({ ...prev, open: false }));
  };

  //function end

  //useEffect start
  /* ================================================================================== */
  /* Hook(useEffect) */

  useEffect(() => {
    const dataProvider = new LocalDataProvider(false);
    dataProvider.setFields(MSC020200Fields);
    const gridView = new GridView(gridElemRef.current);
    gridViewRef.current = gridView;
    gridView.setColumns(MSC020200Columns);
    gridView.setDataSource(dataProvider);
    configEmptySet(gridView, gridElemRef.current, Message.noData);
    gridView.setDisplayOptions({
      fitStyle: GridFitStyle.EVEN,
      selectionStyle: "rows",
    });
    gridView.pasteOptions.enabled = false;
    gridView.setCopyOptions({ copyDisplayText: true, singleMode: true });
    gridView.setCheckBar({
      visible: true,
      syncHeadCheck: true,
    });
    gridView.rowIndicator.visible = false;
    gridView.footer.visible = false;
    gridView.stateBar.visible = false;
    gridView.setFilteringOptions({ enabled: false });
    gridView.setColumnFilters(
      "spcm_ents_prgr_stat_cd",
      Object.keys(tabCount).map(key => ({ name: key, criteria: `value = '${key}'` })),
    );
    appendOnDataLoadComplated(gridView, grid => {
      //데이터 변화에 따른 화면 변화.
      setIsEmpty(grid.getDataSource().getRowCount() < 1);
    });
    gridView.onFilteringChanged = grid => {
      grid.onDataLoadComplated(grid);
    };
    dataProvider.clearRows();
    Promise.all([
      callApi("/common/selectCommonCode", { clsfList: ["CS1008"], date: moment(new Date()).format("YYYY-MM-DD") }),
      callApi("/MSC_020200/rtrvEntsInstList"),
    ])
      .then(([{ resultData }, { resultData: entsList, resultCode }]) => {
        if (resultCode !== 200) throw new Error();
        gridView.setColumn({
          ...gridView.columnByName("spcm_ents_prgr_stat_cd"),
          values: resultData.map(item => item.cmcd_cd),
          labels: resultData.map(item => item.cmcd_nm),
          renderer: {
            type: "image",
            imageCallback: (_grid, dataCell) => {
              for (const stateData of resultData) {
                if (dataCell.value === stateData.cmcd_cd) {
                  return getBadgeSvg(stateData.cmcd_nm, stateData.cmcd_char_valu1);
                }
              }
            },
          },
        });
        setEntsSelectList([
          { value: "", text: "전체" },
          ...entsList.map(elem => ({ value: elem.ents_exmn_inst_cd, text: elem.ents_exmn_inst_nm })),
        ]);
        gridView.setColumn({
          ...gridView.columnByName("ents_exmn_inst_cd"),
          values: entsList.map(elem => elem.ents_exmn_inst_cd),
          labels: entsList.map(elem => elem.ents_exmn_inst_nm),
        });
        search({ ...searchCondition });
      })
      .catch(() => {
        ErrorLogInfo();
      });
    return () => {
      gridView.destroy();
      dataProvider.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    gridViewRef.current.activateColumnFilters("spcm_ents_prgr_stat_cd", Object.keys(tabCount), false);
    gridViewRef.current.activateColumnFilters("spcm_ents_prgr_stat_cd", filter, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  //end useMemo

  /* ================================================================================== */
  /* render() */
  return (
    <div className="MSC_020200 dp_full">
      <div className="align_box">
        <div className="align_top">
          <div className="left_box">
            <h2 className="menu_title">진단검사 위탁의뢰</h2>
          </div>
          <div className="right_box"></div>
        </div>
        <div className="align_split">
          <div className="align_right">
            <div className="sec_wrap">
              <div className="sec_content">
                <dl className="search_list">
                  <div className="item">
                    <dt>조회일자</dt>
                    <dd>
                      <LUXSelectField
                        checkObjectList
                        selectFieldData={searchDyCdList}
                        defaultData={searchCondition.searchDyCd}
                        handleChoiceData={value => setSearchCondition(prev => ({ ...prev, searchDyCd: value }))}
                        listAutoHeight
                        style={{ width: "120px" }}
                      />
                      <LUXComplexPeriodDatePicker
                        datePickerProps={{ dateFormatSeparator: "-" }}
                        valueFrom={searchCondition.fromDy}
                        valueTo={searchCondition.toDy}
                        onChange={(fromDy, toDy) => {
                          setSearchCondition(prev => ({ ...prev, fromDy, toDy }));
                        }}
                      />
                    </dd>
                  </div>
                  <div className="item">
                    <dt>위탁기관</dt>
                    <dd>
                      <LUXSelectField
                        checkObjectList
                        selectFieldData={entsSelectList}
                        defaultData={searchCondition.entsExmnInstCd}
                        handleChoiceData={value => setSearchCondition(prev => ({ ...prev, entsExmnInstCd: value }))}
                        listAutoHeight
                        style={{ width: "120px" }}
                      />
                    </dd>
                  </div>
                  <div className="item">
                    <dt>환자조회</dt>
                    <dd>
                      <div style={{ width: "200px" }}>
                        <PatientComplete ref={patientComplete} onCompleted={handlePatientCompleted} useIcon />
                      </div>
                    </dd>
                  </div>

                  <div className="item summit">
                    <dd>
                      <LUXButton
                        className="LUX_basic_btn Image basic"
                        type="icon"
                        icon={
                          <SearchIcon
                            style={{
                              width: "18px",
                              height: "18px",
                            }}
                          />
                        }
                        onClick={() => {
                          if (!patientComplete.current?.getCompleted())
                            patientComplete.current?.setCompleted(null, true);
                          else {
                            search(searchCondition);
                          }
                        }}
                      />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="sec_wrap full_size">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">전송 및 회신결과</h3>
                  </div>
                </div>
                <div className="right_box">
                  <LUXButton label="전송" onClick={handleSendClick} disabled={isEmpty || filter !== "F"} type="small" />
                  <LUXButton className="ml5" label="회신" onClick={handleReplyClick} type="small" />
                  <LUXButton
                    className="ml5"
                    label="취소"
                    onClick={handleCancelClick}
                    disabled={isEmpty || filter !== "G"}
                    type="small"
                  />
                </div>
              </div>
              <div className="sec_content">
                <div className="tabs">
                  <LUXTabs align="left">
                    <LUXTab label={`미전송 (${tabCount.F})`} onActive={() => setFilter("F")} />
                    <LUXTab label={`전송 (${tabCount.G})`} onActive={() => setFilter("G")} />
                    <LUXTab label={`회신 (${tabCount.H})`} onActive={() => setFilter("H")} />
                  </LUXTabs>
                </div>
                <div className="grid_box" ref={gridElemRef}>
                  {progress.open && (
                    <LUXCircularProgress
                      type="big"
                      innerText={progress.message}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        zIndex: 9999,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {withPortal(
        <LUXSnackbar
          message={snackbar.message}
          onRequestClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          open={snackbar.open}
          type={snackbar.type}
        />,
        "snackbar",
      )}
      {withPortal(
        <LUXConfirm
          useIcon
          useIconType={confirm.type}
          title={confirm.titleMessage}
          message={confirm.contentsMessage}
          open={confirm.open}
          cancelButton={() => {
            setConfirm({ ...confirm, open: false });
            confirm.afterCancelFunction && confirm.afterCancelFunction();
          }}
          confirmButton={() => {
            setConfirm({ ...confirm, open: false });
            confirm.afterConfirmFunction && confirm.afterConfirmFunction();
          }}
          confirmButtonLabel={confirm.confirmButtonLabel}
          onClose={() => {
            setConfirm({ ...confirm, open: false });
          }}
        />,
        "dialog",
      )}
      {withPortal(
        <LUXAlert
          useIcon
          useIconType={alert.type}
          open={alert.open}
          title={alert.title}
          message={alert.message}
          onClose={handleCloseAlert}
          confirmButton={handleCloseAlert}
        />,
        "dialog",
      )}
    </div>
  );
}

export default WithWrapper(MSC_020200);
