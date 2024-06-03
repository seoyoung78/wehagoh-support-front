import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// util
import Message from "components/Common/Message";
import { date, lodash } from "common-util/utils";
import callApi from "services/apis";
import getBadgeSvg from "services/utils/getBadgeSvg";
import { GridView, LocalDataProvider } from "realgrid";
import { setLocalStorageItem } from "services/utils/localStorage";
import { windowOpen } from "services/utils/popupUtil";
import {
  appendOnDataLoadComplated,
  configEmptySet,
  isLastOnDataLoadComplated,
  removeOnDataLoadComplated,
} from "services/utils/grid/RealGridUtil";
import moment from "moment";
import { columns, fields } from "./MSC_040200_Grid";
import { signApi } from "services/apis/signApi";
import { globals } from "global";
import useLoadingStore from "services/utils/zustand/useLoadingStore";
import useNotiStore from "services/utils/zustand/useNotiStore";
import useAuthstore from "services/utils/zustand/useAuthStore";

// common-ui-components
import withPortal from "hoc/withPortal";
import { LUXAlert, LUXButton, LUXConfirm, LUXSnackbar, LUXTextArea } from "luna-rocket";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";

// scss
import "assets/style/MSC_040200.scss";

// imgs
import IcLink from "assets/imgs/icon-link.svg";
import ImgEmptyData from "assets/imgs/img_empty_data_s@3x.png";

import SearchInfo from "components/Common/SearchInfo";
import DoughnutChart from "components/Common/DoughnutChart";
import StateBtnGroup from "components/Common/StateBtnGroup";
import UnactgUncmplDialog from "components/Common/UnactgUncmplDialog";
import MSC_100100_P01 from "pages/MSC_100100/MSC_100100_P01";
import HistoryDialog from "components/Common/HistoryDialog";
import PacsButton from "components/Common/PacsButton";
import PatientSummaryBar from "components/Common/PatientSummaryBar";

const defaultRadiology = {
  iptn_rslt: "", // 판독 소견
  pacs_link_path: "", // pacs 링크 경로
  arrLink: [], // pacs 링크 목록
  link: "",
  pacs_no: "", // pacs 번호
  pacs_co_cd: "", // pacs 업체 코드
};

/**
 * @name 영상검사 판독
 * @author 윤서영
 */
function MSC_040200() {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [state, setState] = useState({
    arrList: [], // 판독 목록

    isOpnn: false, // 검사소견 상태
    isSign: false, // 전자서명 상태
    isHistory: false, // 이력관리 상태

    signData: "",
  });
  const [radiology, setRadiology] = useState(lodash.cloneDeep(defaultRadiology));
  const [originRadio, setOriginRadio] = useState(lodash.cloneDeep(defaultRadiology));

  const patientRef = useRef(null);
  const searchRef = useRef(null);
  const unComRef = useRef(null);

  const [search, setSearch] = useState({
    pid: "",
    date: { from: new Date(), to: new Date() },
    hope_exrm_cd: [""],
  });

  const [selectedPatient, setSelectedPatient] = useState({}); // 환자정보

  const [arrState, setArrState] = useState([
    {
      code: "0",
      name: "전체",
      color: "#FFFFFF",
      count: 0,
    },
  ]);
  const [btnStatusValue, setBtnStatusValue] = useState("0"); // 현재 눌린 버튼 상태

  const { openLoading, closeLoading } = useLoadingStore(state => state);

  /* grid area */
  // 결과 현황 목록 그리드
  const grid = useRef(null); // realgrid DOM
  const dataProvider = useRef(null);
  const gridView = useRef(null);

  const [snack, setSnack] = useState({ open: false, type: "info", msg: "" }); // 스낵바 상태
  const [confirm, setConfirm] = useState({
    open: false,
    type: "info",
    title: "",
    msg: "",
    onConfirm: () => {},
    onCancel: () => {},
  }); // confirm 상태
  const [alert, setAlert] = useState({ open: false, title: "", message: "", type: "info" }); // alert창 상태

  const [runStat, setRunStat] = useState(false); // API 실행 상태
  const [bind, setBind] = useState(false); // 통합환자 여부

  const { getAuth } = useAuthstore(state => state);
  const { noti, resetNoti, checkNoti } = useNotiStore(state => state);
  const location = useLocation();

  /* ================================================================================== */
  // 접수 그리드 필터
  const handleFilter = useCallback(() => {
    if (btnStatusValue !== "0") {
      gridView.current.activateColumnFilters("prsc_prgr_stat_cd", btnStatusValue, true);
    }

    const index = gridView.current.searchItem({
      fields: ["pid", "prsc_date", "prsc_sqno", "hope_exrm_cd", "rcpn_sqno"],
      values: [
        selectedPatient.pid,
        selectedPatient.prsc_date,
        selectedPatient.prsc_sqno,
        selectedPatient.hope_exrm_cd,
        selectedPatient.rcpn_sqno,
      ],
    });

    if (Object.keys(selectedPatient).length === 0 || index < 0) {
      gridView.current.clearCurrent();
    }
  }, [btnStatusValue, selectedPatient]);

  /* 함수(function) 선언 */
  // 상세 조회
  const handleDetail = async param => {
    await callApi("/MSC_040000/selectRadiology", param || selectedPatient).then(({ resultCode, resultData }) => {
      if (resultCode === 200 && resultData !== null) {
        setOriginRadio(resultData);
        const arrLink =
          resultData.pacs_link_path && resultData.pacs_link_path.length > 0 ? resultData.pacs_link_path.split("|") : [];
        setRadiology({ ...resultData, arrLink, link: arrLink.length > 0 ? arrLink[0] : "" });
      } else {
        setSnack({ open: false, msg: Message.networkFail, type: "warning" });
      }
    });
  };

  // 조회(돋보기 버튼) 클릭
  const handleSearch = async param => {
    gridView.current.clearCurrent();

    const parameters = {
      pid: param ? param.pid : search.pid,
      exmn_hope_from_date: param ? date.getyyyymmdd(param.date.from) : date.getyyyymmdd(search.date.from),
      exmn_hope_to_date: param ? date.getyyyymmdd(param.date.to) : date.getyyyymmdd(search.date.to),
      hope_exrm_cd: param
        ? param.hope_exrm_cd.filter(list => list !== "")
        : search.hope_exrm_cd.filter(list => list !== ""),
      prsc_clsf_cd: "C2",
    };

    await callApi("/exam/selectResultList", parameters).then(({ resultCode, resultData }) => {
      let snack = false;

      if (resultCode === 200 && resultData !== null) {
        dataProvider.current?.setRows(resultData);
      } else {
        snack = true;
        dataProvider.current?.clearRows();
      }
      setState({ ...state, arrList: resultData !== null ? resultData : [] });
      setSnack({
        open: !resultData || resultData.length === 0 || snack,
        msg: resultCode === 200 ? Message.noSearch : Message.networkFail,
        type: resultCode === 200 ? "info" : "warning",
      });
      unComRef.current?.search();
    });
  };

  const handleChange = ({ type, value }) => {
    switch (type) {
      case "date":
        setSearch(prev => ({ ...prev, date: value }));
        break;
      case "select":
        setSearch(prev => ({ ...prev, hope_exrm_cd: value }));
        break;
      case "text":
        setSearch(prev => ({ ...prev, pid: value === "" ? "" : prev.pid }));
        break;
      case "complete":
        setSearch(prev => {
          gridView.current.activateAllColumnFilters("prsc_prgr_stat_cd", false);
          setBtnStatusValue("0");
          setSelectedPatient({});
          setRadiology(lodash.cloneDeep(defaultRadiology));
          setOriginRadio(lodash.cloneDeep(defaultRadiology));
          handleSearch({ ...prev, pid: value });
          return { ...prev, pid: value };
        });
        break;
      default:
        break;
    }
  };

  // 부서코드 로드 후
  const handleLoad = async searchOption => {
    const param = {
      clsfList: ["CS1008"],
      cdList: ["E", "M", "O"],
      date: date.getyyyymmdd(new Date()),
    };
    await callApi("/common/selectCommonCode", param)
      .then(({ resultData }) => {
        const arrResult = arrState.concat();

        resultData.map(list => {
          arrResult.push({
            code: list.cmcd_cd,
            name: list.cmcd_cd === "M" ? "판독중" : list.cmcd_nm,
            color: list.cmcd_cd === "E" ? list.cmcd_char_valu2 : list.cmcd_char_valu1,
            count: 0,
          });
        });
        setArrState(arrResult);

        gridView.current.setColumn({
          ...gridView.current.columnByName("prsc_prgr_stat_cd"),
          values: arrResult.map(item => item.code),
          labels: arrResult.map(item => item.name),
          renderer: {
            type: "image",
            imageCallback: (grid, dataCell) => {
              for (const patientState of arrResult) {
                if (dataCell.value === patientState.code) {
                  return getBadgeSvg(patientState.name, patientState.color);
                }
              }
            },
          },
        });

        const filter = arrResult
          .filter(list => list.code !== "0")
          .map(list => ({ name: list.code, text: list.name, criteria: `value = '${list.code}'` }));
        gridView.current.setColumnFilters("prsc_prgr_stat_cd", filter);

        handleSearch(searchOption);
      })
      .catch(e => {
        setSnack({ open: true, msg: Message.networkFail, type: "warning" });
      });
  };

  // 미완료 환자 선택
  const handleAdjust = data => {
    gridView.current.resetFilters();

    const param = {
      pid: data.pid,
      date: {
        from: new Date(data.exmn_hope_date),
        to: new Date(data.exmn_hope_date),
      },
      hope_exrm_cd: [data.hope_exrm_cd],
    };
    setSearch(param);
    handleSearch(param);
    gridView.current.activateAllColumnFilters("prsc_prgr_stat_cd", false);
    setBtnStatusValue("0");
    setSelectedPatient({ ...data, cndt_dt: data.exmn_hope_date });
    handleDetail(data);

    searchRef.current.setKeyword(data.pid + " " + data.pt_nm, data);
    searchRef.current.selectDept(data.hope_exrm_cd);
  };

  const setAfterUpdate = async msgtxt => {
    handleDetail();

    await handleSearch().then(() => {
      setSnack({ open: !!msgtxt, msg: msgtxt || "", type: "success" });
    });
  };

  // 전자서명
  const handleSign = async param => {
    const parameters = {
      iptn_rslt: param ? "" : radiology.iptn_rslt, // 판독소견
    };

    const { dgsgKey } = await signApi(parameters);
    return dgsgKey;
  };

  // 알림 발송
  const handleNoti = async type => {
    const parameters = {
      type,
      date: moment(selectedPatient.cndt_dt).format("YYYY-MM-DD"),
      exrmClsfCd: "R",
      ...selectedPatient,
    };
    const result = await callApi("/exam/sendNoti", parameters);
    return result;
  };

  // 저장
  const handleSave = () => {
    if (runStat) return;

    const item = gridView.current.getSelectionData()[0].prsc_prgr_stat_cd;
    if (item === arrState[3].code) {
      setSnack({ open: true, msg: Message.MSC_040200_noSave, type: "error" });
    } else {
      setRunStat(true);
      handleSign()
        .then(async dgsgKey => {
          if (dgsgKey) {
            const parameters = {
              type: "Save",
              ...radiology,
              hstr_stat_cd: gridView.current.getSelectionData()[0].prsc_prgr_stat_cd === "E" ? "1" : "2",
              dgsg_no: dgsgKey,
            };

            await callApi("/MSC_040000/save", parameters).then(({ resultCode, resultMsg }) => {
              if (resultCode === 200) {
                setOriginRadio(radiology);
                setAfterUpdate(Message.save);
              } else {
                setSnack({ open: true, msg: resultMsg, type: "error" });
              }
            });
          }
        })
        .finally(() => setRunStat(false));
    }
  };

  // 판독취소
  const handleSaveCancle = () => {
    if (runStat) return;

    const item = gridView.current.getSelectionData()[0].prsc_prgr_stat_cd;

    if (item !== arrState[2].code) {
      setSnack({ open: true, msg: Message.MSC_040200_noSaveCancel, type: "error" });
    } else {
      setConfirm({
        open: true,
        title: "판독 취소",
        msg: Message.readingCancelConfirm,
        onConfirm: () => {
          setRunStat(true);
          handleSign()
            .then(async dgsgKey => {
              if (dgsgKey) {
                await callApi("/MSC_040000/save", {
                  type: "SaveCancel",
                  ...radiology,
                  hstr_stat_cd: "3",
                  dgsg_no: dgsgKey,
                }).then(({ resultCode, resultMsg }) => {
                  if (resultCode === 200) {
                    setAfterUpdate(Message.readingCancel);
                  } else {
                    setSnack({ open: true, msg: resultMsg, type: "error" });
                  }
                });
              }
            })
            .finally(() => setRunStat(false));
          // (async () => {
          //   await callApi("/MSC_040000/save", {
          //     type: "SaveCancel",
          //     ...radiology,
          //     hstr_stat_cd: "3",
          //   }).then(({ resultCode, resultMsg }) => {
          //     if (resultCode === 200) {
          //       setAfterUpdate(Message.readingCancel);
          //     } else {
          //       setSnack({ open: true, msg: resultMsg, type: "error" });
          //     }
          //   });
          // })().finally(() => setRunStat(false));
        },
        onCancel: () => {},
      });
    }
  };

  // 최종판독
  const handleInterpret = async () => {
    if (runStat) return;

    const item = gridView.current.getSelectionData()[0].prsc_prgr_stat_cd;
    const parameters = {
      type: "Interpret",
      ...radiology,
    };
    if (item === arrState[2].code) {
      if (radiology.iptn_rslt !== originRadio.iptn_rslt) {
        setConfirm({
          open: true,
          title: "영상검사 최종판독",
          msg: Message.saveCheckConfirm,
          onConfirm: () => {
            setRunStat(true);
            handleSign()
              .then(async dgsgKey => {
                if (dgsgKey) {
                  await callApi("/MSC_040000/interpret", { ...parameters, hstr_stat_cd: "2", dgsg_no: dgsgKey }).then(
                    ({ resultCode, resultMsg }) => {
                      if (resultCode === 200) {
                        setAfterUpdate(Message.interprete);
                      } else {
                        setSnack({ open: true, msg: resultMsg, type: "error" });
                      }
                    },
                  );
                }
              })
              .finally(() => {
                setRunStat(false);
              });
          },
          onCancel: () => {},
        });
      } else {
        // });
        setRunStat(true);
        await callApi("/MSC_040000/interpret", parameters)
          .then(({ resultCode, resultMsg }) => {
            if (resultCode === 200) {
              setAfterUpdate(Message.interprete);
              handleNoti("Interpret");
            } else {
              setSnack({ open: true, msg: resultMsg, type: "error" });
            }
          })
          .finally(() => {
            setRunStat(false);
          });
      }
    } else {
      setSnack({ open: true, msg: Message.MSC_040200_noInterpret, type: "error" });
    }
  };

  // 최종판독 취소
  const handleInterpretCancle = () => {
    if (runStat) return;

    const item = gridView.current.getSelectionData()[0].prsc_prgr_stat_cd;

    if (item !== arrState[3].code) {
      setSnack({ open: true, msg: Message.MSC_040200_noInterpretCancel, type: "error" });
    } else {
      setConfirm({
        open: true,
        title: "최종판독 취소",
        msg: Message.interpreteCancelConfirm,
        onConfirm: async () => {
          setRunStat(true);

          const parameters = {
            type: "InterpretCancel",
            ...radiology,
          };

          await callApi("/MSC_040000/interpret", parameters)
            .then(({ resultCode, resultMsg }) => {
              if (resultCode === 200) {
                setAfterUpdate(Message.interpreteCancel);
                handleNoti("InterpretCancel");
              } else {
                setSnack({ open: true, msg: resultMsg, type: "error" });
              }
            })
            .finally(() => {
              setRunStat(false);
            });
        },
        onCancel: () => {},
      });
    }
  };

  // 출력 버튼 클릭
  const handlePrint = () => {
    const auth = getAuth(162);
    if (auth) {
      const key = setLocalStorageItem({
        list: [{ ...radiology, prsc_nm: selectedPatient.prsc_nm, rcpn_no: selectedPatient.rcpn_sqno }],
        ptInfo: patientRef.current.getPatientInfo(),
      });
      if (key) {
        const url = `CSMSP003`;
        const width = 1000; // 팝업 가로사이즈
        const height = window.screen.height - 200; // 팝업 세로사이즈
        // 너비, 높이 및 스크롤바를 설정
        const features = {
          width,
          height,
          left: window.screenX + window.screen.width / 2 - width / 2,
          top: window.screen.height / 2 - height / 2 - 40,
        };
        windowOpen(url, key, features);
      } else {
        setSnack({ open: true, msg: Message.networkFail, type: "warning" });
      }
    } else {
      setAlert({ open: true, title: Message.issueAlertTitle, message: Message.issueAlertMessage, type: "warning" });
    }
  };

  // CVR 보고
  const handleCVR = () => {
    const sendCVRAlert = async () => {
      const timeout = setTimeout(() => openLoading(Message.sendNoti), 300);

      const parameters = {
        date: moment(selectedPatient.cndt_dt).format("YYYY-MM-DD"),
        exrmClsfCd: "R",
        ...selectedPatient,
        detailsList: [
          {
            prsc_nm: selectedPatient.prsc_nm,
            mdcr_dr_id: selectedPatient.mdcr_dr_id,
            result: radiology.iptn_rslt,
            result_date: selectedPatient.iptn_dt,
            prsc_dr_sqno: selectedPatient.prsc_dr_sqno,
          },
        ],
      };

      await callApi("/exam/sendCvrRequestNoti", parameters)
        .then(({ resultCode }) => {
          if (resultCode === 200) {
            setSnack({ open: true, msg: Message.cvrSuccess, type: "success" });
          } else {
            setSnack({ open: true, msg: Message.networkFail, type: "warning" });
          }
        })
        .catch(() => setSnack({ open: true, msg: Message.networkFail, type: "warning" }))
        .finally(() => {
          closeLoading();
          clearTimeout(timeout);
        });
    };

    if (radiology.iptn_rslt !== originRadio.iptn_rslt) {
      setConfirm({
        open: true,
        title: "영상검사 CVR보고",
        msg: Message.saveCheckConfirm,
        onConfirm: () => {
          setRunStat(true);
          (async () => {
            const parameters = {
              type: "Save",
              ...radiology,
              hstr_stat_cd: "2",
            };
            await callApi("/MSC_040000/save", parameters).then(({ resultCode, resultMsg }) => {
              if (resultCode === 200) {
                setAfterUpdate().then(() => sendCVRAlert());
              } else {
                setSnack({ open: true, msg: resultMsg, type: "error" });
              }
            });
          })().finally(() => setRunStat(false));
        },
        onCancel: () => {},
      });
    } else {
      sendCVRAlert();
    }
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    const container = grid.current;
    const dataSource = new LocalDataProvider(true);
    const gv = new GridView(container);

    gv.setDataSource(dataSource);
    dataSource.setFields(fields);
    gv.setColumns(columns);

    gv.setDisplayOptions({
      fitStyle: "even", // 그리드 가로 영역 채우기
      selectionStyle: "rows",
    });

    gv.rowIndicator.visible = false;
    gv.footer.visible = false;
    gv.checkBar.visible = false;
    gv.stateBar.visible = false;
    gv.editOptions.editable = false;
    gv.pasteOptions.enabled = false;
    gv.setCopyOptions({ copyDisplayText: true, singleMode: true });

    // gv.filteringOptions.automating.filteredDataOnly = true;
    gv.setColumnProperty("prsc_nm", "autoFilter", true);

    // 상태 필터에 따른 버튼 상태 수정
    gv.onFilteringChanged = grid => {
      const filters = grid.getActiveColumnFilters("prsc_prgr_stat_cd");
      if (filters.length === 1) {
        setBtnStatusValue(filters[0].name);
      } else {
        setBtnStatusValue("0");
      }
    };

    configEmptySet(gv, container, Message.noSearch);
    dataSource.setRows([]);

    dataProvider.current = dataSource;
    gridView.current = gv;

    return () => {
      dataSource.clearRows();
      gv.destroy();
      dataSource.destroy();

      dataProvider.current = null;
      gridView.current = null;
    };
  }, []);

  useEffect(() => {
    handleFilter();
  }, [btnStatusValue]);

  useEffect(() => {
    if (!isLastOnDataLoadComplated(gridView.current)) {
      removeOnDataLoadComplated(gridView.current);
    }
    appendOnDataLoadComplated(gridView.current, () => handleFilter());
  }, [handleFilter]);

  useEffect(() => {
    if (state.arrList && arrState.length > 1) {
      const newState = lodash.cloneDeep(arrState);
      newState.map(stat => {
        stat.count =
          stat.code === "0"
            ? state.arrList.length
            : state.arrList.filter(list => list.prsc_prgr_stat_cd === stat.code).length;
      });
      setArrState(newState);
    }
  }, [state.arrList]);

  // 수정 여부 체크
  useEffect(() => {
    gridView.current.onSelectionChanged = (grid, selection) => {
      const values = grid.getValues(selection.startRow);
      if (radiology.iptn_rslt !== originRadio.iptn_rslt) {
        setConfirm({
          open: true,
          title: "결과입력 나가기",
          msg: Message.saveCheckConfirm,
          onConfirm: () => {
            setRunStat(true);
            (async () => {
              const parameters = {
                type: "Save",
                ...radiology,
                hstr_stat_cd: "2",
              };
              await callApi("/MSC_040000/save", parameters).then(({ resultCode, resultMsg }) => {
                if (resultCode === 200) {
                  setSnack({ open: true, msg: Message.save, type: "success" });
                  setSelectedPatient(values);
                  handleSearch();
                  handleDetail(values);
                } else {
                  setSnack({ open: true, msg: resultMsg, type: "error" });
                }
              });
            })().finally(() => setRunStat(false));
          },
          onCancel: () => {
            setSelectedPatient(values);
            setOriginRadio(radiology);
            handleDetail(values);
          },
        });
      } else if (
        !(
          Object.keys(selectedPatient).length > 0 &&
          selectedPatient.pid === values.pid &&
          selectedPatient.rcpn_sqno === values.rcpn_sqno &&
          selectedPatient.prsc_sqno === values.prsc_sqno &&
          selectedPatient.prsc_prgr_stat_cd === values.prsc_prgr_stat_cd &&
          selectedPatient.prsc_nm === values.prsc_nm
        )
      ) {
        setSelectedPatient(values);
        handleDetail(values);
        setRunStat(false);
      }
    };
  }, [radiology.iptn_rslt, originRadio.iptn_rslt, selectedPatient]);

  useEffect(() => {
    if (noti && checkNoti("MSC_040200")) {
      handleSearch().finally(() => resetNoti());
    }
  }, [noti]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="MSC_040200 dp_full">
      <div className="align_box">
        <div
          className={`align_top ${
            Object.keys(selectedPatient).length > 0 && selectedPatient.pid !== "" ? "patient_info_wrap" : ""
          }`}
        >
          <PatientSummaryBar
            pid={selectedPatient.pid}
            rcpn_sqno={selectedPatient.rcpn_sqno}
            prsc_clsf_cd="C2"
            hope_exrm_cd={selectedPatient.hope_exrm_cd}
            exmn_hope_date={selectedPatient.exmn_hope_date}
            ref={patientRef}
            pageId="MSC_040200"
            cndt_dt={selectedPatient.cndt_dt}
            iptn_dt={selectedPatient.iptn_dt}
            handleBind={stat => setBind(stat)}
          />
        </div>
        <div className="align_split">
          <div className="align_left">
            <div className="sec_wrap">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">영상검사 결과 현황</h3>
                  </div>
                </div>
                <div className="right_box">
                  {/* 미완료 */}
                  <UnactgUncmplDialog
                    onAdjust={handleAdjust}
                    prscClsfCd="C2"
                    hopeExrmDeptSqnoList={search.hope_exrm_cd}
                    stateList={arrState}
                    uncmplYn="Y"
                    ref={unComRef}
                  />
                </div>
              </div>
              <div className="sec_content">
                <SearchInfo
                  type="result"
                  exrmClsfCd="R"
                  date={search.date}
                  ref={searchRef}
                  handleChange={handleChange}
                  handleSearch={() => {
                    gridView.current.activateAllColumnFilters("prsc_prgr_stat_cd", false);
                    setBtnStatusValue("0");
                    handleSearch();
                    setSelectedPatient({});
                    setRadiology(lodash.cloneDeep(defaultRadiology));
                    setOriginRadio(lodash.cloneDeep(defaultRadiology));
                  }}
                  onDeptListLoaded={e => {
                    const searchOption = { ...search, hope_exrm_cd: e };
                    if (location.state) {
                      searchOption.date = {
                        from: new Date(location.state.cndt_dt),
                        to: new Date(location.state.cndt_dt),
                      };
                      searchOption.pid = location.state.pid;
                      searchRef.current.setKeyword(location.state.pid + " " + location.state.pt_nm, location.state);
                      location.state = null;
                    }
                    setSearch(searchOption);
                    handleLoad(searchOption);
                  }}
                />
              </div>
            </div>
            <div className="sec_wrap full_size">
              <div className="sec_content">
                <div className="donut_box">
                  <div className="chart_box">
                    <DoughnutChart arrStates={arrState} />
                  </div>
                </div>
              </div>
            </div>
            <div className="sec_wrap full_size2">
              <div className="sec_content">
                <StateBtnGroup
                  arrStates={arrState}
                  onClickStateBtnGrp={e => {
                    gridView.current.activateAllColumnFilters("prsc_prgr_stat_cd", false);
                    setBtnStatusValue(e);
                  }}
                  strSelectedStateBtn={btnStatusValue}
                />
                <div className="grid_box" ref={grid} />
              </div>
            </div>
          </div>
          <div className="align_right">
            <div className="sec_wrap_division">
              <div className="wrap_division_box">
                <div className="sec_wrap">
                  <div className="sec_header">
                    <div className="left_box">
                      <div className="sec_title">
                        <svg viewBox="0 0 24 24" className="ico_svg">
                          <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                        </svg>
                        <h3 className="title">
                          SR Link <em className="point_color">{radiology.arrLink.length}</em>
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="sec_content">
                    <div className="chart_box">
                      <div className="sr_box">
                        {radiology.arrLink !== null && radiology.arrLink.length > 0 ? (
                          <ul>
                            {radiology.arrLink.map((srLink, index) => (
                              <li key={srLink + index} className={`${radiology.link === srLink ? "is-on" : ""}`}>
                                <div onClick={() => setRadiology({ ...radiology, link: srLink })}>
                                  검사결과 {index + 1} <img src={IcLink} alt="" />
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="contents-empty">
                            <div>
                              <img src={ImgEmptyData} alt="" />
                              <span>SR Link 데이터가 존재하지 않습니다.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sec_wrap full_size">
                  <div className="sec_header">
                    <div className="left_box">
                      <div className="sec_title">
                        <svg viewBox="0 0 24 24" className="ico_svg">
                          <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                        </svg>
                        <h3 className="title">판독소견</h3>
                      </div>
                    </div>
                  </div>
                  <div className="sec_content">
                    <div className="chart_box">
                      <LUXTextArea
                        hintText="작성된 판독소견이 없습니다."
                        defaultValue={radiology.iptn_rslt ? radiology.iptn_rslt : ""}
                        fullWidth
                        onChange={e => setRadiology({ ...radiology, iptn_rslt: e.target.value })}
                        disabled={
                          Object.keys(selectedPatient).length === 0 ||
                          radiology.pacs_co_cd !== null ||
                          selectedPatient.prsc_prgr_stat_cd === "O" ||
                          bind
                        }
                        style={{ height: "100%" }}
                        rootStyle={{ height: "100%" }}
                        textAreaBoxStyle={{ height: "100%" }}
                        resize={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="wrap_division_box">
                <div className="sec_wrap full_size add_footer">
                  <div className="sec_header">
                    <div className="left_box">
                      <div className="sec_title">
                        <svg viewBox="0 0 24 24" className="ico_svg">
                          <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                        </svg>
                        <h3 className="title">검사결과</h3>
                        <button
                          type="button"
                          className="LUX_basic_btn Small Image basic"
                          onClick={() => window.open(`${globals.irm_sr}${radiology.link}`)}
                          disabled={Object.keys(selectedPatient).length === 0 || radiology.link === ""}
                        >
                          <svg viewBox="0 0 24 24" className="SN_svg">
                            <path d="M19.143,2H7.714C6.139,2,4.857,3.282,4.857,4.857C3.282,4.857,2,6.139,2,7.714v11.429C2,20.719,3.282,22,4.857,22h11.429 c1.575,0,2.857-1.281,2.857-2.857c1.575,0,2.857-1.281,2.857-2.857V4.857C22,3.282,20.718,2,19.143,2z M17.714,19.143 c0,0.788-0.641,1.429-1.429,1.429H4.857c-0.788,0-1.429-0.641-1.429-1.429V7.714c0-0.788,0.641-1.429,1.429-1.429h11.429 c0.788,0,1.429,0.641,1.429,1.429V19.143z M20.571,16.286c0,0.788-0.641,1.429-1.429,1.429v-10c0-1.575-1.282-2.857-2.857-2.857h-10 c0-0.788,0.641-1.429,1.429-1.429h11.429c0.788,0,1.429,0.641,1.429,1.429V16.286z M8.332,10.579h5.097v5.102H12v-2.676l-4.495,4.5 l-1.011-1.01l4.482-4.488H8.332V10.579z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="right_box">
                      <LUXButton
                        label="검사소견"
                        disabled={
                          Object.keys(selectedPatient).length === 0 ||
                          radiology.pacs_co_cd !== null ||
                          selectedPatient.prsc_prgr_stat_cd === "O" ||
                          bind
                        }
                        type="small"
                        onClick={() => setState({ ...state, isOpnn: true })}
                      />
                      <LUXButton
                        label="판독취소"
                        onClick={handleSaveCancle}
                        disabled={Object.keys(selectedPatient).length === 0 || radiology.pacs_co_cd !== null || bind}
                        type="small"
                      />
                      <LUXButton
                        label="최종판독"
                        onClick={handleInterpret}
                        disabled={Object.keys(selectedPatient).length === 0 || radiology.pacs_co_cd !== null || bind}
                        type="small"
                      />
                      <LUXButton
                        label="최종판독 취소"
                        onClick={handleInterpretCancle}
                        disabled={Object.keys(selectedPatient).length === 0 || radiology.pacs_co_cd !== null || bind}
                        type="small"
                      />
                      <LUXButton
                        label="CVR 보고"
                        onClick={handleCVR}
                        disabled={
                          Object.keys(selectedPatient).length === 0 || selectedPatient.prsc_prgr_stat_cd === "E" || bind
                        }
                        type="small"
                      />
                      <PacsButton
                        pid={Object.keys(selectedPatient).length > 0 ? selectedPatient.pid : ""}
                        pacsNo={radiology.pacs_no}
                        pacsCoCd={radiology.pacs_co_cd}
                      />
                    </div>
                  </div>
                  <div className="sec_content">
                    <div className="chart_box">
                      {radiology.link === "" ? (
                        <div className="contents-empty">
                          <div>
                            <img src={ImgEmptyData} alt="" />
                            <span>SR Link 데이터가 존재하지 않습니다.</span>
                          </div>
                        </div>
                      ) : (
                        <iframe title="SR" width="100%" height="100%" src={globals.irm_sr + radiology.link} />
                      )}
                    </div>
                  </div>
                  <div className="sec_footer">
                    <div className="option_box">
                      <LUXButton
                        label="이력관리"
                        onClick={() => setState({ ...state, isHistory: true })}
                        disabled={Object.keys(selectedPatient).length === 0}
                      />
                      <LUXButton
                        label="저장"
                        onClick={handleSave}
                        disabled={
                          Object.keys(selectedPatient).length === 0 ||
                          radiology.pacs_co_cd !== null ||
                          (selectedPatient.prsc_prgr_stat_cd === "M" &&
                            radiology.iptn_rslt === originRadio.iptn_rslt) ||
                          bind ||
                          selectedPatient.prsc_prgr_stat_cd === "O"
                        }
                        blue={
                          !(
                            Object.keys(selectedPatient).length === 0 ||
                            radiology.pacs_co_cd !== null ||
                            (selectedPatient.prsc_prgr_stat_cd === "M" &&
                              radiology.iptn_rslt === originRadio.iptn_rslt) ||
                            bind ||
                            selectedPatient.prsc_prgr_stat_cd === "O"
                          )
                        }
                      />
                      <LUXButton
                        label="출력"
                        onClick={handlePrint}
                        disabled={
                          Object.keys(selectedPatient).length === 0 || selectedPatient.prsc_prgr_stat_cd !== "O"
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 검사소견 */}
      <MSC_100100_P01
        opnnType="R"
        dialogOpen={state.isOpnn}
        onClose={() => setState({ ...state, isOpnn: false })}
        onCopy={({ exmn_opnn_cnts }) => {
          setRadiology({ ...radiology, iptn_rslt: exmn_opnn_cnts });
          setSnack({ open: true, type: "success", msg: Message.copySuccess });
        }}
      />

      {/* 이력관리 */}
      <HistoryDialog
        open={state.isHistory}
        prscClsfCd="R"
        onClose={() => setState({ ...state, isHistory: false })}
        exmnInfo={{ ...selectedPatient, cndt_dt: moment(selectedPatient.cndt_dt).format("YYYY-MM-DD") }}
      />

      {withPortal(
        <LUXConfirm
          useIcon
          useIconType="success"
          title={confirm.title}
          message={confirm.msg}
          open={confirm.open}
          cancelButton={() => {
            confirm.onCancel();
            setConfirm({ ...confirm, open: false });
          }}
          confirmButton={() => {
            confirm.onConfirm();
            setConfirm({ ...confirm, open: false });
          }}
          onClose={() => setConfirm({ ...confirm, open: false })}
        />,
        "dialog",
      )}
      {withPortal(
        <LUXSnackbar
          autoHideDuration={2000}
          message={snack.msg}
          onRequestClose={() => setSnack({ ...snack, open: false })}
          open={snack.open}
          type={snack.type}
        />,
        "snackbar",
      )}
      {withPortal(
        <LUXAlert
          open={alert.open}
          title={alert.title}
          message={alert.message}
          useIcon
          useIconType={alert.type}
          confirmButton={() => setAlert({ ...alert, open: false })}
          onClose={() => setAlert({ ...alert, open: false })}
        />,
        "dialog",
      )}
    </div>
  );
}

export default WithWrapper(MSC_040200);
