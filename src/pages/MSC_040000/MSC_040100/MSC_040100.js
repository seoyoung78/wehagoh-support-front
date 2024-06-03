import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

// util
import { date, lodash } from "common-util/utils";
import callApi from "services/apis";
import axios from "axios";
import moment from "moment";
import withPortal from "hoc/withPortal";
import getBadgeSvg from "services/utils/getBadgeSvg";
import Message from "components/Common/Message";
import {
  appendOnDataLoadComplated,
  configEmptySet,
  getUserGridColumnOption,
  isLastOnDataLoadComplated,
  removeOnDataLoadComplated,
  setUserGridColumnOption,
} from "services/utils/grid/RealGridUtil";
import { wrcnOpen } from "services/utils/wrcnPopupUtill";
import { globals } from "global";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";
import useLoadingStore from "services/utils/zustand/useLoadingStore";
import useNotiStore from "services/utils/zustand/useNotiStore";
import useAuthstore from "services/utils/zustand/useAuthStore";
import { getCookie } from "services/utils";

// common-ui-components
import { mstColumns, mstFields } from "./MSC_040100_MstGrid";
import { dtlColumns, dtlFields } from "./MSC_040100_DtlGrid";
import LUXButton from "luna-rocket/LUXButton";
import LUXSnackbar from "luna-rocket/LUXSnackbar";
import LUXConfirm from "luna-rocket/LUXDialog/LUXConfirm";
import { LUXAlert } from "luna-rocket/LUXDialog";
import LUXSplitButton from "luna-rocket/LUXSplitButton";
import { GridView, LocalDataProvider } from "realgrid";

import DoughnutChart from "components/Common/DoughnutChart";
import StateBtnGroup from "components/Common/StateBtnGroup";
import SearchInfo from "components/Common/SearchInfo";
import PrscDcDialog from "components/Common/PrscDcDialog";
import ReqPrscDialog from "components/Common/ReqPrscDialog";
import ScheduleDateDialog from "components/Common/ScheduleDateDialog";
import MemoDialog from "components/Common/MemoDialog";
import UnactgUncmplDialog from "components/Common/UnactgUncmplDialog";
import { ErrorLogInfo, MedicalRecord } from "cliniccommon-ui";
import PatientSummaryBar from "components/Common/PatientSummaryBar";

const defaultData = {
  exmn_hope_date: "",
  exmn_hope_dt: "",
  prsc_clsf_cd: "",
};

/**
 * @name 영상검사접수
 * @author 윤서영
 */

function MSC_040100() {
  const [state, setState] = useState({
    arrList: [], // 전체 목록

    isRecord: false, // 진료기록조회 상태
    isDc: false, // dc 요청 상태
    isPrsc: false, // 처방 요청 상태
  });

  const [isWrcn, setIsWrcn] = useState([false, false, false]);

  const searchRef = useRef(null);
  const patientRef = useRef(null);
  const unActRef = useRef(null);
  const wrcnButtonRef = useRef(null);
  const exmnButtonRef = useRef(null);

  // 조회조건
  const [search, setSearch] = useState({
    pid: "",
    exmn_hope_date: new Date(),
    hope_exrm_cd: [""],
  });

  const [arrDltData, setArrDtlData] = useState([]); // 검사 처방 목록

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

  const location = useLocation();

  /* grid area */
  // 접수현황 목록 그리드
  const mstGrid = useRef(null); // realgrid DOM
  const mstDataProvider = useRef(null);
  const mstGridView = useRef(null);

  // 검사처방 목록 그리드
  const dtlGrid = useRef(null);
  const dtlDataProvider = useRef(null);
  const dtlGridView = useRef(null);

  const [snack, setSnack] = useState({ open: false, type: "info", msg: "" }); // 스낵바 상태
  const [confirm, setConfirm] = useState({
    open: false,
    type: "info",
    title: "",
    msg: "",
    handleConfirmEvent: () => {},
  }); // confirm 상태
  const [alert, setAlert] = useState({ open: false, title: "", message: "", type: "info" }); // alert창 상태

  const [hsptInfo, setHsptInfo] = useState({}); // 병원정보
  const [pacsList, setPacsList] = useState([]); // PACS 목록

  const [schedule, setSchedule] = useState({
    open: false,
    data: [defaultData],
  }); // 검사예약 상태
  const [memo, setMemo] = useState({ open: false, data: "" }); // 처방메모 상태
  const [runStat, setRunStat] = useState(false); // API 실행 상태
  const [bind, setBind] = useState(false); // 통합환자 여부

  const { openLoading, closeLoading } = useLoadingStore(state => state);
  const { noti, resetNoti, checkNoti } = useNotiStore(state => state);
  const { getAuth } = useAuthstore(state => state);

  // 접수 그리드 필터
  const handleFilter = useCallback(() => {
    mstGridView.current.activateAllColumnFilters("prsc_prgr_stat_cd", false);
    if (btnStatusValue !== "0") {
      mstGridView.current.activateColumnFilters("prsc_prgr_stat_cd", btnStatusValue, true);
    }

    const index = mstGridView.current.searchItem({
      fields: ["pid", "rcpn_sqno", "prsc_date", "exmn_hope_date", "hope_exrm_cd"],
      values: [
        selectedPatient.pid,
        selectedPatient.rcpn_sqno,
        selectedPatient.prsc_date,
        selectedPatient.exmn_hope_date,
        selectedPatient.hope_exrm_cd,
      ],
    });

    if (Object.keys(selectedPatient).length === 0 || index < 0) {
      mstGridView.current.clearCurrent();
    }
  }, [btnStatusValue, selectedPatient]);

  // 상세 조회
  const handleDetail = async param => {
    dtlGridView.current.clearCurrent();
    await callApi(
      "/exam/selectPrscList",
      param ? { ...param, prsc_clsf_cd: "C2" } : { ...selectedPatient, prsc_clsf_cd: "C2" },
    ).then(({ resultCode, resultData }) => {
      setIsWrcn([false, false, false]);
      if (resultCode === 200 && resultData !== null) {
        setArrDtlData(resultData);
        dtlDataProvider.current.setRows(resultData);
      } else {
        setSnack({ open: true, msg: Message.networkFail, type: "warning" });
      }
    });
  };

  // 조회(돋보기 버튼) 클릭
  const handleSearch = async param => {
    const parameters = {
      pid: param ? param.pid : search.pid,
      exmn_hope_date: param ? date.getyyyymmdd(param.exmn_hope_date) : date.getyyyymmdd(search.exmn_hope_date),
      hope_exrm_cd: param
        ? param.hope_exrm_cd.filter(list => list !== "")
        : search.hope_exrm_cd.filter(list => list !== ""),
      prsc_clsf_cd: "C2",
    };

    await callApi("/exam/selectReceptionList", parameters).then(({ resultCode, resultData }) => {
      let snack = false;

      if (resultCode === 200 && resultData !== null) {
        mstDataProvider.current?.setRows(resultData);
      } else {
        snack = true;
        mstDataProvider.current?.clearRows();
      }
      setState({ ...state, arrList: resultData !== null ? resultData : [], isDc: false });
      setSnack({
        open: !resultData || resultData.length === 0 || snack,
        msg: resultCode === 200 ? Message.noSearch : Message.networkFail,
        type: resultCode === 200 ? "info" : "warning",
      });
      unActRef.current?.search();
    });
  };

  // SearchInfo 변경 이벤트 핸들러
  const handleChange = ({ type, value }) => {
    switch (type) {
      case "date":
        setSearch(prev => ({ ...prev, exmn_hope_date: value }));
        break;
      case "select":
        setSearch(prev => ({ ...prev, hope_exrm_cd: value }));
        break;
      case "text":
        setSearch(prev => ({ ...prev, pid: value === "" ? "" : prev.pid }));
        break;
      case "complete":
        setSearch(prev => {
          setBtnStatusValue("0");
          setSelectedPatient({});
          setArrDtlData([]);
          dtlDataProvider.current.clearRows();
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
      cdList: ["B", "C", "E"],
      date: date.getyyyymmdd(new Date()),
    };
    await callApi("/common/selectCommonCode", param)
      .then(({ resultData }) => {
        const arrResult = arrState.concat();

        resultData.map(list => {
          arrResult.push({
            code: list.cmcd_cd,
            name: list.cmcd_nm,
            color: list.cmcd_char_valu1,
            count: 0,
          });
        });
        setArrState(arrResult);

        mstGridView.current.setColumn({
          ...mstGridView.current.columnByName("prsc_prgr_stat_cd"),
          values: arrResult.map(item => item.code),
          labels: arrResult.map(item => item.name),
          renderer: {
            type: "image",
            imageCallback: (grid, dataCell) => {
              const dc = grid.getValue(dataCell.index.itemIndex, "dc_rqst_yn");
              for (const patientState of arrResult) {
                if (dataCell.value === patientState.code) {
                  return getBadgeSvg(dc === "Y" ? "D/C요청" : patientState.name, patientState.color);
                }
              }
            },
          },
        });

        dtlGridView.current.setColumn({
          ...dtlGridView.current.columnByName("prsc_prgr_stat_cd"),
          values: arrResult.map(item => item.code),
          labels: arrResult.map(item => item.name),
          renderer: {
            type: "image",
            imageCallback: (grid, dataCell) => {
              const dc = grid.getValue(dataCell.index.itemIndex, "dc_rqst_yn");
              const find = arrResult.find(list => list.code === dataCell.value);
              if (find) {
                return getBadgeSvg(dc === "Y" ? "D/C요청" : find.name, find.color);
              }
              return getBadgeSvg(arrResult[arrResult.length - 1].name, arrResult[arrResult.length - 1].color);
            },
          },
        });

        const filter = arrResult
          .filter(list => list.code !== "0")
          .map(list => ({ name: list.code, criteria: `value = '${list.code}'` }));
        mstGridView.current.setColumnFilters("prsc_prgr_stat_cd", filter);

        handleSearch(searchOption);
      })
      .catch(_e => {
        setSnack({ open: true, msg: Message.networkFail, type: "warning" });
      });
  };

  // 미시행 환자 선택
  const handleAdjust = data => {
    const param = {
      pid: data.pid,
      exmn_hope_date: new Date(data.exmn_hope_date),
      hope_exrm_cd: [data.hope_exrm_cd],
    };
    setSearch(param);
    handleSearch(param);
    handleDetail(data);
    setBtnStatusValue("0");
    setSelectedPatient(data);

    searchRef.current.setKeyword(data.pid + " " + data.pt_nm, data);
    searchRef.current.selectDept(data.hope_exrm_cd);
  };

  const setAfterUpdate = async msgtxt => {
    handleDetail();

    await handleSearch().then(() => {
      setSnack({ open: !!msgtxt, msg: msgtxt || "", type: "success" });
    });
  };

  // 동의서 버튼 클릭
  const handleWrcn = async code => {
    const checkItems = arrDltData.filter(
      (list, index) =>
        (list.prsc_prgr_stat_cd === "" || list.prsc_prgr_stat_cd === arrState[1].code) &&
        dtlGridView.current.getCheckedRows().includes(index),
    );

    if (dtlGridView.current.getCheckedRows().length === 0) {
      setSnack({ open: true, msg: Message.noCheck2, type: "info" });
    } else if (!getAuth(173) && code === "EMR_V_T0038") {
      setSnack({ open: true, msg: Message.noAuth, type: "error" });
    } else if (code === "EMR_V_T0038") {
      const patient = patientRef.current.getPatientInfo();

      // 처방의 별 팝업 호출
      const list = checkItems.reduce((acc, cur) => {
        if (acc[cur.prsc_dr_nm] !== undefined) {
          acc[cur.prsc_dr_nm] += "/" + cur.prsc_cd + "." + cur.prsc_nm;
        } else {
          acc[cur.prsc_dr_nm] = cur.prsc_cd + "." + cur.prsc_nm;
        }
        return acc;
      }, {});

      Object.keys(list).map(key => {
        const data = {
          pid: patient.pid,
          rcpn_no: selectedPatient.rcpn_sqno,
          pt_nm: patient.pt_nm_only,
          sex_cd: patient.sex_cd,
          pt_age: patient.ageWithUnit,
          dobr: patient.dobr,
          ap_nm: key,
          main_ilns_nm: list[key],
        };
        return wrcnOpen(code, data);
      });
    } else {
      const patient = patientRef.current.getPatientInfo();
      const data = {
        pid: patient.pid,
        rcpn_no: selectedPatient.rcpn_sqno,
        pt_nm: patient.pt_nm_only,
        sex_cd: patient.sex_cd,
        pt_age: patient.ageWithUnit,
        pt_addr: patient.addr,
        dobr: patient.dobr,
        prsc_nm: checkItems
          .filter(list => list.wrcn_wrtn_yn === "N")
          .map(list => list.prsc_nm)
          .join(", "),
      };

      wrcnOpen(code, data);
      await callApi("/exam/updatePrscStat", { type: "WrcnWrtn", detailsList: checkItems }).then(({ resultCode }) => {
        if (resultCode === 200) {
          handleDetail();
        }
      });
    }
  };

  // 검사진행알림 발송
  const handleProgressNoti = async () => {
    await callApi("/exam/sendPrgrProgressNoti", {
      exrmClsfCd: "R",
      deptSqno: selectedPatient.hope_exrm_cd,
    });
  };

  // 접수
  const handleReceipt = () => {
    if (runStat) return;

    const checkItems = arrDltData.filter(
      (list, index) =>
        (list.prsc_prgr_stat_cd === "" || list.prsc_prgr_stat_cd === arrState[1].code) &&
        dtlGridView.current.getCheckedRows().includes(index),
    );

    const check = checkItems.find(list => list.wrcn_wrtn_yn === "N");

    const snedApi = async () => {
      // 동의여부 알럿
      if (check) {
        setAlert({
          open: true,
          title: "영상검사 조영제 사용 동의 필요",
          message: Message.MSC_040100_noWrcn,
          type: "warning",
        });
      }

      if (checkItems.filter(list => list.wrcn_wrtn_yn !== "N").length > 0) {
        setRunStat(true);
        await callApi("/exam/updatePrscStat", {
          type: "Receipt",
          detailsList: checkItems.filter(list => list.wrcn_wrtn_yn !== "N"),
        })
          .then(({ resultCode, resultMsg }) => {
            if (resultCode === 200) {
              setAfterUpdate(check ? Message.partExmnSuccess : Message.receipt);
              handleProgressNoti();
            } else {
              setSnack({ open: true, msg: resultMsg, type: "error" });
            }
          })
          .finally(() => setRunStat(false));
      }
    };

    if (dtlGridView.current.getCheckedRows().length === 0) {
      setSnack({ open: true, msg: Message.noCheck2, type: "info" });
    } else if (checkItems.length === 0) {
      setSnack({ open: true, msg: Message.exmnPrgrFail, type: "error" });
    } else if (checkItems.find(list => list.dc_rqst_yn === "Y")) {
      setConfirm({
        open: true,
        title: "D/C요청 검사 접수",
        msg: Message.dcRaceiptBefore,
        handleConfirmEvent: () => snedApi(),
      });
    } else {
      snedApi();
    }
  };

  // 접수 취소
  const handleReceiptCancel = () => {
    if (runStat) return;

    const checkItems = arrDltData.filter(
      (list, index) =>
        list.prsc_prgr_stat_cd === arrState[2].code && dtlGridView.current.getCheckedRows().includes(index),
    );

    if (dtlGridView.current.getCheckedRows().length === 0) {
      setSnack({ open: true, msg: Message.noCheck2, type: "info" });
    } else if (checkItems.length === 0) {
      setSnack({ open: true, msg: Message.noReceiptCancel, type: "error" });
    } else {
      setConfirm({
        open: true,
        title: "영상검사 접수 취소",
        msg: Message.receiptCancelConfirm,
        handleConfirmEvent: async () => {
          // 검사 진행 상태 확인
          await callApi("/exam/selectExamCheck", { detailsList: checkItems }).then(({ resultCode, resultData }) => {
            if (resultCode === 200 && resultData) {
              if (resultData.filter(list => list.prsc_prgr_stat_cd === "C").length > 0) {
                (async () => {
                  await callApi("/exam/updatePrscStat", { type: "ReceiptCancel", detailsList: checkItems }).then(
                    ({ resultCode, resultMsg }) => {
                      if (resultCode === 200) {
                        setAfterUpdate(Message.receiptCancel);
                      } else {
                        setSnack({ open: true, msg: resultMsg, type: "error" });
                      }
                      setConfirm({ ...confirm, open: false });
                    },
                  );
                })();
              } else if (resultData.find(list => list.prsc_prgr_stat_cd === "O")) {
                setSnack({ open: true, msg: Message.rptgExistFail, type: "error" });
              } else {
                setSnack({ open: true, msg: Message.iptnExistFail, type: "error" });
              }
            } else {
              setSnack({ open: true, msg: Message.networkFail, type: "warning" });
            }
          });
        },
      });
    }
  };

  // IRM 접수
  const handleIRMReceipt = list => {
    list.map(item => {
      item.pacs_cd = "irm";
      // item.pacs_no = item.pacs_no || moment(item.prsc_date).format("YYYYMMDD") + item.pid + item.prsc_sqno;
      return item;
    });
    const patient = patientRef.current.getPatientInfo();
    const timeout = setTimeout(() => openLoading(Message.MSC_040100_sendPacs), 300);
    const cno = document.getElementById("h_selected_company_no").value || getCookie("h_selected_company_no");
    const organization_id = cno === "70173" ? "99999998" : cno === "6062771" ? "99999999" : hsptInfo.rcpr_inst_rgno; // 개발기:70173, 운영기:6062771

    Promise.allSettled(
      list.map(item => {
        const nexusParam = {
          organization_id, // 기관Id (부모그룹내 유일해야 함)
          accession_no: item.pacs_no, // 처방고유번호
          study_instance_uid: "",
          character_set: "",
          scheduled_modality: item.mdlt_dvcd, // (ex) CR,DX,CT,MR,US,OT, BMD etc.
          scheduled_aetitle: "", // 장비 AE Title
          scheduled_dttm: moment().format("YYYYMMDDHHmmss"), // yyyyMMddHHmmss (예약 촬영일시)
          perform_doctor: document.getElementById("h_user_name").value, // 시술의
          scheduled_proc_desc: item.prsc_nm, // 처방코드 명
          scheduled_action_codes: "",
          scheduled_proc_id: item.prsc_cd, // 처방코드, 수가코드
          scheduled_station: "",
          scheduled_location: "",
          premedication: "",
          contrast_agent: "",
          requested_proc_id: item.prsc_cd, // 처방코드, 수가코드
          requested_proc_reason: "",
          requested_proc_priority: "",
          patient_transport: "",
          requested_proc_comments: item.prsc_memo,
          requested_proc_desc: item.prsc_nm,
          requested_proc_codes: "",
          refer_doctor: patient.mdcr_dr_nm,
          request_doctor: item.prsc_dr_nm,
          request_department: patient.dept_hnm,
          imaging_request_dttm: moment().format("YYYYMMDDHHmmss"),
          isr_placer_order_no: "",
          isr_filler_order_no: "",
          admission_id: "",
          patient_location: "",
          patient_residency: "",
          consult_doctor: "",
          diagnosis: "",
          patient_name: patient.pt_nm_only,
          patient_id: patient.pid,
          other_patient_name: "",
          other_patient_id: "",
          patient_birth_date: patient.dobr,
          patient_sex: patient.sex_cd !== "U" ? patient.sex_cd : "O",
          patient_weight: "",
          patient_size: "",
          confidentiality: "",
          patient_state: "",
          pregnancy_status: "",
          medical_alerts: "",
          contrast_allergies: "",
          special_needs: "",
          patient_species: "",
          patient_breed: "",
        };
        return (async () => {
          await axios
            .post(`${globals.irm_url}/order`, nexusParam, {
              headers: {
                "X-API-TXID": hsptInfo.rcpr_inst_rgno + moment().format(),
                "Content-Type": "application/json; charset=UTF-8",
              },
            })
            .then(async response => {
              try {
                item.pacs_rcpn_yn = "Y";
                await callApi("/MSC_040000/saveConduct", { type: "Conduct", detailsList: [item] });
                return response;
              } catch (e) {
                return e;
              }
            });
        })();
      }),
    )
      .then(res => {
        const find = res.find(list => list.status === "rejected");
        if (find) {
          setSnack({ open: true, msg: Message.MSC_040100_pacsFail, type: "error" });
        } else {
          setAfterUpdate(
            list.find(item => item.wrcn_wrtn_yn === "N") !== undefined
              ? Message.partExmnSuccess
              : Message.exmnPrgrSuccess,
          );
        }
      })
      .finally(() => {
        closeLoading(false);
        clearTimeout(timeout);
      });
  };

  // IRM 접수 취소
  const handleIRMReceiptCancel = list => {
    const patient = patientRef.current.getPatientInfo();

    const timeout = setTimeout(() => openLoading(Message.MSC_040100_sendPacs), 300);

    const cno = document.getElementById("h_selected_company_no").value || getCookie("h_selected_company_no");
    const organization_id = cno === "70173" ? "99999998" : cno === "6062771" ? "99999999" : hsptInfo.rcpr_inst_rgno; // 개발기:70173, 운영기:6062771

    Promise.allSettled(
      list.map(item => {
        const nexusParam = {
          organization_id, // 기관Id (부모그룹내 유일해야 함)
          accession_no: item.pacs_no, // 처방고유번호
          study_instance_uid: "",
          character_set: "",
          scheduled_modality: item.mdlt_dvcd, // (ex) CR,DX,CT,MR,US,OT, BMD etc.
          scheduled_aetitle: "", // 장비 AE Title
          scheduled_dttm: moment().format("YYYYMMDDHHmmss"), // yyyyMMddHHmmss (예약 촬영일시)
          perform_doctor: document.getElementById("h_user_name").value, // 시술의
          scheduled_proc_desc: item.prsc_nm, // 처방코드 명
          scheduled_action_codes: "",
          scheduled_proc_id: item.prsc_cd, // 처방코드, 수가코드
          scheduled_station: "",
          scheduled_location: "",
          premedication: "",
          contrast_agent: "",
          requested_proc_id: item.prsc_cd, // 처방코드, 수가코드
          requested_proc_reason: "",
          requested_proc_priority: "",
          patient_transport: "",
          requested_proc_comments: item.prsc_memo,
          requested_proc_desc: item.prsc_nm,
          requested_proc_codes: "",
          refer_doctor: patient.mdcr_dr_nm,
          request_doctor: item.prsc_dr_nm,
          request_department: patient.dept_hnm,
          imaging_request_dttm: moment().format("YYYYMMDDHHmmss"),
          isr_placer_order_no: "",
          isr_filler_order_no: "",
          admission_id: "",
          patient_location: "",
          patient_residency: "",
          consult_doctor: "",
          diagnosis: "",
          patient_name: patient.pt_nm_only,
          patient_id: patient.pid,
          other_patient_name: "",
          other_patient_id: "",
          patient_birth_date: patient.dobr,
          patient_sex: patient.sex_cd !== "U" ? patient.sex_cd : "O",
          patient_weight: "",
          patient_size: "",
          confidentiality: "",
          patient_state: "",
          pregnancy_status: "",
          medical_alerts: "",
          contrast_allergies: "",
          special_needs: "",
          patient_species: "",
          patient_breed: "",
        };
        return (async () => {
          await axios
            .delete(globals.irm_url + "/order", {
              headers: {
                "X-API-TXID": hsptInfo.rcpr_inst_rgno + moment().format(),
                "Content-Type": "application/json; charset=UTF-8",
              },
              data: nexusParam,
            })
            .then(async response => {
              try {
                const detailsList = list.map(item => {
                  item.pacs_rcpn_yn = "N";
                  return item;
                });
                await callApi("/MSC_040000/saveConduct", { type: "ConductCancel", detailsList });
                return response;
              } catch (e) {
                return e;
              }
            });
        })();
      }),
    )
      .then(res => {
        const find = res.find(list => list.status === "rejected");
        if (find) {
          setSnack({ open: true, msg: Message.MSC_040100_pacsFail, type: "error" });
        } else {
          setAfterUpdate(Message.cnclExmnPrgrSuccess);
        }
      })
      .finally(() => {
        closeLoading(false);
        clearTimeout(timeout);
      });
  };

  // 검사 접수/검사취소
  const handleSave = async (type, list, snack) => {
    await callApi("/MSC_040000/saveConduct", {
      type,
      detailsList: list,
    }).then(({ resultCode, resultMsg }) => {
      if (resultCode === 200) {
        !snack && setAfterUpdate(Message.exmnPrgrSuccess);
        type === "Conduct" && handleProgressNoti();
      } else {
        setSnack({ open: true, msg: resultMsg, type: "error" });
      }
    });
  };

  // PACS 접수 여부 확인
  const handlePacsCheck = (pacs, list) => {
    if (pacsList.length > 0 && pacs) {
      if (pacs === "irm") {
        handleIRMReceipt(list);
      } else if (pacs === "infinitt") {
        handleSave(
          "Conduct",
          list.map(list => {
            list.pacs_cd = "infinitt";
            list.pacs_rcpn_yn = "N";
            return list;
          }),
        );
      } else {
        setSnack({ open: true, msg: Message.noAction, type: "info" });
      }
    } else {
      handleSave(
        "Conduct",
        list.map(list => {
          list.pacs_cd = null;
          list.pacs_rcpn_yn = null;
          return list;
        }),
      );
    }
  };

  // 검사
  const handleConduct = pacs => {
    if (runStat) return;

    const checkItems = arrDltData.filter(
      (list, index) =>
        list.prsc_prgr_stat_cd === arrState[2].code && dtlGridView.current.getCheckedRows().includes(index),
    );

    if (dtlGridView.current.getCheckedRows().length === 0) {
      setSnack({ open: true, msg: Message.noCheck2, type: "info" });
    } else if (checkItems.length === 0) {
      setSnack({ open: true, msg: Message.exmnPrgrFail, type: "error" });
    } else {
      handlePacsCheck(pacs, checkItems);
    }
  };

  // 검사취소
  const handleConductCancel = () => {
    if (runStat) return;

    const checkItems = arrDltData.filter(
      (list, index) =>
        list.prsc_prgr_stat_cd === arrState[3].code && dtlGridView.current.getCheckedRows().includes(index),
    );

    if (dtlGridView.current.getCheckedRows().length === 0) {
      setSnack({ open: true, msg: Message.noCheck2, type: "info" });
    } else if (checkItems.length === 0) {
      setSnack({ open: true, msg: Message.cnclExmnPrgrFail, type: "error" });
    } else {
      setConfirm({
        open: true,
        title: "영상검사 검사 취소",
        msg: Message.completeCancelConfirm,
        handleConfirmEvent: async () => {
          // 검사 진행 상태 확인
          await callApi("/exam/selectExamCheck", { detailsList: checkItems }).then(({ resultCode, resultData }) => {
            if (resultCode === 200 && resultData) {
              if (resultData.filter(list => list.prsc_prgr_stat_cd === "E").length > 0) {
                const finalList = checkItems.filter(list =>
                  resultData.find(res => res.prsc_prgr_stat_cd === "E" && res.prsc_sqno === list.prsc_sqno),
                );

                //IRM 접수 목록
                const itemIRM = finalList.filter(data => data.pacs_cd === "irm");
                if (itemIRM.length > 0) {
                  handleIRMReceiptCancel(itemIRM);
                }

                // 인터페이스 외 접수 목록
                const item = finalList.filter(data => data.pacs_cd !== "irm");
                if (item.length > 0) {
                  handleSave(
                    "ConductCancel",
                    checkItems.filter(list => list.pacs_cd !== "irm"),
                    itemIRM.length > 0,
                  ).finally(() => setConfirm({ ...confirm, open: false }));
                }
              } else if (resultData.find(list => list.prsc_prgr_stat_cd === "O")) {
                setSnack({ open: true, msg: Message.rptgExistFail, type: "error" });
              } else {
                setSnack({ open: true, msg: Message.iptnExistFail, type: "error" });
              }
            } else {
              setSnack({ open: true, msg: Message.networkFail, type: "warning" });
            }
          });
        },
      });
    }
  };

  // DC 요청
  const handleDc = () => {
    const checkItems = arrDltData.filter(
      (list, index) =>
        (list.prsc_prgr_stat_cd === "" || list.prsc_prgr_stat_cd === arrState[1].code) &&
        dtlGridView.current.getCheckedRows().includes(index),
    );

    if (dtlGridView.current.getCheckedRows().length === 0) {
      setSnack({ open: true, msg: Message.noCheck2, type: "info" });
    } else if (checkItems.length === 0) {
      setAlert({
        open: true,
        title: "영상검사 DC 불가",
        message: Message.noReceptionDc,
        type: "warning",
      });
    } else if (checkItems.every(list => list.dc_rqst_yn === "Y")) {
      setSnack({ open: true, msg: Message.alreadyDc, type: "error" });
    } else {
      setState({ ...state, isDc: true });
    }
  };

  // 검사 예약일
  const handleSchedule = () => {
    setSchedule({ ...schedule, open: false });
    setAfterUpdate().then(() => {
      if (dtlGridView.current.getJsonRows().length === 0) {
        setSelectedPatient({});
      }
    });
  };

  useEffect(() => {
    (async () => {
      await Promise.all([callApi("/common/selectPacsList"), callApi("/common/selectHspInfo")])
        .then(result => {
          result[0].resultData.map(list => {
            list.key = list.pacs_cd;
            list.value = list.pacs_co_nm;
          });
          setPacsList(result[0].resultData);
          setHsptInfo(result[1].resultData || {});
        })
        .catch(_e => ErrorLogInfo());
    })();

    const mstContainer = mstGrid.current;
    const mstDataSource = new LocalDataProvider(true);
    const mstGv = new GridView(mstContainer);

    mstGv.setDataSource(mstDataSource);
    mstDataSource.setFields(mstFields);
    mstGv.setColumns(mstColumns);
    mstGv.setDisplayOptions({
      fitStyle: "even", // 그리드 가로 영역 채우기
      selectionStyle: "rows",
    });

    mstGv.rowIndicator.visible = false;
    mstGv.footer.visible = false;
    mstGv.checkBar.visible = false;
    mstGv.stateBar.visible = false;
    mstGv.editOptions.editable = false;
    mstGv.setFilteringOptions({ enabled: false });
    mstGv.pasteOptions.enabled = false;
    mstGv.setCopyOptions({ copyDisplayText: true, singleMode: true });

    // 컨텍스트 메뉴 설정
    mstGv.onContextMenuPopup = (grid, _x, _y, clickData) => {
      let contextList = [{ label: "엑셀" }];
      if (clickData.cellType !== "gridEmpty" && grid.getValue(clickData.itemIndex, "prsc_prgr_stat_cd") === "B") {
        contextList.push({ label: "예약" });
      }
      grid.setContextMenu(contextList);
    };
    mstGv.onContextMenuItemClicked = (grid, item) => {
      if (item.label === "엑셀") {
        grid.exportGrid({
          type: "excel",
          target: "local",
          fileName: "영상검사 접수목록" + moment().format("YYMMDDhhmmss"),
        });
      } else if (item.label === "예약") {
        setSchedule({ open: true, data: dtlGridView.current.getJsonRows() });
      }
    };

    configEmptySet(mstGv, mstContainer, Message.noSearch);
    mstDataSource.setRows([]);

    mstDataProvider.current = mstDataSource;
    mstGridView.current = mstGv;

    const dtlContainer = dtlGrid.current;
    const dtlDataSource = new LocalDataProvider(true);
    const dtlGv = new GridView(dtlContainer);

    dtlGv.setDataSource(dtlDataSource);
    dtlDataSource.setFields(dtlFields);
    dtlGv.setColumns(dtlColumns);
    dtlGv.setDisplayOptions({
      fitStyle: "even", // 그리드 가로 영역 채우기
      selectionStyle: "rows",
    });

    configEmptySet(dtlGv, dtlContainer, Message.noData);
    dtlDataSource.setRows([]);

    dtlGv.checkBar.visible = true;
    dtlGv.checkBar.syncHeadCheck = true;
    dtlGv.rowIndicator.visible = false;
    dtlGv.footer.visible = false;
    dtlGv.stateBar.visible = false;
    dtlGv.editOptions.editable = false;
    dtlGv.pasteOptions.enabled = false;
    dtlGv.setCopyOptions({ copyDisplayText: true, singleMode: true });

    // 처방메모
    dtlGv.onCellItemClicked = (_grid, _index, clickData) => {
      if (clickData.type === "icon" && clickData.column === "prsc_memo") {
        setMemo({ open: true, data: clickData.value });
      }
    };

    // 동의서 버튼 상태
    dtlGv.onItemChecked = grid => {
      let buttonCheck = false;
      let wrcnCheck = false;
      grid.getCheckedItems().map(index => {
        const values = grid.getValues(index);
        if (values.wrcn_wrtn_yn === "N") {
          wrcnCheck = true;
        }
        if (values.prsc_prgr_stat_cd === "B") {
          buttonCheck = true;
        }
      });
      setIsWrcn([buttonCheck, wrcnCheck, buttonCheck]);
    };
    dtlGv.onItemAllChecked = grid => {
      let buttonCheck = false;
      let wrcnCheck = false;
      grid.getCheckedItems().map(index => {
        const values = grid.getValues(index);
        if (values.wrcn_wrtn_yn === "N") {
          wrcnCheck = true;
        }
        if (values.prsc_prgr_stat_cd === "B") {
          buttonCheck = true;
        }
      });
      setIsWrcn([buttonCheck, wrcnCheck, buttonCheck]);
    };

    // 컨텍스트 메뉴 설정
    getUserGridColumnOption(dtlGv, "MSC_040100_DtlGrid", dtlColumns, "visible");

    dtlGv.onContextMenuPopup = (grid, _x, _y, clickData) => {
      let contextList = [{ label: "엑셀" }];

      if (clickData.cellType !== "gridEmpty" && grid.getValue(clickData.itemIndex, "prsc_prgr_stat_cd") === "B") {
        contextList.push({ label: "예약" });
      }

      let menuList = [];

      dtlColumns.map(column => {
        if (column.contextVisibility) {
          menuList.push({
            label: column.header,
            type: "check",
            checked: grid.columnByName(column.name).visible,
            name: column.name,
          });
        }
      });

      if (menuList.length > 0) {
        contextList.push({ label: "컬럼", children: menuList });
      }

      grid.setContextMenu(contextList);
    };
    dtlGv.onContextMenuItemClicked = (grid, item) => {
      if (item.label === "엑셀") {
        grid.exportGrid({
          type: "excel",
          target: "local",
          fileName: "영상검사 처방목록" + moment().format("YYMMDDhhmmss"),
        });
      } else if (item.label === "예약") {
        setSchedule({ open: true, data: [grid.getValues(grid.getCurrent().itemIndex)] });
      } else {
        grid.columnByName(item.name).visible = item.checked;
        setUserGridColumnOption("MSC_040100_DtlGrid", item.name, "visible", item.checked);
      }
    };

    dtlDataProvider.current = dtlDataSource;
    dtlGridView.current = dtlGv;

    return () => {
      mstDataSource.clearRows(); // provider
      mstGv.destroy(); // gridView
      mstDataSource.destroy();

      dtlDataSource.clearRows(); // provider
      dtlGv.destroy(); // gridView
      dtlDataSource.destroy();

      mstDataProvider.current = null;
      mstGridView.current = null;
      dtlDataProvider.current = null;
      dtlGridView.current = null;
    };
  }, []);

  useEffect(() => {
    mstGridView.current.onSelectionChanged = (grid, selection) => {
      const values = grid.getValues(selection.startRow);
      if (
        !(
          Object.keys(selectedPatient).length > 0 &&
          selectedPatient.pid === values.pid &&
          selectedPatient.rcpn_sqno === values.rcpn_sqno &&
          selectedPatient.exmn_hope_date === values.exmn_hope_date &&
          selectedPatient.hope_exrm_cd === values.hope_exrm_cd
        )
      ) {
        setRunStat(false);
        setSelectedPatient(values);
        handleDetail(values);
      }
    };
  }, [selectedPatient]);

  useEffect(() => {
    handleFilter();
  }, [btnStatusValue]);

  useEffect(() => {
    if (!isLastOnDataLoadComplated(mstGridView.current)) {
      removeOnDataLoadComplated(mstGridView.current);
    }
    appendOnDataLoadComplated(mstGridView.current, () => handleFilter());
  }, [handleFilter]);

  // 메인 그리드 데이터 count 추가
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

  // 통합환자 시 그리드 체크박스 활성화 여부
  useEffect(() => {
    if (bind) {
      dtlGridView.current.setCheckableCallback(() => false);
      dtlGridView.current.setCheckBar({ showAll: false });
    } else {
      dtlGridView.current.resetCheckables(true);
      dtlGridView.current.setCheckBar({ showAll: true });
    }
  }, [bind]);

  useEffect(() => {
    if (noti && checkNoti()) {
      handleSearch().finally(() => resetNoti());
    }
  }, [noti]);

  return (
    <div className="MSC_040100 dp_full">
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
            handleBind={stat => setBind(stat)}
            pageId="MSC_040100"
          />
          <div className="right_box">
            <LUXButton
              label="진료기록조회"
              type="small"
              onClick={() => setState({ ...state, isRecord: true })}
              disabled={Object.keys(selectedPatient).length === 0}
            />
          </div>
        </div>
        <div className="align_split">
          <div className="align_left" style={{ width: "450px" }}>
            <div className="sec_wrap">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">영상검사 접수 현황</h3>
                  </div>
                </div>
                <div className="right_box">
                  {/* 미시행 */}
                  <UnactgUncmplDialog
                    onAdjust={handleAdjust}
                    prscClsfCd="C2"
                    hopeExrmDeptSqnoList={search.hope_exrm_cd}
                    stateList={arrState}
                    ref={unActRef}
                  />
                </div>
              </div>
              <div className="sec_content">
                <SearchInfo
                  exrmClsfCd="R"
                  date={search.exmn_hope_date}
                  ref={searchRef}
                  handleChange={handleChange}
                  handleSearch={() => {
                    setBtnStatusValue("0");
                    setSelectedPatient({});
                    setArrDtlData([]);
                    dtlDataProvider.current.clearRows();
                    handleSearch();
                  }}
                  onDeptListLoaded={e => {
                    const searchOption = { ...search, hope_exrm_cd: e };
                    if (location.state) {
                      searchOption.exmn_hope_date = new Date(location.state.exmn_hope_date);
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
                  onClickStateBtnGrp={e => setBtnStatusValue(e)}
                  strSelectedStateBtn={btnStatusValue}
                />
                <div className="grid_box" ref={mstGrid} />
                <ScheduleDateDialog
                  open={schedule.open}
                  data={schedule.data}
                  ptInfo={selectedPatient}
                  onClose={() => setSchedule({ open: false, data: [defaultData] })}
                  onSave={handleSchedule}
                />
              </div>
            </div>
          </div>
          <div className="align_right">
            <div className="sec_wrap full_size">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">검사 처방 목록</h3>
                  </div>
                </div>
                <div className="right_box">
                  <LUXSplitButton
                    size="s"
                    value={[
                      { key: 0, value: "동의서/기록지" },
                      { key: "EMR_V_T0017", value: "일반 CT 조영제 사용 동의서", disabled: !isWrcn[1] },
                      { key: "EMR_V_T0019", value: "심장 CT Angio 사용 동의서", disabled: !isWrcn[1] },
                      { key: "EMR_V_T0038", value: "MRI 검사전 환자평가서", disabled: !isWrcn[2] },
                    ]}
                    position="right"
                    onTouchTap={(e, key) => {
                      if (key !== 0) {
                        handleWrcn(key);
                      } else {
                        wrcnButtonRef.current.handleTouchTapMore();
                      }
                    }}
                    disabled={arrDltData.length === 0 || !isWrcn[0] || bind}
                    ref={wrcnButtonRef}
                  />
                  <LUXButton
                    label="접수"
                    onClick={handleReceipt}
                    disabled={arrDltData.length === 0 || bind}
                    type="small"
                  />
                  <LUXButton
                    label="접수취소"
                    onClick={handleReceiptCancel}
                    disabled={arrDltData.length === 0 || bind}
                    type="small"
                  />
                  {pacsList.length > 1 ? (
                    <LUXSplitButton
                      size="s"
                      value={[{ key: 0, value: "검사", disabled: true }].concat(pacsList)}
                      onTouchTap={(_e, key) => {
                        if (key !== 0) {
                          handleConduct(key);
                        } else {
                          exmnButtonRef.current.handleTouchTapMore();
                        }
                      }}
                      disabled={arrDltData.length === 0 || bind}
                      ref={exmnButtonRef}
                    />
                  ) : (
                    <LUXButton
                      label="검사"
                      onClick={() => {
                        if (pacsList.length === 1) {
                          handleConduct(pacsList[0].key);
                        } else {
                          handleConduct();
                        }
                      }}
                      disabled={arrDltData.length === 0 || bind}
                      type="small"
                    />
                  )}
                  <LUXButton
                    label="검사취소"
                    onClick={handleConductCancel}
                    disabled={arrDltData.length === 0 || bind}
                    type="small"
                  />
                  <LUXButton
                    label="DC요청"
                    onClick={handleDc}
                    disabled={arrDltData.length === 0 || bind}
                    type="small"
                  />
                  <LUXButton
                    label="처방요청"
                    onClick={() => setState({ ...state, isPrsc: true })}
                    disabled={arrDltData.length === 0 || bind}
                    type="small"
                  />
                </div>
              </div>
              <div className="sec_content">
                <div className="grid_box" ref={dtlGrid} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 진료기록조회 팝업 */}
      {state.isRecord &&
        withPortal(
          <MedicalRecord
            open={state.isRecord}
            close={() => setState({ ...state, isRecord: false })}
            pid={Object.keys(selectedPatient).length > 0 ? selectedPatient.pid : ""}
          />,
          "dialog",
        )}

      {/* 처방 메모 */}
      <MemoDialog
        title="처방메모"
        handleMemoDialogClose={() => setMemo({ ...memo, open: false })}
        open={memo.open}
        data={memo.data}
      />

      {/* 처방 DC 요청 */}
      <PrscDcDialog
        open={state.isDc}
        handleClose={() => {
          setState({ ...state, isDc: false });
          dtlGridView.current.setAllCheck(false);
        }}
        ptInfo={selectedPatient}
        dcList={arrDltData.filter(
          (list, index) =>
            list.prsc_prgr_stat_cd === arrState[1].code &&
            dtlGridView.current.getCheckedRows().includes(index) &&
            list.dc_rqst_yn !== "Y",
        )}
        handleSave={setAfterUpdate}
        exrmClsfCd="R"
      />
      {/* 처방 요청 */}
      <ReqPrscDialog
        open={state.isPrsc}
        setOpen={e => setState({ ...state, isPrsc: e })}
        patient={selectedPatient}
        exrmClsfCd="R"
      />

      {withPortal(
        <LUXConfirm
          useIcon
          useIconType="success"
          title={confirm.title}
          message={confirm.msg}
          open={confirm.open}
          cancelButton={() => setConfirm({ ...confirm, open: false })}
          confirmButton={() => {
            confirm.handleConfirmEvent();
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

export default WithWrapper(MSC_040100);
