import React, { useCallback, useEffect, useRef, useState } from "react";

// util
import callApi from "services/apis";
import withPortal from "hoc/withPortal";
import Message from "components/Common/Message";
import { lodash } from "common-util/utils";
import { date } from "common-util";
import {
  appendOnDataLoadComplated,
  configEmptySet,
  isLastOnDataLoadComplated,
  removeOnDataLoadComplated,
} from "services/utils/grid/RealGridUtil";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";

// common-ui-components
import {
  LUXAlert,
  LUXButton,
  LUXCheckBox,
  LUXConfirm,
  LUXSelectColorPicker,
  LUXSelectField,
  LUXSnackbar,
  LUXTextArea,
  LUXTextField,
} from "luna-rocket";
import LUXSmartPicker from "luna-rocket/LUXSmartPicker";
import { GridView, LocalDataProvider } from "realgrid";
import { mstColumns, mstFields } from "./MSC_090200_Grid";

// scss
import "assets/style/MSC_090200.scss";

// imgs
import SearchIcon from "luna-rocket/LUXSVGIcon/Duzon/BlankSize/Search";

import MSC_090200_P01 from "./MSC_090200_P01";
import { ErrorLogInfo } from "cliniccommon-ui";

/**
 * @name 검체코드관리
 * @author 윤서영
 */

// 검색 조건
const searchType = [
  { value: "1", text: "검체" },
  { value: "2", text: "용기" },
];

const defaultData = {
  spcm_cd: "", // 검체코드
  spcm_labl_nm: "", // 검체라벨명
  spcm_nm: "", // 검체명
  spcm_expl: "", // 검체설명
  spcm_use_yn: "Y", // 사용여부
  spcm_ctnr_cd: "", // 용기코드
  spcm_state: "new",
  ctnr_cd: "", // 용기코드
  ctnr_labl_nm: "", // 용기라벨명
  ctnr_nm: "", // 용기명
  ctnr_colr: null, // 용기 색상
  colr_value: -1,
  ctnr_use_yn: "Y", // 사용여부
  ctnr_state: "new",
};

function MSC_090200() {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [state, setState] = useState({
    searchType: "1", //조회조건
    searchKeyword: "", // 코드검색 상태
    index: -1,
    isCtnr: false,
    ctnrKeyword: "", // 용기검색 상태
  });
  const ctnrRef = useRef(null);

  const [isUse, setIsUse] = useState(false); // 미사용 검체 제외

  const [common, setCommon] = useState({
    ctnrList: [{ value: "", text: "", use_yn: "Y", ctnr_nm: "", ctnr_colr: null }], // 용기코드 목록
    colorList: [], // 색상목록
    spcmList: [], // 검체코드 SET 목록
  });

  const [selectedSet, setSelectedSet] = useState(lodash.cloneDeep(defaultData));
  const [originSet, setOriginSet] = useState(lodash.cloneDeep(defaultData));
  const [change, setChange] = useState({
    isSpcmDisabled: true,
    isCtnrDisabled: true,
  });

  const spcm_cd_ref = useRef();
  const ctnr_cd_ref = useRef();

  // 그리드
  const gridRef = useRef(null);
  const dataProvider = useRef(null);
  const gridView = useRef(null);

  const [snack, setSnack] = useState({ open: false, message: "", type: "info" }); // 스낵바 상태
  // 컴펌창 상태
  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancle: () => {},
  });
  const [alert, setAlert] = useState({ open: false, title: "", message: "", type: "info" }); // alert창 상태

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handleFilter = useCallback(() => {
    gridView.current.activateColumnFilters("spcm_use_yn", "Y", isUse);

    const index = gridView.current.searchItem({
      fields: ["spcm_cd"],
      values: [originSet.spcm_cd],
    });

    if (lodash.isEqual(defaultData, originSet) || index < 0) {
      gridView.current.clearCurrent();
    }
  }, [isUse, originSet]);

  // 검체코드 목록 조회
  const handleSearch = async () => {
    await callApi("/MSC_090200/selectSpcmSetList", { keyword: state.searchKeyword, searchType: state.searchType }).then(
      ({ resultData }) => {
        dataProvider.current.setRows(resultData);
        setCommon(prev => ({ ...prev, spcmList: resultData }));
      },
    );
  };

  // 용기 목록 조회
  const handleList = async () => {
    await callApi("/MSC_090200/selectCtnrList").then(({ resultData }) => {
      setCommon(prev => ({ ...prev, ctnrList: resultData }));
    });
  };

  // 변경 이벤트 핸들러
  const handleChange = (value, col) => {
    setSelectedSet({ ...selectedSet, [col]: value });
  };

  // 검체 용기코드 변경
  const handleChangeCtnr = (e, value) => {
    const findCtnr = common.ctnrList.find(list => list.value === e);
    const ctnr = {
      ctnr_cd: e,
      ctnr_labl_nm: e === "" ? "" : value,
      ctnr_nm: findCtnr.ctnr_nm,
      ctnr_use_yn: findCtnr.use_yn,
      ctnr_colr: findCtnr.ctnr_colr,
      colr_value: common.colorList.findIndex(list => list.color === findCtnr.ctnr_colr),
      ctnr_state: e === "" ? "new" : "",
    };
    setSelectedSet({
      ...selectedSet,
      spcm_ctnr_cd: e,
      ...ctnr,
    });
    setOriginSet({ ...originSet, ...ctnr });
  };

  const handleCheck = type => {
    let check = false;

    // 검체코드 중복 체크
    if (
      (type === "spcm" || type === undefined) &&
      selectedSet.spcm_state === "new" &&
      !!common.spcmList.find(list => list.spcm_cd.trim().toUpperCase() === selectedSet.spcm_cd.trim().toUpperCase())
    ) {
      setAlert({
        open: true,
        title: "검체코드 중복",
        message: Message.MSC_090200_duplSpcmCd,
        type: "error",
      });
      return Message.MSC_090200_duplSpcmCd;
    }
    if (type === "ctnr" || type === undefined) {
      // 용기코드 중복 체크
      if (
        selectedSet.ctnr_state === "new" &&
        !!common.ctnrList.find(list => list.value.trim().toUpperCase() === selectedSet.ctnr_cd.trim().toUpperCase())
      ) {
        setAlert({
          open: true,
          title: "용기코드 중복",
          message: Message.MSC_090200_duplCtnrCd,
          type: "error",
        });
        return Message.MSC_090200_duplCtnrCd;
      }
      // 용기 라벨명 중복 체크
      if (
        common.ctnrList.find(
          list =>
            list.value !== selectedSet.ctnr_cd &&
            list.text.trim().toUpperCase() === selectedSet.ctnr_labl_nm.trim().toUpperCase(),
        )
      ) {
        setAlert({
          open: true,
          title: "용기 라벨명 중복",
          message: Message.MSC_090200_duplCtnrLabl,
          type: "error",
        });
        return Message.MSC_090200_duplCtnrLabl;
      }
      // 용기 사용여부 체크
      if (
        selectedSet.ctnr_use_yn === "N" &&
        !!common.spcmList.find(list => list.ctnr_cd.trim().toUpperCase() === selectedSet.ctnr_cd.trim().toUpperCase())
      ) {
        setAlert({
          open: true,
          title: "용기 사용중",
          message: Message.MSC_090200_useCtnr,
          type: "error",
        });
        return Message.MSC_090200_useCtnr;
      }
    }
    return check;
  };

  // 저장
  const handleSave = async type => {
    const check = handleCheck(type);

    let resCode = 200;
    let resMsg = null;
    if (!check) {
      if (type === "spcm") {
        await callApi("/MSC_090200/saveSpcmSet", selectedSet).then(({ resultCode, resultMsg }) => {
          resCode = resultCode;
          resMsg = resultMsg;
          if (resultCode === 200) {
            setOriginSet(selectedSet);
            setSnack({ open: true, message: Message.save, type: "success" });
            handleSearch();
          } else {
            setSnack({ open: true, message: resultMsg, type: "error" });
          }
        });
      } else if (type === "ctnr") {
        await callApi("/MSC_090200/saveCtnr", selectedSet).then(({ resultCode, resultMsg }) => {
          resCode = resultCode;
          resMsg = resultMsg;
          if (resultCode === 200) {
            setSnack({ open: true, message: Message.save, type: "success" });
            const changeSet = { ...selectedSet, ctnr_state: "" };
            setSelectedSet(changeSet);
            setOriginSet(changeSet);
            handleList();
            handleSearch();
          } else {
            setSnack({ open: true, message: resultMsg, type: "error" });
          }
        });
      } else {
        let apiList = [];
        if (!change.isSpcmDisabled) {
          apiList.push(callApi("/MSC_090200/saveSpcmSet", selectedSet));
        }
        if (!change.isCtnrDisabled) {
          apiList.push(callApi("/MSC_090200/saveCtnr", selectedSet));
        }
        Promise.all(apiList)
          .then(result => {
            result.map(res => {
              if (res.resultCode !== 200) {
                resCode = res.resultCode;
                resMsg = res.resultMsg;
              }
            });
          })
          .finally(() => {
            if (resMsg) {
              setSnack({ open: true, message: resMsg, type: "error" });
            } else if (resCode === 200) {
              handleList();
              handleSearch();
              setSnack({ open: true, message: Message.save, type: "success" });
            }
          });
      }
    } else {
      resCode = 401;
      resCode = check;
    }
    return { resultCode: resCode, resultMsg: resMsg };
  };

  const handleSaveCheck = type =>
    setConfirm({
      open: true,
      title: "설정 저장",
      message: Message.saveConfirm,
      onConfirm: () => handleSave(type),
      onCancle: () => {},
    });

  // 변경사항 컨펌창
  const handleCompare = (set, type) => {
    setConfirm({
      open: true,
      title: "설정 미저장",
      message: Message.changeConfirm,
      onConfirm: () => {
        if (type !== undefined) {
          handleSave(type).then(res => {
            if (res.resultCode === 200) {
              setSelectedSet(set);
            }
            if (type === "spcm") {
              handleSearch();
            } else if (type === "ctnr") {
              handleList();
            }
          });
        } else {
          handleSave().then(res => {
            if (res.resultCode === 200) {
              setOriginSet(set);
              setSelectedSet(set);
              handleSearch();
              handleList();
            }
          });
        }
      },
      onCancle: () => {
        setOriginSet(set);
        setSelectedSet(set);
      },
    });
  };

  // 신규 버튼
  const handleNew = async type => {
    let set = { ...selectedSet };
    if (type === "spcm") {
      set = {
        ...set,
        spcm_cd: "",
        spcm_labl_nm: "",
        spcm_nm: "",
        spcm_expl: "",
        spcm_use_yn: "Y",
        spcm_ctnr_cd: "",
        spcm_state: "new",
      };
    } else if (type === "ctnr") {
      set = {
        ...set,
        ctnr_cd: "",
        ctnr_labl_nm: "",
        ctnr_nm: "",
        ctnr_use_yn: "Y",
        ctnr_colr: null,
        colr_value: -1,
        ctnr_state: "new",
      };
    }

    if ((!change.isSpcmDisabled && type === "spcm") || (!change.isCtnrDisabled && type === "ctnr")) {
      handleCompare(set, type);
    } else {
      await setSelectedSet(set);
      if (type === "spcm") {
        spcm_cd_ref.current.focus();
      } else if (type === "ctnr") {
        ctnr_cd_ref.current.focus();
      }
    }
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    Promise.all([
      callApi("/MSC_090200/selectCtnrList"),
      callApi("/common/selectCommonCode", {
        clsfList: ["CS4003"],
        date: date.getyyyymmdd(new Date()),
      }),
      callApi("/MSC_090200/selectSpcmSetList", { keyword: state.searchKeyword, searchType: state.searchType }),
    ])
      .then(result => {
        setCommon({
          ctnrList: result[0].resultData,
          colorList: result[1].resultData.map(list => ({ color: list.cmcd_char_valu1 })),
          spcmList: result[2].resultData,
        });
        dataProvider.current.setRows(result[2].resultData);
      })
      .catch(() => ErrorLogInfo());

    const container = gridRef.current;
    const dataSource = new LocalDataProvider(true);
    const gv = new GridView(container);

    gv.setDataSource(dataSource);
    dataSource.setFields(mstFields);
    gv.setColumns(mstColumns);

    gv.setEditOptions({ movable: false, readOnly: true, deletable: false, editable: false });
    gv.setDisplayOptions({
      fitStyle: "evenFill",
      columnMovable: false,
      selectionStyle: "singleRow",
    });
    gv.setFilteringOptions({ enabled: false });
    gv.rowIndicator.visible = false;
    gv.checkBar.visible = false; // 체크박스 X
    gv.footer.visible = false; // 푸터 X
    gv.stateBar.visible = false; // 상태바 X
    gv.sortingOptions.enabled = true; // 정렬 o
    gv.sortingOptions.keepFocusedRow = true; // 정렬 시 current 그대로 유지
    gv.pasteOptions.enabled = false;
    gv.setCopyOptions({ copyDisplayText: true, singleMode: true });

    configEmptySet(gv, container, Message.noData);

    gv.setColumnFilters("spcm_use_yn", [{ name: "Y", criteria: "value = 'Y'" }]);

    dataProvider.current = dataSource;
    gridView.current = gv;

    return () => {
      dataSource.clearRows();
      gv.destroy();
      dataSource.destroy();

      gridView.current = null;
      dataProvider.current = null;
    };
  }, []);

  useEffect(() => {
    handleFilter();
  }, [isUse]);

  useEffect(() => {
    if (!isLastOnDataLoadComplated(gridView.current)) {
      removeOnDataLoadComplated(gridView.current);
    }
    appendOnDataLoadComplated(gridView.current, () => handleFilter());
  }, [handleFilter]);

  useEffect(() => {
    if (!lodash.isEqual(selectedSet, originSet)) {
      let spcm = false;
      let ctnr = false;

      if (
        (selectedSet.spcm_state === "new" &&
          (selectedSet.spcm_cd === "" ||
            selectedSet.spcm_labl_nm === "" ||
            selectedSet.spcm_nm === "" ||
            selectedSet.spcm_ctnr_cd === "")) ||
        (selectedSet.spcm_state === "" &&
          selectedSet.spcm_labl_nm === originSet.spcm_labl_nm &&
          selectedSet.spcm_nm === originSet.spcm_nm &&
          selectedSet.spcm_expl === originSet.spcm_expl &&
          selectedSet.spcm_ctnr_cd === originSet.spcm_ctnr_cd &&
          selectedSet.spcm_use_yn === originSet.spcm_use_yn)
      ) {
        spcm = true;
      }

      if (
        (selectedSet.ctnr_state === "new" &&
          (selectedSet.ctnr_cd === "" || selectedSet.ctnr_labl_nm === "" || selectedSet.ctnr_nm === "")) ||
        (selectedSet.ctnr_state === "" &&
          selectedSet.ctnr_labl_nm === originSet.ctnr_labl_nm &&
          selectedSet.ctnr_nm === originSet.ctnr_nm &&
          selectedSet.ctnr_colr === originSet.ctnr_colr &&
          selectedSet.ctnr_use_yn === originSet.ctnr_use_yn)
      ) {
        ctnr = true;
      }
      setChange({ isSpcmDisabled: spcm, isCtnrDisabled: ctnr });
    }

    return () => setChange({ isSpcmDisabled: true, isCtnrDisabled: true });
  }, [selectedSet, originSet]);

  useEffect(() => {
    gridView.current.onCurrentChanging = (grid, oldIndex, newIndex) => {
      if (newIndex.itemIndex !== -1) {
        const values = grid.getValues(newIndex.itemIndex);
        const set = {
          ...defaultData,
          ...values,
          spcm_ctnr_cd: values.ctnr_cd,
          spcm_state: "",
          ctnr_state: values.ctnr_cd === "" ? "new" : "",
          colr_value: common.colorList.findIndex(list => list.color === values.ctnr_colr),
        };
        if (change.isSpcmDisabled && change.isCtnrDisabled) {
          setState(prev => ({ ...prev, index: -1 }));
          setOriginSet(set);
          setSelectedSet(set);
        } else {
          setState(prev => ({ ...prev, index: newIndex.itemIndex }));
          handleCompare(set);
          return false;
        }
      }
    };

    if (change.isCtnrDisabled && change.isSpcmDisabled && state.index !== -1) {
      gridView.current.setCurrent({ itemIndex: state.index });
    }
  }, [common.colorList, change.isSpcmDisabled, change.isCtnrDisabled]);

  useEffect(() => {
    if (selectedSet.ctnr_cd !== "") {
      const findCtnr = common.ctnrList.find(list => list.value === selectedSet.ctnr_cd);
      setSelectedSet({ ...selectedSet, ctnr_use_yn: findCtnr.use_yn });
      setOriginSet({ ...originSet, ctnr_use_yn: findCtnr.use_yn });
    }
  }, [common.ctnrList]);

  // LUXSmartPicker 설정
  useEffect(() => {
    if (ctnrRef.current.state.isPopoverOpen) {
      ctnrRef.current.search();
    }

    ctnrRef.current.handleCancel = () => {
      if (state.ctnrKeyword !== "") {
        setState({ ...state, ctnrKeyword: "" });
      }
      ctnrRef.current.clearPopOver();
    };
  }, [state.ctnrKeyword]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="MSC_090200 dp_full">
      <div className="align_box">
        <div className="align_top">
          <div className="left_box">
            <h2 className="menu_title">검체코드관리</h2>
          </div>
        </div>
        <div className="align_split">
          <div className="align_left">
            <div className="sec_wrap">
              <div className="sec_content">
                <div className="search_list">
                  <div className="item">
                    <dt>코드 검색</dt>
                    <dd>
                      <LUXSelectField
                        checkObjectList
                        selectFieldData={searchType}
                        defaultData={state.searchType}
                        handleChoiceData={e => setState({ ...state, searchType: e })}
                        listAutoHeight
                        style={{ width: "120px" }}
                      />
                    </dd>
                  </div>
                  <div className="item">
                    <LUXTextField
                      hintText={
                        state.searchType === "1"
                          ? "검체코드, 검체명, 검체 라벨명으로 검색하세요."
                          : "용기코드, 용기명, 용기 라벨명으로 검색하세요"
                      }
                      onChange={(e, value) => setState({ ...state, searchKeyword: value })}
                      onKeyDown={e => {
                        if (e.keyCode === 13) {
                          handleSearch();
                        }
                      }}
                    />
                  </div>
                  <div className="item summit">
                    <LUXButton
                      type="icon"
                      icon={
                        <SearchIcon
                          style={{
                            width: "18px",
                            height: "18px",
                          }}
                        />
                      }
                      onClick={handleSearch}
                      className="LUX_basic_btn Image basic"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="sec_wrap full_size ">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <h3 className="title">검체코드 SET</h3>
                  </div>
                </div>
                <div className="right_box">
                  <LUXCheckBox
                    labelText="미사용 검체 제외"
                    checked={isUse}
                    onCheck={(e, checked) => setIsUse(checked)}
                  />
                </div>
              </div>
              <div className="sec_content" ref={gridRef} />
            </div>
          </div>
          <div className="align_right">
            <div className="sec_wrap">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <h3 className="title">검체 설정</h3>
                  </div>
                </div>
                <div className="right_box">
                  <LUXButton label="신규" onClick={() => handleNew("spcm")} type="small" />
                  <LUXButton
                    label="저장"
                    onClick={() => handleSaveCheck("spcm")}
                    disabled={change.isSpcmDisabled}
                    blue={!change.isSpcmDisabled}
                    type="small"
                  />
                </div>
              </div>
              <div className="sec_content">
                <div className="LUX_basic_tbl">
                  <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                    <colgroup>
                      <col width="90px" />
                      <col />
                    </colgroup>
                    <tbody>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          검체코드 <span className="sp_lux red_bullet" />
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <LUXTextField
                              defaultValue={selectedSet.spcm_cd}
                              onChange={(e, value) => handleChange(value, "spcm_cd")}
                              hintText="검체코드를 입력하세요"
                              disabled={selectedSet.spcm_state === ""}
                              fullWidth
                              ref={el => {
                                spcm_cd_ref.current = el;
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          검체라벨명 <span className="sp_lux red_bullet" />
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <LUXTextField
                              defaultValue={selectedSet.spcm_labl_nm}
                              onChange={(e, value) => handleChange(value, "spcm_labl_nm")}
                              hintText="검체라벨명을 입력하세요"
                              fullWidth
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          검체명 <span className="sp_lux red_bullet" />
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <LUXTextField
                              defaultValue={selectedSet.spcm_nm}
                              onChange={(e, value) => handleChange(value, "spcm_nm")}
                              hintText="검체 한글명을 입력하세요"
                              fullWidth
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          검체설명
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <LUXTextArea
                              defaultValue={!selectedSet.spcm_expl ? "" : selectedSet.spcm_expl}
                              onChange={(e, value) => handleChange(value, "spcm_expl")}
                              hintText="검체설명을 입력하세요"
                              fullWidth
                              resize={false}
                              style={{ height: "60px" }}
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          사용여부
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <span className="LUX_basic_switch LUX_renewal">
                              <span className="LUXonoffbx">
                                <input
                                  type="checkbox"
                                  id="spcm_use_yn"
                                  checked={selectedSet.spcm_use_yn === "Y"}
                                  onChange={({ target }) => handleChange(target.checked ? "Y" : "N", "spcm_use_yn")}
                                />
                                <span className="sp_lux" />
                                <label for="spcm_use_yn" />
                              </span>
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          용기 <span className="sp_lux red_bullet" />
                        </th>
                        <td className="cellft">
                          <div className="inbx type_flex">
                            <div className="editBox">
                              <LUXSmartPicker
                                ref={e => {
                                  ctnrRef.current = e;
                                }}
                                dataInfo={[
                                  { name: "text", width: 100, isKey: true },
                                  { name: "value", width: 0 },
                                ]}
                                value={
                                  common.ctnrList.find(list => list.value === selectedSet.spcm_ctnr_cd)?.text || ""
                                }
                                onChange={(e, data) => {
                                  if (Array.isArray(data) && data.length > 0) {
                                    handleChangeCtnr(data[0].value, data[0].text);
                                  } else {
                                    setState({ ...state, ctnrKeyword: "" });
                                  }
                                }}
                                onSearch={() =>
                                  new Promise(resolve => {
                                    const list = common.ctnrList
                                      .filter(
                                        list =>
                                          list.use_yn === "Y" &&
                                          list.text.toLocaleLowerCase().includes(state.ctnrKeyword.toLocaleLowerCase()),
                                      )
                                      .sort((a, b) => a.text.localeCompare(b.text)); // 용기라벨명(ctnr_labl_nm) 으로 정렬
                                    resolve(list);
                                  })
                                }
                                onSearchFieldChange={(e, keyword) => setState({ ...state, ctnrKeyword: keyword })}
                                onRequestClose={() => setState({ ...state, ctnrKeyword: "" })}
                                hintText="선택하세요"
                                maxSelectCount={1}
                                useSearchField
                                type="basic"
                                displayType="normal"
                                popoverTitleElement={<div>1개 선택가능</div>}
                                minPopOverWidth={300}
                                style={{ width: "210px" }}
                              />
                              <button
                                type="button"
                                className="LUX_basic_btn Image basic"
                                onClick={() => ctnrRef.current.handleTouchTap()}
                              >
                                <svg viewBox="0 0 24 24" className="ico_svg">
                                  <path d="M21.767,20.571l-4.625-4.625c2.988-3.647,2.453-9.025-1.194-12.013S6.921,1.48,3.933,5.127 C0.945,8.774,1.48,14.152,5.127,17.14c3.146,2.577,7.674,2.577,10.82,0l4.624,4.623c0.335,0.323,0.869,0.314,1.192-0.021 c0.316-0.327,0.316-0.845,0-1.171L21.767,20.571z M10.638,17.386c-3.725,0-6.745-3.019-6.745-6.744s3.02-6.744,6.745-6.744 s6.745,3.019,6.745,6.744c0,3.723-3.017,6.741-6.74,6.744H10.638z M14.015,11.487h-2.529v2.529c0,0.466-0.377,0.843-0.843,0.843 c-0.466,0-0.843-0.377-0.843-0.843v-2.529H7.271c-0.466,0-0.843-0.377-0.843-0.843s0.377-0.843,0.843-0.843H9.8V7.272 c0-0.466,0.377-0.843,0.843-0.843c0.466,0,0.843,0.377,0.843,0.843v2.529h2.529c0.466,0,0.843,0.377,0.843,0.843 S14.481,11.487,14.015,11.487z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="sec_wrap">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <h3 className="title">용기 설정</h3>
                  </div>
                </div>
                <div className="right_box">
                  <LUXButton label="목록" onClick={() => setState({ ...state, isCtnr: true })} type="small" />
                  <LUXButton label="신규" onClick={() => handleNew("ctnr")} type="small" />
                  <LUXButton
                    label="저장"
                    onClick={() => handleSaveCheck("ctnr")}
                    disabled={change.isCtnrDisabled}
                    blue={!change.isCtnrDisabled}
                    type="small"
                  />
                </div>
              </div>
              <div className="sec_content">
                <div className="LUX_basic_tbl">
                  <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                    <colgroup>
                      <col width="90px" />
                      <col />
                    </colgroup>
                    <tbody>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          용기코드 <span className="sp_lux red_bullet" />
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <LUXTextField
                              defaultValue={selectedSet.ctnr_cd}
                              onChange={(e, value) => handleChange(value, "ctnr_cd")}
                              hintText="용기코드를 입력하세요"
                              disabled={selectedSet.ctnr_state === ""}
                              fullWidth
                              ref={el => {
                                ctnr_cd_ref.current = el;
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          용기라벨명 <span className="sp_lux red_bullet" />
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <LUXTextField
                              defaultValue={selectedSet.ctnr_labl_nm ? selectedSet.ctnr_labl_nm : ""}
                              onChange={(e, value) => handleChange(value, "ctnr_labl_nm")}
                              hintText="용기라벨명을 입력하세요"
                              fullWidth
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          용기명 <span className="sp_lux red_bullet" />
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <LUXTextField
                              defaultValue={selectedSet.ctnr_nm ? selectedSet.ctnr_nm : ""}
                              onChange={(e, value) => handleChange(value, "ctnr_nm")}
                              hintText="용기 약어명을 입력하세요"
                              fullWidth
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          용기 색상
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <LUXSelectColorPicker
                              uniqueId="MSC_090200_colorPicker"
                              colorList={common.colorList}
                              value={selectedSet.colr_value}
                              onChange={(e, value, color) =>
                                setSelectedSet({ ...selectedSet, colr_value: value, ctnr_colr: color })
                              }
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          사용여부
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <span className="LUX_basic_switch LUX_renewal">
                              <span className="LUXonoffbx">
                                <input
                                  type="checkbox"
                                  id="ctnr_use_yn"
                                  checked={selectedSet.ctnr_use_yn === "Y"}
                                  onChange={({ target }) => handleChange(target.checked ? "Y" : "N", "ctnr_use_yn")}
                                />
                                <span className="sp_lux" />
                                <label for="ctnr_use_yn" />
                              </span>
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="sec_wrap">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <h3 className="title">검체코드 설정값</h3>
                  </div>
                </div>
              </div>
              <div className="sec_content">
                <div className="LUX_basic_tbl">
                  <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                    <colgroup>
                      <col width="90px" />
                      <col />
                    </colgroup>
                    <tbody>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          검체코드
                        </th>
                        <td className="cellft">
                          <div className="inbx">{originSet.spcm_cd}</div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          검체 라벨명
                        </th>
                        <td className="cellft">
                          <div className="inbx">{originSet.spcm_labl_nm}</div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          검체명
                        </th>
                        <td className="cellft">
                          <div className="inbx">{originSet.spcm_nm}</div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          검체설명
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <div className="editalbe_box">
                              <div
                                contenteditable="false"
                                className="editablediv is_readonly"
                                style={{ height: "60px" }}
                              >
                                {!originSet.spcm_expl ? "" : originSet.spcm_expl}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          용기코드
                        </th>
                        <td className="cellft">
                          <div className="inbx">{originSet.ctnr_cd}</div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          용기라벨명
                        </th>
                        <td className="cellft">
                          <div className="inbx">{originSet.ctnr_labl_nm}</div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          용기명
                        </th>
                        <td className="cellft">
                          <div className="inbx">{originSet.ctnr_nm}</div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          용기색상
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <div className="color_box" style={{ background: originSet.ctnr_colr }} />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 용기목록 팝업 */}
      <MSC_090200_P01
        open={state.isCtnr}
        data={common.ctnrList.filter(list => list.value !== "")}
        onClose={() => setState({ ...state, isCtnr: false })}
        onSave={() => {
          setState({ ...state, isCtnr: false });
          handleList();
        }}
        spcmList={common.spcmList}
      />

      {withPortal(
        <LUXSnackbar
          open={snack.open}
          message={snack.message}
          type={snack.type}
          onRequestClose={() => setSnack({ ...snack, open: false })}
        />,
        "snackbar",
      )}
      {withPortal(
        <LUXConfirm
          open={confirm.open}
          title={confirm.title}
          message={confirm.message}
          useIcon
          useIconType={confirm.type}
          confirmButton={() => {
            confirm.onConfirm();
            setConfirm({ ...confirm, open: false });
          }}
          cancelButton={() => {
            confirm.onCancle();
            setConfirm({ ...confirm, open: false });
          }}
          onClose={() => {
            setConfirm({ ...confirm, open: false });
          }}
        />,
        "dialog",
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

export default WithWrapper(MSC_090200);
