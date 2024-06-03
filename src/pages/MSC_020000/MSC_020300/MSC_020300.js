import React, { useCallback, useEffect, useRef, useState } from "react";

// util
import callApi from "services/apis";
import moment from "moment";
import getBadgeSvg from "services/utils/getBadgeSvg";
import { GridFitStyle, GridView, LocalDataProvider, RowState, SelectionStyle } from "realgrid";
import { setLocalStorageItem } from "services/utils/localStorage";
import { windowOpen } from "services/utils/popupUtil";
import { MSC020300MstColumns, MSC020300MstFields } from "pages/MSC_020000/MSC_020300/MSC_020300_MstGrid";
import { MSC020300DtlColumns, MSC020300DtlFields } from "pages/MSC_020000/MSC_020300/MSC_020300_DtlGrid";
import Message from "components/Common/Message";
import withPortal from "hoc/withPortal";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";
import {
  appendOnDataLoadComplated,
  configEmptySet,
  isLastOnDataLoadComplated,
  removeOnDataLoadComplated,
} from "services/utils/grid/RealGridUtil";
import { ErrorLogInfo } from "cliniccommon-ui";
import { cursorWaitStyle } from "services/utils/styleUtil";
import {
  chckCVR,
  compareExmnRcpn,
  convertString,
  notifyAsync,
  padValue,
  runCascade,
  sCopyObj,
  useManagedPromise,
  validateValue,
} from "../utils/MSC_020000Utils";
import useAuthstore from "services/utils/zustand/useAuthStore";
import useNotiStore from "services/utils/zustand/useNotiStore";
import useLoadingStore from "services/utils/zustand/useLoadingStore";
import { signApi } from "services/apis/signApi";

// common-ui-components
import UnactgUncmplDialog from "components/Common/UnactgUncmplDialog";
import { LUXAlert, LUXButton, LUXConfirm, LUXSnackbar } from "luna-rocket";
import SearchInfo from "components/Common/SearchInfo";
import StateBtnGroup from "components/Common/StateBtnGroup";
import DoughnutChart from "components/Common/DoughnutChart";
import TxtRsltDialog from "components/Common/TxtRsltDialog";
import HistoryDialog from "components/Common/HistoryDialog";
import PatientSummaryBar from "components/Common/PatientSummaryBar";
import MSC100100P01 from "pages/MSC_100100/MSC_100100_P01";

// css
import "assets/style/MSC_020300.scss";
import { useLocation } from "react-router-dom";

// imgs

/**
 * @name 진단검사결과
 * @author 강현구A
 * @typedef {"aborted"|"success"|"failed"} Response
 */
function MSC_020300() {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const mstRealgridElement = useRef(null);
  const dtlRealgridElement = useRef(null);
  const [btnStatusValue, setBtnStatusValue] = useState("0");
  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "info",
    message: "",
  });
  const [confirm, setConfirm] = useState({
    open: false,
    type: "success",
    titleMessage: "",
    contentsMessage: "",
    afterConfirmFunction: undefined,
    afterCancelFunction: undefined,
  });
  const [alert, setAlert] = useState({
    type: "info",
    open: false,
    title: "",
    message: "",
  });
  /** @type {{current : GridView}} */
  const mstGridViewRef = useRef();
  /** @type {{current : GridView}} */
  const dtlGridViewRef = useRef();
  const searchInfoRef = useRef();
  const patientInfoRef = useRef();
  const [txtRsltDialog, setTxtRsltDialog] = useState({
    open: false,
    data: "",
    title: "",
  });
  const [exmnOpnnOpen, setExmnOpnnOpen] = useState(false);
  const unactgUncmplDialogRef = useRef();
  const [hstrDialog, setHstrDialog] = useState({
    open: false,
    exmnInfo: null,
  });
  const [bindPt, setBindPt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const noti = useNotiStore(state => state.noti);
  const resetNoti = useNotiStore(state => state.resetNoti);
  const checkNoti = useNotiStore(state => state.checkNoti);
  const [isSearchSuccess, setSearchSuccess] = useState(false);

  const [state, setState] = useState({
    deptData: [
      {
        text: "전체",
        value: "",
        exrm_clsf_cd: "",
      },
    ],
    mstStateList: [
      {
        code: "0",
        name: "전체",
        color: "#FFFFFF",
        count: 0,
      },
    ],
    toDate: new Date(),
    fromDate: new Date(),
    deptList: [],
    patientCompleted: null,
    lastSearchParam: null,
    selectedMst: null,
    focusedExmn: null,
    noUpdated: true,
  });

  const { getAuth } = useAuthstore(state => state);
  const location = useLocation();

  const { openLoading, closeLoading } = useLoadingStore(state => state);

  const editValueRef = useRef("");
  /* ================================================================================== */
  /* 함수(function) 선언 */

  const handleIptnRsltErr = code => {
    switch (code) {
      case 431:
        setSnackbar({
          open: true,
          type: "error",
          message: Message.MSC_020000_NmvlExdErr,
        });
        break;
      case 432:
        setSnackbar({
          open: true,
          type: "error",
          message: Message.MSC_020000_NmvlRsltFrmtErr,
        });
        break;
      default:
        setSnackbar({
          open: true,
          type: "warning",
          message: Message.networkFail,
        });
    }
  };

  /**
   * 현재 업데이트중인 DTL 행 저장 비동기 함수.
   * @author 강현구A
   * @returns {ManagedPromise}
   */
  const [saveUpdatedMp] = useManagedPromise(
    onFinished =>
      new Promise(
        /**
         * @param {(result:["aborted"|"success"|"failed", any, (any) =>void])=>void} resolve
         */
        resolve => {
          const dtlGridView = dtlGridViewRef.current;
          dtlGridView.commitEditor(true, true);
          const dataProvider = dtlGridView.getDataSource();
          const updatedRowIdxList = dataProvider.getStateRows(RowState.UPDATED);
          if (updatedRowIdxList.length < 1) {
            resolve(["aborted", null, onFinished]);
            return;
          }
          const saveRows = updatedRowIdxList.reduce((acc, value) => {
            const updatedRow = dataProvider.getJsonRow(value);
            for (const dstRow of dataProvider.getJsonRows()) {
              if (dstRow.exmn_cd === updatedRow.exmn_cd && dstRow.spcm_no === updatedRow.spcm_no) {
                acc.push({
                  exmn_rslt_valu: dstRow.exmn_rslt_valu,
                  txt_rslt_valu: dstRow.txt_rslt_valu,
                  exmn_item_rmrk_cnts: dstRow.exmn_item_rmrk_cnts,
                  spcm_no: dstRow.spcm_no,
                  exmn_cd: dstRow.exmn_cd,
                });
              }
            }
            return acc;
          }, []);
          setConfirm({
            open: true,
            type: "success",
            titleMessage: "결과입력 나가기",
            contentsMessage: Message.saveCheckConfirm,
            afterConfirmFunction: () => {
              callApi("/MSC_020300/iptnRslt", { mslcMapList: saveRows })
                .then(({ resultCode }) => {
                  if (resultCode !== 200) {
                    resolve(["failed", resultCode, onFinished]);
                    return;
                  }
                  resolve(["success", saveRows, onFinished]);
                })
                .catch(() => {
                  resolve(["failed", null, onFinished]);
                });
            },
            afterCancelFunction: () => resolve(["aborted", null, onFinished]),
            afterCloseFunction: () => resolve(["aborted", null, onFinished]),
          });
        },
      ),
    /**
     * @param {["aborted"|"success"|"failed", any, (any) =>void]}
     */
    ([resultState, data, onFinished]) => {
      if (resultState === "success") {
        const dataProvider = dtlGridViewRef.current.getDataSource();
        //성공시 UPDATE상태 풀어주기.
        for (let i = 0; i < dataProvider.getRowCount(); i++) {
          const dtlRow = dataProvider.getJsonRow(i);
          for (const row of data) {
            if (row.spcm_no === dtlRow.spcm_no && row.exmn_cd === dtlRow.exmn_cd) {
              dataProvider.setRowState(i, RowState.NONE, true);
            }
          }
        }
      } else if (resultState === "failed") {
        handleIptnRsltErr(data);
      }
      onFinished(resultState !== "failed");
    },
  );

  /**
   * MST 그리드 선택 프로미스. 성공시 dtl과 onSelection 리스너 갱신됨.
   * @author khgkjg12 강현구A
   * @typedef {( param : {
   * rcpn_no: string;
   * cndt_dy: string;
   * hope_exrm_dept_sqno: long;
   * }, onFinished: (any)=>void)=>void } loadDtlMp MST선택 비동기 함수.
   * @type {[loadDtlMp]}
   */
  const [loadDtlMp] = useManagedPromise(
    async (param, onFinished) => {
      const spcmNoSet = mstGridViewRef.current
        .getDataSource()
        .getJsonRows()
        .find(
          row =>
            row.cndt_dy === param.cndt_dy &&
            row.hope_exrm_dept_sqno === param.hope_exrm_dept_sqno &&
            row.rcpn_no === param.rcpn_no,
        )
        ?.spcm_no_set?.split(",");
      if (!spcmNoSet || spcmNoSet.length < 1) return [false, param, null, onFinished];
      try {
        const { resultCode, resultData } = await callApi("/MSC_020300/rtrvExmnRsltList", {
          mslcStringList: spcmNoSet,
        });
        if (resultCode !== 200) throw new Error();
        return [true, param, resultData, onFinished];
      } catch (e) {
        return [false, param, null, onFinished];
      }
    },
    ([isSuccess, param, resultData, onFinished]) => {
      if (!isSuccess) {
        setSnackbar({
          open: true,
          message: Message.networkFail,
          type: "warning",
        });
        onFinished(false);
        return;
      }
      const mstGridView = mstGridViewRef.current;
      const dtlGridView = dtlGridViewRef.current;
      const dtlDataProvider = dtlGridView.getDataSource();

      const updatedList = dtlDataProvider.getStateRows(RowState.UPDATED).map(e => dtlDataProvider.getJsonRow(e));

      dtlDataProvider.setRows(resultData);
      const lastDtlData = resultData;

      const remainIdxs = [];
      const remainVals = [];

      const nextData = dtlDataProvider.getJsonRows();

      for (const updatedRow of updatedList) {
        for (let j = 0; j < nextData.length; j++) {
          const row = nextData[j];
          if (row.spcm_no === updatedRow.spcm_no && row.exmn_cd === updatedRow.exmn_cd) {
            remainIdxs.push(j); //업데이트 미반영 항목은 갱신 안하기 위해.
            remainVals.push({ ...row, exmn_rslt_valu: updatedRow.exmn_rslt_valu });
            break;
          } //그래도 결과 레코드 자체가 사라지면 없어져야한다.
        }
      }

      for (let i = 0; i < remainIdxs.length; i++) {
        dtlDataProvider.updateRow(remainIdxs[i], remainVals[i], true);
      }
      dtlGridView.clearCurrent();

      //mst 포커스 복원 해주기.
      const rowIdx = mstGridView
        .getDataSource()
        .getJsonRows()
        .findIndex(row => compareExmnRcpn(row, param, true));
      if (rowIdx < 0) {
        setSnackbar({
          open: true,
          message: Message.networkFail,
          type: "warning",
        });
        onFinished(true);
        return;
      }
      const itemIdx = mstGridView.getItemIndex(rowIdx);
      if (itemIdx > -1) {
        mstGridView.setSelection({
          style: SelectionStyle.ROWS,
          startItem: itemIdx,
          endItem: itemIdx,
        });
      }

      const checkIsNoUpdated = () => {
        const editColumn = dtlGridView.getCurrent().column;
        const editRow =
          editColumn === "exmn_rslt_valu" || editColumn === "exmn_item_rmrk_cnts"
            ? dtlGridView.getEditingItem()?.dataRow
            : null; //검사 결과/비고 컬럼이 수정중일때
        //M,H인게 업데이트 됬거나 E인게 있다면, 업데이트 체크할때 수정중인 항목이 있다면 수정중인 값 체크.
        const checkedIdxList = dtlGridView.getCheckedRows(true, true, true);
        for (let idx = 0; idx < checkedIdxList.length; idx++) {
          const row = dtlDataProvider.getJsonRow(checkedIdxList[idx]);
          switch (row.prgr_stat_cmcd) {
            case "E":
              setState(prev => ({
                ...prev,
                noUpdated: false,
              }));
              return;
            case "M":
            case "H":
              if (editRow === checkedIdxList[idx]) {
                let editVal = convertString(dtlGridView.getEditValue(dtlGridView.getEditValue()));
                if (editColumn === "exmn_rslt_valu" && row.rslt_type_dvsn === "W") {
                  //여기 padValue는 그 어떤 예외적인 경우라도 validateValue를 거쳤기에 문제없다. 그냥 reload 만 할경우 호출될 일 없음.
                  editVal = padValue(row.dcpr_nodg, row.nodg, editVal);
                }
                if (
                  (editColumn === "exmn_rslt_valu" &&
                    convertString(lastDtlData[checkedIdxList[idx]].exmn_rslt_valu) !== convertString(editVal)) ||
                  (editColumn === "exmn_item_rmrk_cnts" &&
                    convertString(lastDtlData[checkedIdxList[idx]].exmn_item_rmrk_cnts) !== convertString(editVal))
                ) {
                  setState(prev => ({
                    ...prev,
                    noUpdated: false,
                  }));
                  return;
                }
              } else if (dtlDataProvider.getRowState(checkedIdxList[idx]) === RowState.UPDATED) {
                setState(prev => ({
                  ...prev,
                  noUpdated: false,
                }));
                return;
              }
            default:
              break;
          }
        }
        setState(prev => ({
          ...prev,
          noUpdated: true,
        }));
      };
      if (!isLastOnDataLoadComplated(dtlGridView)) {
        removeOnDataLoadComplated(dtlGridView);
      }
      appendOnDataLoadComplated(dtlGridView, () => {
        checkIsNoUpdated(); //새로 로드될때마다 한번씩 돌려주기.
      });
      dtlGridView.onItemChecked = () => {
        checkIsNoUpdated();
      };
      dtlGridView.onItemAllChecked = (_grid, checked) => {
        const editingItem = dtlGridView.getEditingItem();
        if (editingItem) {
          //수정중인 항목도 강제 적용.
          dtlGridView.checkItem(editingItem.itemIndex, checked, false, true);
        }
        checkIsNoUpdated();
      };
      dtlGridView.onShowEditor = (grid, index, props, attr) => {
        if (index.fieldName === "exmn_rslt_valu") {
          //임시값 초기화.
          editValueRef.current = grid.getValue(index.itemIndex, "exmn_rslt_valu");
        }
      };
      dtlGridView.onCellEdited = (grid, itemIndex, row, field) => {
        if (
          dtlDataProvider.getFieldIndex("exmn_rslt_valu") !== field &&
          dtlDataProvider.getFieldIndex("exmn_item_rmrk_cnts") !== field
        )
          return;
        if (dtlDataProvider.getFieldIndex("exmn_rslt_valu") === field) {
          //유효숫자 맞춰주기, 편집셀은 null 없음.
          if (dtlDataProvider.getFieldIndex("exmn_rslt_valu") === field) {
            let lastVal = grid.getValue(itemIndex, field);
            if (grid.getValue(itemIndex, "rslt_type_dvsn") === "W") {
              lastVal = padValue(grid.getValue(itemIndex, "dcpr_nodg"), grid.getValue(itemIndex, "nodg"), lastVal);
            }
            grid.setValue(itemIndex, field, lastVal);
          }
          editValueRef.current = ""; //편집 완료이므로 초기화해줌.
        }
        grid.commit();
        if (
          convertString(dtlDataProvider.getJsonRow(row).exmn_rslt_valu) ===
            convertString(lastDtlData[row].exmn_rslt_valu) &&
          convertString(dtlDataProvider.getJsonRow(row).exmn_item_rmrk_cnts) ===
            convertString(lastDtlData[row].exmn_item_rmrk_cnts)
        ) {
          dtlDataProvider.setRowState(row, RowState.NONE, true);
        } else {
          dtlDataProvider.setRowState(row, RowState.UPDATED, true);
        }
        checkIsNoUpdated();
      };
      dtlGridView.onEditChange = (grid, index, value) => {
        if (index.fieldName !== "exmn_rslt_valu" && index.fieldName !== "exmn_item_rmrk_cnts") return;
        if (index.fieldName === "exmn_rslt_valu") {
          const rsltType = grid.getValue(index.itemIndex, "rslt_type_dvsn");
          if (value != null && value.length > 0 && rsltType === "W") {
            const inprNodg = grid.getValue(index.itemIndex, "inpr_nodg");
            const dcprNodg = grid.getValue(index.itemIndex, "dcpr_nodg");
            const nodg = grid.getValue(index.itemIndex, "nodg");
            if (!validateValue(value, inprNodg, dcprNodg, nodg)) {
              //애초에 입력 가능한(숫자를 완성하기위해 거쳐야하는) non number 타입은 validateValue를 성공한다. 따라서 복붙, load, 소견, 의도적 입력등을 통해 잘못된 값이 들어온 경우만 남는다.
              if (!/^-?(0|[1-9][0-9]*)(\.[0-9][0-9]*)?$/.test(value)) {
                setSnackbar({
                  open: true,
                  message: Message.MSC_020000_nonNvmlValu,
                  type: "error",
                });
              } else {
                setSnackbar({
                  open: true,
                  message: Message.MSC_020000_NmvlRsltFrmtErr,
                  type: "error",
                });
              }
              if (validateValue(editValueRef.current, inprNodg, dcprNodg, nodg)) {
                grid.setEditValue(editValueRef.current);
              } else {
                //이전값 조차 검증 실패하는 경우(유효숫자 변경됨), 값을 리셋함.
                editValueRef.current = "";
                grid.setEditValue("");
              }
              return;
            }
          }
          editValueRef.current = value;
        }
        checkIsNoUpdated();
      };
      onFinished(true);
    },
  );

  /**
   * MST 검색 프로미스.
   * - 종료시 조건 컴포넌트 상태를 검색 조건과 싱크시킨다.
   * @author khgkjg12 강현구A
   * @typedef {(
   *   param : {
   *     patientCompleted: {
   *     pid : string;
   *     pt_nm: string;
   *     age_cd : string;
   *    } | null;
   *    cndt_dy : string;
   *    hope_exrm_dept_sqno_list : number[];
   *   },
   *   skipClearRcpn: boolean,
   *   onFinished : (any)=>void
   *  )=>void} loadMstMp 비동기 검색 함수. 성공/실패 상태에 따라 콜백 제공.
   * @type {[loadMstMp]}
   */
  const [loadMstMp] = useManagedPromise(
    async (param, onFinished) => {
      try {
        const { resultCode, resultData } = await callApi("/MSC_020300/rtrvRsltSttsList", {
          pid: param.patientCompleted?.pid,
          cndt_dy_from: param.cndt_dy_from,
          cndt_dy_to: param.cndt_dy_to,
          hope_exrm_dept_sqno_list: param.hope_exrm_dept_sqno_list,
        });
        if (resultCode !== 200) throw new Error();
        return [true, resultData, onFinished];
      } catch (e) {
        return [false, e, onFinished];
      }
    },
    ([isSuccess, data, onFinished]) => {
      if (isSuccess) {
        const mstDataSource = mstGridViewRef.current.getDataSource();
        if (data.length < 1) {
          setSnackbar(prev => ({
            ...prev,
            open: true,
            type: "info",
            message: Message.noSearch,
          }));
        }
        mstDataSource.setRows(data);
        const nextCount = {
          E: 0,
          M: 0,
          N: 0,
          0: 0,
        };
        for (const row of data) {
          switch (row.prsc_prgr_stat_cd) {
            case "E":
              nextCount.E++;
              break;
            case "M":
              nextCount.M++;
              break;
            case "N":
              nextCount.N++;
              break;
            default:
          }
        }
        nextCount["0"] = nextCount.E + nextCount.M + nextCount.N;
        mstGridViewRef.current.clearCurrent();
        onFinished(nextCount);
      } else {
        setSnackbar({
          open: true,
          message: Message.networkFail,
          type: "warning",
        });
        onFinished(null);
      }
    },
  );

  /**
   * 공통코드 초기화 비동기 함수.
   * @author khgkjg12 강현구A
   */
  const [loadPageMp] = useManagedPromise(
    async onFinished => {
      try {
        const [resultCommon, resultDept] = await Promise.all([
          callApi("/common/selectCommonCode", {
            clsfList: ["CS1008"],
            date: moment(new Date()).format("YYYYMMDD"),
          }),
          callApi("/common/selectDeptCode"),
        ]);
        if (resultDept.resultMsg !== "SUCCESS") throw new Error();
        return [true, resultCommon, resultDept, onFinished];
      } catch {
        return [false, null, null, onFinished];
      }
    },
    ([isSuccess, resultCommon, resultDept, onFinished]) => {
      if (!isSuccess) {
        ErrorLogInfo();
        onFinished(null);
        return;
      }
      //검사실 정보 세팅.
      const nextDeptData = [
        state.deptData[0],
        ...resultDept.resultData.filter(element => element.exrm_clsf_cd === "L"),
      ];
      const nextMstStateList = [state.mstStateList[0]];
      const dstStateStyleList = [];
      for (const resultRow of resultCommon.resultData) {
        switch (resultRow.cmcd_cd) {
          case "E":
          case "M":
          case "N":
            nextMstStateList.push({
              code: resultRow.cmcd_cd,
              name: resultRow.cmcd_nm,
              color: resultRow.cmcd_cd === "E" ? resultRow.cmcd_char_valu2 : resultRow.cmcd_char_valu1,
              count: 0,
            });
          // eslint-disable-next-line no-fallthrough
          case "F":
          case "G":
          case "H":
            dstStateStyleList.push({
              code: resultRow.cmcd_cd,
              name: resultRow.cmcd_nm,
              color: resultRow.cmcd_cd === "E" ? resultRow.cmcd_char_valu2 : resultRow.cmcd_char_valu1,
            });
            break;
          default:
        }
      }
      dtlGridViewRef.current.setColumn({
        ...dtlGridViewRef.current.columnByName("prgr_stat_cmcd"),
        values: nextMstStateList.map(item => item.code),
        labels: nextMstStateList.map(item => item.name),
        renderer: {
          type: "image",
          imageCallback: (_grid, dataCell) => {
            for (const item of dstStateStyleList) {
              if (dataCell.value === item.code) {
                return getBadgeSvg(item.name, item.color);
              }
            }
          },
        },
      });
      mstGridViewRef.current.setColumn({
        ...mstGridViewRef.current.columnByName("prsc_prgr_stat_cd"),
        values: nextMstStateList.map(item => item.code),
        labels: nextMstStateList.map(item => item.name),
        renderer: {
          type: "image",
          imageCallback: (_grid, dataCell) => {
            for (const item of nextMstStateList) {
              if (dataCell.value === item.code) {
                return getBadgeSvg(item.name, item.color);
              }
            }
          },
        },
      });
      mstGridViewRef.current.setColumnFilters(
        "prsc_prgr_stat_cd",
        nextMstStateList
          .filter(state => state.code !== "0")
          .map(state => ({ name: state.code, text: state.name, criteria: `value = '${state.code}'` })),
      );
      const nextDeptList = Array.from(nextDeptData, list => list.value).filter(list => list !== "");
      onFinished([nextMstStateList, nextDeptData, nextDeptList]);
    },
  );

  /**
   * MST, DTL 그리드 로드 비동기 함수.
   * @param { "search" | "select" | "search_select" | "refresh" | "initial" } mode
   * @param {{
   *   patientCompleted: {
   *    pid : string;
   *    pt_nm: string;
   *    age_cd : string;
   *   } | null;
   *   cndt_dy_to: string;
   *   cndt_dy_from: string;
   *   hope_exrm_dept_sqno_list: int[];
   * }} searchParam
   * @param { {
   *   rcpn_no: string;
   *   cndt_dy: string;
   *   hope_exrm_dept_sqno: number;
   * }} selectParam
   * @param {()=>Promise<Response>} onPreLoadAsync 비동기 함수 , true, false 로 계속 진행할지 여부를 반환.
   * @author khgkjg12 강현구A
   * @since 2024-02-06
   */
  const loadAsync = useCallback(
    /**
     * MST, DTL 그리드 로드 비동기 함수.
     * @param { "search" | "select" | "search_select" | "refresh" | "initial" } mode
     * @param {{
     *   patientCompleted: {
     *    pid : string;
     *    pt_nm: string;
     *    age_cd : string;
     *   } | null;
     *   cndt_dy_to: string;
     *   cndt_dy_from: string;
     *   hope_exrm_dept_sqno_list: int[];
     * }} searchParam
     * @param { {
     *   rcpn_no: string;
     *   cndt_dy: string;
     *   hope_exrm_dept_sqno: number;
     * }} selectParam
     * @param {()=>Promise<Response>} onPreLoadAsync 비동기 함수 , true, false 로 계속 진행할지 여부를 반환.
     * @author khgkjg12 강현구A
     * @since 2024-02-06
     */
    async (prevState, mode, searchParam, selectParam, onPreLoadAsync) => {
      if (isLoading) return;
      setIsLoading(true);
      if (onPreLoadAsync) {
        if ((await onPreLoadAsync()) === "aborted") {
          setIsLoading(false);
          return;
        }
      }
      const onFinal = (nextState, isSearchSuccess) => {
        setState(nextState);
        if (!isSearchSuccess) {
          setIsLoading(false);
          return;
        }
        setSearchSuccess(isSearchSuccess);
      };
      let lMode = mode;
      let lSearchParam = searchParam;
      const nextState = { ...prevState };
      if (lMode === "initial") {
        const loadPageResult = await new Promise(resolve => {
          loadPageMp(result => resolve(result));
        });
        if (!loadPageResult) {
          setIsLoading(false);
          return;
        }
        const [nextMstStateList, nextDeptData, nextDeptList] = loadPageResult;
        lMode = "search";
        lSearchParam = {
          patientCompleted:
            location.state?.pid && location.state?.pt_nm && location.state?.age_cd
              ? {
                  pid: location.state.pid,
                  pt_nm: location.state.pt_nm,
                  age_cd: location.state.age_cd,
                }
              : null,
          cndt_dy_to: location.state?.cndt_dt
            ? location.state.cndt_dt.substring(0, 10) //검사처방 cndt_dt 기본 방식으로 문자열 변환한 값 넘어옴.(2024-04-22)
            : moment(new Date()).format("YYYY-MM-DD"),
          cndt_dy_from: location.state?.cndt_dt
            ? location.state.cndt_dt.substring(0, 10)
            : moment(new Date()).format("YYYY-MM-DD"),
          hope_exrm_dept_sqno_list: nextDeptList,
        };
        nextState.toDate = moment(lSearchParam.cndt_dy_to, "YYYY-MM-DD").toDate();
        nextState.fromDate = moment(lSearchParam.cndt_dy_from, "YYYY-MM-DD").toDate();
        nextState.patientCompleted = lSearchParam.patientCompleted;
        nextState.deptData = nextDeptData;
        nextState.deptList = nextDeptList;
        nextState.mstStateList = nextMstStateList;
      }
      if (lMode === "search" || lMode === "search_select" || lMode === "select") {
        if (!(await new Promise(resolve => saveUpdatedMp(resolve)))) {
          //업데이트 실패의 경우 다시 refresh 로직을 탄다.
          lMode = "refresh";
        }
      }
      if (lMode == "refresh") {
        lSearchParam = state.lastSearchParam;
      }
      if (lMode === "search" || lMode === "search_select" || lMode === "refresh") {
        if (lSearchParam.hope_exrm_dept_sqno_list.length < 1) {
          //부서일련이 없는 경우
          setSnackbar({
            open: true,
            message: Message.noSearch,
            type: "info",
          });
          onFinal(nextState, false);
          return;
        }
        const nextCount = await new Promise(resolve => loadMstMp(lSearchParam, resolve));
        if (nextCount) {
          nextState.lastSearchParam = { ...lSearchParam, mode: lMode };
          nextState.mstStateList = nextState.mstStateList.map(e => ({ ...e, count: nextCount[e.code] }));
          nextState.selectedMst = null;
        } else {
          onFinal(nextState, false);
          return;
        }
      }
      let lSelectParam = lMode === "refresh" ? state.selectedMst : selectParam;
      if (
        mstGridViewRef.current
          .getDataSource()
          .getJsonRows()
          .findIndex(
            row =>
              row.rcpn_no === lSelectParam?.rcpn_no &&
              row.cndt_dy === lSelectParam?.cndt_dy &&
              row.hope_exrm_dept_sqno === lSelectParam?.hope_exrm_dept_sqno,
          ) > -1 &&
        (lMode === "select" || lMode === "search_select" || (lMode === "refresh" && lSelectParam != null))
      ) {
        //현재 MST에 선택 환자가 존재하는지 검사. 없으면 DTL로드 안하고 성공 처리.
        if (!(await new Promise(resolve => loadDtlMp(lSelectParam, data => resolve(data))))) {
          onFinal(nextState, lMode === "search_select" || lMode === "refresh");
          return;
        }
        nextState.selectedMst = {
          ...lSelectParam,
        };
        nextState.focusedExmn = null;
        dtlGridViewRef.current.clearCurrent();
      } else {
        //성공할 때만 비우는데,비우기 스킵할경우 그냥 둠.
        dtlGridViewRef.current.commit();
        dtlGridViewRef.current.getDataSource().clearRows();
        dtlGridViewRef.current.clearCurrent();
        nextState.focusedExmn = null;
      }
      onFinal(nextState, lMode === "search_select" || lMode === "refresh" || lMode === "search");
    },
    [isLoading],
  );

  const updateFilterAndSelection = nextFilters => {
    const mstGridView = mstGridViewRef.current;
    mstGridView.activateAllColumnFilters("prsc_prgr_stat_cd", false);
    if (nextFilters) {
      mstGridView.activateColumnFilters("prsc_prgr_stat_cd", nextFilters, true);
    }
  };

  const onClickStateBtnGrp = value => {
    updateFilterAndSelection([value]);
  };
  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  const handleSearchInfoChange = ({ type, value, completed }) => {
    switch (type) {
      case "date":
        setState(prev => ({
          ...prev,
          toDate: value.to,
          fromDate: value.from,
        }));
        break;
      case "select":
        setState(prev => ({
          ...prev,
          deptList: value.map(e => Number(e)),
        }));
        break;
      case "complete": {
        setState(prev => ({
          ...prev,
          patientCompleted: sCopyObj(completed),
        }));
        loadAsync(state, "search", {
          cndt_dy_from: moment(state.fromDate).format("YYYY-MM-DD"),
          cndt_dy_to: moment(state.toDate).format("YYYY-MM-DD"),
          hope_exrm_dept_sqno_list: state.deptList,
          patientCompleted: completed,
        });
        break;
      }
      default:
    }
  };

  /**
   * 미완료 팝업 항목 선택 적용 이벤트. 트렌젝션 수행중일 때는 호출 무시됨.
   * @author khgkjg12 강현구A
   */
  const handleAdjust = data => {
    const nextState = {
      ...state,
      toDate: moment(data.exmn_hope_date, "YYYY-MM-DD").toDate(),
      fromDate: moment(data.exmn_hope_date, "YYYY-MM-DD").toDate(),
      deptList: [Number(data.hope_exrm_cd)],
      patientCompleted: { pid: data.pid, pt_nm: data.pt_dscm_nm, age_cd: data.sex_age },
    };
    loadAsync(
      nextState,
      "search_select",
      {
        patientCompleted: nextState.patientCompleted,
        cndt_dy_from: data.exmn_hope_date,
        cndt_dy_to: data.exmn_hope_date,
        hope_exrm_dept_sqno_list: nextState.deptList,
      },
      {
        rcpn_no: data.rcpn_sqno.toString(),
        cndt_dy: data.exmn_hope_date,
        hope_exrm_dept_sqno: nextState.deptList[0],
      },
    );
  };

  /**
   * 프린트 버튼 클릭 이벤트, 트렌젝션 수행중에는 무시됨.
   * @author khgkjg12 강현구A
   */
  const handlePrintClick = () => {
    const auth = getAuth(160);
    if (!auth) {
      setAlert({
        open: true,
        type: "warning",
        message: Message.issueAlertMessage,
        title: Message.issueAlertTitle,
      });
      return;
    }
    const checkIdxList = dtlGridViewRef.current.getCheckedItems();
    if (checkIdxList.length < 1) {
      setSnackbar({ open: true, type: "info", message: Message.noCheck2 });
      return;
    }
    const filteredList = checkIdxList.reduce((acc, idx) => {
      const item = dtlGridViewRef.current.getValues(idx);
      if (item.prgr_stat_cmcd === "N") {
        acc.push({ ...item });
      }
      return acc;
    }, []);
    if (filteredList.length < 1) {
      setSnackbar({ open: true, type: "warning", message: "최종보고된 검사항목을 선택하세요." });
      return;
    }
    filteredList.sort((a, b) => {
      if (a.exmn_pich_nm > b.exmn_pich_nm) {
        return 1;
      }
      if (a.exmn_pich_nm < b.exmn_pich_nm) {
        return -1;
      }
      return 0;
    });
    const intWidth = 1000; // 팝업 가로사이즈
    const intHeight = window.screen.height - 200; // 팝업 세로사이즈
    windowOpen(
      "CSMSP001",
      setLocalStorageItem({
        info: {
          pid: state.selectedMst.pid,
          cndt_dy: state.selectedMst.cndt_dy,
          sex_age: state.selectedMst.sex_age,
          dobr: patientInfoRef.current?.getPatientInfo().dobr,
          pt_nm: state.selectedMst.pt_nm,
          mdcr_dr_nm: state.selectedMst.mdcr_dr_user_nm,
          mdcr_dr_sign_lctn: state.selectedMst.mdcr_dr_sign_lctn,
          mdcr_date: state.selectedMst.mdcr_date,
          rcpn_no: state.selectedMst.rcpn_no,
        },
        data: filteredList,
      }),
      {
        width: intWidth,
        height: window.screen.height - 200,
        left: window.screenX + window.screen.width / 2 - intWidth / 2,
        top: window.screen.height / 2 - intHeight / 2 - 40,
      },
    );
  };

  /**
   * 저장 비동기 함수.
   * @author khgkjg12 강현구A
   * @type {[(validatedRows:any, onFinished:(response: Response)=>void)=>void]}
   */
  const [inptMP] = useManagedPromise(
    /**
     * @returns {Promise<[Response, any, (response: Response) => void]>}
     */
    async (validatedRows, onFinished) => {
      try {
        await runCascade(
          validatedRows.map(row => () => signAsync(row)),
          (key, idx) => {
            validatedRows[idx]["dgsg_no"] = key;
          },
        );
        const { resultCode } = await callApi("/MSC_020300/iptnRslt", { mslcMapList: validatedRows });
        if (resultCode !== 200) {
          return ["failed", resultCode, onFinished];
        }
        return ["success", validatedRows, onFinished];
      } catch (e) {
        return ["failed", null, onFinished];
      }
    },
    /**
     * @param {[Response, any, (response :Response) => void]}
     */
    ([response, data, onFinished]) => {
      if (response === "success") {
        const dataSource = dtlGridViewRef.current.getDataSource();
        //성공한 행들 행상태 초기화
        dataSource.getJsonRows().forEach((row, idx) => {
          if (data.findIndex(e => e.exmn_cd === row.exmn_cd && e.spcm_no === row.spcm_no) > -1) {
            dataSource.setRowState(idx, RowState.NONE, true);
          }
        });
        setSnackbar({ open: true, type: "success", message: "저장되었습니다" });
      } else {
        handleIptnRsltErr(data);
      }
      onFinished(response);
    },
  );

  const signAsync = async row => {
    const key = await signApi(row);
    if (!key || !key.dgsgKey) throw new Error("no key");
    return key.dgsgKey;
  };

  /**
   * 판독(저장) 이벤트 헨들러
   * @author khgkjg12 강현구A
   */
  const handleInptClick = () => {
    loadAsync(state, "refresh", null, null, () => {
      const gridView = dtlGridViewRef.current;
      const provider = gridView.getDataSource();
      gridView.commitEditor(true, true);
      const checkIdxList = gridView.getCheckedRows();
      const updatedIdxList = provider.getStateRows(RowState.UPDATED);

      const validatedRows = [];
      for (const idx of checkIdxList) {
        const item = provider.getJsonRow(idx);
        switch (item.prgr_stat_cmcd) {
          case "H":
          case "M":
            if (updatedIdxList.findIndex(e => e === idx) < 0) {
              //업데이트 안된 항목임.
              break;
            }
          case "E":
            validatedRows.push({
              exmn_rslt_valu: item.exmn_rslt_valu,
              txt_rslt_valu: item.txt_rslt_valu,
              exmn_item_rmrk_cnts: item.exmn_item_rmrk_cnts,
              spcm_no: item.spcm_no,
              exmn_cd: item.exmn_cd,
            });
            break;
          default:
        }
      }
      return new Promise(resolve => inptMP(validatedRows, resolve));
    });
  };

  /**
   * 선택영역 판독 취소, 일부라도 판독중 상태인 항목이 있으면 ok
   * @author khgkjg12 강현구A
   */
  const [cnclInptMP] = useManagedPromise(
    (validatedRows, onFinished) =>
      new Promise(
        /**
         * @param {(result:[ Response, (Response) =>void, any])=>void} resolve
         */
        resolve => {
          setConfirm({
            open: true,
            type: "success",
            titleMessage: "진단검사 판독 취소",
            contentsMessage: Message.readingCancelConfirm,
            afterConfirmFunction: () => {
              runCascade(
                validatedRows.map(row => () => signAsync(row)),
                (key, idx) => {
                  validatedRows[idx]["dgsg_no"] = key;
                },
              )
                .then(() =>
                  callApi("/MSC_020300/cnclIptnRslt", { mslcMapList: validatedRows })
                    .then(({ resultCode }) => {
                      if (resultCode !== 200) {
                        resolve(["failed", onFinished, resultCode]);
                        return;
                      }
                      resolve(["success", onFinished]);
                    })
                    .catch(() => {
                      resolve(["failed", onFinished]);
                    }),
                )
                .catch(() => resolve(["failed", onFinished]));
            },
            afterCancelFunction: () => resolve(["aborted", onFinished]),
            afterCloseFunction: () => resolve(["aborted", onFinished]),
          });
        },
      ),
    /**
     * @param {[Response, (response:Response) =>void, any]}
     */
    ([response, onFinished, errorCd]) => {
      if (response === "success") {
        setSnackbar({ open: true, type: "success", message: Message.readingCancel });
      } else if (response === "failed") {
        handleIptnRsltErr(errorCd);
      }
      onFinished(response);
    },
  );

  /**
   * 판독취소 클릭 이벤트
   * @author khgkjg12 강현구A
   */
  const handleCnclInptClick = () => {
    loadAsync(state, "refresh", null, null, () => {
      const gridView = dtlGridViewRef.current;
      gridView.commitEditor(true, true);
      const checkIdxList = gridView.getCheckedItems();
      if (checkIdxList.length < 1) {
        setSnackbar({ open: true, type: "info", message: Message.noCheck2 });
        return Promise.resolve("aborted");
      }
      const validatedRows = [];
      let errorStat = null;
      for (let i = 0; i < checkIdxList.length; i++) {
        const item = gridView.getValues(checkIdxList[i]);
        switch (item.prgr_stat_cmcd) {
          case "F":
          case "G":
          case "H":
            errorStat = "FGH";
            break;
          case "M":
            validatedRows.push({ spcm_no: item.spcm_no, exmn_cd: item.exmn_cd });
            break;
          default:
            errorStat = "others";
            break;
        }
      }
      if (validatedRows.length < 1) {
        if (errorStat === "FGH")
          setSnackbar({ open: true, type: "error", message: Message.MSC_020000_entsIptnCnclImpb });
        else setSnackbar({ open: true, type: "error", message: Message.noReadingCancel });
        return Promise.resolve("aborted");
      }
      return new Promise(resolve => cnclInptMP(validatedRows, resolve));
    });
  };

  /**
   * 최종보고 비동기 함수.
   * @author khgkjg12 강현구A
   */
  const [rptgMP] = useManagedPromise(
    (saveRows, validatedRows, onFinished) =>
      new Promise(
        /**
         * @param {(result:[Response, (response:Response) => void, boolean, any[], any[], string ])=>void} resolve
         */
        resolve => {
          if (saveRows.length > 0) {
            setConfirm({
              open: true,
              type: "success",
              titleMessage: "진단검사 최종보고",
              contentsMessage: Message.saveCheckConfirm,
              afterConfirmFunction: () => {
                callApi("/MSC_020300/iptnRslt", { mslcMapList: saveRows })
                  .then(({ resultCode }) => {
                    if (resultCode !== 200) {
                      resolve(["failed", onFinished, false, null, null, resultCode]);
                      return;
                    }
                    callApi("/MSC_020300/rptgRslt", { mslcMapList: validatedRows })
                      .then(({ resultCode, resultData: notiList }) => {
                        if (resultCode !== 200) {
                          resolve(["failed", onFinished, true, saveRows, null, resultCode]);
                          return;
                        }
                        resolve(["success", onFinished, true, saveRows, notiList, null]);
                      })
                      .catch(() => {
                        resolve(["failed", onFinished, true, saveRows, null, null]);
                      });
                  })
                  .catch(() => {
                    resolve(["failed", onFinished, false, null, null, null]);
                  });
              },
              afterCancelFunction: () => resolve(["aborted", onFinished, false, null, null, null]), //최종보고 호출 안되고 종료.
              afterCloseFunction: () => resolve(["aborted", onFinished, false, null, null, null]),
            });
          } else {
            callApi("/MSC_020300/rptgRslt", { mslcMapList: validatedRows })
              .then(({ resultCode, resultData: notiList }) => {
                if (resultCode !== 200) {
                  resolve(["failed", onFinished, false, null, null, resultCode]);
                  return;
                }
                resolve(["success", onFinished, false, null, notiList]);
              })
              .catch(() => resolve(["failed", onFinished, false, null, null, null]));
          }
        },
      ),
    /**
     * @param {[Response, (response:Response) =>void, any]}
     */
    ([response, onFinished, isSaved, saveData, notiList, errorCode]) => {
      if (isSaved) {
        const dataSource = dtlGridViewRef.current.getDataSource();
        //성공한 행들 행상태 초기화
        dataSource.getJsonRows().forEach((row, idx) => {
          if (saveData.findIndex(e => e.exmn_cd === row.exmn_cd && e.spcm_no === row.spcm_no) > -1) {
            dataSource.setRowState(idx, RowState.NONE, true);
          }
        });
      }
      if (response === "success") {
        setSnackbar({ open: true, type: "success", message: Message.report });
        if (notiList) {
          const { cvrList, others } = chckCVR(notiList);
          if (cvrList.length > 0) {
            const timeout = setTimeout(() => openLoading(Message.sendNoti), 300);
            notifyAsync("CVR", cvrList).then(result => {
              clearTimeout(timeout);
              closeLoading();
              if (result) setSnackbar({ open: true, type: "success", message: Message.cvrSuccess });
              else setSnackbar({ open: true, type: "warning", message: Message.networkFail });
            });
          }
          if (others.length > 0) {
            notifyAsync("Report", others);
          }
        }
      } else if (response === "failed") {
        handleIptnRsltErr(errorCode);
      }
      onFinished(response);
    },
  );

  /**
   * 최종보고 클릭 이벤트
   * @author khgkjg12 강현구A
   */
  const handleRptgClick = () => {
    loadAsync(state, "refresh", null, null, () => {
      const gridView = dtlGridViewRef.current;
      gridView.commitEditor(true, true);
      const checkIdxList = gridView.getCheckedItems();
      if (checkIdxList.length < 1) {
        setSnackbar({ open: true, type: "info", message: Message.noCheck2 });
        return Promise.resolve("aborted");
      }
      const validatedRows = [];
      let errorStat = null;
      for (const idx of checkIdxList) {
        const item = dtlGridViewRef.current.getValues(idx);
        switch (item.prgr_stat_cmcd) {
          case "F":
          case "G":
            errorStat = "FG";
            break;
          case "M":
          case "H":
            validatedRows.push({ spcm_no: item.spcm_no, exmn_cd: item.exmn_cd });
            break;
          default:
            errorStat = "others";
        }
      }
      if (validatedRows.length < 1) {
        if (errorStat === "FG") setSnackbar({ open: true, type: "error", message: Message.MSC_020000_exmnRsltUnRply });
        else setSnackbar({ open: true, type: "error", message: Message.noReport });
        return Promise.resolve("aborted");
      }
      const updatedRowIdxList = gridView.getDataSource().getStateRows(RowState.UPDATED);
      const saveRows = [];
      for (const updatedIdx of updatedRowIdxList) {
        const updatedRow = gridView.getDataSource().getJsonRow(updatedIdx);
        for (const row of validatedRows) {
          if (updatedRow.exmn_cd === row.exmn_cd && updatedRow.spcm_no === row.spcm_no) {
            //변경된 행이 최종보고 대상행에 속한다면
            saveRows.push({
              ...row,
              exmn_rslt_valu: updatedRow.exmn_rslt_valu,
              txt_rslt_valu: updatedRow.txt_rslt_valu,
              exmn_item_rmrk_cnts: updatedRow.exmn_item_rmrk_cnts,
            });
            break;
          }
        }
      }
      return new Promise(resolve => rptgMP(saveRows, validatedRows, resolve));
    });
  };

  /**
   * 최종보고 취소 비동기 함수.
   * @author khgkjg12 강현구A
   * @type {[(validatedRows: any, onFinished: (response:Response))=>void]}
   */
  const [cnclRptgMP] = useManagedPromise(
    /**
     *
     * @param {*} validatedRows
     * @param {(response:Response)=>void} onFinished
     * @returns
     */
    (validatedRows, onFinished) =>
      new Promise(
        /**
         * @param {(result:[ Response, (response:Response) =>void, any])=>void} resolve
         */
        resolve => {
          setConfirm({
            open: true,
            type: "success",
            contentsMessage: "선택한 검사를 최종보고 취소하시겠습니까?",
            titleMessage: "진단검사 최종보고 취소",
            afterConfirmFunction: () => {
              callApi("/MSC_020300/cnclRptgRslt", { mslcMapList: validatedRows })
                .then(({ resultCode, resultData: notiList }) => {
                  if (resultCode !== 200) {
                    resolve(["failed", onFinished, null, resultCode]);
                    return;
                  }
                  resolve(["success", onFinished, notiList]);
                })
                .catch(() => {
                  resolve(["failed", onFinished]);
                });
            },
            afterCancelFunction: () => resolve(["aborted", onFinished]),
            afterCloseFunction: () => resolve(["aborted", onFinished]),
          });
        },
      ),
    /**
     * @param {[ Response, (any) =>void, any]}
     */
    ([response, onFinished, notiList, errorCd]) => {
      if (response === "success") {
        setSnackbar({ open: true, type: "success", message: "최종보고 취소되었습니다." });
        notifyAsync("ReportCancel", notiList);
      } else if (response === "failed") {
        handleIptnRsltErr(errorCd);
      }
      onFinished(response);
    },
  );

  /**
   * 최종보고 취소 클릭 이벤트.
   * @author khgkjg12 강현구A
   */
  const handleCnclRptgClick = () => {
    loadAsync(state, "refresh", null, null, () => {
      const gridView = dtlGridViewRef.current;
      gridView.commitEditor(true, true);
      const checkIdxList = gridView.getCheckedItems();
      if (checkIdxList.length < 1) {
        setSnackbar({ open: true, type: "info", message: Message.noCheck2 });
        return Promise.resolve("aborted");
      }
      const validatedRows = [];
      for (const idx of checkIdxList) {
        const item = gridView.getValues(idx);
        if (item.prgr_stat_cmcd === "N") {
          validatedRows.push({ spcm_no: item.spcm_no, exmn_cd: item.exmn_cd });
        }
      }
      if (validatedRows.length < 1) {
        setSnackbar({ open: true, type: "error", message: Message.noReportCancel });
        return Promise.resolve("aborted");
      }
      return new Promise(resolve => cnclRptgMP(validatedRows, resolve));
    });
  };

  const handleTxtRsltDialogClose = () => {
    setTxtRsltDialog({
      open: false,
      data: txtRsltDialog.data,
      title: txtRsltDialog.title,
    });
  };

  const [sendCvrMP] = useManagedPromise(
    (onFinished, saveRows, cvrRows) =>
      new Promise(resolve => {
        if (saveRows == null || saveRows.length < 1) {
          const timeout = setTimeout(() => openLoading(Message.sendNoti), 300);
          resolve([onFinished, "success", null, cvrRows, timeout]);
          return;
        }
        setConfirm({
          open: true,
          type: "success",
          titleMessage: "진단검사 CVR보고",
          afterCancelFunction: () => {
            resolve([onFinished, "aborted", null, null]);
          },
          afterCloseFunction: () => {
            resolve([onFinished, "aborted", null, null]);
          },
          afterConfirmFunction: () => {
            const timeout = setTimeout(() => openLoading(Message.sendNoti), 300);
            callApi("/MSC_020300/iptnRslt", { mslcMapList: saveRows })
              .then(({ resultCode }) => {
                if (resultCode !== 200) {
                  resolve([onFinished, "failed", null, null, timeout, resultCode]);
                  return;
                }
                resolve([onFinished, "success", saveRows, cvrRows, timeout]);
              })
              .catch(() => {
                resolve([onFinished, "failed", null, null, timeout]);
              });
          },
          contentsMessage: Message.saveCheckConfirm,
        });
      }),
    /**
     *
     * @param {[Response]}
     */
    ([onFinished, state, saveRows, cvrRows, timeout, errCd]) => {
      if (state === "success") {
        if (saveRows != null) {
          const dataSource = dtlGridViewRef.current.getDataSource();
          //성공한 행들 행상태 초기화
          dataSource.getJsonRows().forEach((row, idx) => {
            if (saveRows.findIndex(e => e.exmn_cd === row.exmn_cd && e.spcm_no === row.spcm_no) > -1) {
              dataSource.setRowState(idx, RowState.NONE, true);
            }
          });
        }
        notifyAsync("CVR", cvrRows).then(result => {
          clearTimeout(timeout);
          closeLoading();
          if (result) {
            setSnackbar({ open: true, type: "success", message: Message.cvrSuccess });
          } else {
            setSnackbar({ open: true, type: "warning", message: Message.networkFail });
          }
        });
      } else if (state === "failed") {
        clearTimeout(timeout);
        closeLoading();
        handleIptnRsltErr(errCd);
      }
      onFinished(state);
    },
  );

  const handleCvrClick = () => {
    loadAsync(state, "refresh", null, null, () => {
      const gridView = dtlGridViewRef.current;
      gridView.commitEditor(true, true);
      const validatedRows = gridView.getCheckedItems().map(idx => {
        const item = dtlGridViewRef.current.getValues(idx);
        return { spcm_no: item.spcm_no, exmn_cd: item.exmn_cd };
      });
      const updatedRowIdxList = gridView.getDataSource().getStateRows(RowState.UPDATED);
      const saveRows = [];
      for (const updatedIdx of updatedRowIdxList) {
        const updatedRow = gridView.getDataSource().getJsonRow(updatedIdx);
        for (const row of validatedRows) {
          if (updatedRow.exmn_cd === row.exmn_cd && updatedRow.spcm_no === row.spcm_no) {
            //변경된 행이 최종보고 대상행에 속한다면
            saveRows.push({
              ...row,
              exmn_rslt_valu: updatedRow.exmn_rslt_valu,
              txt_rslt_valu: updatedRow.txt_rslt_valu,
              exmn_item_rmrk_cnts: updatedRow.exmn_item_rmrk_cnts,
            });
            break;
          }
        }
      }
      return new Promise(resolve => sendCvrMP(resolve, saveRows, validatedRows));
    });
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    //마스터 그리드 설정
    const mstDataProvider = new LocalDataProvider(false);
    mstDataProvider.setFields(MSC020300MstFields);
    const mstGridView = new GridView(mstRealgridElement.current);
    mstGridViewRef.current = mstGridView;
    mstGridView.setDataSource(mstDataProvider);
    mstGridView.setColumns(MSC020300MstColumns);
    configEmptySet(mstGridView, mstRealgridElement.current, Message.noSearch);
    mstGridView.setDisplayOptions({
      selectionStyle: SelectionStyle.SINGLE_ROW,
      fitStyle: GridFitStyle.EVEN,
    });
    mstGridView.pasteOptions.enabled = false;
    mstGridView.setCopyOptions({ copyDisplayText: true, singleMode: true });
    mstGridView.rowIndicator.visible = false;
    mstGridView.footer.visible = false;
    mstGridView.checkBar.visible = false;
    mstGridView.stateBar.visible = false;
    mstGridView.setFilteringOptions({ enabled: false }); //상태 필터 팝업 사용하고 싶으면 제거
    //디테일 그리드 설정.
    const dtlDataProvider = new LocalDataProvider(true);
    dtlDataProvider.setFields(MSC020300DtlFields);
    const dtlGridView = new GridView(dtlRealgridElement.current);
    dtlGridViewRef.current = dtlGridView;
    dtlGridView.setDataSource(dtlDataProvider);
    dtlGridView.setColumns(MSC020300DtlColumns);
    configEmptySet(dtlGridView, dtlRealgridElement.current, Message.noData);
    dtlGridView.setDisplayOptions({
      selectionStyle: SelectionStyle.SINGLE_ROW,
      fitStyle: GridFitStyle.EVEN,
    });
    dtlGridView.pasteOptions.enabled = false;
    dtlGridView.setCopyOptions({ copyDisplayText: true, singleMode: true });
    dtlGridView.setCheckBar({
      visible: true,
      syncHeadCheck: true,
    });
    dtlGridView.rowIndicator.visible = false;
    dtlGridView.footer.visible = false;
    dtlGridView.stateBar.visible = false;
    dtlGridView.onCellButtonClicked = (grid, index) => {
      dtlGridView.commit();
      dtlGridView.hideEditor();
      if (index.column === "exmn_rslt_valu") {
        setTxtRsltDialog({
          open: true,
          data: grid.getValue(index.itemIndex, "txt_rslt_valu"),
          title: "위탁의뢰 결과치",
        });
      } else if (index.column === "exmn_item_rmrk_cnts") {
        setTxtRsltDialog({
          open: true,
          data: grid.getValue(index.itemIndex, "ents_rmrk_cnts"),
          title: "비고",
        });
      }
    };
    dtlGridView.onCurrentChanged = (grid, newIndex) => {
      setState(prev => ({
        ...prev,
        focusedExmn: { ...grid.getValues(newIndex.itemIndex) },
      }));
    };
    mstDataProvider.clearRows();
    dtlDataProvider.clearRows();
    loadAsync(state, "initial");
    return () => {
      mstDataProvider.destroy();
      mstGridView.destroy();
      dtlDataProvider.destroy();
      dtlGridView.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mstGridView = mstGridViewRef.current;
    mstGridView.onFilteringChanged = grid => {
      const filters = grid.getActiveColumnFilters("prsc_prgr_stat_cd");
      if (filters.length === 1) {
        setBtnStatusValue(filters[0].name);
      } else {
        setBtnStatusValue("0"); //필터가 없거나 여러개면 전체 버튼 활성화
      }
      if (
        !state.selectedMst ||
        mstGridView.searchItem({
          //있으면 selection(current를 포함하는 개념)됨 없으면 암것도 안함.
          fields: ["rcpn_no", "cndt_dy", "hope_exrm_dept_sqno"],
          values: [state.selectedMst.rcpn_no, state.selectedMst.cndt_dy, state.selectedMst.hope_exrm_dept_sqno],
        }) < 0
      ) {
        mstGridView.clearCurrent(); //선택된 rcpn 이 없거나, 찾을 수 없으면 초기화.
      }
      grid.onDataLoadComplated(grid); //데이터 로드 콜백 강제 트리거로 엠티셋 활성화.
    };
  }, [state.selectedMst]);

  useEffect(() => {
    mstGridViewRef.current.onSelectionChanged = (grid, selection) => {
      const nextPatient = grid.getValues(selection.startItem);
      if (!compareExmnRcpn(state.selectedMst, nextPatient, true)) {
        mstGridViewRef.current.onSelectionChanged = null; //일회용. 로드가끝나면 자동으로 달림.
        loadAsync(state, "select", null, { ...nextPatient });
      }
    };
  }, [state, loadAsync]);

  useEffect(() => {
    if (state.lastSearchParam) unactgUncmplDialogRef.current.search();
    //"search" "search_select" "refresh"
    if (state.lastSearchParam?.mode !== "refresh") {
      updateFilterAndSelection();
    }
  }, [state.lastSearchParam]);

  useEffect(() => {
    if (noti && checkNoti()) {
      loadAsync(state, "refresh", null, null);
      resetNoti();
    }
  }, [noti]);

  useEffect(() => {
    if (isSearchSuccess) {
      if (state.deptData.length > 2) {
        //2개 이상의 검사실이 있는 경우.
        searchInfoRef.current.selectDept(
          state.lastSearchParam.hope_exrm_dept_sqno_list.length > 1
            ? ""
            : state.lastSearchParam.hope_exrm_dept_sqno_list[0].toString(),
        );
      }
      searchInfoRef.current.setCompleted(sCopyObj(state.lastSearchParam.patientCompleted));
      state.patientCompleted = sCopyObj(state.lastSearchParam.patientCompleted);
      setSearchSuccess(false);
      setIsLoading(false);
    }
  }, [isSearchSuccess]);

  //check 변경시마다, state 업데이트가 이뤄지고 있기에, 싱크가 맞음.
  let isPrintable = false;
  let isCvrEnabled = false;
  const dtlGridView = dtlGridViewRef.current;
  let checkedRows = null;
  if (dtlGridView) {
    const dtlDataProvider = dtlGridView.getDataSource();
    checkedRows = dtlGridView.getCheckedRows(true, false, true).map(e => dtlDataProvider.getJsonRow(e));
    if (checkedRows.length > 0) {
      isCvrEnabled = true;
      for (const row of checkedRows) {
        if (row.rslt_prgr_stat_cd !== "N" && row.rslt_prgr_stat_cd !== "M") {
          isCvrEnabled = false;
          break;
        }
      }
      isPrintable = true;
      for (const row of checkedRows) {
        if (row.rslt_prgr_stat_cd !== "N") {
          isPrintable = false;
          break;
        }
      }
    }
  }

  /* ================================================================================== */
  /* render() */
  return (
    <div className="MSC_020300 dp_full">
      <div className="align_box">
        <div className={`align_top ${state.selectedMst ? "patient_info_wrap" : ""}`}>
          <PatientSummaryBar
            pid={state.selectedMst?.pid}
            rcpn_sqno={state.selectedMst?.rcpn_no}
            prsc_clsf_cd="C1"
            hope_exrm_cd={state.selectedMst?.hope_exrm_dept_sqno?.toString()}
            cndt_dt={state.selectedMst?.cndt_dy}
            ref={patientInfoRef}
            handleBind={bind => setBindPt(bind)}
            pageId="MSC_020300"
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
                    <h3 className="title">진단검사 결과 현황</h3>
                  </div>
                </div>
                <div className="right_box">
                  <UnactgUncmplDialog
                    ref={unactgUncmplDialogRef}
                    onAdjust={handleAdjust}
                    hopeExrmDeptSqnoList={state.deptList}
                    prscClsfCd="C1"
                    stateList={state.mstStateList}
                    uncmplYn="Y"
                    style={isLoading ? cursorWaitStyle : undefined}
                  />
                </div>
              </div>
              <div className="sec_content">
                <SearchInfo
                  exrmClsfCd="L"
                  ref={searchInfoRef}
                  date={{ from: state.fromDate, to: state.toDate }}
                  handleChange={handleSearchInfoChange}
                  handleSearch={() => {
                    loadAsync(state, "search", {
                      patientCompleted: state.patientCompleted,
                      cndt_dy_from: moment(state.fromDate).format("YYYY-MM-DD"),
                      cndt_dy_to: moment(state.toDate).format("YYYY-MM-DD"),
                      hope_exrm_dept_sqno_list: state.deptList,
                    });
                  }}
                  type="result"
                  initDeptData={state.deptData}
                  btnStyle={isLoading ? cursorWaitStyle : undefined}
                />
              </div>
            </div>
            <div className="sec_wrap full_size">
              <div className="sec_content">
                <div className="donut_box">
                  <div className="chart_box">
                    {/* // 차트 */}
                    <DoughnutChart arrStates={state.mstStateList} />
                  </div>
                </div>
              </div>
            </div>
            <div className="sec_wrap full_size2">
              <div className="sec_content">
                <StateBtnGroup
                  arrStates={state.mstStateList}
                  onClickStateBtnGrp={onClickStateBtnGrp}
                  strSelectedStateBtn={btnStatusValue}
                />
                <div className={`grid_box${isLoading ? " gridwait" : ""}`} ref={mstRealgridElement} />
              </div>
            </div>
          </div>
          <div className="align_right">
            <div className="sec_wrap full_size add_footer">
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
                  <LUXButton
                    label="검사소견"
                    onClick={() => {
                      dtlGridView?.commit();
                      dtlGridView?.hideEditor();
                      setExmnOpnnOpen(true);
                    }}
                    type="small"
                    disabled={!"EMH".includes(state?.focusedExmn?.prgr_stat_cmcd) || bindPt}
                    style={isLoading ? cursorWaitStyle : undefined}
                  />
                  <LUXButton
                    label="판독취소"
                    onClick={handleCnclInptClick}
                    type="small"
                    style={isLoading ? cursorWaitStyle : undefined}
                    disabled={!state.selectedMst || bindPt}
                  />
                  <LUXButton
                    label="최종보고"
                    onClick={handleRptgClick}
                    type="small"
                    style={isLoading ? cursorWaitStyle : undefined}
                    disabled={!state.selectedMst || bindPt}
                  />
                  <LUXButton
                    label="최종보고 취소"
                    onClick={handleCnclRptgClick}
                    type="small"
                    style={isLoading ? cursorWaitStyle : undefined}
                    disabled={!state.selectedMst || bindPt}
                  />
                  <LUXButton label="CVR보고" onClick={handleCvrClick} type="small" disabled={!isCvrEnabled || bindPt} />
                </div>
              </div>
              <div className="sec_content">
                <div className={`grid_box${isLoading ? " gridwait" : ""}`} ref={dtlRealgridElement} />
              </div>
              <div className="sec_footer">
                <div className="option_box">
                  <LUXButton
                    label="이력관리"
                    onClick={() => {
                      dtlGridView?.commit();
                      dtlGridView?.hideEditor();
                      setHstrDialog({
                        open: true,
                        exmnInfo: {
                          ...state.focusedExmn,
                          cndt_dt: state.focusedExmn.exmn_date,
                          mdcr_date: state.selectedMst.mdcr_date,
                          age_cd: state.selectedMst.sex_age,
                          pt_nm: state.selectedMst.pt_dscm_nm,
                          dobr: patientInfoRef.current.getPatientInfo().dobr,
                        },
                      });
                    }}
                    disabled={!state.selectedMst || !state.focusedExmn}
                  />
                  <LUXButton
                    label="저장"
                    onClick={handleInptClick}
                    blue={!state.noUpdated}
                    disabled={state.noUpdated || bindPt}
                    style={isLoading ? cursorWaitStyle : undefined}
                  />
                  <LUXButton label="출력" onClick={handlePrintClick} disabled={!isPrintable} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {withPortal(
        <LUXSnackbar
          message={snackbar.message}
          onRequestClose={() => setSnackbar({ ...snackbar, open: false })}
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
            confirm.afterCancelFunction && confirm.afterCancelFunction();
            setConfirm({ ...confirm, open: false });
          }}
          confirmButton={() => {
            confirm.afterConfirmFunction && confirm.afterConfirmFunction();
            setConfirm({ ...confirm, open: false });
          }}
          onClose={() => {
            confirm.afterCloseFunction && confirm.afterCloseFunction();
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
      <TxtRsltDialog
        data={txtRsltDialog.data}
        handleTxtRsltDialogClose={handleTxtRsltDialogClose}
        open={txtRsltDialog.open}
        title={txtRsltDialog.title}
      />
      <MSC100100P01
        opnnType="L"
        dialogOpen={exmnOpnnOpen}
        onClose={() => {
          setExmnOpnnOpen(false);
        }}
        onCopy={data => {
          const gridView = dtlGridViewRef.current;
          const idx = gridView.getCurrent().itemIndex;
          if (idx > -1) {
            gridView.setCurrent({ itemIndex: idx, column: "exmn_rslt_valu" });
            gridView.setEditValue(data.exmn_opnn_cnts, true, false);
            if (gridView.getEditValue() === data.exmn_opnn_cnts)
              setSnackbar({ open: true, message: Message.copySuccess, type: "success" });
          }
        }}
      />
      {hstrDialog.open && (
        <HistoryDialog
          prscClsfCd="L"
          open={true}
          onClose={() => setHstrDialog({ ...hstrDialog, open: false })}
          exmnInfo={hstrDialog.exmnInfo}
        />
      )}
    </div>
  );
}

export default WithWrapper(MSC_020300);
