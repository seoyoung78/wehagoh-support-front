import React, { useEffect, useRef, useState } from "react";

// util
import callApi from "services/apis";
import { initializeGrid, destroyGrid } from "services/utils/grid/RealGridUtil";

// common-ui-components
import { LUXButton, LUXSnackbar } from "luna-rocket";
import { mstColumns, mstFields } from "pages/MSC_060000/MSC_060200/MSC_060200_MstGrid";
import { dtlColumns, dtlFields } from "pages/MSC_060000/MSC_060200/MSC_060200_DtlGrid";
import Message from "components/Common/Message";
import withPortal from "hoc/withPortal";
import { setLocalStorageItem } from "services/utils/localStorage";
import { windowOpen } from "services/utils/popupUtil";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";
import SearchInfo from "components/Common/SearchInfo";
import { date } from "common-util/utils";

// scss
import "assets/style/MSC_060200.scss";

// imgs
import PatientSummaryBar from "components/Common/PatientSummaryBar";

/**
 * @name 물리치료 대장
 * @author 담당자 이름
 */
function MSC_060200() {
  /* ================================================================================== */
  /* 상수케이스 선언 */
  const MDTR_CLSF_CD = "P";

  // 날짜
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  /* 상태(state) 선언 */
  const [search, setSearch] = useState({
    date: {
      from: oneMonthAgo,
      to: today,
    },
    pid: "",
    deptList: "",
    isCompleted: false,
  });

  const initialSelected = useRef({
    pid: "",
    pt_nm: "",
    age_cd: "",
    mdtr_hope_date: "",
    rcps_nm: "",
  });

  const [selectedPatient, setSelectedPatient] = useState(initialSelected.current);
  const [checked, setChecked] = useState(true); // 그리드 체크 여부
  const [mdtrOpnn, setMdtrOpnn] = useState("");
  const [patientList, setPatientList] = useState([]);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  /* grid area */
  // 환자 목록 그리드
  const mstGrid = useRef(null); // realgrid DOM
  const mstDataProvider = useRef(null);
  const mstGridView = useRef(null);

  // 물리치료 처방 목록 그리드
  const dtlGrid = useRef(null);
  const dtlDataProvider = useRef(null);
  const dtlGridView = useRef(null);

  // 스낵바 상태
  const snackbarRef = useRef({
    message: "",
    open: false,
    type: "warning",
  });

  const [snackbar, setSnackbar] = useState({
    ...snackbarRef.current,
    onRequestOpen: (message, type) =>
      setSnackbar(prevState => ({ ...prevState, open: true, message, type: type || prevState.type })),
    onRequestClose: () => setSnackbar(prevState => ({ ...prevState, ...snackbarRef.current })),
  });

  const searchInfoRef = useRef();

  /* ================================================================================== */
  /* 함수(function) 선언 */
  // 검색 패널 변경 이벤트
  const handleChange = ({ type, value, completed }) => {
    const getKey = type => {
      switch (type) {
        case "complete":
          return "pid";
        case "date":
          return "date";
        case "select":
          return "deptList";
        default:
          return "";
      }
    };

    const key = getKey(type);
    if (key) {
      setSearch(prevState => ({
        ...prevState,
        [key]: value,
        ...(type === "complete" && { isCompleted: true }),
      }));
    }
  };

  const resetPatientAndGridState = () => {
    setSelectedPatient(initialSelected.current);
    setChecked(true);
    setMdtrOpnn("");
    dtlDataProvider.current.clearRows();
    mstGridView.current.clearCurrent();
  };

  const showNetworkErrorFeedback = errMsg => {
    errMsg && console.error(errMsg);
    snackbar.onRequestOpen(Message.networkFail);
  };

  const handleApiResponseFallback = resultCode => {
    let msg = Message.noSearch;
    let type = "info";

    if (resultCode !== 200) {
      msg = Message.networkFail;
      type = "warning";
    }

    snackbar.onRequestOpen(msg, type);
    mstDataProvider.current.clearRows();
  };

  const handleSearch = async (searchData = search) => {
    resetPatientAndGridState();

    const params = {
      from: date.getyyyymmdd(searchData.date.from),
      to: date.getyyyymmdd(searchData.date.to),
      deptList: searchData.deptList,
      pid: searchData.pid,
    };

    try {
      const { resultCode, resultData } = await callApi("/MSC_060200/selectPatientList", params);
      if (!resultData || !resultData.length) {
        handleApiResponseFallback(resultCode);
        return;
      }
      setPatientList(resultData);
      mstDataProvider.current.setRows(resultData);
    } catch (error) {
      showNetworkErrorFeedback(error);
    }
  };

  // 부서 리스트 조회된 이후 handlerSearch 함수 실행
  const handleDeptListLoaded = deptList => {
    handleSearch({ ...search, deptList });
    setSearch(prevState => ({ ...prevState, deptList }));
  };

  const getWindowFeatures = () => {
    const width = 1000; // 팝업 가로사이즈
    const height = window.screen.height - 200; // 팝업 세로사이즈
    const features = {
      width,
      height,
      left: window.screenX + window.screen.width / 2 - width / 2,
      top: window.screen.height / 2 - height / 2 - 40,
    };

    return features;
  };

  // 선택환자 대장 출력
  const handlePrintMdtr = pid => {
    const patientList = pid
      ? [pid]
      : mstGridView.current.getCheckedItems().map(index => mstGridView.current.getValue(index, "pid"));
    const key = setLocalStorageItem({ patientList });

    if (key) {
      const url = `CSMSP012`;
      const features = getWindowFeatures();
      windowOpen(url, key, features);
    } else {
      snackbar.onRequestOpen(Message.networkFail);
    }
  };

  // 환자목록 출력 버튼
  const handlePrintPatient = async () => {
    const params = {
      from: search.date.from,
      to: search.date.to,
    };
    try {
      const { resultCode, resultData, resultMsg } = await callApi("/MSC_060200/selectPrintPatientList", params);
      if (resultCode !== 200) {
        showNetworkErrorFeedback(resultMsg);
        return;
      }
      const key = setLocalStorageItem({ list: resultData, date: params });
      const url = `CSMSP011`;
      const features = getWindowFeatures();
      windowOpen(url, key, features);
    } catch (error) {
      showNetworkErrorFeedback(error);
    }
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    const mstCon = mstGrid.current;
    const dtlCon = dtlGrid.current;

    const mstOptions = {
      checkBar: {
        visible: true,
        syncHeadCheck: true,
      },
    };

    const { dataProvider: mstDp, gridView: mstGv } = initializeGrid(
      mstCon,
      mstFields,
      mstColumns,
      Message.noSearch,
      mstOptions,
    );
    const { dataProvider: dtlDp, gridView: dtlGv } = initializeGrid(dtlCon, dtlFields, dtlColumns, Message.noData);

    mstGv.onItemChecked = grid => setChecked(grid.getCheckedRows().length === 0);
    mstGv.onItemAllChecked = (grid, checked) => setChecked(!checked);

    dtlGv.onSelectionChanged = (grid, selection) => {
      const value = grid.getValue(selection.startRow, "mdtr_opnn");
      setMdtrOpnn(value);
    };

    mstDataProvider.current = mstDp;
    mstGridView.current = mstGv;
    dtlDataProvider.current = dtlDp;
    dtlGridView.current = dtlGv;

    return () => {
      destroyGrid(mstDp, mstGv);
      destroyGrid(dtlDp, dtlGv);
      mstDataProvider.current = null;
      mstGridView.current = null;
      dtlDataProvider.current = null;
      dtlGridView.current = null;
    };
  }, []);

  useEffect(() => {
    // 물리치료 처방 목록
    const handleDetail = async pid => {
      setIsFetchingDetail(true);
      try {
        const { resultCode, resultData, resultMsg } = await callApi("/MSC_060200/selectPrscList", { pid });
        if (resultCode !== 200) {
          showNetworkErrorFeedback(resultMsg);
          return;
        }
        dtlDataProvider.current.setRows(resultData);
        dtlGridView.current.setCurrent({ itemIndex: 0 });
      } catch (error) {
        showNetworkErrorFeedback(error);
      } finally {
        setIsFetchingDetail(false);
      }
    };

    mstGridView.current.onSelectionChanged = (grid, selection) => {
      const values = grid.getValues(selection.startRow);
      if (!isFetchingDetail && (!selectedPatient.pid || values.pid !== selectedPatient.pid)) {
        setSelectedPatient(values);
        handleDetail(values.pid);
      }
    };
  }, [isFetchingDetail, selectedPatient.pid]);

  useEffect(() => {
    // SmartComplete 자동완성 검색 시
    if (search.isCompleted) {
      setSearch(prevState => ({ ...prevState, isCompleted: false }));
      handleSearch();
    }
  }, [search]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="MSC_060200 dp_full">
      <div className="align_box">
        <div className={`align_top ${selectedPatient.pid ? "patient_info_wrap" : ""}`}>
          <PatientSummaryBar pageId="MSC_060200" pid={selectedPatient.pid} />
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
                    <h3 className="title">물리치료 환자 조회</h3>
                  </div>
                </div>
              </div>
              <div className="sec_content">
                <SearchInfo
                  type="result"
                  exrmClsfCd={MDTR_CLSF_CD}
                  date={search.date}
                  ref={searchInfoRef}
                  handleChange={handleChange}
                  handleSearch={handleSearch}
                  onDeptListLoaded={handleDeptListLoaded}
                />
              </div>
            </div>
            <div className="sec_wrap full_size add_footer">
              <div className="sec_content" ref={mstGrid} />
              <div className="sec_footer">
                <div className="option_box">
                  <LUXButton label="선택환자 대장 출력" onClick={() => handlePrintMdtr()} disabled={checked} />
                  <LUXButton label="환자목록 출력" onClick={handlePrintPatient} disabled={!patientList.length} />
                </div>
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
                    <h3 className="title">물리치료 처방 목록</h3>
                  </div>
                </div>
              </div>
              <div className="sec_content" ref={dtlGrid} />
            </div>

            <div className="sec_wrap half_size add_footer">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">물리치료 소견</h3>
                  </div>
                </div>
              </div>
              <div className="sec_content">
                <div className="editalbe_box" style={{ height: "100%" }}>
                  <div
                    className="editablediv is_readonly"
                    placeholder="메모를 입력하세요."
                    style={{ height: "100%", minHeight: "100%" }}
                  >
                    {mdtrOpnn}
                  </div>
                </div>
              </div>
              <div className="sec_footer">
                <div className="option_box">
                  <LUXButton
                    label="출력"
                    onClick={() => handlePrintMdtr(selectedPatient.pid)}
                    disabled={!selectedPatient.pid}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {snackbar.open
        ? withPortal(
            <LUXSnackbar
              message={snackbar.message}
              onRequestClose={snackbar.onRequestClose}
              open={snackbar.open}
              type={snackbar.type}
            />,
            "snackbar",
          )
        : null}
    </div>
  );
}

export default WithWrapper(MSC_060200);
